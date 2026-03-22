/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "restore_moderator",
    description: "Restores a player's stamina.",
    details: `Sets the given player's stamina to its maximum value. This is based on their current max stamina, not `
        + `their default stamina. Note that this does not automatically cure the \`weary\` status effect.`,
    usableBy: "Moderator",
    aliases: ["restore"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}restore Flint`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify a player. Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0]);
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);

    player.restoreStamina();
    game.communicationHandler.sendToCommandChannel(`Fully restored ${player.name}'s stamina.`);
}
