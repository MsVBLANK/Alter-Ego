import KnockAction from '../Data/Actions/KnockAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "knock_moderator",
    description: "Knocks on a door for a player.",
    details: "Knocks on a door for the given player",
    usableBy: "Moderator",
    aliases: ["knock"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}knock kanda door 1`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const sentMessageInLatchChannel = moderator.sentMessageInLatchChannel(message);
    if (!sentMessageInLatchChannel && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a player and an exit. Usage:\n${usage(game.settings)}`);
    if (sentMessageInLatchChannel && args.length < 1)
        return game.communicationHandler.reply(message, `You need to specify an exit. Usage:\n${usage(game.settings)}`);

    let player = game.entityFinder.getLivingPlayer(args[0]);
    if (player && (moderator.getLatch() === null || moderator.getLatch().name.toLowerCase() !== args[0].toLowerCase()))
        args.splice(0, 1);
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);

    const input = args.join(" ");
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

    // Check that the input given is an exit in the player's current room.
    const exit = game.entityFinder.getExit(player.location, parsedInput);
    if (exit === undefined) return game.communicationHandler.reply(message, `Couldn't find exit "${parsedInput}" in the room.`);
    if (exit.hasTag("not knockable"))
        return game.communicationHandler.reply(message, `There's nothing to knock on.`);

    const action = new KnockAction(game, message, player, player.location, true);
    action.performKnock(exit);
    game.communicationHandler.sendToCommandChannel(`Successfully knocked on ${exit.name} for ${player.name}.`);
}
