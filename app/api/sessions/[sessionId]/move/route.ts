import { NextResponse } from "next/server";

import { GameError, movePlayer } from "@/lib/services/game";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * POST /api/sessions/[sessionId]/move
 * Body: { playerId: string, position: number, advanceTurn?: boolean }
 *
 * Menggeser pion ke posisi tertentu, opsional langsung mengganti giliran.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
  }

  const { playerId, position, advanceTurn } = (body ?? {}) as {
    playerId?: unknown;
    position?: unknown;
    advanceTurn?: unknown;
  };

  if (typeof playerId !== "string" || !playerId) {
    return NextResponse.json({ error: "playerId wajib diisi" }, { status: 400 });
  }
  if (!Number.isInteger(Number(position))) {
    return NextResponse.json({ error: "position wajib berupa angka bulat" }, { status: 400 });
  }

  try {
    const state = await movePlayer({
      sessionId,
      playerId,
      position: Number(position),
      advanceTurn: advanceTurn === true,
    });
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof GameError) {
      const status =
        error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_STATE" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error("Gagal memperbarui posisi pion:", error);
    return NextResponse.json({ error: "Gagal memperbarui posisi pion" }, { status: 500 });
  }
}
