import Action from "../Action.ts";
import Puzzle from "../Puzzle.js";
import type Flag from "../Flag.js";
import type InventoryItem from "../InventoryItem.js";

/**
 * Represents an unsolve action.
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/unsolve-action.html
 */
export default class UnsolveAction extends Action {
	/**
	 * Performs an unsolve action.
     *
	 * @param puzzle - The puzzle to unsolve.
	 * @param customNarration - The custom text of the narration. Optional.
	 * @param callee - The in-game entity that caused the command to be executed, if applicable.
	 */
	performUnsolve(puzzle: Puzzle, customNarration?: string, callee?: Event | Flag | InventoryItem | Puzzle): void {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateUnsolve(this, puzzle, this.player, customNarration);
		this.getGame().logHandler.logUnsolve(puzzle, this.player, this.forced);
		puzzle.unsolve();
		const executeUnsolvedCommands = !callee || !(callee instanceof Puzzle);
		if (executeUnsolvedCommands) puzzle.executeUnsolvedCommands(this.player);
		puzzle.clearOutcome();
	}
}
