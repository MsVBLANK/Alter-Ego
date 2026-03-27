import UncraftAction from '../Data/Actions/UncraftAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "uncraft_player",
    description: "Separates an item in your inventory into its component parts.",
    details: `Separates an item in one of your hands into its component parts. This allows you to reverse `
        + `a crafting recipe, turning a single product into its two ingredients. `
        + `Because it produces two items, you will need a free hand in order to use this command. `
        + `If the item being uncrafted or its components are particularly large, this will be narrated `
        + `in the room, so other players will see you uncraft it.\n\n`
        + `If there is no crafting recipe that produces the item you want to uncraft `
        + `that also allows it to be reversed, then the item cannot be uncrafted.\n\n`
        + `To see all of the items in your inventory that can be uncrafted, use the \`recipes\` command.`,
    usableBy: "Player",
    aliases: ["uncraft", "dismantle", "disassemble", "uc"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}uncraft SHOVEL\n`
        + `${settings.commandPrefix}dismantle CROSSBOW\n`
        + `${settings.commandPrefix}disassemble PISTOL\n`
        + `${settings.commandPrefix}uc RING STAND`;
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
        return game.communicationHandler.reply(message, `You need to specify an item in your hand. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable uncraft");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const input = args.join(' ');
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

        const rightHand = player.inventory.get("RIGHT HAND");
    const leftHand = player.inventory.get("LEFT HAND");

    // Now find the item in the player's inventory.
    let item = null;
    let rightEmpty = true;
    let leftEmpty = true;
    if (rightHand.equippedItem !== null) {
        if (parsedInput === rightHand.equippedItem.name) {
            item = rightHand.equippedItem;
        }
        rightEmpty = false;
    }
    if (leftHand.equippedItem !== null) {
        if (parsedInput === leftHand.equippedItem.name) {
            item = leftHand.equippedItem;
        }
        leftEmpty = false;
    }

    if (item === null) {
        return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in either of your hands.`);
    }

    // Locate uncrafting recipe.
    const recipes = game.recipes.filter(recipe => recipe.uncraftable === true && recipe.products.length === 1);
    let recipe = null;
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].products[0].prefab.id === item.prefab.id) {
            recipe = recipes[i];
            break;
        }
    }
    if (recipe === null) return game.communicationHandler.reply(message, `Couldn't find an uncraftable recipe that produces ${item.singleContainingPhrase}. Contact a moderator if you think there should be one.`);

    if (!rightEmpty && !leftEmpty) {
        return game.communicationHandler.reply(message, `You do not have an empty hand to uncraft ${item.singleContainingPhrase}. Either drop the item in your other hand or stash it in one of your equipped items.`);
    }

    const action = new UncraftAction(game, message, player, player.location, false);
    action.performUncraft(item, recipe);
}
