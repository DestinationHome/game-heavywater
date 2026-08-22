import type { Hono } from "hono";
import { log } from "@main";
import { apiSuccess } from "../../../common/response";
import crypto from "node:crypto";

export function authRoutes(app: Hono) {
  // POST /D2O/Ticket/validate/:serviceId
  // EmoRay validates ticket at e.g. /D2O/Ticket/validate/NPUR00052_00/
  app.post("/D2O/Ticket/validate/*", async (c) => {
    // TODO: Implement authentic NP Ticket validation using Sony certificates & cryptography
    log.warn(
      `[AUTH WARNING] NP Ticket validation is currently stubbed for path: ${c.req.path}. Production signature verification must be implemented.`,
    );

    // Try reading multipart body or raw payload if sent by client
    let playerUuid = "default_player";
    try {
      const contentType = c.req.header("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();
        const ticketFile = formData.get("base64-ticket") || formData.get("ticket.bin");
        if (ticketFile && typeof ticketFile !== "string") {
          const buf = Buffer.from(await ticketFile.arrayBuffer());
          // Create deterministic player ID from ticket buffer if available, or extract online name if readable
          playerUuid = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
        }
      } else {
        const bodyText = await c.req.text();
        if (bodyText.trim().length > 0) {
          playerUuid = crypto.createHash("sha256").update(bodyText).digest("hex").slice(0, 16);
        }
      }
    } catch (err) {
      log.withError(err).warn("Failed to parse ticket body, using fallback UUID");
    }

    return apiSuccess(c, {
      d2oID: playerUuid,
      environment: "Development", // "Development" sets client NPEnv to Prod in lua
    });
  });
}
