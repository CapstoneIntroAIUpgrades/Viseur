import { Chance } from "chance";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { Viseur } from "src/viseur";
import { Renderer } from "src/viseur/renderer";
import { CheckBoxSetting, ColorSetting, SettingsManager } from "src/viseur/settings";
import { BaseGameObject, IBaseGameObjectState } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { IBasePlayer } from "./base-player";
import { GameOverScreen } from "./game-over-screen";
import { IDeltaReason, IGamelog } from "./gamelog";
import { IBaseGameState, IGameLayers, IGameNamespace } from "./interfaces";
import { IState, StateObject } from "./state-object";

/** The base class all games in the games/ folder inherit from */
export class BaseGame extends StateObject {
    /** The name of the game, should be overridden by sub classes */
    public static readonly gameName: string = "Base Game";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = 2;

    /** The current state of the game (dt = 0) */
    public current: IBaseGameState;

    /** The next state of the game (dt = 1) */
    public next: IBaseGameState;

    /** The reason for the current state */
    public currentReason: IDeltaReason;

    /** The reason for the next state */
    public nextReason: IDeltaReason;

    /** All the game objects in the game, indexed by their ID */
    public readonly gameObjects: {[id: string]: BaseGameObject} = {};

    /** The players in the game */
    public readonly players: BaseGameObject[] = [];

    /** The human player, if there is one, in this game */
    public readonly humanPlayer: BaseHumanPlayer;

    /** The pane that displays information about this game */
    public pane: BasePane;

    /** The renderer that provides utility rendering functions (as well as heavy lifting for screen changes) */
    public readonly renderer: Renderer;

    /** The settings for this game */
    public readonly settingsManager: SettingsManager;

    /** The namespace this game is in */
    public readonly namespace: IGameNamespace;

    /** The random number generator we use */
    public readonly chance: Chance.Chance;

    public layers: IGameLayers;

    /** the order in which to add layers, with 0 being the bottom and 1 being the top */
    protected layerOrder = [ "background", "game", "ui" ];

    /** If this game has a human player interacting with it, then this is their player id */
    private readonly humanPlayerID?: string;

    /** The game over screen that displays over the game graphics at the end of rendering */
    private readonly gameOverScreen: GameOverScreen;

    /** The default player colors, there must be one for each player */
    private readonly defaultPlayerColors = [ Color("#C33"), Color("#33C") ];

    /** If the game has started or not (basically has everything async loaded) */
    private started: boolean = false;

    /** The name of the game */
    public get name(): string {
        // because inheriting games will override their static game name,
        // we'll get the top level class constructor's static game name here
        return (this.constructor as any).gameName;
    }

    /**
     * Initializes the BaseGame, should be invoked by a Game super class
     * @param {Object} gamelog the gamelog for this game, may be a streaming gamelog
     * @param {string} [playerID] the player id of the human player, if there is one
     */
    constructor(gamelog?: IGamelog, playerID?: string) {
        super();

        this.renderer = Viseur.instance.renderer;
        this.settingsManager = new SettingsManager(this.name);

        this.chance = new Chance(gamelog
            ? gamelog.randomSeed
            : "",
        );

        Viseur.instance.events.ready.on(() => {
            this.start();
        });

        Viseur.instance.events.stateChanged.on((state) => {
            this.update(state.game, state.nextGame, state.reason, state.nextReason);
        });

        this.createLayers();

        this.humanPlayerID = playerID;
        if (this.humanPlayerID) {
            this.humanPlayer = new this.namespace.HumanPlayer(this);
        }

        this.gameOverScreen = new GameOverScreen({
            parent: Viseur.instance.gui.rendererWrapper,
            game: this,
        });

        // inject player color settings
        const settings = this.namespace.settings;
        for (let i = this.numberOfPlayers; i >= 0; i--) { // iterate in reverse order
            settings.unshift(new ColorSetting({
                id: `player-color-${i}`,
                label: "Player " + i + " Color",
                hint: "Overrides the color for Player " + i,
                value: this.getPlayersColor(i),
            }));
        }

        settings.unshift(new CheckBoxSetting({
            id: "custom-player-colors",
            label: "Custom Player Colors",
            hint: "Use your custom player colors defined below.",
            value: true,
        }));
    }

    /**
     * Gets the current color for a given player, including setting overrides
     * @param player the player to get the color for, can be the class instance, state, or its id
     * @returns that players color
     */
    public getPlayersColor(player: BaseGameObject | IBaseGameObjectState | string | number): Color {
        let index = -1;
        if (typeof(player) === "number") {
            // no need to look up the player index, as they passed the player index
            index = player;
        }
        else {
            const id = typeof(player) === "object"
                ? player.id
                : player;

            const playerInstance = this.gameObjects[id];

            if (playerInstance.gameObjectName !== "Player") {
                throw new Error(`${playerInstance} is not a player to get a color for!`);
            }

            // we can safely assume now this is a player, so it's safe to assume it has this member
            index = ((playerInstance as any) as IBasePlayer).playersIndex;
        }

        if (this.settingsManager.get("custom-player-colors")) {
            return Color(
                this.settingsManager.get(`player-color-${index}`),
            );
        }

        return this.defaultPlayerColors[index];
    }

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     * @param {Object} current the current (most) game state, will be this.next if this.current is null
     * @param {Object} next the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason the reason for the current delta
     * @param {DeltaReason} nextReason the reason for the next delta
     */
    public update(
        current?: IState,
        next?: IState,
        reason?: IDeltaReason,
        nextReason?: IDeltaReason,
    ): void {
        if (!this.started) {
            return;
        }

        this.gameOverScreen.hide();

        const gameObjects = this.next.gameObjects || this.current.gameObjects;

        // initialize new game objects we have not seen yet
        const newGameObjects = new Set<BaseGameObject>();
        for (const id of Object.keys(gameObjects)) {
            if (!this.gameObjects[id]) {
                newGameObjects.add(this.createGameObject(id, gameObjects[id]));
            }
        }

        // save the reasons for the current and next deltas
        this.currentReason = this.hookupGameObjectReferences(reason);
        this.nextReason = this.hookupGameObjectReferences(nextReason);

        // update all the game objects now (including those we may have just created)
        for (const id of Object.keys(this.gameObjects)) {
            this.gameObjects[id].update(
                this.current ? this.current.gameObjects[id] : undefined,
                this.next ? this.next.gameObjects[id] : undefined,
                reason,
                nextReason,
            );
        }

        // now they are all updated, so tell them that they are all updated
        for (const id of Object.keys(this.gameObjects)) {
            const gameObject = this.gameObjects[id];
            gameObject.stateUpdated(
                gameObject.current || gameObject.next,
                gameObject.next || gameObject.current,
                this.currentReason,
                this.nextReason,
            );

            if (newGameObjects.has(gameObject)) {
                gameObject.recolor();
            }
        }

        if (this.pane) {
            this.pane.update(this.current || this.next);
        }

        // intended to be overridden so we are calling it
        this.stateUpdated(
            this.current || this.next,
            this.next || this.current,
            this.currentReason,
            this.nextReason,
        );
    }

    /**
     * Called at approx 60/sec to render the game, and all the game objects within it
     * @param {number} index the index of the state to render
     * @param {number} dt - the tweening between the index state and the next to render
     */
    public render(index: number, dt: number): void {
        if (!this.started) {
            return;
        }

        const current = this.current || this.next;
        const next = this.next || this.current;

        this.renderBackground(dt, current, next);

        for (const id of Object.keys(this.gameObjects)) {
            const gameObject = this.gameObjects[id];

            // game objects "exist" to be rendered if the have a next or current state,
            // they will not exist if players go back in time to before the game object was created
            const exists = (current && current.gameObjects.hasOwnProperty(id))
                        || (next && next.gameObjects.hasOwnProperty(id));

            if (gameObject.container) {
                // if it does not exist, no not render them, otherwise do, and later we'll call their render()
                gameObject.container.visible = exists;
            }

            // game objects by default do not render, as many are invisible
            // so check to make sure it exists and we should render it before
            // waste resources rendering that game object
            if (exists && gameObject.shouldRender()) {
                gameObject.render(
                    dt,
                    gameObject.current || gameObject.next,
                    gameObject.next || gameObject.current,
                    this.currentReason || this.nextReason,
                    this.nextReason || this.currentReason,
                );
            }
        }
    }

    /**
     * Called once to initialize any PIXI objects needed to render the background
     *
     * @private
     */
    protected createBackground(): void {
        // method exposed for inheriting classes
    }

    /**
     * renders the static background
     * @param {Number} dt a floating point number [0, 1) which represents how
     *                    far into the next turn that current turn we are
     *                    rendering is at
     * @param {Object} current the current (most) game state, will be this.next
     *                         if this.current is null
     * @param {Object} next the next (most) game state, will be this.current if
     *                      this.next is null
     */
    protected renderBackground(dt: number, current: IBaseGameState, next: IBaseGameState): void {
        // method exposed for inheriting classes
    }

    /**
     * Starts the game, basically like init, but after other stuff is ready
     * (like loading textures).
     */
    private start(): void {
        this.started = true;

        const state = Viseur.instance.getCurrentState();

        this.update(state.game, state.nextGame, state.reason, state.nextReason);

        this.createBackground();

        this.pane = new this.namespace.Pane(this, this.next);
        this.pane.update(this.current || this.next);

        if (this.humanPlayer && this.humanPlayerID) {
            this.humanPlayer.setPlayer(this.gameObjects[this.humanPlayerID]);
            this.pane.setHumanPlayer(this.humanPlayerID);
        }

        const recolor = () => this.recolor();
        // attach callbacks to recolor whenever a color setting changes
        this.settingsManager.onChanged("custom-player-colors", recolor);
        for (let i = 0; i < this.numberOfPlayers; i++) { // iterate in reverse order
            this.settingsManager.onChanged("player-color-" + i, recolor);
        }
    }

    /**
     * Initializes layers based on _layerNames
     *
     * @private
     * @param {Array.<string>} layerNames - list of layer names to initialize a layer for
     */
    private createLayers(): void {
        for (const layerName of this.layerOrder) {
            const container = new PIXI.Container();
            container.name = layerName;
            container.setParent(this.renderer.gameContainer);

            // layers has no index method, but whatever
            (this.layers as any)[layerName] = container;
        }
    }

    /**
     * find game object references, and hooks them up in an object
     * @param {Object} obj - object to search through and clone, hooking up game object references
     * @returns {Object} a new object, with no game object references
     */
    private hookupGameObjectReferences(obj: any): any {
        if (typeof(obj) !== "object" || !obj) {
            return obj;
        }

        if (typeof(obj) === "object" && Object.hasOwnProperty.call(obj, "id")) { // it's a game object reference
            return this.gameObjects[obj.id];
        }

        const cloned: any = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = this.hookupGameObjectReferences(obj[key]);
        }

        return cloned;
    }

    /**
     * initializes a new game object with the given id
     * @param {string} id - the id of the game object to initialize
     * @param {Object} state - the initial state of the new game object
     * @returns {BaseGameObject} the newly created game object
     */
    private createGameObject(id: string, state: IBaseGameObjectState): BaseGameObject {
        const classConstructor = this.namespace.gameObjectClasses[state.gameObjectName];

        if (!classConstructor) {
            throw new Error(`Could not create instance of ${state.gameObjectName}`);
        }

        const newGameObject = new classConstructor(state, this);

        newGameObject.on("inspect", () => {
            this.emit("inspect", newGameObject);
        });

        this.gameObjects[id] = newGameObject;

        if (state.gameObjectName === "Player") {
            // it's a player instance, no easy way to cast that here as there is
            // no BasePlayer class, only the compile time interface
            this.players[(newGameObject as any).playersIndex] = newGameObject;
        }

        return newGameObject;
    }

    /**
     * Invoked when a player color changes, so all game objects have an opportunity to recolor themselves
     */
    private recolor(): void {
        for (const id of Object.keys(this.gameObjects)) {
            this.gameObjects[id].recolor();
        }

        this.pane.recolor();
        this.gameOverScreen.recolor();
    }
}
