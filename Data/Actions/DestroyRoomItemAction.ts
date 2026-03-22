import { destroyRoomItem } from "../../Modules/itemManager.js";
import Action from "../Action.ts";
import RoomItem from "../RoomItem.ts";

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
        const inventorySlot = item.container instanceof RoomItem ? item.container.inventory.get(item.slot) : undefined;
        this.getGame().logHandler.logDestroyRoomItem(item, quantity, item.container, inventorySlot);
        const slotPhrase = item.slot ? `${item.slot} of ` : ``;
        this.successMessage = `Successfully destroyed ${item.getIdentifier()} ${item.container.getPreposition()} ${slotPhrase}${item.container.getContainerIdentifier()} at ${item.location.id}.`;
        destroyRoomItem(item, quantity, destroyChildren);
    }

    /**
     * Finds the required entities to call performDestroyRoomItem.
     * 
     * @param args - The args as strings.
     */
    parseInteractionArgs(args: string[]): RoomItem[] {
        const items = this.getGame().entityFinder.getRoomItems(args[1], args[2], args[3] ? args[3].toLowerCase() === "true" : undefined, args[4], args[5], args[6]);
        return items;
    }

    /**
     * Validates the parsed args. The results can be passed directly into performDestroyRoomItem.
     * 
     * @param args - The args after being parsed.
     */
    validateInteractionArgs(args: [RoomItem]): [RoomItem, number, boolean] {
        if (args.length !== 1) throw new Error("Insufficient arguments.");
        if (!args[0] || !(args[0] instanceof RoomItem) || args[0].prefab === null) throw new Error("Invalid room item.");
        const item = args[0];
        if (item.quantity === 0) throw new Error("Invalid room item.");
        if (!item.container.isItemContainer()) throw new Error(`${item.container.getContainerIdentifier()} cannot contain items.`);
        if (!item.container.canCurrentlyContainItems(false, this.forced)) throw new Error(`Items ${item.container.getPreposition()} ${item.container.getContainerIdentifier()} cannot be destroyed right now.`);
        return [item, item.quantity, true];
    }
}
