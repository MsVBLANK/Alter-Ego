import type Interactable from "../../Classes/Interactables/Interactable.ts";
import Action from "../Action.ts";

/**
 * Represents an inventory action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/inventory-action.html
 */
export default class InventoryAction extends Action {
	/**
	 * Performs an inventory action.
	 */
	async performInventory(): Promise<void> {
		if (this.performed) return;
		super.perform();
		const inventoryString = this.player.viewInventory(this.forced);
		const interactables = await this.#getInteractables();

		if (this.forced)
			this.getGame().communicationHandler.sendToCommandChannel(inventoryString, interactables);
		else
			this.getGame().communicationHandler.sendMessageToPlayer(this.player, inventoryString, true, undefined, undefined, interactables);
	}

    async #getInteractables(): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const interactableManager = this.getGame().botContext.interactableManager;
        if (this.forced) {
            interactables = interactables.concat(await interactableManager.getInstantiateInventoryItemInteractables(this.player, this.user));
            interactables = interactables.concat(await interactableManager.getDestroyInventoryItemInteractables(this.player, this.user));
        }
        interactables = interactables.concat(await interactableManager.getStashInteractables(this.player, this.user));
        interactables = interactables.concat(await interactableManager.getUnstashInteractables(this.player, this.user));
        interactables = interactables.concat(await interactableManager.getCraftInteractables(this.player, this.user));
        interactables = interactables.concat(await interactableManager.getUseInteractables(this.player, this.user));
        interactables = interactables.concat(await interactableManager.getEquipInteractables(this.player, this.user));
        interactables = interactables.concat(await interactableManager.getUnequipInteractables(this.player, this.user));
        return interactables;
    }
}
