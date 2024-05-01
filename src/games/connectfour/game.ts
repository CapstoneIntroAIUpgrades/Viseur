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
import { ConnectFourDelta, GameState } from "./state-interfaces";

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
    public static readonly gameName = "ConnectFour";

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
        /** Bottom most layer, for pieces. */
        game: this.createLayer(),
        /** Middle layer, for the foreground mask */
        background: this.createLayer(),
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
    //private dropped_piece : {sprite: PIXI.Sprite | undefined, to: {x: number, y: number}} 
    //    = {sprite: undefined, to: {x: 0, y: 0}};
    private board: PIXI.Sprite[][] = [];
    // private debug: PIXI.Text | undefined;
    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    private parseRepstring (rep: string): string[][] {
        let board: string[][] = [[],[],[],[],[],[]];
        rep.split(" ")[0].split("/").forEach((row, row_idx) => {
            row.split("").forEach((char) => {
                if (Number(char)) {
                    for (let i = 0; i<Number(char); i++) {
                        board[row_idx].push("");
                    }
                } else {
                    board[row_idx].push(char);
                }
            });
        });
        return board;
    }
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
            width: 9, // Change these. Probably read in the map's width
            height: 8, // and height from the initial state here.
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
        for (let row = 1; row <= 6; row++) {
            this.board.push(new Array<PIXI.Sprite>(7));
        }
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
        // Initialize your background here if need be
       
        for (let row = 1; row <= 6; row++) {
            for (let col = 1; col <= 7; col++) {
                this.resources.fg_mask.newSprite({
                    container: this.layers.background,
                    position: {x: col, y: row}
                });
            }
        }
        // this.debug = this.renderer.newPixiText(
        //     "Hello",
        //     this.layers.game,
        //     {
        //         fill: 0xFFFFFF, // white in hexademical color format
        //     },
        //     0.25,
        // );
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
        delta: Immutable<ConnectFourDelta>,
        nextDelta: Immutable<ConnectFourDelta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render-background -->>
        
        // ff/rw support. create pieces that don't exist yet, hide ones that shouldn't
        let repr = this.parseRepstring(current.repString);
        repr.forEach((row, row_i) => {
            row.forEach((piece, col_i) => {
                let sprite = this.board[row_i][col_i];
                if (sprite) {
                    sprite.visible = (repr[row_i][col_i] != "");
                    sprite.x = col_i + 1;
                    sprite.y = 6 - row_i;
                } else if (piece == "y") {
                    this.board[row_i][col_i] = this.resources.yellow_piece.newSprite({
                        container: this.layers.game,
                        position: {x: col_i + 1, y: 6 - row_i}
                    });
                } else if (piece == "r") {
                    this.board[row_i][col_i] = this.resources.red_piece.newSprite({
                        container: this.layers.game,
                        position: {x: col_i + 1, y: 6 - row_i}
                    });
                }
            });
        });
        if (delta.type == "finished") {
            // find where the piece is falling to
            let cell = {x: Number(delta.data.returned), y: 0}
            let to = {x: cell.x + 1, y: 0};
            repr.every((row, i) => {
                if (row[Number(delta.data.returned)] == "") {
                    to.y = 6 - i;
                    cell.y = i;
                    return false;
                }
                return true;
            });
            
            // add sprite for this piece if it doesn't yet exist
            let from = {x: Number(delta.data.returned)+1, y: 0};
            const piece_color = current.repString.split(" ")[1];
            if (!this.board[cell.y][cell.x]) {
                if (piece_color == "r") {
                    this.board[cell.y][cell.x] = this.resources.red_piece.newSprite({
                        container: this.layers.game,
                        position: from
                    });
                } else if (piece_color == "y") {
                    this.board[cell.y][cell.x] = this.resources.yellow_piece.newSprite({
                        container: this.layers.game,
                        position: from
                    });
                }
            }
            
            // draw sprite animation
            if (dt == 0) {
                this.board[cell.y][cell.x].visible = false;
            } else {
                this.board[cell.y][cell.x].visible = true;
                // bouncy!
                const damping = 30;
                const bounces = 3;
                this.board[cell.y][cell.x].y = 
                    (from.y - to.y) * 
                    Math.abs(Math.cos(dt * Math.PI * (bounces + 0.5))) /
                    (1 + damping * dt) +
                    to.y;
            }
            
        } else if (delta.type == "order") {
            // set pieces in final resting place
            this.board.forEach((row, row_idx) => {
                row.forEach((sprite, col_idx) => {
                    sprite.x = col_idx+1;
                    sprite.y = 6 - row_idx;
                });
            });
        }
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
        delta: Immutable<ConnectFourDelta>,
        nextDelta: Immutable<ConnectFourDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Game based on its current and next states
        // <<-- /Creer-Merge: state-updated -->>
    }
    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
