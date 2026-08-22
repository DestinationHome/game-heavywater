import type { Hono } from "hono";
import type { Service } from "../service";
import { gdoRoutes } from "./routes/gdo";
import { communicatorRoutes } from "./routes/communicator";

export class RcRallyService implements Service {
  name = "RcRally";
  description = "Heavy Water RC Rally game and Destinations GDO service";

  registerRoutes(app: Hono) {
    gdoRoutes(app);
    communicatorRoutes(app);
  }
}
