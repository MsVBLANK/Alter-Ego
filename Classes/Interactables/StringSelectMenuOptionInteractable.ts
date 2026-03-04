import ActionDirectiveInteractable from "./ActionDirectiveInteractable.ts";
import { InteractableType } from "../../Modules/enums.js";
import { StringSelectMenuOptionBuilder } from "discord.js";
import type ActionDirective from "../ActionDirective.ts";

/**
 * @class StringSelectMenuOptionInteractable
 * @classdesc Represents a string select menu option message component.
 */
export default class StringSelectMenuOptionInteractable extends ActionDirectiveInteractable {
	/**
	 * The label of the component.
	 */
    readonly label: string;
	/**
	 * The value to apply for the string select menu option.
	 */
	value: string;
	/**
	 * The description to apply for the string select menu option.
	 */
	description: string;
	/**
	 * The string select menu option component created from this interactable.
	 */
    readonly component: StringSelectMenuOptionBuilder;

	/**
	 * @constructor
	 * @param actionDirective - The action directive of the interactable.
	 * @param label - The label of the component.
	 * @param value - The value of the component.
	 * @param description - The description of the component. Optional.
	 * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components. Defaults to 1 (second-highest priority).
     * @param respondWithModal - Whether to respond to an interaction with a modal. Defaults to false.
	 */
	constructor(actionDirective: ActionDirective, label: string, value: string, description?: string, priority: number = 1, respondWithModal = false) {
		super(InteractableType.STRING_SELECT_MENU_OPTION, actionDirective, priority, respondWithModal);
		this.label = label;
		this.value = value;
		this.description = description;
		this.component = new StringSelectMenuOptionBuilder().setValue(value);
		if (this.description) this.component.setDescription(this.description);
	}

	/**
	 * Sets the interactable as disabled.
	 */
	disable() {}
}
