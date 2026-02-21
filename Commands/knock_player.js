import KnockAction from '../Data/Actions/KnockAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "knock_player",
    description: "Knocks on a door.",
    details: `Knocks on a door in the room that you're in. This will be narrated in the room you're in, and in the room that the exit leads to. `
        + `You can knock on a door even if it's locked. However, some exits don't have doors. If they don't, you will be unable to knock on them.`,
    usableBy: "Player",
    aliases: ["knock"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}knock DOOR 1`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify an exit. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable knock");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const input = args.join(" ");
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

    // Check that the input given is an exit in the player's current room.
    const exit = game.entityFinder.getExit(player.location, parsedInput);
    if (exit === undefined) return game.communicationHandler.reply(message, `Couldn't find exit "${parsedInput}" in the room.`);
    if (exit.hasTag("not knockable"))
        return game.communicationHandler.reply(message, `There's nothing to knock on.`);

    const action = new KnockAction(game, message, player, player.location, false);
    action.performKnock(exit);
}
