/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setdisplayname_bot",
    description: "Sets a player's display name.",
    details: `Sets the name that will be used to refer to a player in narrations in lieu of their actual name. It will `
        + `also be set as their username when their communications are reflected with webhook messages. Webhook `
        + `messages are primarily sent in spectate channels to reflect a player's dialog, narrations, and monologs. `
        + `However, webhook messages are also sent in room and whisper channels when a player uses the \`say\`, `
        + `\`gesture\`, and \`narrate\` commands. Because NPCs don't have Discord accounts, *all* of their `
        + `communications are sent as webhook messages.\n\n`
        + `To set a player's display name, enter their actual name, followed by the new display name. Display names can `
        + `contain spaces, but they have a maximum length of 32 characters. If the display name does not begin with a `
        + `proper noun, the first letter should not be capitalized. To reset a player's display name to their actual `
        + `name, simply specify the player without providing a display name. If you enter "player" instead of a `
        + `player's name, then the player who caused this command to be executed will have their display name set.\n\n`
        + `Setting a player's display name will not change their name on the spreadsheet, and when player data is `
        + `reloaded, their display name will be reverted to their actual name.\n\n`
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `display name will be updated, thus overwriting one that was set manually. However, this command can be used `
        + `to update their display name again afterwards. When the status is cured, their display name will be reset.\n\n`
        + `This command will not change the player's nickname in the server.`,
    usableBy: "Bot",
    aliases: ["setdisplayname", "sdn"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `setdisplayname Sadie Zinnia\n`
        + `sdn player an individual wearing a PLAGUE DOCTOR MASK\n`
        + `setdisplayname player\n`
        + `sdn player`;
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

    let input = args.join(" ");
    if (input === "") input = player.name;
    if (input.length > 32) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". A name cannot exceed 32 characters.`);

    player.displayName = input;
    player.location.setOccupantsString();
}
