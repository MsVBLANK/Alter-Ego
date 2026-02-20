import Action from "../Action.ts";
import Room from "../Room.js";
import MoveAction from "./MoveAction.js";
import StartMoveAction from "./StartMoveAction.js";

/** @import Exit from "../Exit.js" */

/**
 * @class QueueMoveAction
 * @classdesc Represents a queue move action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/queue-move-action.html
 */
export default class QueueMoveAction extends Action {
	/**
	 * Performs a queue move action.
	 * @param {boolean} isRunning - Whether the player is running.
	 * @param {string} destinationString - The destination the user supplied.
	 */
	performQueueMove(isRunning, destinationString) {
		if (this.performed) return;
		super.perform();
		const currentRoom = this.player.location;
		/** @type {Exit} */
		let exit = null;
		/** @type {Room} */
		let destinationRoom = null;
		/** @type {Exit} */
		let entrance = null;
		let isMovingFreely = false;

		exit = currentRoom.getExit(destinationString);
		if (!exit) {
			if (this.player.member.roles.cache.has(this.getGame().guildContext.freeMovementRole.id)) {
				// If the player has the free movement role, they can move to any room they please.
				destinationRoom = this.getGame().entityFinder.getRoom(destinationString);
				isMovingFreely = true;
			}
			else {
				// Otherwise, check that the desired room is adjacent to the current room.
				const destRoomId = Room.generateValidId(destinationString);
				for (const targetExit of currentRoom.exits.values()) {
					if (targetExit.dest.id === destRoomId) {
						exit = targetExit;
						break;
					}
				}
			}
		}
		if (exit) {
			destinationRoom = exit.dest;
			entrance = destinationRoom.getExit(exit.link);
		}
		if (!destinationRoom) {
			this.player.moveQueue.length = 0;
			return this.getGame().communicationHandler.sendMessageToPlayer(this.player, `There is no exit "${destinationString}" that you can currently move to. Please try the name of an exit in the room you're in or the name of the room you want to go to.`, false);
		}

		if (exit) {
			const startMoveAction = new StartMoveAction(this.getGame(), this.message, this.player, this.player.location, this.forced);
			startMoveAction.performStartMove(isRunning, currentRoom, destinationRoom, exit, entrance);
		}
		else {
			const moveAction = new MoveAction(this.getGame(), this.message, this.player, this.player.location, this.forced);
			moveAction.performMove(isRunning, currentRoom, destinationRoom, exit, entrance, isMovingFreely);
			this.player.moveQueue.length = 0;
		}
	}

	/**
	 * Finds the required room item to call performQueueMove.
	 * @param {string[]} args - The args as strings.
	 * @returns {[Room, boolean, string]}
	 */
	parseInteractionArgs(args) {
		const location = this.getGame().entityFinder.getRoom(args[0]);
		const isRunning = args[1].toLowerCase() === 'true';
		/** @type {Exit} */
		let exit = this.getGame().entityFinder.getExit(location, args[2]);
		const exitName = exit ? exit.name : "";
		return [location, isRunning, exitName];
	}

	/**
	 * Validates the parsed args. The results can be passed directly into performQueueMove.
	 * @param {[Room, boolean, string]} args - The args after being parsed.
	 * @returns {[boolean, string]|[]}
	 */
	validateInteractionArgs(args) {
		if (args.length !== 3) return [];
		if (!args[0]) return [];
		if (args[0].id !== this.player.location.id) return [];
		if (this.player.isMoving) return [];
		if (args[1] === false && (this.player.hasBehaviorAttribute("disable move") || this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable move"))) return [];
		if (args[1] === true && (this.player.hasBehaviorAttribute("disable run") || this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable run"))) return [];
		if (!args[2]) return [];
		return [args[1], args[2]];
	}
}