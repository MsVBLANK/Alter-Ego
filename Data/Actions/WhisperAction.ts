import Action from "../Action.ts";
import type Player from "../Player.ts";
import type Whisper from "../Whisper.ts";
import { generateListString } from "../../Modules/helpers.ts";

/**
 * Represents a whisper action.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html#whisper-action
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
        this.successMessage = `Successfully initiated whisper for ${generateListString(players.map(player => player.name))}.`;
		return whisper;
	}
}
