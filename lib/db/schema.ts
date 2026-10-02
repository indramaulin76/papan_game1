import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

/** Akun guru pemilik sesi dan bank soal. */
export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

/** Sesi permainan. `boardSize` = kotak finis yang dipilih guru. */
export const gameSessions = sqliteTable(
  "game_sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    boardSize: integer("board_size").notNull().default(64),
    status: text("status", { enum: ["setup", "playing", "finished"] })
      .notNull()
      .default("setup"),
    /** Pemain yang sedang giliran. `null` sebelum permainan dimulai / setelah selesai. */
    currentPlayerId: text("current_player_id"),
    winnerPlayerId: text("winner_player_id"),
    createdAt: createdAt(),
  },
  (table) => [index("game_sessions_user_idx").on(table.userId)],
);

/**
 * Konfigurasi ular & tangga pada papan. Satu baris = satu rintangan,
 * diurutkan dari kotak asal (`fromTile`) ke kotak tujuan (`toTile`).
 *
 * Constraint di DB menjaga papan tetap konsisten walau datanya ditulis
 * dari luar aplikasi: satu petak hanya boleh jadi awal satu rintangan,
 * dan arahnya harus sesuai jenisnya (tangga naik, ular turun).
 */
export const boardLinks = sqliteTable(
  "board_links",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["snake", "ladder"] }).notNull(),
    fromTile: integer("from_tile").notNull(),
    toTile: integer("to_tile").notNull(),
  },
  (table) => [
    index("board_links_session_idx").on(table.sessionId),
    index("board_links_from_tile_idx").on(table.sessionId, table.fromTile),
    uniqueIndex("board_links_session_from_unique").on(table.sessionId, table.fromTile),
    check("board_links_tiles_positive", sql`${table.fromTile} >= 1 and ${table.toTile} >= 1`),
    check(
      "board_links_direction",
      sql`(${table.type} = 'ladder' and ${table.toTile} > ${table.fromTile}) or (${table.type} = 'snake' and ${table.toTile} < ${table.fromTile})`,
    ),
  ],
);

/** Pemain dalam satu sesi. `turnOrder` menentukan urutan giliran. */
export const players = sqliteTable(
  "players",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    position: integer("position").notNull().default(1),
    score: integer("score").notNull().default(0),
    turnOrder: integer("turn_order").notNull(),
  },
  (table) => [index("players_session_idx").on(table.sessionId)],
);

/**
 * Riwayat lemparan dadu tiap giliran. `fromPosition` dan `toPosition`
 * merekam posisi pion sebelum & sesudah jalan (termasuk efek ular/tangga),
 * sehingga posisi pion saat ini bisa ditelusuri ulang.
 */
export const turns = sqliteTable(
  "turns",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    diceValue: integer("dice_value").notNull(),
    fromPosition: integer("from_position").notNull(),
    toPosition: integer("to_position").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("turns_session_idx").on(table.sessionId),
    index("turns_player_idx").on(table.playerId),
    check("turns_dice_range", sql`${table.diceValue} >= 1 and ${table.diceValue} <= 6`),
  ],
);

/**
 * Bank soal milik guru. `options` disimpan sebagai JSON array string
 * (khusus pilihan ganda), `answer` = kunci jawaban (opsional untuk esai/lisan).
 */
export const questions = sqliteTable(
  "questions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Topik/bab, mis. "Umum", "Tajwid", "Nabi". */
    category: text("category"),
    type: text("type", { enum: ["multiple_choice", "essay", "oral"] }).notNull(),
    prompt: text("prompt").notNull(),
    /** JSON array pilihan; hanya untuk tipe multiple_choice. */
    options: text("options"),
    answer: text("answer"),
    createdAt: createdAt(),
  },
  (table) => [
    index("questions_user_idx").on(table.userId),
    index("questions_type_idx").on(table.type),
    check("questions_prompt_not_empty", sql`length(${table.prompt}) > 0`),
  ],
);

/**
 * Penempatan soal pada kotak papan di satu sesi. Satu kotak boleh berisi
 * beberapa soal, tapi soal yang sama tidak boleh dobel di kotak yang sama.
 */
export const sessionQuestions = sqliteTable(
  "session_questions",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    /** Nomor kotak papan tempat soal dipasang. */
    tile: integer("tile").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("session_questions_session_idx").on(table.sessionId),
    index("session_questions_tile_idx").on(table.sessionId, table.tile),
    uniqueIndex("session_questions_unique").on(
      table.sessionId,
      table.tile,
      table.questionId,
    ),
    check("session_questions_tile_positive", sql`${table.tile} >= 1`),
  ],
);

/**
 * Catatan jawaban pemain. Pilihan ganda dinilai otomatis dari kunci,
 * esai/lisan dinilai guru (`isCorrect`). `score` 0 atau 10.
 */
export const answers = sqliteTable(
  "answers",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    /** Kotak tempat soal dijawab. */
    tile: integer("tile").notNull(),
    response: text("response"),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    score: integer("score").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    index("answers_session_idx").on(table.sessionId),
    index("answers_player_idx").on(table.playerId),
    index("answers_question_idx").on(table.questionId),
    check("answers_score_range", sql`${table.score} >= 0`),
    check("answers_tile_positive", sql`${table.tile} >= 1`),
  ],
);

export type User = typeof users.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type BoardLink = typeof boardLinks.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Turn = typeof turns.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type SessionQuestion = typeof sessionQuestions.$inferSelect;
export type AnswerRow = typeof answers.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type NewBoardLink = typeof boardLinks.$inferInsert;
export type NewPlayer = typeof players.$inferInsert;
export type NewTurn = typeof turns.$inferInsert;
export type NewQuestion = typeof questions.$inferInsert;
export type NewSessionQuestion = typeof sessionQuestions.$inferInsert;
