import Action from "../Action.ts";
import type ItemInstance from "../ItemInstance.ts";
import type Player from "../Player.js";
import Puzzle from "../Puzzle.js";

/**
 * Represents a solve action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/solve-action.html
 */
export default class SolveAction extends Action {
	/**
	 * Performs a solve action.
     *
	 * @param puzzle - The puzzle to solve.
	 * @param password - The password the player entered to solve the puzzle.
	 * @param targetPlayer - The player who will be treated as the initiating player in subsequent bot command executions called by the puzzle's solved commands, if applicable.
	 * @param customNarration - The custom text of the narration. Optional.
	 * @param callee - The in-game entity that caused the command to be executed, if applicable.
	 */
	performSolve(puzzle: Puzzle, password: string, targetPlayer?: Player, customNarration?: string, callee?: Callee): void {
		if (this.performed) return;
		super.perform();
		/**
		 * We don't care about whether or not the requirements are actually met, because this action bypasses the check.
		 * However, puzzle.checkRequirementsMet will insert the required item instances into requiredItems, so run it anyway.
		 */
		let requiredItems: ItemInstance[] = [];
		puzzle.checkRequirementsMet(this.player, undefined, requiredItems);
		puzzle.solve();
		puzzle.setOutcome(password);
		puzzle.decrementRequiredItemUses(this.player, requiredItems);
		this.getGame().narrationHandler.narrateSolve(this, puzzle, password, this.player, undefined, customNarration);
		this.getGame().logHandler.logSolve(puzzle, this.player, this.forced);
		const executeSolvedCommands = !callee || !(callee instanceof Puzzle);
		if (executeSolvedCommands) puzzle.executeSolvedCommands(targetPlayer ? targetPlayer : this.player);
	}
}
