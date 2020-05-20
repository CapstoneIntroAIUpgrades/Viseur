import { Immutable } from "src/utils";
import { Event, events } from "ts-typed-events";
import { BaseGame } from "./game/base-game";
import { IGamelogWithReverses } from "./game/gamelog";
import { IViseurGameState } from "./game/interfaces";
import { ICurrentTime } from "./time-manager";

/** The events Viseur emits */
export const ViseurEvents = events({
    /** Triggers when the game's state changes and sends the new state */
    stateChanged: new Event<Immutable<IViseurGameState>>(),

    /** Triggers when a state changes, but it is just one step in a large number of changes */
    stateChangedStep: new Event<Immutable<IViseurGameState>>(),

    /** Triggers when the timer ticks */
    timeUpdated: new Event<Immutable<ICurrentTime>>(),

    /** Triggers literally 1 second after the ready event */
    delayedReady: new Event(),

    /** Triggers when all async events are done and we are ready to being normal operations */
    ready: new Event<Readonly<{
        /** The game instance that is ready. */
        game: BaseGame;

        /** The gamelog thus far when ready. */
        gamelog: Immutable<IGamelogWithReverses>;
    }>>(),

    /** Triggered during loading of the gamelog if the gamelog is found at a remote url */
    gamelogIsRemote: new Event<Immutable<{
        /** If the gamelog is remote, the url to get it from. */
        url?: string;
    }>>(),

    /** Triggered when the gamelog has been loaded */
    gamelogLoaded: new Event<Immutable<IGamelogWithReverses>>(),

    /** Triggers when a steaming gamelog is updated in some way, probably a new delta */
    gamelogUpdated: new Event<Immutable<IGamelogWithReverses>>(),

    /**
     * Triggers when a streaming gamelog is finished streaming and will no longer change.
     * In addition a url to the finalized gamelog (with other player's non obfuscated data) will be emitted
     */
    gamelogFinalized: new Event<Immutable<{
        /** The gamelog contents. */
        gamelog: IGamelogWithReverses;

        /** A url to download the gamelog from the remote game server, */
        url: string;
    }>>(),

    // -- connection events -- \\

    /** Triggers when a connection event occurs and we have some message to send */
    connectionConnected: new Event(),

    /** Triggers when a connection event occurs and we have some message to send */
    connectionMessage: new Event<string>(),

    /** Triggers when a connection that was opened is closed, including data if it closed due to a timeout */
    connectionClosed: new Event<Immutable<{
        /** If it closed due to a client (us) timeout. */
        timedOut: boolean;
    }>>(),

    /** Triggers when a connection encounters and error, and emits that error */
    connectionError: new Event<Error>(),
});
