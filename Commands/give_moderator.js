import GiveAction from '../Data/Actions/GiveAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "give_moderator",
    description: "Gives a player's item to another player.",
    details: `Transfers an item from the first player's inventory to the second player's inventory. Both players must `
        + `be in the same room. The item selected must be in one of the first player's hands. The receiving player must `
        + `also have a free hand, or else they will not be able to receive the item. If the giving player gives a `
        + `non-discreet item to the receiving player, it will be narrated in the room.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["give"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}give Kanda's EMBALMING FLUID to Astrid\n`
        + `${settings.commandPrefix}give Lucia BIRTHDAY PRESENT BOX 9 to Flint`;
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
    if (!sentMessageInLatchChannel && args.length < 3)
        return game.communicationHandler.reply(message, `You need to specify two players and an item. Usage:\n${usage(game.settings)}`);
    if (sentMessageInLatchChannel && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a recipient and an item. Usage:\n${usage(game.settings)}`);

    // First, find the giver.
    let giver = game.entityFinder.getLivingPlayer(args[0].replace(/'s/g, ""));
    if (giver && (moderator.getLatch() === null || moderator.getLatch().name.toLowerCase() !== args[0].toLowerCase().replace(/'s/g, "")))
        args.splice(0, 1);
    if (!giver && sentMessageInLatchChannel)
        giver = moderator.getLatch();
    if (giver === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);

    // Next, find the recipient.
    const recipient = game.entityFinder.getLivingPlayer(args[args.length - 1].replace(/'s/g, ""));
    if (recipient === undefined) return game.communicationHandler.reply(message, `Player "${args[args.length - 1]}" not found.`);
    args.splice(args.length - 1, 1);
    if (args[args.length - 1].toLowerCase() === "to") args.splice(args.length - 1, 1);

    if (giver.name === recipient.name) return game.communicationHandler.reply(message, `${giver.name} cannot give an item to ${giver.originalPronouns.ref}.`);
    if (giver.location.id !== recipient.location.id) return game.communicationHandler.reply(message, `${giver.name} and ${recipient.name} are not in the same room.`);

    // Check to make sure that the recipient has a free hand.
    let recipientHand = game.entityFinder.getPlayerFreeHand(recipient);
    if (recipientHand === undefined) return game.communicationHandler.reply(message, `${recipient.name} does not have a free hand to receive an item.`);

    const input = args.join(" ");
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

    // Now find the item in the giver's inventory.
    const giverHand = game.entityFinder.getPlayerHandHoldingItem(giver, parsedInput);
    const item = giverHand ? giverHand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in either of ${giver.name}'s hands.`);

    const action = new GiveAction(game, message, giver, giver.location, true);
    action.performGive(item, giverHand, recipient, recipientHand);
    action.sendSuccessMessageToCommandChannel();
}
