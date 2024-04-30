import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in tictactoe. */
export const GameResources = createResources("UltimateTicTacToe", {
    // <<-- Creer-Merge: resources -->>
    tile: load("tile-white.png"),
    x: load("x.png"),
    o: load("o.png"),
    border: load("border.png"),
    // <<-- /Creer-Merge: resources -->>
});
