import InspectAction from '../Data/Actions/InspectAction.ts';
import Fixture from "../Data/Fixture.ts";
import RoomItem from "../Data/RoomItem.js";
import Puzzle from "../Data/Puzzle.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "inspect_player",
    description: "Learn more about a fixture, item, or player.",
    details: `Tells you about a fixture, item, or player in the room you're in. `
        + `A fixture is something in the room that you can interact with but not take with you. `
        + `An item is something that you can both interact with and take with you. If you inspect a fixture, `
        + `everyone in the room will see you inspect it. The same goes for very large items.\n\n`
        + `If there are multiple items with the same name in the room, you can specify which one you want to inspect using the name of the container it's in. `
        + `To do this, you must enter the container's preposition before its name. If you don't know its preposition, "in" will always work. `
        + `If you are inspecting an item contained inside another item that has multiple inventory slots (for example, a backpack with several pockets), you can `
        + `specify which of the container's slots you want to search in, by entering the name of the slot followed by "of" before the container item's name.\n\n`
        + `You can also inspect items in your inventory. If you have an item with the same name as an item in the room you're currently in, `
        + `you can specify that you want to inspect your item by adding "my" before the item name.\n\n`
        + `To inspect a player, enter their display name as it appears when you enter the room or when they perform an action. You can even inspect `
        + `visible items in their inventory by adding 's to the end of their name, followed by the name of the item you want to inspect. No one will `
        + `see you do this, but you will receive slightly less info when inspecting another player's items.\n\n`
        + `To see the description of the room you're in without having to leave and come back, you can enter "room".`,
    usableBy: "Player",
    aliases: ["inspect", "investigate", "examine", "look", "x"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}inspect DESK\n`
        + `${settings.commandPrefix}examine KNIFE\n`
        + `${settings.commandPrefix}look JUG OF ORANGE JUICE in REFRIGERATOR\n`
        + `${settings.commandPrefix}x WOOLEN MITTENS in MAIN POUCH of RED BACKPACK\n`
        + `${settings.commandPrefix}investigate my PISTOL\n`
        + `${settings.commandPrefix}look Kiara\n`
        + `${settings.commandPrefix}examine an individual wearing a PLAGUE DOCTOR MASK\n`
        + `${settings.commandPrefix}look Marielle's CIRCLE GLASSES\n`
        + `${settings.commandPrefix}x an individual wearing a PLAGUE DOCTOR MASK's BLACK CLOAK\n`
        + `${settings.commandPrefix}inspect room`;
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
        return game.communicationHandler.reply(message, `You need to specify a fixture/item/player. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable inspect");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    // This will be checked multiple times, so get it now.
    const hiddenStatus = player.getBehaviorAttributeStatusEffects("hidden");

    const input = args.join(" ");
    let parsedInput = input.toUpperCase().replace(/\'/g, "");

    // What we do with this action, if anything, depends on what the player inspects.
    const action = new InspectAction(game, message, player, player.location, false);

    // Before anything else, check if the player is trying to inspect the room.
    if (parsedInput === "ROOM") {
        action.performInspect(player.location);
        return;
    }

    // Check if the input is a fixture, or an item on a fixture.
    const fixtures = game.fixtures.filter(fixture => fixture.location.id === player.location.id && fixture.accessible);
    const items = game.entityFinder.getRoomItems(null, player.location.id, true);
    let fixture = null;
    let item = null;
    let container = null;
    let slotName = "";
    for (let i = 0; i < fixtures.length; i++) {
        if (fixtures[i].name === parsedInput) {
            fixture = fixtures[i];
            break;
        }

        if ((parsedInput.endsWith(` ${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}`) || parsedInput.endsWith(` IN ${fixtures[i].name}`)) && fixtures[i].preposition !== "") {
            const fixtureItems = items.filter(item =>
                item.containerType === `Fixture` && item.containerName === fixtures[i].name
                || fixtures[i].childPuzzle !== null && item.containerType === `Puzzle` && item.containerName === fixtures[i].childPuzzle.name
            );
            for (let j = 0; j < fixtureItems.length; j++) {
                if (
                    parsedInput === `${fixtureItems[j].name} ${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}` ||
                    parsedInput === `${fixtureItems[j].pluralName} ${fixtures[i].preposition.toUpperCase()} ${fixtures[i].name}` ||
                    parsedInput === `${fixtureItems[j].name} IN ${fixtures[i].name}` ||
                    parsedInput === `${fixtureItems[j].pluralName} IN ${fixtures[i].name}`
                ) {
                    item = fixtureItems[j];
                    container = item.container;
                    slotName = item.slot;
                    break;
                }
            }
            if (item !== null) break;
        }
    }

    if (fixture !== null) {
        // Make sure the player can only inspect the fixture they're hiding in, if they're hidden.
        if (hiddenStatus.length > 0 && player.hidingSpot !== fixture.name) return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
        action.performInspect(fixture);
        return;
    }

    let onlySearchInventory = false;
    if (parsedInput.startsWith("MY ")) onlySearchInventory = true;

    if (!onlySearchInventory) {
        // Now check if the input is an item.
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === parsedInput || items[i].pluralName === parsedInput) {
                item = items[i];
                container = item.container;
                slotName = item.slot;
                break;
            }

            const itemContainer = items[i].container;
            if (itemContainer !== null && itemContainer instanceof RoomItem) {
                const preposition = itemContainer.prefab.preposition.toUpperCase();
                let containerString = "";
                if (parsedInput.startsWith(`${items[i].name} ${preposition} `))
                    containerString = parsedInput.substring(`${items[i].name} ${preposition} `.length).trim();
                else if (parsedInput.startsWith(`${items[i].pluralName} ${preposition} `))
                    containerString = parsedInput.substring(`${items[i].pluralName} ${preposition} `.length).trim();
                else if (parsedInput.startsWith(`${items[i].name} IN `))
                    containerString = parsedInput.substring(`${items[i].name} IN `.length).trim();
                else if (parsedInput.startsWith(`${items[i].pluralName} IN `))
                    containerString = parsedInput.substring(`${items[i].pluralName} IN `.length).trim();

                if (containerString !== "") {
                    // Slot name was specified.
                    if (parsedInput.endsWith(` OF ${itemContainer.name}`)) {
                        const tempSlotName = containerString.substring(0, containerString.lastIndexOf(` OF ${itemContainer.name}`)).trim();
                        container = itemContainer.inventory.get(tempSlotName)
                        if (container && items[i].slot === tempSlotName) {
                            item = items[i];
                            slotName = item.slot;
                        } else {
                            for (const [id, slot] of itemContainer.inventory) {
                                if (id === tempSlotName && items[i].slot === tempSlotName) {
                                    item = items[i];
                                    container = item.container;
                                    slotName = item.slot;
                                    break;
                                }
                            }
                        }
                        if (!(item === null || item === undefined)) break;
                    }
                    // Only a container was specified.
                    else if (itemContainer.name === containerString) {
                        item = items[i];
                        container = item.container;
                        slotName = item.slot;
                        break;
                    }
                }
            }
        }
    }

    if (item !== null) {
        // Make sure the player can only inspect items contained in the fixture they're hiding in, if they're hidden.
        if (hiddenStatus.length > 0) {
            let topContainer = item.container;
            while (topContainer !== null && topContainer instanceof RoomItem)
                topContainer = topContainer.container;
            if (topContainer !== null && topContainer instanceof Puzzle)
                topContainer = topContainer.parentFixture;

            if (topContainer === null || topContainer instanceof Fixture && topContainer.name !== player.hidingSpot)
                return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
        }

        action.performInspect(item);
        return;
    }

    // Check if the input is an item in the player's inventory.
    const inventory = game.inventoryItems.filter(item => item.player.name === player.name && item.prefab !== null);
    for (let i = 0; i < inventory.length; i++) {
        parsedInput = parsedInput.replace("MY ", "");
        if ((inventory[i].prefab.name === parsedInput || inventory[i].prefab.pluralName === parsedInput) && inventory[i].quantity > 0) {
            action.performInspect(inventory[i]);
            return;
        }
    }

    // Check if the input is a player in the room.
    for (let i = 0; i < player.location.occupants.length; i++) {
        const occupant = player.location.occupants[i];
        const possessive = occupant.displayName.toUpperCase() + "S ";
        if (parsedInput.startsWith(occupant.displayName.toUpperCase()) && occupant.isHidden() && occupant.hidingSpot !== player.hidingSpot)
            return game.communicationHandler.reply(message, `Couldn't find "${input}".`);
        else if (parsedInput.startsWith(occupant.displayName.toUpperCase()) && hiddenStatus.length > 0 && !occupant.isHidden())
            return game.communicationHandler.reply(message, `You cannot do that because you are **${hiddenStatus[0].id}**.`);
        if (occupant.displayName.toUpperCase() === parsedInput) {
            // Don't let player inspect themselves.
            if (occupant.name === player.name) return game.communicationHandler.reply(message, `You can't inspect yourself.`);
            action.performInspect(occupant);
            return;
        }
        else if (parsedInput.startsWith(possessive)) {
            // Don't let the player inspect their own items this way.
            if (occupant.name === player.name) return game.communicationHandler.reply(message, `You can't inspect your own items this way. Use "my" instead of your name.`);
            parsedInput = parsedInput.replace(possessive, "");
            // Only equipped items should be an option.
            const inventory = game.inventoryItems.filter(item => item.player.name === occupant.name && item.prefab !== null && item.containerName === "" && item.container === null);
            for (let j = 0; j < inventory.length; j++) {
                if (inventory[j].prefab.name === parsedInput && (inventory[j].equipmentSlot !== "LEFT HAND" && inventory[j].equipmentSlot !== "RIGHT HAND" || !inventory[j].prefab.discreet)) {
                    // Make sure the item isn't covered by anything first.
                    const coveringItems = inventory.filter(item =>
                        item.equipmentSlot !== "RIGHT HAND" &&
                        item.equipmentSlot !== "LEFT HAND" &&
                        item.prefab.coveredEquipmentSlots.includes(inventory[j].equipmentSlot)
                    );
                    if (coveringItems.length === 0) {
                        action.performInspect(inventory[j]);
                        return;
                    }
                }
            }
        }
    }

    return game.communicationHandler.reply(message, `Couldn't find "${input}".`);
}
