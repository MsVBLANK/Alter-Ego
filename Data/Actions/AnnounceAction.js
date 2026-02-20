import Action from "../Action.ts";

/** @import Dialog from "../Dialog.js" */

/**
 * @class AnnounceAction
 * @classdesc Represents an announce action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/announce-action.html
 */
export default class AnnounceAction extends Action {
	/**
	 * Performs an announce action.
	 * @param {Dialog} announcement - The announcement that was made.
	 */
	async performAnnounce(announcement) {
		if (this.performed) return;
		super.perform();
		for (const livingPlayer of this.getGame().livingPlayers.values())
			this.getGame().communicationHandler.mirrorDialogInSpectateChannel(livingPlayer, this, announcement);
	}
}