import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardLinks, gameSessions, players, turns } from "@/lib/db/schema";

export type RollInput = {
  sessionId: string;
  playerId: string;
  diceValue: number;
};

export type RollResult = {
  sessionId: string;
  playerId: string;
  diceValue: number;
  fromPosition: number;
  toPosition: number;
  /** `landed` = petak pendaratan sebelum efek, `ladder`/`snake` bila kena rintangan. */
  landedPosition: number;
  via: "plain" | "ladder" | "snake";
  nextPlayerId: string | null;
  winnerPlayerId: string | null;
  status: "setup" | "playing" | "finished";
};

export type GameState = {
  sessionId: string;
  boardSize: number;
  status: "setup" | "playing" | "finished";
  /** Pemain yang sedang giliran (null bila belum mulai / sudah selesai). */
  currentPlayerId: string | null;
  /** Hasil dadu terakhir pada sesi ini (null bila belum ada lemparan). */
  lastRoll: {
    playerId: string;
    diceValue: number;
    fromPosition: number;
    toPosition: number;
  } | null;
  winner: { id: string; name: string; color: string } | null;
  players: Array<{
    id: string;
    name: string;
    color: string;
    position: number;
    score: number;
    turnOrder: number;
  }>;
};

export class GameError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "BAD_INPUT" | "INVALID_STATE",
  ) {
    super(message);
  }
}

/** Angka dadu yang diizinkan. */
export const DICE_MIN = 1;
export const DICE_MAX = 6;

/**
 * Terapkan satu lemparan dadu: geser pion pemain, terapkan efek ular/tangga,
 * catat riwayat giliran, lalu tentukan giliran berikutnya & pemenang.
 *
 * Semua perubahan ditulis dalam satu transaksi agar posisi pion dan
 * riwayat lemparan tidak pernah berbeda.
 */
export async function applyRoll(input: RollInput): Promise<RollResult> {
  const { sessionId, playerId, diceValue } = input;

  if (!Number.isInteger(diceValue) || diceValue < DICE_MIN || diceValue > DICE_MAX) {
    throw new GameError(`Angka dadu harus ${DICE_MIN}-${DICE_MAX}`, "BAD_INPUT");
  }

  return db.transaction((tx) => {
    const session = tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1)
      .all()[0];

    if (!session) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
    if (session.status === "finished") {
      throw new GameError("Permainan sudah selesai", "INVALID_STATE");
    }

    const roster = tx
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .orderBy(asc(players.turnOrder))
      .all();

    const actor = roster.find((player) => player.id === playerId);
    if (!actor) throw new GameError("Pemain tidak ada di sesi ini", "NOT_FOUND");

    // Validasi giliran: hanya pemain yang sedang giliran boleh mengocok.
    if (session.currentPlayerId && session.currentPlayerId !== playerId) {
      throw new GameError("Bukan giliran pemain ini", "INVALID_STATE");
    }

    const links = tx
      .select({ type: boardLinks.type, fromTile: boardLinks.fromTile, toTile: boardLinks.toTile })
      .from(boardLinks)
      .where(eq(boardLinks.sessionId, sessionId))
      .all();

    const fromPosition = actor.position;
    // Pion tidak boleh melewati kotak finis.
    const landedPosition = Math.min(session.boardSize, fromPosition + diceValue);
    const link = links.find((item) => item.fromTile === landedPosition);
    const toPosition = link ? Math.min(session.boardSize, link.toTile) : landedPosition;
    const via: RollResult["via"] = link ? link.type : "plain";

    tx.insert(turns)
      .values({ sessionId, playerId, diceValue, fromPosition, toPosition })
      .run();

    tx.update(players).set({ position: toPosition }).where(eq(players.id, playerId)).run();

    const hasWon = toPosition >= session.boardSize;
    const currentIndex = roster.findIndex((player) => player.id === playerId);
    const nextPlayerId = hasWon
      ? null
      : (roster[(currentIndex + 1) % roster.length]?.id ?? null);
    const status: RollResult["status"] = hasWon ? "finished" : "playing";

    // Status, pemenang, dan giliran aktif selalu disimpan dalam satu update.
    tx.update(gameSessions)
      .set({
        status,
        currentPlayerId: nextPlayerId,
        winnerPlayerId: hasWon ? playerId : session.winnerPlayerId,
      })
      .where(eq(gameSessions.id, sessionId))
      .run();

    return {
      sessionId,
      playerId,
      diceValue,
      fromPosition,
      toPosition,
      landedPosition,
      via,
      nextPlayerId,
      winnerPlayerId: hasWon ? playerId : null,
      status,
    };
  });
}

/**
 * Hasil satu dadu adil 1-6.
 */
export function rollDie(): number {
  return Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN;
}

/**
 * Kocok dadu acak 1-6 untuk pemain yang sedang giliran, lalu terapkan
 * perpindahan pionnya. Kalau `playerId` tidak dikirim, dipakai giliran aktif.
 */
export async function rollDice(sessionId: string, playerId?: string): Promise<RollResult> {
  let target = playerId;

  if (!target) {
    const state = await getGameState(sessionId);
    if (!state) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
    if (state.status === "finished") {
      throw new GameError("Permainan sudah selesai", "INVALID_STATE");
    }
    target = state.currentPlayerId ?? state.players[0]?.id;
    if (!target) throw new GameError("Belum ada pemain di sesi ini", "INVALID_STATE");
  }

  return applyRoll({ sessionId, playerId: target, diceValue: rollDie() });
}

/**
 * Geser pion ke posisi tertentu tanpa dadu (mis. koreksi/geser manual guru),
 * dengan opsi langsung mengganti giliran. Mengembalikan state permainan terbaru.
 */
export type MoveInput = {
  sessionId: string;
  playerId: string;
  position: number;
  /** Bila true, giliran berpindah ke pemain berikutnya. */
  advanceTurn?: boolean;
};

export async function movePlayer(input: MoveInput): Promise<GameState> {
  const { sessionId, playerId, position, advanceTurn = false } = input;

  db.transaction((tx) => {
    const session = tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1)
      .all()[0];

    if (!session) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
    if (session.status === "finished") {
      throw new GameError("Permainan sudah selesai", "INVALID_STATE");
    }
    if (!Number.isInteger(position) || position < 1 || position > session.boardSize) {
      throw new GameError(`Posisi harus 1-${session.boardSize}`, "BAD_INPUT");
    }

    const roster = tx
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .orderBy(asc(players.turnOrder))
      .all();

    const actor = roster.find((player) => player.id === playerId);
    if (!actor) throw new GameError("Pemain tidak ada di sesi ini", "NOT_FOUND");

    tx.update(players).set({ position }).where(eq(players.id, playerId)).run();

    const hasWon = position >= session.boardSize;

    if (hasWon) {
      tx.update(gameSessions)
        .set({ status: "finished", winnerPlayerId: playerId, currentPlayerId: null })
        .where(eq(gameSessions.id, sessionId))
        .run();
      return;
    }

    if (advanceTurn) {
      const currentIndex = roster.findIndex((player) => player.id === playerId);
      const nextPlayerId = roster[(currentIndex + 1) % roster.length]?.id ?? null;
      tx.update(gameSessions)
        .set({ currentPlayerId: nextPlayerId })
        .where(eq(gameSessions.id, sessionId))
        .run();
    }
  });

  const state = await getGameState(sessionId);
  if (!state) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
  return state;
}

/**
 * Sesuaikan skor seorang pemain lalu (opsional) ganti giliran.
 * Dipakai setelah soal dijawab untuk menutup giliran.
 */
export type ScoreTurnInput = {
  sessionId: string;
  playerId: string;
  /** Penambahan/pengurangan skor (boleh negatif). Default 0. */
  scoreDelta?: number;
  /** Default true: giliran pindah ke pemain berikutnya. */
  advanceTurn?: boolean;
};

export async function updateScoreAndTurn(input: ScoreTurnInput): Promise<GameState> {
  const { sessionId, playerId, scoreDelta = 0, advanceTurn = true } = input;

  if (!Number.isInteger(scoreDelta)) {
    throw new GameError("scoreDelta harus berupa angka bulat", "BAD_INPUT");
  }

  db.transaction((tx) => {
    const session = tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1)
      .all()[0];

    if (!session) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
    if (session.status === "finished") {
      throw new GameError("Permainan sudah selesai", "INVALID_STATE");
    }

    const roster = tx
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .orderBy(asc(players.turnOrder))
      .all();

    const actor = roster.find((player) => player.id === playerId);
    if (!actor) throw new GameError("Pemain tidak ada di sesi ini", "NOT_FOUND");

    const newScore = Math.max(0, actor.score + scoreDelta);
    tx.update(players).set({ score: newScore }).where(eq(players.id, playerId)).run();

    if (advanceTurn) {
      const currentIndex = roster.findIndex((player) => player.id === playerId);
      const nextPlayerId = roster[(currentIndex + 1) % roster.length]?.id ?? null;
      tx.update(gameSessions)
        .set({ currentPlayerId: nextPlayerId })
        .where(eq(gameSessions.id, sessionId))
        .run();
    }
  });

  const state = await getGameState(sessionId);
  if (!state) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
  return state;
}

/**
 * Ambil status permainan terkini: papan, seluruh pion, dan pemenangnya.
 * Mengembalikan `null` kalau sesinya tidak ada.
 */
export async function getGameState(sessionId: string): Promise<GameState | null> {
  const session = db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1)
    .all()[0];

  if (!session) return null;

  const roster = db
    .select()
    .from(players)
    .where(eq(players.sessionId, sessionId))
    .orderBy(asc(players.turnOrder))
    .all();

  const winnerPlayer = session.winnerPlayerId
    ? (roster.find((player) => player.id === session.winnerPlayerId) ?? null)
    : null;

  const lastRoll = db
    .select({
      playerId: turns.playerId,
      diceValue: turns.diceValue,
      fromPosition: turns.fromPosition,
      toPosition: turns.toPosition,
    })
    .from(turns)
    .where(eq(turns.sessionId, sessionId))
    .orderBy(desc(turns.createdAt), desc(sql`rowid`))
    .limit(1)
    .all()[0];

  return {
    sessionId: session.id,
    boardSize: session.boardSize,
    status: session.status,
    currentPlayerId: session.currentPlayerId,
    lastRoll: lastRoll ?? null,
    winner: winnerPlayer
      ? { id: winnerPlayer.id, name: winnerPlayer.name, color: winnerPlayer.color }
      : null,
    players: roster.map((player) => ({
      id: player.id,
      name: player.name,
      color: player.color,
      position: player.position,
      score: player.score,
      turnOrder: player.turnOrder,
    })),
  };
}
