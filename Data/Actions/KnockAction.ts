import Action from "../Action.ts";
import type Exit from "../Exit.js";

/**
 * Represents a knock action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/knock-action.html
 */
export default class KnockAction extends Action {
	/**
	 * Performs a knock action.
     *
	 * @param exit - The exit to knock on.
	 */
	performKnock(exit: Exit): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateKnock(this, exit, this.player);
		this.getGame().logHandler.logKnock(exit, this.player, this.forced);
        this.successMessage = `Successfully knocked on ${exit.name} for ${this.player.name}.`;
	}
}
