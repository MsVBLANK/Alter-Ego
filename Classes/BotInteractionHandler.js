import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.js";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.js";
import TakeAction from "../Data/Actions/TakeAction.js";
/** 
 * @import Game from "../Data/Game.js";
 * @import Player from "../Data/Player.js";
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
				const parsedArgs = action.parseInteractionArgs(args);
				const validatedArgs = action.validateInteractionArgs(parsedArgs);
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
		const reply = await interaction.deferReply({ withResponse: true });
		const selectedValue = interaction.values[0];
		const customId = selectedValue;
		const interactable = this.getInteractable(customId);
		if (interactable) {
			const action = interactable.actionDirective.createAction(this.#game, undefined, player, player.location, false);
			if (action instanceof InspectAction) {
				const args = interactable.actionDirective.getArgs();
				const parsedArgs = action.parseInteractionArgs(args);
				const validatedArgs = action.validateInteractionArgs(parsedArgs);
				if (validatedArgs.length === 1) {
					action.performInspect(validatedArgs[0]);
					reply.resource.message.delete();
					return;
				}
			}
			if (action instanceof TakeAction) {
				const args = interactable.actionDirective.getArgs();
				const parsedArgs = action.parseInteractionArgs(args);
				const validatedArgs = action.validateInteractionArgs(parsedArgs);
				if (validatedArgs.length === 4) {
					action.performTake(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
					reply.resource.message.delete();
					return;
				}
			}
		}
		this.replyToInteraction(`Interaction failed.`, interaction, false);
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