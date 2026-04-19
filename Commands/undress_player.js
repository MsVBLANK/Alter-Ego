import UndressAction from '../Data/Actions/UndressAction.ts';
import Fixture from "../Data/Fixture.ts";
import RoomItem from "../Data/RoomItem.ts";
import Puzzle from "../Data/Puzzle.ts";

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "undress_player",
    description: "Unequips and drops all items.",
    details: `Unequips all items you have equipped and drops them in the room you're currently in. You will undress completely, `
        + `including any items in your hands. This will be narrated, so any other players in the room will see you undress.\n\n`
        + `If you want to put your items in a specific fixture or item in the room, add the container's name. No preposition is necessary. `
        + `If you don't specify a container, you will simply leave the items on the floor.\n\n`
        + `If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which slot you want to put the items in. `
        + `To do this, enter the name of the inventory slot followed by "of" before the name of the container. If you don't specify an inventory slot, you will put `
        + `the items in the first slot it has. Keep in mind that the specified container must have a large enough capacity to hold all of the items in your inventory.`,
    usableBy: "Player",
    aliases: ["undress"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}undress\n`
        + `${settings.commandPrefix}undress WARDROBE\n`
        + `${settings.commandPrefix}undress LAUNDRY BASKET\n`
        + `${settings.commandPrefix}undress MAIN POCKET of BLUE BACKPACK`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    const status = player.getBehaviorAttributeStatusEffects("disable undress");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const equippedItems = player.inventory.filter(equipmentSlot => equipmentSlot.equippedItem !== null);
    if (equippedItems.size === 0) return game.communicationHandler.reply(message, `You cannot undress because you are not wearing anything.`);

    const input = args.join(' ');
    let parsedInput = input.toUpperCase().replace(/\'/g, "");

    // Check if the player specified a fixture.
    const fixtures = game.fixtures.filter(fixture => fixture.location.id === player.location.id && fixture.accessible);
    let fixture = null;
    if (parsedInput !== "") {
        for (let i = 0; i < fixtures.length; i++) {
            if (fixtures[i].name === parsedInput && fixtures[i].preposition !== "") {
                fixture = fixtures[i];
                parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(fixtures[i].name)).trimEnd();
                // Check if the fixture has a puzzle attached to it.
                if (fixture.childPuzzle !== null && !fixture.childPuzzle.isAlwaysAccessible() && (!fixture.childPuzzle.accessible || !fixture.childPuzzle.solved) && player.hidingSpot !== fixture.name)
                    return game.communicationHandler.reply(message, `You cannot put items ${fixture.preposition} ${fixture.name} right now.`);
                break;
            }
            else if (fixtures[i].name === parsedInput) return game.communicationHandler.reply(message, `${fixtures[i].name} cannot hold items. Contact a moderator if you believe this is a mistake.`);
        }
    }

    // Check if the player specified a container item.
    const items = game.entityFinder.getRoomItems(null, player.location.id, true);
    let containerItem = null;
    let containerItemSlot = null;
    if (parsedInput !== "") {
        for (let i = 0; i < items.length; i++) {
            if (parsedInput.endsWith(items[i].name)) {
                const itemContainer = items[i].container;
                if (fixture === null || fixture !== null && itemContainer !== null && (itemContainer.name === fixture.name || itemContainer instanceof Puzzle && itemContainer.parentFixture.name === fixture.name)) {
                    if (items[i].inventory.size === 0) return game.communicationHandler.reply(message, `${items[i].name} cannot hold items. Contact a moderator if you believe this is a mistake.`);
                    containerItem = items[i];
                    parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(items[i].name)).trimEnd();
                    // Check if a slot was specified.
                    if (parsedInput.endsWith(" OF")) {
                        parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(" OF")).trimEnd();
                        for (const [id, slot] of containerItem.inventory) {
                            if (parsedInput.endsWith(id)) {
                                containerItemSlot = slot;
                                parsedInput = parsedInput.substring(0, parsedInput.lastIndexOf(id)).trimEnd();
                                break;
                            }
                        }
                        if (containerItemSlot === null) return game.communicationHandler.reply(message, `Couldn't find "${parsedInput}" of ${containerItem.name}.`);
                    }
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
    else if (fixture !== null && fixture.childPuzzle !== null && (fixture.childPuzzle.isAlwaysAccessible() || fixture.childPuzzle.accessible && fixture.childPuzzle.solved || player.hidingSpot === fixture.name) && containerItem === null)
        container = fixture.childPuzzle;
    else if (containerItem !== null) {
        container = containerItem;
        if (containerItemSlot === null) [containerItemSlot] = containerItem.inventory.values();
        slot = containerItemSlot;
        const totalSize = player.inventory.values().reduce((sum, item) => {
            return item.equippedItem !== null ? sum + item.equippedItem.prefab.size : sum;
        }, 0);
        if (totalSize > containerItemSlot.capacity && container.inventory.size !== 1) return game.communicationHandler.reply(message, `Your inventory will not fit in ${containerItemSlot.id} of ${container.name} because it is too large.`);
        else if (totalSize > containerItemSlot.capacity) return game.communicationHandler.reply(message, `Your inventory will not fit in ${container.name} because it is too large.`);
        else if (containerItemSlot.takenSpace + totalSize > containerItemSlot.capacity && container.inventory.size !== 1) return game.communicationHandler.reply(message, `Your inventory will not fit in ${containerItemSlot.id} of ${container.name} because there isn't enough space left.`);
        else if (containerItemSlot.takenSpace + totalSize > containerItemSlot.capacity) return game.communicationHandler.reply(message, `Your inventory will not fit in ${container.name} because there isn't enough space left.`);
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

    const action = new UndressAction(game, message, player, player.location, false);
    action.performUndress(container, slot);
}
