import Action from "../Action.ts";
import type HidingSpot from "../HidingSpot.ts";
import CureAction from "./CureAction.ts";

/**
 * Represents an unhide action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#unhide-action
 */
export default class UnhideAction extends Action {
	/**
	 * Performs an unhide action.
     *
	 * @param hidingSpot - The hiding spot to unhide from. If one is not specified, it will be searched for.
	 */
	performUnhide(hidingSpot?: HidingSpot) {
		if (this.performed) return;
		super.perform();
		if (!hidingSpot) {
			const hidingSpotFixture = this.getGame().entityFinder.getFixture(this.player.hidingSpot, this.player.location.id);
			if (hidingSpotFixture) hidingSpot = hidingSpotFixture.hidingSpot;
		}
		this.getGame().narrationHandler.narrateUnhide(this, hidingSpot, this.player);
		if (hidingSpot) hidingSpot.removePlayer(this.player, this);
		else {
			const whisperNarration = this.getGame().notificationGenerator.generateUnhideNotification(this.player, false, "hiding");
			this.player.removeFromWhispers(whisperNarration, this);
			this.player.hidingSpot = "";
		}
		const hiddenStatus = this.getGame().entityFinder.getStatusEffect("hidden");
		const cureAction = new CureAction(this.getGame(), undefined, this.player, this.player.location, true);
		cureAction.performCure(hiddenStatus, true, false, true);
		this.getGame().logHandler.logUnhide(hidingSpot, this.player, this.forced);
        this.successMessage = `Successfully brought ${this.player.name} out of hiding.`;
	}
}
