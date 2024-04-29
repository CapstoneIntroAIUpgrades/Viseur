import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Amazons. */
export const GameResources = createResources("Amazons", {
    // <<-- Creer-Merge: resources -->>
    earth_cracky: load("bg/earth_cracky.png"),
    earth_pebbly: load("bg/earth_pebbly.png"),
    earth_plain1: load("bg/earth_plain1.png"),
    earth_plain2: load("bg/earth_plain2.png"),
    earth_weedy: load("bg/earth_weedy.png"),
    earth_rocky: load("bg/earth_rocky.png"),
    grass_plain: load("bg/grass_plain.png"),
    grass_flipped: load("bg/grass_flipped.png"),
    valkyrie: load("valkyrie.png"),
    legionary: load("legionary.png"),
    arrow: load("arrow.png"),
    x: load("x.png")
    // <<-- /Creer-Merge: resources -->>
});
