/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setdisplayname_moderator",
    description: "Sets a player's display name.",
    details: `Sets the name that will be used to refer to a player in narrations in lieu of their actual name. It will `
        + `also be set as their username when their communications are reflected with webhook messages. Webhook `
        + `messages are primarily sent in spectate channels to reflect a player's dialog, narrations, and monologs. `
        + `However, webhook messages are also sent in room and whisper channels when a player uses the \`say\`, `
        + `\`gesture\`, and \`narrate\` commands. Because NPCs don't have Discord accounts, *all* of their `
        + `communications are sent as webhook messages.\n\n`
        + `To set a player's display name, enter their actual name, followed by the new display name. Display names can `
        + `contain spaces, but they have a maximum length of 32 characters. If the display name does not begin with a `
        + `proper noun, the first letter should not be capitalized.\n\n`
        + `Setting a player's display name will not change their name on the spreadsheet, and when player data is `
        + `reloaded, their display name will be reverted to their actual name.\n\n`
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `display name will be updated, thus overwriting one that was set manually. However, this command can be used `
        + `to update their display name again afterwards. When the status is cured, their display name will be reset.\n\n`
        + `This command will not change the player's nickname in the server.`,
    usableBy: "Moderator",
    aliases: ["setdisplayname", "sdn"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}setdisplayname Sadie Zinnia\n`
        + `${settings.commandPrefix}sdn Kyra an individual wearing a PLAGUE DOCTOR MASK\n`
        + `${settings.commandPrefix}setdisplayname Sadie Sadie`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a player and a display name. Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0]);
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    args.splice(0, 1);

    const input = args.join(" ");
    if (input.length > 32) return game.communicationHandler.reply(message, `A name cannot exceed 32 characters.`);

    player.displayName = input;
    player.location.setOccupantsString();
    game.communicationHandler.sendToCommandChannel(`Successfully updated ${player.name}'s display name.`);
}
