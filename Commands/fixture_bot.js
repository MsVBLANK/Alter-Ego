import ActivateAction from "../Data/Actions/ActivateAction.ts";
import DeactivateAction from "../Data/Actions/DeactivateAction.ts";
import Room from "../Data/Room.ts";
import { endsWithPunctuation } from "../Modules/helpers.ts";

/** @import Fixture from '../Data/Fixture.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "fixture_bot",
    description: "Activates or deactivates a fixture, or sets its recipe tag.",
    details: `This command has three sub-commands:\n\n`
        + `- **activate**: Activates the specified fixture. When a fixture is activated, it will begin processing the `
        + `recipe with the highest count of ingredients satisfied by the room items contained inside of it. `
        + `If no recipe is found, it will look for one that it can process every second while it is activated.\n`
        + `- **deactivate**: Deactivates the specified fixture. It will stop processing and looking for recipes.\n`
        + `- **tag**: Sets the fixture's recipe tag. This will immediately stop any ongoing recipe processes. `
        + `If it is currently activated, it will begin looking for recipes it can process that satisfy the new tag. `
        + `The spreadsheet will be updated with the new tag on the next save.\n\n`
        + `Keep in mind that a fixture can only be activated/deactivated if it has a recipe tag. If there is a puzzle whose `
        + `state is supposed to match that of the fixture's, you must use the \`puzzle\` command to update it separately.\n\n`
        + `If there are multiple fixtures with the same name, you can specify the room the fixture is in.\n\n`
        + `Alternatively, you may specify a player to activate/deactivate the fixture. In this case, only fixtures in the `
        + `same room as the player can be activated/deactivated. When a player is supplied, a narration will be sent. `
        + `You may also enter "player" instead of directly specifying the name of a player. In this case, the player `
        + `who caused this command to be executed will be the one made to activate/deactivate the fixture.\n\n`
        + `It is possible to supply a custom narration for the fixture being activated/deactivated. Simply add a string of `
        + `text surrounded by quotation marks at the end of the command. This can be done even without supplying a player. `
        + `If the "player" argument is used, the text "player" (case-sensitive) within a custom narration will be `
        + `replaced with the display name of the player who activates/deactivates the fixture.`,
    usableBy: "Bot",
    aliases: ["fixture", "object", "activate", "deactivate"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `fixture activate BLENDER\n`
        + `fixture deactivate MICROWAVE\n`
        + `fixture tag BLENDER puree\n`
        + `activate KEURIG Kyra\n`
        + `deactivate OVEN player\n`
        + `fixture activate FIREPLACE Log Cabin\n`
        + `fixture deactivate FOUNTAIN flower-garden\n`
        + `fixture tag BLENDER puree kitchen\n`
        + `activate FREEZER player "player plugs in the FREEZER."\n`
        + `deactivate WASHER 1 laundry-room "WASHER 1 turns off"`;
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
    if (command === "fixture" || command === "object") {
        if (args[0] === "activate") command = "activate";
        else if (args[0] === "deactivate") command = "deactivate";
        else if (args[0] === "tag") command = "tag";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (command !== "activate" && command !== "deactivate" && command !== "tag")
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Invalid command given. Use "activate", "deactivate", or "tag".`);
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
        if (!endsWithPunctuation(announcement))
            announcement += '.';
    }

    // Find the prospective list of fixtures.
    const fixtures = game.fixtures.filter(fixture => input.toUpperCase().startsWith(fixture.name + ' ') || input.toUpperCase() === fixture.name);
    if (fixtures.length > 0) {
        input = input.substring(fixtures[0].name.length).trim();
        args = input.split(" ");
    }

    // Now find the player, who should be the last argument.
    if (command !== "tag") {
        if (args[args.length - 1] === "player" && player) {
            args.splice(args.length - 1, 1);
            input = args.join(" ");
            announcement = announcement.replace(/player/g, player.displayName);
        }
        else {
            player = game.entityFinder.getLivingPlayer(args[args.length - 1]);
            if (player) {
                args.splice(args.length - 1, 1);
                input = args.join(" ");
            } else
                player = null
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

    // Finally, find the fixture.
    /** @type {Fixture} */
    let fixture = null;
    for (let i = 0; i < fixtures.length; i++) {
        if ((player !== null && fixtures[i].location.id === player.location.id)
            || (room !== null && fixtures[i].location.id === room.id)) {
            fixture = fixtures[i];
            break;
        }
    }
    if (fixture === null && player === null && room === null && fixtures.length > 0) fixture = fixtures[0];
    else if (fixture === null) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find fixture "${input}".`);
    if (command !== "tag" && fixture.recipeTag === "") return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". ${fixture.name} cannot be ${command}d because it has no recipe tag.`);

    let narrate = false;
    if (announcement === "" && player !== null) narrate = true;

    if (command === "activate") {
        const activateAction = new ActivateAction(game, undefined, player, fixture.location, true);
        activateAction.performActivate(fixture, narrate, announcement);
    }
    else if (command === "deactivate") {
        const deactivateAction = new DeactivateAction(game, undefined, player, fixture.location, true);
        deactivateAction.performDeactivate(fixture, narrate, announcement);
    }
    else if (command === "tag") {
        if (!input) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". No tag to apply to ${fixture.name} was given.`);
        if (input.trim() === fixture.recipeTag) return;
        fixture.setRecipeTag(input);
    }
}
