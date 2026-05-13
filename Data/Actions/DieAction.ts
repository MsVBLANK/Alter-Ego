import Action from "../Action.ts";

/**
 * Represents a die action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#die-action
 */
export default class DieAction extends Action {
	/**
	 * Performs a die action.
     *
	 * @param customNarration - The custom text of the narration. Optional.
	 */
	performDie(customNarration?: string): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateDie(this, this.player, customNarration);
		this.getGame().logHandler.logDie(this.player);
		this.player.die(this);
	}
}
