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
      ProgressionData: existing.progressionData
        ? JSON.parse(existing.progressionData)
        : defaultProgressionData,
      EquippedData: existing.equippedData
        ? JSON.parse(existing.equippedData)
        : defaultEquippedData,
      StoreProgressData: existing.storeProgressData
        ? JSON.parse(existing.storeProgressData)
        : defaultStoreProgressData,
      ControllerData: existing.controllerData
        ? JSON.parse(existing.controllerData)
        : defaultControllerData,
      ScoresData: existing.scoresData
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
    ProgressionData: defaultProgressionData,
    EquippedData: defaultEquippedData,
    StoreProgressData: defaultStoreProgressData,
    ControllerData: defaultControllerData,
    ScoresData: defaultScoresData,
  };
}

const columnMap: Record<string, keyof typeof emorayPlayers.$inferSelect> = {
  ProgressionData: "progressionData",
  EquippedData: "equippedData",
  StoreProgressData: "storeProgressData",
  ControllerData: "controllerData",
  ScoresData: "scoresData",
};

export function playerRoutes(app: Hono) {
  const handleGetData = async (c: any) => {
    const uuid = c.req.param("uuid");
    const dataType = c.req.param("dataType");

    try {
      const player: any = await getOrCreatePlayer(uuid);
      const data = player[dataType];

      if (!data) {
        log.warn(`Unknown dataType requested: ${dataType} for ${uuid}`);
        return apiError(c, "Unknown data type", 404);
      }

      return apiSuccess(c, data);
    } catch (err) {
      log.withError(err).error(`Failed to get ${dataType} for ${uuid}`);
      return apiError(c, "Failed to load player data", 500);
    }
  };

  const handlePutData = async (c: any) => {
    const uuid = c.req.param("uuid");
    const dataType = c.req.param("dataType");
    const colName = columnMap[dataType];

    if (!colName) {
      log.warn(`Unknown dataType received in PUT: ${dataType} for ${uuid}`);
      return apiError(c, "Unknown data type", 400);
    }

    try {
      const body = await c.req.json();
      await getOrCreatePlayer(uuid);

      // Normalize body if needed
      let payload = body;
      if (dataType === "ProgressionData" && body.ProgressData === undefined) {
        payload = { ProgressData: body };
      } else if (dataType === "EquippedData" && body.Equipped === undefined) {
        payload = { Equipped: body };
      } else if (dataType === "ScoresData" && body.Scores === undefined) {
        payload = { Scores: body };
      } else if (dataType === "ControllerData" && body.Config === undefined) {
        payload = { Config: body };
      } else if (dataType === "StoreProgressData" && body.StoreProgress === undefined) {
        payload = { StoreProgress: body };
      }

      const updateData: any = {
        updatedAt: Date.now(),
      };
      updateData[colName] = JSON.stringify(payload);

      await db
        .update(emorayPlayers)
        .set(updateData)
        .where(eq(emorayPlayers.uuid, uuid));

      log.info(`Updated ${dataType} for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`Failed to save ${dataType} for ${uuid}`);
      return apiError(c, "Failed to save player data", 500);
    }
  };

  // Support both trailing slash and non-trailing slash endpoints
  app.get("/D2O/EmoRay/player/:uuid/data/:dataType", handleGetData);
  app.get("/D2O/EmoRay/player/:uuid/data/:dataType/", handleGetData);
  app.put("/D2O/EmoRay/player/:uuid/data/:dataType", handlePutData);
  app.put("/D2O/EmoRay/player/:uuid/data/:dataType/", handlePutData);
}
