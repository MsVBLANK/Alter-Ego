/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setdisplayicon_moderator",
    description: "Sets a player's display icon.",
    details: `Sets the icon that will appear as the given player's avatar when their communications are mirrored as `
        + `webhook messages. Webhook messages are primarily sent in spectate channels to reflect a player's dialog, `
        + `narrations, and monologs. However, webhook messages are also sent in room and whisper channels when a player `
        + `uses the \`say\`, \`gesture\`, and \`narrate\` commands. Because NPCs don't have Discord accounts, *all* of `
        + `their communications are sent as webhook messages.\n\n`
        + `To set a player's display icon, you must provide an image URL with an extension of `
        + `.jpg, .jpeg, .png, .webp, or .avif. To reset a player's display icon to their default display icon, `
        + `simply specify the player without providing an image URL.\n\n`
        + `When player data is reloaded, all players will have their display icon reverted to their default display `
        + `icon. For standard players, this is their server avatar, or their account avatar if they don't have one set. `
        + `For NPCs, this is the display icon given for them on the sheet in lieu of a Discord user ID.\n\n`
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `display icon will be updated to the image URL set in the \`DEFAULT_CONCEALED_ICON_URL\` setting in your `
        + `\`.env\` file, thus overwriting one that was set manually. However, this command can be used to update their `
        + `display icon again afterwards. When the status is cured, it will be reset to their default display icon.\n\n`
        + `This command will not change the player's avatar when they send messages to room channels normally.`,
    usableBy: "Moderator",
    aliases: ["setdisplayicon", "sdi"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}setdisplayicon kyra https://cdn.discordapp.com/attachments/697623260736651335/912103115241697301/mm.png\n`
        + `${settings.commandPrefix}setdisplayicon kyra`;
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
        return game.communicationHandler.reply(message, `You need to specify a player. Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0]);
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    args.splice(0, 1);

    const iconURLSyntax = /(http(s?):\/\/.*?\.(jpg|jpeg|png|webp|avif))(\?[^\s]*)?$/;
    let input = args.join(" ");
    if (input === "") {
        if (player.isNPC) input = player.id;
        else input = null;
    }
    else if (!iconURLSyntax.test(input)) return game.communicationHandler.reply(message, `The display icon must be a URL with an extension of .jpg, .jpeg, .png, .webp, or .avif.`);

    player.displayIcon = input;
    game.communicationHandler.sendToCommandChannel(`Successfully updated ${player.name}'s display icon.`);
}
