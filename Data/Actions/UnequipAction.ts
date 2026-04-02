import Action from "../Action.ts";
import EquipmentSlot from "../EquipmentSlot.ts";
import InventoryItem from "../InventoryItem.ts";

/**
 * Represents an unequip action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unequip-action.html
 */
export default class UnequipAction extends Action {
	/**
     * Performs an unequip action.
     *
     * @param item - The inventory item to unequip.
     * @param equipmentSlot - The equipment slot the inventory item is currently equipped to.
     * @param handEquipmentSlot - The hand equipment slot to put the inventory item in.
     * @param notify - Whether or not to notify the player that they unequipped the inventory item. Defaults to true.
     */
	performUnequip(item: InventoryItem, equipmentSlot: EquipmentSlot, handEquipmentSlot: EquipmentSlot, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateUnequip(this, item, this.player, notify);
		this.getGame().logHandler.logUnequip(item, this.player, equipmentSlot, this.forced);
		this.player.unequip(item, equipmentSlot, handEquipmentSlot);
		handEquipmentSlot.equippedItem.executeUnequippedCommands();
        this.successMessage = `Successfully unequipped ${item.getIdentifier()} from ${this.player.name}'s ${equipmentSlot.id}.`;
	}

    /**
     * Finds the required inventory item and equipment slot to call performUnequip.
     * 
     * @param args - The args as strings.
     */
    parseInteractionArgs(args: string[]): [InventoryItem, EquipmentSlot] {
        const item = this.getGame().entityFinder.getInventoryItem(args[0], this.player.name, "", args[1], args[2]);
        const equipmentSlot = this.player.inventory.get(args[1]);
        return [item, equipmentSlot];
    }

    /**
     * Validates the parsed args. The results can be passed directly into performUnequip.
     * 
     * @param args - The args after being parsed.
     */
    validateInteractionArgs(args: [InventoryItem, EquipmentSlot]): [InventoryItem, EquipmentSlot, EquipmentSlot] | [] {
        if (args.length !== 2) return [];
        if (!args[0] || !(args[0] instanceof InventoryItem) || args[0].prefab === null) return [];
        const item = args[0];
        if (this.player.hasBehaviorAttribute("disable unequip")) return [];
        if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable unequip")) return [];
        if (!args[1] || !(args[1] instanceof EquipmentSlot) || args[1].equippedItem === null) return [];
        const equipmentSlot = args[1];
        const hand = this.getGame().entityFinder.getPlayerFreeHand(this.player);
        if (!hand) return [];
        if (item.equipmentSlot !== equipmentSlot.id) return [];
        if (equipmentSlot.equippedItem !== item) return [];
        if (item.player.name !== this.player.name) return [];
        if (!item.prefab.equippable) return [];
        return [item, equipmentSlot, hand];
    }
}
