import type { Duration } from "luxon";
import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.ts";
import type Status from "../Status.ts";
import CureAction from "./CureAction.ts";

/**
 * Represents an inflict action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/inflict-action.html
 */
export default class InflictAction extends Action {
	/**
	 * Performs an inflict action.
     *
	 * @param status - The status to inflict.
	 * @param notify - Whether or not to send the player the status's inflictedDescription. Defaults to true.
     * @param doCures - Whether or not the status's cures should actually be cured. Defaults to true.
     * @param narrate - Whether or not to send any narrations caused by the status being inflicted. Defaults to true.
     * @param item - The inventory item that caused the status to be inflicted, if applicable.
	 * @param duration - A custom duration that overrides the status's default duration.
	 */
	performInflict(status: Status, notify: boolean = true, doCures: boolean = true, narrate: boolean = true, item?: InventoryItem, duration: Duration<true> = null): void {
		if (this.performed) return;
		super.perform();
		const playerStatusIds = this.player.status.map(statusEffect => statusEffect.id);
		for (const overrider of status.overriders) {
			if (playerStatusIds.includes(overrider.id)) {
				if (this.message) this.successMessage = `Couldn't inflict status effect "${status.id}" because ${this.player.name} is already ${overrider.id}.`;
				return;
			}
		}
		if (playerStatusIds.includes(status.id)) {
			if (status.duplicatedStatus !== null) {
				const cureAction = new CureAction(this.getGame(), undefined, this.player, this.player.location, true);
				cureAction.performCure(status, false, false, false);
				const duplicatedStatusAction = new InflictAction(this.getGame(), undefined, this.player, this.player.location, true);
				duplicatedStatusAction.performInflict(status.duplicatedStatus, true, true, true);
				if (this.message) this.successMessage = `Status was duplicated, so inflicted ${this.player.name} with ${status.duplicatedStatus.id} instead.`;
				return;
			}
			else {
				if (this.message) this.message.reply(`${this.player.name} already has status effect ${status.id}.`);
				return;
			}
		}
		if (status.cures.length > 0 && doCures) {
			for (const cure of status.cures) {
				const cureAction = new CureAction(this.getGame(), undefined, this.player, this.player.location, true);
				cureAction.performCure(cure, false, false, false);
			}
		}

		// Apply the effects of behavior attributes.
        let removeFromWhisperNarration: string;
		if (status.id === "heated")
			this.getGame().heated = true;
		if (status.behaviorAttributes.has("no channel")) {
			this.location.leaveChannel(this.player);
			removeFromWhisperNarration = this.getGame().notificationGenerator.generateNoChannelLeaveWhisperNotification(this.player, status.id);
		}
		if (status.behaviorAttributes.has("no hearing")) {
			removeFromWhisperNarration = this.getGame().notificationGenerator.generateNoHearingLeaveWhisperNotification(this.player.displayName);
		}
		if (status.behaviorAttributes.has("concealed")) {
			const maskName = item ? item.singleContainingPhrase : "a MASK";
			this.player.displayName = `an individual wearing ${maskName}`;
			this.player.displayIcon = this.getGame().settings.defaultConcealedIconURL;
			this.player.setPronouns(this.player.pronouns, "neutral");
			this.location.setOccupantsString();
		}
		if (status.behaviorAttributes.has("disable all") || status.behaviorAttributes.has("disable move") || status.behaviorAttributes.has("disable run"))
			this.player.stopMoving();

		this.player.inflict(status, duration);
		if (notify) {
			const inflictedDescription = status.inflictedDescription.parseFor(this.player, status);
			this.player.sendDescription(inflictedDescription, status, status.inflictedDescription.messageDisplayType ?? MessageDisplayType.STANDARD);
		}
		if (narrate) this.getGame().narrationHandler.narrateInflict(this, status, this.player);
        if (removeFromWhisperNarration) this.player.removeFromWhispers(removeFromWhisperNarration, this);
		this.getGame().logHandler.logInflict(status, this.player);
        this.successMessage = `Successfully added status effect ${status.id} to ${this.player?.name}.`;
	}
}
