import GameConstruct from "./GameConstruct.js";
import Room from "./Room.js";
import { createDocument, parseDescription, stringify } from "../Modules/parser.js";
import { MessageDisplayType } from "../Modules/enums.js";
/** @import Interactable from "../Classes/Interactables/Interactable.js"; */
/** @import Exit from "./Exit.js"; */
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
	 * @param {GameEntity} container
	 */
	parseFor(player, container = this.getContainer()) {
		return parseDescription(this, container, player);
	}

	/**
	 * Gets all potential game entities in the given parsed description.
	 * @param {string} parsedDescription - The parsed description that a player will receive.
	 * @returns {string[]} A list of strings in all uppercase letters that may be referring to game entities.
	 */
	static getPotentialGameEntities(parsedDescription) {
		/** @type {Set<string>} */
		let potentialGameEntities = new Set();
		const allCapsRegex = /([A-Z]{2,}(?:[A-Z \d]+))/g;
		let match;
		while (match = allCapsRegex.exec(parsedDescription))
			potentialGameEntities.add(match[0].trim());
		return Array.from(potentialGameEntities);
	}

	/**
	 * Parses and sends the description to the given player with interactables.
	 * @param {Player} player
	 * @param {GameEntity} [container]
	 */
	async parseAndSendTo(player, container = this.getContainer()) {
		const parsedDescription = this.parseFor(player, container);
		/** @type {string[]} */
		let potentialGameEntities = [];
		/** @type {Inspectable[]} */
		let inspectableEntities = [];
		/** @type {Interactable[]} */
		let interactables = [];
		if (container instanceof Room) {
			inspectableEntities = inspectableEntities.concat(container.getOccupantsExcluding(player));
			const occupantsString = this.getGame().notificationGenerator.generateRoomOccupantsNotification(player, container);
			let defaultDropFixtureString = "";
			const defaultDropFixture = this.getGame().entityFinder.getFixture(this.getGame().settings.defaultDropFixture, container.id);
			if (defaultDropFixture) {
				defaultDropFixtureString = defaultDropFixture.description.parseFor(player, container);
				potentialGameEntities = potentialGameEntities.concat(Description.getPotentialGameEntities(defaultDropFixtureString));
			}
			defaultDropFixtureString = this.getGame().notificationGenerator.generateDefaultDropFixtureNotification(defaultDropFixtureString, defaultDropFixture, this.getGame().settings.defaultDropFixture);
			potentialGameEntities = potentialGameEntities.concat(Description.getPotentialGameEntities(parsedDescription));
			inspectableEntities = inspectableEntities.concat(this.getGame().entityFinder.getInspectableGameEntities(potentialGameEntities, container, player));
			/** @type {Exit[]} */
			const exits = [];
			for (const potentialGameEntity of potentialGameEntities)
				if (container.exits.has(potentialGameEntity)) exits.push(container.exits.get(potentialGameEntity));
			interactables = interactables.concat(await this.getGame().botContext.interactableManager.createQueueMoveActionInteractables(exits, player));
			interactables = interactables.concat(await this.getGame().botContext.interactableManager.createInspectActionInteractable(inspectableEntities, player));
			player.sendRoomDescription(container, parsedDescription, occupantsString, defaultDropFixtureString, interactables);
		}
		else {
			potentialGameEntities = potentialGameEntities.concat(Description.getPotentialGameEntities(parsedDescription));
			inspectableEntities = inspectableEntities.concat(this.getGame().entityFinder.getInspectableGameEntities(potentialGameEntities, container, player));
			interactables = interactables.concat(await this.getGame().botContext.interactableManager.createInspectActionInteractable(inspectableEntities, player));
			player.sendDescription(parsedDescription, container, this.messageDisplayType ?? MessageDisplayType.PLAIN_TEXT, interactables);
		}
	}
}