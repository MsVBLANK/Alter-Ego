import StashAction from '../Data/Actions/StashAction.ts';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "stash_moderator",
    description: "Stores a player's inventory item inside another inventory item.",
    details: "Moves an item from the given player's hand to another item in their inventory. You can specify any item in their inventory "
        + "that has the capacity to hold items. If the inventory item you choose has multiple slots for items (such as multiple pockets), "
        + "you can specify which slot you want to store the item in. Note that each slot has a maximum capacity that it can hold, so if it's "
        + "too full or too small to contain the item you're trying to stash, you won't be able to stash it there. If you attempt to stash a "
        + "very large item (a sword, for example), people in the room with the player will see them doing so.",
    usableBy: "Moderator",
    aliases: ["stash", "store", "s"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}stash vivian laptop in satchel\n`
        + `${settings.commandPrefix}store nero's sword in sheath\n`
        + `${settings.commandPrefix}stash antimony's old key in right pocket of pants\n`
        + `${settings.commandPrefix}store cassie water bottle in side pouch of backpack`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length < 3)
        return game.communicationHandler.reply(message, `You need to specify a player and two items. Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0].replace(/'s/g, ""));
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    args.splice(0, 1);

    let input = args.join(' ').toUpperCase().replace(/\'/g, "");
    args = input.split(' ');

    // Look for the container item.
    const items = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null && item.quantity !== 0);
    let containerItem = null;
    let containerItemSlot = null;
    for (let i = 0; i < args.length; i++) {
        for (const item of items) {
            if (item.identifier !== "" && args.slice(i).join(" ") === item.identifier || args.slice(i).join(" ") === item.prefab.id) {
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
    else if (containerItem.inventory.size === 0) return game.communicationHandler.reply(message, `${containerItem.getIdentifier()} cannot hold items.`);
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
        if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${args[args.length - 1]}" of ${containerItem.getIdentifier()}.`);
    }
    args = args.slice(0, -1);
    input = args.join(" ");

    // Now find the item in the player's inventory.
    const hand = game.entityFinder.getPlayerHandHoldingItem(player, input, containerItem.row);
    // Make sure item and containerItem aren't the same item.
    if (!hand && game.entityFinder.getPlayerHandHoldingItem(player, input))
        return game.communicationHandler.reply(message, `Can't stash ${containerItem.getIdentifier()} ${containerItem.prefab.preposition} itself.`);
    const item = hand ? hand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${input}" in either of ${player.name}'s hands.`);
    // Ensure an inventory item can't be stashed inside an inventory item that it contains.
    let container = containerItem.container;
    while (container !== null) {
        if (container.row === item.row) return game.communicationHandler.reply(message, `Can't stash an item inside an item that it contains.`);
        container = container.container;
    }

    if (containerItemSlot === null) [containerItemSlot] = containerItem.inventory.values();
    if (item.prefab.size > containerItemSlot.capacity && containerItem.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.getIdentifier()} will not fit in ${containerItemSlot.id} of ${containerItem.identifier} because it is too large.`);
    else if (item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.getIdentifier()} will not fit in ${containerItem.identifier} because it is too large.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity && containerItem.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.getIdentifier()} will not fit in ${containerItemSlot.id} of ${containerItem.identifier} because there isn't enough space left.`);
    else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.getIdentifier()} will not fit in ${containerItem.identifier} because there isn't enough space left.`);

    const action = new StashAction(game, message, player, player.location, true);
    action.performStash(item, hand, containerItem, containerItemSlot);
    game.communicationHandler.sendToCommandChannel(`Successfully stashed ${item.getIdentifier()} ${containerItem.prefab.preposition} ${containerItemSlot.id} of ${containerItem.identifier} for ${player.name}.`);
}
