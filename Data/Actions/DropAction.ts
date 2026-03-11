import { getSortedItemsString } from "../../Modules/helpers.ts";
import Action from "../Action.ts";
import type EquipmentSlot from "../EquipmentSlot.ts";
import type Fixture from "../Fixture.ts";
import InventoryItem from "../InventoryItem.ts";
import InventorySlot from "../InventorySlot.ts";
import Puzzle from "../Puzzle.ts";
import RoomItem from "../RoomItem.ts";
import AttemptAction from "./AttemptAction.ts";

/**
 * Represents a drop action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/drop-action.html
 */
export default class DropAction extends Action {
	/**
	 * Performs a drop action.
     *
	 * @param item - The inventory item to drop.
	 * @param handEquipmentSlot - The hand equipment slot that the inventory item is currently in.
     * @param container - The container to put the item in.
     * @param inventorySlot - The {@link InventorySlot|inventory slot} to put the item in.
     * @param notify - Whether or not to notify the player that they dropped the item. Defaults to true.
	 */
	performDrop(item: InventoryItem, handEquipmentSlot: EquipmentSlot, container: Puzzle | Fixture | RoomItem,
        inventorySlot: InventorySlot<RoomItem>, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateDrop(this, item, container, this.player, notify);
		this.getGame().logHandler.logDrop(item, this.player, container, inventorySlot, this.forced);
		this.player.drop(item, handEquipmentSlot, container, inventorySlot);
		// Container is a weight puzzle.
        if (container instanceof Puzzle && container.type === "weight") {
            const weight = container.getContainedItemsWeight();
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, String(weight), "drop", "");
        }
        // Container is a container puzzle.
        else if (container instanceof Puzzle && container.type === "container") {
            const containerItems = container.getContainedItems().filter(item => !isNaN(item.quantity));
			const containerItemsString = getSortedItemsString(containerItems);
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, containerItemsString, "drop", "");
        }
	}

	/**
	 * Finds the required inventory item to call performDrop.
     *
	 * @param args - The args as strings.
	 */
	parseInteractionArgs(args: string[]): [InventoryItem, EquipmentSlot, Puzzle | Fixture | RoomItem, InventorySlot<RoomItem>] {
		const hand = this.getGame().entityFinder.getPlayerHandHoldingItem(this.player, args[0]);
		let container: Puzzle | Fixture | RoomItem;
		if (args[2] === 'Fixture') container = this.getGame().entityFinder.getFixture(args[3], args[5]);
		if (args[2] === 'Puzzle') container = this.getGame().entityFinder.getPuzzle(args[3], args[5]);
		if (args[2] === 'RoomItem') container = this.getGame().entityFinder.getRoomItem(args[3], args[5]);
		let inventorySlot: InventorySlot<RoomItem>;
		if (container instanceof RoomItem) inventorySlot = container.inventory.get(args[4]);
		return [hand?.equippedItem, hand, container, inventorySlot];
	}

	/**
	 * Validates the parsed args. The results can be passed directly into performDrop.
     *
	 * @param args - The args after being parsed.
	 */
	validateInteractionArgs(args: [InventoryItem, EquipmentSlot, Puzzle | Fixture | RoomItem, InventorySlot<RoomItem>]): [InventoryItem, EquipmentSlot, Puzzle | Fixture | RoomItem, InventorySlot<RoomItem>] | [] {
		if (args.length !== 4) return [];
		if (!args[0] || !(args[0] instanceof InventoryItem)) return [];
		const item = args[0];
		if (this.player.hasBehaviorAttribute("disable drop")) return [];
		if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable drop")) return [];
		if (!args[1] || args[1].equippedItem === null) return [];
		const hand = args[1];
		if (!args[2] || !args[2].canCurrentlyContainItems(true, this.forced)) return [];
		if (args[2].getLocation().id !== this.player.location.id) return [];
		const container = args[2];
		if (this.player.isHidden() && this.player.hidingSpot !== "") {
			let topContainer = container;
			if (container instanceof RoomItem)
				topContainer = container.getTopContainer();
			if (topContainer instanceof Puzzle && topContainer.parentFixture !== null) topContainer = topContainer.parentFixture;
			if (topContainer.name !== this.player.hidingSpot) return [];
		}
		const inventorySlot = args[3];
		if (inventorySlot && inventorySlot.willBeOverFilledBy(item)) return [];
		return [item, hand, container, inventorySlot];
	}
}
