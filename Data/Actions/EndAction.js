import Action from "../Action.js";
import Event from "../Event.js";

/**
 * @import Flag from "../Flag.js"
 * @import InventoryItem from "../InventoryItem.js"
 * @import Puzzle from "../Puzzle.js"
 */

/**
 * @class EndAction
 * @classdesc Represents an end action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/end-action.html
 */
export default class EndAction extends Action {
	/**
	 * Performs an end action.
	 * @param {Event} event - The event to end.
	 * @param {Event|Flag|InventoryItem|Puzzle} [callee] - The in-game entity that caused the command to be executed, if applicable.
	 */
	async performEnd(event, callee) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateEnd(this, event);
		this.getGame().logHandler.logEnd(event);
		event.end();
		const executeEndedCommands = !callee || !(callee instanceof Event);
		if (executeEndedCommands) event.executeEndedCommands();
	}
}