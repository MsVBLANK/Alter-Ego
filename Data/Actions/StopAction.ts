import Action from "../Action.ts";
import type Exit from "../Exit.js";

/**
 * Represents a stop action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/stop-action.html
 */
export default class StopAction extends Action {
    /**
     * Performs a stop action.
     *
     * @param exitLocked - Whether or not the action was initiated because the destination exit was locked. Defaults to false.
     * @param exit - The exit the player tried to move to, if applicable.
     */
    performStop(exitLocked: boolean = false, exit?: Exit): void {
        if (this.performed) return;
        super.perform();
        this.player.stopMoving();
        this.getGame().narrationHandler.narrateStop(this, this.player, exitLocked, exit);
    }
}
