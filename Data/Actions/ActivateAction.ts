import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type Fixture from "../Fixture.ts";

/**
 * Represents an activate action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/activate-action.html
 */
export default class ActivateAction extends Action {
	/**
	 * Performs an activate action.
     *
	 * @param fixture - The fixture to activate.
	 * @param narrate - Whether or not to narrate the fixture's activation.
	 * @param customNarration - The custom text of the narration. Optional.
	 */
	performActivate(fixture: Fixture, narrate: boolean, customNarration?: string): void {
		if (this.performed) return;
		super.perform();
		this.getGame().logHandler.logActivate(fixture, this.player, this.forced);
		fixture.activate(this.player);
		let initiatedDescription: string;
		let messageDisplayType: MessageDisplayType;
		if (this.player && fixture.process.recipe !== null) {
			initiatedDescription = fixture.process.recipe.initiatedDescription.parseFor(this.player, fixture);
			messageDisplayType = fixture.process.recipe.initiatedDescription.messageDisplayType;
		}
		if (narrate)
			this.getGame().narrationHandler.narrateActivate(this, fixture, this.player, initiatedDescription !== undefined && initiatedDescription !== "", customNarration);
		if (initiatedDescription) {
			this.player.sendDescription(initiatedDescription, fixture, messageDisplayType ?? MessageDisplayType.STANDARD);
		}
        this.successMessage = `Successfully activated ${fixture.name} at ${fixture.location.getEntityID()}${this.player ? ` for ${this.player.name}` : ``}.`;
	}
}
