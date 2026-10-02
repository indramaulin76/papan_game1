import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { gameSessions, questions, sessionQuestions } from "@/lib/db/schema";

export type QuestionType = "multiple_choice" | "essay" | "oral";

export type TileQuestion = {
  id: string;
  category: string | null;
  type: QuestionType;
  prompt: string;
  /** Pilihan jawaban (sudah di-parse); null untuk esai/lisan. */
  options: string[] | null;
  /** Kunci jawaban untuk guru; null bila tidak diisi. */
  answer: string | null;
};

/** Ubah kolom `options` (JSON string) menjadi array, aman bila rusak. */
function parseOptions(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : null;
  } catch {
    return null;
  }
}

/**
 * Ambil semua soal yang dipasang pada satu petak di sesi tertentu.
 * Mengembalikan `null` kalau sesinya tidak ada, dan array kosong kalau
 * petak itu memang belum diberi soal.
 */
export async function getQuestionsForTile(
  sessionId: string,
  tile: number,
): Promise<TileQuestion[] | null> {
  const [session] = await db
    .select({ id: gameSessions.id })
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const rows = await db
    .select({
      id: questions.id,
      category: questions.category,
      type: questions.type,
      prompt: questions.prompt,
      options: questions.options,
      answer: questions.answer,
    })
    .from(sessionQuestions)
    .innerJoin(questions, eq(questions.id, sessionQuestions.questionId))
    .where(
      and(eq(sessionQuestions.sessionId, sessionId), eq(sessionQuestions.tile, tile)),
    );

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    type: row.type,
    prompt: row.prompt,
    options: parseOptions(row.options),
    answer: row.answer,
  }));
}
