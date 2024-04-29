import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in ConnectFour. */
export const GameResources = createResources("ConnectFour", {
    // <<-- Creer-Merge: resources -->>
    yellow_piece: load("yellow.png"),
    red_piece: load("red.png"),
    fg_mask: load("mask.png")
    // <<-- /Creer-Merge: resources -->>
});
