import Action from "../Action.js";

/**
 * @import Exit from "../Exit.js"
 */

/**
 * @class LockAction
 * @classdesc Represents a lock action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/lock-action.html
 */
export default class LockAction extends Action {
	/**
	 * Performs a lock action.
	 * @param {Exit} exit - The exit to lock.
	 */
	async performLock(exit) {
		if (this.performed) return;
		super.perform();
		exit.lock();
		if (this.location.occupants.length > 0) this.getGame().narrationHandler.narrateLock(this, this.location, exit);
        this.getGame().logHandler.logLock(this.location, exit);
	}
}