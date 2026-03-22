import Event from "../Data/Event.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "kill_bot",
    description: "Kills a player.",
    details: `Kills the listed players. Player names must be separated by a space. If, instead of specifying the names `
        + `of players, you enter "player", then the player who caused this command to be executed will be killed. If `
        + `"room" is used instead, then all players in the room with the initiating player will be killed, including `
        + `NPCs and players with the Free Movement role. However, if the command was issued by an event and the "room" `
        + `argument is used, all players in all rooms that have the event's room tag will be killed.\n\n`
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
    usableBy: "Bot",
    aliases: ["kill", "die"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `kill Platt\n`
        + `die Strickland Wu Obi Katou\n`
        + `kill player\n`
        + `die room`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} [player] - The player who caused the command to be executed, if applicable.
 * @param {Callee} [callee] - The in-game entity that caused the command to be executed, if applicable.
 */
export async function execute(game, command, args, player, callee) {
    const cmdString = command + " " + args.join(" ");
    if (args.length === 0) {
        game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". No players were specified.`);
        return;
    }

    // Determine which player(s) are being killed.
    let players = [];
    if (args[0].toLowerCase() === "player" && player !== null)
        players.push(player);
    else if (args[0].toLowerCase() === "room" && callee !== null && callee instanceof Event) {
        // Command was triggered by an Event. Get occupants of all rooms affected by it.
        game.entityFinder.getRooms(null, callee.roomTag, true).map((room) => {
            players = players.concat(room.occupants);
        });
    }
    else if (args[0].toLowerCase() === "room" && player !== null)
        players = player.location.occupants;
    else {
        player = null;
        for (let i = args.length - 1; i >= 0; i--) {
            const fetchedPlayer = game.entityFinder.getLivingPlayer(args[i]);
            if (fetchedPlayer) {
                players.push(fetchedPlayer);
                args.splice(i, 1);
            }
        }
        if (args.length > 0) {
            const missingPlayers = args.join(", ");
            return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find player(s): ${missingPlayers}.`);
        }
    }

    for (let i = 0; i < players.length; i++)
        players[i].die();
}
