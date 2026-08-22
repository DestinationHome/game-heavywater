import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const emorayPlayers = sqliteTable("emoray_players", {
  uuid: text("uuid").primaryKey(),
  progressionData: text("progression_data"), // JSON
  equippedData: text("equipped_data"), // JSON
  storeProgressData: text("store_progress_data"), // JSON
  controllerData: text("controller_data"), // JSON
  scoresData: text("scores_data"), // JSON
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const emorayMetrics = sqliteTable("emoray_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid"),
  version: text("version"),
  data: text("data").notNull(), // JSON
  createdAt: integer("created_at").notNull(),
});

export const rcrallyUsers = sqliteTable("rcrally_users", {
  username: text("username").primaryKey(),
  times: text("times"), // JSON: Record<string, { time: number; splits: number[] }>
  parts: text("parts"), // JSON: Record<string, number>
  objectives: text("objectives"), // JSON: Record<string, number>
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const avalonPlayers = sqliteTable("avalon_players", {
  uuid: text("uuid").primaryKey(),
  houseData: text("house_data"), // JSON
  myAvalonKeepData: text("my_avalon_keep_data"), // JSON
  d2oData: text("d2o_data"), // JSON
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const avalonMetrics = sqliteTable("avalon_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid"),
  version: text("version"),
  data: text("data").notNull(), // JSON
  createdAt: integer("created_at").notNull(),
});

export const avalonContributions = sqliteTable("avalon_contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  house: text("house").notNull().default("DRAGON"),
  amount: integer("amount").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const heavywaterPublicMetrics = sqliteTable("heavywater_public_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid"),
  version: text("version"),
  data: text("data").notNull(), // JSON
  createdAt: integer("created_at").notNull(),
});
