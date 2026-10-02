/**
 * Bank soal untuk penempelan soal per kotak papan (sisi klien).
 * Dipakai sebagai stub frontend: nanti backend menyediakan bank soal
 * sungguhan lewat API, tetapi bentuk datanya sama.
 *
 * type: "multiple_choice" | "essay" | "oral"
 */

export const QUESTION_BANK = [
  // Umum — kelas 4-5 SD
  { id: "umum-1", subject: "Matematika", type: "multiple_choice", text: "Berapa hasil dari 6 × 7?", choices: ["36", "42", "48", "56"], correct: 1 },
  { id: "umum-2", subject: "IPA", type: "multiple_choice", text: "Planet apa yang paling dekat dengan Matahari?", choices: ["Venus", "Bumi", "Merkurius", "Mars"], correct: 2 },
  { id: "umum-3", subject: "Bahasa Indonesia", type: "multiple_choice", text: "Apa lawan kata dari 'rajin'?", choices: ["Tekun", "Malas", "Cermat", "Pintar"], correct: 1 },
  { id: "umum-4", subject: "Matematika", type: "essay", text: "Tuliskan hasil dari 15 + 27!" },
  { id: "umum-5", subject: "Bahasa Indonesia", type: "essay", text: "Buatlah kalimat sederhana menggunakan kata 'belajar'!" },
  { id: "umum-6", subject: "Matematika", type: "multiple_choice", text: "Berapa hasil dari 144 ÷ 12?", choices: ["10", "11", "12", "14"], correct: 2 },
  { id: "umum-7", subject: "IPA", type: "multiple_choice", text: "Apa nama proses perubahan air menjadi uap air?", choices: ["Kondensasi", "Evaporasi", "Presipitasi", "Sublimasi"], correct: 1 },
  { id: "umum-8", subject: "Bahasa Indonesia", type: "multiple_choice", text: "Apa sinonim dari kata 'gembira'?", choices: ["Sedih", "Senang", "Marah", "Takut"], correct: 1 },
  { id: "umum-9", subject: "Matematika", type: "multiple_choice", text: "Berapa luas persegi dengan sisi 9 cm?", choices: ["18 cm²", "36 cm²", "72 cm²", "81 cm²"], correct: 3 },
  { id: "umum-10", subject: "IPA", type: "multiple_choice", text: "Hewan apa yang termasuk mamalia?", choices: ["Ikan hiu", "Paus", "Hiu paus", "Lumba-lumba"], correct: 1 },
  { id: "umum-11", subject: "Bahasa Indonesia", type: "multiple_choice", text: "Apa lawan kata dari 'malas'?", choices: ["Rajin", "Lesu", "Capek", "Ngantuk"], correct: 0 },
  { id: "umum-12", subject: "Matematika", type: "multiple_choice", text: "Berapa hasil dari 3/4 + 1/2?", choices: ["1", "5/4", "4/6", "3/8"], correct: 1 },

  // Tajwid — hukum mim mati & nun mati/tanwin
  { id: "tajwid-1", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan nun mati atau tanwin jika bertemu huruf 'alif'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 0 },
  { id: "tajwid-2", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan mim mati jika bertemu huruf 'mim'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 1 },
  { id: "tajwid-3", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan nun mati atau tanwin jika bertemu huruf 'nun'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 1 },
  { id: "tajwid-4", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan mim mati jika bertemu huruf 'ba'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 2 },
  { id: "tajwid-5", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan nun mati atau tanwin jika bertemu huruf 'ha'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 3 },
  { id: "tajwid-6", subject: "Tajwid", type: "multiple_choice", text: "Apa hukum bacaan mim mati jika bertemu huruf 'waw'?", choices: ["Idhar", "Idgham", "Iqlab", "Ikhfa"], correct: 1 },
  { id: "tajwid-7", subject: "Tajwid", type: "essay", text: "Jelaskan perbedaan antara idhar dan idgham!" },
  { id: "tajwid-8", subject: "Tajwid", type: "oral", text: "Jawablah dengan suara: Sebutkan huruf-huruf hukum bacaan nun mati!" },

  // Nabi-nabi
  { id: "nabi-1", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang pertama kali diciptakan Allah?", choices: ["Nabi Ibrahim", "Nabi Adam", "Nabi Nuh", "Nabi Musa"], correct: 1 },
  { id: "nabi-2", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang membangun bahtera besar?", choices: ["Nabi Nuh", "Nabi Ibrahim", "Nabi Musa", "Nabi Isa"], correct: 0 },
  { id: "nabi-3", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang ditelan oleh ikan besar?", choices: ["Nabi Yunus", "Nabi Ayub", "Nabi Yusuf", "Nabi Zakaria"], correct: 0 },
  { id: "nabi-4", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang bisa berbicara dengan hewan?", choices: ["Nabi Sulaiman", "Nabi Daud", "Nabi Ilyas", "Nabi Hud"], correct: 0 },
  { id: "nabi-5", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang menerima Taurat?", choices: ["Nabi Musa", "Nabi Isa", "Nabi Muhammad", "Nabi Ibrahim"], correct: 0 },
  { id: "nabi-6", subject: "Agama", type: "multiple_choice", text: "Siapa nabi yang terakhir?", choices: ["Nabi Isa", "Nabi Muhammad", "Nabi Musa", "Nabi Ibrahim"], correct: 1 },
  { id: "nabi-7", subject: "Agama", type: "essay", text: "Sebutkan nama-nabi yang termasuk ulul azmi!" },
  { id: "nabi-8", subject: "Agama", type: "oral", text: "Jawablah dengan suara: Sebutkan 5 nama nabi yang kamu ketahui!" },
];

/** Label singkat jenis soal untuk tampilan. */
export const QUESTION_TYPE_LABEL = {
  multiple_choice: "Pilihan Ganda",
  essay: "Esai",
  oral: "Lisan",
};

/** Peta bawaan kotak papan -> id soal, dipakai sebagai konfigurasi awal. */
export const DEFAULT_TILE_QUESTIONS = {
  12: "umum-1",
  29: "umum-2",
  47: "umum-3",
  8: "umum-4",
  35: "umum-5",
  5: "umum-6",
  18: "umum-7",
  24: "umum-8",
  33: "umum-9",
  41: "umum-10",
  52: "umum-11",
  60: "umum-12",
  3: "tajwid-1",
  14: "tajwid-2",
  22: "tajwid-3",
  38: "tajwid-4",
  45: "tajwid-5",
  55: "tajwid-6",
  44: "tajwid-7",
  50: "tajwid-8",
  7: "nabi-1",
  16: "nabi-2",
  26: "nabi-3",
  37: "nabi-4",
  49: "nabi-5",
  58: "nabi-6",
  11: "nabi-7",
  20: "nabi-8",
};

/** Kunci localStorage untuk menyimpan soal buatan guru. */
export const CUSTOM_QUESTIONS_KEY = "ulertangga.customQuestions";

/** Bentuk minimal soal yang valid agar tidak merusak tampilan. */
export function isValidQuestion(item) {
  return Boolean(
    item &&
      typeof item.id === "string" &&
      typeof item.subject === "string" &&
      typeof item.text === "string" &&
      item.text.trim().length > 0 &&
      ["multiple_choice", "essay", "oral"].includes(item.type) &&
      (item.type !== "multiple_choice" ||
        (Array.isArray(item.choices) && item.choices.length >= 2)),
  );
}

/** Ambil soal buatan guru dari localStorage; aman dipanggil saat SSR. */
export function loadCustomQuestions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidQuestion) : [];
  } catch {
    return [];
  }
}

/** Simpan soal buatan guru ke localStorage. */
export function saveCustomQuestions(questions) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(questions));
  } catch {
    // Penyimpanan penuh/diblokir: abaikan, soal tetap hidup di memori sesi ini.
  }
}

/**
 * Pilih satu soal untuk sebuah kotak secara acak.
 * - Utamakan soal khusus (`pinnedId`) selama belum pernah keluar di kotak itu.
 * - Hindari soal yang sudah keluar di kotak yang sama sampai bank habis.
 * - Bila semua soal sudah terpakai di kotak itu, riwayatnya direset dan diulang.
 * `usedMap` dimutasi sebagai pelacak: { [nomorKotak]: Set(idSoal) }.
 */
export function pickQuestionForTile({ pool, tileNumber, pinnedId, usedMap }) {
  const questions = Array.isArray(pool) ? pool : [];
  if (questions.length === 0) return null;

  let used = usedMap[tileNumber];
  if (!used) {
    used = new Set();
    usedMap[tileNumber] = used;
  }

  let candidates = questions.filter((item) => !used.has(item.id));
  if (candidates.length === 0) {
    used.clear();
    candidates = questions;
  }

  let picked = null;
  if (pinnedId && !used.has(pinnedId)) {
    picked = questions.find((item) => item.id === pinnedId) ?? null;
  }
  if (!picked) {
    picked = candidates[Math.floor(Math.random() * candidates.length)];
  }

  used.add(picked.id);
  return picked;
}
