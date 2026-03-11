import Action from "../Action.ts";
import type InventorySlot from "../InventorySlot.ts";
import ItemInstance from "../ItemInstance.ts";
import Prefab from "../Prefab.ts";
import type RoomItem from "../RoomItem.ts";
import { instantiateRoomItem } from "../../Modules/itemManager.js";

/**
 * Represents an instantiate room item action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/instantiate-room-item-action.html
 */
export default class InstantiateRoomItemAction extends Action {
    /**
     * Performs an instantiate action for a room item.
     *
     * @param prefab - The prefab to instantiate as an item.
     * @param container - The container to instantiate the item in.
     * @param inventorySlotId - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
     * @param quantity - The quantity to instantiate.
     * @param proceduralSelections - The manually selected procedural possibilities.
     * @param uses - The number of uses to instantiate the room item with. Defaults to the prefab's uses.
     * @returns The instantiated {@link RoomItem| room item}.
     */
    performInstantiateRoomItem(prefab: Prefab, container: RoomItemContainer, inventorySlotId: string, quantity: number, proceduralSelections: Map<string, string>, uses: number = prefab.uses): RoomItem {
        if (this.performed) return;
        super.perform();
        const createdItem = instantiateRoomItem(prefab, this.location, container, inventorySlotId, quantity, uses, proceduralSelections, this.player);
        const inventorySlot = createdItem.container instanceof ItemInstance ? createdItem.container.inventory.get(inventorySlotId) : undefined;
        this.getGame().logHandler.logInstantiateRoomItem(createdItem, quantity, container, inventorySlot);
        return createdItem;
    }
}
