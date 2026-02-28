import StashAction from '../Data/Actions/StashAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "stash_player",
    description: "Stores an inventory item inside another inventory item.",
    details: `Moves an item from your hand to another item in your inventory. You can specify any item in your inventory that has the capacity to hold items by `
        + `entering the container item's preposition followed by its name. If you don't know its preposition, "in" will always work.\n\n`
        + `If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which slot you want to put the item in. `
        + `To do this, enter the name of the inventory slot followed by "of" before the name of the container. If you don't specify an inventory slot, you will put it `
        + `in the first slot it has. Note that each slot has a maximum capacity that it can hold, so if it's too full or too small to contain the item `
        + `you're trying to stash, you won't be able to stash it there.\n\n`
        + `If you stash a very large item (a sword, for example), this will be narrated in the room, so other players will see you stash it.\n\n`
        + `To retrieve a stashed item and put it in your hand, use the \`unstash\` command.`,
    usableBy: "Player",
    aliases: ["stash", "store", "s"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}stash LAPTOP in BEIGE SATCHEL\n`
        + `${settings.commandPrefix}store SWORD in SHEATH\n`
        + `${settings.commandPrefix}stash OLD KEY in RIGHT POCKET of BLACK DRESS PANTS\n`
        + `${settings.commandPrefix}s WATER BOTTLE in SIDE POUCH of GREEN BACKPACK`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    if (args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify two items. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable stash");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    let input = args.join(' ').toUpperCase().replace(/\'/g, "");
    args = input.split(' ');

    // Look for the container item.
    const items = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null && item.quantity !== 0);
    let containerItem = null;
    let containerItemSlot = null;
    for (let i = 0; i < args.length; i++) {
        for (const item of items) {
            if (args.slice(i).join(" ") === item.name) {
                if (i === 0)
                    return game.communicationHandler.reply(message, `You need to specify two items. Usage:\n${usage(game.settings)}`);
                containerItem = item;
                if (item.inventory.size === 0) continue;
                args = args.slice(0, i);
                input = args.join(" ");
                break;
            }
        }
        if (containerItem !== null && containerItem.inventory.size !== 0) break;
    }
    if (containerItem === null) return game.communicationHandler.reply(message, `Couldn't find container item "${args[args.length - 1]}".`);
    else if (containerItem.inventory.size === 0) return game.communicationHandler.reply(message, `${containerItem.name} cannot hold items. Contact a moderator if you believe this is a mistake.`);
    else if (args[args.length - 1] === "OF") {
        args = args.slice(0, -1);
        input = args.join(" ");
        for (let i = 0; i < args.length; i++) {
            for (const [id, slot] of containerItem.inventory) {
                if (args.slice(i).join(" ") === id) {
                    containerItemSlot = slot;
                    args = args.slice(0, i);
                    input = args.join(" ");
                    break;
                }
            }
            if (containerItemSlot !== null) break;
        }
        if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${args[args.length - 1]}" of ${containerItem.name}.`);
    }
    args = args.slice(0, -1);
    input = args.join(" ");

    // Now find the item in the player's inventory.
    const hand = game.entityFinder.getPlayerHandHoldingItem(player, input, containerItem.row, "player");
    // Make sure item and containerItem aren't the same item.
    if (!hand && game.entityFinder.getPlayerHandHoldingItem(player, input))
        return game.communicationHandler.reply(message, `You can't stash ${containerItem.name} ${containerItem.prefab.preposition} itself.`);
    const item = hand ? hand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${input}" in either of your hands. If this item is elsewhere in your inventory, please unequip or unstash it before trying to stash it.`);
    // Ensure an inventory item can't be stashed inside an inventory item that it contains.
    let container = containerItem.container;
    while (container !== null) {
        if (container.row === item.row) return game.communicationHandler.reply(message, `Can't stash an item inside an item that it contains.`);
        container = container.container;
    }

    if (containerItemSlot === null) [containerItemSlot] = containerItem.inventory.values();
    if (item.prefab.size > containerItemSlot.capacity && containerItem.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${containerItem.name} because it is too large.`);
    else if (item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItem.name} because it is too large.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity && containerItem.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${containerItem.name} because there isn't enough space left.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItem.name} because there isn't enough space left.`);

    const action = new StashAction(game, message, player, player.location, false);
    action.performStash(item, hand, containerItem, containerItemSlot);
}
