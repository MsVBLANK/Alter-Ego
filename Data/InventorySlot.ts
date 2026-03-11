import type InventoryItem from "./InventoryItem.ts";
import type ItemInstance from "./ItemInstance.ts";
import type Prefab from "./Prefab.ts";
import type RoomItem from "./RoomItem.ts";

/**
 * Represents a slot within an item that can contain other items.
 *
 * @typeParam T - The type of item contained in the slot. Must be either an {@link ItemInstance}, {@link RoomItem} or {@link InventoryItem}.
 */
export default class InventorySlot<T extends ItemInstance | RoomItem | InventoryItem> {
	/**
	 * The ID of the slot. Must be unique relative to other slots held by the same item.
	 */
    readonly id: string;
	/**
	 * The name of the slot. Deprecated. Use `id` instead.
	 * @deprecated
	 */
    readonly name: string;
	/**
	 * Maximum sum of sizes that can be stored in the slot.
	 */
	capacity: number;
	/**
	 * The current sum of sizes stored in the slot.
	 */
	takenSpace: number;
	/**
	 * The combined weight of all items stored in the slot.
	 */
	weight: number;
	/**
	 * The items stored in the slot.
	 */
	items: Array<T>;
	/**
	 * The items stored in the slot. Deprecated. Use `items` instead.
	 * @deprecated
	 */
    readonly item: Array<T>;

	/**
	 * @param id - The ID of the slot. Must be unique relative to other slots held by the same item.
	 * @param capacity - Maximum sum of sizes that can be stored in the slot.
	 * @param takenSpace - The current sum of sizes stored in the slot.
	 * @param weight - The combined weight of all items stored in the slot.
	 * @param items - The items stored in the slot.
	 */
	constructor(id: string, capacity: number, takenSpace: number, weight: number, items: Array<T>) {
		this.id = id;
		this.name = id;
		this.capacity = capacity;
		this.takenSpace = takenSpace;
		this.weight = weight;
		this.items = items;
		this.item = [];
	}

	/**
	 * Inserts an item into this slot.
     *
	 * @param item - The item to insert.
	 */
	insertItem(item: T): void {
		let matchedItem = this.items.find(inventoryItem =>
			inventoryItem.prefab !== null && item.prefab !== null &&
			inventoryItem.prefab.id === item.prefab.id &&
			inventoryItem.identifier === item.identifier &&
			inventoryItem.containerName === item.containerName &&
			inventoryItem.slot === item.slot &&
			(inventoryItem.uses === item.uses || isNaN(inventoryItem.uses) && isNaN(item.uses)) &&
			inventoryItem.description.text === item.description.text
		);
		if (!matchedItem || isNaN(matchedItem.quantity)) this.items.push(item);
		if (!isNaN(item.quantity)) {
			this.weight += item.weight * item.quantity;
			this.takenSpace += item.prefab.size * item.quantity;
		}
	}

	/**
	 * Removes an item from this slot.
     *
	 * @param item - The item to remove.
	 * @param removedQuantity - The quantity of this item to remove.
	 */
	removeItem(item: T, removedQuantity: number): void {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].row === item.row && this.items[i].description.text === item.description.text) {
				if (item.quantity === 0) this.items.splice(i, 1);
				this.weight -= item.weight * removedQuantity;
				this.takenSpace -= item.prefab.size * removedQuantity;
				break;
			}
		}
	}

	/**
     * Gets all of the items this inventory slot contains.
     */
    getContainedItems(): T[] {
        return this.items;
    }

	/**
	 * Returns true if this inventory slot contains no items.
	 */
	containsNoItems(): boolean {
		return this.getContainedItems().length === 0;
	}

	/**
	 * Returns true if the inventory slot's capacity is smaller than the given item.
     * @param item - The item to check for.
     * @param quantity - The quantity to multiply the item's size by. Defaults to 1.
	 */
	capacityIsSmallerThan(item: ItemInstance|Prefab, quantity = 1): boolean {
		return (item.size * quantity) > this.capacity;
	}

	/**
	 * Returns true if the inventory slot will be over capacity if it takes the given item.
     * @param item - The item to check for.
     * @param quantity - The quantity to multiply the item's size by. Defaults to 1.
	 */
	willBeOverFilledBy(item: ItemInstance|Prefab, quantity = 1): boolean {
		return this.takenSpace + (item.size * quantity) > this.capacity;
	}

	/**
     * Gets the combined weight of all the items this inventory slot contains.
     */
    getContainedItemsWeight(): number {
        return this.weight;
    }
}
