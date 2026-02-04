import StealAction from '../Data/Actions/StealAction.js';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "steal_player",
    description: "Steals an item from another player.",
    details: `Attempts to steal an item from another player in the room. You must specify one of the player's equipped items to steal from. `
        + `You can see a list of their equipped items by inspecting them with the \`inspect\` command. Then, you can steal from it by entering `
        + `their name followed by 's and the name of the equipped item.\n\n`
        + `If you inspect their equipped items, you may also learn what inventory slots each one has, if any. You can specify which inventory slot `
        + `to steal from by entering the name of the slot followed by "of" before the equipped item's name. If no inventory slot is specified, but the `
        + `equipped item has multiple slots (for example, a pair of pants with several pockets), one slot will be randomly chosen. `
        + `If the inventory slot contains multiple items, you will attempt to steal one at random.\n\n`
        + `There are three possible outcomes that can result from attempting to steal an item: you steal the item without them noticing, `
        + `you steal the item but they notice, and you fail to steal the item because they notice in time. `
        + `If you happen to steal a very large item, the other player will notice you taking it regardless of whether you were successful or not, `
        + `and so will everyone else in the room.\n\n`
        + `Your dexterity stat has a significant impact on how successful you are at stealing an item. If you have a high dexterity stat, `
        + `you are more likely to succeed. Various status effects affect the outcome as well. `
        + `For example, if the player you're stealing from is asleep or unconscious, they won't notice you stealing their items no matter what.`,
    usableBy: "Player",
    aliases: ["steal", "pickpocket"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}steal from Vivian's BEIGE SATCHEL\n`
        + `${settings.commandPrefix}pickpocket from Kyra's LAB COAT\n`
        + `${settings.commandPrefix}steal Michio's RIGHT SLEEVE of PASTEL HAORI\n`
        + `${settings.commandPrefix}pickpocket Olavi's LEFT POCKET of BLUE TRENCH COAT\n`
        + `${settings.commandPrefix}steal from an individual wearing a PLAGUE DOCTOR MASK's BLACK CLOAK\n`
        + `${settings.commandPrefix}pickpocket an individual wearing a BUCKET's SIDE POUCH of BLUE BACKPACK`;
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
        return game.communicationHandler.reply(message, `You need to specify a player and one of their equipped items. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable steal");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    // This will be checked multiple times, so get it now.
    const hiddenStatus = player.getBehaviorAttributeStatusEffects("hidden");

    // First, check if the player has a free hand.
    const hand = game.entityFinder.getPlayerFreeHand(player);
    if (hand === undefined) return game.communicationHandler.reply(message, "You do not have a free hand to steal an item. Either drop an item you're currently holding or stash it in one of your equipped items.");

    if (args[0].toUpperCase() === "FROM") args.splice(0, 1);
    const input = args.join(' ');
    let parsedInput = input.toUpperCase().replace(/\'/g, "");

    let victim = null;
    // Check if the input is a player in the room.
    for (let i = 0; i < player.location.occupants.length; i++) {
        const occupant = player.location.occupants[i];
        const possessive = occupant.displayName.toUpperCase() + "S ";
        if (parsedInput.startsWith(possessive) && (hiddenStatus.length === 0 && !occupant.isHidden() || occupant.hidingSpot === player.hidingSpot)) {
            // Player cannot steal from themselves.
            if (occupant.name === player.name) return game.communicationHandler.reply(message, "You can't steal from yourself.");

            victim = occupant;
            parsedInput = parsedInput.substring(possessive.length).trim();
            break;
        }
        else if (parsedInput.startsWith(possessive) && hiddenStatus.length > 0 && !occupant.isHidden())
            return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
    }
    if (victim === null) return game.communicationHandler.reply(message, `Couldn't find player "${args[0]}" in the room with you. Make sure you spelled it right.`);

    // parsedInput should be the equipped item and possibly a slot name. Get the names of those.
    const newArgs = parsedInput.split(" OF ");
    const itemName = newArgs[1] ? newArgs[1].trim() : newArgs[0].trim();
    const slotName = newArgs[1] ? newArgs[0].trim() : "";

    // Find the equipped item to steal from.
    const inventory = game.inventoryItems.filter(item => item.player.name === victim.name && item.prefab !== null && item.containerName === "" && item.container === null);
    let container = null;
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].prefab.name === itemName && (inventory[i].equipmentSlot !== "LEFT HAND" && inventory[i].equipmentSlot !== "RIGHT HAND" || !inventory[i].prefab.discreet)) {
            // Make sure the item isn't covered by anything first.
            const coveringItems = inventory.filter(item =>
                item.equipmentSlot !== "RIGHT HAND" &&
                item.equipmentSlot !== "LEFT HAND" &&
                item.prefab.coveredEquipmentSlots.includes(inventory[i].equipmentSlot)
            );
            if (coveringItems.length === 0) container = inventory[i];
        }
    }
    if (container === null) return game.communicationHandler.reply(message, `Couldn't find "${itemName}" equipped to ${victim.displayName}'s inventory.`);
    if (container.inventory.size === 0) return game.communicationHandler.reply(message, `${victim.displayName}'s ${container.name} cannot hold items.`);

    // If no slot name was specified, pick one.
    let slot = container.inventory.get(slotName);
    if (slotName === "") slot = [... container.inventory.values()][Math.floor(Math.random() * container.inventory.size)];
    if (slot === undefined) return game.communicationHandler.reply(message, `Couldn't find ${slotName} of ${container.name}.`);

    const action = new StealAction(game, message, player, player.location, false);
    action.performSteal(hand, victim, container, slot);
}
