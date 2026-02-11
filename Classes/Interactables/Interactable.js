import { InteractableType } from "../../Modules/enums.js";

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
	 * The customId of the component.
	 * @readonly
	 * @type {string}
	 */
	customId;

	/**
	 * @constructor
	 * @param {InteractableType} type - The type of interactive message component to create.
	 * @param {string} customId - The customId of the component.
	 */
	constructor(type, customId) {
		this.type = type;
		this.customId = customId;
	}
}