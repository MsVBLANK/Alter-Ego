import AttemptAction from '../Data/Actions/AttemptAction.ts';
import SolveAction from '../Data/Actions/SolveAction.ts';
import UnsolveAction from '../Data/Actions/UnsolveAction.ts';
import Room from "../Data/Room.ts";

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "puzzle_moderator",
    description: "Solves or unsolves a puzzle.",
    details: `Solves or unsolves a puzzle. You may specify an outcome, if the puzzle has more than one solution. `
        + `When a puzzle is solved, it will execute the solved commands for the outcome it was solved with. `
        + `When a puzzle is unsolved, it will execute the unsolved commands for the outcome it currently has. `
        + `If there is a fixture whose state is supposed to match that of the puzzle's, you must use the \`fixture\` `
        + `command to update it separately.\n\n`
        + `If there are multiple puzzles with the same name, you can specify the room the puzzle is in.\n\n`
        + `Alternatively, you may specify a player to solve/unsolve the puzzle. In this case, only puzzles in the same `
        + `room as the player can be solved/unsolved. When a player is supplied, a narration will be sent.\n\n`
        + `It is possible to supply a custom narration for the puzzle being solved/unsolved. Simply add a string of `
        + `text surrounded by quotation marks at the end of the command. This can be done even without supplying a player.\n\n`
        + `Additionally, if you specify a player, you can make them attempt the puzzle with the \`attempt\` option. `
        + `This makes it possible to force the player to fail the puzzle because they didn't provide a correct `
        + `solution or they didn't satisfy the requirements for the puzzle to be solved/unsolved.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["puzzle", "solve", "unsolve", "attempt"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}puzzle solve TERMINAL\n`
        + `${settings.commandPrefix}puzzle unsolve SEARCH QUERY\n`
        + `${settings.commandPrefix}solve AISHA PROGRAM Ava\n`
        + `${settings.commandPrefix}unsolve BURIED TREASURE Jackie\n`
        + `${settings.commandPrefix}solve USERNAME jl\n`
        + `${settings.commandPrefix}solve USERNAME doublehelix\n`
        + `${settings.commandPrefix}puzzle solve CALL BUTTON Floor B2 Hall 1\n`
        + `${settings.commandPrefix}puzzle unsolve SWITCH dorm-6\n`
        + `${settings.commandPrefix}solve IRONWOOD TREES Jackie "Jackie takes a sturdy stance, holding her ax with confidence. With one-! two-! *three-!* swings, she chops through an IRONWOOD TREE, and it falls out of the way."\n`
        + `${settings.commandPrefix}unsolve LOGIN infirmary "The COMPUTER automatically logs out"\n`
        + `${settings.commandPrefix}puzzle attempt AISHA PROGRAM 05 4C 91 F1 04 1F AB F0 Ava\n`
        + `${settings.commandPrefix}attempt 3D PRINTER rabbit Huiyu`;
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
    let input = command + " " + args.join(" ");
    if (command === "puzzle") {
        if (args[0] === "solve") command = "solve";
        else if (args[0] === "unsolve") command = "unsolve";
        else if (args[0] === "attempt") command = "attempt";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to input all required arguments. Usage:\n${usage(game.settings)}`);

    // The message, if it exists, is the easiest to find at the beginning. Look for that first.
    let announcement = "";
    let index = input.indexOf('"');
    if (index === -1) index = input.indexOf('“');
    if (index !== -1) {
        announcement = input.substring(index + 1);
        // Remove the announcement from the list of arguments.
        input = input.substring(0, index - 1);
        args = input.split(" ");
        // Now clean up the announcement text.
        if (announcement.endsWith('"') || announcement.endsWith('”'))
            announcement = announcement.substring(0, announcement.length - 1);
        if (!announcement.endsWith('.') && !announcement.endsWith('!'))
            announcement += '.';
    }

    // Now find the player, who should be the last argument.
    let player = game.entityFinder.getLivingPlayer(args[args.length - 1]) ?? null;
    if (player) {
        args.splice(args.length - 1, 1);
        input = args.join(" ");
    }
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();

    // If a player wasn't specified, check if a room name was.
    /** @type {Room} */
    let room = null;
    if (player === null) {
        for (let i = args.length - 1; i >= 0; i--) {
            const parsedInput = Room.generateValidId(args.slice(i).join(" "));
            room = game.entityFinder.getRoom(parsedInput);
            if (room) {
                args.splice(i);
                break;
            }
        }
        if (!room) room = null;
    }
    input = args.join(" ");

    // Find the prospective list of puzzles.
    let puzzles = game.puzzles.filter(puzzle => input.toUpperCase().startsWith(puzzle.name + ' ') || input.toUpperCase() === puzzle.name);
    const locationId = player !== null ? player.location.id : room !== null ? room.id : undefined;
    if (locationId) puzzles = puzzles.filter(puzzle => puzzle.location.id === locationId);
    // Sort puzzles from longest name length to shortest, to give us the most precise match.
    puzzles.sort((a, b) => b.name.length - a.name.length);
    if (puzzles.length > 0) {
        input = input.substring(puzzles[0].name.length).trim();
        args = input.split(" ");
    }

    // Finally, find the puzzle.
    let puzzle = null;
    for (let i = 0; i < puzzles.length; i++) {
        if ((player !== null && puzzles[i].location.id === player.location.id)
            || (room !== null && puzzles[i].location.id === room.id)) {
            puzzle = puzzles[i];
            break;
        }
    }
    if (puzzle === null && player === null && room === null && puzzles.length > 0) puzzle = puzzles[0];
    else if (puzzle === null) return game.communicationHandler.reply(message, `Couldn't find puzzle "${input}".`);

    let outcome = "";
    let targetPlayer = null;
    if (player !== null && puzzle.type === "room player") {
        targetPlayer = game.entityFinder.getLivingPlayers(null, null, player.location.id).filter((player) => {
            player.displayName.toLowerCase() === input.toLowerCase() ||
                player.name.toLowerCase() === input.toLowerCase();
        })[0];
        if (!targetPlayer) targetPlayer === null;
    }
    for (let i = 0; i < puzzle.solutions.length; i++) {
        if (targetPlayer && puzzle.solutions[i].toLowerCase() === targetPlayer.displayName.toLowerCase() ||
            puzzle.type !== "room player" && puzzle.solutions[i].toLowerCase() === input.toLowerCase()) {
            outcome = puzzle.solutions[i];
            break;
        }
    }

    if (command === "solve") {
        if (puzzle.solutions.length > 1 && input !== "" && outcome === "") return game.communicationHandler.reply(message, `"${input}" is not a valid solution.`);
        const solveAction = new SolveAction(game, message, player, puzzle.location, true);
        solveAction.performSolve(puzzle, outcome, targetPlayer, announcement);
        solveAction.sendSuccessMessageToCommandChannel();
    }
    else if (command === "unsolve") {
        const unsolveAction = new UnsolveAction(game, message, player, puzzle.location, true);
        unsolveAction.performUnsolve(puzzle, announcement);
        unsolveAction.sendSuccessMessageToCommandChannel();
    }
    else if (command === "attempt") {
        if (player === null) return game.communicationHandler.reply(message, `Cannot attempt a puzzle without a player.`);
        const attemptAction = new AttemptAction(game, message, player, puzzle.location, true);
        attemptAction.performAttempt(puzzle, undefined, input, command, input, targetPlayer);
        attemptAction.sendSuccessMessageToCommandChannel();
    }
}
