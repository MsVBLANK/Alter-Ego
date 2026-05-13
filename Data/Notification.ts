import { Attachment, Collection, Embed } from "discord.js";
import Interactable from "../Classes/Interactables/Interactable.ts";
import { MessageDisplayType } from "../Modules/enums.js";
import type Action from "./Action.ts";
import type Game from "./Game.ts";
import GameConstruct from "./GameConstruct.ts";
import type Player from "./Player.ts";

/**
 * Represents a notification to send to a player in the game.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/notification.html
 */
export default class Notification extends GameConstruct {
	/**
	 * The player the notification is intended for.
	 */
	readonly player: Player;
	/**
     * The display type of the message to send for this notification.
     */
    readonly messageDisplayType: MessageDisplayType;
	/**
     * The action associated with this notification.
     */
    readonly action: Action;
	/**
     * The text content for the notification.
     */
	content: string;
	/**
	 * Whether or not to mirror the notification in the player's spectate channel.
	 */
	mirrorInSpectateChannel: boolean;
	/**
	 * A collection of attachments sent with the original message.
	 */
	attachments: Collection<string, Attachment>;
	/**
	 * An array of embeds sent with the original message.
	 */
	embeds: Embed[];
	/**
	 * An array of interactables to send with the notification.
	 */
	interactables: Interactable[];

	/**
     * @param game - The game this is for.
	 * @param player - The player the notification is intended for.
	 * @param action - The action associated with this notification.
	 * @param content - The text content for the narration.
	 * @param messageDisplayType - The display type of the message to send for this notification. Defaults to PLAIN_TEXT.
	 * @param mirrorInSpectateChannel - Whether or not to mirror the notification in the player's spectate channel. Defaults to true.
	 * @param attachments - The attachments to send. Optional.
	 * @param interactables - An array of interactables to send in the message. Optional.
	 * @param embeds - An array of embeds to send in the message. Optional.
	 */
	constructor(game: Game, player: Player, action: Action, content: string,
        messageDisplayType: MessageDisplayType = MessageDisplayType.PLAIN_TEXT, mirrorInSpectateChannel: boolean = true,
        attachments: Collection<string, Attachment> = new Collection(), interactables: Interactable[] = [], embeds: Embed[] = []) {
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
