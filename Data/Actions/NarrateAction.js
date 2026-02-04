import Action from "../Action.js";
import Narration from "../Narration.js";
import SayAction from "./SayAction.js";
import { MessageDisplayType } from "../../Modules/enums.js";
import { ChannelType } from "discord.js";

/** @import Player from "../Player.js" */

/**
 * @class NarrateAction
 * @classdesc Represents a narrate action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/narrate-action.html
 */
export default class NarrateAction extends Action {
	/**
	 * Performs a narrate action.
	 * @param {Narration} narration - The narration to narrate.
	 */
	performNarrate(narration) {
		if (this.performed) return;
		super.perform();
		this.#communicateNarrationToLocation(narration);
		this.#communicateNarrationToWhisper(narration);
		this.#communicateNarrationToVideoMonitoringRooms(narration);
	}

	/**
	 * Returns true if the given player is unable to receive communications.
	 * @param {Narration} narration - The narration to send.
	 * @param {Player} player - The player to check.
	 */
	#playerCannotReceiveCommunications(narration, player) {
		return player.isNPC || narration.action instanceof SayAction && !player.canHear() || !player.canSee() || !player.isConscious();
	}

	/**
	 * Returns true if a player should be notified of the narration.
	 * @param {Narration} narration - The narration to be communicated.
	 * @param {Player} player - The player hearing the dialog.
	 */
	#playerShouldReceiveNotification(narration, player) {
		return player.hasBehaviorAttribute("see room")
			|| narration.whisper && narration.whisper.players.has(player.name) && !player.member.permissionsIn(narration.whisper.channel).has('ViewChannel');
	}

	/**
	 * Returns a custom username for webhooks for narrations in rooms with the `video surveilled` tag.
	 * @param {Narration} narration - The narration to be communicated.
	 * @param {string} prefix - A prefix to apply to the beginning of the webhook username. A space will be added before the rest of the username. 
	 * @param {string} [webhookUsername] - A custom username to use for the webhook without the prefix. Optional.
	 */
	#assembleVideoSurveilledWebhookUsername(narration, prefix, webhookUsername = narration.narratorDisplayName) {
		if (!narration.narrator) return;
		return `${prefix} ${webhookUsername}`;
	}

	/**
	 * Sends the narration to the player's spectate channel.
	 * @param {Player} player - The player whose spectate channel the narration is to be mirrored in.
	 * @param {Narration} narration - The narration to send.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 */
	#mirrorNarrationInSpectateChannel(player, narration, narrationText = narration.content) {
		narrationText = narration.getWhisperPrefixString() + narrationText;
		this.getGame().communicationHandler.mirrorNarrationInSpectateChannel(player, narration.action, narration.messageDisplayType, narrationText);
	}

	/**
	 * Sends the narration to the player's spectate channel as a webhook.
	 * @param {Player} player - The player whose spectate channel the narration is to be mirrored in.
	 * @param {Narration} narration - The narration to send.
	 * @param {string} [narratorDisplayName] - The custom display name of the narrator to use for the webhook. Defaults to the narration's narrator display name.
	 * @param {string} [narratorDisplayIcon] - The custom avatar URL of the narrator to use for the webhook. Defaults to the narration's narrator display icon.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 */
	#mirrorMessageNarrationInSpectateChannel(player, narration, narratorDisplayName = narration.narratorDisplayName, narratorDisplayIcon = narration.narratorDisplayIcon, narrationText = narration.content) {
		narrationText = narration.getWhisperPrefixString() + narrationText;
		this.getGame().communicationHandler.mirrorWebhookNarrationInSpectateChannel(player, narration.action, narration, narratorDisplayName, narratorDisplayIcon, narrationText);
	}

	/**
	 * Mirrors the player's own narration in their spectate channel.
	 * @param {Narration} narration - The narration the player caused.
	 */
	#mirrorPlayersOwnNarration(narration) {
		const webhookUsername = narration.player.displayName !== narration.player.name ? `${narration.narratorDisplayName} (${narration.player.name})` : narration.player.name;
		this.#mirrorMessageNarrationInSpectateChannel(narration.player, narration, webhookUsername, narration.narratorDisplayIcon);
	}

	/**
	 * Communicates the narration to players.
	 * @param {Narration} narration - The narration to be communicated.
	 * @param {Player[]} players - The players to communicate the narration to.
	 * @param {string} [narratorDisplayName] - The custom display name of the narrator to use for the webhook, if the narration was created by a narrator.
	 * @param {string} [narratorDisplayIcon] - The custom avatar URL of the narrator to use for the webhook, if the narration was created by a narrator.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 */
	#communicateNarrationToPlayers(narration, players, narratorDisplayName, narratorDisplayIcon, narrationText) {
		for (const player of players) {
			if (narration.player && narration.player.name === player.name) {
				if (narration.isPlayerMessageType()) this.#mirrorPlayersOwnNarration(narration);
				else continue;
			}
			if (this.#playerCannotReceiveCommunications(narration, player)) continue;
			const mirrorNotificationInSpectateChannel = narration.narrator === undefined;
			if (this.#playerShouldReceiveNotification(narration, player))
				this.getGame().communicationHandler.notifyPlayer(player, narration.action, narration.content, narration.narrator ? MessageDisplayType.STANDARD : narration.messageDisplayType, mirrorNotificationInSpectateChannel);
			if (narration.narrator) this.#mirrorMessageNarrationInSpectateChannel(player, narration, narratorDisplayName, narratorDisplayIcon, narrationText);
			else this.#mirrorNarrationInSpectateChannel(player, narration, narrationText);
		}
	}

	/**
	 * Communicates the narration to its location.
	 * @param {Narration} narration - The narration to be communicated.
	 */
	#communicateNarrationToLocation(narration) {
		if (narration.isInHidingSpot()) return;
		this.#communicateNarrationToPlayers(narration, narration.location.occupants);
		if (!narration.isModeratorNarration()) this.getGame().communicationHandler.narrateInRoom(narration, narration.content, false);
	}

	/**
	 * Communicates the narration to a whisper.
	 * @param {Narration} narration - The narration to be communicated.
	 */
	#communicateNarrationToWhisper(narration) {
		if (!narration.whisper) return;
		this.#communicateNarrationToPlayers(narration, narration.whisper.players.map(player => player));
		if (!narration.isModeratorNarration()) this.getGame().communicationHandler.narrateInWhisper(narration, narration.content, false);
	}

	/**
	 * Communicates the narration in rooms with the `video monitoring` tag.
	 * @param {Narration} narration - The narration to be communicated.
	 */
	#communicateNarrationToVideoMonitoringRooms(narration) {
		if (!narration.locationIsVideoSurveilled || narration.isInHidingSpot() || narration.action instanceof SayAction) return;
		const roomDisplayName = narration.location.getSurveilledDisplayName(true);
		const narrationHasNarrator = !!narration.narrator;
		const prefix = `[${roomDisplayName}] `;
		const narrationText = narrationHasNarrator ? `${narration.content}` : `\`${prefix}${narration.content}\``;
		for (const videoMonitoringRoom of narration.videoMonitoringRooms) {
			const webhookUsername = this.#assembleVideoSurveilledWebhookUsername(narration, prefix, narration.narratorDisplayName);
			this.#communicateNarrationToPlayers(narration, videoMonitoringRoom.occupants, webhookUsername, narration.narratorDisplayIcon, narrationText);
			if (!narration.isModeratorNarration()) this.getGame().communicationHandler.narrateInRoom(narration, narrationText, false, videoMonitoringRoom, webhookUsername);
		}
	}
}