/**
 * Seed bank soal contoh untuk Ular Tangga Belajar.
 *
 * Jalankan dengan: npm run db:seed
 * Idempoten: ID tetap + UPSERT, jadi aman dijalankan berulang kali dan
 * tidak menghapus penempatan soal di sesi (session_questions).
 */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";

const url = process.env.DATABASE_URL ?? "./data/game.db";
mkdirSync(dirname(url), { recursive: true });

const db = new Database(url);
db.pragma("foreign_keys = ON");

/** Akun guru demo pemilik bank soal. */
const DEMO_USER = {
  id: "seed-guru",
  name: "Guru Demo",
  email: "guru@demo.local",
  passwordHash: "seed-account-hash",
};

/**
 * @typedef {{
 *   id: string;
 *   category: "Umum" | "Tajwid" | "Nabi";
 *   type: "multiple_choice" | "essay" | "oral";
 *   prompt: string;
 *   options?: string[];
 *   answer?: string;
 * }} SeedQuestion
 */

/** @type {SeedQuestion[]} */
const QUESTIONS = [
  // ───────────────────────── Umum (kelas 4-5 SD) ─────────────────────────
  {
    id: "seed-q-umum-01",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Hasil dari 125 + 275 adalah …",
    options: ["300", "390", "400", "410"],
    answer: "400",
  },
  {
    id: "seed-q-umum-02",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Bilangan berikut yang merupakan kelipatan 6 adalah …",
    options: ["14", "21", "24", "35"],
    answer: "24",
  },
  {
    id: "seed-q-umum-03",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Sudut yang besarnya tepat 90° disebut sudut …",
    options: ["lancip", "tumpul", "siku-siku", "lurus"],
    answer: "siku-siku",
  },
  {
    id: "seed-q-umum-04",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Lambang bilangan Romawi untuk 14 adalah …",
    options: ["XIV", "XVI", "IX", "IVX"],
    answer: "XIV",
  },
  {
    id: "seed-q-umum-05",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Kata baku dari “praktek” adalah …",
    options: ["praktik", "praktek", "praktiek", "prakteik"],
    answer: "praktik",
  },
  {
    id: "seed-q-umum-06",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Planet yang paling dekat dengan Matahari adalah …",
    options: ["Venus", "Merkurius", "Bumi", "Mars"],
    answer: "Merkurius",
  },
  {
    id: "seed-q-umum-07",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Gaya yang menyebabkan benda jatuh ke bawah adalah gaya …",
    options: ["magnet", "gravitasi", "gesek", "pegas"],
    answer: "gravitasi",
  },
  {
    id: "seed-q-umum-08",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Alat pencernaan yang menyerap sari-sari makanan adalah …",
    options: ["lambung", "usus halus", "kerongkongan", "usus besar"],
    answer: "usus halus",
  },
  {
    id: "seed-q-umum-09",
    category: "Umum",
    type: "multiple_choice",
    prompt: "Ibu kota Provinsi Jawa Barat adalah …",
    options: ["Semarang", "Bandung", "Surabaya", "Serang"],
    answer: "Bandung",
  },
  {
    id: "seed-q-umum-10",
    category: "Umum",
    type: "essay",
    prompt: "Jelaskan secara singkat proses terjadinya hujan.",
    answer: "Air menguap, membentuk awan, lalu turun kembali sebagai hujan.",
  },
  {
    id: "seed-q-umum-11",
    category: "Umum",
    type: "essay",
    prompt: "Sebutkan tiga contoh sumber daya alam yang dapat diperbarui.",
    answer: "Contoh: air, tumbuhan, hewan, sinar matahari, angin.",
  },
  {
    id: "seed-q-umum-12",
    category: "Umum",
    type: "oral",
    prompt: "Sebutkan sila-sila Pancasila secara berurutan.",
    answer: "Kelima sila Pancasila dari pertama sampai kelima.",
  },

  // ───────────────────────── Tajwid ─────────────────────────
  {
    id: "seed-q-tajwid-01",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Hukum bacaan mim mati bertemu huruf ba ( ب ) adalah …",
    options: ["Idgham bighunnah", "Ikhfa syafawi", "Idgham mimi", "Izhar syafawi"],
    answer: "Ikhfa syafawi",
  },
  {
    id: "seed-q-tajwid-02",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Hukum bacaan mim mati bertemu huruf mim ( م ) adalah …",
    options: ["Idgham mimi", "Izhar syafawi", "Ikhfa syafawi", "Iqlab"],
    answer: "Idgham mimi",
  },
  {
    id: "seed-q-tajwid-03",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Mim mati bertemu selain huruf ba dan mim dibaca …",
    options: ["Izhar syafawi", "Ikhfa syafawi", "Idgham mimi", "Iqlab"],
    answer: "Izhar syafawi",
  },
  {
    id: "seed-q-tajwid-04",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Nun mati atau tanwin bertemu huruf ba ( ب ) hukumnya …",
    options: ["Iqlab", "Idgham", "Ikhfa", "Izhar"],
    answer: "Iqlab",
  },
  {
    id: "seed-q-tajwid-05",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Nun mati atau tanwin bertemu huruf ي ن م و dibaca …",
    options: ["Idgham bighunnah", "Idgham bilaghunnah", "Ikhfa haqiqi", "Izhar halqi"],
    answer: "Idgham bighunnah",
  },
  {
    id: "seed-q-tajwid-06",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Nun mati atau tanwin bertemu huruf ل atau ر dibaca …",
    options: ["Idgham bilaghunnah", "Idgham bighunnah", "Iqlab", "Izhar"],
    answer: "Idgham bilaghunnah",
  },
  {
    id: "seed-q-tajwid-07",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Nun mati atau tanwin bertemu huruf halqi ( ء ه ع ح غ خ ) dibaca …",
    options: ["Izhar halqi", "Ikhfa haqiqi", "Iqlab", "Idgham"],
    answer: "Izhar halqi",
  },
  {
    id: "seed-q-tajwid-08",
    category: "Tajwid",
    type: "multiple_choice",
    prompt: "Nun mati atau tanwin bertemu salah satu dari 15 huruf ikhfa dibaca …",
    options: ["Ikhfa haqiqi", "Izhar halqi", "Idgham bighunnah", "Iqlab"],
    answer: "Ikhfa haqiqi",
  },
  {
    id: "seed-q-tajwid-09",
    category: "Tajwid",
    type: "essay",
    prompt: "Sebutkan huruf-huruf idgham bighunnah pada hukum nun mati/tanwin.",
    answer: "ي ن م و",
  },
  {
    id: "seed-q-tajwid-10",
    category: "Tajwid",
    type: "essay",
    prompt: "Apa perbedaan izhar syafawi dan ikhfa syafawi?",
    answer:
      "Izhar syafawi: mim mati bertemu selain ba dan mim, dibaca jelas. Ikhfa syafawi: mim mati bertemu ba, dibaca samar.",
  },

  // ───────────────────────── Nabi-nabi ─────────────────────────
  {
    id: "seed-q-nabi-01",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi yang membangun kapal besar untuk menyelamatkan kaumnya dari banjir adalah …",
    options: ["Nabi Musa", "Nabi Nuh", "Nabi Ibrahim", "Nabi Yunus"],
    answer: "Nabi Nuh",
  },
  {
    id: "seed-q-nabi-02",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi yang pernah ditelan ikan besar adalah …",
    options: ["Nabi Yusuf", "Nabi Yunus", "Nabi Ayub", "Nabi Ishak"],
    answer: "Nabi Yunus",
  },
  {
    id: "seed-q-nabi-03",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi yang menerima kitab Zabur adalah …",
    options: ["Nabi Musa", "Nabi Daud", "Nabi Isa", "Nabi Ibrahim"],
    answer: "Nabi Daud",
  },
  {
    id: "seed-q-nabi-04",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi yang membelah laut dengan tongkatnya adalah …",
    options: ["Nabi Musa", "Nabi Harun", "Nabi Ilyas", "Nabi Idris"],
    answer: "Nabi Musa",
  },
  {
    id: "seed-q-nabi-05",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Kitab suci yang diturunkan kepada Nabi Musa adalah …",
    options: ["Injil", "Taurat", "Zabur", "Al-Qur'an"],
    answer: "Taurat",
  },
  {
    id: "seed-q-nabi-06",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi yang tidak terbakar saat dibakar Raja Namrud adalah …",
    options: ["Nabi Ibrahim", "Nabi Ismail", "Nabi Yusuf", "Nabi Yakub"],
    answer: "Nabi Ibrahim",
  },
  {
    id: "seed-q-nabi-07",
    category: "Nabi",
    type: "multiple_choice",
    prompt: "Nabi dan Rasul terakhir adalah …",
    options: ["Nabi Isa", "Nabi Muhammad", "Nabi Ibrahim", "Nabi Adam"],
    answer: "Nabi Muhammad",
  },
  {
    id: "seed-q-nabi-08",
    category: "Nabi",
    type: "essay",
    prompt: "Sebutkan minimal 10 dari 25 nabi yang wajib diketahui.",
    answer:
      "Contoh: Adam, Idris, Nuh, Hud, Saleh, Ibrahim, Lut, Ismail, Ishak, Yakub, Yusuf, Ayyub, Syuaib, Musa, Harun.",
  },
  {
    id: "seed-q-nabi-09",
    category: "Nabi",
    type: "essay",
    prompt: "Ceritakan secara singkat mukjizat Nabi Isa.",
    answer:
      "Dapat menyembuhkan orang buta dan berpenyakit kusta, menghidupkan orang mati dengan izin Allah, dan berbicara saat masih bayi.",
  },
  {
    id: "seed-q-nabi-10",
    category: "Nabi",
    type: "oral",
    prompt: "Sebutkan nama nabi beserta kitab yang diturunkan kepadanya.",
    answer: "Musa–Taurat, Daud–Zabur, Isa–Injil, Muhammad–Al-Qur'an.",
  },
];

// Pastikan akun guru demo ada.
db.prepare(
  `insert into users (id, name, email, password_hash)
   values (@id, @name, @email, @passwordHash)
   on conflict(id) do update set
     name = excluded.name,
     email = excluded.email`,
).run(DEMO_USER);

const upsertQuestion = db.prepare(
  `insert into questions (id, user_id, category, type, prompt, options, answer)
   values (@id, @userId, @category, @type, @prompt, @options, @answer)
   on conflict(id) do update set
     user_id = excluded.user_id,
     category = excluded.category,
     type = excluded.type,
     prompt = excluded.prompt,
     options = excluded.options,
     answer = excluded.answer`,
);

const seedAll = db.transaction((rows) => {
  for (const q of rows) {
    upsertQuestion.run({
      id: q.id,
      userId: DEMO_USER.id,
      category: q.category,
      type: q.type,
      prompt: q.prompt,
      options: q.options ? JSON.stringify(q.options) : null,
      answer: q.answer ?? null,
    });
  }
});

seedAll(QUESTIONS);

const summary = db
  .prepare("select category, count(*) as total from questions group by category order by category")
  .all();

console.log(`✓ Seed selesai. Akun guru: ${DEMO_USER.email}`);
for (const row of summary) {
  console.log(`  ${row.category}: ${row.total} soal`);
}
console.log(`  Total di bank soal: ${db.prepare("select count(*) as c from questions").get().c} soal`);

db.close();
