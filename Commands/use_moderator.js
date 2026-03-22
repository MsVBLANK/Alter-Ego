import UseAction from '../Data/Actions/UseAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "use_moderator",
    description: "Uses an item in the given player's inventory.",
    details: "Uses an item in one of the given player's hands. You can specify a second player for the first player to use their item on. "
        + "If you do, players in the room will be notified, so you should generally give a string for the bot to use, "
        + 'otherwise the bot will say "[player] uses [item single containing phrase] on [target]." which may not sound right. '
        + "Both players must be in the same room. If no second player is given, the first player will use the item on themself. "
        + "Note that you cannot solve puzzles using this command. To do that, use the puzzle command.",
    usableBy: "Moderator",
    aliases: ["use"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}use princeton first aid kit\n`
        + `${settings.commandPrefix}use celia's food\n`
        + `${settings.commandPrefix}use pollux first aid spray ximena "Pollux uncaps and applies a can of FIRST AID SPRAY to Ximena's wounds."\n`
        + `${settings.commandPrefix}use ayaka's black lipstick on wynne "Ayaka applies a tube of BLACK LIPSTICK to Wynne's lips."`;
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
    if (!sentMessageInLatchChannel && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a player and an item in their inventory. Usage:\n${usage(game.settings)}`);
    if (sentMessageInLatchChannel && args.length < 1)
        return game.communicationHandler.reply(message, `You need to specify an item. Usage:\n${usage(game.settings)}`);

    let player = game.entityFinder.getLivingPlayer(args[0].replace(/'s/g, ""));
    if (player && (moderator.getLatch() === null || moderator.getLatch().name.toLowerCase() !== args[0].toLowerCase().replace(/'s/g, "")))
        args.splice(0, 1);
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);

    let input = args.join(" ");

    // If an announcement is present, it's the next easiest thing to find.
    let announcement = "";
    let index = input.indexOf('"');
    if (index === -1) index = input.indexOf('“');
    if (index !== -1) {
        announcement = input.substring(index + 1);
        // Remove the announcement from the list of arguments.
        input = input.substring(0, index - 1);
        args = input.split(" ");
        // Now clean up the announcement text.
        if (announcement.endsWith('"') || announcement.endsWith('”'))
            announcement = announcement.substring(0, announcement.length - 1);
        if (!announcement.endsWith('.') && !announcement.endsWith('!'))
            announcement += '.';
    }

    let target = game.entityFinder.getLivingPlayer(args[args.length - 1]);
    if (target) {
        if (args.length > 1 && args[args.length - 2].toLowerCase() === "on")
            // If "on" precedes the target's name, remove both args.
            args.splice(args.length - 2, 2);
        else args.splice(args.length - 1, 1);
    }
    if (announcement !== "" && target === undefined) return game.communicationHandler.reply(message, `Player "${args[args.length - 1]}" not found.`);
    if (target !== undefined && player.name === target.name) return game.communicationHandler.reply(message, `${player.name} cannot use an item on ${player.originalPronouns.ref} with this command syntax.`);
    if (target !== undefined && player.location.id !== target.location.id) return game.communicationHandler.reply(message, `${player.name} and ${target.name} are not in the same room.`);
    if (target === undefined) target = player;

    // args should now only contain the name of the item.
    input = args.join(" ");

    // First, find the item in the player's inventory.
    let item = null;
    const hand = game.entityFinder.getPlayerHandHoldingItem(player, input);
    if (hand) item = hand.equippedItem;
    if (!item) return game.communicationHandler.reply(message, `Couldn't find item "${input}" in either of ${player.name}'s hands.`);

    if (item.uses === 0) return game.communicationHandler.reply(message, "That item has no uses left.");
    if (!item.prefab.usable) return game.communicationHandler.reply(message, "That item has no programmed use.");
    if (!item.usableOn(target)) return game.communicationHandler.reply(message, `${item.getIdentifier()} currently has no effect on ${target.name}.`);
    // Use the player's item.
    const action = new UseAction(game, message, player, player.location, true);
    action.performUse(item, target, announcement);
    action.sendSuccessMessageToCommandChannel();
}
