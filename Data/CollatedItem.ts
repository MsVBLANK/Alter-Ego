import RoomItem from './RoomItem.js';
import DestroyAction from './Actions/DestroyAction.ts';
import InstantiateAction from './Actions/InstantiateAction.ts';
import { getSortedItems } from '../Modules/helpers.ts';
import { getChildItems } from '../Modules/itemManager.js';
import ItemInstance from './ItemInstance.ts';

import Fixture from './Fixture.js';
import type Prefab from './Prefab.js';
import Puzzle from './Puzzle.js';
import type RecipeItem from './RecipeItem.js';
import type Room from './Room.js';
import InventoryItem from './InventoryItem.js';
import type Player from './Player.js';
type ContainerOf<T extends RoomItem | InventoryItem> = T extends RoomItem ? RoomItemContainer : InventoryItem;

/**
 * Represents a list of room items that are instances of the same prefab in the same location and container.
 *
 * @typeParam T - The type of the items collated together. Must be either a {@link RoomItem} or {@link InventoryItem}.
 */
export default class CollatedItem<T extends RoomItem | InventoryItem> {
	/**
	 * The items collated together.
	 */
	items: T[];
	/**
	 * The prefab these items all have.
	 */
	prefab: Prefab;
	/**
	 * The location these items all have.
	 */
	location: Room;
    /**
     * The player these items all have, if they are inventory items. Will be null if these are room items.
     */
    player: Player;
    /**
     * The equipment slot these items all have, if they are inventory items in an equipment slot.
     */
    equipmentSlotId: string;
	/**
	 * The container these items all have.
	 */
	container: ContainerOf<RoomItem | InventoryItem>;
	/**
	 * The ID of the inventory slot these items can be found in.
	 */
	slot: string;
	/**
	 * The total quantity of the items collated together.
	 */
	quantity: number;
	/**
	 * The total uses of the items collated together.
	 */
	uses: number;
	/**
	 * The recipe variable this is associated with.
	 */
	variable: string;

	/**
	 * @param items - The items to collate.
	 */
	constructor(items: T[]) {
		this.items = items;
		this.prefab = items[0].prefab;
		this.location = items[0].getLocation();
        this.player = items[0] instanceof InventoryItem ? items[0].player : null;
        this.equipmentSlotId = items[0] instanceof InventoryItem ? items[0].equipmentSlot : null;
		this.container = items[0].container;
		this.slot = items[0].slot;
		this.quantity = this.items.reduce((quantity, item) => quantity + (isNaN(item.quantity) ? NaN : item.quantity), 0);
		this.uses = this.items.reduce((uses, item) => uses + (isNaN(item.uses) ? NaN : item.quantity * item.uses), 0);
	}

	/**
	 * Returns an array of collated room items.
     *
	 * @param items - The room items to collate.
	 */
	static collate<T extends RoomItem | InventoryItem>(items: T[]): CollatedItem<T>[] {
		const childItems: T[] = [];
		for (const item of items)
			getChildItems(childItems, item);
		for (const childItem of childItems) {
			if (!items.includes(childItem))
				items.push(childItem);
		}
		items = getSortedItems(items);
		const collatedItems: CollatedItem<T>[] = [];
		const itemsMap: Map<string, T[]> = new Map();
		for (const item of items) {
			if (itemsMap.has(item.prefab.id)) itemsMap.get(item.prefab.id).push(item);
			else itemsMap.set(item.prefab.id, [item]);
		}
		for (const itemGroup of itemsMap.values())
			collatedItems.push(new CollatedItem(itemGroup));
		return collatedItems;
	}

	/**
	 * Sets the collated room item's variable for recipe processing.
     *
	 * @param variable - The variable to set.
	 */
	setVariable(variable: string): void {
		this.variable = variable;
	}

	/**
	 * Recalculates uses and quantity stats.
	 */
	#recalculate(): void {
		this.quantity = this.items.reduce((quantity, item) => quantity + (isNaN(item.quantity) ? NaN : item.quantity), 0);
		this.uses = this.items.reduce((uses, item) => uses + (isNaN(item.uses) ? NaN : item.quantity * item.uses), 0);
	}

	/**
	 * Returns true if the collated items' container matches the given recipe item's container.
	 */
	containerMatches(recipeItem: RecipeItem): boolean {
		return recipeItem.container === null || this.container instanceof ItemInstance && this.container.prefab.id === recipeItem.container.prefab.id;
	}

	/**
	 * Returns true if all of the collated items have infinite uses.
	 */
	allItemsHaveInfiniteUses(): boolean {
		return this.items.filter(item => !isNaN(item.uses)).length === 0;
	}

	/**
	 * Decreases the collated room items' uses.
     *
	 * @param ingredientUseCount - The number of times to use the item.
	 */
	decreaseUses(ingredientUseCount: number): void {
		// If all items have infinite uses, don't do anything.
		if (this.allItemsHaveInfiniteUses()) return;
		// Sort collated items by lowest number of uses to highest, sorting within use by lowest quantity to highest.
		this.items.sort((a, b) => a.uses !== b.uses ? a.uses - b.uses : a.quantity - b.quantity);
		while (ingredientUseCount > 0) {
			// Early exit if total uses or total quantity is equal to zero.
			if (this.uses === 0 || this.quantity === 0) return;
			for (const item of this.items) {
				// Return if ingredientUseCount is 0.
				if (ingredientUseCount === 0) return;
				// Continue to next item if uses is 0 or NaN or if quantity is 0.
				if (item.uses === 0 || item.quantity === 0 || isNaN(item.uses)) continue;
				// Define step as the lowest of either item.uses or ⌊ingredientUseCount/item.quantity⌋.
				const step = Math.min(Math.floor(ingredientUseCount / item.quantity), item.uses);
				// If step === 0, then we're on an item whose quantity prevents clean division of ingredientUseCount.
				if (step === 0) {
					// First, check if there's an item that *doesn't* have this issue; if there is, continue.
					if (this.items.find((findItem) => Math.min(Math.floor(ingredientUseCount / findItem.quantity), findItem.uses) > 0) !== undefined) continue;
					// Next, check if we could simply consume one item off this stack to handle the remainder.
					if (ingredientUseCount === item.uses) {
						// Decrement quantity by 1 and decrement ingredientUseCount by item.uses.
						item.quantity -= 1;
						ingredientUseCount -= item.uses;
						// Store nextStage.
						const nextStage = item.prefab.nextStage;
						if (nextStage)
							// If we have a nextStage, we should instantiate it accordingly.
							this.instantiate(nextStage, 1);
						// Re-sort.
						this.items.sort((a, b) => a.uses !== b.uses ? a.uses - b.uses : a.quantity - b.quantity);
						// Re-calculate stats.
						this.#recalculate();
						// Break, to refresh this for loop.
						break;
					}
					// Otherwise, split one item off of this stack.
					item.quantity -= 1;
					// To prevent it from being collated by the itemManager, it's necessary to instantiate it with a unique number of uses.
					const split = this.instantiate(item.prefab, 1, NaN);
					// Manually set the newly split item's uses to be equal to the current stack's uses.
					split.uses = item.uses;
					this.items.push(split);
					// Sort the collated items again so that the newly-split item is positioned properly.
					this.items.sort((a, b) => a.uses !== b.uses ? a.uses - b.uses : a.quantity - b.quantity);
					// Re-calculate stats.
					this.#recalculate();
					// Break so that we immediately re-enter the loop.
					break;
				}
				// We go here if step is greater than zero.
				// First, decrement the item's uses, the collated uses, and the ingredientUseCount by the current step.
				item.uses -= step;
				ingredientUseCount -= step * item.quantity;
				// Check if the item uses is equal to zero.
				if (item.uses === 0) {
					// Grab references now so we don't lose them when the item is destroyed.
					const nextStage = item.prefab.nextStage;
					const quantity = item.quantity;
					// Destroy the item.
					this.#destroyItem(item);
					if (nextStage)
						// If we have a nextStage, we should instantiate it accordingly.
						this.instantiate(nextStage, quantity);
					// Re-sort.
					this.items.sort((a, b) => a.uses !== b.uses ? a.uses - b.uses : a.quantity - b.quantity);
					// Re-calculate stats.
					this.#recalculate();
					// Break, on the off-chance this is the last loop we need.
					break;
				}
				// Re-calculate stats.
				this.#recalculate();
			}
		}
	}

	/**
	 * Destroys the given quantity of this item.
     *
	 * @param ingredientDestroyCount - The quantity to destroy. Defaults to the item's total quantity.
	 */
	destroy(ingredientDestroyCount: number = this.quantity): void {
		// If the given quantity is finite but all items have an infinite quantity, don't do anything.
		if (!isNaN(ingredientDestroyCount) && this.items.filter(item => !isNaN(item.quantity)).length === 0) return;
		// Sort collated items by lowest quantity to highest.
		this.items.sort((a, b) => a.quantity - b.quantity);
		while (ingredientDestroyCount > 0) {
			// Early exit if total quantity is equal to zero.
			if (this.quantity === 0) return;
			for (const item of this.items) {
				// Return if ingredientDestroyCount is 0.
				if (ingredientDestroyCount === 0) return;
				// Continue to the next item if quantity is 0 or NaN.
				if (item.quantity === 0 || isNaN(item.quantity)) continue;
				// If ingredientDestroyCount is Infinity, destroy the whole item.
				if (ingredientDestroyCount === Infinity)
					this.#destroyItem(item);
				// If ingredientDestroyCount is greater than the current item's quantity, we have to destroy this one and move on to the next.
				else if (ingredientDestroyCount > item.quantity) {
					ingredientDestroyCount -= item.quantity;
					this.#destroyItem(item);
				}
				// If ingredientDestroyCount is less than or equal to the current item's quantity, we just need to destroy ingredientDestroyCount instances of this item.
				else if (ingredientDestroyCount <= item.quantity){
					this.#destroyItem(item, ingredientDestroyCount);
					ingredientDestroyCount -= ingredientDestroyCount;
				}
				// Re-sort.
				this.items.sort((a, b) => a.quantity - b.quantity);
				// Re-calculate stats.
				this.#recalculate();
				// Break, to refresh this for loop.
				break;
			}
			// Re-calculate stats before repeating the while loop.
			this.#recalculate();
		}
	}

	/**
	 * Destroys the given item.
     *
	 * @param item - The item to destroy.
	 * @param quantity - The quantity to destroy. Defaults to the item's total quantity.
	 */
	#destroyItem(item: T, quantity: number = item.quantity): void {
		const destroyAction = new DestroyAction(item.getGame(), undefined, this.player, item.getLocation(), true);
        if (item instanceof RoomItem) destroyAction.performDestroyRoomItem(item, quantity, true);
        else if (item instanceof InventoryItem) destroyAction.performDestroyInventoryItem(item, quantity, true, false);
	}

	/**
	 * Instantiates the given prefab in the collated room item's container.
     *
	 * @param prefab - The prefab to instantiate.
	 * @param quantity - The quantity to instantiate it with.
	 * @param uses - The number of uses to instantiate it with. Defaults to the prefab's uses.
	 */
	instantiate(prefab: Prefab, quantity: number, uses: number = prefab.uses): T {
		const instantiateAction = new InstantiateAction(prefab.getGame(), undefined, this.player, this.location, true);
        if (this.container instanceof Fixture || this.container instanceof Puzzle || this.container instanceof RoomItem)
            return instantiateAction.performInstantiateRoomItem(prefab, this.container, this.slot, quantity, new Map(), uses) as T;
        else if (this.container instanceof InventoryItem || this.container === null)
            return instantiateAction.performInstantiateInventoryItem(prefab, this.equipmentSlotId, this.container, this.slot, quantity, new Map(), uses, false) as T;
	}
}
