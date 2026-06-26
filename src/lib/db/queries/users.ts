import { eq } from "drizzle-orm";

import { db } from "../index.js";
import { users } from "../schema.js";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result;
}