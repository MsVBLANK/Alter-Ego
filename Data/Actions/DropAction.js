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
 * @class DropAction
 * @classdesc Represents a drop action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/drop-action.html
 */
export default class DropAction extends Action {
	/**
	 * Performs a drop action.
	 * @param {InventoryItem} item - The inventory item to drop. 
	 * @param {EquipmentSlot} handEquipmentSlot - The hand equipment slot that the inventory item is currently in.
     * @param {Puzzle|Fixture|RoomItem} container - The container to put the item in.
     * @param {InventorySlot} inventorySlot - The {@link InventorySlot|inventory slot} to put the item in.
     * @param {boolean} [notify] - Whether or not to notify the player that they dropped the item. Defaults to true.
	 */
	performDrop(item, handEquipmentSlot, container, inventorySlot, notify = true) {
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
}