/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setroomicon_moderator",
    description: "Sets a room's icon.",
    details: `Sets the icon that will display when the given room's information is sent to a player. This will override `
        + `whatever is set as the \`DEFAULT_ROOM_ICON_URL\` setting in your \`.env\` file, but only for the given room. `
        + `The icon given must be an attachment or URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. `
        + `To reset a room's icon, simply do not specify a new icon. When this command is used, the new icon will be `
        + `saved to the sheet in place of the old one.`,
    usableBy: "Moderator",
    aliases: ["setroomicon"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}setroomicon Living Room https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png\n`
        + `${settings.commandPrefix}setroomicon kitchen`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify a room. Usage:\n${exports.config.usage}`);

    let input = args.join(" ");

    let room = undefined;
    for (let i = args.length; i > 0; i--) {
        room = game.entityFinder.getRoom(args.slice(0, i).join(" "));
        if (room)
            break;
    }
    if (room === undefined) return game.communicationHandler.reply(message, `Couldn't find room "${input}".`);

    const iconURLSyntax = /(http(s?):\/\/.*?\.(jpg|jpeg|png|gif|webp|avif))(\?[^\s]*)?$/;
    input = input.replace(iconURLSyntax, '$1');
    if (input.length === 0) {
        if (message.attachments.size !== 0)
            input = message.attachments.first().url.replace(iconURLSyntax, '$1');
    }
    if (!iconURLSyntax.test(input) && input !== "") return game.communicationHandler.reply(message, `The display icon must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension.`);

    room.iconURL = input;
    game.communicationHandler.sendToCommandChannel(`Successfully updated the icon for ${room.id}.`);
}
