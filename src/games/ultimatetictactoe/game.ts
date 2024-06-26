// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import * as Color from "color";
import { Immutable } from "src/utils";
import { BaseGame } from "src/viseur/game";
import { RendererSize } from "src/viseur/renderer";
import { GameObjectClasses } from "./game-object-classes";
import { HumanPlayer } from "./human-player";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { GameState, UltimateTicTacToeDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Game extends BaseGame {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The static name of this game. */
    public static readonly gameName = "UltimateTicTacToe";

    /**
     * The number of players in this game.
     * The players array should be this same size.
     */
    public static readonly numberOfPlayers = 2;

    /** The current state of the Game (dt = 0). */
    public current: GameState | undefined;

    /** The next state of the Game (dt = 1). */
    public next: GameState | undefined;

    /** The resource factories that can create sprites for this game. */
    public readonly resources = GameResources;

    /** The human player playing this game. */
    public readonly humanPlayer: HumanPlayer | undefined;

    /**
     * The default player colors for this game,
     * there must be one for each player.
     */
    public readonly defaultPlayerColors: [Color, Color] = [
        // <<-- Creer-Merge: default-player-colors -->>
        this.defaultPlayerColors[0], // Player 0
        this.defaultPlayerColors[1], // Player 1
        // <<-- /Creer-Merge: default-player-colors -->>
    ];

    /** The custom settings for this game. */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game. */
    public readonly layers = this.createLayers({
        // <<-- Creer-Merge: layers -->>
        /** Bottom most layer, for background elements. */
        background: this.createLayer(),
        /** Middle layer, for moving game objects. */
        game: this.createLayer(),
        /** Top layer, for UI elements above the game. */
        ui: this.createLayer(),
        // <<-- /Creer-Merge: layers -->>
    });

    /**
     * Mapping of the class names to their class for all
     * sub game object classes.
     */
    public readonly gameObjectClasses = GameObjectClasses;

    // <<-- Creer-Merge: variables -->>
    private Xs: PIXI.Sprite[] = new Array<PIXI.Sprite>(81);
    private Os: PIXI.Sprite[] = new Array<PIXI.Sprite>(81);
    private borders: PIXI.Sprite[] = new Array<PIXI.Sprite>(9);
    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invoked when the first game state is ready to setup the size of the
     * renderer.
     *
     * @param state - The initialize state of the game.
     * @returns The {height, width} you for the game's size.
     */
    protected getSize(state: GameState): RendererSize {
        return {
            // <<-- Creer-Merge: get-size -->>
            width: 11, // Change these. Probably read in the map's width
            height: 11, // and height from the initial state here.
            // <<-- /Creer-Merge: get-size -->>
        };
    }

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize your state variables that rely on
     * game data.
     *
     * @param state - The initialize state of the game.
     */
    protected start(state: GameState): void {
        super.start(state);

        // <<-- Creer-Merge: start -->>
        // Initialize your variables here
        // <<-- /Creer-Merge: start -->>
    }

    /**
     * Initializes the background. It is drawn once automatically after this
     * step.
     *
     * @param state - The initial state to use the render the background.
     */
    protected createBackground(state: GameState): void {
        super.createBackground(state);

        // <<-- Creer-Merge: create-background -->>
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.resources.tile.newSprite({
                    container: this.layers.background,
                    visible: true,
                    position: { x: i + 1, y: j + 1 },
                });
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.borders[9 * j + i] = this.resources.border.newSprite({
                    container: this.layers.ui,
                    visible: true,
                    position: { x: 3 * i + 1, y: 3 * j + 1 },
                    relativeScale: 3,
                    tint: 0x000000,
                });
            }
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.Xs[9 * col + row] = this.resources.x.newSprite({
                    container: this.layers.game,
                    visible: false,
                    position: { x: row + 1, y: col + 1 },
                    tint: this.defaultPlayerColors[0],
                });
            }
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.Os[9 * col + row] = this.resources.o.newSprite({
                    container: this.layers.game,
                    visible: false,
                    position: { x: row + 1, y: col + 1 },
                    tint: this.defaultPlayerColors[1],
                });
            }
        }
        // <<-- /Creer-Merge: create-background -->>
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     *
     * @param dt - A floating point number [0, 1) which represents how far
     * into the next turn to render at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    protected renderBackground(
        dt: number,
        current: Immutable<GameState>,
        next: Immutable<GameState>,
        delta: Immutable<UltimateTicTacToeDelta>,
        nextDelta: Immutable<UltimateTicTacToeDelta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render-background -->>

        // <<-- /Creer-Merge: render-background -->>
    }

    /**
     * Invoked when the game state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    protected stateUpdated(
        current: Immutable<GameState>,
        next: Immutable<GameState>,
        delta: Immutable<UltimateTicTacToeDelta>,
        nextDelta: Immutable<UltimateTicTacToeDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        const row_reprs = current.repString.split(" ")[0].split("/");

        row_reprs.forEach((val: string, ind: number) => {
            let offset = 0;
            [...val].forEach((char: string, index: number) => {
                if (char == "x") {
                    this.Xs[9 * ind + index + offset].visible = true;
                    this.Os[9 * ind + index + offset].visible = false;
                } else if (char == "o") {
                    this.Os[9 * ind + index + offset].visible = true;
                    this.Xs[9 * ind + index + offset].visible = false;
                } else {
                    for (let i = 0; i < Number(char); i++) {
                        this.Os[9 * ind + index + i + offset].visible = false;
                        this.Xs[9 * ind + index + i + offset].visible = false;
                    }
                    offset += Number(char) - 1;
                }
            });
        });

        this.borders.forEach((sprite, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;

            const gameStatus = this.isSubGameOver(row, col);
            if (gameStatus === "x") {
                sprite.tint = this.defaultPlayerColors[0].rgbNumber();
            } else if (gameStatus === "o") {
                sprite.tint = this.defaultPlayerColors[1].rgbNumber();
            }
        });

        // <<-- /Creer-Merge: state-updated -->>
    }
    // <<-- Creer-Merge: protected-private-functions -->>
    protected isSubGameOver(
        subGameRow: number,
        subGameCol: number,
    ): "x" | "o" | false {
        const subGameStartIndex = 9 * (3 * subGameRow) + 3 * subGameCol;

        const toCheck: [number, number][] = [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2],
        ];

        let xWin = true;
        let oWin = true;

        for (const coord of toCheck) {
            if (!this.Xs[9 * coord[0] + coord[1] + subGameStartIndex].visible)
                xWin = false;
            if (!this.Os[9 * coord[0] + coord[1] + subGameStartIndex].visible)
                oWin = false;
        }

        if (xWin) {
            return "x";
        } else if (oWin) {
            return "o";
        } else return false;
    }
    // <<-- /Creer-Merge: protected-private-functions -->>
}
