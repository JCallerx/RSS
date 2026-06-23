import os from "os";
import path from "path";
import fs from "fs";

export type Config = {
    dbUrl: string;
    currentUserName: string
}


function getConfigFilePath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, ".gatorconfig.json");
}


function validateConfig(raw: any): Config {
    if(!raw.db_url || typeof raw.db_url !== "string"){
        throw new Error("Database URL required")
    }
    return {
        dbUrl: raw.db_url,
        currentUserName: raw.current_user_name ?? "",
    };
}


export function readConfig() {
        const filepath = getConfigFilePath();
        const data = fs.readFileSync(filepath, "utf-8")
        const raw = JSON.parse(data);
        return validateConfig(raw);
}

function writeConfig(cfg: Config): void {
        const filepath = getConfigFilePath();
        const raw = {
            db_url: cfg.dbUrl,
            current_user_name: cfg.currentUserName,
        }
        const data = JSON.stringify(raw, null, 2);
        fs.writeFileSync(filepath, data, { encoding: "utf-8"});
}


export function setUser(username:string) {
    const cfg = readConfig();
    cfg.currentUserName = username
    writeConfig(cfg);
}