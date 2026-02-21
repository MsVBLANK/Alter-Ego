import Action from "../Action.ts";
import type Player from "../Player.js";
import type Whisper from "../Whisper.js";

/**
 * Represents a whisper action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/whisper-action.html
 */
export default class WhisperAction extends Action {
	/**
	 * Performs a whisper action.
     *
	 * @param players - The players to add to the whisper.
	 * @returns The created whisper.
	 */
	async performWhisper(players: Player[]): Promise<Whisper> {
		if (this.performed) return;
		super.perform();
		const whisper = await this.getGame().entityLoader.createWhisper(players);
		this.getGame().narrationHandler.narrateWhisper(this, whisper, this.player);
		this.getGame().logHandler.logWhisper(whisper, this.player, this.forced);
		return whisper;
	}
}
