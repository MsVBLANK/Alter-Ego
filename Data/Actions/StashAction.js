import Action from "../Action.ts";
import InventoryItem from "../InventoryItem.js";
import InventorySlot from "../InventorySlot.ts";

/** @import EquipmentSlot from "../EquipmentSlot.js" */

/**
 * @class StashAction
 * @classdesc Represents a stash action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/stash-action.html
 */
export default class StashAction extends Action {
	/**
	 * Performs a stash action.
	 * @param {InventoryItem} item - The inventory item to stash. 
     * @param {EquipmentSlot} handEquipmentSlot - The hand equipment slot that the inventory item is currently in.
     * @param {InventoryItem} container - The container to stash the inventory item in.
     * @param {InventorySlot<InventoryItem>} inventorySlot - The {@link InventorySlot|inventory slot} to stash the inventory item in.
	 */
	performStash(item, handEquipmentSlot, container, inventorySlot) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateStash(this, item, container, inventorySlot, this.player);
		this.getGame().logHandler.logStash(item, this.player, container, inventorySlot, this.forced);
		this.player.stash(item, handEquipmentSlot, container, inventorySlot);
	}

	/**
	 * Finds the required inventory item to call performStash.
	 * @param {string[]} args - The args as strings.
	 * @returns {[InventoryItem, EquipmentSlot, InventoryItem, InventorySlot<InventoryItem>]}
	 */
	parseInteractionArgs(args) {
		const hand = this.getGame().entityFinder.getPlayerHandHoldingItem(this.player, args[0]);
		const container = this.getGame().entityFinder.getInventoryItem(args[2], this.player.name, args[4], args[5]);
		/** @type {InventorySlot<InventoryItem>} */
		let inventorySlot;
		if (container instanceof InventoryItem) inventorySlot = container.inventory.get(args[3]);
		return [hand?.equippedItem, hand, container, inventorySlot];
	}

	/**
	 * Validates the parsed args. The results can be passed directly into performStash.
	 * @param {[InventoryItem, EquipmentSlot, InventoryItem, InventorySlot<InventoryItem>]} args - The args after being parsed.
	 * @returns {[InventoryItem, EquipmentSlot, InventoryItem, InventorySlot<InventoryItem>]|[]}
	 */
	validateInteractionArgs(args) {
		if (args.length !== 4) return [];
		if (!args[0] || !(args[0] instanceof InventoryItem) || args[0].prefab === null) return [];
		const item = args[0];
		if (this.player.hasBehaviorAttribute("disable stash")) return [];
		if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable stash")) return [];
		if (!args[1] || args[1].equippedItem === null) return [];
		const hand = args[1];
		if (!args[2] || !(args[2] instanceof InventoryItem) || args[2].prefab === null || args[2].quantity === 0 || args[2].inventory.size === 0) return [];
		if (args[2].player.name !== this.player.name) return [];
		const container = args[2];
		const inventorySlot = args[3];
		if (inventorySlot && inventorySlot.willBeOverFilledBy(item)) return [];
		return [item, hand, container, inventorySlot];
	}
}