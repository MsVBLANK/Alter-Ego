import Fixture from "../Data/Fixture.ts";
import RoomItem from "../Data/RoomItem.js";
import Puzzle from "../Data/Puzzle.js";
import DestroyAction from "../Data/Actions/DestroyAction.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import InventoryItem from '../Data/InventoryItem.js' */
/** @import InventorySlot from '../Data/InventorySlot.ts' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "destroy_moderator",
    description: "Destroys an item.",
    details: "Destroys an item in the specified location or in the player's inventory. The prefab ID or container identifier of the item must be given. "
        + "In order to destroy an item, the name of the room must be given, following \"at\". The name of the container it belongs to can also be specified. "
        + "If the container is another item, the identifier of the item or its prefab ID must be used. "
        + "The name of the inventory slot to destroy the item from can also be specified.\n\n"
        + "To destroy an inventory item, the name of the player must be given followed by \"'s\". A container item can also be specified, "
        + "as well as which slot to delete the item from. The player will not be notified if a container item is specified. "
        + "An equipment slot can also be specified instead of a container item. This will destroy whatever item is equipped to it. "
        + "The player will be notified in this case, and the item's unequipped commands will be run.\n\n"
        + "Note that using the \"all\" argument with a container will destroy all items in that container.",
    usableBy: "Moderator",
    aliases: ["destroy", "ds"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}destroy volleyball at beach\n`
        + `${settings.commandPrefix}destroy gasoline on shelves at warehouse\n`
        + `${settings.commandPrefix}destroy note in locker 1 at mens locker room\n`
        + `${settings.commandPrefix}destroy wrench in tool box at beach house\n`
        + `${settings.commandPrefix}destroy gloves in breast pocket of tuxedo at dressing room\n`
        + `${settings.commandPrefix}destroy all in trash can at lounge\n`
        + `${settings.commandPrefix}destroy nero's katana\n`
        + `${settings.commandPrefix}destroy yuda's glasses\n`
        + `${settings.commandPrefix}destroy vivians laptop in vivian's vivians satchel\n`
        + `${settings.commandPrefix}destroy shotput ball in cassie's main pocket of large backpack\n`
        + `${settings.commandPrefix}destroy all in hitoshi's trousers\n`
        + `${settings.commandPrefix}destroy all in charlotte's right pocket of dress`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 */
export async function execute(game, message, command, args) {
    if (args.length < 2)
        return game.communicationHandler.reply(message, `Not enough arguments given. Usage:\n${usage(game.settings)}`);

    let destroyAll = false;
    if (args[0].toLowerCase() === "all") {
        destroyAll = true;
        args.splice(0, 1);
    }

    const input = args.join(" ");
    let parsedInput = input.toUpperCase().replace(/\'/g, "");
    const undashedInput = parsedInput.replace(/-/g, " ");

    const room = game.entityFinder.getRooms(undashedInput.substring(undashedInput.lastIndexOf(" AT ") + 4), null, null, true)[0];
    if (room) {
        parsedInput = parsedInput.substring(0, undashedInput.lastIndexOf(" AT "));
    }

    // Room was found. Look for the container in it.
    if (room !== undefined) {
        /** @type {RoomItem} */
        let item = null;
        /** @type {RoomItem} */
        let containerItem = null;
        /** @type {InventorySlot<RoomItem>} */
        let containerItemSlot = null;
        // Check if a container item was specified.
        const roomItems = game.entityFinder.getRoomItems(null, room.id);
        for (let i = 0; i < roomItems.length; i++) {
            // If parsedInput is only the identifier or the item's name, we've found the item to delete.
            if (roomItems[i].identifier !== "" && roomItems[i].identifier === parsedInput || roomItems[i].prefab.id === parsedInput) {
                item = roomItems[i];
                break;
            }
            if (parsedInput.endsWith(roomItems[i].identifier) && roomItems[i].identifier !== "") {
                if (roomItems[i].inventory.size === 0 || roomItems[i].prefab.preposition === "") return game.communicationHandler.reply(message, `${roomItems[i].getIdentifier()} cannot hold items.`);
                containerItem = roomItems[i];

                if (parsedInput.endsWith(roomItems[i].identifier) && roomItems[i].identifier !== "")
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(roomItems[i].identifier)).trimEnd();
                else if (parsedInput.endsWith(roomItems[i].prefab.id))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(roomItems[i].prefab.id)).trimEnd();
                let newArgs = parsedInput.split(' ');
                // Check if a slot was specified.
                if (parsedInput.endsWith(" OF")) {
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" OF")).trimEnd();
                    newArgs = parsedInput.split(' ');
                    for (const inventorySlot of containerItem.inventory.values()) {
                        if (parsedInput.endsWith(inventorySlot.id)) {
                            containerItemSlot = inventorySlot;
                            parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(inventorySlot.id)).trimEnd();
                            break;
                        }
                    }
                    if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${newArgs[newArgs.length - 1]}" of ${containerItem.getIdentifier()}.`);
                }
                if (parsedInput.endsWith(containerItem.prefab.preposition.toUpperCase()))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(containerItem.prefab.preposition.toUpperCase())).trimEnd();
                else if (parsedInput.endsWith(" IN"))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" IN")).trimEnd();
                break;
            }
        }
        if (containerItem !== null && containerItemSlot === null) containerItemSlot = containerItem.inventory.first();

        // Check if a fixture was specified.
        /** @type {Fixture} */
        let fixture = null;
        if (containerItem === null && item === null) {
            const fixtures = game.fixtures.filter(fixture => fixture.location.id === room.id && fixture.accessible);
            for (let i = 0; i < fixtures.length; i++) {
                if (fixtures[i].name === parsedInput) return game.communicationHandler.reply(message, `You need to supply an item and a preposition.`);
                if (parsedInput.endsWith(`${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}`) || parsedInput.endsWith(`IN ${fixtures[i].name}`)) {
                    fixture = fixtures[i];
                    if (parsedInput.endsWith(`${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}`))
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(`${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}`)).trimEnd();
                    else if (parsedInput.endsWith(`IN ${fixtures[i].name}`))
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(`IN ${fixtures[i].name}`)).trimEnd();
                    else
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(fixtures[i].name)).trimEnd();
                    break;
                }
            }
        }

        // Now decide what the container should be.
        /** @type {RoomItemContainer} */
        let container = null;
        let slotName = "";
        if (fixture !== null && fixture.childPuzzle === null && containerItem === null)
            container = fixture;
        else if (fixture !== null && fixture.childPuzzle !== null && containerItem === null)
            container = fixture.childPuzzle;
        else if (containerItem !== null) {
            container = containerItem;
            slotName = containerItemSlot.id;
        }
        else if (item !== null)
            container = item.container;
        else
            container = null;

        /** @type {RoomItem[]} */
        let containerItems = [];
        let containerName = "";
        let preposition = "in";
        // Container is a Room.
        if (container === null) {
            containerItems = roomItems;
            containerName = `${room.id}`;
            preposition = "at";
        }
        // Container is a Fixture.
        else if (container instanceof Fixture) {
            containerItems = container.getContainedItems();
            containerName = `${container.name} at ${room.id}`;
            preposition = container.getPreposition();
        }
        // Container is a Puzzle.
        else if (container instanceof Puzzle) {
            containerItems = container.getContainedItems();
            containerName = `${container.parentFixture.name} at ${room.id}`;
            preposition = container.getPreposition();
        }
        // Container is a RoomItem.
        else if (container instanceof RoomItem) {
            if (containerItemSlot) containerItems = containerItemSlot.getContainedItems();
            else containerItems = container.getContainedItems();
            containerName = `${slotName} of ${container.identifier} at ${room.id}`;
            preposition = container.getPreposition();
        }

        if (destroyAll) {
            if (parsedInput !== "") return game.communicationHandler.reply(message, `Couldn't find "${parsedInput}" at ${room.id}`);
            const quantity = containerItems.length;
            for (let i = 0; i < containerItems.length; i++) {
                const destroyAction = new DestroyAction(game, message, undefined, room, true);
                destroyAction.performDestroyRoomItem(containerItems[i], containerItems[i].quantity, true);
            }
            game.communicationHandler.sendToCommandChannel(`Successfully destroyed ${quantity} item${quantity !== 1 ? `s` : ``} ${preposition} ${containerName}.`);
        }
        else {
            // Find the item if it hasn't been found already.
            if (item === null) {
                for (let i = 0; i < containerItems.length; i++) {
                    if (containerItems[i].identifier === parsedInput || containerItems[i].prefab.id === parsedInput) {
                        item = containerItems[i];
                        break;
                    }
                }
            }
            if (item === null) return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" ${preposition} ${containerName}.`);

            const destroyAction = new DestroyAction(game, message, undefined, room, true);
            destroyAction.performDestroyRoomItem(item, item.quantity, true);
            game.communicationHandler.sendToCommandChannel(`Successfully destroyed ${item.getIdentifier()} ${preposition} ${containerName}.`);
        }
    }
    else {
        /** @type {Player} */
        let player = null;
        /** @type {InventoryItem} */
        let item = null;
        for (let i = 0; i < args.length; i++) {
            let playerName = args[i].toUpperCase();
            if (playerName.endsWith("'S")) {
                playerName = playerName.slice(0, -2);
            }

            const fetchedPlayer = game.entityFinder.getLivingPlayer(playerName);
            if (fetchedPlayer) {
                player = fetchedPlayer
                args.splice(i, 1);
                break;
            }
        }
        if (player === null) return game.communicationHandler.reply(message, `Couldn't find a room or player in your input.`);

        parsedInput = args.join(" ").toUpperCase().replace(/\'/g, "");

        // Check if an inventory item was specified.
        /** @type {InventoryItem} */
        let containerItem = null;
        /** @type {InventorySlot<InventoryItem>} */
        let containerItemSlot = null;
        const playerItems = player.getContainedItems().filter(item => item.prefab !== null);
        for (let i = 0; i < playerItems.length; i++) {
            // If parsedInput is only the identifier or the item's name, we've found the item to delete.
            if (playerItems[i].identifier !== "" && playerItems[i].identifier === parsedInput || playerItems[i].prefab.id === parsedInput) {
                item = playerItems[i];
                break;
            }
            if (parsedInput.endsWith(playerItems[i].identifier) && playerItems[i].identifier !== "" || parsedInput.endsWith(playerItems[i].prefab.id)) {
                if (playerItems[i].inventory.size === 0 || playerItems[i].prefab.preposition === "") return game.communicationHandler.reply(message, `${playerItems[i].getIdentifier()} cannot hold items.`);
                containerItem = playerItems[i];

                if (parsedInput.endsWith(playerItems[i].identifier) && playerItems[i].identifier !== "")
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(playerItems[i].identifier)).trimEnd();
                else if (parsedInput.endsWith(playerItems[i].prefab.id))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(playerItems[i].prefab.id)).trimEnd();
                let newArgs = parsedInput.split(' ');
                // Check if a slot was specified.
                if (parsedInput.endsWith(" OF")) {
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" OF")).trimEnd();
                    newArgs = parsedInput.split(' ');
                    for (const inventorySlot of containerItem.inventory.values()) {
                        if (parsedInput.endsWith(inventorySlot.id)) {
                            containerItemSlot = inventorySlot;
                            parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(inventorySlot.id)).trimEnd();
                            break;
                        }
                    }
                    if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${parsedInput.substring(parsedInput.lastIndexOf(" IN ") + 4)}" of ${containerItem.getIdentifier()}.`);
                }
                if (parsedInput.endsWith(containerItem.prefab.preposition.toUpperCase()))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(containerItem.prefab.preposition.toUpperCase())).trimEnd();
                else if (parsedInput.endsWith(" IN"))
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" IN")).trimEnd();
                break;
            }
        }
        if (containerItem !== null && containerItemSlot === null) containerItemSlot = containerItem.inventory.first();
        const slotName = containerItem !== null ? containerItemSlot.id : "";

        /** @type {InventoryItem[]} */
        let containerItems = [];
        let containerName = "";
        let preposition = "in";
        // If the item still hasn't been found, but a containerItem was, find it in the container.
        if (containerItem !== null) {
            if (containerItemSlot) containerItems = containerItemSlot.getContainedItems();
            else containerItems = containerItem.getContainedItems();
            containerName = `${slotName} of ${containerItem.identifier} in ${player.name}'s inventory`;
            preposition = containerItem.getPreposition();

            if (destroyAll) {
                const quantity = containerItems.length;
                for (let i = 0; i < containerItems.length; i++) {
                    const destroyAction = new DestroyAction(game, message, player, player.location, true);
                    destroyAction.performDestroyInventoryItem(containerItems[i], containerItems[i].quantity, true, false);
                }
                game.communicationHandler.sendToCommandChannel(`Successfully destroyed ${quantity} items ${preposition} ${containerName}.`);
                return;
            }
            else {
                // Find the item if it hasn't been found already.
                if (item === null) {
                    for (let i = 0; i < containerItems.length; i++) {
                        if (containerItems[i].identifier === parsedInput || containerItems[i].prefab.id === parsedInput) {
                            item = containerItems[i];
                            break;
                        }
                    }
                    if (item === null) return game.communicationHandler.reply(message, `Couldn't find item "${parsedInput}" ${preposition} ${containerName}.`);
                }
            }
        }
        else {
            // Check if an equipment slot was specified.
            let equipmentSlotId = "";
            if (player.getEquipmentSlot(parsedInput)) {
                item = player.getEquipmentSlot(parsedInput).equippedItem;
                equipmentSlotId = parsedInput;
                if (item === null) return game.communicationHandler.reply(message, `Cannot destroy item equipped to ${equipmentSlotId} because nothing is equipped to it.`);
                if (destroyAll) return game.communicationHandler.reply(message, `The "all" argument cannot be used when the container is an equipment slot.`);
            }
            else {
                for (const equipmentSlot of player.inventory.values()) {
                    if (equipmentSlot.equippedItem !== null && (equipmentSlot.equippedItem.identifier === parsedInput || equipmentSlot.equippedItem.prefab.id === parsedInput)) {
                        item = equipmentSlot.equippedItem;
                        equipmentSlotId = equipmentSlot.id;
                        if (destroyAll) return game.communicationHandler.reply(message, `The "all" argument cannot be used when the container is an equipped item.`);
                        break;
                    }
                }
            }
            if (item !== null && equipmentSlotId !== "") {
                const destroyAction = new DestroyAction(game, message, player, player.location, true);
                destroyAction.performDestroyInventoryItem(item, item.quantity, true, true);
                game.communicationHandler.sendToCommandChannel(`Successfully destroyed ${item.getIdentifier()} equipped to ${player.name}'s ${equipmentSlotId}.`);
                return;
            }
        }

        if (item !== null) {
            if (containerName === "") containerName = `${item.slot} of ${item.container.identifier} in ${player.name}'s inventory`;
            if (item.container.prefab.preposition) preposition = item.container.prefab.preposition;

            const destroyAction = new DestroyAction(game, message, player, player.location, true);
            destroyAction.performDestroyInventoryItem(item, item.quantity, true);
            game.communicationHandler.sendToCommandChannel(`Successfully destroyed ${item.getIdentifier()} ${preposition} ${containerName}.`);
        }
        else return game.communicationHandler.reply(message, `Couldn't find "${parsedInput}" in ${player.name}'s inventory.`);
    }
}
