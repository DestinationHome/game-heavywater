import { eq } from "drizzle-orm";
import { db, rcrallyUsers } from "../../db";
import type { RcRallyUserData } from "./types";

export async function getUserData(username: string): Promise<RcRallyUserData> {
  const record = await db
    .select()
    .from(rcrallyUsers)
    .where(eq(rcrallyUsers.username, username))
    .get();

  if (record) {
    return {
      times: record.times ? JSON.parse(record.times) : {},
      parts: record.parts ? JSON.parse(record.parts) : {},
      objectives: record.objectives ? JSON.parse(record.objectives) : {},
    };
  }

  return {
    times: {},
    parts: {},
    objectives: {},
  };
}

export async function saveUserData(
  username: string,
  data: RcRallyUserData,
): Promise<void> {
  const now = Date.now();
  const existing = await db
    .select({ username: rcrallyUsers.username })
    .from(rcrallyUsers)
    .where(eq(rcrallyUsers.username, username))
    .get();

  if (existing) {
    await db
      .update(rcrallyUsers)
      .set({
        times: JSON.stringify(data.times),
        parts: JSON.stringify(data.parts),
        objectives: JSON.stringify(data.objectives),
        updatedAt: now,
      })
      .where(eq(rcrallyUsers.username, username));
  } else {
    await db.insert(rcrallyUsers).values({
      username,
      times: JSON.stringify(data.times),
      parts: JSON.stringify(data.parts),
      objectives: JSON.stringify(data.objectives),
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getAllUsers(): Promise<Record<string, RcRallyUserData>> {
  const records = await db.select().from(rcrallyUsers).all();
  const result: Record<string, RcRallyUserData> = {};

  for (const record of records) {
    result[record.username] = {
      times: record.times ? JSON.parse(record.times) : {},
      parts: record.parts ? JSON.parse(record.parts) : {},
      objectives: record.objectives ? JSON.parse(record.objectives) : {},
    };
  }

  return result;
}
