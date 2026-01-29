import Description from './Description.js';
import GameEntity from "./GameEntity.js";

/** @import Game from "./Game.js" */
/** @import ItemInstance from "./ItemInstance.js" */
/** @import Player from "./Player.js" */
/** @import Prefab from "./Prefab.js" */

/**
 * @class ItemContainer
 * @classdesc Represents a game entity that can contain items.
 * @extends GameEntity
 */
export default class ItemContainer extends GameEntity {
	/**
	 * A description which can contain at least one item list.
	 * @type {Description}
	 */
	description;

	/**
	 * @constructor
	 * @param {Game} game - The game this entity belongs to. 
	 * @param {number} row - The row number of this entity on the spreadsheet.
	 * @param {string} description - A description which can contain at least one item list.
	 */
	constructor(game, row, description) {
		super(game, row);
		this.description = new Description(description, this, game);
	}

	/**
	 * Gets this entity's description which can contain an item list.
	 * @return {Description}
	 */
	getDescription() {
		return this.description;
	}

	/**
	 * Sets the entity's description which can contain an item list.
	 * @deprecated
	 * @param {string} description - The new description.
	 */
	#setDescription(description) {
		//this.description = description;
	}

	/**
	 * Adds an item to the specified item list in the container's description.
	 * @deprecated
	 * @param {ItemInstance} item - The item to add.
	 * @param {string} [list] - The item list to add the item to.
	 * @param {number} [quantity] - The quantity of the item to add. If none is provided, defaults to 1.
	 */
	addItemToDescription(item, list, quantity) {
		//this.#setDescription(addItemToList(this.getDescription(), item, list, quantity));
	}

	/**
	 * Removes an item from the specified item list in the container's description.
	 * @deprecated
	 * @param {ItemInstance} item - The item to remove.
	 * @param {string} [list] - The item list to remove the item from.
	 * @param {number} [quantity] - The quantity of the item to remove. If none is provided, defaults to 1.
	 */
	removeItemFromDescription(item, list, quantity) {
		//this.#setDescription(removeItemFromList(this.getDescription(), item, list, quantity));
	}

	/**
     * Gets all of the items this entity contains.
	 * Implementation differs for each type of ItemContainer.
	 * @abstract
	 * @returns {ItemInstance[]}
     */
    getContainedItems() {
        return [];
    }

	/**
	 * Gets all of the items that should appear in the given item list.
	 * Implementation differs for each type of ItemContainer.
	 * @abstract
	 * @protected
	 * @param {string} [itemListName] - The name of the item list. Only required for ItemContainers which can have multiple item lists.
	 * @param {Player} [player] - The player the description is being sent to. Optional.
	 * @returns {ItemInstance[]}
	 */
	getContainedItemsForItemList(itemListName, player) {
		return [];
	}

	/**
	 * Gets all of the items that should appear in the given item list and collates them. Items with the same prefab ID will be considered the same and have their quantities combined.
	 * @param {string} [itemListName] - The name of the item list. Only required for ItemContainers which can have multiple item lists.
	 * @param {Player} [player] - The player the description is being sent to. Optional.
	 * @returns {Map<Prefab, number>} A map of unique prefabs in the item list, and their collated quantities.
	 */
	getCollatedContainedItemsInItemList(itemListName, player) {
		const containedItems = this.getContainedItemsForItemList(itemListName, player).reverse();
		/** @type {Map<Prefab, number>} */
		const containedPrefabCounts = new Map();
		for (const item of containedItems) {
			if (containedPrefabCounts.has(item.prefab)) {
				if (isNaN(item.quantity)) containedPrefabCounts.set(item.prefab, NaN);
				else containedPrefabCounts.set(item.prefab, containedPrefabCounts.get(item.prefab) + item.quantity);
			}
			else containedPrefabCounts.set(item.prefab, item.quantity);
		}
		return containedPrefabCounts;
	}

	/**
	 * Returns true if this entity contains no items.
	 */
	containsNoItems() {
		return this.getContainedItems().length === 0;
	}

	/**
     * Gets the combined weight of all the items this entity contains.
     */
    getContainedItemsWeight() {
        const containedItems = this.getContainedItems();
        return containedItems.reduce((total, item) => total + (!isNaN(item.quantity) ? item.quantity * item.weight : 0), 0);
    }
}