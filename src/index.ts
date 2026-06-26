import { addFeed, CommandsRegistry, fetchFeed, getUsers, handlerListFeeds, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand } from "./commands.js";
import { readConfig, setUser } from "./config.js";
import { agg } from "./commands/aggregate.js";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", getUsers);
  registerCommand(registry, "agg", agg);
  registerCommand(registry, "addfeed", addFeed)
  registerCommand(registry, "feeds", handlerListFeeds)
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