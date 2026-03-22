/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "latch_moderator",
    description: "Latches onto an NPC.",
    details: "Latches onto an NPC player. If you issue a player-controlling command in a channel that the selected NPC "
        + "is in while you are latched, you do not have to specify which player to control. However, if you wish to "
        + "control a different player in that channel, you must still specify their name.\n\n"
        + "While latched, you can also speak for that NPC without using the `say` command. However, keep in mind that "
        + "this prevents you from sending narrations as a moderator in that channel.\n\n"
        + "Note that you cannot latch onto any player that is not an NPC.\n\n"
        + "To clear your latch, send the `latch` command without specifying an NPC, or use the `unlatch` alias.",
    usableBy: "Moderator",
    aliases: ["latch", "unlatch"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}latch unit_050\n`
        + `${settings.commandPrefix}latch Haru\n`
        + `${settings.commandPrefix}latch\n`
        + `${settings.commandPrefix}unlatch`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length === 0 || command === "unlatch") {
        if (moderator.getLatch() === null) return game.communicationHandler.reply(message, `Your latch is not currently set. You need to specify an NPC.`);
        else {
            moderator.clearLatch();
            return game.communicationHandler.sendToCommandChannel(`Successfully cleared latch for ${moderator.displayName}.`);
        }
    }

    const npc = game.entityFinder.getLivingPlayer(args[0]);
    if (npc === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    if (!npc.isNPC) return game.communicationHandler.reply(message, `You cannot latch onto a player that isn't an NPC.`);

    moderator.setLatch(npc);
    game.communicationHandler.sendToCommandChannel(`Successfully latched onto ${npc.name} for ${moderator.displayName}.`);
}
