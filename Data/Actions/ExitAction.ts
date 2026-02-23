import Action from "../Action.ts";
import type Exit from "../Exit.js";
import type Room from "../Room.js";

/**
 * Represents an exit action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/exit-action.html
 */
export default class ExitAction extends Action {
	/**
	 * Performs an exit action.
     *
	 * @param currentRoom - The room the player is currently in.
	 * @param exit - The exit the player will leave their current room through.
	 * @param isMovingFreely - Whether or not the player is performing free movement.
	 */
	performExit(currentRoom: Room, exit: Exit, isMovingFreely: boolean): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateExit(this, this.player, currentRoom, exit, isMovingFreely);
		currentRoom.removePlayer(this.player);
		const whisperRemovalMessage = this.getGame().notificationGenerator.generateExitLeaveWhisperNotification(this.player.displayName);
		this.player.removeFromWhispers(whisperRemovalMessage, this);
	}
}
