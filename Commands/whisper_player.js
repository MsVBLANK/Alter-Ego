import WhisperAction from '../Data/Actions/WhisperAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "whisper_player",
    description: "Allows you to speak privately with the selected player(s).",
    details: `Creates a channel for you to whisper to the selected recipients. Only you and the people you select `
        + `will be able to read messages posted in the new channel, but everyone in the room will be notified `
        + `that you've begun whispering to each other. You can select as many players as you want as long as they're `
        + `in the same room as you. When one of you leaves the room, they will be removed from the channel. `
        + `If everyone leaves the room, the whisper channel will be deleted.`,
    usableBy: "Player",
    aliases: ["whisper", "w"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}whisper Jun\n`
        + `${settings.commandPrefix}whisper Florian Michio Ava`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to choose at least one player. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable whisper");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    // Get all players mentioned.
    /** @type {Player[]} */
    const recipients = [];
    recipients.push(player);
    for (let i = 0; i < args.length; i++) {
        let playerExists = false;
        // Player cannot whisper to themselves.
        if (args[i].toLowerCase() === player.name.toLowerCase()) return game.communicationHandler.reply(message, "You can't include yourself as a whisper recipient.");
        // Player cannot whisper to dead players.
        for (const deadPlayer of game.deadPlayers.values()) {
            if (deadPlayer.name.toLowerCase() === args[i].toLowerCase())
                return game.communicationHandler.reply(message, `You can't whisper to ${deadPlayer.name} because ${deadPlayer.originalPronouns.sbj} ${deadPlayer.originalPronouns.plural ? `aren't` : `isn't`} in the room with you.`);
        }

        // Check if player exists and is in the same room.
        for (const livingPlayer of game.livingPlayers.values()) {
            if (livingPlayer.displayName.toLowerCase() === args[i].toLowerCase() && livingPlayer.location.id === player.location.id) {
                // Check attributes that would prohibit the player from whispering to someone in the room.
                if (livingPlayer.isHidden())
                    return game.communicationHandler.reply(message, `You can't whisper to ${livingPlayer.displayName} because ${livingPlayer.pronouns.sbj} ${livingPlayer.pronouns.plural ? `aren't` : `isn't`} in the room with you.`);
                if (livingPlayer.hasBehaviorAttribute("concealed"))
                    return game.communicationHandler.reply(message, `You can't whisper to ${livingPlayer.displayName} because it would reveal ${livingPlayer.pronouns.dpos} identity.`);
                if (livingPlayer.hasBehaviorAttribute("no hearing"))
                    return game.communicationHandler.reply(message, `You can't whisper to ${livingPlayer.displayName} because ${livingPlayer.pronouns.sbj} can't hear you.`);
                if (!livingPlayer.isConscious())
                    return game.communicationHandler.reply(message, `You can't whisper to ${livingPlayer.displayName} because ${livingPlayer.pronouns.sbj} ${livingPlayer.pronouns.plural ? `are` : `is`} not awake.`);
                recipients.push(livingPlayer);
                playerExists = true;
                break;
            }
            else if (livingPlayer.name.toLowerCase() === args[i].toLowerCase())
                return game.communicationHandler.reply(message, `You can't whisper to ${livingPlayer.name} because ${livingPlayer.originalPronouns.sbj} ${livingPlayer.originalPronouns.plural ? `aren't` : `isn't`} in the room with you.`);
        }
        if (!playerExists) return game.communicationHandler.reply(message, `Couldn't find player "${args[i]}". Make sure you spelled it right.`);
    }

    // Check if whisper already exists.
    let whisper = game.entityFinder.getWhisper(recipients);
    if (whisper) return game.communicationHandler.reply(message, "Whisper group already exists.");

    // Whisper does not exist, so create it.
    const action = new WhisperAction(game, message, player, player.location, false);
    action.performWhisper(recipients);
}
