import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("Avalon API Endpoints", () => {
  it("POST & GET /D2O/Ticket/verify/:gameId succeeds", async () => {
    const postRes = await app.fetch(
      new Request("http://localhost/D2O/Ticket/verify/NPUR00052_00/", {
        method: "POST",
      }),
    );
    expect(postRes.status).toBe(200);
    const postBody = await postRes.json();
    expect(postBody.STATUS).toBe("SUCCESS");
    expect(postBody.result.d2oID).toBe("default_player");
    expect(postBody.result.environment).toBe("Development");

    const getRes = await app.fetch(
      new Request("http://localhost/D2O/Ticket/verify/NPUR00052_00/"),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.d2oID).toBe("default_player");
  });

  it("GET /D2O/Avalon/d2oid/:username resolves username", async () => {
    const res = await app.fetch(
      new Request("http://localhost/D2O/Avalon/d2oid/Zephyr/"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
    expect(body.result.d2oID).toBe("Zephyr");
  });

  it("PUT and POST /D2O/Avalon/metrics records telemetry", async () => {
    const putRes = await app.fetch(
      new Request("http://localhost/D2O/Avalon/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Ver: "1.0",
          ID: "Zephyr",
          Session: "Keep_Enter",
        }),
      }),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.STATUS).toBe("SUCCESS");
  });

  it("GET and PUT /D2O/Avalon/contributions manages Crystal Hunter contributions", async () => {
    const getRes = await app.fetch(
      new Request("http://localhost/D2O/Avalon/contributions"),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.Contribution).toBeDefined();

    const putRes = await app.fetch(
      new Request("http://localhost/D2O/Avalon/contributions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Contribution: {
            House: "LION",
            Amount: 50,
          },
        }),
      }),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.STATUS).toBe("SUCCESS");
    expect(putBody.result.Contribution.House).toBe("LION");
  });

  it("GET and PUT /D2O/Avalon/player/:uuid/data/HouseData", async () => {
    const testUser = "avalon_tester_1";
    const getRes = await app.fetch(
      new Request(
        `http://localhost/D2O/Avalon/player/${testUser}/data/HouseData`,
      ),
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.STATUS).toBe("SUCCESS");
    expect(getBody.result.House).toBeDefined();

    const putRes = await app.fetch(
      new Request(
        `http://localhost/D2O/Avalon/player/${testUser}/data/HouseData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            House: { DRAGON: true },
          }),
        },
      ),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.STATUS).toBe("SUCCESS");
    expect(putBody.result.House.DRAGON).toBe(true);
  });

  it("GET and PUT /D2O/Avalon/player/:uuid/data/MyAvalonKeepData and D2OData", async () => {
    const testUser = "avalon_tester_2";
    const keepPutRes = await app.fetch(
      new Request(
        `http://localhost/D2O/Avalon/player/${testUser}/data/MyAvalonKeepData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            KeepData: { ThroneRoomUnlocked: true },
          }),
        },
      ),
    );
    expect(keepPutRes.status).toBe(200);

    const d2oPutRes = await app.fetch(
      new Request(
        `http://localhost/D2O/D2OUniverse/player/${testUser}/data/D2OData`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            PersonalData: { Level: 5 },
          }),
        },
      ),
    );
    expect(d2oPutRes.status).toBe(200);
    const d2oBody = await d2oPutRes.json();
    expect(d2oBody.result.PersonalData.Level).toBe(5);
  });
});
