/**
 * Konfigurasi papan yang aman dipakai di sisi klien (tanpa akses database).
 * Menjadi satu sumber untuk penomoran petak, rintangan bawaan, dan warna pion,
 * dipakai oleh halaman pengaturan maupun papan permainan.
 */

export const PLAYER_COLORS = ["coral", "blue", "green", "purple", "orange", "pink"];

/** Nama warna pion dalam Bahasa Indonesia, untuk label daftar pemain. */
export const COLOR_LABEL = {
  coral: "Koral",
  blue: "Biru",
  green: "Hijau",
  purple: "Ungu",
  orange: "Oranye",
  pink: "Pink",
};

/** Rintangan bawaan papan belajar: tangga (naik) dan ular (turun). */
export const DEFAULT_LADDERS = { 3: 18, 8: 22, 18: 26, 24: 38, 34: 45, 40: 53, 51: 61, 56: 63 };
export const DEFAULT_SNAKES = { 15: 6, 27: 16, 31: 12, 42: 30, 46: 25, 54: 36, 58: 40, 62: 48 };

/**
 * Susun petak papan dengan penomoran zig-zag dari kiri-bawah sampai kotak finis.
 * Mengembalikan daftar `cells` (null untuk slot kosong) beserta jumlah kolom/baris.
 */
export function buildBoard(size) {
  const cols = Math.ceil(Math.sqrt(size));
  const rows = Math.ceil(size / cols);
  const cells = [];
  for (let rowTop = 0; rowTop < rows; rowTop += 1) {
    const rowFromBottom = rows - 1 - rowTop;
    for (let col = 0; col < cols; col += 1) {
      const indexInRow = rowFromBottom % 2 === 0 ? col : cols - 1 - col;
      const number = rowFromBottom * cols + indexInRow + 1;
      cells.push(number <= size ? number : null);
    }
  }
  return { cells, cols, rows };
}

/** Ambil hanya tangga/ular yang muat di dalam ukuran papan terpilih. */
export function filterLinks(links, size) {
  return Object.fromEntries(
    Object.entries(links).filter(([from, to]) => Number(from) < size && Number(to) <= size),
  );
}
