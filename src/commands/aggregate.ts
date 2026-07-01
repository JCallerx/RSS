import { fetchFeed } from "../commands.js";
import { createPost } from "../createPost.js";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds.js";
import { Table } from "drizzle-orm";

export async function agg(cmdName: string, ...args: string[]) {
    
    
    console.log("cmdName:", cmdName);
    console.log("args:", args);

    if(args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <time_between_reqs>`)
    }

    const time_between_reqs = args[0];
    console.log(`Collecting feeds every ${time_between_reqs}`)
    const duration = parseDuration(time_between_reqs);
    await scrapeFeeds().catch((err) => {
        console.error("Error scraping feeds:", err);   
    });
    const intervalId = setInterval(() => {
        scrapeFeeds().catch((err) => {
            console.error("Error scraping feeds:", err);
        });
    }, duration);
    
    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            clearInterval(intervalId);
            console.log("Stopping feed collection...");
            resolve();
        });
    }); 
}


export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();

    if (!feed) {
        console.log("No feeds to fetch");
        return;
    }

    console.log(`Fetching feed: ${feed.name} (${feed.url})`);
    const result = await fetchFeed(feed.url);

    for (const item of result.channel.item) {
        try {
            await createPost({
                title: item.title,
                url: item.link,
                description: item.description,
                publishedAt: new Date(item.pubDate),
                feedId: feed.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (e) {
            console.error(`Error creating post for feed ${feed.name}:`, e);
        }
    }

    console.log(JSON.stringify(result, null, 2));
    await markFeedFetched(feed.id);
}

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (!match) {
        throw new Error("Invalid duration format. Use formats like '10s', '5m', '2h', or '500ms'.");
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            throw new Error("Invalid time unit. Use 'ms', 's', 'm', or 'h'.");
    }
}