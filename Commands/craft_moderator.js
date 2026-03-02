import CraftAction from '../Data/Actions/CraftAction.ts';
import { itemIdentifierMatches } from '../Modules/matchers.js';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import InventoryItem from '../Data/InventoryItem.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "craft_moderator",
    description: "Crafts two items in a player's inventory together.",
    details: 'Creates a new item using the two items in the given player\'s hand. The prefab IDs or container identifiers of the '
        + 'items must be separated by "with" or "and". If no recipe for those two items exists, the items cannot be crafted together. '
        + "Note that this command can also be used to use one item on another item, which may produce something new.",
    usableBy: "Moderator",
    aliases: ["craft", "combine", "mix", "c"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}craft chris drain cleaner and plastic bottle\n`
        + `${settings.commandPrefix}combine keiko's bread and cheese\n`
        + `${settings.commandPrefix}mix finn red vial with blue vial\n`
        + `${settings.commandPrefix}craft dayne's soap with knife`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length < 4)
        return game.communicationHandler.reply(message, `You need to specify a player and two items separated by "with" or "and". Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0].replace(/'s/g, ""));
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    args.splice(0, 1);

    const input = args.join(' ');
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

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
            if (hand.equippedItem !== null && !itemsMap.has(hand.row) && itemIdentifierMatches(hand.equippedItem, itemName, true)) {
                itemsMap.set(hand.row, hand.equippedItem);
                items.push(hand.equippedItem);
                break;
            }
        }
    }

    if (items.length !== 2) {
        if (items.length === 0) {
            return game.communicationHandler.reply(message, `Couldn't find items "${itemNames[0]}" and "${itemNames[1]}" in either of ${player.name}'s hands.`);
        } else {
            if (items[0].identifier !== "" && items[0].identifier === itemNames[0] || items[0].prefab.id === itemNames[0] || items[0].name === itemNames[0]) return game.communicationHandler.reply(message, `Couldn't find item "${itemNames[1]}" in either of ${player.name}'s hands.`);
            else return game.communicationHandler.reply(message, `Couldn't find item "${itemNames[0]} in either of your ${player.name}'s hands.`);
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
        if (player.canCraft(recipes[i], [items[0], items[1]])) {
            recipe = recipes[i];
            break;
        }
    }
    if (recipe === null) return game.communicationHandler.reply(message, `Couldn't find recipe requiring ${items[0].prefab.id} and ${items[1].prefab.id}.`);

    const action = new CraftAction(game, message, player, player.location, true);
    action.performCraft(items[0], items[1], recipe);
    game.communicationHandler.sendToCommandChannel(`Successfully crafted ${items[0].getIdentifier()} and ${items[1].getIdentifier()} for ${player.name}.`);
}
