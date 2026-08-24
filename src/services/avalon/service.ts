import type { Hono } from "hono";
import type { Service } from "../service";
import { authRoutes } from "./routes/auth";
import { contributionsRoutes } from "./routes/contributions";
import { metricsRoutes } from "./routes/metrics";
import { playerRoutes } from "./routes/player";

export class AvalonService implements Service {
  name = "Avalon";
  description =
    "Heavy Water Avalon Keep and Faire minigame and apartment service";

  registerRoutes(app: Hono) {
    authRoutes(app);
    metricsRoutes(app);
    contributionsRoutes(app);
    playerRoutes(app);
  }
}
