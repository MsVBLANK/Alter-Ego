import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.js";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.js";
import ActionDirective from "./ActionDirective.ts";
/** 
 * @import Action from "../Data/Action.js";
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
				const parsedArgs = this.#parseArgs(action, args);
				const validatedArgs = this.#validateArgs(action, player, parsedArgs);
				if (validatedArgs.length === 2) {
					action.performQueueMove(validatedArgs[0], validatedArgs[1]);
					reply.resource.message.delete();
					return;
				}
			}
		}
		this.replyToInteraction(`Interaction failed.`, interaction, false);
		return;
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
		const interactable = this.getInteractable(customId);
		if (interactable) {
			const action = interactable.actionDirective.createAction(this.#game, undefined, player, player.location, false);
			if (action instanceof InspectAction) {
				const args = interactable.actionDirective.getArgs();
				const parsedArgs = this.#parseArgs(action, args);
				const validatedArgs = this.#validateArgs(action, player, parsedArgs);
				if (validatedArgs.length === 1) {
					action.performInspect(validatedArgs[0]);
					reply.resource.message.delete();
					return;
				}
			}
		}
		this.replyToInteraction(`Interaction failed.`, interaction, false);
	}

	/**
	 * Finds any game entities in the args and returns the new args to pass into the action.
	 * @param {Action} action - The action the args will be passed to.
	 * @param {string[]} args - The args as strings.
	 */
	#parseArgs(action, args) {
		/** @type {any[]} */
		let newArgs = [];
		if (action instanceof InspectAction) {
			/** @type {Inspectable} */
			let target;
			switch (args[0]) {
				case 'F':
					target = this.#game.entityFinder.getFixture(args[1], args[2]);
					break;
				case 'II':
					target = this.#game.entityFinder.getInventoryItem(args[1], args[2], args[3], args[4]);
					break;
				case 'P':
					target = this.#game.entityFinder.getLivingPlayer(args[1]);
					break;
				case 'R':
					target = this.#game.entityFinder.getRoom(args[1]);
					break;
				case 'RI':
					target = this.#game.entityFinder.getRoomItem(args[1], args[2], args[3], args[4]);
					break;
			}
			if (target) {
				newArgs.push(args[0]);
				newArgs.push(target);
			}
		}
		else if (action instanceof QueueMoveAction) {
			const location = this.#game.entityFinder.getRoom(args[0]);
			const isRunning = args[1].toLowerCase() === 'true';
			/** @type {Exit} */
			let exit = this.#game.entityFinder.getExit(location, args[2]);
			if (exit) newArgs.push(location, isRunning, exit.name);
		}
		return newArgs;
	}

	/**
	 * Validates the args before passing them into the action's perform function.
	 * @param {Action} action - The action the args will be passed to.
	 * @param {Player} player - The player performing the action.
	 * @param {any[]} args - The args after being parsed.
	 * @returns The args to pass into the perform function.
	 */
	#validateArgs(action, player, args) {
		if (action instanceof InspectAction) {
			if (args.length !== 2) return [];
			if (player.hasBehaviorAttribute("disable inspect")) return [];
			if (player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable inspect")) return [];
			if (!args[1].getLocation()) return [];
			if (args[1].getLocation().id !== player.location.id) return [];
			if (args[0] === 'F' && !args[1]?.accessible) return [];
			if (args[0] === 'RI' && (!args[1]?.accessible || args[1].quantity === 0)) return [];
			return [args[1]];
		}
		if (action instanceof QueueMoveAction) {
			if (args.length !== 3) return [];
			if (!args[0]) return [];
			if (args[0].id !== player.location.id) return [];
			if (player.isMoving) return [];
			if (args[1] === false && (player.hasBehaviorAttribute("disable move") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable move"))) return [];
			if (args[1] === true && (player.hasBehaviorAttribute("disable run") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable run"))) return [];
			if (!args[2]) return [];
			return [args[1], args[2]];
		}
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