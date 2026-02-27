import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import Narration from "../Narration.ts";
import type Player from "../Player.ts";
import SayAction from "./SayAction.ts";

/**
 * Represents a narrate action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/narrate-action.html
 */
export default class NarrateAction extends Action {
	/**
	 * Performs a narrate action.
     *
	 * @param narration - The narration to narrate.
	 */
	performNarrate(narration: Narration): void {
		if (this.performed) return;
		super.perform();
		this.#communicateNarrationToLocation(narration);
		this.#communicateNarrationToWhisper(narration);
		this.#communicateNarrationToVideoMonitoringRooms(narration);
	}

	/**
	 * Returns true if the given player is unable to receive communications.
     *
	 * @param narration - The narration to send.
	 * @param player - The player to check.
	 */
	#playerCannotReceiveCommunications(narration: Narration, player: Player): boolean {
		return player.isNPC || narration.action instanceof SayAction && !player.canHear() || !player.canSee() || !player.isConscious();
	}

	/**
	 * Returns true if a player should be notified of the narration.
     *
	 * @param narration - The narration to be communicated.
	 * @param player - The player hearing the dialog.
	 */
	#playerShouldReceiveNotification(narration: Narration, player: Player): boolean {
		return player.hasBehaviorAttribute("see room")
			|| narration.whisper && narration.whisper.players.has(player.name) && !player.member.permissionsIn(narration.whisper.channel).has('ViewChannel');
	}

	/**
	 * Returns a custom username for webhooks for narrations in rooms with the `video surveilled` tag.
     *
	 * @param narration - The narration to be communicated.
	 * @param prefix - A prefix to apply to the beginning of the webhook username. A space will be added before the rest of the username.
	 * @param webhookUsername - A custom username to use for the webhook without the prefix. Optional.
	 */
	#assembleVideoSurveilledWebhookUsername(narration: Narration, prefix: string, webhookUsername: string = narration.narratorDisplayName): string {
		if (!narration.narrator) return;
		return `${prefix} ${webhookUsername}`;
	}

	/**
	 * Sends the narration to the player's spectate channel.
     *
	 * @param player - The player whose spectate channel the narration is to be mirrored in.
	 * @param narration - The narration to send.
	 * @param narrationText - The custom text of the narration to send. Optional.
	 */
	#mirrorNarrationInSpectateChannel(player: Player, narration: Narration, narrationText: string = narration.content): void {
		narrationText = narration.getWhisperPrefixString() + narrationText;
		this.getGame().communicationHandler.mirrorNarrationInSpectateChannel(player, narration.action, narration.messageDisplayType, narrationText, narration.attachments.map(attachment => attachment.url));
	}

	/**
	 * Sends the narration to the player's spectate channel as a webhook.
     *
	 * @param player - The player whose spectate channel the narration is to be mirrored in.
	 * @param narration - The narration to send.
	 * @param narratorDisplayName - The custom display name of the narrator to use for the webhook. Defaults to the narration's narrator display name.
	 * @param narratorDisplayIcon - The custom avatar URL of the narrator to use for the webhook. Defaults to the narration's narrator display icon.
	 * @param narrationText - The custom text of the narration to send. Optional.
	 */
	#mirrorMessageNarrationInSpectateChannel(player: Player, narration: Narration,
        narratorDisplayName: string = narration.narratorDisplayName,
        narratorDisplayIcon: string = narration.narratorDisplayIcon, narrationText: string = narration.content): void {
		narrationText = narration.getWhisperPrefixString() + narrationText;
		this.getGame().communicationHandler.mirrorWebhookNarrationInSpectateChannel(player, narration.action, narration, narratorDisplayName, narratorDisplayIcon, narrationText);
	}

	/**
	 * Mirrors the player's own narration in their spectate channel.
     *
	 * @param narration - The narration the player caused.
	 */
	#mirrorPlayersOwnNarration(narration: Narration): void {
		const webhookUsername = narration.player.displayName !== narration.player.name ? `${narration.narratorDisplayName} (${narration.player.name})` : narration.player.name;
		this.#mirrorMessageNarrationInSpectateChannel(narration.player, narration, webhookUsername, narration.narratorDisplayIcon);
	}

	/**
	 * Communicates the narration to players.
     *
	 * @param narration - The narration to be communicated.
	 * @param players - The players to communicate the narration to.
	 * @param narratorDisplayName - The custom display name of the narrator to use for the webhook, if the narration was created by a narrator.
	 * @param narratorDisplayIcon - The custom avatar URL of the narrator to use for the webhook, if the narration was created by a narrator.
	 * @param narrationText - The custom text of the narration to send. Optional.
	 */
	#communicateNarrationToPlayers(narration: Narration, players: Player[], narratorDisplayName?: string,
        narratorDisplayIcon?: string, narrationText?: string): void {
		for (const player of players) {
			if (narration.player && narration.player.name === player.name) {
				if (narration.isPlayerMessageType()) this.#mirrorPlayersOwnNarration(narration);
				else continue;
			}
			if (this.#playerCannotReceiveCommunications(narration, player)) continue;
			const mirrorNotificationInSpectateChannel = narration.narrator === undefined;
			if (this.#playerShouldReceiveNotification(narration, player))
				this.getGame().narrationHandler.sendNotification(player, narration.action, narration.content, narration.narrator ? MessageDisplayType.STANDARD : narration.messageDisplayType, mirrorNotificationInSpectateChannel, narration.attachments, [], narration.embeds);
			if (narration.narrator) this.#mirrorMessageNarrationInSpectateChannel(player, narration, narratorDisplayName, narratorDisplayIcon, narrationText);
			else this.#mirrorNarrationInSpectateChannel(player, narration, narrationText);
		}
	}

	/**
	 * Communicates the narration to its location.
     *
	 * @param narration - The narration to be communicated.
	 */
	#communicateNarrationToLocation(narration: Narration): void {
		if (narration.isInHidingSpot()) return;
		this.#communicateNarrationToPlayers(narration, narration.location.occupants.filter(occupant => !occupant.isHidden() || occupant.hasBehaviorAttribute("see room")));
		if (!narration.isModeratorNarration()) this.getGame().communicationHandler.narrateInRoom(narration, narration.content, false);
	}

	/**
	 * Communicates the narration to a whisper.
     *
	 * @param narration - The narration to be communicated.
	 */
	#communicateNarrationToWhisper(narration: Narration): void {
		if (!narration.whisper) return;
		this.#communicateNarrationToPlayers(narration, narration.whisper.players.map(player => player));
		if (!narration.isModeratorNarration()) this.getGame().communicationHandler.narrateInWhisper(narration, narration.content, false);
	}

	/**
	 * Communicates the narration in rooms with the `video monitoring` tag.
     *
	 * @param narration - The narration to be communicated.
	 */
	#communicateNarrationToVideoMonitoringRooms(narration: Narration): void {
		if (!narration.locationIsVideoSurveilled || narration.isInHidingSpot() || narration.action instanceof SayAction) return;
		const roomDisplayName = narration.location.getSurveilledDisplayName(true);
		const narrationHasNarrator = !!narration.narrator;
		const prefix = `[${roomDisplayName}] `;
		const narrationText = narrationHasNarrator ? `${narration.content}` : `\`${prefix}${narration.content}\``;
		for (const videoMonitoringRoom of narration.videoMonitoringRooms) {
			const webhookUsername = this.#assembleVideoSurveilledWebhookUsername(narration, prefix, narration.narratorDisplayName);
			this.#communicateNarrationToPlayers(narration, videoMonitoringRoom.occupants, webhookUsername, narration.narratorDisplayIcon, narrationText);
			if (narration.location.id !== videoMonitoringRoom.id) this.getGame().communicationHandler.narrateInRoom(narration, narrationText, false, videoMonitoringRoom, webhookUsername);
		}
	}
}
