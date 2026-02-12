import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.js";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.js";
import ActionDirective from "./ActionDirective.ts";
/** 
 * @import Exit from "../Data/Exit.js";
 * @import Game from "../Data/Game.js";
 * @import Fixture from "../Data/Fixture.js";
 * @import InventoryItem from "../Data/InventoryItem.js";
 * @import Player from "../Data/Player.js";
 * @import Room from "../Data/Room.js";
 * @import RoomItem from "../Data/RoomItem.js";
 * @import { Interaction, InteractionCallbackResponse } from "discord.js"
*/

/**
 * @class InteractionHandler
 * @classdesc A set of functions for handling Interactions.
 */
export default class BotInteractionHandler {
	/**
	 * The game this belongs to.
	 * @readonly
	 * @type {Game}
	 */
	#game;

	/**
	 * @constructor
	 * @param {Game} game - The game this belongs to.
	 */
	constructor(game) {
		this.#game = game;
	}

	/**
	 * Gets an interactable from the cache by the customId. If it doesn't exist, returns undefined.
	 * @param {string} customId
	 */
	getInteractable(customId) {
		return this.#game.botContext.interactableManager.getInteractableByCustomId(customId);
	}

	/**
	 * Intercepts an interaction event and directs it to the correct function.
	 * @param {Interaction} interaction - The interaction that was created.
	 */
	interceptInteraction(interaction) {
		const player = this.#game.entityFinder.getLivingPlayerById(interaction.user.id);
		if (!player) return;
		if (interaction instanceof ButtonInteraction)
			this.processButtonInteraction(interaction, player);
		if (interaction instanceof StringSelectMenuInteraction)
			this.processStringSelectMenuInteraction(interaction, player);
		return;
	}

	/**
	 * Processes a button interaction and calls the correct function.
	 * @param {ButtonInteraction} interaction - The interaction being executed.
	 * @param {Player} player - The player who triggered the interaction.
	 */
	async processButtonInteraction(interaction, player) {
		/** @type {InteractionCallbackResponse<boolean>} */
		const reply = await interaction.deferReply({ withResponse: true });;
		const customId = interaction.customId;
		const interactable = this.getInteractable(customId);
		if (interactable) {
			const action = interactable.actionDirective.createAction(this.#game, undefined, player, player.location, false);
			if (action instanceof QueueMoveAction) {
				const args = interactable.actionDirective.getArgs();
				const isRunning = args[0];
				const destinationString = args[1];
				action.performQueueMove(isRunning, destinationString);
			}
			reply.resource.message.delete();
		}
		else this.replyToInteraction(`Interaction failed.`, interaction, false);
	}

	/**
	 * Processes a string select interaction and calls the correct function.
	 * @param {StringSelectMenuInteraction} interaction - The interaction being executed.
	 * @param {Player} player - The player who triggered the interaction.
	 */
	async processStringSelectMenuInteraction(interaction, player) {
		/** @type {InteractionCallbackResponse<boolean>} */
		const reply = await interaction.deferReply({ withResponse: true });;
		const customId = interaction.customId;
		const customIdParts = customId.split('|');
		/** @type {Player | Fixture | Room | RoomItem | InventoryItem} */
		let target;
		if (customIdParts[0] === 'Fixture') {
			const fixture = this.#game.entityFinder.getFixture(customIdParts[1], customIdParts[2]);
			if (fixture && player.location.id === fixture.location.id && fixture.accessible)
				target = fixture;
		}
		else if (customIdParts[0] === 'RoomItem') {
			const roomItem = this.#game.entityFinder.getRoomItem(customIdParts[1], customIdParts[2], customIdParts[3], customIdParts[4]);
			if (roomItem && player.location.id === roomItem.location.id && roomItem.accessible && roomItem.quantity !== 0)
				target = roomItem;
		}
		else if (customIdParts[0] === 'Player') {
			const otherPlayer = player.location.getOccupantsExcluding(player).find(otherPlayer => otherPlayer.displayName === customIdParts[1]);
			if (otherPlayer && player.location.id === otherPlayer.location.id)
				target = otherPlayer;
		}
		else if (customIdParts[0] === 'InventoryItem') {
			const inventoryItem = this.#game.entityFinder.getInventoryItem(customIdParts[1], customIdParts[2], customIdParts[3], customIdParts[4]);
			const ownerIsVisible = inventoryItem === undefined ? false
				: inventoryItem.player.name === player.name ? true
					: player.location.getOccupantsExcluding(player).includes(inventoryItem.player);
			if (inventoryItem && ownerIsVisible && inventoryItem.quantity !== 0)
				target = inventoryItem;
		}
		
		if (target) {
			const inspectAction = new InspectAction(this.#game, undefined, player, player.location, false);
			inspectAction.performInspect(target);
			reply.resource.message.delete();
		}
		else this.replyToInteraction(`Couldn't inspect "${customIdParts[1]}".`, interaction, false);
	}

	/**
	 * Replies to an interaction.
	 * @param {string} response - The response to send.
	 * @param {ButtonInteraction|StringSelectMenuInteraction} interaction - The interaction to reply to.
	 * @param {boolean} [deleteAfterTimeout] - Whether or not to delete the reply after a set amount of time.
	 */
	replyToInteraction(response, interaction, deleteAfterTimeout = true) {
		interaction.editReply({ content: response }).then(response => {
			if (deleteAfterTimeout) {
				setTimeout(() => {
					response.delete();
				}, 1);
			}
		});
	}
}