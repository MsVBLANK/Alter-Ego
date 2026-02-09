import { ButtonInteraction, MessageFlags } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.js";
/** 
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
	 * Intercepts an interaction event and directs it to the correct function.
	 * @param {Interaction} interaction - The interaction that was created.
	 */
	interceptInteraction(interaction) {
		const player = this.#game.entityFinder.getLivingPlayerById(interaction.user.id);
		if (!player) return;
		if (interaction instanceof ButtonInteraction)
			this.processButtonInteraction(interaction, player);
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
		const buttonId = interaction.customId;
		const buttonIdParts = buttonId.split('|');
		/** @type {Player | Fixture | Room | RoomItem | InventoryItem} */
		let target;
		if (buttonIdParts[0] === 'Fixture') {
			const fixture = this.#game.entityFinder.getFixture(buttonIdParts[1], buttonIdParts[2]);
			if (fixture && player.location.id === fixture.location.id && fixture.accessible)
				target = fixture;
		}
		else if (buttonIdParts[0] === 'RoomItem') {
			const roomItem = this.#game.entityFinder.getRoomItem(buttonIdParts[1], buttonIdParts[2], buttonIdParts[3], buttonIdParts[4]);
			if (roomItem && player.location.id === roomItem.location.id && roomItem.accessible && roomItem.quantity !== 0)
				target = roomItem;
		}
		else if (buttonIdParts[0] === 'Player') {
			const otherPlayer = player.location.getOccupantsExcluding(player).find(otherPlayer => otherPlayer.displayName === buttonIdParts[1]);
			if (otherPlayer && player.location.id === otherPlayer.location.id)
				target = otherPlayer;
		}
		else if (buttonIdParts[0] === 'InventoryItem') {
			const inventoryItem = this.#game.entityFinder.getInventoryItem(buttonIdParts[1], buttonIdParts[2], buttonIdParts[3], buttonIdParts[4]);
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
		else this.replyToInteraction(`Couldn't inspect "${buttonIdParts[1]}".`, interaction, false);
	}

	/**
	 * Replies to an interaction.
	 * @param {string} response - The response to send.
	 * @param {ButtonInteraction} interaction - The interaction to reply to.
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