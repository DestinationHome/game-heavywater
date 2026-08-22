import type { RcRallyUserData } from "./types";
import { toArray, num } from "./utils";

type XmlNode = Record<string, unknown>;

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

      let u = userMap.get(user);
      if (!u) {
        u = { times: {}, parts: {}, objectives: {} };
        userMap.set(user, u);
      }

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

  let u = userMap.get(user);
  if (!u) {
    u = { times: {}, parts: {}, objectives: {} };
    userMap.set(user, u);
  }

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

  let u = userMap.get(user);
  if (!u) {
    u = { times: {}, parts: {}, objectives: {} };
    userMap.set(user, u);
  }

  for (const idNode of toArray(o?.id)) {
    const isObj = idNode !== null && typeof idNode === "object";
    const idObj = idNode as XmlNode;
    const key = String(isObj ? (idObj["#text"] ?? "") : idNode);
    if (key) u.objectives[key] = num(isObj ? (idObj["@_count"] ?? 1) : 1);
  }
}
