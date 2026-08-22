import type { Hono } from "hono";
import type { Service } from "../service";
import { authRoutes } from "./routes/auth";
import { metricsRoutes } from "./routes/metrics";
import { playerRoutes } from "./routes/player";
import { scoresRoutes } from "./routes/scores";

export class EmoRayService implements Service {
  name = "EmoRay";
  description = "Emo Ray vs. Intergalactic Teddy Bears minigame service";

  registerRoutes(app: Hono) {
    authRoutes(app);
    metricsRoutes(app);
    playerRoutes(app);
    scoresRoutes(app);
  }
}
