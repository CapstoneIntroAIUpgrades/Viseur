import { mapValues } from "lodash";
import * as configJson from "src/../config.json";
import { isObject, JsonObject } from "src/utils";

const defaults = {
    game: "", // no default game
    humanName: "",
    arenaServer: "",
    gameServer: "",
    tournamentServer: "",
    port: 0,
    session: "",
};

if (!isObject(configJson) || !isObject(configJson.default)) {
    throw new Error("config.json malformed!");
}

const config = configJson.default as JsonObject; // webpack emits as default export, but TS gets mad about that

/** The default config. */
export const Config = mapValues(
    defaults,
    (val, key) =>
        typeof config[key] === typeof val ? (config[key] as typeof val) : val, // config is wrong type, use the default
) as typeof defaults;
