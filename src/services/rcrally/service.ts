import type { Hono } from "hono";
import type { Service } from "../service";
import { communicatorRoutes } from "./routes/communicator";
import { internalRoutes } from "./routes/internal";

export class RcRallyService implements Service {
  name = "RcRally";
  description =
    "Heavy Water RC Rally Communicator — times/parts/objectives/loadouts";

  registerRoutes(app: Hono) {
    // GDO routes (publisher/list, user/space, user/sync, leaderboard) have
    // moved to infra-destinations — the Sony Destinations GDO platform service.
    internalRoutes(app);
    communicatorRoutes(app);
  }
}
