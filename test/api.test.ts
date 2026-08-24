import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("EmoRay API Endpoints", () => {
  const getUniqueUuid = () =>
    `test_player_${Math.random().toString(36).slice(2, 10)}`;

  it("Health check returns ok", async () => {
    const res = await app.fetch(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("NP Ticket validation succeeds with mock text and returns expected schema", async () => {
    const res = await app.fetch(
      new Request("http://localhost/D2O/Ticket/validate/NPUR00052_00/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "dummy_ticket_data",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
    expect(body.result).toBeDefined();
    expect(body.result.d2oID).toBeDefined();
    expect(body.result.environment).toBe("Development");
  });

  it("POST & GET /D2O/Ticket/validate/:gameId succeeds", async () => {
    const getRes = await app.fetch(
      new Request("http://localhost/D2O/Ticket/validate/NPUR00052_00/"),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.d2oID).toBeDefined();
    expect(getBody.result.environment).toBe("Development");
  });

  it("NP Ticket validation extracts username from valid binary ticket", async () => {
    const ticketBuf = Buffer.alloc(220);
    // Version 3.0 (0x3100)
    ticketBuf.writeUInt16BE(0x3100, 0x00);
    // Serial at 0x10
    ticketBuf.write("TEST-SERIAL-0001", 0x10, "utf8");
    // Issuer at 0x28
    ticketBuf.writeUInt32BE(1001, 0x28);
    // Account ID at 0x48
    ticketBuf.writeBigUInt64BE(1234567890n, 0x48);
    // Username at 0x54..0x74
    ticketBuf.write("ThisIsSparta", 0x54, "utf8");
    // Region at 0x78
    ticketBuf.write("eu", 0x78, "utf8");
    // Domain at 0x80
    ticketBuf.write("np", 0x80, "utf8");
    // Service ID at 0x88
    ticketBuf.write("NPUR00052_00", 0x88, "utf8");

    const formData = new FormData();
    formData.append(
      "base64-ticket",
      new Blob([ticketBuf], { type: "application/octet-stream" }),
      "ticket.bin",
    );

    const res = await app.fetch(
      new Request("http://localhost/D2O/Ticket/validate/NPUR00052_00/", {
        method: "POST",
        body: formData,
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
    expect(body.result.d2oID).toBe("ThisIsSparta");
  });

  it("Metrics submission succeeds", async () => {
    const testUuid = getUniqueUuid();
    const metricsPayload = {
      Ver: "1.0",
      ID: testUuid,
      Garage: { Event: "Enter" },
      Game: { Event: "Start", Time: 120 },
      EpisodeChapterStats: {
        Episode_01: {
          Story: {
            Chapters: [
              {
                "Chapter Time": 105,
                "Bears Killed": { Regular: 12, Bomb: 3 },
              },
            ],
          },
        },
      },
    };

    const res = await app.fetch(
      new Request("http://localhost/D2O/EmoRay/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metricsPayload),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
  });

  it("Get and Set ProgressionData (including trailing slash)", async () => {
    const testUuid = getUniqueUuid();
    // 1. GET default progression data
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ProgressionData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.ProgressData).toBeDefined();
    expect(getBody.result.ProgressData.Prologue.Unlocked).toBe(true);

    // 2. PUT updated progression data (with trailing slash & query param ?prod=1)
    const updated = JSON.parse(JSON.stringify(getBody.result));
    updated.ProgressData.Episode_01.Unlocked = true;

    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ProgressionData/?prod=1`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.STATUS).toBe("SUCCESS");
    expect(putBody.result.ProgressData.Episode_01.Unlocked).toBe(true);

    // 3. GET again to verify persistence
    const verifyRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ProgressionData`,
      ),
    );
    const verifyBody = await verifyRes.json();
    expect(verifyBody.result.ProgressData.Episode_01.Unlocked).toBe(true);
  });

  it("Get and Set EquippedData", async () => {
    const testUuid = getUniqueUuid();
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/EquippedData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.Equipped.MiniGun).toBe(false);

    // Update equipped
    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/EquippedData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Equipped: {
              CowCatcher: true,
              MiniGun: true,
              Cannon: false,
              SonicWeapon: false,
              MissileLauncher: false,
              Decal: "BlackFlames",
              Engine: "Engine1",
            },
          }),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.result.Equipped.MiniGun).toBe(true);
    expect(putBody.result.Equipped.Decal).toBe("BlackFlames");
  });

  it("Get and Set ScoresData", async () => {
    const testUuid = getUniqueUuid();
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ScoresData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.Scores.Episode01.EpisodeScore).toBe(0);

    // Update score
    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ScoresData/?prod=1`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Scores: {
              Episode01: {
                EpisodeScore: 15400,
                Story: {
                  Chapter01: 5200,
                  Chapter02: 4800,
                  Chapter03: 5400,
                  Chapter04: 0,
                },
                Mission: { Chapter01: 0, Chapter02: 0, Chapter03: 0 },
              },
            },
          }),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.result.Scores.Episode01.EpisodeScore).toBe(15400);
  });

  it("Get and Set ControllerData", async () => {
    const testUuid = getUniqueUuid();
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ControllerData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.Config["1stCamInvY"]).toBe(true);

    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/ControllerData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Config: {
              EnglishOverride: false,
              "1stCamInvX": true,
              "1stCamInvY": false,
              "3rdCamInvX": true,
              "3rdCamInvY": false,
              SensitivityX: 3,
              SensitivityY: 3,
            },
          }),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.result.Config.SensitivityX).toBe(3);
    expect(putBody.result.Config["1stCamInvY"]).toBe(false);
  });

  it("Get and Set StoreProgressData", async () => {
    const testUuid = getUniqueUuid();
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/StoreProgressData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.StoreProgress.ModPoints.Owned).toBe(0);

    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/EmoRay/player/${testUuid}/data/StoreProgressData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            StoreProgress: {
              ModPoints: { Owned: 500, Spent: 150 },
              Weapons: {
                MiniGun: { CurrentTier: 1, AvailableTier: 2, MaxTier: 3 },
              },
            },
          }),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.result.StoreProgress.ModPoints.Owned).toBe(500);
    expect(putBody.result.StoreProgress.Weapons.MiniGun.CurrentTier).toBe(1);
  });

  it("GET /D2O/EmoRay/scores/ returns global leaderboard", async () => {
    const res = await app.fetch(
      new Request(
        "http://localhost/D2O/EmoRay/scores/?range=weekly&limit=10&prod=1",
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
    expect(Array.isArray(body.result.Scores)).toBe(true);
  });
});
