import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.ts";
import type Player from "../Player.ts";

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
		this.player.use(item, target);
	}
}
