import Action from "../Data/Action.js";
import Player from "../Data/Player.js";
import Room from "../Data/Room.js";
import { MessageDisplayType } from "../Modules/enums.js";
import * as messageHandler from "../Modules/messageHandler.js";
import { capitalizeFirstLetter } from "../Modules/helpers.js";
import { Attachment, ChannelType, Collection, Embed, TextChannel } from "discord.js";
import Interactable from "./Interactables/Interactable.js";
import crypto from 'crypto';

/** @import Dialog from "../Data/Dialog.js" */
/** @import Game from "../Data/Game.js" */
/** @import GameEntity from "../Data/GameEntity.js" */
/** @import Narration from "../Data/Narration.js" */
/** @import Notification from "../Data/Notification.js" */
/** @import { Snowflake } from "discord.js" */

/**
 * @class GameCommunicationHandler
 * @classdesc An interface for the message handler. Contains a number of functions that ensure actions won't be communicated multiple times in the same channel.
 */
export default class GameCommunicationHandler {
	/**
	 * The game this belongs to.
	 * @readonly
	 * @type {Game}
	 */
	#game;
	/**
	 * A cache of recently-performed actions. This is used to ensure that actions are communicated only once in any given channel.
	 * @type {Collection<string, Action>}
	 */
	#actionCache;
	/**
	 * The maximum size of the actionCache.
	 * @readonly
	 */
	#actionCacheSizeLimit = 20;
	/**
	 * A collection of mirrored dialog messages to allow edits to dialog messages to be reflected in spectate channels.
	 * The key is the ID of the original message that's being mirrored.
	 * @type {Collection<string, DialogSpectateMirror[]>}
	 */
	#dialogSpectateMirrorCache;
	/**
	 * The maximum size of the dialogSpectateMirrorCache.
	 * @readonly
	 */
	#dialogSpectateMirrorCacheSizeLimit = 50;

	/**
	 * @constructor
	 * @param {Game} game - The game this belongs to.
	 */
	constructor(game) {
		this.#game = game;
		this.#actionCache = new Collection();
		this.#dialogSpectateMirrorCache = new Collection();
	}

	/**
	 * Returns the actionCache.
	 */
	getActionCache() {
		return this.#actionCache;
	}

	/**
	 * Adds an action to the cache. If the cache is at maximum capacity, removes the oldest one.
	 * @param {Action} action - The action to cache.
	 */
	#addActionToCache(action) {
		if (this.#actionCache.size >= this.#actionCacheSizeLimit)
			this.#actionCache.delete(this.#actionCache.firstKey());
		this.#actionCache.set(action.id, action);
	}

	/**
	 * Caches a channel for a given action.
	 * @param {Action} action - The action to cache a channel for.
	 * @param {string} channelId - The channel to cache.
	 */
	#cacheChannelFor(action, channelId) {
		if (this.#actionCache.has(action.id))
			this.#actionCache.get(action.id).addToMirrors(channelId);
		else {
			action.addToMirrors(channelId);
			this.#addActionToCache(action);
		}
	}

	/**
	 * Returns true if the action has already been communicated in the given channel.
	 * Also returns true if the channel does not exist (e.g. for a player with no spectate channel).
	 * @param {Messageable} channel - The channel to check for.
	 * @param {Action} action - The action to check for.
	 */
	#actionHasBeenCommunicatedInChannel(channel, action) {
		if (!channel) return true;
		return action.hasBeenCommunicatedIn(channel.id);
	}

	/**
	 * Adds the emojis in the given message to the emoji cache.
	 * @param {UserMessage} message - The message that initiated the cache.
	 */
	async cacheEmojis(message) {
		const application = this.#game.botContext.client.application
		const emojiRegex = /<(a?):([a-zA-Z0-9_]+):([0-9]+)>/g;
		/** @type {{animated: boolean, name: string, snowflake: string, hash: string}[]} */
		const emojiData = [];

		for (const match of message.content.matchAll(emojiRegex)) {
			const animated = match[0] === "a";
			const name = match[1];
			const snowflake = match[2];
			const hash = crypto.createHash('md5').update(`${name}:${snowflake}:${animated}`).digest('hex');
			emojiData.push({ animated: animated, name: name, snowflake: snowflake, hash: hash });
		}

		if (emojiData.length === 0) return;

		const appEmojis = (await application.emojis.fetch()).map(emoji => emoji.id);

		for (const data of emojiData) {
		  let shouldContinue = false;
			for (const emoji in appEmojis) if (emoji.endsWith(data.snowflake)) { shouldContinue = true; break };
			if (shouldContinue) continue;

			const url = `https://cdn.discordapp.com/emojis/${data.snowflake}${data.animated ? ".gif?animated=true" : ".png"}`
			const emoji = await fetch(url);
			const emojiBase64 = Buffer.from(await emoji.arrayBuffer()).toString("base64");
			await application.emojis.create({attachment: `data:image/${data.animated ? "gif" : "png"};base64,${emojiBase64}`, name: data.hash});
		}
	}

	/**
	 * Fetches the application emoji version of the given emoji
	 * @param {{animated: boolean, name: string, snowflake: string}} emoji - The message that initiated the cache.
	 */
	fetchCachedEmoji(emoji) {
		const application = this.#game.botContext.client.application
		const hash = crypto.createHash('md5').update(`${emoji.name}:${emoji.snowflake}:${emoji.animated}`).digest('hex');

		return application.emojis.cache.find(emoji => emoji.name === hash);
	}

	/**
	 * Replaces custom emojis in the input with application cached emojis
	 * @param {string} text - The body of text to replace emojis in.
	 */
	replaceEmoji(text) {
		const emojiRegex = /<(a?):([a-zA-Z0-9_]+):([0-9]+)>/g;

		return text.replace(emojiRegex, (match, g1, g2, g3) => {
			const animated = g1 === "a";
			const name = g2;
			const snowflake = g3;
			const emoji = this.fetchCachedEmoji({ animated: animated, name: name, snowflake: snowflake });
			if (emoji) {
			  return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
			} else return match;
		});
	}

	/**
	 * Adds the message to the dialog cache.
	 * @param {UserMessage} message - The message that initiated the dialog.
	 */
	cacheDialog(message) {
		if (this.#dialogSpectateMirrorCache.size >= this.#dialogSpectateMirrorCacheSizeLimit)
			this.#dialogSpectateMirrorCache.delete(this.#dialogSpectateMirrorCache.firstKey());
		this.#dialogSpectateMirrorCache.set(message.id, []);
	}

	/**
	 * Adds a spectate mirror to the dialog cache for the given message.
	 * @param {UserMessage} message - The message being mirrored.
	 * @param {Snowflake} mirrorMessageId - The message ID of the spectate mirror.
	 * @param {Snowflake} mirrorWebhookId - The ID of the webhook that sent the spectate mirror.
	 */
	cacheSpectateMirrorForDialog(message, mirrorMessageId, mirrorWebhookId) {
		const spectateMirrors = this.getDialogSpectateMirrors(message);
		if (spectateMirrors) spectateMirrors.push({ messageId: mirrorMessageId, webhookId: mirrorWebhookId });
	}

	/**
	 * Returns the list of spectate mirrors for the given dialog message.
	 * If the given dialog message isn't cached, returns undefined.
	 * @param {UserMessage|import('discord.js').PartialMessage} message - The message that was mirrored.
	 */
	getDialogSpectateMirrors(message) {
		return this.#dialogSpectateMirrorCache.get(message.id);
	}

	/**
	 * Replies to a message. This is usually done when a user has sent a message with an error.
	 * @param {UserMessage} message - The message to reply to.
	 * @param {string} messageText - The text of the message to send in response.
	 */
    reply(message, messageText) {
        let member = this.#game.guildContext.guild.members.resolve(message.author.id);
        if (member && member.roles.cache.has(this.#game.guildContext.moderatorRole.id) && message.channel.id !== this.#game.guildContext.commandChannel.id && message.channel.type !== ChannelType.DM) {
            messageHandler.sendGameMechanicMessage(this.#game, this.#game.guildContext.commandChannel, `<@${message.author.id}>, ${messageText}`);
        } else {
            messageHandler.sendReply(this.#game, message, messageText);
        }
	}

	/**
	 * Sends a message to the command channel.
	 * @param {string} messageText - The text of the message to send.
	 */
	sendToCommandChannel(messageText) {
		messageHandler.sendGameMechanicMessage(this.#game, this.#game.guildContext.commandChannel, messageText);
	}

	/**
	 * Sends a message to a player without any checks.
	 * @param {Player} player - The player to send the message to.
	 * @param {string} messageText - The text of the message to send.
	 * @param {boolean} [mirrorInSpectateChannel] - Whether or not to mirror the notification in their spectate channel. Defaults to true.
	 * @param {MessageDisplayType} [messageType] - The type of message to send. Defaults to PLAIN_TEXT.
	 * @param {Collection<string, Attachment>} [attachments] - The attachments to send. Optional.
	 * @param {Interactable[]} interactables - An array of interactables.
	 */
	sendMessageToPlayer(player, messageText, mirrorInSpectateChannel = true, messageType = MessageDisplayType.PLAIN_TEXT, attachments, interactables = []) {
		if (messageText !== "")
			messageHandler.sendNotification(player, messageText, messageType, mirrorInSpectateChannel, attachments, interactables)
	}

	/**
	 * Sends a description to a player without any checks.
	 * @param {Player} player - The player to send the notification to.
	 * @param {string} descriptionString - The already parsed description.
	 * @param {GameEntity} container - The game entity the description belongs to.
	 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send. Defaults to PLAIN_TEXT. Does nothing when sending a room description.
	 * @param {boolean} [mirrorInSpectateChannel] - Whether or not to mirror the room description in their spectate channel. Defaults to true.
	 * @param {Interactable[]} interactables[] - An array of interactables to send with the message.
	 */
	sendDescriptionToPlayer(player, descriptionString, container, messageDisplayType = MessageDisplayType.PLAIN_TEXT, mirrorInSpectateChannel = true, interactables = []) {
		this.sendMessageToPlayer(player, descriptionString, mirrorInSpectateChannel, messageDisplayType, new Collection(), interactables);
	}

	/**
     * Sends an already-parsed room description to the player.
	 * @param {Player} player - The player to send the description to.
	 * @param {Room} room - The room the description belongs to.
     * @param {string} roomDescriptionString - The already parsed room description.
     * @param {string} occupantsString - A list of occupants in the room.
     * @param {string} defaultDropFixtureString - A string to describe the default drop fixture in this room.
     * @param {Interactable[]} [interactables] - An array of interactables to send with the message.
     */
	sendRoomDescriptionToPlayer(player, room, roomDescriptionString, occupantsString, defaultDropFixtureString, interactables = []) {
		messageHandler.sendRoomDescription(player, room, roomDescriptionString, occupantsString, defaultDropFixtureString, true, interactables);
	}

	/**
	 * Sends a notification to a player.
	 * @param {Notification} notification - The text of the notification to send.
	 */
	notifyPlayer(notification) {
		if (!this.#actionHasBeenCommunicatedInChannel(notification.player.notificationChannel, notification.action)) {
			this.#cacheChannelFor(notification.action, notification.player.notificationChannel.id);
			this.sendMessageToPlayer(notification.player, notification.content, false, notification.messageDisplayType);
			if (notification.mirrorInSpectateChannel)
				this.mirrorNarrationInSpectateChannel(notification.player, notification.action, notification.messageDisplayType, notification.content, notification.attachments.map(attachment => attachment.url));
		}
	}

	/**
	 * Mirrors dialog in a player's spectate channel.
	 * @param {Player} player - The player whose spectate channel this dialog will be mirrored in.
	 * @param {Action} action - The action associated with the dialog.
	 * @param {Dialog} dialog - The dialog that was spoken.
	 * @param {string} [webhookUsername] - The username to use for the mirrored webhook message. Defaults to the dialog speaker's display name.
	 * @param {string} [webhookAvatarURL] - The avatar URL to use for the mirrored webhook message. Defaults to the dialog speaker's display icon.
	 * @param {string} [messageText] - The text of the message to send. Defaults to the content of the dialog.
	 * @param {string} [notification] - A custom notification that will be sent to the player afterwards. Optional. This notification will not be mirrored in the spectate channel.
	 */
	mirrorDialogInSpectateChannel(player, action, dialog, webhookUsername = capitalizeFirstLetter(dialog.speakerDisplayName), webhookAvatarURL = dialog.speakerDisplayIcon, messageText = dialog.content, notification) {
		if (!this.#actionHasBeenCommunicatedInChannel(player.spectateChannel, action)) {
			this.#cacheChannelFor(action, player.spectateChannel.id);
			if (!dialog.isOOCMessage) messageHandler.sendWebhookSpectateMessage(player, this.replaceEmoji(messageText), webhookUsername, webhookAvatarURL, dialog.embeds, dialog.attachments.map(attachment => attachment.url), dialog.message);
			if (notification) this.#game.narrationHandler.sendNotification(player, action, notification, MessageDisplayType.PLAIN_TEXT, false);
		}
	}

	/**
	 * Mirrors a message in a player's spectate channel.
	 * @param {Player} player - The player whose spectate channel this message is being sent to.
	 * @param {Action} action - The action associated with the message.
	 * @param {string} webhookUsername - The username to use for the mirrored webhook message.
	 * @param {string} webhookAvatarURL - The avatar URL to use for the mirrored webhook message.
	 * @param {string} messageText - The text of the message to send.
	 * @param {MessageDisplayType} messageDisplayType - The type of message to send.
	 * @param {Embed[]} [embeds] - An array of embeds to send in the message. Optional.
	 * @param {string[]} [files] - An array of URLs to send as attachments. Optional.
	 * @param {UserMessage} [message] - The message being mirrored. Optional.
	 */
	mirrorWebhookMessageInSpectateChannel(player, action, webhookUsername, webhookAvatarURL, messageText, messageDisplayType, embeds, files, message) {
		if (!this.#actionHasBeenCommunicatedInChannel(player.spectateChannel, action)) {
			this.#cacheChannelFor(action, player.spectateChannel.id);
			messageHandler.sendWebhookSpectateMessage(player, this.replaceEmoji(messageText), webhookUsername, webhookAvatarURL, embeds, files, message, messageDisplayType);
		}
	}

	/**
	 * Mirrors a narration in a player's spectate channel.
	 * @param {Player} player - The player whose spectate channel this narration will be mirrored in.
	 * @param {Action} action - The action associated with the narration.
	 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
	 * @param {string} narrationText - The text of the narration to send.
	 * @param {string[]} [files] - An array of URLs to send as attachments. Optional.
	 */
	mirrorNarrationInSpectateChannel(player, action, messageDisplayType, narrationText, files) {
		if (!this.#actionHasBeenCommunicatedInChannel(player.spectateChannel, action)) {
			this.#cacheChannelFor(action, player.spectateChannel.id);
			messageHandler.sendNarrationSpectateMessage(player, this.replaceEmoji(narrationText), messageDisplayType, files);
		}
	}

	/**
	 * Mirrors a narration in a player's spectate channel as a webhook message.
	 * @param {Player} player - The player whose spectate channel this narration will be mirrored in.
	 * @param {Action} action - The action associated with the narration.
	 * @param {Narration} narration - The narration that was written.
	 * @param {string} webhookUsername - A custom username to use for the webhook that will send the spectate message.
	 * @param {string} webhookAvatarURL - A custom avatar URL to use for the webhook that will send the spectate message.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 */
	mirrorWebhookNarrationInSpectateChannel(player, action, narration, webhookUsername, webhookAvatarURL, narrationText = narration.content) {
		if (narration.isOOCMessage) return;
		this.mirrorWebhookMessageInSpectateChannel(player, action, webhookUsername, webhookAvatarURL, this.replaceEmoji(narrationText), narration.messageDisplayType, narration.embeds, narration.attachments.map(attachment => attachment.url), narration.message);
	}

	/**
	 * Sends a narration to a room channel and mirrors it in the spectate channels of all of the room's occupants.
	 * @param {Narration} narration - The narration to send.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 * @param {boolean} [mirrorInSpectateChannel] - Whether or not to mirror the notification in spectate channels. Defaults to true.
	 * @param {Room} [room] - The room to send the narration to. Defaults to the location of the narration.
	 * @param {string} [webhookUsername] - The username to use for the narrated webhook message, if applicable.
	 */
	narrateInRoom(narration, narrationText = narration.content, mirrorInSpectateChannel = true, room = narration.location, webhookUsername) {
		if (!narration.action || !this.#actionHasBeenCommunicatedInChannel(room.channel, narration.action)) {
			if (narration.action) this.#cacheChannelFor(narration.action, room.channel.id);
			messageHandler.sendNarrationToRoom(room, narration, this.replaceEmoji(narrationText), narration.messageDisplayType, mirrorInSpectateChannel, narration.player, webhookUsername);
		}
	}

	/**
	 * Sends a narration to a whisper channel and mirrors it in the spectate channels of all the whisper's players.
	 * @param {Narration} narration - The narration to send.
	 * @param {string} [narrationText] - The custom text of the narration to send. Optional.
	 * @param {boolean} [mirrorInSpectateChannel] - Whether or not to mirror the notification in spectate channels. Defaults to true.
	 */
	narrateInWhisper(narration, narrationText = narration.content, mirrorInSpectateChannel = true) {
		if (!narration.action || !this.#actionHasBeenCommunicatedInChannel(narration.whisper.channel, narration.action)) {
			if (narration.action) this.#cacheChannelFor(narration.action, narration.whisper.channel.id);
			messageHandler.sendNarrationToWhisper(narration.whisper, narration, this.replaceEmoji(narrationText), narration.getWhisperPrefixString(), narration.messageDisplayType, mirrorInSpectateChannel);
		}
	}

	/**
	 * Sends the help menu for a command.
	 * @param {UserMessage} message - The message that sent the help command.
	 * @param {Command} command - The command to send the help menu for.
	 */
	sendCommandHelp(message, command) {
		const channel = command.config.usableBy === "Moderator" ? this.#game.guildContext.commandChannel : message.author.dmChannel;
		messageHandler.sendCommandHelp(this.#game, channel, command);
	}

	/**
	 * Sends a message to the log channel.
	 * @param {string} logText - The message of the text to send.
	 */
	sendLogMessage(logText) {
		messageHandler.sendLogMessage(this.#game, logText);
	}

	/**
	 * Sends dialog as a webhook message to the specified channel.
	 * @param {Dialog} dialog - The dialog to send.
	 * @param {TextChannel} channel - The channel to send the webhook message to.
	 * @param {string} [webhookUsername] - A custom username to use for the webhook that will send the spectate message. Optional.
	 * @param {string} [webhookAvatarURL] - A custom avatar URL to use for the webhook that will send the spectate message. Optional.
	 * @returns The created webhook message.
	 */
	async sendDialogAsWebhook(channel, dialog, webhookUsername = dialog.speakerDisplayName, webhookAvatarURL = dialog.speakerDisplayIcon) {
		const webhook = await messageHandler.getOrCreateWebhook(channel);
		const webhookMessage = await messageHandler.sendWebhookMessage(
			webhook,
			dialog.content,
			webhookUsername,
			webhookAvatarURL,
			dialog.embeds,
			dialog.attachments.map(attachment => attachment.url),
			dialog.getGame(),
			MessageDisplayType.PLAIN_TEXT,
			dialog.speaker
		);
		return webhookMessage;
	}
}
