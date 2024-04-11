/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

// These are the interfaces for all the states in this game
import {
    BaseGame,
    BaseGameObject,
    BasePlayer,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import {
    GameObjectInstance,
    GameSpecificDelta,
} from "src/viseur/game/base-delta";

// -- Game State Interfaces -- \\
/**
 * Take turns moving your Amazons and blocking tiles.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The number of tiles on the board along the y (vertical) axis.
     *
     */
    cols: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * A string describing all of the information necessary to fully represent
     * the game's state.
     *
     */
    repString: string;

    /**
     * The number of cells on the board along the x (horizontal) axis.
     *
     */
    rows: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;
}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 *
 */
export interface GameObjectState extends BaseGameObject {
    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     *
     */
    gameObjectName: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     *
     */
    id: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     *
     */
    logs: string[];
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The name of the player.
     *
     */
    name: string;

    /**
     * The color (side) of this player. Either 'Q' or 'q', with the 'Q' player
     * having the first move.
     *
     */
    piece: "Q" | "q";

    /**
     * The reason why the player lost the game.
     *
     */
    reasonLost: string;

    /**
     * The reason why the player won the game.
     *
     */
    reasonWon: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     *
     */
    timeRemaining: number;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'GameObject' ran their 'log' function.
 *
 */
export type GameObjectLogRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<GameObjectState>;

            /** The name of the function of the caller to run. */
            functionName: "log";

            /**
             * The arguments to GameObject.log,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * A string to add to this GameObject's log. Intended for
                 * debugging.
                 *
                 */
                message: string;
            };
        };

        /**
         * This run delta does not return a value.
         *
         */
        returned: void;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'makeMove' function.
 *
 */
export type AIMakeMoveFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "makeMove";

            /**
             * The arguments to AI.makeMove,
             * as a positional array of arguments send to the AI.
             */
            args: {};
        };

        /**
         * A move that the AI wants to make. Format varies based on sub-game
         *
         */
        returned: string;
    };
};

/** All the possible specific deltas in Amazons. */
export type AmazonsSpecificDelta =
    | GameObjectLogRanDelta
    | AIMakeMoveFinishedDelta;

/** The possible delta objects in Amazons. */
export type AmazonsDelta = GameSpecificDelta<AmazonsSpecificDelta>;
