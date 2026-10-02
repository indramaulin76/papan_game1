import { NextResponse } from "next/server";

import { GameError, updateScoreAndTurn } from "@/lib/services/game";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * POST /api/sessions/[sessionId]/turn
 * Body: { playerId, scoreDelta?: number, advanceTurn?: boolean }
 *
 * Menyesuaikan skor pemain lalu (opsional) mengganti giliran.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
  }

  const { playerId, scoreDelta, advanceTurn } = (body ?? {}) as {
    playerId?: unknown;
    scoreDelta?: unknown;
    advanceTurn?: unknown;
  };

  if (typeof playerId !== "string" || !playerId) {
    return NextResponse.json({ error: "playerId wajib diisi" }, { status: 400 });
  }
  if (scoreDelta !== undefined && !Number.isInteger(Number(scoreDelta))) {
    return NextResponse.json({ error: "scoreDelta wajib angka bulat" }, { status: 400 });
  }
  if (advanceTurn !== undefined && typeof advanceTurn !== "boolean") {
    return NextResponse.json({ error: "advanceTurn wajib boolean" }, { status: 400 });
  }

  try {
    const state = await updateScoreAndTurn({
      sessionId,
      playerId,
      scoreDelta: scoreDelta === undefined ? 0 : Number(scoreDelta),
      advanceTurn: advanceTurn === undefined ? true : advanceTurn,
    });
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof GameError) {
      const status =
        error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_STATE" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error("Gagal memperbarui skor dan giliran:", error);
    return NextResponse.json({ error: "Gagal memperbarui skor dan giliran" }, { status: 500 });
  }
}
