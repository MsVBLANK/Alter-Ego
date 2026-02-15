import CraftAction from '../Data/Actions/CraftAction.js';
import { itemNameMatches } from '../Modules/matchers.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */
/** @import InventoryItem from '../Data/InventoryItem.js' */

/** @type {CommandConfig} */
export const config = {
    name: "craft_player",
    description: "Crafts two items in your inventory together.",
    details: `Creates a new item using the two items in your hand. The names of the items must be separated by "with" or "and". `
        + `If no recipe for those two items exists, the items cannot be crafted together. `
        + `If any of the resulting items is particularly large, this will be narrated in the room, so other players will see you craft them.\n\n`
        + `You can view a list of all recipes that you can craft with the items in your inventory using the \`recipes\` command. Some crafting recipes `
        + `can be reversed once performed using the \`uncraft\` command. For more information on both of these commands, use the \`help\` command.`,
    usableBy: "Player",
    aliases: ["craft", "combine", "mix", "c"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}craft DRAIN CLEANER and PLASTIC BOTTLE\n`
        + `${settings.commandPrefix}combine BREAD and CHEESE\n`
        + `${settings.commandPrefix}mix RED VIAL with BLUE VIAL\n`
        + `${settings.commandPrefix}craft SOAP with KNIFE`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words. 
 * @param {Player} player - The player who issued the command. 
 */
export async function execute(game, message, command, args, player) {
    if (args.length < 3)
        return game.communicationHandler.reply(message, `You need to specify two items separated by "with" or "and". Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable craft");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const parsedInput = args.join(' ').toUpperCase().replace(/\'/g, "");

    if (!parsedInput.includes(" WITH ") && !parsedInput.includes(" AND "))
        return game.communicationHandler.reply(message, `You need to specify two items separated by "with" or "and". Usage:\n${usage(game.settings)}`);

    const itemNames = parsedInput.includes(" WITH ") ? parsedInput.split(" WITH ") : parsedInput.split(" AND ");
    // Now find the item in the player's inventory.
    /** @type {Map<number, InventoryItem>} */
    const itemsMap = new Map();
    /** @type {InventoryItem[]} */
    const items = [];
    const hands = game.entityFinder.getPlayerHands(player);
    for (const hand of hands) {
        for (const itemName of itemNames) {
            if (hand.equippedItem !== null && !itemsMap.has(hand.row) && itemNameMatches(hand.equippedItem, itemName, true)) {
                itemsMap.set(hand.row, hand.equippedItem);
                items.push(hand.equippedItem);
                break;
            }
        }
    }

    if (items.length !== 2) {
        if (items.length === 0) {
            return game.communicationHandler.reply(message, `Couldn't find items "${itemNames[0]}" and "${itemNames[1]}" in either of your hands.`);
        } else {
            if (items[0].name === itemNames[0]) return game.communicationHandler.reply(message, `Couldn't find item "${itemNames[1]}" in either of your hands.`);
            else return game.communicationHandler.reply(message, `Couldn't find item "${itemNames[0]} in either of your hands.`);
        }
    }

    items.sort(function (a, b) {
        if (a.prefab.id < b.prefab.id) return -1;
        if (a.prefab.id > b.prefab.id) return 1;
        return 0;
    });

    const recipes = game.recipes.filter(recipe => recipe.ingredients.length === 2 && recipe.fixtureTag === "");
    let recipe = null;
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].ingredients[0].prefab.id === items[0].prefab.id && recipes[i].ingredients[1].prefab.id === items[1].prefab.id) {
            recipe = recipes[i];
            break;
        }
    }
    if (recipe === null) return game.communicationHandler.reply(message, `Couldn't find recipe requiring ${items[0].name} and ${items[1].name}. Contact a moderator if you think there should be one.`);

    const action = new CraftAction(game, message, player, player.location, false);
    action.performCraft(items[0], items[1], recipe);
}
