import DropAction from '../Data/Actions/DropAction.js';
import Fixture from "../Data/Fixture.js";
import RoomItem from "../Data/RoomItem.js";
import Puzzle from "../Data/Puzzle.js";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import EquipmentSlot from '../Data/EquipmentSlot.js' */
/** @import Game from '../Data/Game.js' */
/** @import InventoryItem from '../Data/InventoryItem.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "drop_player",
    description: "Discards an item from your inventory.",
    details: `Discards an item from your inventory and leaves it in the room you're currently in. The item you want to drop must be in one of your hands. `
        + `If you discard a very large item (a sword, for example), this will be narrated in the room, so other players will see you drop it.\n\n`
        + `If you want to put the item in a specific fixture or item in the room, add a preposition after the name of the item, followed by the container's name. `
        + `Every container has a set preposition which should be fairly obvious. For example, a fixture called "DESK" is likely to have the preposition "on". `
        + `However, if the preposition is unclear, "in" will always work. Keep in mind that not all fixtures and items can be item containers. `
        + `If you don't specify a container, you will simply leave the item on the floor.\n\n`
        + `If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which slot you want to put the item in. `
        + `To do this, enter the name of the inventory slot followed by "of" before the name of the container. If you don't specify an inventory slot, you will put it `
        + `in the first slot it has.\n\n`
        + `You can only put items in containers in the room that you're in. If you want to put an item in one of your inventory items, use the \`stash\` command.`,
    usableBy: "Player",
    aliases: ["drop", "discard", "put", "d"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}drop FIRST AID KIT\n`
        + `${settings.commandPrefix}discard BASKETBALL\n`
        + `${settings.commandPrefix}put KNIFE in SINK\n`
        + `${settings.commandPrefix}d TOWEL on BENCHES\n`
        + `${settings.commandPrefix}drop KEY in RIGHT POCKET of PLAID SKIRT\n`
        + `${settings.commandPrefix}d WRENCH on TOP RACK of TOOL BOX`;
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

    const status = player.getBehaviorAttributeStatusEffects("disable drop");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const input = args.join(" ");
    let parsedInput = input.toUpperCase().replace(/\'/g, "");
    let newArgs = null;

    // First, find the item in the player's inventory.
    /** @type {EquipmentSlot} */
    let hand;
    /** @type {InventoryItem} */
    let item;
    for (let i = args.length; i > 0; i--) {
        hand = game.entityFinder.getPlayerHandHoldingItem(player, args.slice(0, i).join(" "), undefined, "player");
        if (hand) {
            item = hand.equippedItem;
            args = args.slice(i);
            break;
        }
    }
    if (item !== undefined) {
        parsedInput = parsedInput.substring(item.name.length).trim();
        newArgs = parsedInput.split(' ');
    }
    else return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" in either of your hands. If this item is elsewhere in your inventory, please unequip or unstash it before trying to drop it.`);

    // Check if the player specified an fixture.
    const fixtures = game.fixtures.filter(fixture => fixture.location.id === player.location.id && fixture.accessible);
    let fixture = null;
    if (parsedInput !== "") {
        for (let i = 0; i < fixtures.length; i++) {
            if (fixtures[i].name === parsedInput) return game.communicationHandler.reply(message, `You need to supply a preposition.`);
            if ((parsedInput === `${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}` || parsedInput === `IN ${fixtures[i].name}`) && fixtures[i].preposition !== "") {
                fixture = fixtures[i];
                parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(fixtures[i].name)).trimEnd();
                // Check if the fixture has a puzzle attached to it.
                if (fixture.childPuzzle !== null && fixture.childPuzzle.type !== "weight" && fixture.childPuzzle.type !== "container" && (!fixture.childPuzzle.accessible || !fixture.childPuzzle.solved) && player.hidingSpot !== fixture.name)
                    return game.communicationHandler.reply(message, `You cannot put items ${fixture.preposition} ${fixture.name} right now.`);
                newArgs = parsedInput.split(' ');
                newArgs.splice(newArgs.length - 1, 1);
                parsedInput = newArgs.join(' ');
                break;
            }
            else if (parsedInput === `${newArgs[0]} ${fixtures[i].name}` && fixtures[i].preposition === "") return game.communicationHandler.reply(message, `${fixtures[i].name} cannot hold items. Contact a moderator if you believe this is a mistake.`);
        }
    }

    // Check if the player specified a container item.
    const items = game.roomItems.filter(item => item.location.id === player.location.id && item.accessible && (item.quantity > 0 || isNaN(item.quantity)));
    let containerItem = null;
    let containerItemSlot = null;
    if (parsedInput !== "") {
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === parsedInput) return game.communicationHandler.reply(message, `You need to supply a preposition.`);
            if (parsedInput.endsWith(items[i].name) && parsedInput !== items[i].name) {
                const itemContainer = items[i].container;
                if (fixture === null || fixture !== null && itemContainer !== null && (itemContainer.name === fixture.name || itemContainer instanceof Puzzle && itemContainer.parentFixture.name === fixture.name)) {
                    if (items[i].inventory.size === 0) return game.communicationHandler.reply(message, `${items[i].name} cannot hold items. Contact a moderator if you believe this is a mistake.`);
                    containerItem = items[i];
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(items[i].name)).trimEnd();
                    // Check if a slot was specified.
                    if (parsedInput.endsWith(" OF")) {
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" OF")).trimEnd();
                        newArgs = parsedInput.split(' ');
                        for (const [id, slot] of containerItem.inventory) {
                            if (parsedInput.endsWith(id)) {
                                containerItemSlot = slot;
                                parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(containerItemSlot.id)).trimEnd();
                                break;
                            }
                        }
                        if (containerItemSlot === null || containerItemSlot === undefined) return game.communicationHandler.reply(message, `Couldn't find "${newArgs[newArgs.length - 1]}" of ${containerItem.name}.`);
                    }
                    newArgs = parsedInput.split(' ');
                    newArgs.splice(newArgs.length - 1, 1);
                    parsedInput = newArgs.join(' ');
                    break;
                }
            }
        }
    }

    // Now decide what the container should be.
    let container = null;
    let slot = null;
    if (fixture !== null && fixture.childPuzzle === null && containerItem === null)
        container = fixture;
    else if (fixture !== null && fixture.childPuzzle !== null && (fixture.childPuzzle.type === "weight" || fixture.childPuzzle.type === "container" || fixture.childPuzzle.accessible && fixture.childPuzzle.solved || player.hidingSpot === fixture.name) && containerItem === null)
        container = fixture.childPuzzle;
    else if (containerItem !== null) {
        container = containerItem;
        if (containerItemSlot === null) [containerItemSlot] = containerItem.inventory.values();
        slot = containerItemSlot;
        if (item.prefab.size > containerItemSlot.capacity && container.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${container.name} because it is too large.`);
        else if (item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${container.name} because it is too large.`);
        else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity && container.inventory.size !== 1) return game.communicationHandler.reply(message, `${item.name} will not fit in ${containerItemSlot.id} of ${container.name} because there isn't enough space left.`);
        else if (containerItemSlot.takenSpace + item.prefab.size > containerItemSlot.capacity) return game.communicationHandler.reply(message, `${item.name} will not fit in ${container.name} because there isn't enough space left.`);
    }
    else {
        if (parsedInput !== "") return game.communicationHandler.reply(message, `Couldn't find "${parsedInput}" to drop item into.`);
        const defaultDropFixture = fixtures.find(fixture => fixture.name === game.settings.defaultDropFixture);
        if (defaultDropFixture === null || defaultDropFixture === undefined) return game.communicationHandler.reply(message, `You cannot drop items in this room.`);
        container = defaultDropFixture;
    }

    let topContainer = container;
    while (topContainer !== null && topContainer instanceof RoomItem)
        topContainer = topContainer.container;

    if (topContainer !== null) {
        let topContainerPreposition = "in";
        if (topContainer instanceof Fixture && topContainer.preposition !== "") topContainerPreposition = topContainer.preposition;
        if (topContainer instanceof Fixture && topContainer.autoDeactivate && topContainer.activated)
            return game.communicationHandler.reply(message, `You cannot put items ${topContainerPreposition} ${topContainer.name} while it is turned on.`);
    }
    const hiddenStatus = player.getBehaviorAttributeStatusEffects("hidden");
    if (hiddenStatus.length > 0) {
        if (topContainer !== null && topContainer instanceof Puzzle)
            topContainer = topContainer.parentFixture;

        if (topContainer === null || topContainer instanceof Fixture && topContainer.name !== player.hidingSpot)
            return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
    }

    const action = new DropAction(game, message, player, player.location, false);
    action.performDrop(item, hand, container, slot);
}
