import Action from "../Action.ts";
import type EquipmentSlot from "../EquipmentSlot.ts";
import type InventoryItem from "../InventoryItem.ts";

/**
 * Represents an unequip action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unequip-action.html
 */
export default class UnequipAction extends Action {
	/**
     * Performs an unequip action.
     *
     * @param item - The inventory item to unequip.
     * @param equipmentSlot - The equipment slot the inventory item is currently equipped to.
     * @param handEquipmentSlot - The hand equipment slot to put the inventory item in.
     * @param notify - Whether or not to notify the player that they unequipped the inventory item. Defaults to true.
     */
	performUnequip(item: InventoryItem, equipmentSlot: EquipmentSlot, handEquipmentSlot: EquipmentSlot, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateUnequip(this, item, this.player, notify);
		this.getGame().logHandler.logUnequip(item, this.player, equipmentSlot, this.forced);
		this.player.unequip(item, equipmentSlot, handEquipmentSlot);
		handEquipmentSlot.equippedItem.executeUnequippedCommands();
	}
}
