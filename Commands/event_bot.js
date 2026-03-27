import EndAction from '../Data/Actions/EndAction.ts';
import TriggerAction from "../Data/Actions/TriggerAction.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "event_bot",
    description: "Triggers or ends an event.",
    details: `Triggers or ends the specified event.\n\n`
        + `If \`trigger\` is used, the event must not already be ongoing. Its triggered commands will be executed. `
        + `If \`end\` is used, the event must be ongoing. Its ended commands will be executed.\n\n`
        + `Triggered/ended commands will not be executed if this command was called by the triggered/ended commands of `
        + `another event. They will executed if they were called by the commands of a different type of game entity, however.`,
    usableBy: "Bot",
    aliases: ["event", "trigger", "end"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `event trigger RAIN\n`
        + `event end EXPLOSION\n`
        + `trigger INTRUDER LOOSE ALERT\n`
        + `end BLACKOUT`;
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
    if (command === "event") {
        if (args[0] === "trigger") command = "trigger";
        else if (args[0] === "end") command = "end";
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (command !== "trigger" && command !== "end")
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Invalid command given. Use "trigger" or "end".`);
    if (args.length === 0)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". No event was given.`);

    input = args.join(" ");
    const event = game.entityFinder.getEvent(input);
    if (event === undefined) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find event "${input}".`);
    if (command === "trigger") {
        if (event.ongoing) return;
        const action = new TriggerAction(game, undefined, player, player?.location, true);
        await action.performTrigger(event, callee);
    }
    else if (command === "end") {
        if (!event.ongoing) return;
        const action = new EndAction(game, undefined, player, player?.location, true);
        await action.performEnd(event, callee);
    }
}
