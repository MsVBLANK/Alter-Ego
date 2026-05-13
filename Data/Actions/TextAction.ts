import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type Player from "../Player.ts";

/**
 * Represents a text action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#text-action
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
		this.getGame().narrationHandler.sendNotification(this.player, this, senderText, MessageDisplayType.PLAIN_TEXT, true, this.message.attachments, [], this.message.embeds, true);
		this.getGame().narrationHandler.sendNotification(recipient, this, recipientText, MessageDisplayType.PLAIN_TEXT, true, this.message.attachments, [], this.message.embeds, true);
        this.successMessage = `Successfully texted ${recipient.name} for ${this.player.name}.`;
	}
}
