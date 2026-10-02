import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "./data/game.db";

if (url !== ":memory:") {
  mkdirSync(dirname(url), { recursive: true });
}

const globalForDb = globalThis as unknown as { sqlite?: Database.Database };

/** Satu koneksi saja yang dipakai ulang saat hot-reload Next.js. */
const sqlite = globalForDb.sqlite ?? new Database(url);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
