import { partial } from "src/core/partial";
import { Viseur } from "src/viseur";
import { Event, events } from "ts-typed-events";
import { BaseElement, IBaseElementArgs } from "../base-element";
import * as tabContentHbs from "./tab-content.hbs";
import * as tabHbs from "./tab.hbs";
import { Tabular } from "./tabular";

/** The interface arguments for a Tab can extend from. */
export interface ITabArgs extends IBaseElementArgs {
    /** The tabular this tab is to be a part of. */
    tabular: Tabular;

    /** The Viseur instance we are in. */
    viseur: Viseur;

    /** The title of the tab. */
    title?: string;

    /** The template for the content of this tab. */
    contentTemplate?: Handlebars;
}

/** A Tab in a Tabular. */
export class Tab extends BaseElement {
    /** The events this class emits. */
    public readonly events = events({
        /** Emitted when this tab's tab is selected. */
        selected: new Event(),
    });

    /** The clickable tab on the tabular that shows the content in the tabular. */
    public readonly tab: JQuery;

    /** The content wrapper around the element. */
    public readonly content: JQuery;

    /** The tabular this is a part of. */
    public readonly tabular: Tabular;

    /** The title of this tab. */
    public readonly title: string;

    /**
     * Creates a new Tab in a tabular.
     *
     * @param args - The arguments to send to the Tab.
     */
    constructor(args: ITabArgs) {
        super(args, tabContentHbs);

        this.tabular = args.tabular;
        this.content = partial(
            args.contentTemplate || tabContentHbs,
            args,
            this.element,
        );

        const title = args.title || "TAB_TITLE";
        this.title = title;

        this.tab = partial(tabHbs, { title });
        this.tab.on("click", () => {
            this.events.selected.emit();
        });
    }
}
