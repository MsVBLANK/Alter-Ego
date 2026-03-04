import Action from "../Action.ts";
import type Exit from "../Exit.js";
import type Room from "../Room.ts";

/**
 * Represents an enter action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/enter-action.html
 */
export default class EnterAction extends Action {
    /**
     * Performs an enter action.
     *
     * @param destinationRoom - The room the player will be moved to.
     * @param entrance - The exit the player will enter the destination room from.
     * @param isMovingFreely - Whether or not the player is performing free movement.
     */
    performEnter(destinationRoom: Room, entrance: Exit, isMovingFreely: boolean): void {
        if (this.performed) return;
        super.perform();
        destinationRoom.addPlayer(this.player, entrance);
        this.getGame().narrationHandler.narrateEnter(this, this.player, destinationRoom, entrance, isMovingFreely);
    }
}
