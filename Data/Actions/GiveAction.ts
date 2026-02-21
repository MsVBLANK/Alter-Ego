import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.js";
import type EquipmentSlot from "../EquipmentSlot.js";
import type Player from "../Player.js";

/**
 * Represents a give action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/give-action.html
 */
export default class GiveAction extends Action {
	/**
	 * Performs a give action.
     *
	 * @param item - The inventory item to give.
     * @param handEquipmentSlot - The hand equipment slot that the inventory item is currently in.
     * @param recipient - The player to give the inventory item to.
     * @param recipientHandEquipmentSlot - The hand equipment slot of the recipient to put the item in.
	 */
	performGive(item: InventoryItem, handEquipmentSlot: EquipmentSlot, recipient: Player, recipientHandEquipmentSlot: EquipmentSlot): void {
		if (this.performed) return;
		super.perform();
		const successful = this.forced || recipient.carryWeight + item.weight <= recipient.maxCarryWeight;
		this.getGame().narrationHandler.narrateGive(this, item, this.player, recipient);
		this.getGame().logHandler.logGive(item, this.player, recipient, successful, this.forced);
		if (successful) this.player.give(item, handEquipmentSlot, recipient, recipientHandEquipmentSlot);
	}
}
