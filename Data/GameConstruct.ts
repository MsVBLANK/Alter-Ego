import type Game from "./Game.js";

/**
 * @class GameConstruct
 * @classdesc Represents a construct that belongs to a game. Used as a base class for all other in-game constructs.
 */
export default abstract class GameConstruct {
	/**
	 * The game this construct belongs to.
	 * @readonly
	 */
	#game: Game;

	/**
	 * @constructor
	 * @param game - The game this construct belongs to.
	 */
	constructor(game: Game) {
		this.#game = game;
	}

	getGame() {
		return this.#game;
	}
}