import Action from "../Action.ts";
import type EquipmentSlot from "../EquipmentSlot.js";
import type InventoryItem from "../InventoryItem.js";

/**
 * Represents an equip action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/equip-action.html
 */
export default class EquipAction extends Action {
	/**
     * Performs an equip action.
     *
     * @param item - The inventory item to equip.
     * @param equipmentSlot - The equipment slot to equip the inventory item to.
     * @param handEquipmentSlot - The hand equipment slot that the inventory item is currently in.
     * @param notify - Whether or not to notify the player that they equipped the inventory item. Defaults to true.
     */
	performEquip(item: InventoryItem, equipmentSlot: EquipmentSlot, handEquipmentSlot: EquipmentSlot, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateEquip(this, item, this.player, notify);
		this.getGame().logHandler.logEquip(item, this.player, equipmentSlot, this.forced);
		this.player.equip(item, equipmentSlot, handEquipmentSlot);
		equipmentSlot.equippedItem.executeEquippedCommands();
	}
}
