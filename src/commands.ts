import { setUser } from "./config.js";
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
    console.log("user has successfully created")
}