import Action from "../Action.ts";
import type Exit from "../Exit.js";
import type Room from "../Room.ts";

/**
 * Represents a start move action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/start-move-action.html
 */
export default class StartMoveAction extends Action {
    /**
     * Performs a start move action.
     *
     * @param isRunning - Whether the player is running.
     * @param currentRoom - The room the player is currently in.
     * @param destinationRoom - The room the player will be moved to.
     * @param exit - The exit the player will leave their current room through.
     * @param entrance - The exit the player will enter the destination room from.
     */
    performStartMove(isRunning: boolean, currentRoom: Room, destinationRoom: Room, exit: Exit, entrance: Exit): void {
        if (this.performed) return;
        super.perform();
        const time = this.player.calculateMoveTime(exit, isRunning);
        if (time > 1000) this.getGame().narrationHandler.narrateStartMove(this, isRunning, exit, this.player);
        this.player.move(isRunning, currentRoom, destinationRoom, exit, entrance, time, this.forced);
    }
}
