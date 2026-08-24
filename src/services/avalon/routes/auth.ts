import { log } from "@main";
import type { Context, Hono } from "hono";
import { parseNpTicket } from "../../../common/npticket";
import { apiSuccess } from "../../../common/response";

export function authRoutes(app: Hono) {
  const handleTicketAuth = async (c: Context) => {
    let playerUuid = "default_player";

    try {
      let ticketBuffer: Buffer | null = null;
      const contentType = c.req.header("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();
        const ticketFile = formData.get("base64-ticket");

        if (ticketFile && typeof ticketFile !== "string") {
          ticketBuffer = Buffer.from(await ticketFile.arrayBuffer());
        } else if (typeof ticketFile === "string" && ticketFile.length > 0) {
          ticketBuffer = Buffer.from(ticketFile, "base64");
        }
      } else if (c.req.method === "POST") {
        const raw = Buffer.from(await c.req.arrayBuffer());
        if (raw.length > 0) {
          ticketBuffer = raw;
        }
      }

      if (ticketBuffer && ticketBuffer.length >= 212) {
        const parsed = parseNpTicket(ticketBuffer);
        if (parsed?.username) {
          playerUuid = parsed.username;
          log.info(
            `[AVALON AUTH] Authenticated NP Ticket for user: ${parsed.username} (Account ID: ${parsed.accountId}, Domain: ${parsed.domain}, Region: ${parsed.region})`,
          );
        } else if (parsed?.accountId) {
          playerUuid = parsed.accountId.toString(16);
        }
      }
    } catch (err) {
      log.withError(err).warn("[AVALON AUTH] Failed to parse ticket body");
    }

    return apiSuccess(c, {
      d2oID: playerUuid,
      environment: "Development",
    });
  };

  // Support both /verify/ (Avalon) and /validate/ (EmoRay) ticket endpoints
  app.get("/D2O/Ticket/verify/*", handleTicketAuth);
  app.post("/D2O/Ticket/verify/*", handleTicketAuth);
  app.get("/D2O/Ticket/validate/*", handleTicketAuth);
  app.post("/D2O/Ticket/validate/*", handleTicketAuth);

  // GET /D2O/Avalon/d2oid/:username
  const handleD2OID = (c: Context) => {
    const username = c.req.param("username") || "default_player";
    log.info(`[AVALON AUTH] d2oid lookup for user: ${username}`);
    return apiSuccess(c, {
      d2oID: username,
    });
  };
  app.get("/D2O/Avalon/d2oid/:username", handleD2OID);
  app.get("/D2O/Avalon/d2oid/:username/", handleD2OID);
}
