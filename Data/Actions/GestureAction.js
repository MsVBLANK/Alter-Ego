import Action from "../Action.ts";
import Gesture from "../Gesture.js";

/** @import Exit from "../Exit.js" */
/** @import Fixture from "../Fixture.js" */
/** @import InventoryItem from "../InventoryItem.js" */
/** @import Player from "../Player.js" */
/** @import RoomItem from "../RoomItem.js" */

/**
 * @class GestureAction
 * @classdesc Represents a gesture action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/gesture-action.html
 */
export default class GestureAction extends Action {
	/**
	 * Performs a gesture action.
	 * @param {Gesture} gesture - The gesture to perform.
	 * @param {string} targetType - The type of entity to target.
	 * @param {GestureTarget|null} target - The entity to target.
	 */
	performGesture(gesture, targetType, target) {
		if (this.performed) return;
		super.perform();
		let newGesture = new Gesture(gesture.id, [...gesture.requires], [...gesture.disabledStatusesStrings], gesture.description, gesture.narration.text, gesture.row, this.getGame());
		newGesture.targetType = targetType;
		newGesture.target = target;
		this.getGame().narrationHandler.narrateGesture(this, newGesture, this.player);
		this.getGame().logHandler.logGesture(gesture, target, this.player, this.forced);
	}
}