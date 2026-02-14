import Action from "../Action.js";
import { MessageDisplayType } from "../../Modules/enums.js";

/**
 * @class MonologAction
 * @classdesc Represents a monolog action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/monolog-action.html
 */
export default class MonologAction extends Action {
	/**
	 * Performs a monolog action.
	 * @param {string} messageText - The text of the monolog to send.
	 */
	performMonolog(messageText) {
		if (this.performed) return;
		super.perform();
		this.getGame().communicationHandler.sendMessageToPlayer(this.player, messageText, false, MessageDisplayType.MONOLOG);
		const webhookUsername = this.player.displayName !== this.player.name ? `${this.player.displayName} (${this.player.name})` : this.player.name;
		const webhookAvatarURL = this.player.displayIcon ? this.player.displayIcon : this.player.member?.displayAvatarURL();
		if (this.player.spectateChannel)
			this.getGame().communicationHandler.mirrorWebhookMessageInSpectateChannel(this.player, this, webhookUsername, webhookAvatarURL, messageText, MessageDisplayType.MONOLOG);
	}
}