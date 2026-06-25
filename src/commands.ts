import { readConfig, setUser } from "./config.js";
import { db } from "./lib/db/index.js";
import { users } from "./lib/db/schema.js";
import { createUser, getUser } from "./lib/db/queries/users.js";

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