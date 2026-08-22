import type { Context, Hono } from "hono";
import { log } from "@main";
import { getUserData, getAllUsers } from "../store";
import { xmlEsc } from "../utils";
import type { RcRallyUserData } from "../types";

export const RCR_PUBLISHER_ID = "12";
export const RCR_PUBLISHER_TOKEN = "325976d0-17a7-4d52-abf1-46df3a5f095c";

function sendXml(c: Context, body: string) {
  // No <?xml?> prolog: PS Home's FpXml parser chokes on it.
  return c.text(body, 200, { "Content-Type": "text/xml" });
}

function bestTimeMs(u: RcRallyUserData | undefined, track: string): number {
  if (!u?.times) return -1;
  for (const k of [track, `track${track}`, `Track${track}`]) {
    const t = u.times[k];
    if (t && t.time > 0) return t.time;
  }
  return -1;
}

const PUBLISHER_XML = `<publisher id="${RCR_PUBLISHER_ID}"><name>RC Rally</name><token>${RCR_PUBLISHER_TOKEN}</token></publisher>`;

export function gdoRoutes(app: Hono) {
  // 1. Publisher List
  const handlePublisherList = (c: Context) => {
    log.info("[GDO] publisher/list requested");
    return sendXml(
      c,
      `<root><status>success</status><publishers>${PUBLISHER_XML}</publishers></root>`,
    );
  };
  app.get("/publisher/list", handlePublisherList);
  app.get("/publisher/list/", handlePublisherList);

  // 2. Per-user Game Data
  const handleUserGame = async (c: Context) => {
    const game = xmlEsc(c.req.param("game"));
    const user = c.req.param("user");

    const u = await getUserData(user);
    const t1 = bestTimeMs(u, "1");
    const t2 = bestTimeMs(u, "2");
    const t3 = bestTimeMs(u, "3");

    log.info(`[GDO] user/game user=${user} tracks=[${t1}, ${t2}, ${t3}]`);

    return sendXml(
      c,
      "<root><status>success</status><publisher_game>" +
        "<publisher_id>12</publisher_id><games>" +
        `<game id="${game}"><name>${xmlEsc(user)}</name>` +
        "<first_played_timestamp></first_played_timestamp>" +
        "<last_played_timestamp></last_played_timestamp>" +
        "<last_played_duration>0</last_played_duration>" +
        "<games_played>0</games_played>" +
        "<total_played_duration>0</total_played_duration>" +
        `<Track1_Times>${t1}</Track1_Times>` +
        `<Track2_Times>${t2}</Track2_Times>` +
        `<Track3_Times>${t3}</Track3_Times>` +
        "<Loadout1></Loadout1><Loadout2></Loadout2><Loadout3></Loadout3>" +
        "<Parts></Parts><Objectives></Objectives><Total_Time></Total_Time>" +
        "</game></games></publisher_game></root>",
    );
  };
  app.get("/user/game/:pub/:game/:locale/:user", handleUserGame);
  app.get("/user/game/:pub/:game/:locale/:user/", handleUserGame);

  // 3. User Space / Quests
  const handleUserSpace = (c: Context) => {
    const space = xmlEsc(c.req.param("space"));
    const locale = xmlEsc(c.req.param("locale"));
    const user = xmlEsc(c.req.param("user"));

    log.info(`[GDO] user/space space=${space} user=${user}`);

    return sendXml(
      c,
      '<root><publishers><publisher id="12"><groups></groups><quests></quests></publisher></publishers>' +
        "<documents><user>" +
        `<np_online_id>${user}</np_online_id>` +
        "<create_timestamp>2020.01.01 00:00:00</create_timestamp>" +
        `<locale>${locale}</locale><spent_duration>0</spent_duration>` +
        `<scenes><scene id="${space}"><spent_duration>0</spent_duration>` +
        "<times_entered>0</times_entered></scene></scenes>" +
        "</user><publisher_quests></publisher_quests></documents></root>",
    );
  };
  app.get("/user/space/:space/:locale/:user/:age", handleUserSpace);
  app.get("/user/space/:space/:locale/:user/:age/", handleUserSpace);

  // 4. Leaderboard
  const handleLeaderboard = async (c: Context) => {
    const period = xmlEsc(c.req.param("period"));
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

    const scores = rows
      .map(
        (r) =>
          `<score><player>${xmlEsc(r.player)}</player>` +
          `<value>${r.value.toFixed(3)}</value>` +
          "<date>2026-01-01 00:00:00</date></score>",
      )
      .join("");

    return sendXml(
      c,
      "<destinations><leaderBoard><game>RC Rally</game>" +
        `<type>${period}</type><field>time</field><sort>ascending</sort>` +
        `<scores>${scores}</scores></leaderBoard></destinations>`,
    );
  };
  app.get("/leaderboard/:game/:territory/:period", handleLeaderboard);
  app.get("/leaderboard/:game/:territory/:period/", handleLeaderboard);

  // 5. User Sync
  const handleUserSync = async (c: Context) => {
    const user = c.req.param("user");
    const raw = await c.req.text();
    log.info(`[GDO] user/sync user=${user} bytes=${raw.length}`);
    return sendXml(c, "<root><status>success</status></root>");
  };
  app.post("/user/sync/:territory/:user", handleUserSync);
  app.post("/user/sync/:territory/:user/", handleUserSync);
}
