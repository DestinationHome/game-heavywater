import { log } from "@main";
import type { Context, Hono } from "hono";
import { apiError, apiSuccess } from "../../../common/response";
import { avalonMetrics, db } from "../../../db";

export function metricsRoutes(app: Hono) {
  // PUT or POST /D2O/Avalon/metrics
  const handleMetrics = async (c: Context) => {
    try {
      const body = await c.req.json();
      const version = body.Ver?.toString() || "1.0";
      const uuid = body.ID?.toString() || null;

      await db.insert(avalonMetrics).values({
        uuid,
        version,
        data: JSON.stringify(body),
        createdAt: Date.now(),
      });

      log.info(
        `[AVALON METRICS] Received telemetry event from ${uuid || "anonymous"}`,
      );
      return apiSuccess(c, {});
    } catch (err) {
      log.withError(err).error("[AVALON METRICS] Failed to record metrics");
      return apiError(c, "Failed to record metrics", 500);
    }
  };

  app.put("/D2O/Avalon/metrics", handleMetrics);
  app.put("/D2O/Avalon/metrics/", handleMetrics);
  app.post("/D2O/Avalon/metrics", handleMetrics);
  app.post("/D2O/Avalon/metrics/", handleMetrics);
}
