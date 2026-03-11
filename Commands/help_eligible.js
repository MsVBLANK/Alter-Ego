import HelpAction from '../Data/Actions/HelpAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "help_eligible",
    description: "Lists all commands available to you.",
    details: "Lists all commands available to the user. If a command is specified, displays the help menu for that command.",
    usableBy: "Eligible",
    aliases: ["help"],
    requiresGame: false
} ;

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}help\n` +
        `${settings.commandPrefix}help play`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words. 
 */
export async function execute(game, message, command, args) {
    const action = new HelpAction(game, message, undefined, undefined, false);
    action.performHelp("Eligible", args.join(" "));
}
