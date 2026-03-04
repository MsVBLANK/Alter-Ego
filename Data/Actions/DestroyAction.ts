import { destroyInventoryItem, destroyRoomItem } from "../../Modules/itemManager.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.ts";
import ItemInstance from "../ItemInstance.ts";
import type RoomItem from "../RoomItem.ts";

/** @import InventoryItem from "../InventoryItem.ts" */
/** @import RoomItem from "../RoomItem.ts" */

/**
 * Represents a destroy action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/destroy-action.html
 */
export default class DestroyAction extends Action {
    /**
     * Performs a destroy action for a room item.
     *
     * @param item - The item to destroy.
     * @param quantity - How many of this item to destroy.
     * @param destroyChildren - Whether or not to recursively destroy all of the items it contains as well.
     */
    performDestroyRoomItem(item: RoomItem, quantity: number, destroyChildren: boolean): void {
        if (this.performed) return;
        super.perform();
        const inventorySlot = item.container instanceof ItemInstance ? item.container.inventory.get(item.slot) : undefined;
        this.getGame().logHandler.logDestroyRoomItem(item, quantity, item.container, inventorySlot);
        destroyRoomItem(item, quantity, destroyChildren);
    }

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
}
