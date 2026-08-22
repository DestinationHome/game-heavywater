import type { Context, Hono } from "hono";
import { log } from "@main";
import { apiXml } from "../../../common/xml";
import { getUserData, getAllUsers } from "../store";
import type { RcRallyUserData } from "../types";

export const RCR_PUBLISHER_ID = "12";
export const RCR_PUBLISHER_TOKEN = "325976d0-17a7-4d52-abf1-46df3a5f095c";

function bestTimeMs(u: RcRallyUserData | undefined, track: string): number {
  if (!u?.times) return -1;
  for (const k of [track, `track${track}`, `Track${track}`]) {
    const t = u.times[k];
    if (t && t.time > 0) return t.time;
  }
  return -1;
}

export const RCR_ALL_QUESTS = [
  "RedCupsOnly_T1",
  "BlueCupsOnly_T1",
  "YellowCupsOnly_T1",
  "GetAllCups_T1",
  "BeatPreviousTime_T1",
  "RedCupsOnly_T2",
  "BlueCupsOnly_T2",
  "YellowCupsOnly_T2",
  "GetAllCups_T2",
  "BeatPreviousTime_T2",
  "RedCupsOnly_T3",
  "BlueCupsOnly_T3",
  "YellowCupsOnly_T3",
  "GetAllCups_T3",
  "BeatPreviousTime_T3",
  "CompleteFirstRace",
  "ModFirstVehicle",
  "CompleteMultiplayerRace",
  "WinMultiplayerRace",
  "UnlockTrack2",
  "UnlockTrack3",
  "LapTime_T1",
  "LapTime_T2",
  "LapTime_T3",
  "NoCups_T1",
  "NoCups_T2",
  "NoCups_T3",
  "CompleteAllAdvancedObjectives",
];

export function gdoRoutes(app: Hono) {
  // 1. Publisher List
  const handlePublisherList = (c: Context) => {
    log.info("[GDO] publisher/list requested");
    return apiXml(c, {
      root: {
        status: "success",
        publishers: {
          publisher: {
            "@_id": RCR_PUBLISHER_ID,
            name: "RC Rally",
            token: RCR_PUBLISHER_TOKEN,
          },
        },
      },
    });
  };
  app.get("/publisher/list", handlePublisherList);
  app.get("/publisher/list/", handlePublisherList);

  // 2. Per-user Game Data
  const handleUserGame = async (c: Context) => {
    const game = c.req.param("game");
    const user = c.req.param("user");

    const u = await getUserData(user);
    const t1 = bestTimeMs(u, "1");
    const t2 = bestTimeMs(u, "2");
    const t3 = bestTimeMs(u, "3");

    // Format Parts
    const partsEntries = Object.entries(u.parts || {});
    const partsNode = partsEntries.length > 0
      ? {
          type: partsEntries.map(([name, id]) => ({
            "@_name": name,
            id,
          })),
        }
      : "";

    // Format Objectives
    const objectivesEntries = Object.entries(u.objectives || {});
    const objectivesNode = objectivesEntries.length > 0
      ? {
          id: objectivesEntries.map(([id, count]) => ({
            "@_count": count,
            "#text": id,
          })),
        }
      : "";

    log.info(
      `[GDO] user/game user=${user} tracks=[${t1}, ${t2}, ${t3}] parts=${partsEntries.length} objectives=${objectivesEntries.length}`,
    );

    return apiXml(c, {
      root: {
        status: "success",
        publisher_game: {
          publisher_id: 12,
          games: {
            game: {
              "@_id": game,
              name: user,
              first_played_timestamp: "",
              last_played_timestamp: "",
              last_played_duration: 0,
              games_played: 0,
              total_played_duration: 0,
              Track1_Times: t1,
              Track2_Times: t2,
              Track3_Times: t3,
              Loadout1: "",
              Loadout2: "",
              Loadout3: "",
              Parts: partsNode,
              Objectives: objectivesNode,
              Total_Time: "",
            },
          },
        },
      },
    });
  };
  app.get("/user/game/:pub/:game/:locale/:user", handleUserGame);
  app.get("/user/game/:pub/:game/:locale/:user/", handleUserGame);

  // 3. User Space / Quests
  const handleUserSpace = async (c: Context) => {
    const space = c.req.param("space");
    const locale = c.req.param("locale");
    const user = c.req.param("user");

    const u = await getUserData(user);
    const objKeys = Object.keys(u.objectives || {});

    const questsNode = {
      quest: RCR_ALL_QUESTS.map((id) => ({
        "@_id": id,
        name: id,
      })),
    };

    const publisherQuestsNode = objKeys.length > 0
      ? {
          quest: objKeys.map((id) => ({
            "@_id": id,
            status: "completed",
            completed_timestamp: "2026.01.01 00:00:00",
          })),
        }
      : "";

    log.info(`[GDO] user/space space=${space} user=${user} quests=${objKeys.length}`);

    return apiXml(c, {
      root: {
        publishers: {
          publisher: {
            "@_id": 12,
            groups: "",
            quests: questsNode,
          },
        },
        documents: {
          user: {
            np_online_id: user,
            create_timestamp: "2020.01.01 00:00:00",
            locale,
            spent_duration: 0,
            scenes: {
              scene: {
                "@_id": space,
                spent_duration: 0,
                times_entered: 0,
              },
            },
          },
          publisher_quests: publisherQuestsNode,
        },
      },
    });
  };
  app.get("/user/space/:space/:locale/:user/:age", handleUserSpace);
  app.get("/user/space/:space/:locale/:user/:age/", handleUserSpace);

  // 4. Leaderboard
  const handleLeaderboard = async (c: Context) => {
    const period = c.req.param("period");
    const allUsers = await getAllUsers();

    const rows: { player: string; value: number }[] = [];
    for (const [player, u] of Object.entries(allUsers)) {
      let best = Infinity;
      for (const k of Object.keys(u.times ?? {})) {
        const t = u.times[k]?.time;
        if (typeof t === "number" && t > 0 && t < best) {
          best = t;
        }
      }
      if (best < Infinity) {
        rows.push({ player, value: best / 1000 });
      }
    }
    rows.sort((a, b) => a.value - b.value);

    log.info(`[GDO] leaderboard rows=${rows.length}`);

    return apiXml(c, {
      destinations: {
        leaderBoard: {
          game: "RC Rally",
          type: period,
          field: "time",
          sort: "ascending",
          scores: {
            score: rows.map((r) => ({
              player: r.player,
              value: r.value.toFixed(3),
              date: "2026-01-01 00:00:00",
            })),
          },
        },
      },
    });
  };
  app.get("/leaderboard/:game/:territory/:period", handleLeaderboard);
  app.get("/leaderboard/:game/:territory/:period/", handleLeaderboard);

  // 5. User Sync
  const handleUserSync = (c: Context) => {
    const user = c.req.param("user");
    log.info(`[GDO] user/sync user=${user}`);
    return apiXml(c, {
      root: {
        status: "success",
      },
    });
  };
  app.post("/user/sync/:territory/:user", handleUserSync);
  app.post("/user/sync/:territory/:user/", handleUserSync);
}
