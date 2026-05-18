import ActionDirectiveInteractable from "./ActionDirectiveInteractable.ts";
import { InteractableType } from "../../Modules/enums.js";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import type ActionDirective from "../ActionDirective.ts";

/**
 * Represents a button message component.
 */
export default class ButtonInteractable extends ActionDirectiveInteractable {
	/**
	 * The label of the component.
	 */
    readonly label: string;
	/**
	 * The style to apply to the button.
	 */
    readonly style: ButtonStyle;
	/**
	 * The button component created from this interactable.
	 */
    readonly component: ButtonBuilder;
    static readonly LABEL_CHARACTER_LIMIT = 80;

	/**
	 * @param actionDirective - The action directive of the interactable.
	 * @param label - The label of the component.
	 * @param style - The style to apply to the button, if applicable. Defaults to Primary.
	 * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components. Defaults to 0 (highest priority).
     * @param respondWithModal - Whether to respond to an interaction with a modal. Defaults to false.
	 */
	constructor(actionDirective: ActionDirective, label: string, style = ButtonStyle.Primary, priority = 0, respondWithModal = false) {
		super(InteractableType.BUTTON, actionDirective, priority, respondWithModal);
		this.label = label?.substring(0, ButtonInteractable.LABEL_CHARACTER_LIMIT);
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
