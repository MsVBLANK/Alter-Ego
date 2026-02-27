import Action from "../Action.ts";
import type Fixture from "../Fixture.ts";

/**
 * Represents a deactivate action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/deactivate-action.html
 */
export default class DeactivateAction extends Action {
	/**
	 * Performs a deactivate action.
     *
	 * @param fixture - The fixture to deactivate.
	 * @param narrate - Whether or not to narrate the fixture's deactivation.
	 * @param customNarration - The custom text of the narration. Optional.
	 */
	performDeactivate(fixture: Fixture, narrate: boolean, customNarration?: string): void {
		if (this.performed) return;
		super.perform();
		const player = this.player && this.player.location.id === fixture.location.id && this.player.isConscious() && !this.player.isHidden() ? this.player : undefined;
		if (narrate)
			this.getGame().narrationHandler.narrateDeactivate(this, fixture, player, customNarration);
		this.getGame().logHandler.logDeactivate(fixture, player, this.forced);
		fixture.deactivate();
	}
}
