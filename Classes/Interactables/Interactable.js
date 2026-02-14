import { InteractableType } from "../../Modules/enums.js";
/**
 * @import ActionDirective from "../ActionDirective.ts";
 */

/**
 * @class Interactable
 * @classdesc Represents an interactive message component.
 */
export default class Interactable {
	/**
	 * The type of interactive message component to create.
	 * @readonly
	 * @type {InteractableType} */
	type;
	/**
	 * The action directive for this interactable.
	 * @readonly
	 * @type {ActionDirective}
	 */
	actionDirective;
	/**
	 * The customId of the component.
	 * @readonly
	 * @type {string}
	 */
	customId;
	/**
	 * The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
	 * @readonly
	 * @type {number}
	 */
	priority;

	/**
	 * @constructor
	 * @param {InteractableType} type - The type of interactive message component to create.
	 * @param {ActionDirective} actionDirective - The action directive for this interactable.
	 * @param {number} priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
	 */
	constructor(type, actionDirective, priority) {
		this.type = type;
		this.actionDirective = actionDirective;
		this.customId = actionDirective.customId;
		this.priority = priority;
	}

	/** 
	 * Sets the interactable as disabled.
	 * @abstract
	 */
	disable() {}
}