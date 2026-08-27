import { describe, expect, it } from "bun:test";
import app from "../src/index";
import { compressLoadout } from "../src/services/rcrally/handlers";
import { getUserData } from "../src/services/rcrally/store";

async function post(service: string, body: string) {
  return app.fetch(
    new Request("http://localhost/", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SERVICE: service,
        PRODUCT: "home-racers",
        METHOD: "set",
      },
      body,
    }),
  );
}

describe("RC Rally Communicator", () => {
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
    expect(text).not.toContain("<?xml");
  });

  it("SERVICE: Times records lap times and splits", async () => {
    const res = await post(
      "Times",
      `<races>
         <race track="1">
           <racer userid="${testUser}">
             <time>62500</time>
             <splits><split>20100</split><split>41200</split><split>62500</split></splits>
           </racer>
         </race>
         <race track="2">
           <racer userid="${testUser}"><time>84100</time></racer>
         </race>
       </races>`,
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("<status>success</status>");

    const data = await getUserData(testUser);
    expect(data.times["1"]?.time).toBe(62500);
    expect(data.times["1"]?.splits).toEqual([20100, 41200, 62500]);
    expect(data.times["2"]?.time).toBe(84100);
    expect(data.times["3"]).toBeUndefined();
  });

  it("SERVICE: Times keeps the personal best when a slower lap arrives", async () => {
    await post(
      "Times",
      `<races><race track="1"><racer userid="${testUser}">
         <time>99999</time></racer></race></races>`,
    );

    const data = await getUserData(testUser);
    expect(data.times["1"]?.time).toBe(62500);
  });

  it("SERVICE: Times still accepts a faster lap", async () => {
    await post(
      "Times",
      `<races><race track="1"><racer userid="${testUser}">
         <time>41567</time><splits><split>41567</split></splits>
       </racer></race></races>`,
    );

    const data = await getUserData(testUser);
    expect(data.times["1"]?.time).toBe(41567);
    expect(data.times["1"]?.splits).toEqual([41567]);
  });

  it("SERVICE: Parts and SERVICE: Objectives record the user's unlocks", async () => {
    await post(
      "Parts",
      `<parts userid="${testUser}">
         <type name="Body"><id>2</id></type>
         <type name="Wheels"><id>4</id></type>
       </parts>`,
    );
    await post(
      "Objectives",
      `<objectives userid="${testUser}">
         <id count="1">RedCupsOnly_T1</id>
         <id count="2">BeatPreviousTime_T1</id>
       </objectives>`,
    );

    const data = await getUserData(testUser);
    expect(data.parts.Body).toBe(2);
    expect(data.parts.Wheels).toBe(4);
    expect(data.objectives.RedCupsOnly_T1).toBe(1);
    expect(data.objectives.BeatPreviousTime_T1).toBe(2);
  });

  it("SERVICE: Loadout stores each set BitCompressor-encoded", async () => {
    const res = await post(
      "Loadout",
      `<loadouts userid="${testUser}">
         <set id="1">
           <wheels>1</wheels><chassis>3</chassis><body>2</body>
           <shocks>4</shocks><motor>5</motor><battery>6</battery><decal>7</decal>
         </set>
         <set id="2">
           <wheels>1</wheels><chassis>1</chassis><body>1</body>
           <shocks>1</shocks><motor>1</motor><battery>1</battery><decal>1</decal>
         </set>
       </loadouts>`,
    );
    expect(res.status).toBe(200);

    const data = await getUserData(testUser);
    expect(data.loadouts["1"]).toBe("ABCDEFG");
    expect(data.loadouts["2"]).toBe("AAAAAAA");
  });

  it("compressLoadout emits the client's default for an out-of-range index", () => {
    expect(compressLoadout({})).toBe("AAAAAAA");
    expect(
      compressLoadout({
        wheels: 0,
        body: -1,
        chassis: 2,
        shocks: 1,
        motor: 1,
        battery: 1,
        decal: 1,
      }),
    ).toBe("AABAAAA");
  });

  it("an unknown SERVICE is accepted without persisting anything", async () => {
    const ghost = `ghost_${Math.random().toString(36).slice(2, 8)}`;
    const res = await post(
      "SomethingElse",
      `<parts userid="${ghost}"><type name="Body"><id>2</id></type></parts>`,
    );
    expect(res.status).toBe(200);

    const data = await getUserData(ghost);
    expect(data.parts).toEqual({});
  });
});
