import { fetchFeed } from "../commands.js";

export async function agg() {
    const result = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(result, null, 2));
}