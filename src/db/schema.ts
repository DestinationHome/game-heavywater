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
