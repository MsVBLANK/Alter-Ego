/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "load_moderator",
    description: 'Loads game data.',
    details: `Loads game data from the spreadsheet and stores it in memory. You must specify what spreadsheet tab to `
        + `load from. When data from a particular tab is loaded, all data that was previously in memory for that tab `
        + `will be cleared and replaced with the newly-loaded data.\n\n`
        + `If there are any errors with the loaded game data, you will be warned, and the game cannot progress until `
        + `they are fixed and reloaded. However, some game data cannot be checked for errors with the load command. `
        + `To check for errors in your descriptions, use the \`parse\` command. At this time, it is not possible `
        + `to check for errors in bot commands that appear on the spreadsheet, until they are executed.\n\n`
        + `If game entities referenced data that has been reloaded (for example, fixtures reference the room they're `
        + `located in), the references will be updated to point to the new data, if possible. However, references can `
        + `be broken, if newly-loaded data does not contain the entities that other entities reference, and you will `
        + `not be warned when this occurs. So, it is good practice to load all game data together periodically.\n\n`
        + `To start the game, load all data and append "start" or "resume". When "start" is used, each living player `
        + `will be sent the description of the room they load into. When "resume" is used, the game is still started, `
        + `but room descriptions will not be sent to players. In general, "start" should be used when starting a game `
        + `for the first time, and "resume" should be used whenever the bot is rebooted. However, you do not have to `
        + `do this if the \`AUTO_LOAD\` setting in your \`.env\` file is set to \`true\`.\n\n`
        + `If you are loading data while a game is in progress, you should use the \`editmode\` command first.`,
    usableBy: "Moderator",
    aliases: ["load", "reload", "las", "lar"],
    requiresGame: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}load all start\n`
        + `${settings.commandPrefix}las\n`
        + `${settings.commandPrefix}load all resume\n`
        + `${settings.commandPrefix}lar\n`
        + `${settings.commandPrefix}load all\n`
        + `${settings.commandPrefix}load rooms\n`
        + `${settings.commandPrefix}load fixtures\n`
        + `${settings.commandPrefix}load prefabs\n`
        + `${settings.commandPrefix}load recipes\n`
        + `${settings.commandPrefix}load room items\n`
        + `${settings.commandPrefix}load roomitems\n`
        + `${settings.commandPrefix}load puzzles\n`
        + `${settings.commandPrefix}load events\n`
        + `${settings.commandPrefix}load status effects\n`
        + `${settings.commandPrefix}load players\n`
        + `${settings.commandPrefix}load inventory items\n`
        + `${settings.commandPrefix}load inventories\n`
        + `${settings.commandPrefix}load gestures\n`
        + `${settings.commandPrefix}load flags`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (command !== "las" && command !== "lar" && args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify what data to get. Usage:\n${usage(game.settings)}`);

    /** @type {Error[]} */
    let errors = [];
    if (command === "las" || command === "lar" || args[0] === "all") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load all data.`);
        const startGame = command === "las" || command === "lar" || args[1] && (args[1] === "resume" || args[1] === "start");
        const sendPlayerRoomDescriptions = startGame && (command === "las" || args[1] === "start");
        const resultMessage = await game.entityLoader.loadAll(startGame, sendPlayerRoomDescriptions);
        game.communicationHandler.sendToCommandChannel(resultMessage);
    }
    else if (args[0] === "rooms") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load rooms.`);
        const roomCount = await game.entityLoader.loadRooms(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${roomCount} rooms retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "fixtures" || args[0] === "objects") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load fixtures.`);
        const fixtureCount = await game.entityLoader.loadFixtures(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${fixtureCount} fixtures retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "prefabs") {
        const prefabCount = await game.entityLoader.loadPrefabs(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${prefabCount} prefabs retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "recipes") {
        const recipeCount = await game.entityLoader.loadRecipes(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${recipeCount} recipes retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "roomitems" || args[0] === "items" || args[0] === "room" && args[1] === "items") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load room items.`);
        const roomItemCount = await game.entityLoader.loadRoomItems(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${roomItemCount} room items retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "puzzles") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load puzzles.`);
        const puzzleCount = await game.entityLoader.loadPuzzles(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${puzzleCount} puzzles retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "events") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load events.`);
        const eventCount = await game.entityLoader.loadEvents(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${eventCount} events retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "statuses" || args[0] === "effects" || args[0] === "status" && args[1] === "effects") {
        const statusEffectCount = await game.entityLoader.loadStatusEffects(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${statusEffectCount} status effects retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "players") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load players.`);
        const playerCount = await game.entityLoader.loadPlayers(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${playerCount} players retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "inventoryitems" || args[0] === "inventories" || args[0] === "inventory" && args[1] === "items") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load inventory items.`);
        const inventoryItemCount = await game.entityLoader.loadInventoryItems(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${inventoryItemCount} inventory items retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "gestures") {
        const gestureCount = await game.entityLoader.loadGestures(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${gestureCount} gestures retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
    else if (args[0] === "flags") {
        if (game.inProgress && !game.editMode) return game.communicationHandler.reply(message, `You must enable edit mode to load flags.`);
        const flagCount = await game.entityLoader.loadFlags(true, errors);
        if (errors.length === 0) game.communicationHandler.sendToCommandChannel(`${flagCount} flags retrieved.`);
        else game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }
}
