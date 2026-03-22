import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.ts";
import type Status from "../Status.ts";
import InflictAction from "./InflictAction.ts";

/**
 * Represents a cure action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/cure-action.html
 */
export default class CureAction extends Action {
	/**
	 * Performs a cure action.
     *
	 * @param status - The status to cure.
     * @param notify - Whether or not to send the player the status's curedDescription. Defaults to true.
     * @param doCuredCondition - Whether or not to turn the status into its curedCondition. Defaults to true.
     * @param narrate - Whether or not to send any narrations caused by the status being cured. Defaults to true.
     * @param item - The inventory item that caused the status to be cured, if applicable.
	 */
	performCure(status: Status, notify: boolean = true, doCuredCondition: boolean = true, narrate: boolean = true, item?: InventoryItem): void {
		if (this.performed) return;
		super.perform();
		const playerStatusIds = this.player.status.map(statusEffect => statusEffect.id);
		if (!playerStatusIds.includes(status.id)) {
			if (this.message && this.forced) this.message.reply(`Specified player doesn't have that status effect.`);
            return;
		}
		if (status.behaviorAttributes.has("no channel") && this.player.getBehaviorAttributeStatusEffects("no channel").length - 1 === 0)
			this.player.location.joinChannel(this.player);
		if (status.behaviorAttributes.has("concealed")) {
			this.player.displayName = this.player.name;
			if (this.player.isNPC) this.player.displayIcon = this.player.id;
			else this.player.displayIcon = null;
			this.player.setPronouns(this.player.pronouns, this.player.pronounString);
			this.player.location.setOccupantsString();
		}
		if (narrate) this.getGame().narrationHandler.narrateCure(this, status, this.player, item);
		if (status.curedCondition && doCuredCondition) {
			const curedConditionAction = new InflictAction(this.getGame(), undefined, this.player, this.player.location, true);
			curedConditionAction.performInflict(status.curedCondition, false, false, true);
			if (this.message && this.forced) this.successMessage = `Successfully removed status effect. Player is now ${status.curedCondition.id}.`;
		}
		if (notify) {
			const curedDescription = status.curedDescription.parseFor(this.player, status);
			this.player.sendDescription(curedDescription, status, status.curedDescription.messageDisplayType ?? MessageDisplayType.STANDARD);
			// If the player is waking up, send them the description of the room they wake up in.
			if (status.behaviorAttributes.has("unconscious"))
				this.player.location.description.parseAndSendTo(this.player, this.player.location);
		}
		this.getGame().logHandler.logCure(status, this.player);
		this.player.cure(status);
		if (status.id === "heated") {
			const heatedPlayers = this.getGame().entityFinder.getLivingPlayers(undefined, undefined, undefined, undefined, "heated");
			if (heatedPlayers.length === 0) this.getGame().heated = false;
		}
		if (!this.successMessage) this.successMessage = `Successfully removed status effect ${status.id} from ${this.player?.name}.`;
	}
}
