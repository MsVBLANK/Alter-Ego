import InspectAction from "../Data/Actions/InspectAction.ts";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.ts";
import TakeAction from "../Data/Actions/TakeAction.ts";
import DropAction from "../Data/Actions/DropAction.ts";
import StashAction from "../Data/Actions/StashAction.ts";
import UnstashAction from "../Data/Actions/UnstashAction.ts";
import EquipAction from "../Data/Actions/EquipAction.ts";
import UnequipAction from "../Data/Actions/UnequipAction.ts";
import CraftAction from "../Data/Actions/CraftAction.ts";
import UseAction from "../Data/Actions/UseAction.ts";
import InstantiateAction from "../Data/Actions/InstantiateAction.ts";
import type ActionDirectiveInteractable from "./Interactables/ActionDirectiveInteractable.ts";
import type Game from "../Data/Game.ts";
import Moderator from "../Data/Moderator.ts";
import { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from "discord.js";
import type { Interaction, InteractionCallbackResponse } from "discord.js";
type BotInteraction = ButtonInteraction|StringSelectMenuInteraction|ModalSubmitInteraction;

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
    getInteractable(customId: string): ActionDirectiveInteractable {
        return this.#game.botContext.interactableManager.getInteractableByCustomId(customId);
    }

    /**
     * Intercepts an interaction event and directs it to the correct function.
     * @param interaction - The interaction that was created.
     */
    interceptInteraction(interaction: Interaction): void {
        const user = this.#game.entityFinder.getModeratorById(interaction.user.id) ?? this.#game.entityFinder.getLivingPlayerById(interaction.user.id);
        if (!user) return;
        if (interaction instanceof ButtonInteraction)
            this.processButtonInteraction(interaction, user);
        if (interaction instanceof StringSelectMenuInteraction)
            this.processStringSelectMenuInteraction(interaction, user);
        if (interaction instanceof ModalSubmitInteraction)
            this.processModalSubmitInteraction(interaction, user);
        return;
    }

    /**
     * Processes a button interaction.
     * @param interaction - The interaction being executed.
     * @param user - The user who triggered the interaction.
     */
    processButtonInteraction(interaction: ButtonInteraction, user: User): void {
        const customId = interaction.customId;
        this.#processInteraction(customId, interaction, user);
        return;
    }

    /**
     * Processes a string select interaction.
     * @param interaction - The interaction being executed.
     * @param user - The user who triggered the interaction.
     */
    processStringSelectMenuInteraction(interaction: StringSelectMenuInteraction, user: User): void {
        const selectedValue = interaction.values[0];
        const customId = selectedValue;
        this.#processInteraction(customId, interaction, user);
        return;
    }

    /**
     * Processes a modal submit interaction.
     * @param interaction - The interaction being executed.
     * @param user - The user who triggered the interaction.
     */
    processModalSubmitInteraction(interaction: ModalSubmitInteraction, user: User): void {
        const customId = interaction.customId;
        this.#processInteraction(customId, interaction, user);
        return;
    }

    async #processInteraction(customId: string, interaction: BotInteraction, user: User): Promise<void> {
        let reply: InteractionCallbackResponse<boolean>;
        const interactable = this.getInteractable(customId);
        let successfullyProcessedInteractable = false;
        let errorMessage = `Interaction failed.`;
        if (interactable) {
            if (!interactable.respondWithModal) reply = await interaction.deferReply({ withResponse: true });
            try {
                successfullyProcessedInteractable = await this.#processInteractable(interactable, user, interaction, reply);
            }
            catch (error) {
                successfullyProcessedInteractable = false;
                errorMessage = error.message;
            }
        }
        if (!successfullyProcessedInteractable) this.#replyToInteraction(errorMessage, interaction);
        return;
    }

    /**
     * Process an interactable and calls the correct function.
     * @param reply - The reply that was sent.
     * @param interactable - The interactable to process.
     * @param user - The user who triggered the interaction.
     * @returns Whether the interactable successfully performed an action or not.
     */
    async #processInteractable(interactable: ActionDirectiveInteractable, user: User, interaction: BotInteraction, reply?: InteractionCallbackResponse<boolean>): Promise<boolean> {
        const player = interactable.actionDirective.getPlayer();
        const forced = user instanceof Moderator;
        const action = interactable.actionDirective.createAction(this.#game, undefined, player, player.location, forced);
        if (action instanceof QueueMoveAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 2) {
                action.performQueueMove(validatedArgs[0], validatedArgs[1]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof InspectAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 1) {
                action.performInspect(validatedArgs[0]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof TakeAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 4) {
                action.performTake(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof DropAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 4) {
                action.performDrop(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof StashAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 4) {
                action.performStash(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof UnstashAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 4) {
                action.performUnstash(validatedArgs[0], validatedArgs[1], validatedArgs[2], validatedArgs[3]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof EquipAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 3) {
                action.performEquip(validatedArgs[0], validatedArgs[1], validatedArgs[2]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof UnequipAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 3) {
                action.performUnequip(validatedArgs[0], validatedArgs[1], validatedArgs[2]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof CraftAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 3) {
                action.performCraft(validatedArgs[0], validatedArgs[1], validatedArgs[2]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof UseAction) {
            const args = interactable.actionDirective.getArgs();
            const parsedArgs = action.parseInteractionArgs(args);
            const validatedArgs = action.validateInteractionArgs(parsedArgs);
            if (validatedArgs.length === 2) {
                action.performUse(validatedArgs[0], validatedArgs[1]);
                if (reply) reply.resource.message.delete();
                return true;
            }
        }
        if (action instanceof InstantiateAction) {
            if (interaction instanceof ModalSubmitInteraction) {
                const prefabId = interaction.fields.getTextInputValue("Instantiate Inventory Item Prefab ID");
                let quantity: string;
                if (interaction.fields.fields.has("Instantiate Inventory Item Quantity"))
                    quantity = interaction.fields.getTextInputValue("Instantiate Inventory Item Quantity");
                const uses = interaction.fields.getTextInputValue("Instantiate Inventory Item Uses");
                const proceduralSelections = interaction.fields.getTextInputValue("Instantiate Inventory Item Procedural Selections");
                const args = interactable.actionDirective.getArgs();
                const parsedArgs = action.parseInstantiateInventoryItemInteractionArgs(args, prefabId, quantity, uses, proceduralSelections);
                try {
                    const validatedArgs = action.validateInstantiateInventoryItemInteractionArgs(parsedArgs);
                    const prefab = validatedArgs[0];
                    const quantity = validatedArgs[4];
                    // If the prefab has inventory slots, instantiate the prefab quantity times so that it generates items with different identifiers.
                    if (prefab.inventory.size > 0 && quantity > 1) {
                        for (let i = 0; i < quantity; i++) {
                            const instantiateAction = new InstantiateAction(action.getGame(), action.message, action.player, action.location, action.forced, action.whisper, action.user);
                            instantiateAction.performInstantiateInventoryItem(prefab, validatedArgs[1], validatedArgs[2], validatedArgs[3], 1, validatedArgs[5], validatedArgs[6]);
                        }
                    }
                    else action.performInstantiateInventoryItem(prefab, validatedArgs[1], validatedArgs[2], validatedArgs[3], quantity, validatedArgs[5], validatedArgs[6]);
                    this.#replyToInteraction("Successfully instantiated inventory item.", interaction);
                    return true;
                } 
                catch (error) { throw new Error(error.message); }
            }
            else {
                const args = interactable.actionDirective.getArgs();
                if (args.length === 4 && args[0] === "II") {
                    const modal = await this.#game.botContext.interactableManager.createInstantiateInventoryItemActionModalInteractable(args as [string, string, string, string], player, user);
                    await interaction.showModal(modal.component);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Replies to an interaction.
     * @param response - The response to send.
     * @param interaction - The interaction to reply to.
     */
    #replyToInteraction(response: string, interaction: ButtonInteraction|StringSelectMenuInteraction|ModalSubmitInteraction): void {
        if (interaction.replied || interaction.deferred) interaction.editReply({ content: response });
        else interaction.reply({ content: response });
    }
}
