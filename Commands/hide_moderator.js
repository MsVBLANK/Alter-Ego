import HideAction from '../Data/Actions/HideAction.ts';
import UnhideAction from '../Data/Actions/UnhideAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "hide_moderator",
    description: "Hides a player in the given fixture.",
    details: `Forcibly hides a player in the specified fixture. They will be able to hide in the specified fixture `
        + `even if it is attached to a lock-type puzzle that is unsolved, and even if the hiding spot is beyond its `
        + `capacity. To force them out of hiding, use the \`unhide\` command.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command.`,
    usableBy: "Moderator",
    aliases: ["hide", "unhide"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}hide Xenia DESK\n`
        + `${settings.commandPrefix}hide Kiara SHOWER 1\n`
        + `${settings.commandPrefix}unhide Aisha`;
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
    if (!sentMessageInLatchChannel && args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify a player. Usage:\n${usage(game.settings)}`);

    let player = game.entityFinder.getLivingPlayer(args[0]);
    if (player && (moderator.getLatch() === null || moderator.getLatch().name.toLowerCase() !== args[0].toLowerCase()))
        args.splice(0, 1);
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);

    if (player.status.has("hidden") && command === "unhide") {
        const unhideAction = new UnhideAction(game, message, player, player.location, true);
        unhideAction.performUnhide();
        unhideAction.sendSuccessMessageToCommandChannel();
    }
    else if (player.status.has("hidden"))
        return game.communicationHandler.reply(message, `${player.name} is already **hidden**. If you want ${player.originalPronouns.obj} to stop hiding, use "${game.settings.commandPrefix}unhide ${player.name}".`);
    else if (command === "unhide")
        return game.communicationHandler.reply(message, `${player.name} is not currently hidden.`);
    // Player is currently not hidden and the hide command is being used.
    else {
        if (args.length === 0)
            return game.communicationHandler.reply(message, `You need to specify a fixture. Usage:\n${usage(game.settings)}`);

        const input = args.join(" ");
        const parsedInput = input.toUpperCase().replace(/\'/g, "");

        // Check if the input is a fixture that the player can hide in.
        const fixtures = game.fixtures.filter(fixture => fixture.location.id === player.location.id && fixture.accessible);
        let fixture = null;
        for (let i = 0; i < fixtures.length; i++) {
            if (fixtures[i].name === parsedInput && fixtures[i].hidingSpotCapacity > 0) {
                fixture = fixtures[i];
                break;
            }
            else if (fixtures[i].name === parsedInput)
                return game.communicationHandler.reply(message, `${fixtures[i].name} is not a hiding spot.`);
        }
        if (fixture === null) return game.communicationHandler.reply(message, `Couldn't find fixture "${input}".`);

        const hideAction = new HideAction(game, message, player, player.location, true);
        hideAction.performHide(fixture.hidingSpot);
        hideAction.sendSuccessMessageToCommandChannel();
    }
}
