import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import * as inputs from "src/core/ui/inputs";
import { viseur } from "src/viseur";
import { IGamelog } from "src/viseur/game/gamelog";
import { KEYS } from "../keys";
import "./playbackPane.scss";

/**
 * handles all the playback controls and logic for the GUI
 */
export class PlaybackPane extends BaseElement {
    /** The number of deltas in the gamelog */
    private numberOfDeltas: number;

    /** If all the inputs are disabled */
    private disabled: boolean = false;

    /** element displaying the current playback time */
    private readonly playbackTimeCurrentElement: JQuery<HTMLElement>;

    /** element displaying the max playback time */
    private readonly playbackTimeMaxElement: JQuery<HTMLElement>;

    /** the top container for buttons */
    private readonly topContainerElement: JQuery<HTMLElement>;

    /** the bottom left container for buttons */
    private readonly bottomLeftContainerElement: JQuery<HTMLElement>;

    /** the bottom right container for buttons */
    private readonly bottomRightContainerElement: JQuery<HTMLElement>;

    /** Handy collection of all our inputs */
    private readonly inputs: inputs.BaseInput[];

    // Our Inputs \\

    /** The Element */
    private readonly playbackSlider: inputs.Slider;

    /** The Element */
    private readonly playPauseButton: inputs.Button;

    /** The Element */
    private readonly backButton: inputs.Button;

    /** The Element */
    private readonly nextButton: inputs.Button;

    /** The Element */
    private readonly deltasButton: inputs.Button;

    /** The Element */
    private readonly turnsButton: inputs.Button;

    /** The Element */
    private readonly speedSlider: inputs.Slider;

    /** The Element */
    private readonly fullscreenButton: inputs.Button;

    constructor(args: IBaseElementArgs) {
        super(args);

        this.element.addClass("collapsed");

        this.playbackTimeCurrentElement = this.element.find(".playback-time-current");
        this.playbackTimeMaxElement = this.element.find(".playback-time-max");

        this.topContainerElement = this.element.find(".playback-pane-top"),
        this.bottomLeftContainerElement = this.element.find(".playback-pane-bottom-left"),
        this.bottomRightContainerElement = this.element.find(".playback-pane-bottom-right"),

        this.playbackSlider = new inputs.Slider({
            id: "playback-slider",
            parent: this.topContainerElement,
        });
        this.playbackSlider.on("changed", (value: number) => {
            this.emit("playback-slide", value);
        });

        // play or pause \\
        this.playPauseButton = new inputs.Button({
            id: "play-pause-button",
            parent: this.bottomLeftContainerElement,
        });
        this.playPauseButton.on("clicked", () => {
            this.emit("play-pause");
        });

        KEYS.space.up.on(() => { // space bar up, hence the ' => '
            this.playPauseButton.click();
        });

        // back \\
        this.backButton = new inputs.Button({
            id: "back-button",
            parent: this.bottomLeftContainerElement,
        });
        this.backButton.on("clicked", () => {
            this.emit("back");
        });
        KEYS.leftArrow.up.on(() => {
            this.backButton.click();
        });

        // next \\
        this.nextButton = new inputs.Button({
            id: "next-button",
            parent: this.bottomLeftContainerElement,
        });
        this.nextButton.on("clicked", () => {
            this.emit("next");
        });
        KEYS.rightArrow.up.on(() => {
            this.nextButton.click();
        });

        // deltas and turns mode \\
        this.deltasButton = new inputs.Button({
            id: "deltas-button",
            parent: this.bottomRightContainerElement,
        });
        this.deltasButton.on("clicked", () => {
            if (viseur.settingsManager.get("playback-mode") !== "deltas") {
                viseur.settingsManager.set("playback-mode", "deltas");
            }
        });
        this.turnsButton = new inputs.Button({
            id: "turns-button",
            parent: this.bottomRightContainerElement,
        });
        this.turnsButton.on("clicked", () => {
            if (viseur.settingsManager.get("playback-mode") !== "turns") {
                viseur.settingsManager.set("playback-mode", "turns");
            }
        });

        // speed \\
        this.speedSlider = new inputs.Slider({
            id: "speed-slider",
            parent: this.bottomRightContainerElement,
        });
        this.updateSpeedSlider();
        this.speedSlider.on("changed", (value: number) => {
            this.changePlaybackSpeed(value);
        });

        this.fullscreenButton = new inputs.Button({
            id: "fullscreen-button",
            parent: this.bottomRightContainerElement,
        });
        this.fullscreenButton.on("clicked", () => {
            this.emit("fullscreen-enabled");
        });

        this.inputs = [
            this.playbackSlider,
            this.playPauseButton,
            this.backButton,
            this.nextButton,
            this.deltasButton,
            this.turnsButton,
            this.speedSlider,
            this.fullscreenButton,
        ];

        this.disable();

        viseur.events.ready.once((data) => {
            this.viseurReady(data.gamelog);
        });

        viseur.events.gamelogUpdated.on((gamelog: IGamelog) => {
            this.updatePlaybackSlider(gamelog);
        });

        viseur.events.gamelogFinalized.on(() => {
            this.enable();
        });

        viseur.timeManager.on("playing", () => {
            this.element.addClass("playing");
        });

        viseur.timeManager.on("paused", () => {
            this.element.removeClass("playing");
        });

        viseur.events.timeUpdated.on((data) => {
            this.timeUpdated(data.index, data.dt);
        });

        viseur.settingsManager.onChanged("playback-speed", (value: number) => {
            this.updateSpeedSlider(value);
        });

        viseur.settingsManager.onChanged("playback-mode", (value: number) => {
            this.updatePlaybackMode(String(value));
        });

        this.updatePlaybackMode(viseur.settingsManager.get("playback-mode"));
    }

    protected getTemplate(): Handlebars {
        return require("./playbackPane.hbs");
    }

    /**
     * Invoked when the gamelog is loaded
     *
     * @private
     * @param {Object} gamelog - the gamelog that was loaded
     */
    private viseurReady(gamelog: IGamelog): void {
        this.numberOfDeltas = gamelog.deltas.length;

        if (!gamelog.streaming) {
            this.enable();
        }
        else {
            this.speedSlider.enable(); // while streaming the gamelog only enable the speed slider
            viseur.events.gamelogFinalized.on((data) => {
                this.numberOfDeltas = data.gamelog.deltas.length;
            });
        }

        this.playbackSlider.value = 0;
        this.updatePlaybackSlider(gamelog);

        this.element.removeClass("collapsed");
    }

    /**
     * Invoked when the gamelog's number of deltas is known or changes
     * @param {Object} gamelog - the gamelog to get info from
     */
    private updatePlaybackSlider(gamelog: IGamelog): void {
        this.playbackSlider.setMax(gamelog.deltas.length - 1 / 1e10); // basically round down a bit

        this.playbackTimeMaxElement.html(String(gamelog.deltas.length - 1));
    }

    /**
     * disables the playback mode of mode not enabled
     * @param mode the current mode we are in
     */
    private updatePlaybackMode(mode: string): void {
        mode = mode.toLowerCase();
        this.turnsButton.element.toggleClass("active", mode === "turns");
        this.deltasButton.element.toggleClass("active", mode === "deltas");
    }

    /**
     * Invoked when the TimeManager's time changes, so we can update the slider and buttons
     * @param {number} index - the index that was updated to
     * @param {number} dt - the dt number [0, 1) that was updated
     */
    private timeUpdated(index: number, dt: number): void {
        this.playbackTimeCurrentElement.html(String(index));
        this.playbackSlider.value = index + dt;

        if (this.isEnabled()) {
            if (index === 0 && dt === 0) {
                this.backButton.disable();
            }
            else {
                this.backButton.enable();
            }

            if (index >= (this.numberOfDeltas - 1)) {
                this.nextButton.disable();
            }
            else {
                this.nextButton.enable();
            }
        }
    }

    // NOTE: the speed slider does not slide linearly.
    // Instead we follow y = 100x^2, with x being the slider's value,
    // and y being the actual speed

    /**
     * Converts from the speed slider's value to the actual speed for the TimeManager
     * @param {number} x - the sliders current value
     * @returns {number} y - the TimeMangers speed based on the slider value x
     */
    private speedFromSlider(x: number): number {
        const y = 100 * Math.pow(x, 2);
        return y;
    }

    /**
     * Converts from the speed of the TimeManager to the slider's value (reverse of y)
     * @param {number} y - the speed of the TimeManager
     * @returns {number} x - the speedSlider's value to represent y
     */
    private sliderFromSpeed(y: number): number {
        const x = Math.sqrt(y / 100);
        return x;
    }

    /**
     * Invoked when the speedSlider is dragged/changed.
     * @param {number} value - the new value of the playback slider, so we can set the speed based on that
     */
    private changePlaybackSpeed(value: number): void {
        const newSpeed = this.speedFromSlider(-value); // yes, invert the value with -

        viseur.settingsManager.set("playback-speed", newSpeed);
    }

    /**
     * Invoked when the playback-speed setting is changed, so we can update the slider
     * @param {number} value - the new speed value set to the SettingManager,
     *                         we will update the speedSlider according to it
     */
    private updateSpeedSlider(value?: number): void {
        const sliderValue = this.sliderFromSpeed(value || viseur.settingsManager.get("playback-speed"));
        this.speedSlider.value = -sliderValue;
    }

    /**
     * Enables all the inputs
     */
    private enable(): void {
        this.disabled = false;
        for (const input of this.inputs) {
            input.enable();
        }
    }

    /**
     * Disables all the inputs
     */
    private disable(): void {
        this.disabled = true;
        for (const input of this.inputs) {
            input.disable();
        }
    }

    /**
     * Checks if the playback pane is enabled (playback can be manipulated).
     * It should be disabled during streaming gamelogs
     * @returns {Boolean} true if enabled, false otherwise
     */
    private isEnabled(): boolean {
        return !this.disabled;
    }
}
