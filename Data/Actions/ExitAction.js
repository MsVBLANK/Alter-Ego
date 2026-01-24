import Action from "../Action.js";

/** @import Exit from "../Exit.js" */
/** @import Room from "../Room.js" */

/**
 * @class ExitAction
 * @classdesc Represents an exit action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/exit-action.html
 */
export default class ExitAction extends Action {
	/**
	 * Performs an exit action.
	 * @param {Room} currentRoom - The room the player is currently in.
	 * @param {Exit} exit - The exit the player will leave their current room through.
	 */
	performExit(currentRoom, exit) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateExit(this, this.player, currentRoom, exit);
		currentRoom.removePlayer(this.player);
		const whisperRemovalMessage = this.getGame().notificationGenerator.generateExitLeaveWhisperNotification(this.player.displayName);
		this.player.removeFromWhispers(whisperRemovalMessage, this);
	}
}