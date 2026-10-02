import { NextResponse } from "next/server";

import { getGameState } from "@/lib/services/game";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * GET /api/sessions/[sessionId]/status
 * Status pemenang & posisi seluruh pion pada sesi tsb.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  try {
    const state = await getGameState(sessionId);

    if (!state) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error("Gagal mengambil status permainan:", error);
    return NextResponse.json({ error: "Gagal mengambil status permainan" }, { status: 500 });
  }
}
