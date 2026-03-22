import AttemptAction from "../Data/Actions/AttemptAction.ts";
import SolveAction from "../Data/Actions/SolveAction.ts";
import UnsolveAction from "../Data/Actions/UnsolveAction.ts";
import Room from "../Data/Room.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "puzzle_bot",
    description: "Solves or unsolves a puzzle.",
    details: `Solves or unsolves a puzzle. You may specify an outcome, if the puzzle has more than one solution. `
        + `When a puzzle is solved, it will execute the solved commands for the outcome it was solved with. `
        + `When a puzzle is unsolved, it will execute the unsolved commands for the outcome it currently has. `
        + `If there is a fixture whose state is supposed to match that of the puzzle's, you must use the \`fixture\` `
        + `command to update it separately.\n\n`
        + `If there are multiple puzzles with the same name, you can specify the room the puzzle is in.\n\n`
        + `Alternatively, you may specify a player to solve/unsolve the puzzle. In this case, only puzzles in the same `
        + `room as the player can be solved/unsolved. When a player is supplied, a narration will be sent. `
        + `You may also enter "player" instead of directly specifying the name of a player. In this case, the player `
        + `who caused this command to be executed will be the one made to solve/unsolve the puzzle.\n\n`
        + `It is possible to supply a custom narration for the puzzle being solved/unsolved. Simply add a string of `
        + `text surrounded by quotation marks at the end of the command. This can be done even without supplying a player. `
        + `If the "player" argument is used, the text "player" (case-sensitive) within a custom narration will be `
        + `replaced with the display name of the player who solves/unsolves the puzzle.\n\n`
        + `Additionally, if you specify a player, you can make them attempt the puzzle with the \`attempt\` option. `
        + `This makes it possible to force the player to fail the puzzle because they didn't provide a correct `
        + `solution or they didn't satisfy the requirements for the puzzle to be solved/unsolved.`,
    usableBy: "Bot",
    aliases: ["puzzle", "solve", "unsolve", "attempt"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `puzzle solve TERMINAL\n`
        + `puzzle unsolve SEARCH QUERY\n`
        + `solve AISHA PROGRAM Ava\n`
        + `unsolve BURIED TREASURE Jackie\n`
        + `solve USERNAME jl\n`
        + `solve USERNAME doublehelix\n`
        + `puzzle solve CALL BUTTON Floor B2 Hall 1\n`
        + `puzzle unsolve SWITCH dorm-6\n`
        + `solve DRINK IN PROGRESS player "Amy begins preparing a drink for player."\n`
        + `unsolve DRINK IN PROGRESS player "Amy places a glass of TEQUILA SUNRISE on the BAR counter for player."\n`
        + `puzzle attempt COMPARTMENT player\n`
        + `attempt 3D PRINTER rabbit Huiyu`;
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
    let input = cmdString;
    if (command === "puzzle") {
        if (args[0] === "solve") command = "solve";
        else if (args[0] === "unsolve") command = "unsolve";
        else if (args[0] === "attempt") command = "attempt";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (args.length === 0) {
        game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Insufficient arguments.`);
        return;
    }

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
    if (args[args.length - 1] === "player" && player !== null) {
        args.splice(args.length - 1, 1);
        input = args.join(" ");
        announcement = announcement.replace(/player/g, player.displayName);
    }
    else {
        player = game.entityFinder.getLivingPlayer(args[args.length - 1]) ?? null;
        if (player) {
            args.splice(args.length - 1, 1);
            input = args.join(" ");
        }
    }

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
    if (puzzle === null) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find puzzle "${input}".`);

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
        if (puzzle.solutions.length > 1 && input !== "" && outcome === "") return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". "${input}" is not a valid solution.`);
        const solveAction = new SolveAction(game, undefined, player, puzzle.location, true);
        solveAction.performSolve(puzzle, outcome, targetPlayer, announcement, callee);
    }
    else if (command === "unsolve") {
        const unsolveAction = new UnsolveAction(game, undefined, player, puzzle.location, true);
        unsolveAction.performUnsolve(puzzle, announcement, callee);
    }
    else if (command === "attempt") {
        if (player === null) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Cannot attempt a puzzle without a player.`);
        const attemptAction = new AttemptAction(game, undefined, player, puzzle.location, true);
        attemptAction.performAttempt(puzzle, undefined, input, command, input, targetPlayer);
    }
}
