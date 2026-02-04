import InflictAction from '../Data/Actions/InflictAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "sleep_player",
    description: "Puts you to sleep.",
    details: `Puts you to sleep by inflicting you with the **asleep** status effect. In most situations, you will not be able to wake back up again without `
        + `moderator assistance. This should be used at the end of the day before the game pauses to ensure you wake up feeling well rested.\n\n`
        + `If you are able to wake back up of your own volition, you can do so with the \`wake\` command.`,
    usableBy: "Player",
    aliases: ["sleep"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}sleep`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words. 
 * @param {Player} player - The player who issued the command. 
 */
export async function execute(game, message, command, args, player) {
    const status = player.getBehaviorAttributeStatusEffects("disable sleep");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const sleepStatus = game.entityFinder.getStatusEffect("asleep");
    const action = new InflictAction(game, message, player, player.location, false);
    action.performInflict(sleepStatus, true, true, true);
    player.setOffline();
}
