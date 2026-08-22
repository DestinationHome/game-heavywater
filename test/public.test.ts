import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("HeavyWaterPublic API Endpoints", () => {
  it("PUT & POST /D2O/HeavyWaterPublic/metrics records telemetry", async () => {
    const putRes = await app.fetch(
      new Request("http://localhost/D2O/HeavyWaterPublic/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Ver: "1.0",
          UserName: "Zephyr",
          CommercePointManager: {
            Event: "Browse",
            Location: "PinUp_Shop",
          },
          CentralManager: {
            Event: "Enter_Space",
          },
          Helicopter: {
            Event: "Ride_Start",
            Time: 120,
          },
        }),
      }),
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.STATUS).toBe("SUCCESS");
  });

  it("GET /D2O/HeavyWaterPublic/d2oid/:username resolves username", async () => {
    const res = await app.fetch(
      new Request("http://localhost/D2O/HeavyWaterPublic/d2oid/Zephyr/"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.STATUS).toBe("SUCCESS");
    expect(body.result.d2oID).toBe("Zephyr");
  });
});
