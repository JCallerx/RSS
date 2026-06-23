import { readConfig, setUser } from "./config.js";

function main() {
  setUser("calle");
  const data = readConfig();
  console.log(data)
}

main();