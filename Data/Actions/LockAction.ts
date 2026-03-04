import Action from "../Action.ts";
import type Exit from "../Exit.js";

/**
 * Represents a lock action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/lock-action.html
 */
export default class LockAction extends Action {
    /**
     * Performs a lock action.
     *
     * @param exit - The exit to lock.
     */
    async performLock(exit: Exit): Promise<void> {
        if (this.performed) return;
        super.perform();
        exit.lock();
        if (this.location.occupants.length > 0) this.getGame().narrationHandler.narrateLock(this, this.location, exit);
        this.getGame().logHandler.logLock(this.location, exit);
    }
}
