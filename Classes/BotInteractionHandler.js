/** @import Game from "../Data/Game.js" */
/** @import Player from "../Data/Player.js" */
/** @import { Interaction } from "discord.js" */
import { ButtonInteraction, MessageFlags } from "discord.js";
import InspectAction from "../Data/Actions/InspectAction.js";

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
	processButtonInteraction(interaction, player) {
		const buttonId = interaction.customId;
		const buttonIdParts = buttonId.split('|');
		if (buttonIdParts[0] === 'Fixture') {
			const fixture = this.#game.entityFinder.getFixture(buttonIdParts[1], buttonIdParts[2]);
			if (player.location.id !== fixture.location.id) {
				this.replyToInteraction(`Couldn't inspect ${fixture.name}.`, interaction, false);
				return;
			}
			const inspectAction = new InspectAction(this.#game, undefined, player, player.location, false);
			inspectAction.performInspect(fixture);
			this.replyToInteraction(`Successfully inspected ${fixture.name}.`, interaction);
		}
	}

	/**
	 * Replies to an interaction.
	 * @param {string} response - The response to send.
	 * @param {ButtonInteraction} interaction - The interaction to reply to.
	 * @param {boolean} [deleteAfterTimeout] - Whether or not to delete the reply after a set amount of time.
	 */
	replyToInteraction(response, interaction, deleteAfterTimeout = true) {
		interaction.reply({ content: response, flags: MessageFlags.Ephemeral }).then(response => {
			if (deleteAfterTimeout) {
				setTimeout(() => {
					response.delete();
				}, 30000);
			}
		});
	}
}