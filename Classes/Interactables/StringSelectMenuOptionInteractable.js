import Interactable from "./Interactable.js";
import { InteractableType } from "../../Modules/enums.js";
import { StringSelectMenuOptionBuilder } from "discord.js";
/**
 * @import ActionDirective from "../ActionDirective.ts";
 */

/**
 * @class StringSelectMenuOptionInteractable
 * @classdesc Represents a string select menu option message component.
 */
export default class StringSelectMenuOptionInteractable extends Interactable{
	/**
	 * The label of the component.
	 * @readonly
	 * @type {string}
	 */
	label;
	/**
	 * The value to apply for the string select menu option.
	 * @type {string}
	 */
	value;
	/**
	 * The description to apply for the string select menu option.
	 * @type {string}
	 */
	description;
	/**
	 * The string select menu option component created from this interactable.
	 * @readonly
	 * @type {StringSelectMenuOptionBuilder}
	 */
	component;

	/**
	 * @constructor
	 * @param {ActionDirective} actionDirective - The action directive of the interactable.
	 * @param {string} label - The label of the component.
	 * @param {string} value - The value of the component.
	 * @param {string} [description] - The description of the component. Optional.
	 */
	constructor(actionDirective, label, value, description) {
		super(InteractableType.STRING_SELECT_MENU_OPTION, actionDirective);
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