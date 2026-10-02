import { NextResponse } from "next/server";

import { applyRoll, GameError } from "@/lib/services/game";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * POST /api/sessions/[sessionId]/turns
 * Body: { playerId: string, diceValue: number }
 *
 * Menggeser pion pemain sesuai dadu, menerapkan efek ular/tangga,
 * mencatat riwayat giliran, lalu mengembalikan giliran berikutnya.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
  }

  const { playerId, diceValue } = (body ?? {}) as {
    playerId?: unknown;
    diceValue?: unknown;
  };

  if (typeof playerId !== "string" || !playerId) {
    return NextResponse.json({ error: "playerId wajib diisi" }, { status: 400 });
  }

  const dice = Number(diceValue);
  if (!Number.isInteger(dice)) {
    return NextResponse.json({ error: "diceValue wajib berupa angka bulat" }, { status: 400 });
  }

  try {
    const result = await applyRoll({ sessionId, playerId, diceValue: dice });
    return NextResponse.json(result);
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
