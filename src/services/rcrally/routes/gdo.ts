import type { Context, Hono } from "hono";
import { log } from "@main";
import { apiXml } from "../../../common/xml";
import { getUserData, getAllUsers } from "../store";
import { compressObjectives, compressParts } from "../bitcompressor";
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
  app.get("/publisher/*", handlePublisherList);

  // 2. Per-user Game Data
  const handleUserGame = async (c: Context) => {
    const rawPath = c.req.path.replace(/^\/user\/game\/?/, "");
    const parts = rawPath.split("/").filter(Boolean);
    const game = parts[1] || "7";
    const user = parts[3] || parts[parts.length - 1] || "user";

    const u = await getUserData(user);
    const t1 = bestTimeMs(u, "1");
    const t2 = bestTimeMs(u, "2");
    const t3 = bestTimeMs(u, "3");

    const partsCompressed = compressParts(u.parts);
    const objectivesCompressed = compressObjectives(u.objectives);

    log.info(
      `[GDO] user/game user=${user} tracks=[${t1}, ${t2}, ${t3}] parts=${partsCompressed} objectives=${objectivesCompressed}`,
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
              Loadout1: "AAAAAAAA",
              Loadout2: "AAAAAAAA",
              Loadout3: "AAAAAAAA",
              Parts: partsCompressed,
              Objectives: objectivesCompressed,
              Total_Time: 0,
            },
          },
        },
      },
    });
  };
  app.get("/user/game/*", handleUserGame);

  // 3. User Space / Quests
  const handleUserSpace = async (c: Context) => {
    const rawPath = c.req.path.replace(/^\/user\/space\/?/, "");
    const parts = rawPath.split("/").filter(Boolean);
    const space = parts[0] || "heavywater_rcrally_game";
    const locale = parts[1] || "en_US";
    const user = parts[2] || parts[parts.length - 1] || "user";

    const u = await getUserData(user);
    const objKeys = Object.keys(u.objectives || {});

    const questsNode = {
      quest: RCR_ALL_QUESTS.map((name, index) => ({
        "@_id": index + 1,
        name,
        description: name,
        failure: "Failed",
        initial: 1,
        start: "2020.01.01 00:00:00",
        end: "2030.01.01 00:00:00",
        track: true,
        loyalty: false,
        start_conditions: {
          client: "",
          server: "",
        },
      })),
    };

    const completedQuests = objKeys.map((name, i) => {
      const idx = RCR_ALL_QUESTS.indexOf(name);
      return {
        "@_id": idx !== -1 ? idx + 1 : i + 1,
        status: "completed",
        shared: false,
        group: 1,
        tasks: "",
      };
    });

    const publisherQuestsNode = {
      publisher_quest: {
        np_online_id: user,
        publisher_id: 12,
        tasks_completed: 0,
        quests_started: 0,
        quests_completed: completedQuests.length,
        quests_failed: 0,
        quests_quit: 0,
        quests: completedQuests.length > 0 ? { quest: completedQuests } : "",
      },
    };

    log.info(`[GDO] user/space path=${c.req.path} space=${space} user=${user} quests=${objKeys.length}`);

    return apiXml(c, {
      root: {
        status: "success",
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
  app.get("/user/space/*", handleUserSpace);

  // 4. User Group
  const handleUserGroup = (c: Context) => {
    const rawPath = c.req.path.replace(/^\/user\/group\/?/, "");
    const parts = rawPath.split("/").filter(Boolean);
    const groupIdStr = parts[0] || "1";
    const groupId = parseInt(groupIdStr, 10) || 1;
    const locale = parts[1] || "en-US";
    const user = parts[2] || "user";

    const questName = RCR_ALL_QUESTS[groupId - 1] || `Quest_${groupId}`;

    log.info(
      `[GDO] user/group path=${c.req.path} groupId=${groupId} locale=${locale} user=${user}`,
    );

    return apiXml(c, {
      root: {
        status: "success",
        group: {
          "@_id": groupId,
          name: questName,
          description: questName,
          quest: {
            "@_id": groupId,
          },
          initial: true,
          tasks: {
            task: [
              {
                "@_id": 1,
                name: questName,
                description: questName,
                space: "destinations_indie",
                conditions: {
                  client: "",
                  server: "",
                },
                effects: "",
              },
              {
                "@_id": 1,
                name: questName,
                description: questName,
                space: "heavywater_rcrally_game",
                conditions: {
                  client: "",
                  server: "",
                },
                effects: "",
              },
            ],
          },
          exitBlocks: {
            exitBlock: {
              "@_id": 1,
              name: "Exit 1",
              description: "Exit 1",
              exitLogic: "1",
              end: true,
              next: 0,
              position: 0,
              effects: "",
            },
          },
        },
      },
    });
  };
  app.get("/user/group/*", handleUserGroup);

  // 4. Leaderboard
  const handleLeaderboard = async (c: Context) => {
    const rawPath = c.req.path.replace(/^\/leaderboard\/?/, "");
    const parts = rawPath.split("/").filter(Boolean);
    const period = parts[2] || "allTime";
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
  app.get("/leaderboard/*", handleLeaderboard);

  // 5. User Sync
  const handleUserSync = (c: Context) => {
    const rawPath = c.req.path.replace(/^\/user\/sync\/?/, "");
    const parts = rawPath.split("/").filter(Boolean);
    const user = parts[1] || parts[0] || "user";
    log.info(`[GDO] user/sync user=${user}`);
    return apiXml(c, {
      root: {
        status: "success",
      },
    });
  };
  app.post("/user/sync/*", handleUserSync);
}
