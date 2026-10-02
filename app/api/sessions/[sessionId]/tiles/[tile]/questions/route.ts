import { NextResponse } from "next/server";

import { getBoardConfig } from "@/lib/services/board";
import { getQuestionsForTile } from "@/lib/services/questions";

type RouteParams = { params: Promise<{ sessionId: string; tile: string }> };

/**
 * GET /api/sessions/[sessionId]/tiles/[tile]/questions
 * Daftar soal yang dipasang pada satu petak papan.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { sessionId, tile: tileParam } = await params;

  const tile = Number(tileParam);
  if (!Number.isInteger(tile) || tile < 1) {
    return NextResponse.json({ error: "Nomor petak tidak valid" }, { status: 400 });
  }

  try {
    const board = await getBoardConfig(sessionId);
    if (!board) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }
    if (tile > board.boardSize) {
      return NextResponse.json(
        { error: `Petak hanya sampai ${board.boardSize}` },
        { status: 400 },
      );
    }

    const items = await getQuestionsForTile(sessionId, tile);
    if (items === null) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ sessionId, tile, questions: items });
  } catch (error) {
    console.error("Gagal mengambil soal per petak:", error);
    return NextResponse.json({ error: "Gagal mengambil soal per petak" }, { status: 500 });
  }
}
