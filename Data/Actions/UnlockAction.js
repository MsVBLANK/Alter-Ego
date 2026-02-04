import Action from "../Action.js";

/**
 * @import Exit from "../Exit.js"
 */

/**
 * @class UnlockAction
 * @classdesc Represents an unlock action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unlock-action.html
 */
export default class UnlockAction extends Action {
	/**
	 * Performs an unlock action.
	 * @param {Exit} exit - The exit to unlock.
	 */
	async performUnlock(exit) {
		if (this.performed) return;
		super.perform();
		exit.unlock();
		if (this.location.occupants.length > 0) this.getGame().narrationHandler.narrateUnlock(this, this.location, exit);
		this.getGame().logHandler.logUnlock(this.location, exit);
	}
}