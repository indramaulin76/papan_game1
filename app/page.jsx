"use client";

import { useState } from "react";
import AturPermainan from "../components/AturPermainan";
import MainBarengKelas from "../components/MainBarengKelas";
import { PLAYER_COLORS } from "../lib/boardConfig";
import { DEFAULT_TILE_QUESTIONS } from "../lib/questionBank";

/** Buat daftar pemain dari nama & warna yang diisi di halaman pengaturan. */
function buildPlayers(names, colors) {
  return names.map((name, index) => ({
    name: name.trim() || `Pemain ${index + 1}`,
    color: colors?.[index] ?? PLAYER_COLORS[index % PLAYER_COLORS.length],
    position: 1,
    score: 0,
  }));
}

/**
 * Halaman utama aplikasi. Mula-mula menampilkan halaman "Atur Permainan",
 * lalu menyerahkan konfigurasi ke papan "Main Bareng Kelas" lewat tombol
 * mulai. Tombol "Atur Permainan" di papan mengembalikan ke pengaturan tanpa
 * kehilangan pilihan sebelumnya.
 */
export default function Home() {
  const [showSetup, setShowSetup] = useState(true);
  const [boardSize, setBoardSize] = useState(64);
  const [tileQuestions, setTileQuestions] = useState(DEFAULT_TILE_QUESTIONS);
  const [players, setPlayers] = useState([]);

  function startGame({ names, colors, boardSize: size, tileQuestions: config }) {
    const sanitized = Object.fromEntries(
      Object.entries(config ?? DEFAULT_TILE_QUESTIONS).filter(([tileKey]) => Number(tileKey) <= size),
    );
    setPlayers(buildPlayers(names, colors));
    setBoardSize(size);
    setTileQuestions(sanitized);
    setShowSetup(false);
  }

  if (showSetup) {
    return <AturPermainan onStart={startGame} initialBoardSize={boardSize} initialTileQuestions={tileQuestions} initialPlayers={players} />;
  }

  return (
    <MainBarengKelas
      players={players}
      setPlayers={setPlayers}
      boardSize={boardSize}
      tileQuestions={tileQuestions}
      onExit={() => setShowSetup(true)}
    />
  );
}
