import Action from "../Action.js";
import SolveAction from "./SolveAction.js";
import { MessageDisplayType } from "../../Modules/enums.js";
import { capitalizeFirstLetter } from "../../Modules/helpers.js";

/** @typedef {import("../Dialog.js").default} Dialog */
/** @typedef {import("../Player.js").default} Player */
/** @typedef {import("../Puzzle.js").default} Puzzle */
/** @typedef {import("../Room.js").default} Room */

/**
 * @class SayAction
 * @classdesc Represents a say action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/say-action.html
 */
export default class SayAction extends Action {
	/**
	 * An array of all voice-type puzzles in the game. This will be accessed several times, so it's stored here to avoid iterating through the full list of puzzles repeatedly.
	 * @type {Puzzle[]}
	 */
	#voicePuzzles;

	/**
	 * Performs a say action.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	performSay(dialog) {
		if (this.performed) return;
		super.perform();
		this.#voicePuzzles = this.getGame().entityFinder.getPuzzles(undefined, undefined, "voice");
		if (dialog.whisper) this.#communicateWhisperedDialog(dialog);
		this.#communicateDialogToRoomOccupants(dialog);
		// If the dialog is an OOC message or took place in a whisper, the rest of the functions don't need to be called.
		if (dialog.isOOCMessage || dialog.whisper) return;
		this.#solveVoicePuzzles(dialog.location, dialog);
		this.#communicateDialogToNeighboringRooms(dialog);
		this.#communicateDialogToAudioMonitoringRooms(dialog);
		this.#communicateDialogToReceivers(dialog);
	}

	/**
	 * Sends the dialog to the given player's spectate channel as a webhook message.
	 * @param {Player} player - The player whose spectate channel this message is being sent to.
	 * @param {Dialog} dialog - The dialog to mirror.
	 * @param {string} [messageTextPrefix] - The text to insert before the contents of the rest of the message. Optional.
	 * @param {string} [webhookUsername] - The username to use for the mirrored webhook message. If none is specified, the speaker's current displayName will be used.
	 * @param {string} [webhookAvatarURL] - The avatar URL to use for the mirrored webhook message. If none is specified, the speaker's current displayIcon will be used.
	 * @param {string} [notification] - A custom notification that will be sent to the player afterwards. Optional. This notification will not be mirrored in the spectate channel.
	 */
	#mirrorDialogInSpectateChannel(player, dialog, messageTextPrefix = "", webhookUsername = capitalizeFirstLetter(dialog.speakerDisplayName), webhookAvatarURL = dialog.speakerDisplayIcon, notification) {
		const messageText = messageTextPrefix + dialog.content;
		this.getGame().communicationHandler.mirrorDialogInSpectateChannel(player, this, dialog, webhookUsername, webhookAvatarURL, messageText, notification);
	}

	/**
	 * Mirrors the player's own dialog in their spectate channel.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#mirrorPlayersOwnDialog(dialog) {
		const webhookUsername = dialog.speaker.displayName !== dialog.speaker.name ? `${capitalizeFirstLetter(dialog.speaker.displayName)} (${dialog.speaker.name})` : undefined;
		this.#mirrorDialogInSpectateChannel(dialog.speaker, dialog, dialog.getWhisperPrefixStringForWebhook(true), webhookUsername);
	}

	/**
	 * Returns true if the given player is unable to receive communications.
	 * @param {Player} player 
	 */
	#playerCannotReceiveCommunications(player) {
		return player.isNPC || !player.canHear() || !player.isConscious();
	}

	/**
	 * Returns true if the player notification should be sent to the spectate channel instead of a webhook.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {Player} player - The player hearing the dialog.
	 * @param {boolean} playerCanSeeSpeaker - Whether or not the player can see the speaker.
	 */
	#playerNotificationTakesPriority(dialog, player, playerCanSeeSpeaker) {
		return !player.canSee() || !dialog.isOOCMessage && dialog.isMimicking(player)/* || player.hasBehaviorAttribute("hear room") && !player.knows(dialog.speakerRecognitionName) && !playerCanSeeSpeaker*/;
	}

	/**
	 * Returns true if a player should be notified of dialog that's already being narrated in the room they're in.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {Player} player - The player hearing the dialog.
	 * @param {boolean} playerCanSeeSpeaker - Whether or not the player can see the speaker.
	 */
	#playerShouldReceiveNotification(dialog, player, playerCanSeeSpeaker) {
		return player.hasBehaviorAttribute("hear room") || !dialog.isOOCMessage && (dialog.isMimicking(player) || player.knows(dialog.speakerRecognitionName) && (!playerCanSeeSpeaker || dialog.speakerDisplayNameIsDifferent));
	}

	/**
	 * Returns a custom username to use for the webhook that will mirror dialog. If no custom username should be set, returns undefined.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {Player} [player] - The player hearing the dialog. Optional.
	 * @param {boolean} [playerCanSeeSpeaker] - Whether or not the player can see the speaker. Optional.
	 */
	#generateWebhookUsername(dialog, player, playerCanSeeSpeaker) {
		if (player.knows(dialog.speakerRecognitionName) && playerCanSeeSpeaker && dialog.speakerDisplayNameIsDifferent)
			return `${dialog.getDisplayNameForWebhook(playerCanSeeSpeaker)} (${dialog.speakerRecognitionName})`;
		else if (player.knows(dialog.speakerRecognitionName) && !playerCanSeeSpeaker)
			return `${capitalizeFirstLetter(dialog.speakerRecognitionName)}`;
		else if (player.canSee() && !player.knows(dialog.speakerRecognitionName) && !playerCanSeeSpeaker)
			return `${dialog.getDisplayNameForWebhook(playerCanSeeSpeaker)}`;
		return undefined;
	}
	
	/**
	 * Returns a custom username for webhooks that are mirroring dialog spoken in rooms with the `audio surveilled` tag.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {string} prefix - A prefix to apply to the beginning of the webhook username. A space will be added before the rest of the username. 
	 * @param {string} [webhookUsername] - A custom username to use for the webhook without the prefix. Optional.
	 */
	#assembleAudioSurveilledWebhookUsername(dialog, prefix, webhookUsername = dialog.getDisplayNameForWebhook(false)) {
		return `${prefix} ${webhookUsername}`;
	}

	/**
	 * Tries to solve any voice puzzles in the given room.
	 * @param {Room} location - The room to filter the voice puzzles to.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#solveVoicePuzzles(location, dialog) {
		for (const puzzle of this.#voicePuzzles) {
			if (puzzle.location.id === location.id) {
				for (const solution of puzzle.solutions) {
					if (dialog.cleanContent.includes(solution)) {
						const player = dialog.speaker.location.id === location.id ? dialog.speaker : undefined;
						const solveAction = new SolveAction(this.getGame(), undefined, player, location, this.forced, this.whisper);
						solveAction.performSolve(puzzle, solution);
					}
				}
			}
		}
	}

	/**
	 * Narrates the dialog in the specified location and solves any voice puzzles in that room.
	 * @param {Room} location - The room in which to narrate and solve puzzles. 
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {string} narrationText - The text to narrate.
	 */
	#narrateDialogAndSolveVoicePuzzles(location, dialog, narrationText) {
		if (dialog.isOOCMessage) return;
		if (location.isAudioMonitoring() && location.isVideoMonitoring() && dialog.locationIsAudioSurveilled && dialog.locationIsVideoSurveilled) {
			const webhookUsername = this.#assembleAudioSurveilledWebhookUsername(dialog, `[${dialog.location.getSurveilledDisplayName(location.isVideoMonitoring())}]`);
			this.getGame().communicationHandler.sendDialogAsWebhook(location.channel, dialog, webhookUsername, dialog.getDisplayIconForWebhook(false));
		}
		else
			this.getGame().narrationHandler.narrateSay(this, dialog, location, narrationText);
		this.#solveVoicePuzzles(location, dialog);
	}

	/**
	 * Communicates whispered dialog to players in the whisper.
	 * @param {Dialog} dialog - The dialog that was spoken. 
	 */
	#communicateWhisperedDialog(dialog) {
		for (const player of dialog.whisper.playersCollection.values()) {
			if (dialog.speaker.name === player.name) {
				this.#mirrorPlayersOwnDialog(dialog);
				continue;
			}
			if (this.#playerCannotReceiveCommunications(player)) continue;
			const playerCanSeeSpeaker = player.canSee() && player.member.permissionsIn(dialog.whisper.channel).has('ViewChannel');
			const webhookContentPrefix = dialog.getWhisperPrefixStringForWebhook(playerCanSeeSpeaker);
			const webhookUsername = this.#generateWebhookUsername(dialog, player, playerCanSeeSpeaker);
			const webhookAvatarURL = dialog.getDisplayIconForWebhook(playerCanSeeSpeaker);
			const notification = this.getGame().notificationGenerator.generateHearWhisperNotification(dialog, player);
			if (this.#playerNotificationTakesPriority(dialog, player, playerCanSeeSpeaker)) {
				this.getGame().communicationHandler.notifyPlayer(player, this, notification, MessageDisplayType.PLAIN_TEXT, !dialog.isOOCMessage);
				continue;
			}
			if (!dialog.isOOCMessage && webhookUsername)
				this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix, webhookUsername, webhookAvatarURL, notification);
			else this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix);
		}
	}

	/**
	 * Communicates dialog to players in the room.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#communicateDialogToRoomOccupants(dialog) {
		for (const player of dialog.location.occupants) {
			if (dialog.speaker.name === player.name) {
				this.#mirrorPlayersOwnDialog(dialog);
				continue;
			}
			if (this.#playerCannotReceiveCommunications(player)) continue;
			const playerAndSpeakerAreHidingTogether = dialog.speaker.isHidden() && player.isHidden() && dialog.speaker.hidingSpot === player.hidingSpot;
			const playerCanSeeSpeaker = player.canSee() && (!dialog.speaker.isHidden() || playerAndSpeakerAreHidingTogether);
			const webhookContentPrefix = dialog.getWhisperPrefixStringForWebhook(playerCanSeeSpeaker);
			const webhookUsername = this.#generateWebhookUsername(dialog, player, playerCanSeeSpeaker);
			const webhookAvatarURL = dialog.getDisplayIconForWebhook(playerCanSeeSpeaker);
			// Players with the acute hearing attribute should overhear other whispers.
			if (dialog.whisper) {
				if (!dialog.isOOCMessage && player.hasBehaviorAttribute("acute hearing") && !dialog.whisper.playersCollection.has(player.name)) {
					const notification = this.getGame().notificationGenerator.generateAcuteHearingPlayerOverhearWhisperNotification(dialog, player);
					if (this.#playerNotificationTakesPriority(dialog, player, playerCanSeeSpeaker)) {
						this.getGame().communicationHandler.notifyPlayer(player, this, notification);
						continue;
					}
					this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix, webhookUsername, webhookAvatarURL, notification);
				}
				continue;
			}

			if (this.#playerNotificationTakesPriority(dialog, player, playerCanSeeSpeaker)) {
				const notification = this.getGame().notificationGenerator.generateHearDialogNotification(dialog, player);
				this.getGame().communicationHandler.notifyPlayer(player, this, notification, MessageDisplayType.PLAIN_TEXT, !dialog.isOOCMessage);
				continue;
			}
			const notification = this.#playerShouldReceiveNotification(dialog, player, playerCanSeeSpeaker) ? this.getGame().notificationGenerator.generateHearDialogNotification(dialog, player) : "";
			if (webhookUsername || notification)
				this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix, webhookUsername, webhookAvatarURL, notification);
			else this.#mirrorDialogInSpectateChannel(player, dialog);
		}
	}

	/**
	 * Communicates dialog to rooms neighboring the room it was spoken in.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#communicateDialogToNeighboringRooms(dialog) {
		if (dialog.isShouted) {
			// If any neighboring rooms have the `audio surveilled` tag, the audible dialog needs to be communicated to any `audio monitoring` rooms.
			for (const neighboringAudioSurveilledRoom of dialog.neighboringAudioSurveilledRooms.values()) {
				for (const audioMonitoringRoom of dialog.audioMonitoringRooms.values()) {
					for (const player of audioMonitoringRoom.occupants) {
						if (this.#playerCannotReceiveCommunications(player)) continue;
						if (this.#playerShouldReceiveNotification(dialog, player, false)) {
							const neighboringRoomDisplayName = neighboringAudioSurveilledRoom.getSurveilledDisplayName(audioMonitoringRoom.isVideoMonitoring() && player.canSee());
							const notification = this.getGame().notificationGenerator.generateHearAudioSurveilledNeighboringRoomDialogNotification(neighboringRoomDisplayName, dialog, player);
							this.getGame().communicationHandler.notifyPlayer(player, this, notification);
						}
					}
					const neighboringRoomDisplayName = neighboringAudioSurveilledRoom.getSurveilledDisplayName(audioMonitoringRoom.isVideoMonitoring());
					this.#narrateDialogAndSolveVoicePuzzles(audioMonitoringRoom, dialog, this.getGame().notificationGenerator.generateHearAudioSurveilledNeighboringRoomDialogNotification(neighboringRoomDisplayName, dialog));
				}
			}
		}
		// Communicate dialog to neighboring rooms.
		for (const neighboringRoom of dialog.neighboringRooms.values()) {
			for (const player of neighboringRoom.occupants) {
				if (this.#playerCannotReceiveCommunications(player)) continue;
				if (player.hasBehaviorAttribute("acute hearing") || dialog.isShouted && this.#playerShouldReceiveNotification(dialog, player, false)) {
					const notification = this.getGame().notificationGenerator.generateHearNeighboringRoomDialogNotification(dialog, player);
					this.getGame().communicationHandler.notifyPlayer(player, this, notification);
				}
			}
			if (dialog.isShouted)
				this.#narrateDialogAndSolveVoicePuzzles(neighboringRoom, dialog, this.getGame().notificationGenerator.generateHearNeighboringRoomDialogNotification(dialog));
		}
	}

	/**
	 * Communicates dialog to rooms with the `audio monitoring` tag.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#communicateDialogToAudioMonitoringRooms(dialog) {
		if (!dialog.locationIsAudioSurveilled) return;
		for (const audioMonitoringRoom of dialog.audioMonitoringRooms.values()) {
			for (const player of audioMonitoringRoom.occupants) {
				if (this.#playerCannotReceiveCommunications(player)) continue;
				const roomDisplayName = dialog.location.getSurveilledDisplayName(audioMonitoringRoom.isVideoMonitoring() && player.canSee());
				const monitoringRoomCanSeeSurveilledRoom = audioMonitoringRoom.isVideoMonitoring() && dialog.locationIsVideoSurveilled;
				const playerCanSeeSpeaker = player.canSee() && monitoringRoomCanSeeSurveilledRoom && !dialog.speaker.isHidden();
				const webhookContentPrefix = dialog.getWhisperPrefixStringForWebhook(playerCanSeeSpeaker);
				const notification = this.getGame().notificationGenerator.generateHearAudioSurveilledRoomDialogNotification(roomDisplayName, dialog, player);
				if (this.#playerNotificationTakesPriority(dialog, player, playerCanSeeSpeaker)) {
					this.getGame().communicationHandler.notifyPlayer(player, this, notification);
					continue;
				}
				const customWebhookUsername = this.#generateWebhookUsername(dialog, player, playerCanSeeSpeaker);
				const webhookUsername = this.#assembleAudioSurveilledWebhookUsername(dialog, `[${roomDisplayName}]`, customWebhookUsername);
				const webhookAvatarURL = dialog.getDisplayIconForWebhook(playerCanSeeSpeaker);
				const playerShouldReceiveNotification = this.#playerShouldReceiveNotification(dialog, player, playerCanSeeSpeaker);
				if (monitoringRoomCanSeeSurveilledRoom && playerShouldReceiveNotification)
					this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix, webhookUsername, webhookAvatarURL, notification);
				else if (monitoringRoomCanSeeSurveilledRoom)
					this.#mirrorDialogInSpectateChannel(player, dialog, webhookContentPrefix, webhookUsername, webhookAvatarURL);
				else if (playerShouldReceiveNotification)
					this.getGame().communicationHandler.notifyPlayer(player, this, notification);
			}
			const roomDisplayName = dialog.location.getSurveilledDisplayName(audioMonitoringRoom.isVideoMonitoring());
			this.#narrateDialogAndSolveVoicePuzzles(audioMonitoringRoom, dialog, this.getGame().notificationGenerator.generateHearAudioSurveilledRoomDialogNotification(roomDisplayName, dialog));
		}
	}

	/**
	 * Communicates dialog to players with the `receiver` behavior attribute.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 */
	#communicateDialogToReceivers(dialog) {
		for (const [receiverPlayerName, receiverItem] of dialog.receivers) {
			const receiverPlayer = this.getGame().entityFinder.getLivingPlayer(receiverPlayerName);
			for (const player of receiverPlayer.location.occupants) {
				if (this.#playerCannotReceiveCommunications(player)) continue;
				if (this.#playerShouldReceiveNotification(dialog, player, false)) {
					const notification = this.getGame().notificationGenerator.generateHearReceiverDialogNotification(dialog, player, receiverItem.player.name === player.name, receiverItem.name);
					this.getGame().communicationHandler.notifyPlayer(player, this, notification);
				}
			}
			this.#narrateDialogAndSolveVoicePuzzles(receiverPlayer.location, dialog, this.getGame().notificationGenerator.generateHearReceiverDialogNotification(dialog, receiverPlayer, false, receiverItem.name));
		}
	}
}