import { NextResponse } from "next/server";

import { GameError, rollDice } from "@/lib/services/game";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * POST /api/sessions/[sessionId]/roll
 * Body opsional: { playerId?: string }
 *
 * Mengocok dadu acak 1-6 untuk pemain yang sedang giliran (atau `playerId`
 * yang dikirim), memvalidasi giliran, lalu menggeser pionnya.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let playerId: string | undefined;

  // Body boleh kosong: server memakai giliran aktif.
  const raw = await request.text();
  if (raw.trim()) {
    try {
      const body = JSON.parse(raw) as { playerId?: unknown };
      if (body?.playerId !== undefined) {
        if (typeof body.playerId !== "string" || !body.playerId) {
          return NextResponse.json({ error: "playerId tidak valid" }, { status: 400 });
        }
        playerId = body.playerId;
      }
    } catch {
      return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
    }
  }

  try {
    const result = await rollDice(sessionId, playerId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GameError) {
      const status =
        error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_STATE" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error("Gagal mengocok dadu:", error);
    return NextResponse.json({ error: "Gagal mengocok dadu" }, { status: 500 });
  }
}
