import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";

/**
 * Represents a monolog action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/monolog-action.html
 */
export default class MonologAction extends Action {
	/**
	 * Performs a monolog action.
     *
	 * @param messageText - The text of the monolog to send.
	 */
	performMonolog(messageText: string): void {
		if (this.performed) return;
		super.perform();
		const webhookUsername = this.player.displayName !== this.player.name ? `${this.player.displayName} (${this.player.name})` : this.player.name;
		const webhookAvatarURL = this.player.displayIcon ? this.player.displayIcon : this.player.member?.displayAvatarURL();
		this.getGame().communicationHandler.sendAndMirrorNotificationToPlayer(this.player, messageText, webhookUsername, webhookAvatarURL, MessageDisplayType.MONOLOG)
	}
}
