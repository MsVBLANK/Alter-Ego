import { destroyRoomItem } from "../../Modules/itemManager.js";
import Action from "../Action.ts";
import ItemInstance from "../ItemInstance.ts";
import type RoomItem from "../RoomItem.ts";

/**
 * Represents a destroy room item action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/destroy-room-item-action.html
 */
export default class DestroyRoomItemAction extends Action {
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
}
