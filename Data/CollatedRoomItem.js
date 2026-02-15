/**
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
	 * @constructor
	 * @param {RoomItem[]} items - The items to collate.
	 */
	constructor(items) {
		this.items = items;
		this.quantity = this.items.reduce((quantity, item) => quantity + (isNaN(item.quantity) ? NaN : item.quantity), 0);
		this.uses = this.items.reduce((uses, item) => uses + (isNaN(item.uses) ? NaN : item.uses), 0);
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
			if (!itemsMap.has(item.prefab.id)) itemsMap.get(item.prefab.id).push(item);
			else itemsMap.set(item.prefab.id, [item]);
		}
		for (const itemGroup of itemsMap.values())
			collatedItems.push(new CollatedRoomItem(itemGroup));
		return collatedItems;
	}
}