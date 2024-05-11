import { readFile } from "fs/promises";

export class ConfigReader {
    static async get(type: NodeType): Promise<Config> {
        if (/[\\\/\.]/.test(type.toString())) {
            throw new RangeError("Config type must not contain directory traversal sequences.")
        }

        console.debug(`Reading ${type} configuration.`);

        const file = await readFile(`./config/config.${type}.json`, 'utf8');
        return JSON.parse(file);
    }
}