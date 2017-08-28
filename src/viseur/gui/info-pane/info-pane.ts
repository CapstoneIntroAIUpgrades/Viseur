import * as $ from "jquery";
import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import { Tab, Tabular } from "src/core/ui/tabular";
import { viseur } from "src/viseur";
import { GUI } from "../gui";
import "./infoPane.scss";
import { TABS } from "./tabs";

const $document = $(document); // cache it

/** The dock-able pane that has tabs and info about the Visualizer */
export class InfoPane extends BaseElement {
    /** The GUI this InfoPane is a part of */
    private gui: GUI;

    /** The tabular that switches tabs on this info pane */
    private readonly tabular: Tabular;

    /** The main content container */
    private readonly contentElement: JQuery<HTMLElement>;

    /** The element for the re-sizer bar */
    private readonly resizerElement: JQuery<HTMLElement>;

    /** The current length of the info pane */
    private length: number;

    /** The minimum length of the info pane when it is being resized */
    private readonly minimumLength: number = 200;

    /** The current orientation of the info pane */
    private orientation: "horizontal" | "vertical" = "vertical";

    /** The current side the info pane is on */
    private side: "top" | "left" | "bottom" | "right";

    /** the possible valid sides */
    private readonly validSides = [ "top", "left", "bottom", "right" ];

    constructor(args: IBaseElementArgs & {
        gui: GUI;
    }) {
        super(args);

        this.gui = args.gui;

        this.resizerElement = this.element.find(".info-pane-resizer");
        this.contentElement = this.element.find(".info-pane-content");

        this.snapTo(viseur.settingsManager.get("info-pane-side", "right"));
        this.resize(viseur.settingsManager.get("info-pane-length", 420));

        this.resizerElement.on("mousedown", (downEvent) => {
            this.onResize(downEvent);
        });

        viseur.settingsManager.onChanged("info-pane-side", (side: string) => {
            this.snapTo(side);
        });

        this.tabular = new Tabular({
            id: "info-pane-tabular",
            parent: this.contentElement,
        });

        this.tabular.attachTabs(TABS.map<Tab>((tabClass) => this.createTab(tabClass)));
    }

    /**
     * Resizes the info pane based on position and length
     * @param {number} [newLength] the new length (in pixels) of this info pane.
     *                             If omitted the old length is used.
     *                             Value cannot be less than minimumLength.
     */
    public resize(newLength?: number): void {
        this.element.addClass("resizing");
        if (newLength) {
            this.length = Math.max(newLength, this.minimumLength);
            viseur.settingsManager.set("info-pane-length", this.length);
        }

        if (this.orientation === "horizontal") {
            this.element
                .height(this.length)
                .css("width", "");
        }
        else {
            this.element
                .width(this.length)
                .css("height", "");
        }

        let width = this.element.width();
        let height = this.element.height();

        if (this.gui.isFullscreen()) {
            width = 0;
            height = 0;
        }

        this.emit("resized", width, height);
        this.element.removeClass("resizing");
    }

    /**
     * Gets the current orientation
     * @returns {string} the current orientation
     */
    public getOrientation(): "horizontal" | "vertical" {
        return this.orientation;
    }

    /**
     * Gets the current side
     * @returns {string} the current side
     */
    public getSide(): "top" | "left" | "bottom" | "right" {
        return this.side;
    }

    protected getTemplate(): Handlebars {
        return require("./infoPane.hbs");
    }

    /**
     * Initializes a tab, from some tab data in ./tabs/
     * @param tabClass The Tab class constructor to initialize
     * @returns {Tab} the constructed tab as per defined in `tabClass`
     */
    private createTab(tabClass: typeof Tab): Tab {
        const newTab = new tabClass({
            tabular: this.tabular,
        });

        if (newTab.title === "Inspect") {
            newTab.on("highlighted", () => {
                this.tabular.setTab(newTab);
            });
        }

        return newTab;
    }

    /**
     * Snaps to a new side of the screen
     *
     * @param {string} side - the side to snap to, must be 'top', 'left', 'bottom', or 'right'
     */
    private snapTo(side: string): void {
        side = side.toLowerCase();

        if (this.validSides.indexOf(side) === -1) {
            throw new Error(`invalid side to snap to: '${side}'`);
        }

        for (const validSide of this.validSides) {
            this.element.toggleClass(`snap-${validSide}`, validSide === side);
        }

        if (side === "top" || side === "left") {
            this.contentElement.after(this.resizerElement);
        }
        else {
            this.contentElement.before(this.resizerElement);
        }

        this.side = side as any; // it's a valid side as checked above, ts can chill
        this.orientation = (side === "left" || side === "right")
            ? "vertical"
            : "horizontal";

        this.resize();
    }

    /**
     * Invoked when the user is dragging to resize this
     * @param {PIXI.Event} downEvent - the event generated from dragging the info pane
     */
    private onResize(downEvent: JQuery.Event<HTMLElement, null>): void {
        let x = downEvent.pageX;
        let y = downEvent.pageY;
        let width = Number(this.element.width());
        let height = Number(this.element.height());

        $document // cached at the top of this file
            .on("mousemove", (moveEvent) => {
                this.emit("resize-start");

                const oldX = x;
                const oldY = y;

                x = moveEvent.pageX;
                y = moveEvent.pageY;

                this.element.addClass("resizing");
                if (this.orientation === "horizontal") {
                    let dy = oldY - y;
                    if (this.side === "top") {
                        dy = -dy;
                    }

                    if (dy !== 0) {
                        height += dy;
                        this.resize(height);
                    }
                }
                else {
                    let dx = oldX - x;
                    if (this.side === "left") {
                        dx = -dx;
                    }

                    if (dx !== 0) {
                        width += dx;
                        this.resize(width);
                    }
                }
            })
            .on("mouseup", () => {
                this.element.removeClass("resizing");
                this.emit("resize-end");
                $document.off("mousemove mouseup");
            });
    }
}
