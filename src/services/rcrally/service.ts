import type { Hono } from "hono";
import type { Service } from "../service";
import { communicatorRoutes } from "./routes/communicator";

export class RcRallyService implements Service {
  name = "RcRally";
  description =
    "Heavy Water RC Rally Communicator — game-specific times/parts/objectives";

  registerRoutes(app: Hono) {
    // GDO routes (publisher/list, user/space, user/sync, leaderboard) have
    // moved to infra-destinations — the Sony Destinations GDO platform service.
    communicatorRoutes(app);
  }
}
