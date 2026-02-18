import Action from "../Action.js";

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
	performInventory() {
		if (this.performed) return;
		super.perform();
		const inventoryString = this.player.viewInventory(this.forced);
		if (this.forced)
			this.getGame().communicationHandler.sendToCommandChannel(inventoryString);
		else
			this.getGame().communicationHandler.sendMessageToPlayer(this.player, inventoryString);
	}
}