import UnstashAction from '../Data/Actions/UnstashAction.ts';
import InventoryItem from '../Data/InventoryItem.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "unstash_player",
    description: "Moves an inventory item into your hand.",
    details: `Moves an inventory item from another item in your inventory into your hand. You must have a free hand to unstash an item. `
        + `If you unstash a very large item (a sword, for example), this will be narrated in the room, so other players will see you unstash it.\n\n`
        + `If you have multiple inventory items with the same name as the one you want to unstash, you can specify which item to retrieve it from. `
        + `To do this, you must enter "from" before the container's name. If the container has multiple inventory slots (for example, a backpack `
        + `with several pockets), you can specify which of the container's slots you want to unstash the item from, by entering the name of the `
        + `inventory slot followed by "of" before the container item's name.\n\n`
        + `To store an item in one of your inventory items, use the \`stash\` command.`,
    usableBy: "Player",
    aliases: ["unstash", "retrieve", "r"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}unstash LAPTOP\n`
        + `${settings.commandPrefix}retrieve SWORD from SHEATH\n`
        + `${settings.commandPrefix}unstash OLD KEY from RIGHT POCKET of BLACK DRESS PANTS\n`
        + `${settings.commandPrefix}r WATER BOTTLE from SIDE POUCH of GREEN BACKPACK`;
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
        return game.communicationHandler.reply(message, `You need to specify an item. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable unstash");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    // First, check if the player has a free hand.
    const hand = game.entityFinder.getPlayerFreeHand(player);
    if (hand === undefined) return game.communicationHandler.reply(message, "You do not have a free hand to retrieve an item. Either drop an item you're currently holding or stash it in one of your equipped items.");

    const input = args.join(' ');
    const parsedInput = input.toUpperCase().replace(/\'/g, "");

    let item = null;
    let container = null;
    let slotName = "";
    let slot = null;
    const playerItems = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null && (item.quantity > 0 || isNaN(item.quantity)));
    for (let i = 0; i < playerItems.length; i++) {
        // If parsedInput is only the item's name, we've found the item.
        if (playerItems[i].name === parsedInput) {
            item = playerItems[i];
            container = playerItems[i].container;
            if (playerItems[i].container === null) continue;
            slotName = playerItems[i].slot;
            slot = container.inventory.get(slotName);
            break;
        }
        // A container was specified.
        if (parsedInput.startsWith(`${playerItems[i].name} FROM `)) {
            const containerName = parsedInput.substring(`${playerItems[i].name} FROM `.length).trim();
            if (playerItems[i].container !== null) {
                // Slot name was specified.
                if (containerName.endsWith(` OF ${playerItems[i].container.name}`)) {
                    const tempSlotName = containerName.substring(0, containerName.indexOf(` OF ${playerItems[i].container.name}`));
                    if (playerItems[i].container instanceof InventoryItem) {
                        for (const id of playerItems[i].container.inventory.keys()) {
                            if (id === tempSlotName && playerItems[i].slot === tempSlotName) {
                                item = playerItems[i];
                                container = playerItems[i].container;
                                slotName = tempSlotName;
                                slot = container.inventory.get(slotName);
                                break;
                            }
                        }
                    }
                    if (item !== null) break;
                }
                // Only a container name was specified.
                else if (playerItems[i].container.name === containerName) {
                    item = playerItems[i];
                    container = playerItems[i].container;
                    slotName = playerItems[i].slot;
                    slot = container.inventory.get(slotName);
                    break;
                }
            }
        }
    }
    if (item === null) {
        if (parsedInput.includes(" FROM ")) {
            const itemName = parsedInput.substring(0, parsedInput.indexOf(" FROM "));
            const containerName = parsedInput.substring(parsedInput.indexOf(" FROM ") + " FROM ".length);
            return game.communicationHandler.reply(message, `Couldn't find "${containerName}" in your inventory containing "${itemName}".`);
        }
        else return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in your inventory.`);
    }
    if (item !== null && !container) return game.communicationHandler.reply(message, `${item.name} is not contained in another item and cannot be unstashed.`);

    const action = new UnstashAction(game, message, player, player.location, false);
    action.performUnstash(item, hand, container, slot);
}
