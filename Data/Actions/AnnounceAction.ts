import Action from "../Action.ts";
import type Dialog from "../Dialog.ts";

/**
 * Represents an announce action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#announce-action
 */
export default class AnnounceAction extends Action {
	/**
	 * Performs an announce action.
     *
	 * @param announcement - The announcement that was made.
	 */
	async performAnnounce(announcement: Dialog): Promise<void> {
		if (this.performed) return;
		super.perform();
		for (const livingPlayer of this.getGame().livingPlayers.values())
			this.getGame().communicationHandler.mirrorDialogInSpectateChannel(livingPlayer, this, announcement);
	}
}
