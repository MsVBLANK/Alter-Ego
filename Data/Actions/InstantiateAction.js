import Action from "../Action.js";
import { instantiateRoomItem, instantiateInventoryItem } from "../../Modules/itemManager.js";
import ItemInstance from "../ItemInstance.js";

/** @import Fixture from "../Fixture.js" */
/** @import InventoryItem from "../InventoryItem.js" */
/** @import Prefab from "../Prefab.js" */
/** @import Puzzle from "../Puzzle.js" */
/** @import RoomItem from "../RoomItem.js" */

/**
 * @class InstantiateAction
 * @classdesc Represents an instantiate action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/instantiate-action.html
 */
export default class InstantiateAction extends Action {
	/**
	 * Performs an instantiate action for a room item.
	 * @param {Prefab} prefab - The prefab to instantiate as an item.
	 * @param {Fixture|Puzzle|RoomItem} container - The container to instantiate the item in.
	 * @param {string} inventorySlotId - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
	 * @param {number} quantity - The quantity to instantiate.
	 * @param {Map<string, string>} proceduralSelections - The manually selected procedural possibilities.
	 * @param {number} [uses] - The number of uses to instantiate the room item with. Defaults to the prefab's uses.
	 */
	performInstantiateRoomItem(prefab, container, inventorySlotId, quantity, proceduralSelections, uses = prefab.uses) {
		if (this.performed) return;
		super.perform();
		const createdItem = instantiateRoomItem(prefab, this.location, container, inventorySlotId, quantity, uses, proceduralSelections, this.player);
		const inventorySlot = createdItem.container instanceof ItemInstance ? createdItem.container.inventory.get(inventorySlotId) : undefined;
		this.getGame().logHandler.logInstantiateRoomItem(createdItem, quantity, container, inventorySlot);
		return createdItem;
	}

	/**
	 * Performs an instantiate action for an inventory item.
	 * @param {Prefab} prefab - The prefab to instantiate as an inventory item.
	 * @param {string} equipmentSlotId - The ID of the equipment slot this inventory item will belong to.
	 * @param {InventoryItem} container - The container to instantiate the item in.
	 * @param {string} inventorySlotId - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
	 * @param {number} quantity - The quantity to instantiate.
	 * @param {Map<string, string>} proceduralSelections - The manually selected procedural possibilities.
	 * @param {boolean} [notify] - Whether or not to notify the player that the item was added to their inventory. Defaults to true. 
	 */
	performInstantiateInventoryItem(prefab, equipmentSlotId, container, inventorySlotId, quantity, proceduralSelections, notify = true) {
		if (this.performed) return;
		super.perform();
		const createdItem = instantiateInventoryItem(prefab, this.player, equipmentSlotId, container, inventorySlotId, quantity, proceduralSelections);
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