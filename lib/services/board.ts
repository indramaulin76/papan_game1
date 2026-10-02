import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardLinks, gameSessions, players } from "@/lib/db/schema";
import { GameError } from "@/lib/services/game";

export const MIN_BOARD_SIZE = 2;
export const MAX_BOARD_SIZE = 200;

export type BoardConfig = {
  sessionId: string;
  boardSize: number;
  status: "setup" | "playing" | "finished";
  /** Petak tangga: kunci = kotak asal, nilai = kotak tujuan (naik). */
  ladders: Record<number, number>;
  /** Petak ular: kunci = kotak asal, nilai = kotak tujuan (turun). */
  snakes: Record<number, number>;
};

/**
 * Ambil konfigurasi papan (ukuran + sebaran ular & tangga) milik satu sesi.
 * Mengembalikan `null` kalau sesinya tidak ada.
 */
export async function getBoardConfig(sessionId: string): Promise<BoardConfig | null> {
  const [session] = await db
    .select({
      id: gameSessions.id,
      boardSize: gameSessions.boardSize,
      status: gameSessions.status,
    })
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const links = await db
    .select({
      type: boardLinks.type,
      fromTile: boardLinks.fromTile,
      toTile: boardLinks.toTile,
    })
    .from(boardLinks)
    .where(eq(boardLinks.sessionId, sessionId));

  const ladders: Record<number, number> = {};
  const snakes: Record<number, number> = {};

  for (const link of links) {
    if (link.type === "ladder") ladders[link.fromTile] = link.toTile;
    else snakes[link.fromTile] = link.toTile;
  }

  return {
    sessionId: session.id,
    boardSize: session.boardSize,
    status: session.status,
    ladders,
    snakes,
  };
}

/** Cek cepat apakah sesi ada tanpa menarik seluruh konfigurasi. */
export async function sessionExists(sessionId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: gameSessions.id })
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);

  return Boolean(row);
}

export type BoardConfigInput = {
  sessionId: string;
  /** Kotak finis. Bila tidak dikirim, ukuran lama dipertahankan. */
  boardSize?: number;
  /** Bila dikirim, seluruh tangga diganti dengan peta ini. */
  ladders?: Record<number, number>;
  /** Bila dikirim, seluruh ular diganti dengan peta ini. */
  snakes?: Record<number, number>;
};

type ParsedLink = { type: "ladder" | "snake"; fromTile: number; toTile: number };

function parseLinks(
  type: ParsedLink["type"],
  map: Record<number, number>,
  boardSize: number,
  seen: Set<number>,
): ParsedLink[] {
  const result: ParsedLink[] = [];

  for (const [fromKey, toValue] of Object.entries(map)) {
    const fromTile = Number(fromKey);
    const toTile = Number(toValue);

    if (
      !Number.isInteger(fromTile) ||
      !Number.isInteger(toTile) ||
      fromTile < 1 ||
      toTile < 1 ||
      fromTile > boardSize ||
      toTile > boardSize
    ) {
      throw new GameError(`Rintangan harus di dalam papan 1-${boardSize}`, "BAD_INPUT");
    }
    if (type === "ladder" && toTile <= fromTile) {
      throw new GameError(`Tangga dari petak ${fromTile} harus naik`, "BAD_INPUT");
    }
    if (type === "snake" && toTile >= fromTile) {
      throw new GameError(`Ular dari petak ${fromTile} harus turun`, "BAD_INPUT");
    }
    if (seen.has(fromTile)) {
      throw new GameError(`Petak ${fromTile} dipakai lebih dari satu rintangan`, "BAD_INPUT");
    }

    seen.add(fromTile);
    result.push({ type, fromTile, toTile });
  }

  return result;
}

/**
 * Atur ulang konfigurasi papan satu sesi: kotak finis dan/atau sebaran
 * ular & tangga. Posisi pion yang melewati kotak finis baru akan dirapikan.
 */
export async function updateBoardConfig(input: BoardConfigInput): Promise<BoardConfig> {
  const { sessionId } = input;

  const existing = await getBoardConfig(sessionId);
  if (!existing) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
  if (existing.status === "finished") {
    throw new GameError("Permainan sudah selesai", "INVALID_STATE");
  }

  const boardSize = input.boardSize ?? existing.boardSize;
  if (
    !Number.isInteger(boardSize) ||
    boardSize < MIN_BOARD_SIZE ||
    boardSize > MAX_BOARD_SIZE
  ) {
    throw new GameError(
      `Ukuran papan harus ${MIN_BOARD_SIZE}-${MAX_BOARD_SIZE}`,
      "BAD_INPUT",
    );
  }

  const seen = new Set<number>();
  const links = [
    ...parseLinks("ladder", input.ladders ?? existing.ladders, boardSize, seen),
    ...parseLinks("snake", input.snakes ?? existing.snakes, boardSize, seen),
  ];

  db.transaction((tx) => {
    tx.update(gameSessions)
      .set({ boardSize })
      .where(eq(gameSessions.id, sessionId))
      .run();

    tx.delete(boardLinks).where(eq(boardLinks.sessionId, sessionId)).run();

    for (const link of links) {
      tx.insert(boardLinks)
        .values({
          sessionId,
          type: link.type,
          fromTile: link.fromTile,
          toTile: link.toTile,
        })
        .run();
    }

    // Pion tidak boleh berada di luar papan setelah ukuran berubah.
    tx.update(players)
      .set({ position: boardSize })
      .where(and(eq(players.sessionId, sessionId), gt(players.position, boardSize)))
      .run();
  });

  const updated = await getBoardConfig(sessionId);
  if (!updated) throw new GameError("Sesi tidak ditemukan", "NOT_FOUND");
  return updated;
}
