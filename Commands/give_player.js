import GiveAction from '../Data/Actions/GiveAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "give_player",
    description: "Gives an item to another player.",
    details: `Transfers an item from your inventory to another player in the room. The item selected must be in one of your hands. `
        + `The receiving player must also have a free hand, or else they will not be able to receive the item. If a particularly large item `
        + `is given (a chainsaw, for example), it will be narrated in the room, so other players in the room will see you giving it to the recipient.`,
    usableBy: "Player",
    aliases: ["give"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}give Astrid EMBALMING FLUID\n`
        + `${settings.commandPrefix}g Flint BIRTHDAY PRESENT`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    if (args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a player and an item. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable give");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    // This will be checked multiple times, so get it now.
    const hiddenStatus = player.getBehaviorAttributeStatusEffects("hidden");

    const input = args.join(" ");
    let parsedInput = input.toUpperCase().replace(/\'/g, "");

    // First, find the recipient.
    let recipient = null;
    for (let i = 0; i < player.location.occupants.length; i++) {
        const occupant = player.location.occupants[i];
        if (parsedInput.startsWith(occupant.displayName.toUpperCase() + ' ') && (hiddenStatus.length === 0 && !occupant.isHidden() || occupant.hidingSpot === player.hidingSpot)) {
            // Player cannot give to themselves.
            if (occupant.name === player.name) return game.communicationHandler.reply(message, "You can't give to yourself.");

            recipient = occupant;
            parsedInput = parsedInput.substring(occupant.displayName.length + 1).trim();
            break;
        }
        else if (parsedInput.startsWith(occupant.displayName.toUpperCase()) && hiddenStatus.length > 0 && !occupant.isHidden())
            return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
    }
    if (recipient === null) return game.communicationHandler.reply(message, `Couldn't find player "${args[0]}" in the room with you. Make sure you spelled it right.`);

    // Check to make sure that the recipient has a free hand.
    let recipientHand = game.entityFinder.getPlayerFreeHand(recipient);
    if (recipientHand === undefined) return game.communicationHandler.reply(message, `${recipient.displayName} does not have a free hand to receive an item.`);

    // Find the item in the player's inventory.
    const giverHand = game.entityFinder.getPlayerHandHoldingItem(player, parsedInput, undefined, undefined, "player");
    const item = giverHand ? giverHand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in either of your hands. If this item is elsewhere in your inventory, please unequip or unstash it before trying to give it.`);

    const action = new GiveAction(game, message, player, player.location, false);
    action.performGive(item, giverHand, recipient, recipientHand);
}
