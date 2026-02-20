import Interactable from "./Interactable.ts";
import { InteractableType } from "../../Modules/enums.js";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import type ActionDirective from "../ActionDirective.ts";

/**
 * @class ButtonInteractable
 * @classdesc Represents a button message component.
 */
export default class ButtonInteractable extends Interactable {
	/**
	 * The label of the component.
	 * @readonly
	 */
	label: string;
	/**
	 * The style to apply to the button.
	 * @readonly
	 */
	style: ButtonStyle;
	/**
	 * The button component created from this interactable.
	 * @readonly
	 */
	component: ButtonBuilder;

	/**
	 * @constructor
	 * @param actionDirective - The action directive of the interactable.
	 * @param label - The label of the component.
	 * @param style - The style to apply to the button, if applicable. Defaults to Primary.
	 * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components. Defaults to 0 (highest priority).
	 */
	constructor(actionDirective: ActionDirective, label: string, style = ButtonStyle.Primary, priority = 0) {
		super(InteractableType.BUTTON, actionDirective, priority);
		this.label = label;
		this.style = style;
		this.component = new ButtonBuilder().setCustomId(this.customId).setLabel(this.label).setStyle(this.style);
	}

	/** 
	 * Sets the interactable as disabled.
	 */
	disable() {
		this.component.setDisabled(true);
	}
}