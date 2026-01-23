import StashAction from '../Data/Actions/StashAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "stash_player",
    description: "Stores an inventory item inside another inventory item.",
    details: "Moves an item from your hand to another item in your inventory. You can specify any item in your inventory "
        + "that has the capacity to hold items. If the inventory item you choose has multiple slots for items (such as multiple pockets), "
        + "you can specify which slot you want to store the item in. Note that each slot has a maximum capacity that it can hold, so if it's "
        + "too full or too small to contain the item you're trying to stash, you won't be able to stash it there. If you attempt to stash a "
        + "very large item (a sword, for example), people in the room with you will see you doing so.",
    usableBy: "Player",
    aliases: ["stash", "store", "s"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}stash laptop in satchel\n`
        + `${settings.commandPrefix}store sword in sheath\n`
        + `${settings.commandPrefix}stash old key in right pocket of pants\n`
        + `${settings.commandPrefix}store water bottle in side pouch of backpack`;
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
        return game.communicationHandler.reply(message, `You need to specify two items. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable stash");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const input = args.join(' ');
    let parsedInput = input.toUpperCase().replace(/\'/g, "");
    let newArgs = parsedInput.split(' ');

    // Look for the container item.
    const items = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null && item.quantity !== 0);
    let containerItem = null;
    let containerItemSlot = null;
    for (let i = 0; i < items.length; i++) {
        if (items[i].prefab !== null && parsedInput.endsWith(items[i].name) && parsedInput !== items[i].name) {
            containerItem = items[i];
            if (items[i].inventoryCollection.size === 0) continue;
            parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(items[i].name)).trimEnd();
            // Check if a slot was specified.
            if (parsedInput.endsWith(" OF")) {
                parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" OF")).trimEnd();
                newArgs = parsedInput.split(' ');
                for (const [id, slot] of containerItem.inventoryCollection) {
                    if (parsedInput.endsWith(id)) {
                        containerItemSlot = slot;
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(id)).trimEnd();
                        break;
                    }
                }
                if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${newArgs[newArgs.length - 1]}" of ${containerItem.name}.`);
            }
            newArgs = parsedInput.split(' ');
            newArgs.splice(newArgs.length - 1, 1);
            parsedInput = newArgs.join(' ');
            break;
        }
        else if (parsedInput === items[i].name)
            return game.communicationHandler.reply(message, `You need to specify two items. Usage:\n${usage(game.settings)}`);
    }
    if (containerItem === null) return game.communicationHandler.reply(message, `Couldn't find container item "${newArgs[newArgs.length - 1]}".`);
    else if (containerItem.inventoryCollection.size === 0) return game.communicationHandler.reply(message, `${containerItem.name} cannot hold items. Contact a moderator if you believe this is a mistake.`);

    // Now find the item in the player's inventory.
    const hand = game.entityFinder.getPlayerHandHoldingItem(player, parsedInput, containerItem.row, "player");
    // Make sure item and containerItem aren't the same item.
    if (!hand && game.entityFinder.getPlayerHandHoldingItem(player, parsedInput))
        return game.communicationHandler.reply(message, `You can't stash ${containerItem.name} ${containerItem.prefab.preposition} itself.`);
    const item = hand ? hand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in either of your hands. If this item is elsewhere in your inventory, please unequip or unstash it before trying to stash it.`);
    // Ensure an inventory item can't be stashed inside an inventory item that it contains.
    let container = containerItem.container;
    while (container !== null) {
        if (container.row === item.row) return game.communicationHandler.reply(message, `Can't stash an item inside an item that it contains.`);
        container = container.container;
    }

    if (containerItemSlot === null) [containerItemSlot] = containerItem.inventoryCollection.values();
    if (item.prefab.size > containerItemSlot.capacity && containerItem.inventoryCollection.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${containerItem.name} because it is too large.`);
    else if (item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItem.name} because it is too large.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity && containerItem.inventoryCollection.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${containerItem.name} because there isn't enough space left.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItem.name} because there isn't enough space left.`);

    const action = new StashAction(game, message, player, player.location, false);
    action.performStash(item, hand, containerItem, containerItemSlot);
}
