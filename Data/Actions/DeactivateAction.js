import Action from "../Action.ts";

/** @import Fixture from "../Fixture.js" */

/**
 * @class DeactivateAction
 * @classdesc Represents a deactivate action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/deactivate-action.html
 */
export default class DeactivateAction extends Action {
	/**
	 * Performs a deactivate action.
	 * @param {Fixture} fixture - The fixture to deactivate.
	 * @param {boolean} narrate - Whether or not to narrate the fixture's deactivation.
	 * @param {string} [customNarration] - The custom text of the narration. Optional.
	 */
	performDeactivate(fixture, narrate, customNarration) {
		if (this.performed) return;
		super.perform();
		const player = this.player && this.player.location.id === fixture.location.id && this.player.isConscious() && !this.player.isHidden() ? this.player : undefined;
		if (narrate)
			this.getGame().narrationHandler.narrateDeactivate(this, fixture, player, customNarration);
		this.getGame().logHandler.logDeactivate(fixture, player, this.forced);
		fixture.deactivate();
	}
}
