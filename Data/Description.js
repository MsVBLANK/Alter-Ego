import GameConstruct from "./GameConstruct.js";
import { createDocument, parseDescription, stringify } from "../Modules/parser.js";
import { MessageDisplayType } from "../Modules/enums.js";
/** @import Game from "./Game.js"; */
/** @import GameEntity from "./GameEntity.js"; */
/** @import Player from "./Player.js"; */

/**
 * @class Description
 * @classdesc Represents a game entity's description.
 * @extends GameConstruct
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/description.html
 */
export default class Description extends GameConstruct {
	/**
	 * The game entity this description belongs to.
	 * @readonly
	 * @type {GameEntity}
	 */
	#container;
	/**
	 * The text of the description as loaded from the spreadsheet.
	 * @readonly
	 * @type {string}
	 */
	text;
	/**
	 * The description's text parsed into a document.
	 * @readonly
	 * @type {Document}
	 */
	document;
	/**
	 * An array of warnings for the parsed document.
	 * @readonly
	 * @type {string[]}
	 */
	#warnings;
	/**
	 * An array of errors for the parsed document.
	 * @readonly
	 * @type {string[]}
	 */
	#errors;
	/**
     * The display type of the message to send for this description.
     * @readonly
     * @type {MessageDisplayType}
     */
    messageDisplayType;

	/**
	 * @constructor
	 * @param {string} text - The text of the description.
	 * @param {GameEntity} container - The game entity this description belongs to.
	 * @param {Game} game - The game this belongs to.
	 */
	constructor(text, container, game) {
		super(game);
		this.text = text;
		this.#container = container;
		const descriptionDocument = createDocument(text, container instanceof GameConstruct);
		this.document = descriptionDocument.document;
		this.#warnings = descriptionDocument.warnings;
		this.#errors = descriptionDocument.errors;
		this.messageDisplayType = descriptionDocument.messageDisplayType;
	}

	getContainer() {
		return this.#container;
	}

	getWarnings() {
		return this.#warnings;
	}

	getErrors() {
		return this.#errors;
	}

	toString() {
		return stringify(this.document);
	}

	/**
	 * Parses the description for the given player.
	 * @param {Player} player 
	 */
	parseFor(player) {
		return parseDescription(this, this.getContainer(), player);
	}

	/**
	 * Gets all potential game entities in the given parsed description.
	 * @param {string} parsedDescription - The parsed description that a player will receive.
	 * @returns {string[]} A list of strings in all uppercase letters that may be referring to game entities.
	 */
	static getPotentialGameEntities(parsedDescription) {
		/** @type {string[]} */
		let potentialGameEntities = [];
		const allCapsRegex = /([A-Z \d]{3,})/g;
		let match;
		while (match = allCapsRegex.exec(parsedDescription))
			potentialGameEntities.push(match[0].trim());
		return potentialGameEntities;
	}
}