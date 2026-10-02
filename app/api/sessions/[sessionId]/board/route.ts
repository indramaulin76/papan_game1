import { NextResponse } from "next/server";

import { GameError } from "@/lib/services/game";
import { getBoardConfig, updateBoardConfig } from "@/lib/services/board";

type RouteParams = { params: Promise<{ sessionId: string }> };

/**
 * GET /api/sessions/[sessionId]/board
 * Mengembalikan konfigurasi papan (ukuran + ular & tangga) untuk sesi tsb.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  try {
    const config = await getBoardConfig(sessionId);

    if (!config) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Gagal mengambil konfigurasi papan:", error);
    return NextResponse.json({ error: "Gagal mengambil konfigurasi papan" }, { status: 500 });
  }
}

/**
 * PATCH /api/sessions/[sessionId]/board
 * Body: { boardSize?: number, ladders?: Record<number,number>, snakes?: Record<number,number> }
 *
 * Mengatur kotak finis dan/atau sebaran ular & tangga (hanya field yang dikirim).
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON yang valid" }, { status: 400 });
  }

  const { boardSize, ladders, snakes } = (body ?? {}) as {
    boardSize?: unknown;
    ladders?: unknown;
    snakes?: unknown;
  };

  if (boardSize !== undefined && !Number.isInteger(Number(boardSize))) {
    return NextResponse.json({ error: "boardSize wajib angka bulat" }, { status: 400 });
  }
  if (ladders !== undefined && (typeof ladders !== "object" || ladders === null)) {
    return NextResponse.json({ error: "ladders wajib objek" }, { status: 400 });
  }
  if (snakes !== undefined && (typeof snakes !== "object" || snakes === null)) {
    return NextResponse.json({ error: "snakes wajib objek" }, { status: 400 });
  }

  try {
    const config = await updateBoardConfig({
      sessionId,
      boardSize: boardSize === undefined ? undefined : Number(boardSize),
      ladders: ladders as Record<number, number> | undefined,
      snakes: snakes as Record<number, number> | undefined,
    });
    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof GameError) {
      const status =
        error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_STATE" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error("Gagal memperbarui konfigurasi papan:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui konfigurasi papan" },
      { status: 500 },
    );
  }
}
