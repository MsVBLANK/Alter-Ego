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
	 * @constructor
	 * @param {InteractableType} type - The type of interactive message component to create.
	 * @param {ActionDirective} actionDirective - The action directive for this interactable.
	 */
	constructor(type, actionDirective) {
		this.type = type;
		this.actionDirective = actionDirective;
		this.customId = actionDirective.customId;
	}

	/** 
	 * Sets the interactable as disabled.
	 * @abstract
	 */
	disable() {}
}