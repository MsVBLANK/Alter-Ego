import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type Player from "../Player.js";

/**
 * Represents a text action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/text-action.html
 */
export default class TextAction extends Action {
	/**
	 * Performs a text action.
     *
	 * @param recipient - The player who will receive the text.
	 * @param messageText - The text content of the text message.
	 */
	performText(recipient: Player, messageText: string): void {
		if (this.performed) return;
		super.perform();
		const senderText = this.getGame().notificationGenerator.generateTextNotification(messageText, this.player.name, recipient.name);
		const recipientText = this.getGame().notificationGenerator.generateTextNotification(messageText, this.player.name);
		this.getGame().narrationHandler.sendNotification(this.player, this, senderText, MessageDisplayType.PLAIN_TEXT, true, this.message.attachments, [], this.message.embeds);
		this.getGame().narrationHandler.sendNotification(recipient, this, recipientText, MessageDisplayType.PLAIN_TEXT, true, this.message.attachments, [], this.message.embeds);
	}
}
