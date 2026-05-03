import DieAction from '../Data/Actions/DieAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "kill_moderator",
    description: "Kills a player.",
    details: `Kills the listed players. Player names must be separated by a space.\n\n`
        + `When a player is killed, they are removed from the list of living players and added to the list of dead `
        + `players. This prevents them from using any player commands, thus making them unable to interact with the `
        + `game world. When a player dies, they are dead permanently. To bring them back to life, they must be manually `
        + `edited on the spreadsheet. Only use this command if you are absolutely sure.\n\n`
        + `Upon death, the player will be removed from whatever room and whisper channels they were in. `
        + `The player will be notified, and a narration will be sent indicating that they have died. All status effects `
        + `the player had will be cleared. They will retain any items they had in their inventory, but they will not `
        + `be accessible in any way. In order to make the player's corpse inspectable, it must be manually added to the `
        + `appropriate location as a fixture, and their inventory items must be manually added as room items.\n\n`
        + `A dead player will retain the Player role. To remove the Player role and give them the Dead role, `
        + `use the \`reveal\` command.`,
    usableBy: "Moderator",
    aliases: ["kill", "die"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}kill Platt\n`
        + `${settings.commandPrefix}die Strickland Wu Obi Katou`;
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
        return game.communicationHandler.reply(message, `You need to specify at least one player. Usage:\n${usage(game.settings)}`);

    // Get all listed players first.
    /** @type {Player[]} */
    const players = [];
    for (let i = args.length - 1; i >= 0; i--) {
        const player = game.entityFinder.getLivingPlayer(args[i]);
        if (player) {
            players.push(player);
            args.splice(i, 1);
        }
    }
    if (args.length > 0) {
        const missingPlayers = args.join(", ");
        return game.communicationHandler.reply(message, `Couldn't find player(s): ${missingPlayers}.`);
    }

    for (let i = 0; i < players.length; i++) {
        const action = new DieAction(game, message, players[i], players[i].location, true);
        action.performDie();
    }

    game.communicationHandler.sendToCommandChannel("Listed players are now dead. Remember to use the reveal command when their bodies are discovered!");
}
