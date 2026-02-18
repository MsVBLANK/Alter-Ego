import RoomItem from './RoomItem.js';
import DestroyAction from './Actions/DestroyAction.js';
import InstantiateAction from './Actions/InstantiateAction.js';
import { getSortedItems } from '../Modules/helpers.js';
import { getChildItems } from '../Modules/itemManager.js';
/**
 * @import Fixture from './Fixture.js';
 * @import Prefab from './Prefab.js';
 * @import Puzzle from './Puzzle.js';
 * @import RecipeItem from './RecipeItem.js';
 * @import Room from './Room.js';
 */

/**
 * @class CollatedRoomItem
 * @classdesc Represents a list of room items that are instances of the same prefab in the same location and container.
 */
export default class CollatedRoomItem {
	/**
	 * The items collated together.
	 * @type {RoomItem[]}
	 */
	items;
	/**
	 * The prefab these items all have.
	 * @type {Prefab}
	 */
	prefab;
	/**
	 * The location these items all have.
	 * @type {Room}
	 */
	location;
	/**
	 * The container these items all have.
	 * @type {Fixture|Puzzle|RoomItem}
	 */
	container;
	/**
	 * The ID of the {@link InventorySlot|inventory slot} these items can be found in.
	 * @type {string}
	 */
	slot;
	/**
	 * The total quantity of the items collated together.
	 * @type {number}
	 */
	quantity;
	/**
	 * The total uses of the items collated together.
	 * @type {number}
	 */
	uses;
	/**
	 * The recipe variable this is associated with.
	 * @type {string}
	 */
	variable;

	/**
	 * @constructor
	 * @param {RoomItem[]} items - The items to collate.
	 */
	constructor(items) {
		this.items = items;
		this.prefab = items[0].prefab;
		this.location = items[0].location;
		this.container = items[0].container;
		this.slot = items[0].slot;
		this.quantity = this.items.reduce((quantity, item) => quantity + (isNaN(item.quantity) ? NaN : item.quantity), 0);
		this.uses = this.items.reduce((uses, item) => uses + (isNaN(item.uses) ? NaN : item.quantity * item.uses), 0);
	}

	/**
	 * Returns an array of collated room items.
	 * @param {RoomItem[]} items - The room items to collate.
	 */
	static collate(items) {
		/** @type {RoomItem[]} */
		const childItems = [];
		for (const item of items)
			getChildItems(childItems, item);
		for (const childItem of childItems) {
			if (!items.includes(childItem))
				items.push(childItem);
		}
		items = getSortedItems(items);
		/** @type {CollatedRoomItem[]} */
		const collatedItems = [];
		/** @type {Map<string, RoomItem[]>} */
		const itemsMap = new Map();
		for (const item of items) {
			if (itemsMap.has(item.prefab.id)) itemsMap.get(item.prefab.id).push(item);
			else itemsMap.set(item.prefab.id, [item]);
		}
		for (const itemGroup of itemsMap.values())
			collatedItems.push(new CollatedRoomItem(itemGroup));
		return collatedItems;
	}

	/**
	 * Sets the collated room item's variable for recipe processing.
	 * @param {string} variable - The variable to set.
	 */
	setVariable(variable) {
		this.variable = variable;
	}

	/**
	 * Recalculates uses and quantity stats.
	 */
	#recalculate() {
		this.quantity = this.items.reduce((quantity, item) => quantity + (isNaN(item.quantity) ? NaN : item.quantity), 0);
		this.uses = this.items.reduce((uses, item) => uses + (isNaN(item.uses) ? NaN : item.quantity * item.uses), 0);
	}

	/**
	 * Returns true if the collated items' container matches the given recipe item's container.
	 * @param {RecipeItem} recipeItem 
	 */
	containerMatches(recipeItem) {
		return recipeItem.container === null || this.container instanceof RoomItem && this.container.prefab.id === recipeItem.container.prefab.id;
	}

	/**
	 * Returns true if all of the collated items have infinite uses.
	 */
	allItemsHaveInfiniteUses() {
		return this.items.filter(item => !isNaN(item.uses)).length === 0;
	}

	/**
	 * Decreases the collated room items' uses.
	 * @param {number} ingredientUseCount - The number of times to use the item.
	 */
	decreaseUses(ingredientUseCount) {
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
	 * @param {number} [ingredientDestroyCount] - The quantity to destroy. Defaults to the item's total quantity.
	 */
	destroy(ingredientDestroyCount = this.quantity) {
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
	 * @param {RoomItem} item - The item to destroy.
	 * @param {number} [quantity] - The quantity to destroy. Defaults to the item's total quantity.
	 */
	#destroyItem(item, quantity = item.quantity) {
		const destroyAction = new DestroyAction(item.getGame(), undefined, undefined, item.location, true);
		destroyAction.performDestroyRoomItem(item, quantity, true);
	}

	/**
	 * Instantiates the given prefab in the collated room item's container.
	 * @param {Prefab} prefab - The prefab to instantiate.
	 * @param {number} quantity - The quantity to instantiate it with.
	 * @param {number} uses - The number of uses to instantiate it with.
	 */
	instantiate(prefab, quantity, uses = prefab.uses) {
		const instantiateAction = new InstantiateAction(prefab.getGame(), undefined, undefined, this.location, true);
		return instantiateAction.performInstantiateRoomItem(prefab, this.container, this.slot, quantity, new Map(), uses);
	}
}
