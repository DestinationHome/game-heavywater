import type { Context, Hono } from "hono";
import { log } from "@main";
import { db, heavywaterPublicMetrics } from "../../../db";
import { apiSuccess, apiError } from "../../../common/response";

export function metricsRoutes(app: Hono) {
  // PUT & POST /D2O/HeavyWaterPublic/metrics
  const handleMetrics = async (c: Context) => {
    try {
      const body = await c.req.json();
      const version = body.Ver?.toString() || "1.0";
      const uuid = body.UserName?.toString() || body.ID?.toString() || null;

      await db.insert(heavywaterPublicMetrics).values({
        uuid,
        version,
        data: JSON.stringify(body),
        createdAt: Date.now(),
      });

      log.info(
        `[HEAVYWATER PUBLIC METRICS] Received telemetry from ${uuid || "anonymous"}`,
      );
      return apiSuccess(c, {});
    } catch (err) {
      log.withError(err).error("[HEAVYWATER PUBLIC METRICS] Failed to record metrics");
      return apiError(c, "Failed to record metrics", 500);
    }
  };

  app.put("/D2O/HeavyWaterPublic/metrics", handleMetrics);
  app.put("/D2O/HeavyWaterPublic/metrics/", handleMetrics);
  app.post("/D2O/HeavyWaterPublic/metrics", handleMetrics);
  app.post("/D2O/HeavyWaterPublic/metrics/", handleMetrics);

  // GET /D2O/HeavyWaterPublic/d2oid/:username
  const handleD2OID = (c: Context) => {
    const username = c.req.param("username") || "default_player";
    log.info(`[HEAVYWATER PUBLIC] d2oid lookup for user: ${username}`);
    return apiSuccess(c, {
      d2oID: username,
    });
  };
  app.get("/D2O/HeavyWaterPublic/d2oid/:username", handleD2OID);
  app.get("/D2O/HeavyWaterPublic/d2oid/:username/", handleD2OID);
}
