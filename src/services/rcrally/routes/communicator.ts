import type { Context, Hono } from "hono";
import { XMLParser } from "fast-xml-parser";
import { log } from "@main";
import { getUserData, saveUserData } from "../store";
import { handleTimes, handleParts, handleObjectives } from "../handlers";
import type { RcRallyUserData } from "../types";

const parser = new XMLParser({ ignoreAttributes: false });

export function communicatorRoutes(app: Hono) {
  // Catch-all POST for Heavy Water ServerCommunicator XML saves
  app.post("/heavywater/*", async (c: Context) => {
    return handleCommunicatorPost(c);
  });

  // Direct root POST handler when SERVICE header is present
  app.post("/", async (c: Context) => {
    const service = c.req.header("service");
    if (service) {
      return handleCommunicatorPost(c);
    }
    return c.text("OK", 200);
  });
}

async function handleCommunicatorPost(c: Context) {
  const service = String(c.req.header("service") ?? "");
  const method = String(c.req.header("method") ?? "").toLowerCase();
  const raw = await c.req.text();

  let parsed: Record<string, unknown> | undefined;

  if (raw) {
    try {
      parsed = parser.parse(raw);
    } catch (err) {
      log.withError(err).warn("Failed to parse Heavy Water Communicator XML body");
    }
  }

  // Heavy Water "set" save — route by SERVICE header
  if (parsed && method !== "get") {
    try {
      const userMap = new Map<string, RcRallyUserData>();

      if (service === "Times") {
        handleTimes(parsed, userMap);
      } else if (service === "Parts") {
        handleParts(parsed, userMap);
      } else if (service === "Objectives") {
        handleObjectives(parsed, userMap);
      }

      // Persist changes to SQLite
      for (const [user, updatedData] of userMap.entries()) {
        const existing = await getUserData(user);
        if (updatedData.times) {
          Object.assign(existing.times, updatedData.times);
        }
        if (updatedData.parts) {
          Object.assign(existing.parts, updatedData.parts);
        }
        if (updatedData.objectives) {
          Object.assign(existing.objectives, updatedData.objectives);
        }
        await saveUserData(user, existing);
        log.info(`[RCRALLY] Saved ${service} for player: ${user}`);
      }
    } catch (err) {
      log.withError(err).error(`Handler error (SERVICE=${service})`);
    }
  }

  return c.text("<root><status>success</status></root>", 200, {
    "Content-Type": "text/xml",
  });
}
