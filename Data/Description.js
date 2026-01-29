import GameConstruct from "./GameConstruct.js";
import { createDocument, parseDescription, stringify } from "../Modules/parser.js";
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
}