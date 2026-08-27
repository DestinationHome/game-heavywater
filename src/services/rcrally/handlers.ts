import type { RcRallyUserData } from "./types";
import { num, toArray } from "./utils";

type XmlNode = Record<string, unknown>;

function userOf(
  userMap: Map<string, RcRallyUserData>,
  user: string,
): RcRallyUserData {
  let u = userMap.get(user);
  if (!u) {
    u = { times: {}, parts: {}, objectives: {}, loadouts: {} };
    userMap.set(user, u);
  }
  return u;
}

/**
 * SERVICE: Times
 *
 * ```xml
 * <races><race track="1">
 *   <racer userid="U"><time>123456</time>
 *     <splits><split>...</split></splits>
 *   </racer>
 * </race></races>
 * ```
 */
export function handleTimes(
  xml: XmlNode,
  userMap: Map<string, RcRallyUserData>,
): void {
  const races = (xml.races as XmlNode)?.race;
  for (const raceNode of toArray(races)) {
    const race = raceNode as XmlNode;
    const track = String(race?.["@_track"] ?? "");
    if (!track) continue;

    for (const racerNode of toArray(race?.racer)) {
      const racer = racerNode as XmlNode;
      const user = String(racer?.["@_userid"] ?? "");
      const time = num(racer?.time);
      if (!user || time <= 0) continue;

      const u = userOf(userMap, user);
      const prev = u.times[track];
      if (!prev || time < prev.time) {
        const splitsNode = racer?.splits as XmlNode | undefined;
        u.times[track] = {
          time,
          splits: toArray(splitsNode?.split).map(num),
        };
      }
    }
  }
}

/**
 * SERVICE: Parts
 *
 * ```xml
 * <parts userid="U">
 *   <type name="Body"><id>2</id></type>
 *   <type name="Wheels"><id>3</id></type>
 * </parts>
 * ```
 */
export function handleParts(
  xml: XmlNode,
  userMap: Map<string, RcRallyUserData>,
): void {
  const p = xml.parts as XmlNode | undefined;
  const user = String(p?.["@_userid"] ?? "");
  if (!user) return;

  const u = userOf(userMap, user);

  for (const typeNode of toArray(p?.type)) {
    const t = typeNode as XmlNode;
    const name = String(t?.["@_name"] ?? "");
    if (name) u.parts[name] = num(t?.id);
  }
}

/**
 * SERVICE: Objectives
 *
 * ```xml
 * <objectives userid="U">
 *   <id count="1">RedCupsOnly_T1</id>
 *   <id count="1">BeatPreviousTime_T2</id>
 * </objectives>
 * ```
 */
export function handleObjectives(
  xml: XmlNode,
  userMap: Map<string, RcRallyUserData>,
): void {
  const o = xml.objectives as XmlNode | undefined;
  const user = String(o?.["@_userid"] ?? "");
  if (!user) return;

  const u = userOf(userMap, user);

  for (const idNode of toArray(o?.id)) {
    const isObj = idNode !== null && typeof idNode === "object";
    const idObj = idNode as XmlNode;
    const key = String(isObj ? (idObj["#text"] ?? "") : idNode);
    if (key) u.objectives[key] = num(isObj ? (idObj["@_count"] ?? 1) : 1);
  }
}

const LOADOUT_SLOT_ORDER = [
  "wheels",
  "body",
  "chassis",
  "shocks",
  "motor",
  "battery",
  "decal",
] as const;

export function compressLoadout(set: XmlNode): string {
  let out = "";
  for (const slot of LOADOUT_SLOT_ORDER) {
    const index = num(set?.[slot]);
    out += index >= 1 && index <= 58 ? String.fromCharCode(index + 64) : "A";
  }
  return out;
}

/**
 * SERVICE: Loadout
 *
 * ```xml
 * <loadouts userid="U">
 *   <set id="1">
 *     <wheels>1</wheels><chassis>3</chassis><body>2</body>
 *     <shocks>1</shocks><motor>1</motor><battery>1</battery><decal>1</decal>
 *   </set>
 * </loadouts>
 * ```
 */
export function handleLoadout(
  xml: XmlNode,
  userMap: Map<string, RcRallyUserData>,
): void {
  const l = xml.loadouts as XmlNode | undefined;
  const user = String(l?.["@_userid"] ?? "");
  if (!user) return;

  const u = userOf(userMap, user);

  for (const setNode of toArray(l?.set)) {
    const set = setNode as XmlNode;
    const id = String(set?.["@_id"] ?? "");
    if (!id) continue;
    u.loadouts[id] = compressLoadout(set);
  }
}
