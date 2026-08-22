import type { Hono } from "hono";
import { log } from "@main";
import { db, emorayMetrics } from "../../../db";
import { apiSuccess, apiError } from "../../../common/response";

export function metricsRoutes(app: Hono) {
  // PUT or POST /D2O/EmoRay/metrics
  const handleMetrics = async (c: any) => {
    try {
      const body = await c.req.json();
      const version = body.Ver?.toString() || "1.0";
      const uuid = body.ID?.toString() || null;

      await db.insert(emorayMetrics).values({
        uuid,
        version,
        data: JSON.stringify(body),
        createdAt: Date.now(),
      });

      log.info(`[METRICS] Received telemetry event from ${uuid || "anonymous"}`);
      return apiSuccess(c, {});
    } catch (err) {
      log.withError(err).error("Failed to record metrics");
      return apiError(c, "Failed to record metrics", 500);
    }
  };

  app.put("/D2O/EmoRay/metrics", handleMetrics);
  app.post("/D2O/EmoRay/metrics", handleMetrics);
}
