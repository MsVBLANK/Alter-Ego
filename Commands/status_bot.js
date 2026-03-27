import CureAction from "../Data/Actions/CureAction.ts";
import InflictAction from '../Data/Actions/InflictAction.ts';
import InventoryItem from "../Data/InventoryItem.ts";

/** @import Status from "../Data/Status.ts" */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "status_bot",
    description: "Inflict or cure status effects on a player.",
    details: `This command has two sub-commands:\n\n`
        + `- **add**/**inflict**: Inflicts the specified player with the given status effect. `
        + `The player will receive the "Description When Inflicted" message for the specified status effect. `
        + `If they already have that status effect and there is a status listed in the "When Duplicated" column, `
        + `they will be cured of the given status effect and inflicted with that instead. If the inflicted status `
        + `has a timer, the player will be cured and then inflicted with the status effect in the "Develops Into" `
        + `column when the timer reaches 0, if there is one. If the status effect is fatal, `
        + `they will simply die when the timer reaches 0 instead.\n`
        + `- **remove**/**cure**: Cures the specified player of the given status effect. `
        + `The player will receive the "Description When Cured" message for the specified status effect. If there `
        + `is a status listed in the "When Cured" column, they will then be inflicted with that status effect.\n\n`
        + `If instead of providing the name of a player, you enter "all" or "living", all living players will be `
        + `inflicted/cured of the given status effect, except for NPCs and players with the Free Movement role. `
        + `However, if you instead use "player", the player who caused this command to be executed will be `
        + `inflicted/cured. If "room" is used instead, then all players in the room with the initiating player will be `
        + `inflicted/cured, including NPCs and players with the Free Movement role.`,
    usableBy: "Bot",
    aliases: ["status", "inflict", "cure"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `status add player heated\n`
        + `status add room safe\n`
        + `inflict all deafened\n`
        + `inflict Diego heated\n`
        + `status remove player injured\n`
        + `status remove room restricted\n`
        + `cure Flint injured\n`
        + `cure all deafened`;
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
    if (command === "status") {
        if (args[0] === "add" || args[0] === "inflict") command = "inflict";
        else if (args[0] === "remove" || args[0] === "cure") command = "cure";
        args.splice(0, 1);
    }

    if (args.length === 0) {
        game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Insufficient arguments.`);
        return;
    }

    // Determine which player(s) are being inflicted/cured with a status effect.
    /**
     * @type {Player[]}
     */
    let players = [];
    if (args[0].toLowerCase() === "player" && player !== null)
        players.push(player);
    else if (args[0].toLowerCase() === "room" && player !== null)
        players = player.location.occupants;
    else if (args[0].toLowerCase() === "all" || args[0].toLowerCase() === "living") {
        players = game.entityFinder.getLivingPlayers(undefined, false).filter(player => !game.guildContext.hasFreeMovementRole(player.member));
    }
    else {
        player = game.entityFinder.getLivingPlayer(args[0]);
        if (player === undefined) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find player "${args[0]}".`);
        players.push(player);
    }
    args.splice(0, 1);

    const statusId = args.join(" ");
    /** @type {Status} */
    const status = game.entityFinder.getStatusEffect(statusId);
    if (!status) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Couldn't find status effect "${statusId}".`);
    if (status.id === "hidden") return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Can't inflict or cure "hidden".`);

    const item = callee instanceof InventoryItem ? callee : undefined;
    for (let i = 0; i < players.length; i++) {
        if (command === "inflict") {
            const action = new InflictAction(game, undefined, players[i], players[i].location, true);
            action.performInflict(status, true, true, true, item);
        }
        else if (command === "cure") {
            const action = new CureAction(game, undefined, players[i], players[i].location, true);
            action.performCure(status, true, true, true, item);
        }
    }
}
