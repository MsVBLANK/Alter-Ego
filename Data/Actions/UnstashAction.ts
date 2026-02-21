import Action from "../Action.ts";
import InventorySlot from "../InventorySlot.ts";
import InventoryItem from "../InventoryItem.js";
import type EquipmentSlot from "../EquipmentSlot.js";

/**
 * Represents an unstash action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unstash-action.html
 */
export default class UnstashAction extends Action {
    /**
     * Performs an unstash action.
     *
     * @param item - The inventory item to unstash.
     * @param handEquipmentSlot - The hand equipment slot to put the inventory item in.
     * @param container - The inventory item's current container.
     * @param inventorySlot - The {@link InventorySlot|inventory slot} the inventory item is currently in.
     */
    performUnstash(item: InventoryItem, handEquipmentSlot: EquipmentSlot, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>): void {
        if (this.performed) return;
        super.perform();
        this.getGame().narrationHandler.narrateUnstash(this, item, container, inventorySlot, this.player);
        this.getGame().logHandler.logUnstash(item, this.player, container, inventorySlot, this.forced);
        this.player.unstash(item, handEquipmentSlot, container, inventorySlot);
    }

    /**
     * Finds the required inventory item to call performUnstash.
     *
     * @param args - The args as strings.
     */
    parseInteractionArgs(args: string[]): [InventoryItem] {
        const item = this.getGame().entityFinder.getInventoryItem(args[0], this.player.name, args[1], args[2]);
        return [item];
    }

    /**
     * Validates the parsed args. The results can be passed directly into performUnstash.
     *
     * @param args - The args after being parsed.
     */
    validateInteractionArgs(args: [InventoryItem]): [InventoryItem, EquipmentSlot, InventoryItem, InventorySlot<InventoryItem>] | [] {
        if (args.length !== 1) return [];
        if (!args[0] || !(args[0] instanceof InventoryItem) || args[0].prefab === null) return [];
        const item = args[0];
        if (this.player.hasBehaviorAttribute("disable unstash")) return [];
        if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable unstash")) return [];
        if (item.quantity === 0) return [];
        const freeHand = this.getGame().entityFinder.getPlayerFreeHand(this.player);
        if (!freeHand) return [];
        const container = item.container;
        if (!container || container === null || container.prefab === null) return [];
        const inventorySlot = container.inventory.get(item.slot);
        if (!inventorySlot || !inventorySlot.items.includes(item)) return [];
        if (item.player.name !== this.player.name) return [];
        return [item, freeHand, container, inventorySlot];
    }
}
