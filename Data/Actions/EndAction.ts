import Action from "../Action.ts";
import Event from "../Event.ts";

/**
 * Represents an end action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/end-action.html
 */
export default class EndAction extends Action {
	/**
	 * Performs an end action.
     *
	 * @param event - The event to end.
	 * @param callee - The in-game entity that caused the command to be executed, if applicable.
	 */
	async performEnd(event: Event, callee?: Callee): Promise<void> {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateEnd(this, event);
		this.getGame().logHandler.logEnd(event);
		event.end();
		const executeEndedCommands = !callee || !(callee instanceof Event);
		if (executeEndedCommands) event.executeEndedCommands();
	}
}
