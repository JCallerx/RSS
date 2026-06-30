import { and, eq } from "drizzle-orm";

import { db } from "../index.js";
import { feedFollows } from "../schema.js";

export async function deleteFeedFollow(userId: string, feedId: string) {
  const [deletedFollow] = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)))
    .returning();

  return deletedFollow;
}