import FindAction from '../Data/Actions/FindAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "find_moderator",
    description: "Search in-game data.",
    details: 'Search in-game data and display results with row numbers. You can search for any entry on the spreadsheet, but you must specify which kind of data to find. '
		+ 'With no arguments, all entries of that data type will be displayed. Results will be divided into pages, with no more than 15 entries per page, '
		+ 'or however many will fit in one Discord message. To narrow down the results, you can add a search query. Queries are case-insensitive, '
		+ 'and any entries which contain the search query will be displayed. To examine an entry in more detail, use the view command.\n\n'
		+ 'It is also possible to add specifiers to your search for certain data types. Objects, Items, and Puzzles can be filtered by location '
		+ 'by ending your search query with "at" followed by the name of a Room. Recipes can be filtered by type by starting your search with '
		+ '"crafting", "uncraftable", or "processing".  It is also possible to filter Recipes by comma-separated lists of ingredients and products. '
		+ 'To filter by ingredients, prefix the list with "using"; to filter by products, prefix the list with "producing". '
		+ 'When using specifiers, it is not actually necessary to provide a search query; the results will simply be all entries that match the specified criteria.\n\n'
		+ 'Items and Inventory Items can be filtered by container name and slot, by entering "[preposition] ([slot name] of) [container name]". '
		+ 'The container name is also a search query, so any container whose name, plural name, Prefab ID, or container identifier contains the given string '
		+ 'will be displayed; the same is not true for the slot, however. It is also possible to filter Inventory Items by Equipment Slot and Player. '
		+ 'To filter by Equipment Slot, enter "in" or "on", followed by the name of an Equipment Slot. To filter by Player, enter their name followed by `\'s`, '
		+ 'directly after the preposition, if there is one. Keep in mind that it is not possible to filter by Equipment Slot and container at the same time.',
    usableBy: "Moderator",
    aliases: ["find", "search", "f"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}find room dorm 201\n`
		+ `${settings.commandPrefix}search rooms stoke-hall\n`
		+ `${settings.commandPrefix}find object desk\n`
		+ `${settings.commandPrefix}search objects at chancellors office\n`
		+ `${settings.commandPrefix}find prefab FRIED RICE\n`
		+ `${settings.commandPrefix}search items THIGH HIGH\n`
		+ `${settings.commandPrefix}find item life preserver at beach\n`
		+ `${settings.commandPrefix}search items in trash can\n`
		+ `${settings.commandPrefix}find items on PREP STATIONS at dining-hall-kitchen\n`
		+ `${settings.commandPrefix}search items COLORED PENCILS in MAIN POUCH of BACKPACK at school store\n`
		+ `${settings.commandPrefix}find recipes uncraftable\n`
		+ `${settings.commandPrefix}search recipes crafting producing glass of orange juice\n`
		+ `${settings.commandPrefix}find recipes processing using MILK, RAW EGG producing PANCAKE BATTER, EGGSHELL\n`
		+ `${settings.commandPrefix}search puzzles LOCK\n`
		+ `${settings.commandPrefix}find puzzle COMPUTER at infirmary\n`
		+ `${settings.commandPrefix}search events snow\n`
		+ `${settings.commandPrefix}find status effects medicated\n`
		+ `${settings.commandPrefix}search players an individual wearing a\n`
		+ `${settings.commandPrefix}find inventory items on JACKET\n`
		+ `${settings.commandPrefix}search inventoryitems in RIGHT POCKET of DEFAULT PANTS\n`
		+ `${settings.commandPrefix}find inventoryitem in phoebe's right hand\n`
		+ `${settings.commandPrefix}search inventory item in julie's main pocket of luna purse\n`
		+ `${settings.commandPrefix}find inventoryitem lillie's blue flannel\n`
		+ `${settings.commandPrefix}search gestures smile\n`
		+ `${settings.commandPrefix}find flag SEASON FLAG`;
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

	if (args.length === 0)
		return game.communicationHandler.reply(message, `You need to specify what kind of data to find. Usage:\n${usage(game.settings)}`);

	try {
        const action = new FindAction(game, message, undefined, undefined, true, undefined, moderator);
        action.performFind(input);
    }
    catch (error) {
        game.communicationHandler.reply(message, `${error.message} Usage:\n${usage(game.settings)}`);
    }
}
