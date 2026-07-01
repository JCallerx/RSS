import { eq, asc } from "drizzle-orm";

import { db } from "../index.js";
import { feeds } from "../schema.js";



export async function createFeed(feedName: string, feedUrl: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name: feedName, url: feedUrl, userId }).returning();
  return result;
}

export async function getFeeds() {
  return await db.select().from(feeds);
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);
  return result;
}

export async function markFeedFetched(feedId: string) {
  const [result] = await db
    .update(feeds)
    .set({
      updatedAt: new Date(),
      LastFetchedAt: new Date(),
    })
    .where(eq(feeds.id, feedId))
    .returning();

  return result;
}

export async function getNextFeedToFetch() {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(asc(feeds.LastFetchedAt))
    .limit(1);

  return result;
}