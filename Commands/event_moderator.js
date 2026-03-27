import EndAction from '../Data/Actions/EndAction.ts';
import TriggerAction from "../Data/Actions/TriggerAction.ts";

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "event_moderator",
    description: "Triggers or ends an event.",
    details: `Triggers or ends the specified event.\n\n`
        + `If \`trigger\` is used, the event must not already be ongoing. Its triggered commands will be executed. `
        + `If \`end\` is used, the event must be ongoing. Its ended commands will be executed.`,
    usableBy: "Moderator",
    aliases: ["event", "trigger", "end"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}event trigger RAIN\n`
        + `${settings.commandPrefix}event end EXPLOSION\n`
        + `${settings.commandPrefix}trigger INTRUDER LOOSE ALERT\n`
        + `${settings.commandPrefix}end BLACKOUT`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    let input = command + " " + args.join(" ");
    if (command === "event") {
        if (args[0] === "trigger") command = "trigger";
        else if (args[0] === "end") command = "end";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (command !== "trigger" && command !== "end") return game.communicationHandler.reply(message, 'Invalid command given. Use "trigger" or "end".');
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify an event. Usage:\n${usage(game.settings)}`);

    input = args.join(" ");
    const event = game.entityFinder.getEvent(input);
    if (event === undefined) return game.communicationHandler.reply(message, `Couldn't find event "${input}".`);
    if (command === "trigger") {
        if (event.ongoing) return game.communicationHandler.reply(message, `${event.id} is already ongoing.`);
        const action = new TriggerAction(game, message, undefined, undefined, true);
        await action.performTrigger(event);
        action.sendSuccessMessageToCommandChannel();
    }
    else if (command === "end") {
        if (!event.ongoing) return game.communicationHandler.reply(message, `${event.id} is not currently ongoing.`);
        const action = new EndAction(game, message, undefined, undefined, true);
        await action.performEnd(event);
        action.sendSuccessMessageToCommandChannel();
    }
}
