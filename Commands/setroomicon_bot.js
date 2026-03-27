/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setroomicon_bot",
    description: "Sets a room's display icon.",
    details: `Sets the icon that will display when the given room's information is sent to a player. This will override `
        + `whatever is set as the \`DEFAULT_ROOM_ICON_URL\` setting in your \`.env\` file, but only for the given room. `
        + `The icon given must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. `
        + `To reset a room's icon, simply do not specify a new icon. When this command is used, the new icon will be `
        + `saved to the sheet in place of the old one.`,
    usableBy: "Bot",
    aliases: ["setroomicon"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `setroomicon Living Room https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png\n`
        + `setroomicon kitchen`;
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
    if (args.length === 0)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Insufficient arguments.`);

    let input = args.join(" ");

    let room = undefined;
    for (let i = args.length; i > 0; i--) {
        room = game.entityFinder.getRoom(args.slice(0, i).join(" "));
        if (room)
            break;
    }

    if (room === undefined)
        game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Room "${input}" not found.`);

    const iconURLSyntax = /(http(s?):\/\/.*?\.(jpg|jpeg|png|gif|webp|avif))(\?[^\s]*)?$/;
    input = input.replace(iconURLSyntax, '$1').replace(/(?<=http(s?))@(?=.*?(jpg|jpeg|png|gif|webp|avif))/g, ':').replace(/(?<=http(s?):.*?)\\(?=.*?(jpg|jpeg|png|gif|webp|avif))/g, '/');
    if (!iconURLSyntax.test(input)) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". The display icon must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension.`);

    room.iconURL = input;
}
