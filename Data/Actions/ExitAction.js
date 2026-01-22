import Action from "../Action.js";

/** @typedef {import("../Exit.js").default} Exit */
/** @typedef {import("../Room.js").default} Room */

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
	 * @param {boolean} isMovingFreely - Whether or not the player is performing free movement.
	 */
	performExit(currentRoom, exit, isMovingFreely) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateExit(this, this.player, currentRoom, exit, isMovingFreely);
		currentRoom.removePlayer(this.player);
		const whisperRemovalMessage = this.getGame().notificationGenerator.generateExitLeaveWhisperNotification(this.player.displayName);
		this.player.removeFromWhispers(whisperRemovalMessage, this);
	}
}