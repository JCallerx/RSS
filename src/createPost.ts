import { desc, eq } from "drizzle-orm";

import { db } from "./lib/db/index.js";
import { feedFollows, feeds, posts } from "./lib/db/schema.js";

export async function createPost(post: {
  title: string;
  url: string;
  description?: string | null;
  publishedAt: Date;
  feedId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const [result] = await db.insert(posts).values({
    title: post.title,
    url: post.url,
    description: post.description ?? null,
    publishedAt: post.publishedAt,
    feedId: post.feedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return result;
}

export async function getPostsForUser(userId: string, limit: number = 10) {
  return await db
    .select()
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}