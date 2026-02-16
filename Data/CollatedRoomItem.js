import DestroyAction from './Actions/DestroyAction.js';
import InstantiateAction from './Actions/InstantiateAction.js';
/**
 * @import Fixture from './Fixture.js';
 * @import Prefab from './Prefab.js';
 * @import Puzzle from './Puzzle.js';
 * @import Room from './Room.js';
 * @import RoomItem from './RoomItem.js';
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
	 * Decreases the collated room items' uses.
	 * @param {number} ingredientUseCount - The number of times to use the item.
	 */
	decreaseUses(ingredientUseCount) {
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
					const split = this.instantiate(item.prefab, 1);
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
					this.destroy(item);
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
	 * Iterates through the list of items and decrements the uses of the first one with a non-zero number of uses by the given amount.
	 * If the decremented item's new number of uses is 0, it is destroyed, and its prefab's nextStage is instantiated in its place, if applicable.
	 * @param {number} [amount] - The given amount to decrement the item's uses by. Defaults to 1.
	 */
	#decrementUses(amount = 1) {
		for (const item of this.items) {
			if (item.uses <= 0) continue;
			item.uses -= amount;
			if (item.uses === 0) {
				const nextStage = item.prefab.nextStage;
				this.destroy(item);
				if (nextStage) this.instantiate(nextStage, 1);
			}
			break;
		}
	}

	/**
	 * Destroys the given item.
	 * @param {RoomItem} item
	 */
	destroy(item) {
		const destroyAction = new DestroyAction(item.getGame(), undefined, undefined, item.location, true);
		destroyAction.performDestroyRoomItem(item, item.quantity, true);
	}

	/**
	 * Instantiates the given prefab in the collated room item's container.
	 * @param {Prefab} prefab - The prefab to instantiate.
	 * @param {number} quantity - The quantity to instantiate it with.
	 */
	instantiate(prefab, quantity) {
		const instantiateAction = new InstantiateAction(prefab.getGame(), undefined, undefined, this.location, true);
		return instantiateAction.performInstantiateRoomItem(prefab, this.container, this.slot, quantity, new Map());
	}
}
