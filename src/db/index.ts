import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "data/heavywater.db";
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

// Initialize tables if they do not exist
sqlite.run(`
  CREATE TABLE IF NOT EXISTS emoray_players (
    uuid TEXT PRIMARY KEY,
    progression_data TEXT,
    equipped_data TEXT,
    store_progress_data TEXT,
    controller_data TEXT,
    scores_data TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS emoray_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    version TEXT,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
export * from "./schema";
