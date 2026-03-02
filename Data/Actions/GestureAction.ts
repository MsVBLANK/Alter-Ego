import Action from "../Action.ts";
import Gesture from "../Gesture.ts";

/**
 * Represents a gesture action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/gesture-action.html
 */
export default class GestureAction extends Action {
	/**
	 * Performs a gesture action.
     *
	 * @param gesture - The gesture to perform.
	 * @param targetType - The type of entity to target.
	 * @param target - The entity to target.
	 */
	performGesture(gesture: Gesture, targetType: string, target: GestureTarget | null): void {
		if (this.performed) return;
		super.perform();
		let newGesture = new Gesture(gesture.id, [...gesture.requires], [...gesture.disabledStatusesStrings], gesture.description, gesture.narration.text, gesture.row, this.getGame());
		newGesture.targetType = targetType;
		newGesture.target = target;
		this.getGame().narrationHandler.narrateGesture(this, newGesture, this.player);
		this.getGame().logHandler.logGesture(gesture, target, this.player, this.forced);
	}
}
