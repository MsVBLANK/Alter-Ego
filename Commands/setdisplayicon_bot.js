/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setdisplayicon_bot",
    description: "Sets a player's display icon.",
    details: `Sets the icon that will appear as the given player's avatar when their communications are mirrored as `
        + `webhook messages. Webhook messages are primarily sent in spectate channels to reflect a player's dialog, `
        + `narrations, and monologs. However, webhook messages are also sent in room and whisper channels when a player `
        + `uses the \`say\`, \`gesture\`, and \`narrate\` commands. Because NPCs don't have Discord accounts, *all* of `
        + `their communications are sent as webhook messages.\n\n`
        + `To set a player's display icon, you must provide an image URL with an extension of `
        + `.jpg, .jpeg, .png, .webp, or .avif. To reset a player's display icon to their default display icon, `
        + `simply specify the player without providing an image URL. If you enter "player" instead of a player's name, `
        + `then the player who caused this command to be executed will have their display icon set.\n\n`
        + `When player data is reloaded, all players will have their display icon reverted to their default display `
        + `icon. For standard players, this is their server avatar, or their account avatar if they don't have one set. `
        + `For NPCs, this is the display icon given for them on the sheet in lieu of a Discord user ID.\n\n`
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `display icon will be updated to the image URL set in the \`DEFAULT_CONCEALED_ICON_URL\` setting in your `
        + `\`.env\` file, thus overwriting one that was set manually. However, this command can be used to update their `
        + `display icon again afterwards. When the status is cured, it will be reset to their default display icon.\n\n`
        + `This command will not change the player's avatar when they send messages to room channels normally.`,
    usableBy: "Bot",
    aliases: ["setdisplayicon", "sdi"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `setdisplayicon kyra https://cdn.discordapp.com/attachments/697623260736651335/912103115241697301/mm.png\n`
        + `setdisplayicon player https://cdn.discordapp.com/attachments/697623260736651335/911381958553128960/questionmark.png\n`
        + `setdisplayicon player`;
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

    if (args[0].toLowerCase() !== "player") {
        player = game.entityFinder.getLivingPlayer(args[0]);
        if (player === undefined) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Player "${args[0]}" not found.`);
    }
    else if (args[0].toLowerCase() === "player" && player === null)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". The "player" argument was used, but no player was passed into the command.`);

    args.splice(0, 1);

    let input = args.join(" ").replace(/(?<=http(s?))@(?=.*?(jpg|jpeg|png|webp|avif))/g, ':').replace(/(?<=http(s?):.*?)\\(?=.*?(jpg|jpeg|png|webp|avif))/g, '/');
    const iconURLSyntax = /(http(s?):\/\/.*?\.(jpg|jpeg|png|webp|avif))(\?[^\s]*)?$/;
    if (input === "") {
        if (player.isNPC) input = player.id;
        else input = null;
    }
    else if (!iconURLSyntax.test(input)) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". The display icon must be a URL with an extension of .jpg, .jpeg, .png, .webp, or .avif.`);

    player.displayIcon = input;
}
