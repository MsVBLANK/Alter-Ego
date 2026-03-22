import ViewAction from '../Data/Actions/ViewAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "view_moderator",
    description: "View a game entity.",
    details: `View in-game data. You can view any entry on the spreadsheet, but you must specify which kind of data to `
        + `find, as well as its row number. You will be shown most of the data visible on the spreadsheet for that `
        + `entity. To avoid exceeding Discord's character limit, some fields may be omitted. These can be viewed with `
        + `the interactables that are sent alongside the result.\n\n`
        + `To view a game entity with this command, you must know its row number, which can be found on the `
        + `spreadsheet. Alternatively, you can obtain it with the \`find\` command.`,
    usableBy: "Moderator",
    aliases: ["view", "v"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}view room 496\n`
        + `${settings.commandPrefix}v exit 497\n`
        + `${settings.commandPrefix}view fixture 21\n`
        + `${settings.commandPrefix}v prefab 75\n`
        + `${settings.commandPrefix}view recipe 43\n`
        + `${settings.commandPrefix}v room item 1173\n`
        + `${settings.commandPrefix}view item 692\n`
        + `${settings.commandPrefix}v puzzle 81\n`
        + `${settings.commandPrefix}view event 16\n`
        + `${settings.commandPrefix}v status effect 92\n`
        + `${settings.commandPrefix}view status 17\n`
        + `${settings.commandPrefix}v player 4\n`
        + `${settings.commandPrefix}view inventory item 70\n`
        + `${settings.commandPrefix}v inventoryitem 381\n`
        + `${settings.commandPrefix}view gesture 102\n`
        + `${settings.commandPrefix}v flag 7`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    let input = args.join(' ');

    if (args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a data type and the row number of an entity to view. Usage:\n${usage(game.settings)}`);

    // First, separate the input into data type and search.
    const dataTypeMatch = input.match(ViewAction.dataTypeRegex);
    if (!dataTypeMatch && !dataTypeMatch.groups) return game.communicationHandler.reply(message, `Couldn't find a valid data type in "${input}".`);
    if (!dataTypeMatch.groups.search) return game.communicationHandler.reply(message, `You need to specify the row number of an entity to view.`);
    input = input.substring(input.indexOf(dataTypeMatch.groups.search)).trim();
    const row = parseInt(input);
    if (isNaN(row)) return game.communicationHandler.reply(message, `Invalid row number: "${input}".`);

    /** @type {PersistentGameEntityName} */
    let entityType;
    /** @type {PersistentGameEntity} */
    let entity;
    if (dataTypeMatch.groups.Room) {
        entityType = "Room";
        entity = game.entityFinder.getRoomByRow(row);
    }
    else if (dataTypeMatch.groups.Exit) {
        entityType = "Exit";
        entity = game.entityFinder.getExitByRow(row);
    }
    else if (dataTypeMatch.groups.Fixture) {
        entityType = "Fixture";
        entity = game.entityFinder.getFixtureByRow(row);
    }
    else if (dataTypeMatch.groups.Prefab) {
        entityType = "Prefab";
        entity = game.entityFinder.getPrefabByRow(row);
    }
    else if (dataTypeMatch.groups.Recipe) {
        entityType = "Recipe";
        entity = game.entityFinder.getRecipeByRow(row);
    }
    else if (dataTypeMatch.groups.RoomItem) {
        entityType = "RoomItem";
        entity = game.entityFinder.getRoomItemByRow(row);
    }
    else if (dataTypeMatch.groups.Puzzle) {
        entityType = "Puzzle";
        entity = game.entityFinder.getPuzzleByRow(row);
    }
    else if (dataTypeMatch.groups.Event) {
        entityType = "Event";
        entity = game.entityFinder.getEventByRow(row);
    }
    else if (dataTypeMatch.groups.Status) {
        entityType = "StatusEffect";
        entity = game.entityFinder.getStatusEffectByRow(row);
    }
    else if (dataTypeMatch.groups.Player) {
        entityType = "Player";
        entity = game.entityFinder.getPlayerByRow(row);
    }
    else if (dataTypeMatch.groups.InventoryItem) {
        entityType = "InventoryItem";
        entity = game.entityFinder.getInventoryItemByRow(row);
    }
    else if (dataTypeMatch.groups.Gesture) {
        entityType = "Gesture";
        entity = game.entityFinder.getGestureByRow(row);
    }
    else if (dataTypeMatch.groups.Flag) {
        entityType = "Flag";
        entity = game.entityFinder.getFlagByRow(row);
    }
    if (!entity) return game.communicationHandler.reply(message, `Couldn't find ${entityType} on row ${row}.`);

    try {
        const action = new ViewAction(game, message, undefined, undefined, true, undefined, moderator);
        action.performView(entity);
    }
    catch (error) {
        game.communicationHandler.reply(message, `${error.message} Usage:\n${usage(game.settings)}`);
    }
}
