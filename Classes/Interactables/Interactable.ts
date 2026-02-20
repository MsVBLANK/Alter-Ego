import type { InteractableType } from "../../Modules/enums.js";
import type ActionDirective from "../ActionDirective.ts";

/**
 * @class Interactable
 * @classdesc Represents an interactive message component.
 */
export default abstract class Interactable {
	/**
	 * The type of interactive message component to create.
     */
    readonly type: InteractableType;
	/**
	 * The action directive for this interactable.
	 * @type {ActionDirective}
	 */
    readonly actionDirective: ActionDirective;
	/**
	 * The customId of the component.
	 */
    readonly customId: string;
	/**
	 * The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
	 */
    readonly priority: number;

	/**
	 * @constructor
	 * @param type - The type of interactive message component to create.
	 * @param actionDirective - The action directive for this interactable.
	 * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
	 */
    protected constructor(type: InteractableType, actionDirective: ActionDirective, priority: number) {
		this.type = type;
		this.actionDirective = actionDirective;
		this.customId = actionDirective.customId;
		this.priority = priority;
	}

	/**
	 * Sets the interactable as disabled.
	 */
	abstract disable(): void;
}
