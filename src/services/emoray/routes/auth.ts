import { log } from "@main";
import type { Context, Hono } from "hono";
import { parseNpTicket } from "../../../common/npticket";
import { apiSuccess } from "../../../common/response";

export function authRoutes(app: Hono) {
  // GET & POST /D2O/Ticket/validate/:serviceId
  // EmoRay validates ticket at e.g. /D2O/Ticket/validate/NPUR00052_00/
  const handleValidateTicket = async (c: Context) => {
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
            `[AUTH] Authenticated NP Ticket for user: ${parsed.username} (Account ID: ${parsed.accountId}, Domain: ${parsed.domain}, Region: ${parsed.region})`,
          );
        } else if (parsed?.accountId) {
          playerUuid = parsed.accountId.toString(16);
        }
      }
    } catch (err) {
      log.withError(err).warn("Failed to parse ticket body");
    }

    return apiSuccess(c, {
      d2oID: playerUuid,
      environment: "Development",
    });
  };

  app.get("/D2O/Ticket/validate/*", handleValidateTicket);
  app.post("/D2O/Ticket/validate/*", handleValidateTicket);
}
