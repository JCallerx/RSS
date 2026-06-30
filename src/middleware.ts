import { User } from "./commands.js";
import { readConfig } from "./config.js";
import { getUser } from "./lib/db/queries/users.js";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler) {
  return async function wrappedHandler(cmdName: string, ...args: string[]) {
    const config = readConfig();
    const user = await getUser(config.currentUserName);
    if(!user) {
        throw new Error(`User ${config.currentUserName} was not found`)
    }
  await handler(cmdName, user, ...args)
  }
}