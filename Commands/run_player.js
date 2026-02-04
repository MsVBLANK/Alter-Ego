import QueueMoveAction from '../Data/Actions/QueueMoveAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "run_player",
    description: "Runs to another room.",
    details: `Moves you to another room by running. This functions identically to the \`move\` command, however you will move twice as quickly and lose stamina `
        + `at three times the normal rate.\n\n`
        + `You must specify an exit in the room you're currently in, or the name of the desired room, if you know it. `
        + `Unless you have the free movement role, you can only move to a room directly connected to the one you're currently in. `
        + `It will take time for you to move to your destination. How much time it takes depends on its distance from your current position, and your speed. `
        + `Once you reach the destination, you will be removed from your current room channel and put into the channel corresponding to the room you specify, `
        + `as long as the exit leading to it isn't locked.\n\n`
        + `When you enter a new room, its description will be sent to you via DMs. `
        + `However, it is recommended that you open the new channel immediately so that you can start seeing messages as soon as you're added.\n\n`
        + `You can also create a queue of movements to perform such that upon entering one room, you will immediately `
        + `start moving to the next one. To do this, separate each destination with \`>\`.\n\n`
        + `Note that if you are carrying any large items in your hands (for example, a sword), they will be mentioned when you exit or enter a room.`,
    usableBy: "Player",
    aliases: ["run"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}run DOOR 1\n`
        + `${settings.commandPrefix}run Kitchen\n`
        + `${settings.commandPrefix}run locker-room\n`
        + `${settings.commandPrefix}run DOOR\n`
        + `${settings.commandPrefix}run DOOR 1>DOOR 1>DOOR 1\n`
        + `${settings.commandPrefix}run HALL 1 > HALL 2 > HALL 3 > HALL 4\n`
        + `${settings.commandPrefix}run Lobby>Path 3>Path 1>Park>Path 7>Botanical garden`;
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
        return game.communicationHandler.reply(message, `You need to specify a room. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable run");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    if (player.isMoving) return game.communicationHandler.reply(message, `You cannot do that because you are already moving.`);

    player.moveQueue = args.join(" ").split(">");
    const action = new QueueMoveAction(game, message, player, player.location, false);
    action.performQueueMove(true, player.moveQueue[0]);
}
