import { readConfig, setUser } from "./config.js";
import { db } from "./lib/db/index.js";
import { feeds, users } from "./lib/db/schema.js";
import { createUser, getUser, getUserById } from "./lib/db/queries/users.js";
import { getFeedByUrl, getFeeds } from "./lib/db/queries/feeds.js";
import { XMLParser } from "fast-xml-parser";
import { ne } from "drizzle-orm";
import { channel } from "node:diagnostics_channel";
import { createFeed } from "./lib/db/queries/feeds.js";
import { get } from "node:http";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedfollow.js";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("At least one argument is expected")
    }
    const user = await getUser(args[0]);

    if(!user) {
        throw new Error("User does not exist")
    }

    setUser(args[0]);
    console.log("User has been set")
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const cmd = registry[cmdName]

    if(!cmd) {
        throw new Error("Unknown command");
    }

    await cmd(cmdName, ...args);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("Please only pass one user")
    }
    const user = await createUser(args[0]);
    setUser(user.name);
    console.log("User has been successfully created")
}

export async function handlerReset() {
    await db.delete(users);
    setUser("");
    console.log("Database has been reset")
}

export async function getUsers() {
    const allUsers = await db.select().from(users);
    const currentUserName = readConfig().currentUserName;


    if (allUsers.length === 0) {
        console.log("(none)");
    } else {
        for (const user of allUsers) {
            if (currentUserName === user.name) {
                console.log(`* ${user.name} (current)`)
                continue;
            }
            console.log(`* ${user.name}`);
        }
    }

}



export async function fetchFeed(feedURL: string) {
    const request = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator"
        }
    })

    const xmlText = await request.text();

    const parser = new XMLParser({
        processEntities: false,
    })

    const parsed = parser.parse(xmlText);

    if (!parsed.rss){
        throw new Error("Rss tag missing")
    }

    if (!parsed.rss.channel) {
        throw new Error("Channel tag missing")
    }


    //type checks

    if(typeof parsed.rss.channel.title !== "string" || !parsed.rss.channel.title) {
        throw new Error("title is required and must be a string")
    }

    if(typeof parsed.rss.channel.link !== "string" || !parsed.rss.channel.link) {
        throw new Error("link is requiered and must be a string")
    }

    if(typeof parsed.rss.channel.description !== "string" || !parsed.rss.channel.description) {
        throw new Error("description is required and must be a string")
    }

    //storage

    const title = parsed.rss.channel.title
    const link = parsed.rss.channel.link
    const description = parsed.rss.channel.description

    let items: any[] = []


    if (!parsed.rss.channel.item){
        items = []
    } else if(Array.isArray(parsed.rss.channel.item)){
        items = parsed.rss.channel.item
    } else {
        items = [parsed.rss.channel.item]
    }

    const results: any[] = [];

    for (const item of items) {
        const title = item.title
        const link = item.link
        const description = item.description
        const pubDate = item.pubDate;

        if(!title || !link || !description || !pubDate) {
            continue
        }
        results.push({ title, link, description, pubDate });
    }

    return {
        channel: {
            title,
            link,
            description,
            item: results,
        }
    }
}

export async function addFeed(cmdName: string, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error("usage: addFeed <feed name> <feed url>");
    }
    const feedName = args[0];
    const feedUrl = args[1];

    const config = readConfig();
    const username = config.currentUserName;
    const currentUser = await getUser(username);

    if (!currentUser) {
        throw new Error("current user not found")
    }

    const feed = await createFeed(feedName, feedUrl, currentUser.id);
    
    if(!feed){
        throw new Error("failed to create feed")
    }

    const feedFollow = await createFeedFollow(currentUser.id, feed.id)
    console.log(feedFollow.feedName);
    console.log(feedFollow.userName);
}

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;


export function printFeed(feed: Feed, user: User) {
    console.log("Feed:")
    console.log("   Name:", feed.name);
    console.log("   URL:", feed.url);
    console.log("   ID:", feed.id);
    console.log("   Created At:", feed.createdAt);
    console.log("   Updated At:", feed.updatedAt);
    console.log("   User ID:", feed.userId);
    console.log("   Added by:", user.name);
}

export async function handlerListFeeds() {
    const allFeeds = await getFeeds();

    if (allFeeds.length === 0) {
        console.log("(none)");
        return;
    }

    for (const feed of allFeeds) {
        const creator = await getUserById(feed.userId);
        const creatorName = creator?.name ?? "(unknown)";

        console.log(`* ${feed.name}`);
        console.log(`  URL: ${feed.url}`);
        console.log(`  Added by: ${creatorName}`);
    }
}



export async function follow(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("Usage: follow <Feed URL>")
    }

    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if(!user) {
        throw new Error(`User ${config.currentUserName} was not found`)
    }

    const feed =await getFeedByUrl(args[0]);
    
    const feedFollow = await createFeedFollow(user.id, feed.id)
    console.log(feedFollow.feedName);
    console.log(feedFollow.userName)

}

export async function following(){
    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if(!user) {
        throw new Error(`User ${config.currentUserName} was not found`)
    }

    const feedsFollowed = await getFeedFollowsForUser(user.id);

    for(const feed of feedsFollowed) {
        console.log(feed.feedName)
    }

}
