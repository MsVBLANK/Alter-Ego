import Action from "../Action.ts";
import EnterAction from "./EnterAction.js";
import ExitAction from "./ExitAction.js";
import SolveAction from "./SolveAction.js";

/** @import Exit from "../Exit.js" */
/** @import Room from "../Room.js" */

/**
 * @class MoveAction
 * @classdesc Represents a move action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/move-action.html
 */
export default class MoveAction extends Action {
	/**
	 * Performs a move action.
	 * @param {boolean} isRunning - Whether the player is running.
	 * @param {Room} currentRoom - The room the player is currently in.
	 * @param {Room} destinationRoom - The room the player will be moved to.
	 * @param {Exit} exit - The exit the player will leave their current room through.
	 * @param {Exit} entrance - The exit the player will enter the destination room from.
	 * @param {boolean} [isMovingFreely] - Whether or not the player is performing free movement. False by default.
	 */
	performMove(isRunning, currentRoom, destinationRoom, exit, entrance, isMovingFreely = false) {
		if (this.performed) return;
		super.perform();

		// If there is an exit puzzle, solve it.
		if (exit) {
			const exitPuzzle = this.getGame().entityFinder.getPuzzle(exit.name, currentRoom.id, "restricted exit", true);
			if (exitPuzzle && exitPuzzle.solutions.includes(this.player.name)) {
				const solveAction = new SolveAction(this.getGame(), undefined, this.player, exitPuzzle.location, this.forced);
				solveAction.performSolve(exitPuzzle, this.player.name);
			}
		}

		// Exit the current room.
		const exitAction = new ExitAction(this.getGame(), this.message, this.player, this.location, this.forced, this.whisper);
		exitAction.performExit(currentRoom, exit, isMovingFreely);
		// Enter the destination room.
		const enterAction = new EnterAction(this.getGame(), this.message, this.player, this.location, this.forced, this.whisper);
		enterAction.performEnter(destinationRoom, entrance, isMovingFreely);
		// Send log message.
		this.getGame().logHandler.logMove(isRunning, destinationRoom, this.player, this.forced);
	}
}