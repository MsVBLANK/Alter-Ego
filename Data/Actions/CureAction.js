import Action from "../Action.js";
import InflictAction from "./InflictAction.js";
/** @import InventoryItem from "../InventoryItem.js" */
/** @import Status from "../Status.js" */

/**
 * @class CureAction
 * @classdesc Represents a cure action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/cure-action.html
 */
export default class CureAction extends Action {
	/**
	 * Performs a cure action.
	 * @param {Status} status - The status to cure.
     * @param {boolean} [notify=true] - Whether or not to send the player the status's curedDescription. Defaults to true.
     * @param {boolean} [doCuredCondition=true] - Whether or not to turn the status into its curedCondition. Defaults to true.
     * @param {boolean} [narrate=true] - Whether or not to send any narrations caused by the status being cured. Defaults to true.
     * @param {InventoryItem} [item] - The inventory item that caused the status to be cured, if applicable.
	 * @returns Whether or not the bot should send a followup message.
	 */
	performCure(status, notify = true, doCuredCondition = true, narrate = true, item) {
		if (this.performed) return false;
		super.perform();
		let sendFollowupMessage = true;
		const playerStatusIds = this.player.statusCollection.map(statusEffect => statusEffect.id);
		if (!playerStatusIds.includes(status.id)) {
			if (this.message && this.forced) this.message.reply(`Specified player doesn't have that status effect.`);
			return false;
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
			if (this.message && this.forced) this.message.reply(`Successfully removed status effect. Player is now ${status.curedCondition.id}.`);
			sendFollowupMessage = false;
		}
		if (notify) {
			this.player.sendDescription(status.curedDescription, status);
			// If the player is waking up, send them the description of the room they wake up in.
			if (status.behaviorAttributes.has("unconscious"))
				this.player.sendDescription(this.player.location.description, this.player.location);
		}
		this.getGame().logHandler.logCure(status, this.player);
		this.player.cure(status);
		if (status.id === "heated") {
			const heatedPlayers = this.getGame().entityFinder.getLivingPlayers(undefined, undefined, undefined, undefined, "heated");
			if (heatedPlayers.length === 0) this.getGame().heated = false;
		}
		return sendFollowupMessage;
	}
}