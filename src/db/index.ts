import Database from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "data/heavywater.db";
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

sqlite.run(`
  CREATE TABLE IF NOT EXISTS rcrally_users (
    username TEXT PRIMARY KEY,
    times TEXT,
    parts TEXT,
    objectives TEXT,
    loadouts TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

try {
  sqlite.run(`ALTER TABLE rcrally_users ADD COLUMN loadouts TEXT`);
} catch {}

sqlite.run(`
  CREATE TABLE IF NOT EXISTS avalon_players (
    uuid TEXT PRIMARY KEY,
    house_data TEXT,
    my_avalon_keep_data TEXT,
    d2o_data TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS avalon_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    version TEXT,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS avalon_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    house TEXT NOT NULL DEFAULT 'DRAGON',
    amount INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS heavywater_public_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    version TEXT,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
export * from "./schema";
