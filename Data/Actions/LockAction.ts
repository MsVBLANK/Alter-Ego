import Action from "../Action.ts";
import type Exit from "../Exit.js";

/**
 * Represents a lock action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#lock-action
 */
export default class LockAction extends Action {
	/**
	 * Performs a lock action.
     *
	 * @param exit - The exit to lock.
	 */
	performLock(exit: Exit): void {
		if (this.performed) return;
		super.perform();
		exit.lock();
		if (this.location.occupants.length > 0) this.getGame().narrationHandler.narrateLock(this, this.location, exit);
        this.getGame().logHandler.logLock(this.location, exit);
        this.successMessage = `Successfully locked ${exit.name} at ${this.location.getEntityID()}.`;
	}
}
