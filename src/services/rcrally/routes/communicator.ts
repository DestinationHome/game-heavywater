import { log } from "@main";
import type { Context, Hono } from "hono";
import { apiXml, parseXml } from "../../../common/xml";
import {
  handleLoadout,
  handleObjectives,
  handleParts,
  handleTimes,
} from "../handlers";
import { getUserData, saveUserData } from "../store";
import type { RcRallyUserData } from "../types";

export function communicatorRoutes(app: Hono) {
  // GET pings / queries from Heavy Water games (e.g. ?user=...&venue=...&award=...)
  const handleCommunicatorGet = (c: Context) => {
    const user = c.req.query("user");
    const venue = c.req.query("venue");
    const award = c.req.query("award");
    log.info(
      `[HEAVYWATER GET] path=${c.req.path} user=${user ?? "-"} venue=${venue ?? "-"} award=${award ?? "-"}`,
    );
    return apiXml(c, {
      root: {
        status: "success",
      },
    });
  };

  app.get("/", handleCommunicatorGet);
  app.get("/heavywater/*", handleCommunicatorGet);

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
    return apiXml(c, {
      root: {
        status: "success",
      },
    });
  });
}

async function handleCommunicatorPost(c: Context) {
  const service = String(c.req.header("service") ?? "");
  const method = String(c.req.header("method") ?? "").toLowerCase();
  const raw = await c.req.text();

  let parsed: Record<string, unknown> | undefined;

  if (raw) {
    try {
      parsed = parseXml(raw);
    } catch (err) {
      log
        .withError(err)
        .warn("Failed to parse Heavy Water Communicator XML body");
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
      } else if (service === "Loadout") {
        handleLoadout(parsed, userMap);
      }

      // Persist changes to SQLite
      for (const [user, updatedData] of userMap.entries()) {
        const existing = await getUserData(user);

        for (const [track, lap] of Object.entries(updatedData.times ?? {})) {
          const prev = existing.times[track];
          if (!prev || lap.time < prev.time) {
            existing.times[track] = lap;
          }
        }

        if (updatedData.parts) {
          Object.assign(existing.parts, updatedData.parts);
        }
        if (updatedData.objectives) {
          Object.assign(existing.objectives, updatedData.objectives);
        }
        if (updatedData.loadouts) {
          Object.assign(existing.loadouts, updatedData.loadouts);
        }

        await saveUserData(user, existing);
        log.info(`[RCRALLY] Saved ${service} for player: ${user}`);
      }
    } catch (err) {
      log.withError(err).error(`Handler error (SERVICE=${service})`);
    }
  }

  return apiXml(c, {
    root: {
      status: "success",
    },
  });
}
