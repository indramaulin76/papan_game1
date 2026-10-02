import { NextResponse } from "next/server";

import { GameError } from "@/lib/services/game";
import { submitAnswer } from "@/lib/services/answers";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * POST /api/sessions/[sessionId]/answers
 * Body: { playerId, questionId, response?, isCorrect? }
 *
 * Menyimpan jawaban pemain, menilai (PG otomatis / esai-lisan oleh guru),
 * lalu menambah skor pemain.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
  }

  const { playerId, questionId, response, isCorrect } = (body ?? {}) as {
    playerId?: unknown;
    questionId?: unknown;
    response?: unknown;
    isCorrect?: unknown;
  };

  if (typeof playerId !== "string" || !playerId) {
    return NextResponse.json({ error: "playerId wajib diisi" }, { status: 400 });
  }
  if (typeof questionId !== "string" || !questionId) {
    return NextResponse.json({ error: "questionId wajib diisi" }, { status: 400 });
  }
  if (isCorrect !== undefined && typeof isCorrect !== "boolean") {
    return NextResponse.json({ error: "isCorrect wajib boolean" }, { status: 400 });
  }
  if (response !== undefined && response !== null && typeof response !== "string") {
    return NextResponse.json({ error: "response wajib teks" }, { status: 400 });
  }

  try {
    const result = await submitAnswer({
      sessionId,
      playerId,
      questionId,
      response: typeof response === "string" ? response : null,
      isCorrect: typeof isCorrect === "boolean" ? isCorrect : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GameError) {
      const status =
        error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_STATE" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error("Gagal menyimpan jawaban:", error);
    return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 });
  }
}
