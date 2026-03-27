import { clearQueue } from '../Modules/messageHandler.js';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @type {CommandConfig} */
export const config = {
    name: "endgame_moderator",
    description: "Ends the game.",
    details: `Ends the game. All players will be removed from whatever room and whisper channels they were in. `
        + `The Player and Dead roles will be removed from all players, and they will be given the Spectator role.\n\n`
        + `**This command will clear all game data in memory.** While it is possible to load all data from the `
        + `spreadsheet again after using this command, players will need to have their roles reassigned manually.`,
    usableBy: "Moderator",
    aliases: ["endgame"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}endgame`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    // Remove all living players from whatever room channel they're in.
    game.entityFinder.getLivingPlayers(null, false).map((player) => {
        if (player.location.channel)
            player.location.channel.permissionOverwrites.create(player.member, { ViewChannel: null });
        player.removeFromWhispers("");
        player.member.roles.remove(game.guildContext.playerRole).catch();
        player.member.roles.add(game.guildContext.spectatorRole).catch();

        for (const status of player.status.values()) {
            if (status.timer !== null)
                status.timer.stop();
        }
    });

    // Remove dead role and add spectator role to dead players.
    game.entityFinder.getDeadPlayers(null, false).map((player) => {
        player.member.roles.remove(game.guildContext.deadRole).catch();
        player.member.roles.add(game.guildContext.spectatorRole).catch();
    });

    clearTimeout(game.halfTimer);
    clearTimeout(game.endTimer);

    game.inProgress = false;
    game.canJoin = false;
    clearQueue(game);
    if (!game.settings.debug)
        game.botContext.updatePresence();
    game.entityLoader.clearAll();
    let channel;
    if (game.settings.debug) channel = game.guildContext.testingChannel;
    else channel = game.guildContext.generalChannel;
    channel.send(`${message.member.displayName} ended the game!`);
}
