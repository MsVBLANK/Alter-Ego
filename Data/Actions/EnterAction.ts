import Action from "../Action.ts";
import type Exit from "../Exit.js";
import type Room from "../Room.ts";
import QueueMoveAction from "./QueueMoveAction.ts";

/**
 * Represents an enter action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#enter-action
 */
export default class EnterAction extends Action {
	/**
	 * Performs an enter action.
     *
	 * @param destinationRoom - The room the player will be moved to.
	 * @param entrance - The exit the player will enter the destination room from.
	 * @param isMovingFreely - Whether or not the player is performing free movement.
     * @param isRunning - Whether the player is running. False by default.
	 */
	async performEnter(destinationRoom: Room, entrance: Exit, isMovingFreely: boolean, isRunning: boolean = false): Promise<void> {
		if (this.performed) return;
		super.perform();
		destinationRoom.addPlayer(this.player, entrance);
		await this.getGame().narrationHandler.narrateEnter(this, this.player, destinationRoom, entrance, isMovingFreely);
        this.player.moveQueue.splice(0, 1);
        if (this.player.moveQueue.length > 0) {
            const queueMoveAction = new QueueMoveAction(this.player.getGame(), undefined, this.player, this.player.location, this.forced);
            await queueMoveAction.performQueueMove(isRunning, this.player.moveQueue[0]);
        }
	}
}
