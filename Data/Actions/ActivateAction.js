import Action from "../Action.js";
import { MessageDisplayType } from "../../Modules/enums.js";
/** @import Fixture from "../Fixture.js" */

/**
 * @class ActivateAction
 * @classdesc Represents an activate action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/activate-action.html
 */
export default class ActivateAction extends Action {
	/**
	 * Performs an activate action.
	 * @param {Fixture} fixture - The fixture to activate.
	 * @param {boolean} narrate - Whether or not to narrate the fixture's activation.
	 * @param {string} [customNarration] - The custom text of the narration. Optional.
	 */
	performActivate(fixture, narrate, customNarration) {
		if (this.performed) return;
		super.perform();
		this.getGame().logHandler.logActivate(fixture, this.player, this.forced);
		fixture.activate(this.player);
		/** @type {string} */
		let initiatedDescription;
		/** @type {MessageDisplayType} */
		let messageDisplayType;
		if (this.player && fixture.process.recipe !== null) {
			initiatedDescription = fixture.process.recipe.initiatedDescription.parseFor(this.player, fixture);
			messageDisplayType = fixture.process.recipe.initiatedDescription.messageDisplayType;
		}
		if (narrate)
			this.getGame().narrationHandler.narrateActivate(this, fixture, this.player, initiatedDescription !== undefined && initiatedDescription !== "", customNarration);
		if (initiatedDescription) {
			this.player.sendDescription(initiatedDescription, fixture, messageDisplayType ?? MessageDisplayType.STANDARD);
		}
	}
}