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
	 * Decreases the collated room items' uses.
	 * @param {number} ingredientUseCount - The number of times to use the item.
	 */
	decreaseUses(ingredientUseCount) {
		// Sort collated items by lowest number of uses to highest.
		this.items.sort((a, b) => a.uses - b.uses);
		let stepSize = 1;
		for (let i = 0; i < ingredientUseCount; i += stepSize) {
			for (const item of this.items) {
				if (item.uses <= 0) continue;
				const remainingDecrementValue = ingredientUseCount - i;
				const stepSizeRemainder = remainingDecrementValue % (item.uses - stepSize);
				if (item.quantity > 1 && i + item.quantity < ingredientUseCount && stepSizeRemainder === 0)
					stepSize = item.quantity;
				if (item.quantity > 1 && stepSizeRemainder !== 0) {
					// TODO: figure out how to handle this.
				}
				item.uses -= stepSize;
				if (item.uses === 0) {
					const nextStage = item.prefab.nextStage;
					this.destroy(item);
					if (nextStage) this.instantiate(nextStage, stepSize);
				}
				break;
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
		instantiateAction.performInstantiateRoomItem(prefab, this.container, this.slot, quantity, new Map());
	}
}