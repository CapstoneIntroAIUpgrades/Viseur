// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import * as Color from "color";
import { ease, Immutable } from "src/utils";
import { BaseGame } from "src/viseur/game";
import { RendererSize } from "src/viseur/renderer";
import { GameObjectClasses } from "./game-object-classes";
import { HumanPlayer } from "./human-player";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { AmazonsDelta, GameState } from "./state-interfaces";

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
    public static readonly gameName = "Amazons";

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
        Color('white'), // Player 0
        Color('white'), // Player 1
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
    private init_repstring = "3q2q3/10/10/q8q/10/10/Q8Q/10/10/3Q2Q3 Q";
    private valkyries: PIXI.Sprite[] = new Array<PIXI.Sprite>(4);
    private legionaries: PIXI.Sprite[] = new Array<PIXI.Sprite>(4);
    private arrow: PIXI.Sprite = new PIXI.Sprite();
    private Xs: PIXI.Sprite[] = new Array<PIXI.Sprite>();
    // private debug: PIXI.Text | undefined;
    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    private pieceAt(row: number, col: number): {type: "valk" | "leej" | "none" | "X", idx: number} {
        let piece: {type: "valk" | "leej" | "none" | "X", idx: number} = {type: "none", idx: 0}
        this.valkyries.forEach((valk, idx) => {
            if ( Math.abs(valk.x - col) < 0.1 && Math.abs(valk.y - row) < 0.1 ) {piece = {type: "valk", idx: idx};}
        });
        this.legionaries.forEach((leej, idx) => {
            if ( Math.abs(leej.x - col) < 0.1 && Math.abs(leej.y - row) < 0.1 ) {piece = {type: "leej", idx: idx};}
        });
        this.Xs.forEach((x, idx) => {
            if ( Math.abs(x.x - col) < 0.1 && Math.abs(x.y - row) < 0.1 ) {piece = {type: "X", idx: idx};}
        });
        return piece;
    }

    private pieceList(repString: string): {type: string, x: number, y: number}[] {
        let pieces: {type: string, x: number, y: number}[] = [];
        let repr = repString.length > 0 ? repString : this.init_repstring;
        
        repr.split(' ')[0].split('/').forEach( (rank, row_num) => {
            let col = 0;
            rank.split('').every((char, i) => {
                if (char == 'Q') {
                    pieces.push({
                        type: "valk", 
                        x: col,
                        y: row_num
                    });
                    col++;
                } else if ( char == 'q') {
                    pieces.push({
                        type: "leej", 
                        x: col,
                        y: row_num
                    });
                    col++;
                } else if ( char == 'X') {
                    pieces.push({
                        type: "X",
                        x: col,
                        y: row_num
                    });
                    col++;
                } else if (Number(char)) {
                    // this logic is dumb and only works cuz the board isn't more than 10 wide
                    if (char == '1' && rank[i+1] == '0') {
                        return false;
                    } else {
                        col += Number(char);
                    }
                } else {
                    col++;
                }
                return true;
            });
        });
        return pieces;
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
            width: 12, // Change these. Probably read in the map's width
            height: 12, // and height from the initial state here.
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
        let pieces = this.pieceList(state.repString);
        let valks = pieces.filter((p) => {return p.type == "valk";});
        let leejs = pieces.filter((p) => {return p.type == "leej";});
        for (let i = 0; i < valks.length; i++) {
            this.valkyries[i] = this.resources.valkyrie.newSprite({
                container: this.layers.game,
                position: {x: valks[i].x + 1, y: 10 - valks[i].y},
                anchor: {x: 0.175, y: 0.4}
            });
            this.valkyries[i].scale.x *= 1.5;
            this.valkyries[i].scale.y *= 1.5;
        }
        for (let i = 0; i < leejs.length; i++) {
            this.legionaries[i] = this.resources.legionary.newSprite({
                container: this.layers.game,
                position: {x: leejs[i].x + 1, y: 10 - leejs[i].y},
                anchor: {x: 0.175, y: 0.4}
            });
            this.legionaries[i].scale.y *= 1.5;
            this.legionaries[i].scale.x *= 1.5;
        }
        this.arrow = this.resources.arrow.newSprite({
            container: this.layers.game,
            position: {x: 0, y: 0},
            visible: false,
            anchor: 0.5
        });
        this.arrow.scale.x *= 0.5;
        this.arrow.scale.y *= 0.5;
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

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                let tile;
                if (j % 2 == i % 2) {
                    let grass_options = [
                        this.resources.grass_plain,
                        this.resources.grass_flipped
                    ];
                    let rnd = Math.floor(Math.random() * grass_options.length);
                    tile = grass_options[rnd];
                } else {
                    let earth_options = [
                        this.resources.earth_cracky,
                        this.resources.earth_pebbly,
                        this.resources.earth_plain1,
                        this.resources.earth_plain2,
                        this.resources.earth_weedy,
                        this.resources.earth_rocky
                    ];
                    let rnd = Math.floor(Math.random() * earth_options.length);
                    tile = earth_options[rnd];
                }
                tile?.newSprite({
                    container: this.layers.background,
                    position: {x: i + 1, y: j + 1},
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
        delta: Immutable<AmazonsDelta>,
        nextDelta: Immutable<AmazonsDelta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render-background -->>
        
        let move: number[] = [];
        let from: {x: number, y: number} = {x: 0, y: 0};
        let to: {x: number, y: number} = {x: 0, y: 0};
        let x_pos: {x: number, y: number} = {x: 0, y: 0};
        if (delta.type == "finished") {
            for (let i = 0; i < delta.data.returned.length; ) {
                if ("abcdefghij".indexOf(delta.data.returned[i]) > -1) {
                    move.push("abcdefghij".indexOf(delta.data.returned[i]));
                    i++;
                } else {
                    let row = 0;
                    while (!Number.isNaN(Number(delta.data.returned[i])) && i < delta.data.returned.length) {
                        row *= 10;
                        row += Number(delta.data.returned[i]);
                        i++;
                    }
                    move.push(row - 1);
                }
            }
            // the game logic primarily deals with screen coordinates
            // the move data deals with board coords. converts here
            from = {x: move[0] + 1, y: 10 - move[1]};
            to = {x: move[2] + 1, y: 10 - move[3]};
            x_pos = {x: move[4] + 1, y: 10 - move[5]};
        }
        let pieces = this.pieceList(current.repString);
        let valks = pieces.filter((p) => {return p.type == "valk";});
        let leejs = pieces.filter((p) => {return p.type == "leej";});
        let Xs = pieces.filter((p) => {return p.type == "X";});
        valks.forEach((valk, idx) => {
            if (delta.type == "finished" && (valk.x + 1) == from.x && (valk.y + 1) == from.y) {
                // if (this.debug) {
                //     this.debug.text = "valk move: " + JSON.stringify(move) + " | " + current.repString;
                // }
                this.valkyries[idx].x = ease(from.x, to.x, Math.min(dt*2,1));
                this.valkyries[idx].y = ease(from.y, to.y, Math.min(dt*2,1));
            } else {
                this.valkyries[idx].x = valk.x + 1;
                this.valkyries[idx].y = valk.y + 1;
            }
        });
        leejs.forEach((leej, idx) => {
            if (delta.type == "finished" && (leej.x + 1) == from.x && (leej.y + 1) == from.y) {
                // if (this.debug) {
                //     this.debug.text = "leej move: " + JSON.stringify(move) + " | " + current.repString;
                // }
                this.legionaries[idx].x = ease(from.x, to.x, Math.min(dt*2,1));
                this.legionaries[idx].y = ease(from.y, to.y, Math.min(dt*2,1));
            } else {
                this.legionaries[idx].x = 1 + leej.x;
                this.legionaries[idx].y = 1 + leej.y;
            }
        });
        Xs.forEach((X, idx) => {
            if (idx < this.Xs.length) {
                this.Xs[idx].x = X.x + 1;
                this.Xs[idx].y = X.y + 1;
                this.Xs[idx].visible = true;
            } else {
                this.Xs.push(this.resources.x.newSprite({
                    container: this.layers.game,
                    position: {x: X.x + 1, y: 1 + X.y},
                    visible: true
                }));
            }
        });
        if (this.Xs.length > Xs.length) {
            for (let i = Xs.length; i < this.Xs.length; i++) {
                this.Xs[i].visible = false;
            }
        }
        if (delta.type == "finished") {
            if (dt > 0.5) {
                this.arrow.visible = true;
                this.arrow.rotation = Math.atan2((x_pos.y - to.y), (x_pos.x - to.x));
                this.arrow.x = ease( to.x+0.5, x_pos.x+0.5, (dt-0.5) * 2);
                this.arrow.y = ease( to.y+0.5, x_pos.y+0.5, (dt-0.5) * 2); 
            }
            if (dt > 0.9) {
                if (this.pieceAt(x_pos.y, x_pos.x).type != "X") {
                    this.Xs.push(this.resources.x.newSprite({
                        container: this.layers.game,
                        position: {x: x_pos.x, y: x_pos.y},
                        visible: true
                    }));
                } else {
                    this.Xs[this.pieceAt(x_pos.y, x_pos.x).idx].visible = true;
                }
            }
        } else {
            this.arrow.visible = false;
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
        delta: Immutable<AmazonsDelta>,
        nextDelta: Immutable<AmazonsDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
       
        // <<-- /Creer-Merge: state-updated -->>
    }
    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
