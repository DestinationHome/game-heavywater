import type { Hono } from "hono";
import type { Service } from "../service";
import { metricsRoutes } from "./routes/metrics";

export class HeavyWaterPublicService implements Service {
  name = "HeavyWaterPublic";
  description =
    "Heavy Water Public Spaces central manager and telemetry service";

  registerRoutes(app: Hono) {
    metricsRoutes(app);
  }
}
