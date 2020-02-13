// Do not modify this file
// This is a simple lookup object for each GameObject class
import { IGameObjectClasses } from "src/viseur/game/interfaces";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Tile } from "./tile";
import { Unit } from "./unit";

/** All the non Game classes in this game */
export const GameObjectClasses: Readonly<IGameObjectClasses> = Object.freeze({
    GameObject,
    Player,
    Tile,
    Unit,
    Job,
});
