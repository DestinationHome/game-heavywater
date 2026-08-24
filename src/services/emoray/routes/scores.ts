import { log } from "@main";
import type { Context, Hono } from "hono";
import { apiSuccess } from "../../../common/response";
import { db, emorayPlayers } from "../../../db";

function calculateTotalScore(
  scoresData: Record<string, unknown> | null,
): number {
  if (!scoresData?.Scores || typeof scoresData.Scores !== "object") return 0;
  let total = 0;
  for (const ep of Object.values(
    scoresData.Scores as Record<string, unknown>,
  )) {
    if (typeof ep === "number") {
      total += ep;
    } else if (typeof ep === "object" && ep !== null) {
      const epObj = ep as Record<string, unknown>;
      const epScore = epObj.EpisodeScore;
      if (typeof epScore === "number" && epScore > 0) {
        total += epScore;
      } else {
        if (epObj.Story && typeof epObj.Story === "object") {
          for (const s of Object.values(
            epObj.Story as Record<string, unknown>,
          )) {
            if (typeof s === "number") total += s;
          }
        }
        if (epObj.Mission && typeof epObj.Mission === "object") {
          for (const m of Object.values(
            epObj.Mission as Record<string, unknown>,
          )) {
            if (typeof m === "number") total += m;
          }
        }
      }
    }
  }
  return total;
}

export function scoresRoutes(app: Hono) {
  // GET /D2O/EmoRay/scores/
  const handleGetScores = async (c: Context) => {
    const range = c.req.query("range") || "allTime";
    const limit = Math.min(
      Math.max(Number(c.req.query("limit")) || 10, 1),
      100,
    );

    log.info(
      `[SCORES] Global scores requested (range=${range}, limit=${limit})`,
    );

    try {
      const rows = await db.select().from(emorayPlayers).all();
      const leaderboard = rows
        .map((r) => {
          let score = 0;
          try {
            const data = r.scoresData ? JSON.parse(r.scoresData) : null;
            score = calculateTotalScore(data);
          } catch {
            score = 0;
          }
          return {
            ID: r.uuid,
            Score: score,
          };
        })
        .sort((a, b) => b.Score - a.Score)
        .slice(0, limit)
        .map((item, index) => ({
          Rank: index + 1,
          ID: item.ID,
          Score: item.Score,
        }));

      return apiSuccess(c, {
        Scores: leaderboard,
      });
    } catch (err) {
      log.withError(err).error("Failed to load global scores");
      return apiSuccess(c, { Scores: [] });
    }
  };

  app.get("/D2O/EmoRay/scores", handleGetScores);
  app.get("/D2O/EmoRay/scores/*", handleGetScores);
}
