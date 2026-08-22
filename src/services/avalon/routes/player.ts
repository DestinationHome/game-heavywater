import type { Context, Hono } from "hono";
import { eq } from "drizzle-orm";
import { log } from "@main";
import { db, avalonPlayers } from "../../../db";
import { apiSuccess, apiError } from "../../../common/response";

export const defaultHouseData = {
  House: {
    DRAGON: true,
  },
};

export const defaultMyAvalonKeepData = {
  KeepData: {},
};

export const defaultD2OData = {
  PersonalData: {
    Communicator_Status: {
      Clear: true,
    },
  },
};

export interface AvalonPlayerDataStore {
  uuid: string;
  HouseData: typeof defaultHouseData;
  MyAvalonKeepData: typeof defaultMyAvalonKeepData;
  D2OData: typeof defaultD2OData;
}

async function getOrCreateAvalonPlayer(uuid: string): Promise<AvalonPlayerDataStore> {
  const existing = await db
    .select()
    .from(avalonPlayers)
    .where(eq(avalonPlayers.uuid, uuid))
    .get();

  if (existing) {
    return {
      uuid: existing.uuid,
      HouseData: existing.houseData
        ? JSON.parse(existing.houseData)
        : defaultHouseData,
      MyAvalonKeepData: existing.myAvalonKeepData
        ? JSON.parse(existing.myAvalonKeepData)
        : defaultMyAvalonKeepData,
      D2OData: existing.d2oData
        ? JSON.parse(existing.d2oData)
        : defaultD2OData,
    };
  }

  const now = Date.now();
  await db.insert(avalonPlayers).values({
    uuid,
    houseData: JSON.stringify(defaultHouseData),
    myAvalonKeepData: JSON.stringify(defaultMyAvalonKeepData),
    d2oData: JSON.stringify(defaultD2OData),
    createdAt: now,
    updatedAt: now,
  });

  return {
    uuid,
    HouseData: defaultHouseData,
    MyAvalonKeepData: defaultMyAvalonKeepData,
    D2OData: defaultD2OData,
  };
}

type AvalonDataTypeKey = keyof Omit<AvalonPlayerDataStore, "uuid">;

const columnMap: Record<AvalonDataTypeKey, keyof typeof avalonPlayers.$inferSelect> = {
  HouseData: "houseData",
  MyAvalonKeepData: "myAvalonKeepData",
  D2OData: "d2oData",
};

export function playerRoutes(app: Hono) {
  const handleGetData = async (c: Context) => {
    const uuid = c.req.param("uuid");
    const dataType = c.req.param("dataType") as AvalonDataTypeKey;

    try {
      const player = await getOrCreateAvalonPlayer(uuid);
      const data = player[dataType];

      if (!data) {
        log.warn(`[AVALON] Unknown dataType requested: ${dataType} for ${uuid}`);
        return apiSuccess(c, {});
      }

      return apiSuccess(c, data);
    } catch (err) {
      log.withError(err).error(`[AVALON] Failed to get ${dataType} for ${uuid}`);
      return apiError(c, "Failed to load player data", 500);
    }
  };

  const handlePutData = async (c: Context) => {
    const uuid = c.req.param("uuid");
    const dataType = c.req.param("dataType") as AvalonDataTypeKey;
    const colName = columnMap[dataType];

    try {
      const body = await c.req.json();
      await getOrCreateAvalonPlayer(uuid);

      let payload = body;
      if (dataType === "HouseData" && body.House === undefined) {
        payload = { House: body };
      } else if (dataType === "MyAvalonKeepData" && body.KeepData === undefined) {
        payload = { KeepData: body };
      } else if (dataType === "D2OData" && body.PersonalData === undefined) {
        payload = { PersonalData: body };
      }

      if (colName) {
        const updateData: Partial<typeof avalonPlayers.$inferInsert> = {
          updatedAt: Date.now(),
          [colName]: JSON.stringify(payload),
        };

        await db
          .update(avalonPlayers)
          .set(updateData)
          .where(eq(avalonPlayers.uuid, uuid));
      }

      log.info(`[AVALON] Updated ${dataType} for player ${uuid}`);
      return apiSuccess(c, payload);
    } catch (err) {
      log.withError(err).error(`[AVALON] Failed to save ${dataType} for ${uuid}`);
      return apiError(c, "Failed to save player data", 500);
    }
  };

  // Support /D2O/Avalon/player/:uuid/data/:dataType
  app.get("/D2O/Avalon/player/:uuid/data/:dataType", handleGetData);
  app.get("/D2O/Avalon/player/:uuid/data/:dataType/", handleGetData);
  app.put("/D2O/Avalon/player/:uuid/data/:dataType", handlePutData);
  app.put("/D2O/Avalon/player/:uuid/data/:dataType/", handlePutData);

  // Support /D2O/D2OUniverse/player/:uuid/data/:dataType
  app.get("/D2O/D2OUniverse/player/:uuid/data/:dataType", handleGetData);
  app.get("/D2O/D2OUniverse/player/:uuid/data/:dataType/", handleGetData);
  app.put("/D2O/D2OUniverse/player/:uuid/data/:dataType", handlePutData);
  app.put("/D2O/D2OUniverse/player/:uuid/data/:dataType/", handlePutData);
}
