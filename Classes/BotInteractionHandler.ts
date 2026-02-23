import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.ts";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.ts";
import TakeAction from "../Data/Actions/TakeAction.ts";
import DropAction from "../Data/Actions/DropAction.ts";
import StashAction from "../Data/Actions/StashAction.ts";
import UnstashAction from "../Data/Actions/UnstashAction.ts";
import type Game from "../Data/Game.ts";
import type Interactable from "./Interactables/Interactable.ts";
import type Player from "../Data/Player.ts";
import type { Interaction, InteractionCallbackResponse } from "discord.js"

/**
 * @class InteractionHandler
 * @classdesc A set of functions for handling Interactions.
 */
export default class BotInteractionHandler {
	/**
	 * The game this belongs to.
	 */
    readonly #game: Game;

	/**
	 * @constructor
	 * @param game - The game this belongs to.
	 */
	constructor(game: Game) {
		this.#game = game;
	}

	/**
	 * Gets an interactable from the cache by the customId. If it doesn't exist, returns undefined.
	 * @param customId
	 */
	getInteractable(customId: string): Interactable {
		return this.#game.botContext.interactableManager.getInteractableByCustomId(customId);
	}

	/**
	 * Intercepts an interaction event and directs it to the correct function.
	 * @param interaction - The interaction that was created.
	 */
	interceptInteraction(interaction: Interaction) {
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
	 * @param interaction - The interaction being executed.
	 * @param player - The player who triggered the interaction.
	 */
	async processButtonInteraction(interaction: ButtonInteraction, player: Player) {
		const reply = await interaction.deferReply({ withResponse: true });
		const customId = interaction.customId;
		const interactable = this.getInteractable(customId);
		let successfullyProcessedInteractable = false;
		if (interactable) successfullyProcessedInteractable = this.processInteractable(reply, interactable, player);
		if (!successfullyProcessedInteractable) this.replyToInteraction(`Interaction failed.`, interaction, false);
		return;
	}

	/**
	 * Processes a string select interaction and calls the correct function.
	 * @param interaction - The interaction being executed.
	 * @param player - The player who triggered the interaction.
	 */
	async processStringSelectMenuInteraction(interaction: StringSelectMenuInteraction, player: Player) {
		const reply = await interaction.deferReply({ withResponse: true });
		const selectedValue = interaction.values[0];
		const customId = selectedValue;
		const interactable = this.getInteractable(customId);
		let successfullyProcessedInteractable = false;
		if (interactable) successfullyProcessedInteractable = this.processInteractable(reply, interactable, player);
		if (!successfullyProcessedInteractable) this.replyToInteraction(`Interaction failed.`, interaction, false);
		return;
	}

	/**
	 * Process an interactable and calls the correct function.
	 * @param reply - The reply that was sent.
	 * @param interactable - The interactable to process.
	 * @param player - The player who triggered the interaction.
	 * @returns Whether the interactable successfully performed an action or not.
	 */
	processInteractable(reply: InteractionCallbackResponse<boolean>, interactable: Interactable, player: Player): boolean {
		const action = interactable.actionDirective.createAction(this.#game, undefined, player, player.location, false);
		if (action instanceof QueueMoveAction) {
			const args = interactable.actionDirective.getArgs();
			const parsedArgs = action.parseInteractionArgs(args);
			const validatedArgs = action.validateInteractionArgs(parsedArgs);
			if (validatedArgs.length === 2) {
				action.performQueueMove(validatedArgs[0], validatedArgs[1]);
				reply.resource.message.delete();
				return true;
			}
		}
		if (action instanceof InspectAction) {
			const args = interactable.actionDirective.getArgs();
			const parsedArgs = action.parseInteractionArgs(args);
			const validatedArgs = action.validateInteractionArgs(parsedArgs);
			if (validatedArgs.length === 1) {
				action.performInspect(validatedArgs[0]);
				reply.resource.message.delete();
				return true;
			}
		}
		if (action instanceof TakeAction) {
			const args = interactable.actionDirective.getArgs();
			const parsedArgs = action.parseInteractionArgs(args);
			const validatedArgs = action.validateInteractionArgs(parsedArgs);
			if (validatedArgs.length === 4) {
				action.performTake(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
				reply.resource.message.delete();
				return true;
			}
		}
		if (action instanceof DropAction) {
			const args = interactable.actionDirective.getArgs();
			const parsedArgs = action.parseInteractionArgs(args);
			const validatedArgs = action.validateInteractionArgs(parsedArgs);
			if (validatedArgs.length === 4) {
				action.performDrop(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
				reply.resource.message.delete();
				return true;
			}
		}
		if (action instanceof StashAction) {
			const args = interactable.actionDirective.getArgs();
			const parsedArgs = action.parseInteractionArgs(args);
			const validatedArgs = action.validateInteractionArgs(parsedArgs);
			if (validatedArgs.length === 4) {
				action.performStash(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
				reply.resource.message.delete();
				return true;
			}
		}
        if (action instanceof UnstashAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 4) {
                action.performUnstash(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
                reply.resource.message.delete();
                return true;
            }
        }
		return false;
	}

	/**
	 * Replies to an interaction.
	 * @param response - The response to send.
	 * @param interaction - The interaction to reply to.
	 * @param deleteAfterTimeout - Whether or not to delete the reply after a set amount of time.
	 */
	replyToInteraction(response: string, interaction: ButtonInteraction|StringSelectMenuInteraction, deleteAfterTimeout = true) {
		interaction.editReply({ content: response }).then(response => {
			if (deleteAfterTimeout) {
				setTimeout(() => {
					response.delete();
				}, 1);
			}
		});
	}
}
