import type { Context, Hono } from "hono";
import { eq } from "drizzle-orm";
import { log } from "@main";
import { db, avalonContributions } from "../../../db";
import { apiSuccess, apiError } from "../../../common/response";

export function contributionsRoutes(app: Hono) {
  // GET /D2O/Avalon/contributions
  const handleGetContributions = async (c: Context) => {
    try {
      const row = await db.select().from(avalonContributions).get();
      const contribution = row
        ? { House: row.house, Amount: row.amount }
        : { House: "DRAGON", Amount: 0 };

      return apiSuccess(c, {
        Contribution: contribution,
      });
    } catch (err) {
      log.withError(err).error("[AVALON] Failed to get contributions");
      return apiError(c, "Failed to load contributions", 500);
    }
  };

  // PUT /D2O/Avalon/contributions
  const handlePutContributions = async (c: Context) => {
    try {
      const body = await c.req.json();
      const contribution = body.Contribution || body;
      const house = contribution.House?.toString() || "DRAGON";
      const amount = Number(contribution.Amount) || 0;

      const existing = await db.select().from(avalonContributions).get();
      if (existing) {
        await db
          .update(avalonContributions)
          .set({
            house,
            amount: existing.amount + amount,
            updatedAt: Date.now(),
          })
          .where(eq(avalonContributions.id, existing.id));
      } else {
        await db.insert(avalonContributions).values({
          house,
          amount,
          updatedAt: Date.now(),
        });
      }

      log.info(`[AVALON] Updated crystal contribution: House=${house}, Amount=${amount}`);
      return apiSuccess(c, {
        Contribution: { House: house, Amount: amount },
      });
    } catch (err) {
      log.withError(err).error("[AVALON] Failed to save contributions");
      return apiError(c, "Failed to save contributions", 500);
    }
  };

  app.get("/D2O/Avalon/contributions", handleGetContributions);
  app.get("/D2O/Avalon/contributions/", handleGetContributions);
  app.put("/D2O/Avalon/contributions", handlePutContributions);
  app.put("/D2O/Avalon/contributions/", handlePutContributions);
}
