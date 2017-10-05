import * as dateFormat from "dateformat";
import * as screenfull from "screenfull";
import partial from "src/core/partial";
import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import { Modal } from "src/core/ui/modal";
import { viseur } from "src/viseur";
import { Event, events } from "ts-typed-events";
import "./gui.scss";
import { InfoPane } from "./info-pane";
import { KEYS } from "./keys";
import "./loading-message/loading-message.scss";
import { PlaybackPane } from "./playback-pane";

/** all the GUI (DOM) elements in the Viseur */
export class GUI extends BaseElement {
    /** The wrapper for the renderer */
    public readonly rendererWrapper = this.element.find(".renderer-wrapper");

    /** The wrapper element for the game's pane */
    public readonly gamePaneWrapper = this.element.find(".game-pane-wrapper");

    /** The wrapper for the playback pane */
    private readonly playbackWrapper = this.element.find(".playback-pane-wrapper");

    /** The wrapper for the visualizer wrapper */
    private readonly visualizerWrapper = this.element.find(".visualizer-wrapper");

    /** The wrapper for the visualizer's pane */
    private readonly visualizerPaneWrapper = this.element.find(".visualizer-pane-wrapper");

    /** The info pane part of the gui */
    private readonly infoPane: InfoPane;

    /** The playback pane with controls to manipulate playback */
    private readonly playbackPane: PlaybackPane = new PlaybackPane({
        parent: this.playbackWrapper,
    });

    /** The modal [re]used to display loading and error messages */
    private readonly modal: Modal;

    /** The callback function that exits fullscreen */
    private exitFullscreenCall: () => void;

    /** All the events this GUI emits */
    // tslint:disable-next-line:member-ordering (because we need the private stuff above initialized first)
    public readonly events = events.concat(this.playbackPane.events, {
        /** Emitted when the GUI resizes */
        resized: new Event<{width: number, height: number, remainingHeight: number}>(),
    });

    /**
     * Creates a GUI to handle the user interaction(s) with html part of viseur
     * @param args the initialization args
     */
    constructor(args: IBaseElementArgs) {
        super(args);

        this.infoPane = new InfoPane({
            parent: this.element,
            gui: this,
        });

        // add the favicon
        const faviconLink = document.createElement("link");
        faviconLink.href = require("../images/favicon.ico");
        faviconLink.rel = "icon";
        faviconLink.type = "image/x-icon";
        document.head.appendChild(faviconLink);

        this.playbackPane.events.toggleFullscreen.on(() => {
            this.goFullscreen();
        });

        this.exitFullscreenCall = () => {
            screenfull.exit();
        };

        this.modal = new Modal({
            id: "main-modal",
            parent: this.element.parent(),
        });

        viseur.events.ready.on((data) => {
            this.element.addClass("gamelog-loaded");
            const date = data.gamelog.streaming
                ? "Live"
                : dateFormat(new Date(data.gamelog.epoch), "mmmm dS, yyyy, h:MM:ss:l TT Z");

            document.title = `${data.gamelog.gameName} - ${data.gamelog.gameSession} - ${date} | Viseur`;

            // HACK: resize after all transitions finish, because we can't know
            // for sure when the browser will finish css transitions in what
            // order
            setTimeout(() => {
                this.resize();
            }, 350); // after all transitions end
        });

        this.infoPane.events.resized.on((resized) => {
            this.resizeVisualizer(resized.width, resized.height);
        });

        this.infoPane.events.resizeStart.on(() => {
            this.element.addClass("resizing");
        });

        this.infoPane.events.resizeEnd.on(() => {
            this.element.removeClass("resizing");
        });

        window.addEventListener("resize", () => {
            this.resize();
        });
    }

    // Modal stuff \\

    /**
     * Displays a message in the modal
     *
     * @param {string} message to display
     * @param {function} [callback] - callback to invoke upon showing async
     */
    public modalMessage(message: string, callback?: () => void): void {
        this.modal.show(
            partial(require("./loading-message/loading-message.hbs"), { message }),
            callback,
        );
    }

    /**
     * Displays a message to the user, but as an error
     *
     * @param {string} message to display
     * @param {function} [callback] - callback to invoke upon showing async
     */
    public modalError(message: string, callback?: () => void): void {
        this.modal.show(
            partial(require("./loading-message/loading-message.hbs"), { message }).addClass("error"),
            callback,
        );
    }

    /**
     * Hides the modal
     */
    public hideModal(): void {
        this.modal.hide();
    }

    // Fullscreen \\

    /**
     * Makes the GUI, which is all the DOM stuff for the Viseur, go fullscreen
     */
    public goFullscreen(): void {
        this.element.addClass("fullscreen");

        screenfull.request();

        this.resizeVisualizer(0, 0); // top left now that we (should) be fullscreen

        KEYS.escape.up.once(this.exitFullscreenCall);
    }

    /**
     * Makes the GUI exit fullscreen
     */
    public exitFullscreen(): void {
        this.element.removeClass("fullscreen");

        KEYS.escape.up.off(this.exitFullscreenCall);
        screenfull.exit();

        setImmediate(() => { // HACK: width and height will be incorrect after going out of fullscreen, so wait a moment
            this.resize();
        });
    }

    /**
     * Checks if the GUI is fullscreen
     * @returns {boolean} true if fullscreen, false otherwise
     */
    public isFullscreen(): boolean {
        return screenfull.isFullscreen;
    }

    /**
     * Resizes the GUI, invoked when the window is resized
     */
    public resize(): void {
        this.infoPane.resize();
    }

    /**
     * Gets the template
     * @override
     * @returns the handlebars partial for the gui
     */
    protected getTemplate(): Handlebars {
        return require("./gui.hbs");
    }

    /**
     * Resizes the visualization's wrapper
     * @param {number} width the width taken away from the info pane
     * @param {number} height the height taken away from the info pane
     */
    private resizeVisualizer(width: number, height: number): void {
        let newWidth = Number(this.element.width());
        let newHeight = Number(this.element.height());
        let newTop = 0;
        let newLeft = 0;

        if (this.infoPane.getOrientation() === "horizontal") {
            newHeight -= height;

            if (this.infoPane.getSide() === "top") {
                newTop = height;
            }
        }
        else {
            newWidth -= width;

            if (this.infoPane.getSide() === "left") {
                newLeft = width;
            }
        }

        this.visualizerPaneWrapper
            .css("width", newWidth)
            .css("height", newHeight)
            .css("top", newTop)
            .css("left", newLeft);

        const playbackHeight = Number(this.playbackWrapper.height()) || 0;
        const remainingWidth = newWidth;
        let remainingHeight = newHeight - playbackHeight;

        this.visualizerWrapper
            .width(remainingWidth)
            .height(remainingHeight);

        let gamePaneHeight = 0;
        if (viseur.game && viseur.game.pane) {
            gamePaneHeight = Number(viseur.game.pane.element.outerHeight());
        }

        remainingHeight -= gamePaneHeight;

        this.rendererWrapper
            .width(remainingWidth)
            .height(remainingHeight);

        this.events.resized.emit({
            width: newWidth,
            height: newHeight,
            remainingHeight,
        });
    }
}