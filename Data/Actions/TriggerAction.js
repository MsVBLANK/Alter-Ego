import Action from "../Action.ts";
import Event from "../Event.js";

/**
 * @import Flag from "../Flag.js"
 * @import InventoryItem from "../InventoryItem.js"
 * @import Puzzle from "../Puzzle.js"
 */

/**
 * @class TriggerAction
 * @classdesc Represents a trigger action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/trigger-action.html
 */
export default class TriggerAction extends Action {
	/**
	 * Performs a trigger action.
	 * @param {Event} event - The event to trigger.
	 * @param {Event|Flag|InventoryItem|Puzzle} [callee] - The in-game entity that caused the command to be executed, if applicable.
	 */
	async performTrigger(event, callee) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateTrigger(this, event);
		this.getGame().logHandler.logTrigger(event);
		event.trigger();
		const executeTriggeredCommands = !callee || !(callee instanceof Event);
		if (executeTriggeredCommands) event.executeTriggeredCommands();
	}
}