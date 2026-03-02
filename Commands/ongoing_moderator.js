/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "ongoing_moderator",
    description: "Lists all ongoing events.",
    details: "Lists all events which are currently ongoing, along with the time remaining on each one, if applicable.",
    usableBy: "Moderator",
    aliases: ["ongoing", "events"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}ongoing\n`
        + `${settings.commandPrefix}events`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const events = game.entityFinder.getEvents(null, true).map((event) => {
        return event.remaining === null ? event.id : `${event.id} (${event.remainingString})`;
    });
    const eventList = events.join(", ");
    game.communicationHandler.sendToCommandChannel(`Ongoing events:\n${eventList}`);
}
