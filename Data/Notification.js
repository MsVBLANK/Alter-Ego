import Interactable from "../Classes/Interactables/Interactable.ts";
import GameConstruct from "./GameConstruct.ts";
import { MessageDisplayType } from "../Modules/enums.js";
import { Attachment, Collection, Embed } from "discord.js";

/** @import Action from "./Action.ts"; */
/** @import Game from "./Game.js"; */
/** @import Player from "./Player.js"; */

/**
 * @class Notification
 * @classdesc Represents a notification to send to a player in the game.
 * @extends GameConstruct
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/notification.html
 */
export default class Notification extends GameConstruct {
	/**
	 * The player the notification is intended for.
	 * @readonly
	 * @type {Player}
	 */
	player;
	/**
     * The display type of the message to send for this notification.
     * @readonly
     * @type {MessageDisplayType}
     */
    messageDisplayType;
	/**
     * The action associated with this notification.
     * @readonly
     * @type {Action}
     */
    action;
	/**
     * The text content for the notification.
     * @type {string}
     */
	content;
	/**
	 * Whether or not to mirror the notification in the player's spectate channel.
	 * @type {boolean}
	 */
	mirrorInSpectateChannel;
	/**
	 * A collection of attachments sent with the original message.
	 * @type {Collection<string, Attachment>}
	 */
	attachments;
	/**
	 * An array of embeds sent with the original message.
	 * @type {Embed[]}
	 */
	embeds;
	/**
	 * An array of interactables to send with the notification.
	 * @type {Interactable[]}
	 */
	interactables;

	/**
	 * @constructor
     * @param {Game} game - The game this is for.
	 * @param {Player} player - The player the notification is intended for.
	 * @param {Action} action - The action associated with this notification.
	 * @param {string} content - The text content for the narration.
	 * @param {MessageDisplayType} [messageDisplayType] - The display type of the message to send for this notification. Defaults to PLAIN_TEXT.
	 * @param {boolean} [mirrorInSpectateChannel] - Whether or not to mirror the notification in the player's spectate channel. Defaults to true.
	 * @param {Collection<string, Attachment>} [attachments] - The attachments to send. Optional.
	 * @param {Interactable[]} [interactables] - An array of interactables to send in the message. Optional.
	 * @param {Embed[]} [embeds] - An array of embeds to send in the message. Optional.
	 */
	constructor(game, player, action, content, messageDisplayType = MessageDisplayType.PLAIN_TEXT, mirrorInSpectateChannel = true, attachments = new Collection(), interactables = [], embeds = []) {
		super(game);
		this.player = player;
		this.action = action;
		this.content = content;
		this.messageDisplayType = messageDisplayType;
		this.mirrorInSpectateChannel = mirrorInSpectateChannel;
		this.attachments = attachments;
		this.embeds = embeds;
		this.interactables = interactables;
	}
}
