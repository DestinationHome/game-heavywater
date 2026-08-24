import "./instrumentation";

import { openTelemetryPlugin } from "@loglayer/plugin-opentelemetry";
import { OpenTelemetryTransport } from "@loglayer/transport-opentelemetry";
import { PinoTransport } from "@loglayer/transport-pino";
import { Hono } from "hono";
import { LogLayer } from "loglayer";
import pino from "pino";
import { serializeError } from "serialize-error";
import { AvalonService } from "./services/avalon/service";
import { EmoRayService } from "./services/emoray/service";
import { HeavyWaterPublicService } from "./services/public/service";
import { RcRallyService } from "./services/rcrally/service";

const app = new Hono();

// Strip trailing slashes silently without HTTP redirect
app.use(async (c, next) => {
  const url = new URL(c.req.url);
  if (url.pathname.endsWith("/") && url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    c.req.raw = new Request(url.toString(), c.req.raw);
  }
  await next();
});

const services = [
  new EmoRayService(),
  new RcRallyService(),
  new AvalonService(),
  new HeavyWaterPublicService(),
];

// middleware and logging
export const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new PinoTransport({
      logger: pino({
        transport: {
          target: "pino-pretty",
        },
      }),
    }),
    new OpenTelemetryTransport(),
  ],
  plugins: [openTelemetryPlugin()],
});

app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  log
    .withMetadata({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
    })
    .info(`--> ${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
});

// Healthcheck
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

// Register services
for (const service of services) {
  service.registerRoutes(app);
}

log
  .withMetadata({
    services: services.map((s) => ({
      name: s.name,
      description: s.description,
    })),
  })
  .info("Server is running!");

const port = parseInt(process.env.PORT || "3000", 10);

export default {
  port,
  fetch: app.fetch,
};
