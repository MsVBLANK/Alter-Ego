import RecipesAction from '../Data/Actions/RecipesAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import InventoryItem from '../Data/InventoryItem.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "recipes_player",
    description: "Lists all recipes available to you.",
    details: `Lists all recipes you can carry out with the items in your inventory and items in the room. Even if all of the ingredients `
        + `necessary for a recipe are in the room you're in, if you don't have at least one of them in your inventory, there will be no results. `
        + `However, if you supply the name of an item in your inventory, you will receive a list of all recipes that use that item as an ingredient, `
        + `even if the remaining ingredients are not available.\n\n`
        + `There are two types of recipes: crafting recipes and processing recipes.\n\n`
        + `To carry out a crafting recipe, you must have both of the ingredients in your hands and combine them with the \`craft\` `
        + `command. These recipes take no time. Some crafting recipes are reversible. `
        + `If they are, you can use the \`uncraft\` command to get the ingredients again.\n\n`
        + `To carry out a processing recipe, use the \`drop\` command to place all the ingredients in a fixture, and `
        + `then activate the fixture with the \`use\` command. These recipes take a set amount of time to complete. `
        + `If you did it correctly, you'll receive a message indicating that the process has begun, and then another message when it finishes, `
        + `as long as you're still in the same room as the fixture you used to process it. If the fixture was already activated when all of the `
        + `ingredients were put in, you won't receive a message when it's initiated or completed, `
        + `but the recipe will still be carried out so long as all of the ingredients are in place.`,
    usableBy: "Player",
    aliases: ["recipes"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}recipes\n`
        + `${settings.commandPrefix}recipes GLASS\n`
        + `${settings.commandPrefix}recipes POT OF RICE`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words. 
 * @param {Player} player - The player who issued the command. 
 */
export async function execute(game, message, command, args, player) {
    const status = player.getBehaviorAttributeStatusEffects("disable recipes");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

	/** @type {InventoryItem} */
    let item;
    if (args.length > 0) {
        const input = args.join(" ");
        const parsedInput = input.toUpperCase().replace(/\'/g, "");

        // Check if the input is an item in the player's inventory.
        const inventory = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null);
        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i].prefab.name === parsedInput && inventory[i].quantity > 0) {
                item = inventory[i];
                break;
            }
        }
        if (!item) return game.communicationHandler.reply(message, `Couldn't find item "${input}" in your inventory.`);
	}
    
	const action = new RecipesAction(game, message, player, player.location, false);
	action.performRecipes(item);
}
