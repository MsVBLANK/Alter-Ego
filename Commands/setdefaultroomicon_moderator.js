/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setdefaultroomicon_moderator",
    description: "Sets the default room icon.",
    details: `Sets the icon that will display by default when the given room's information is sent to a player, if `
        + `there exists no specific icon for that room. The icon given must be a URL with a .jpg, .jpeg, .png, .gif, `
        + `.webp, or .avif extension. To reset the default icon, simply do not specify a new icon.\n\n`
        + `Note that this will not persist across bot reboots. When the bot is rebooted, the default room icon will be `
        + `reverted to whatever is set for the \`DEFAULT_ROOM_ICON_URL\` setting in your \`.env\` file.`,
    usableBy: "Moderator",
    aliases: ["setdefaultroomicon"],
    requiresGame: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}setdefaultroomicon https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png\n`
        + `${settings.commandPrefix}setdefaultroomicon`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const iconURLSyntax = /(http(s?):\/\/.*?\.(jpg|jpeg|png|gif|webp|avif))(\?[^\s]*)?$/;
    let input = args.join(" ");
    if (input.length === 0) {
        if (message.attachments.size !== 0)
            input = message.attachments.first().url.replace(iconURLSyntax, '$1');
    }
    if (!iconURLSyntax.test(input) && input !== "") return game.communicationHandler.reply(message, `The display icon must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension.`);

    game.settings.defaultRoomIconURL = input;
    game.communicationHandler.sendToCommandChannel(`Successfully updated the default room icon.`);
}
