import InventoryAction from '../Data/Actions/InventoryAction.ts';
/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "inventory_moderator",
    description: "Lists a given player's inventory.",
    details: `Lists all of the given player's equipment slots, and any items equipped to each one. `
        + `The player's stashed items will be listed underneath the container they're inside of, in parentheses. They `
        + `will be preceded by the ID of the inventory slot they're in.\n\n`
        + `In the player's inventory, the identifiers of all items will be contained in code blocks. This makes it `
        + `easier to copy them and paste them into other commands.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["inventory", "i"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}inventory Nero\n`
        + `${settings.commandPrefix}i Aisha`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const sentMessageInLatchChannel = moderator?.sentMessageInLatchChannel(message) ?? false;
    if (!sentMessageInLatchChannel && args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify a player. Usage:\n${usage(game.settings)}`);

    let player = game.entityFinder.getLivingPlayer(args[0]);
    if (!player && sentMessageInLatchChannel) player = moderator.getLatch();
    if (player === undefined) {
        // The `i` alias makes it so this message will trigger very frequently in the bot commands channel if people start a message with "I".
        // Guard against that.
        if (!sentMessageInLatchChannel && command === 'i' && !message.content.startsWith(game.settings.commandPrefix)) return;
        return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    }

    const action = new InventoryAction(game, message, player, player.location, true);
	action.performInventory();
}
