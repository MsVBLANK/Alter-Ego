import Action from "../Action.js";
import AttemptAction from "./AttemptAction.js";
import InventorySlot from "../InventorySlot.js";
import Puzzle from "../Puzzle.js";
import { getSortedItemsString } from "../../Modules/helpers.js";

/** @import EquipmentSlot from "../EquipmentSlot.js" */
/** @import Fixture from "../Fixture.js" */
/** @import InventoryItem from "../InventoryItem.js" */
/** @import RoomItem from "../RoomItem.js" */

/**
 * @class DressAction
 * @classdesc Represents a dress action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/dress-action.html
 */
export default class DressAction extends Action {
	/**
	 * Performs a dress action.
	 * @param {RoomItem[]} items - All of the equippable items in the given container.
	 * @param {EquipmentSlot} handEquipmentSlot - The hand equipment slot to use to take items.
	 * @param {Puzzle|Fixture|RoomItem} container - The container to dress from.
	 * @param {InventorySlot<RoomItem>} inventorySlot - The inventory slot to dress from, if applicable.
	 */
	performDress(items, handEquipmentSlot, container, inventorySlot) {
		if (this.performed) return;
		super.perform();
		/** @type {InventoryItem[]} */
		const equippedItems = [];
		for (const item of items) {
			// Player shouldn't be able to take items that they're not strong enough to carry.
			if (!this.forced && this.player.carryWeight + item.weight > this.player.maxCarryWeight) continue;
			for (const slotId of item.prefab.equipmentSlots) {
				if (this.player.inventory.has(slotId) && this.player.inventory.get(slotId).equippedItem === null) {
					this.player.take(item, handEquipmentSlot, container, inventorySlot);
					this.player.equip(handEquipmentSlot.equippedItem, this.player.inventory.get(slotId), handEquipmentSlot);
					equippedItems.push(this.player.inventory.get(slotId).equippedItem);
					break;
				}
			}
		}
		this.getGame().narrationHandler.narrateDress(this, equippedItems, container, this.player);
		this.getGame().logHandler.logDress(equippedItems, this.player, container, inventorySlot, this.forced);
		// Execute equipped commands.
		for (const equippedItem of equippedItems)
			equippedItem.executeEquippedCommands();
		// Container is a weight puzzle.
		if (container instanceof Puzzle && container.type === "weight") {
			const weight = container.getContainedItemsWeight();
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, String(weight), "take", "");
		}
		// Container is a container puzzle.
		else if (container instanceof Puzzle && container.type === "container") {
			const containerItems = container.getContainedItems().filter(item => !isNaN(item.quantity));
			const containerItemsString = getSortedItemsString(containerItems);
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, containerItemsString, "take", "");
		}
	}
}