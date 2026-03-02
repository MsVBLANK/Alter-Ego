/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @type {CommandConfig} */
export const config = {
    name: "dead_moderator",
    description: "Lists all dead players.",
    details: "Lists all dead players.",
    usableBy: "Moderator",
    aliases: ["dead", "died"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}dead\n`
        + `${settings.commandPrefix}died`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    let playerList = `Dead players:\n${game.entityFinder.getDeadPlayers().map(player => player.name).join(" ")}`;
    game.communicationHandler.sendToCommandChannel(playerList);
}
