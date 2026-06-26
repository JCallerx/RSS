import { db } from "../index.js";
import { feeds } from "../schema.js";



export async function createFeed(feedName: string, feedUrl: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name: feedName , url: feedUrl, userId: userId }).returning();
  return result;
}

export async function getFeeds() {
  return await db.select().from(feeds);
}