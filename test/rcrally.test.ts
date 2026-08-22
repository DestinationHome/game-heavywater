import { describe, it, expect } from "bun:test";
import app from "../src/index";

describe("RC Rally & GDO Endpoints", () => {
  const testUser = `racer_${Math.random().toString(36).slice(2, 8)}`;

  it("GET / with query params returns success XML", async () => {
    const res = await app.fetch(
      new Request(
        `http://localhost/?user=${testUser}&venue=rc_track_1&award=first_place`,
      ),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<status>success</status>");
  });

  it("GET /publisher/list returns valid XML with publisher ID 12", async () => {
    const res = await app.fetch(
      new Request("http://localhost/publisher/list"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/xml");
    const text = await res.text();
    expect(text).toContain('<publisher id="12">');
    expect(text).toContain("<name>RC Rally</name>");
    expect(text).not.toContain("<?xml");
  });

  it("GET /user/game returns default times when user has no races", async () => {
    const res = await app.fetch(
      new Request(
        `http://localhost/user/game/12/7/en_US/${testUser}`,
      ),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain(`<name>${testUser}</name>`);
    expect(text).toContain("<Track1_Times>-1</Track1_Times>");
    expect(text).toContain("<Track2_Times>-1</Track2_Times>");
    expect(text).toContain("<Track3_Times>-1</Track3_Times>");
  });

  it("POST with SERVICE: Times records and updates best track times", async () => {
    const xmlTimes = `
      <races>
        <race track="1">
          <racer userid="${testUser}">
            <time>62500</time>
            <splits>
              <split>20100</split>
              <split>41200</split>
              <split>62500</split>
            </splits>
          </racer>
        </race>
        <race track="2">
          <racer userid="${testUser}">
            <time>84100</time>
            <splits>
              <split>30000</split>
              <split>55000</split>
              <split>84100</split>
            </splits>
          </racer>
        </race>
      </races>
    `;

    const res = await app.fetch(
      new Request("http://localhost/heavywater/save", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
          SERVICE: "Times",
          METHOD: "set",
        },
        body: xmlTimes,
      }),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<status>success</status>");

    // Verify times updated in user game data
    const gameRes = await app.fetch(
      new Request(
        `http://localhost/user/game/12/7/en_US/${testUser}`,
      ),
    );
    const gameText = await gameRes.text();
    expect(gameText).toContain("<Track1_Times>62500</Track1_Times>");
    expect(gameText).toContain("<Track2_Times>84100</Track2_Times>");
    expect(gameText).toContain("<Track3_Times>-1</Track3_Times>");
  });

  it("POST with SERVICE: Parts and SERVICE: Objectives records user loadout", async () => {
    const xmlParts = `
      <parts userid="${testUser}">
        <type name="Body"><id>2</id></type>
        <type name="Wheels"><id>4</id></type>
      </parts>
    `;

    const partsRes = await app.fetch(
      new Request("http://localhost/", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
          SERVICE: "Parts",
          METHOD: "set",
        },
        body: xmlParts,
      }),
    );
    expect(partsRes.status).toBe(200);

    const xmlObjectives = `
      <objectives userid="${testUser}">
        <id count="1">RedCupsOnly_T1</id>
        <id count="2">BeatPreviousTime_T1</id>
      </objectives>
    `;

    const objRes = await app.fetch(
      new Request("http://localhost/", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
          SERVICE: "Objectives",
          METHOD: "set",
        },
        body: xmlObjectives,
      }),
    );
    expect(objRes.status).toBe(200);

    // Verify user/game contains populated Parts and Objectives
    const gameRes = await app.fetch(
      new Request(
        `http://localhost/user/game/12/7/en_US/${testUser}`,
      ),
    );
    const gameText = await gameRes.text();
    expect(gameText).toContain('<type name="Body"><id>2</id></type>');
    expect(gameText).toContain('<type name="Wheels"><id>4</id></type>');
    expect(gameText).toContain('<id count="1">RedCupsOnly_T1</id>');
    expect(gameText).toContain('<id count="2">BeatPreviousTime_T1</id>');
  });

  it("GET /leaderboard returns sorted player scores", async () => {
    const res = await app.fetch(
      new Request("http://localhost/leaderboard/7/US/allTime"),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<game>RC Rally</game>");
    expect(text).toContain(`<player>${testUser}</player>`);
    expect(text).toContain("<value>62.500</value>");
  });

  it("GET /user/space and POST /user/sync return expected XML", async () => {
    const spaceRes = await app.fetch(
      new Request(
        `http://localhost/user/space/heavywater_rcrally_game/en_US/${testUser}/18`,
      ),
    );
    expect(spaceRes.status).toBe(200);
    const spaceText = await spaceRes.text();
    expect(spaceText).toContain("<status>success</status>");
    expect(spaceText).toContain(`<np_online_id>${testUser}</np_online_id>`);
    expect(spaceText).toContain('<scene id="heavywater_rcrally_game">');
    expect(spaceText).toContain('<quest id="RedCupsOnly_T1">');
    expect(spaceText).toContain("<status>completed</status>");

    const syncRes = await app.fetch(
      new Request(
        `http://localhost/user/sync/US/${testUser}`,
        {
          method: "POST",
          body: "<sync>data</sync>",
        },
      ),
    );
    expect(syncRes.status).toBe(200);
    const syncText = await syncRes.text();
    expect(syncText).toContain("<status>success</status>");
  });
});
