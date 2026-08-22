import type { Hono } from "hono";
import type { Service } from "../service";
import { authRoutes } from "./routes/auth";
import { metricsRoutes } from "./routes/metrics";
import { contributionsRoutes } from "./routes/contributions";
import { playerRoutes } from "./routes/player";

export class AvalonService implements Service {
  name = "Avalon";
  description = "Heavy Water Avalon Keep and Faire minigame and apartment service";

  registerRoutes(app: Hono) {
    authRoutes(app);
    metricsRoutes(app);
    contributionsRoutes(app);
    playerRoutes(app);
  }
}
