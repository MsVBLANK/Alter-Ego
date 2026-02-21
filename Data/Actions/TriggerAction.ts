import Action from "../Action.ts";
import Event from "../Event.js";
import type Flag from "../Flag.js";
import type InventoryItem from "../InventoryItem.js";
import type Puzzle from "../Puzzle.js";

/**
 * Represents a trigger action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/trigger-action.html
 */
export default class TriggerAction extends Action {
	/**
	 * Performs a trigger action.
     *
	 * @param event - The event to trigger.
	 * @param callee - The in-game entity that caused the command to be executed, if applicable.
	 */
	async performTrigger(event: Event, callee?: Event | Flag | InventoryItem | Puzzle): Promise<void> {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateTrigger(this, event);
		this.getGame().logHandler.logTrigger(event);
		event.trigger();
		const executeTriggeredCommands = !callee || !(callee instanceof Event);
		if (executeTriggeredCommands) event.executeTriggeredCommands();
	}
}
