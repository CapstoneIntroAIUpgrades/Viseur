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
    private moving_sprite: {type: "valk" | "leej" | "none" | "X", idx: number, to: {x: number, y: number}} = {type: "none", idx: 0, to: {x: 0, y: 0}};
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
        let col = 0;
        let pieces: {type: string, x: number, y: number}[] = [];
        let repr = repString.length > 0 ? repString : this.init_repstring;
        
        repr.split(' ')[0].split('/').forEach( (rank, row_num) => {
            rank.split('').every((char, i) => {
                if (char == 'q') {
                    pieces.push({
                        type: "valk", 
                        x: col,
                        y: row_num
                    });
                    col++;
                } else if ( char == 'Q') {
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
                        col = 0;
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
                position: {x: valks[i].x + 1, y: valks[i].y + 1},
                anchor: {x: 0.175, y: 0.4}
            });
            this.valkyries[i].scale.x *= 1.5;
            this.valkyries[i].scale.y *= 1.5;
        }
        for (let i = 0; i < leejs.length; i++) {
            this.legionaries[i] = this.resources.legionary.newSprite({
                container: this.layers.game,
                position: {x: leejs[i].x + 1, y: leejs[i].y + 1},
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

        // this shows you how to render text that scales to the game
        // NOTE: height of 1 means 1 "unit", so probably 1 tile in height
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
        if (delta.type == "finished") {
            let move = delta.data.returned.split(" ").map((x) => Number(x));
            let from = {x: move[1] + 1, y: move[0] + 1};
            let to = {x: move[3] + 1, y: move[2] + 1};
            
            let moving_sprite = {...this.pieceAt(from.y, from.x), to: to};
            // because the sprite can move, keep a static reference to the sprite in question
            if (moving_sprite.type == "none" || moving_sprite.type == "X") {
                moving_sprite = this.moving_sprite;
            } else {
                this.moving_sprite = moving_sprite;
            }

            // it is vitally important that this be done after moving_sprite
            let x_pos = {x: move[5] + 1, y: move[4] + 1};
            
            if (this.pieceAt(x_pos.y, x_pos.x).type != "X") {
                this.Xs.push(this.resources.x.newSprite({
                    container: this.layers.game,
                    position: {x: x_pos.x, y: x_pos.y},
                    visible: false
                }));
            }
            // error: moving other player's piece
            if (moving_sprite.type != ["valk", "leej"][Number(delta.data.player.id)]) {
                return;
            }
            if (dt < 0.5) {
                let piece: PIXI.Sprite | undefined;
                if ( moving_sprite.type == "valk" ) {
                    piece = this.valkyries[moving_sprite.idx];
                } else if ( moving_sprite.type == "leej" ) {
                    piece = this.legionaries[moving_sprite.idx];
                }
                if ( piece ) {
                    piece.x = ease(from.x, to.x, dt*2);
                    piece.y = ease(from.y, to.y, dt*2);
                }
            } else if (dt > 0.5 && dt < 0.95) {
                this.arrow.visible = true;
                this.arrow.rotation = Math.atan2((x_pos.y - to.y), (x_pos.x - to.x));
                this.arrow.x = ease( to.x+0.5, x_pos.x+0.5, (dt-0.5) * 2);
                this.arrow.y = ease( to.y+0.5, x_pos.y+0.5, (dt-0.5) * 2);        
            } else {
                this.arrow.visible = false;
                this.Xs[this.pieceAt(x_pos.y, x_pos.x).idx].visible = true;
            }
        } else if (delta.type == "order") {
            // variable framerate messes with state
            // thankfully each "finished" delta is followed by and "order"
            if (this.Xs.length > 0) {
                this.Xs[this.Xs.length - 1].visible = true;
            }
            if (this.moving_sprite.type != "none") {
                let sprite = (
                    this.moving_sprite.type == "valk" ? 
                    this.valkyries : 
                    this.legionaries
                )[this.moving_sprite.idx];
                sprite.x = this.moving_sprite.to.x;
                sprite.y = this.moving_sprite.to.y;
            }
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
