import Action from "../Action.ts";
import InventoryItem from "../InventoryItem.ts";
import Player from "../Player.ts";

/**
 * Represents a use action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/use-action.html
 */
export default class UseAction extends Action {
	/**
	 * Performs a use action.
	 * @param item - The inventory item to use.
	 * @param target - The target the player should use the inventory item on. Defaults to themself.
	 * @param customNarration - The custom text of the narration. Optional.
	 */
	performUse(item: InventoryItem, target: Player = this.player, customNarration?: string): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateUse(this, item, this.player, target, customNarration);
		this.getGame().logHandler.logUse(item, this.player, target, this.forced);
        const itemIdentifier = item.getIdentifier();
		this.player.use(item, target);
        const targetString = target.name !== this.player.name ? `on ${target.name} ` : ``;
        this.successMessage = `Successfully used ${itemIdentifier} ${targetString}for ${this.player.name}.`;
	}

    /**
     * Finds the required inventory item and target to call performUse.
     * 
     * @param args - The args as strings. 
     */
    parseInteractionArgs(args: string[]): [InventoryItem, Player] {
        const hand = this.getGame().entityFinder.getPlayerHandHoldingItem(this.player, args[0]);
        const player = this.getGame().entityFinder.getLivingPlayer(args[1]);
        return [hand?.equippedItem, player];
    }

    /**
     * Validates the parsed args. The results can be passed directly into performUse.
     * 
     * @param args - The args after being parsed. 
     */
    validateInteractionArgs(args: [InventoryItem, Player]): [InventoryItem, Player] | [] {
        if (args.length !== 2) return [];
        if (!args[0] || !(args[0] instanceof InventoryItem) || args[0].prefab === null) return [];
        const item = args[0];
        if (this.player.hasBehaviorAttribute("disable use")) return [];
        if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable use")) return [];
        if (!args[1] || !(args[1] instanceof Player)) return [];
        const target = args[1];
        if (item.container !== null) return [];
        if (item.player.name !== this.player.name) return [];
        if (target.location.id !== this.player.location.id) return [];
        if (item.uses === 0 || !item.prefab.usable || !item.usableOn(target)) return [];
        return [item, target];
    }
}
