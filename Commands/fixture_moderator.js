import ActivateAction from '../Data/Actions/ActivateAction.ts';
import DeactivateAction from '../Data/Actions/DeactivateAction.ts';
import Room from '../Data/Room.ts';
import { endsWithPunctuation } from "../Modules/helpers.ts";

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "fixture_moderator",
    description: "Activates or deactivates a fixture.",
    details: `Activates or deactivates the specified fixture. When a fixture is activated, it will begin processing `
        + `the recipe with the highest count of ingredients satisfied by the room items contained inside of it. `
        + `If no recipe is found, it will look for one that it can process every second while it is activated. `
        + `Keep in mind that this command can only be used for fixtures with a recipe tag. If there is a puzzle whose `
        + `state is supposed to match that of the fixture's, you must use the \`puzzle\` command to update it separately.\n\n`
        + `If there are multiple fixtures with the same name, you can specify the room the fixture is in.\n\n`
        + `Alternatively, you may specify a player to activate/deactivate the fixture. In this case, only fixtures in the `
        + `same room as the player can be activated/deactivated. When a player is supplied, a narration will be sent.\n\n`
        + `It is possible to supply a custom narration for the fixture being activated/deactivated. Simply add a string of `
        + `text surrounded by quotation marks at the end of the command. This can be done even without supplying a player.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["fixture", "object", "activate", "deactivate"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}fixture activate BLENDER\n`
        + `${settings.commandPrefix}fixture deactivate MICROWAVE\n`
        + `${settings.commandPrefix}activate KEURIG Kyra\n`
        + `${settings.commandPrefix}deactivate OVEN Noko\n`
        + `${settings.commandPrefix}fixture activate FIREPLACE Log Cabin\n`
        + `${settings.commandPrefix}fixture deactivate FOUNTAIN flower-garden\n`
        + `${settings.commandPrefix}activate FREEZER gabriella "Gabriella plugs in the FREEZER."\n`
        + `${settings.commandPrefix}deactivate WASHER 1 laundry-room "WASHER 1 turns off"`;
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
    if (command === "fixture" || command === "object") {
        if (args[0] === "activate") command = "activate";
        else if (args[0] === "deactivate") command = "deactivate";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (command !== "activate" && command !== "deactivate") return game.communicationHandler.reply(message, 'Invalid command given. Use "activate" or "deactivate".');
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

    // Finally, find the fixture.
    let fixture = null;
    for (let i = 0; i < fixtures.length; i++) {
        if ((player !== null && fixtures[i].location.id === player.location.id)
            || (room !== null && fixtures[i].location.id === room.id)) {
            fixture = fixtures[i];
            break;
        }
    }
    if (fixture === null && player === null && room === null && fixtures.length > 0) fixture = fixtures[0];
    else if (fixture === null) return game.communicationHandler.reply(message, `Couldn't find fixture "${input}".`);
    if (fixture.recipeTag === "") return game.communicationHandler.reply(message, `${fixture.name} cannot be ${command}d because it has no recipe tag.`);

    let narrate = false;
    if (announcement !== "" || player !== null) narrate = true;

    if (command === "activate") {
        const activateAction = new ActivateAction(game, message, player, fixture.location, true);
        activateAction.performActivate(fixture, narrate, announcement);
        activateAction.sendSuccessMessageToCommandChannel();
    }
    else if (command === "deactivate") {
        const deactivateAction = new DeactivateAction(game, message, player, fixture.location, true);
        deactivateAction.performDeactivate(fixture, narrate, announcement);
        deactivateAction.sendSuccessMessageToCommandChannel();
    }
}
