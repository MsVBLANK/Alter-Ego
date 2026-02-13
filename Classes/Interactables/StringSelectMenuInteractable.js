import Interactable from "./Interactable.js";
import StringSelectMenuOptionInteractable from "./StringSelectMenuOptionInteractable.js";
import { InteractableType } from "../../Modules/enums.js";
import { StringSelectMenuBuilder } from "discord.js";
/**
 * @import ActionDirective from "../ActionDirective.ts";
 */

/**
 * @class StringSelectMenuInteractable
 * @classdesc Represents a string select menu message component.
 */
export default class StringSelectMenuInteractable extends Interactable {
	/**
	 * An array of options. Maximum size is 25.
	 * @readonly
	 * @type {StringSelectMenuOptionInteractable[]}
	 */
	options;
	/**
	 * The placeholder to apply for the string select menu.
	 * @readonly
	 * @type {string}
	 */
	placeholder;
	/**
	 * The string select menu component created from this interactable.
	 * @readonly
	 * @type {StringSelectMenuBuilder}
	 */
	component;

	/**
	 * @constructor
	 * @param {ActionDirective} actionDirective - The action directive of the interactable.
	 * @param {StringSelectMenuOptionInteractable[]} options - An array of options. Maximum size is 25.
	 * @param {string} [placeholder] - The placeholder to apply for the string select menu. Optional.
	 */
	constructor(actionDirective, options, placeholder) {
		super(InteractableType.STRING_SELECT_MENU, actionDirective);
		this.options = [];
		for (let i = 0; i < options.length && i < 25; i++)
			this.options.push(options[i]);
		this.options = options;
		this.placeholder = placeholder;
		this.component = new StringSelectMenuBuilder().setCustomId(this.customId).setOptions(this.options);
		if (this.placeholder) this.component.setPlaceholder(this.placeholder);
	}

	/** 
	 * Sets the interactable as disabled.
	 */
	disable() {
		this.component.setDisabled(true);
	}
}