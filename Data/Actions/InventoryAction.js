import Action from "../Action.ts";
/**
 * @import Interactable from "../../Classes/Interactables/Interactable.ts";
 * @import InventoryItem from "../InventoryItem.js";
 */

/**
 * @class InventoryAction
 * @classdesc Represents an inventory action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/inventory-action.html
 */
export default class InventoryAction extends Action {
	/**
	 * Performs an inventory action.
	 */
	async performInventory() {
		if (this.performed) return;
		super.perform();
		const inventoryString = this.player.viewInventory(this.forced);

		/** @type {Interactable[]} */
		let interactables = [];
		const playerItems = this.getGame().entityFinder.getInventoryItems(undefined, this.player.name);
		const heldItems = this.getGame().entityFinder.getPlayerHands(this.player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
		const playerFreeHand = this.getGame().entityFinder.getPlayerFreeHand(this.player);
		const playerContainerItems = playerItems.filter(item => item.inventory.size > 0);
		if (heldItems.length > 0 && playerContainerItems.length > 0) {
			/** @type {Map<InventoryItem, string[]>} */
			const viableStashDestinations = new Map();
			// Get stash interactables.
			for (const heldItem of heldItems) {
				for (const containerItem of playerContainerItems) {
					/** @type {string[]} */
					const viableInventorySlots = [];
					for (const inventorySlot of containerItem.inventory.values()) {
						if (inventorySlot.willBeOverFilledBy(heldItem)) continue;
						viableInventorySlots.push(inventorySlot.id);
					}
					if (viableInventorySlots.length > 0) viableStashDestinations.set(containerItem, viableInventorySlots);
				}
			}
			interactables = interactables.concat(await this.getGame().botContext.interactableManager.createStashActionInteractables(heldItems, this.player, viableStashDestinations));
		}
		if (playerFreeHand && playerContainerItems.length > 0) {
			const stashedItems = playerItems.filter(item => item.container !== null);
			if (stashedItems.length > 0) {
				interactables = interactables.concat(await this.getGame().botContext.interactableManager.createUnstashActionInteractables(stashedItems, this.player));
			}
		}

		if (this.forced)
			this.getGame().communicationHandler.sendToCommandChannel(inventoryString);
		else
			this.getGame().communicationHandler.sendMessageToPlayer(this.player, inventoryString, true, undefined, undefined, interactables);
	}
}