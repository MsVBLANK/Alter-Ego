import Interactable from "./Interactable.js";
import { InteractableType } from "../../Modules/enums.js";
import { ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * @class ButtonInteractable
 * @classdesc Represents a button message component.
 */
export default class ButtonInteractable extends Interactable {
	/**
	 * The label of the component.
	 * @readonly
	 * @type {string}
	 */
	label;
	/**
	 * The style to apply to the button.
	 * @readonly
	 * @type {ButtonStyle}
	 */
	style;
	/**
	 * The button component created from this interactable.
	 * @readonly
	 * @type {ButtonBuilder}
	 */
	component;

	/**
	 * @constructor
	 * @param {string} customId - The customId of the component.
	 * @param {string} label - The label of the component.
	 * @param {ButtonStyle} [style] - The style to apply to the button, if applicable. Defaults to Primary.
	 */
	constructor(customId, label, style = ButtonStyle.Primary) {
		super(InteractableType.BUTTON, customId);
		this.label = label;
		this.style = style;
		this.component = new ButtonBuilder().setCustomId(this.customId).setLabel(this.label).setStyle(this.style);
	}
}