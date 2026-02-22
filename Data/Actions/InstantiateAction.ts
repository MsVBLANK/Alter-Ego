import { instantiateInventoryItem, instantiateRoomItem } from "../../Modules/itemManager.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.js";
import ItemInstance from "../ItemInstance.ts";
import type Prefab from "../Prefab.js";
import type RoomItem from "../RoomItem.js";

/**
 * Represents an instantiate action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/instantiate-action.html
 */
export default class InstantiateAction extends Action {
	/**
	 * Performs an instantiate action for a room item.
     *
	 * @param prefab - The prefab to instantiate as an item.
	 * @param container - The container to instantiate the item in.
	 * @param inventorySlotId - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
	 * @param quantity - The quantity to instantiate.
	 * @param proceduralSelections - The manually selected procedural possibilities.
	 * @param uses - The number of uses to instantiate the room item with. Defaults to the prefab's uses.
     * @returns The instantiated {@link RoomItem| room item}.
	 */
	performInstantiateRoomItem(prefab: Prefab, container: RoomItemContainer, inventorySlotId: string, quantity: number,
        proceduralSelections: Map<string, string>, uses: number = prefab.uses): RoomItem {
		if (this.performed) return;
		super.perform();
		const createdItem = instantiateRoomItem(prefab, this.location, container, inventorySlotId, quantity, uses, proceduralSelections, this.player);
		const inventorySlot = createdItem.container instanceof ItemInstance ? createdItem.container.inventory.get(inventorySlotId) : undefined;
		this.getGame().logHandler.logInstantiateRoomItem(createdItem, quantity, container, inventorySlot);
		return createdItem;
	}

	/**
	 * Performs an instantiate action for an inventory item.
     *
	 * @param prefab - The prefab to instantiate as an inventory item.
	 * @param equipmentSlotId - The ID of the equipment slot this inventory item will belong to.
	 * @param container - The container to instantiate the item in.
	 * @param inventorySlotId - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
	 * @param quantity - The quantity to instantiate.
	 * @param proceduralSelections - The manually selected procedural possibilities.
	 * @param uses - The number of uses to instantiate the inventory item with. Defaults to the prefab's uses.
	 * @param notify - Whether or not to notify the player that the item was added to their inventory. Defaults to true.
     * @returns The instantiated {@link InventoryItem| inventory item}.
	 */
	performInstantiateInventoryItem(prefab: Prefab, equipmentSlotId: string, container: InventoryItem,
        inventorySlotId: string, quantity: number, proceduralSelections: Map<string, string>, uses?: number, notify: boolean = true): InventoryItem {
		if (this.performed) return;
		super.perform();
		const createdItem = instantiateInventoryItem(prefab, this.player, equipmentSlotId, container, inventorySlotId, quantity, uses, proceduralSelections);
		const equipmentSlot = this.player.inventory.get(equipmentSlotId);
		const inventorySlot = createdItem.container instanceof ItemInstance ? createdItem.container.inventory.get(inventorySlotId) : undefined;
		if (!container) {
			if (notify) this.getGame().narrationHandler.narrateInstantiateEquippedInventoryItem(this, createdItem, this.player);
			this.getGame().logHandler.logInstantiateEquippedInventoryItem(createdItem, this.player, equipmentSlot);
		}
		else
			this.getGame().logHandler.logInstantiateStashedInventoryItem(createdItem, quantity, this.player, container, inventorySlot);
		return createdItem;
	}
}
