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
        interactables = interactables.concat(await this.getGame().botContext.interactableManager.getStashInteractables(this.player));
        interactables = interactables.concat(await this.getGame().botContext.interactableManager.getUnstashInteractables(this.player));

		if (this.forced)
			this.getGame().communicationHandler.sendToCommandChannel(inventoryString);
		else
			this.getGame().communicationHandler.sendMessageToPlayer(this.player, inventoryString, true, undefined, undefined, interactables);
	}
}
