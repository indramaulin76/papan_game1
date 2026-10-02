import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  answers,
  gameSessions,
  players,
  questions,
  sessionQuestions,
} from "@/lib/db/schema";
import { GameError } from "@/lib/services/game";

/** Poin untuk satu jawaban benar. */
export const SCORE_CORRECT = 10;

export type AnswerType = "multiple_choice" | "essay" | "oral";

export type SubmitAnswerInput = {
  sessionId: string;
  playerId: string;
  questionId: string;
  /** Jawaban pemain (pilihan untuk PG, teks untuk esai, catatan untuk lisan). */
  response?: string | null;
  /** Wajib untuk soal esai/lisan: benar atau salah menurut guru. */
  isCorrect?: boolean;
};

export type SubmitAnswerResult = {
  id: string;
  sessionId: string;
  playerId: string;
  questionId: string;
  tile: number;
  type: AnswerType;
  isCorrect: boolean;
  score: number;
  /** Kunci jawaban, untuk ditampilkan guru. */
  correctAnswer: string | null;
  /** Total skor pemain setelah jawaban ini. */
  playerScore: number;
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Simpan jawaban satu pemain untuk satu soal, hitung nilainya, lalu
 * tambahkan ke skor pemain. Pilihan ganda dinilai otomatis dari kunci;
 * esai/lisan memakai penilaian guru (`isCorrect`).
 */
export async function submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  const { sessionId, playerId, questionId } = input;
  const response = input.response ?? null;

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

    const question = tx
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1)
      .all()[0];

    if (!question) throw new GameError("Soal tidak ditemukan", "NOT_FOUND");

    const placement = tx
      .select({ tile: sessionQuestions.tile })
      .from(sessionQuestions)
      .where(
        and(
          eq(sessionQuestions.sessionId, sessionId),
          eq(sessionQuestions.questionId, questionId),
        ),
      )
      .limit(1)
      .all()[0];

    if (!placement) {
      throw new GameError("Soal tidak terpasang di sesi ini", "NOT_FOUND");
    }

    const actor = tx
      .select()
      .from(players)
      .where(and(eq(players.sessionId, sessionId), eq(players.id, playerId)))
      .limit(1)
      .all()[0];

    if (!actor) throw new GameError("Pemain tidak ada di sesi ini", "NOT_FOUND");

    const hasKey = question.answer !== null && question.answer.trim() !== "";

    let isCorrect: boolean;
    if (question.type === "multiple_choice" && hasKey) {
      // Pilihan ganda dengan kunci: nilai otomatis di server.
      isCorrect = normalize(response) === normalize(question.answer);
    } else if (typeof input.isCorrect === "boolean") {
      // Esai/lisan, atau PG tanpa kunci: guru yang menentukan.
      isCorrect = input.isCorrect;
    } else if (question.type === "multiple_choice") {
      throw new GameError(
        "Soal pilihan ganda ini belum punya kunci; kirim isCorrect dari guru",
        "BAD_INPUT",
      );
    } else {
      throw new GameError(
        "Penilaian guru (isCorrect) wajib untuk soal esai/lisan",
        "BAD_INPUT",
      );
    }

    const score = isCorrect ? SCORE_CORRECT : 0;
    const answerId = crypto.randomUUID();

    tx.insert(answers)
      .values({
        id: answerId,
        sessionId,
        playerId,
        questionId,
        tile: placement.tile,
        response,
        isCorrect,
        score,
      })
      .run();

    const playerScore = actor.score + score;
    tx.update(players).set({ score: playerScore }).where(eq(players.id, playerId)).run();

    return {
      id: answerId,
      sessionId,
      playerId,
      questionId,
      tile: placement.tile,
      type: question.type,
      isCorrect,
      score,
      correctAnswer: question.answer,
      playerScore,
    };
  });
}
