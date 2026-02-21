import type Game from "./Game.ts";

/**
 * Represents a construct that belongs to a game. Used as a base class for all other in-game constructs.
 */
export default abstract class GameConstruct {
	/**
	 * The game this construct belongs to.
	 */
    readonly #game: Game;

	/**
	 * @param game - The game this construct belongs to.
	 */
	protected constructor(game: Game) {
		this.#game = game;
	}

	getGame() {
		return this.#game;
	}
}
