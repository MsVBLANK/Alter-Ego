import type Game from "./Game.ts";
import GameConstruct from "./GameConstruct.ts";

/**
 * Represents an in-game entity on the spreadsheet. Used as a base class for all other in-game entities.
 */
export default abstract class GameEntity extends GameConstruct {
	/**
	 * The row number of this entity on the spreadsheet.
	 */
	row: number;

	/**
	 * @param game - The game this entity belongs to.
	 * @param row - The row number of this entity on the spreadsheet.
	 */
	protected constructor(game: Game, row: number) {
		super(game);
		this.row = row;
	}

    abstract getEntityType(): string;
}
