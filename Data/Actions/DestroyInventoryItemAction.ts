import { destroyInventoryItem } from "../../Modules/itemManager.js";
import Action from "../Action.ts";
import InventoryItem from "../InventoryItem.ts";
import ItemInstance from "../ItemInstance.ts";

/**
 * Represents a destroy inventory item action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/destroy-inventory-item-action.html
 */
export default class DestroyInventoryItemAction extends Action {
	/**
	 * Performs a destroy action for an inventory item.
     *
	 * @param item - The item to destroy.
	 * @param quantity - How many of this item to destroy.
	 * @param destroyChildren - Whether or not to recursively destroy all of the items it contains as well.
	 * @param notify - Whether or not to notify the player that the item was removed from their inventory. Defaults to true.
	 */
	performDestroyInventoryItem(item: InventoryItem, quantity: number, destroyChildren: boolean, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		const equipmentSlot = this.player.inventory.get(item.equipmentSlot);
		const inventorySlot = item.container instanceof ItemInstance ? item.container.inventory.get(item.slot) : undefined;
		if (!item.container) {
			if (notify) this.getGame().narrationHandler.narrateDestroyEquippedInventoryItem(this, item, this.player);
			this.getGame().logHandler.logDestroyEquippedInventoryItem(item, this.player, equipmentSlot);
		}
		else
			this.getGame().logHandler.logDestroyStashedInventoryItem(item, quantity, this.player, item.container, inventorySlot);
		destroyInventoryItem(item, quantity, destroyChildren);
	}

    /**
     * Finds the required entities to call performDestroyInventoryItem.
     * 
     * @param args - The args as strings.
     */
    parseInteractionArgs(args: string[]): [InventoryItem] {
        const item = this.getGame().entityFinder.getInventoryItem(args[1], this.player.name, args[2], args[3]);
        return [item];
    }

    /**
     * Validates the parsed args. The results can be passed directly into performDestroyInventoryItem.
     * 
     * @param args - The args after being parsed.
     */
    validateInteractionArgs(args: [InventoryItem]): [InventoryItem, number, boolean] {
        if (args.length !== 1) throw new Error("Insufficient arguments.");
        if (!args[0] || !(args[0] instanceof InventoryItem) || args[0].prefab === null) throw new Error("Invalid inventory item.");
        const item = args[0];
        if (item.quantity === 0) throw new Error("The inventory item already has a quantity of 0.");
        if (item.player.name !== this.player.name) throw new Error(`${item.getIdentifier()} belongs to a different player.`);
        return [item, item.quantity, true];
    }
}
