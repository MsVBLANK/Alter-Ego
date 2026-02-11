import Interactable from "./Interactable.js";
import StringSelectMenuOptionInteractable from "./StringSelectMenuOptionInteractable.js";
import { InteractableType } from "../../Modules/enums.js";
import { StringSelectMenuBuilder } from "discord.js";

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
	 * @param {string} customId - The customId of the component.
	 * @param {StringSelectMenuOptionInteractable[]} options - An array of options. Maximum size is 25.
	 * @param {string} [placeholder] - The placeholder to apply for the string select menu. Optional.
	 */
	constructor(customId, options, placeholder) {
		super(InteractableType.STRING_SELECT_MENU, customId);
		this.options = [];
		for (let i = 0; i < options.length && i < 25; i++)
			this.options.push(options[i]);
		this.options = options;
		this.placeholder = placeholder;
		this.component = new StringSelectMenuBuilder().setOptions(this.options);
		if (this.placeholder) this.component.setPlaceholder(this.placeholder);
	}
}