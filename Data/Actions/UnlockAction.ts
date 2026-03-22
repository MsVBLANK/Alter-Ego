import Action from "../Action.ts";
import type Exit from "../Exit.js";

/**
 * Represents an unlock action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unlock-action.html
 */
export default class UnlockAction extends Action {
	/**
	 * Performs an unlock action.
     *
	 * @param exit - The exit to unlock.
	 */
	performUnlock(exit: Exit): void {
		if (this.performed) return;
		super.perform();
		exit.unlock();
		if (this.location.occupants.length > 0) this.getGame().narrationHandler.narrateUnlock(this, this.location, exit);
		this.getGame().logHandler.logUnlock(this.location, exit);
        this.successMessage = `Successfully unlocked ${exit.name} at ${this.location.getEntityID()}.`;
	}
}
