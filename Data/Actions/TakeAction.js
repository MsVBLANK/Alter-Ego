import Action from "../Action.js";
import AttemptAction from "./AttemptAction.js";
import InventorySlot from "../InventorySlot.js";
import Puzzle from "../Puzzle.js";
import { getSortedItemsString } from "../../Modules/helpers.js";

/** @import EquipmentSlot from "../EquipmentSlot.js" */
/** @import Fixture from "../Fixture.js" */
/** @import RoomItem from "../RoomItem.js" */

/**
 * @class TakeAction
 * @classdesc Represents a take action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/take-action.html
 */
export default class TakeAction extends Action {
	/**
	 * Performs a take action.
	 * @param {RoomItem} item - The room item to take. 
	 * @param {EquipmentSlot} handEquipmentSlot - The hand equipment slot to put the item in.
     * @param {Puzzle|Fixture|RoomItem} container - The item's current container.
     * @param {InventorySlot} inventorySlot - The {@link InventorySlot|inventory slot} the item is currently in.
     * @param {boolean} [notify] - Whether or not to notify the player that they took the item. Defaults to true.
	 */
	performTake(item, handEquipmentSlot, container, inventorySlot, notify = true) {
		if (this.performed) return;
		super.perform();
		const successful = this.forced || this.player.carryWeight + item.weight <= this.player.maxCarryWeight;
		this.getGame().narrationHandler.narrateTake(this, item, this.player, notify);
		this.getGame().logHandler.logTake(item, this.player, container, inventorySlot, successful, this.forced);
		if (!successful) return;
		this.player.take(item, handEquipmentSlot, container, inventorySlot);
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