import { addFeed, browse, CommandsRegistry, fetchFeed, follow, following, getUsers, handlerListFeeds, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand, unfollow } from "./commands.js";
import { agg } from "./commands/aggregate.js";
import { middlewareLoggedIn } from "./middleware.js";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", getUsers);
  registerCommand(registry, "agg", agg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(addFeed))
  registerCommand(registry, "feeds", handlerListFeeds)
  registerCommand(registry, "follow", middlewareLoggedIn(follow))
  registerCommand(registry, "following", middlewareLoggedIn(following))
  registerCommand(registry, "unfollow", middlewareLoggedIn(unfollow));
  registerCommand(registry, "browse", middlewareLoggedIn(browse));
  const userArgs = process.argv.slice(2);

  if(userArgs.length < 1) {
    console.log("At least one argument is needed")
    process.exit(1);
  }

  const [cmdName, ...args] = userArgs;

  await runCommand(registry, cmdName, ...args);

  process.exit(0);

}

main();