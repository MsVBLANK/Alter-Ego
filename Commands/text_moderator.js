import TextAction from '../Data/Actions/TextAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "text_moderator",
    description: "Sends a text message from an NPC to a player.",
    details: `Sends a text message from the given NPC to a player. If an image is attached, it will be sent as well. `
        + `It is possible to send a text message to any player, even those that don't have a status effect with the `
        + `\`receive text\` behavior attribute.\n\n`
        + `This command supports NPC latching. For more information, see the help details for the \`latch\` command. `
        + `However, keep in mind that if you send a text with an attached image in the NPC's room channel, the message `
        + `will be deleted, and the attachment may not send properly.`,
    usableBy: "Moderator",
    aliases: ["text"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}text Amy Florian I work at the bar.\n`
        + `${settings.commandPrefix}text Amy Florian Here's a picture of me at work. (attached image)\n`
        + `${settings.commandPrefix}text ??? Sadie This is a message about your car's extended warranty.\n`
        + `${settings.commandPrefix}text ??? Lisa (attached image)`;
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
        return game.communicationHandler.reply(message, `You need to specify a sender, a recipient, and a message. Usage:\n${usage(game.settings)}`);
    if (sentMessageInLatchChannel && args.length < 1)
        return game.communicationHandler.reply(message, `You need to specify a recipient and a message. Usage:\n${usage(game.settings)}`);

    let recipient = game.entityFinder.getLivingPlayer(args[1]);
    if (recipient) args.splice(1, 1);
    if (!recipient && sentMessageInLatchChannel) {
        recipient = game.entityFinder.getLivingPlayer(args[0]);
        if (recipient) args.splice(0, 1);
    }

    let player = game.entityFinder.getLivingPlayer(args[0]);
    if (player)
        args.splice(0, 1);
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();
    if (player === undefined) return game.communicationHandler.reply(message, `Couldn't find player "${args[0]}".`);
    else if (!player.isNPC) return game.communicationHandler.reply(message, `You cannot text for a player that isn't an NPC.`);

    if (recipient === undefined) return game.communicationHandler.reply(message, `Couldn't find player "${args[0]}".`);
    if (recipient.name === player.name) return game.communicationHandler.reply(message, `${player.name} cannot send a message to ${player.originalPronouns.ref}.`);

    const input = args.join(" ");
    if (input === "" && message.attachments.size === 0) return game.communicationHandler.reply(message, `Text message cannot be empty. Please send a message and/or an attachment.`);

    const action = new TextAction(game, message, player, player.location, false);
    action.performText(recipient, input);
    action.sendSuccessMessageToCommandChannel();
}
