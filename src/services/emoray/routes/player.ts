import type { Hono } from "hono";
import { eq } from "drizzle-orm";
import { log } from "@main";
import { db, emorayPlayers } from "../../../db";
import { apiSuccess, apiError } from "../../../common/response";
import {
  defaultProgressionData,
  defaultEquippedData,
  defaultStoreProgressData,
  defaultControllerData,
  defaultScoresData,
} from "../../../defaults/progressDefaults";

/**
 * Ensures player profile exists in database, populating defaults if missing.
 */
async function getOrCreatePlayer(uuid: string) {
  const existing = await db
    .select()
    .from(emorayPlayers)
    .where(eq(emorayPlayers.uuid, uuid))
    .get();

  if (existing) {
    return {
      uuid: existing.uuid,
      progressionData: existing.progressionData
        ? JSON.parse(existing.progressionData)
        : defaultProgressionData,
      equippedData: existing.equippedData
        ? JSON.parse(existing.equippedData)
        : defaultEquippedData,
      storeProgressData: existing.storeProgressData
        ? JSON.parse(existing.storeProgressData)
        : defaultStoreProgressData,
      controllerData: existing.controllerData
        ? JSON.parse(existing.controllerData)
        : defaultControllerData,
      scoresData: existing.scoresData
        ? JSON.parse(existing.scoresData)
        : defaultScoresData,
    };
  }

  const now = Date.now();
  await db.insert(emorayPlayers).values({
    uuid,
    progressionData: JSON.stringify(defaultProgressionData),
    equippedData: JSON.stringify(defaultEquippedData),
    storeProgressData: JSON.stringify(defaultStoreProgressData),
    controllerData: JSON.stringify(defaultControllerData),
    scoresData: JSON.stringify(defaultScoresData),
    createdAt: now,
    updatedAt: now,
  });

  return {
    uuid,
    progressionData: defaultProgressionData,
    equippedData: defaultEquippedData,
    storeProgressData: defaultStoreProgressData,
    controllerData: defaultControllerData,
    scoresData: defaultScoresData,
  };
}

export function playerRoutes(app: Hono) {
  // 1. ProgressionData (GET / PUT)
  app.get("/D2O/EmoRay/player/:uuid/data/ProgressionData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const player = await getOrCreatePlayer(uuid);
      return apiSuccess(c, player.progressionData);
    } catch (err) {
      log.withError(err).error(`Failed to get ProgressionData for ${uuid}`);
      return apiError(c, "Failed to load progression data", 500);
    }
  });

  app.put("/D2O/EmoRay/player/:uuid/data/ProgressionData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      const payload = body.ProgressData !== undefined ? body : { ProgressData: body };
      await db
        .update(emorayPlayers)
        .set({
          progressionData: JSON.stringify(payload),
          updatedAt: Date.now(),
        })
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated ProgressionData for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save ProgressionData for ${uuid}`);
      return apiError(c, "Failed to save progression data", 500);
    }
  });

  // 2. EquippedData (GET / PUT)
  app.get("/D2O/EmoRay/player/:uuid/data/EquippedData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const player = await getOrCreatePlayer(uuid);
      return apiSuccess(c, player.equippedData);
    } catch (err) {
      log.withError(err).error(`Failed to get EquippedData for ${uuid}`);
      return apiError(c, "Failed to load equipped data", 500);
    }
  });

  app.put("/D2O/EmoRay/player/:uuid/data/EquippedData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      const payload = body.Equipped !== undefined ? body : { Equipped: body };
      await db
        .update(emorayPlayers)
        .set({
          equippedData: JSON.stringify(payload),
          updatedAt: Date.now(),
        })
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated EquippedData for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save EquippedData for ${uuid}`);
      return apiError(c, "Failed to save equipped data", 500);
    }
  });

  // 3. ScoresData (GET / PUT)
  app.get("/D2O/EmoRay/player/:uuid/data/ScoresData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const player = await getOrCreatePlayer(uuid);
      return apiSuccess(c, player.scoresData);
    } catch (err) {
      log.withError(err).error(`Failed to get ScoresData for ${uuid}`);
      return apiError(c, "Failed to load scores data", 500);
    }
  });

  app.put("/D2O/EmoRay/player/:uuid/data/ScoresData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      const payload = body.Scores !== undefined ? body : { Scores: body };
      await db
        .update(emorayPlayers)
        .set({
          scoresData: JSON.stringify(payload),
          updatedAt: Date.now(),
        })
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated ScoresData for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save ScoresData for ${uuid}`);
      return apiError(c, "Failed to save scores data", 500);
    }
  });

  // 4. ControllerData (GET / PUT)
  app.get("/D2O/EmoRay/player/:uuid/data/ControllerData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const player = await getOrCreatePlayer(uuid);
      return apiSuccess(c, player.controllerData);
    } catch (err) {
      log.withError(err).error(`Failed to get ControllerData for ${uuid}`);
      return apiError(c, "Failed to load controller data", 500);
    }
  });

  app.put("/D2O/EmoRay/player/:uuid/data/ControllerData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      const payload = body.Config !== undefined ? body : { Config: body };
      await db
        .update(emorayPlayers)
        .set({
          controllerData: JSON.stringify(payload),
          updatedAt: Date.now(),
        })
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated ControllerData for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save ControllerData for ${uuid}`);
      return apiError(c, "Failed to save controller data", 500);
    }
  });

  // 5. StoreProgressData (GET / PUT)
  app.get("/D2O/EmoRay/player/:uuid/data/StoreProgressData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const player = await getOrCreatePlayer(uuid);
      return apiSuccess(c, player.storeProgressData);
    } catch (err) {
      log.withError(err).error(`Failed to get StoreProgressData for ${uuid}`);
      return apiError(c, "Failed to load store progress data", 500);
    }
  });

  app.put("/D2O/EmoRay/player/:uuid/data/StoreProgressData", async (c) => {
    const uuid = c.req.param("uuid");
    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      const payload = body.StoreProgress !== undefined ? body : { StoreProgress: body };
      await db
        .update(emorayPlayers)
        .set({
          storeProgressData: JSON.stringify(payload),
          updatedAt: Date.now(),
        })
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated StoreProgressData for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save StoreProgressData for ${uuid}`);
      return apiError(c, "Failed to save store progress data", 500);
    }
  });
}
