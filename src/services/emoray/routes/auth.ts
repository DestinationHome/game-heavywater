import crypto from "node:crypto";
import type { Context, Hono } from "hono";
import { log } from "@main";
import { parseNpTicket } from "../../../common/npticket";
import { apiSuccess } from "../../../common/response";

export function authRoutes(app: Hono) {
  // POST /D2O/Ticket/validate/:serviceId
  // EmoRay validates ticket at e.g. /D2O/Ticket/validate/NPUR00052_00/
  app.post("/D2O/Ticket/validate/*", async (c: Context) => {
    // TODO: Implement full ECDSA cryptographic signature verification using Sony / RPCN root public keys
    log.warn(
      `[AUTH WARNING] NP Ticket cryptographic signature verification is currently bypassed for path: ${c.req.path}. Parsing ticket payload structure directly.`,
    );

    let playerUuid = "default_player";

    try {
      const contentType = c.req.header("content-type") || "";
      let ticketBuffer: Buffer | null = null;

      if (contentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();
        const ticketFile = formData.get("base64-ticket") || formData.get("ticket.bin");

        if (ticketFile && typeof ticketFile !== "string") {
          const raw = Buffer.from(await ticketFile.arrayBuffer());
          // Check if buffer is base64 string or raw binary
          try {
            const base64Str = raw.toString("utf8").trim();
            const decoded = Buffer.from(base64Str, "base64");
            ticketBuffer = decoded.length >= 212 ? decoded : raw;
          } catch {
            ticketBuffer = raw;
          }
        } else if (typeof ticketFile === "string" && ticketFile.length > 0) {
          try {
            ticketBuffer = Buffer.from(ticketFile.trim(), "base64");
          } catch {
            ticketBuffer = Buffer.from(ticketFile);
          }
        }
      } else {
        const rawBody = await c.req.text();
        if (rawBody.trim().length > 0) {
          try {
            const decoded = Buffer.from(rawBody.trim(), "base64");
            ticketBuffer = decoded.length >= 212 ? decoded : Buffer.from(rawBody);
          } catch {
            ticketBuffer = Buffer.from(rawBody);
          }
        }
      }

      if (ticketBuffer && ticketBuffer.length >= 212) {
        const parsed = parseNpTicket(ticketBuffer);
        if (parsed?.username) {
          playerUuid = parsed.username;
          log.info(
            `[AUTH] Parsed NP Ticket for user: ${parsed.username} (Account ID: ${parsed.accountId}, Domain: ${parsed.domain}, Region: ${parsed.region})`,
          );
        } else if (parsed?.accountId) {
          playerUuid = parsed.accountId.toString(16);
        }
      } else if (ticketBuffer) {
        // Fallback for short mock strings / test payloads
        playerUuid = crypto.createHash("sha256").update(ticketBuffer).digest("hex").slice(0, 16);
      }
    } catch (err) {
      log.withError(err).warn("Failed to parse ticket body, using fallback UUID");
    }

    return apiSuccess(c, {
      d2oID: playerUuid,
      environment: "Development", // "Development" maps to G.Enum_NPEnv.Prod in lua
    });
  });
}
