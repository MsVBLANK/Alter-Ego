import MoveAction from '../Data/Actions/MoveAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "move_moderator",
    description: "Moves the given player to the specified room or exit.",
    details: `Forcibly moves the given players to the specified room or exit. When a player is moved, they will be `
        + `removed from the room channel they were already in and added to the destination room channel. `
        + `They will move to the given destination immediately, without consuming any stamina, and with no regard for `
        + `whether the room is adjacent to their current room or the exit leading to it is locked.\n\n`
        + `You can select multiple players by separating their names with a space. If instead of providing the names of `
        + `players, you enter "living" or "all", all living players will be moved to the specified room, except for `
        + `players who are already in that room, NPCs, and players with the Free Movement role.\n\n`
        + `When this command is used to move a player to a room that is not adjacent to their current room, `
        + `the narration in the destination room will not specify which exit they entered from.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["move", "go", "enter", "walk", "m"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}move Kiki DOOR 2\n`
        + `${settings.commandPrefix}enter Kiki Lingling Maple Wally biosphere-garden\n`
        + `${settings.commandPrefix}go living Dining Hall\n`
        + `${settings.commandPrefix}m all ELEVATOR`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const sentMessageInLatchChannel = moderator?.sentMessageInLatchChannel(message) ?? false;
    if (!sentMessageInLatchChannel && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify at least one player and a room. Usage:\n${usage(game.settings)}`);
    else if (sentMessageInLatchChannel && args.length < 1)
        return game.communicationHandler.reply(message, `You need to specify a room. Usage:\n${usage(game.settings)}`);

    // Get all listed players first.
    const players = [];
    if (args[0] === "all" || args[0] === "living") {
        game.entityFinder.getLivingPlayers(null, false).map((player) => {
            if (!game.guildContext.hasFreeMovementRole(player.member))
                players.push(player);
        });
        args.splice(0, 1);
    }
    else {
        for (let i = args.length - 1; i >= 0; i--) {
            const fetchedPlayer = game.entityFinder.getLivingPlayer(args[i]);
            if (fetchedPlayer) {
                players.push(fetchedPlayer);
                args.splice(i, 1);
            }
        }
        if (players.length === 0 && sentMessageInLatchChannel) players.push(moderator.getLatch());
    }

    // Args at this point should only include the room/exit name, as well as any players that weren't found.
    // Check to see that the last argument is the name of a room.
    let input = args.join(" ").replace(/\'/g, "").replace(/ /g, "-").toLowerCase();
    let desiredRoom = null;
    for (let i = 0; i < args.length; i++) {
        const searchString = args.slice(i).join(" ").replace(/\'/g, "").replace(/ /g, "-").toLowerCase();
        desiredRoom = game.entityFinder.getRoom(searchString);
        if (desiredRoom) {
            input = input.substring(0, input.indexOf(desiredRoom.id));
            args = input.split("-");
            break;
        }
    }
    // Now, if the room couldn't be found, try looking for the name of an exit.
    // All given players must be in the same room for this to work.
    let isExit = false;
    let exit = null;
    let entrance = null;
    if (!desiredRoom && players.length !== 0) {
        const currentRoom = players[0].location;
        for (let i = 1; i < players.length; i++) {
            if (players[i].location !== currentRoom) return game.communicationHandler.reply(message, "All listed players must be in the same room to use an exit name.");
        }
        input = args.join(" ").toUpperCase();
        for (let i = 0; i <= args.length; i++) {
            const searchString = args.slice(i).join(" ")
            exit = game.entityFinder.getExit(currentRoom, searchString);
            if (exit) {
                isExit = true;
                desiredRoom = exit.dest;
                entrance = game.entityFinder.getExit(desiredRoom, exit.link);
                input = input.substring(0, input.indexOf(exit.name));
                args = input.split(" ")
                break;
            }
        }
    }
    // Remove any blank entries in args.
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '') {
            args.splice(i, 1);
            i--;
        }
    }
    if (args.length > 0) {
        if (!desiredRoom && !exit) {
            const roomName = args.join(" ");
            return game.communicationHandler.reply(message, `Couldn't find room or exit "${roomName}".`);
        }
        else {
            const missingPlayers = args.join(", ");
            return game.communicationHandler.reply(message, `Couldn't find player(s): ${missingPlayers}.`);
        }
    }
    if (players.length === 0) return game.communicationHandler.reply(message, "You need to specify at least one player.");

    for (let i = 0; i < players.length; i++) {
        // Skip over players who are already in the specified room.
        if (players[i].location !== desiredRoom) {
            const currentRoom = players[i].location;
            // If an exit name was used, don't try and find it again.
            if (!isExit) {
                // Check to see if the given room is adjacent to the current player's room.
                exit = null;
                entrance = null;
                for (const iterExit of currentRoom.exits.values()) {
                    if (iterExit.dest.id === desiredRoom.id) {
                        exit = iterExit;
                        entrance = game.entityFinder.getExit(desiredRoom, exit.link);
                        break;
                    }
                }
            }

            // Clear the player's movement timer first.
            players[i].stopMoving();
            // Move the player.
            const action = new MoveAction(game, message, players[i], players[i].location, true);
            action.performMove(false, currentRoom, desiredRoom, exit, entrance);
        }
    }

    game.communicationHandler.sendToCommandChannel(`The listed players have been moved to ${desiredRoom.channel}.`);
}
