import type Game from "./Game.js";
import GameConstruct from "./GameConstruct.ts";

/**
 * @class GameEntity
 * @classdesc Represents an in-game entity on the spreadsheet. Used as a base class for all other in-game entities.
 * @extends GameConstruct
 */
export default abstract class GameEntity extends GameConstruct {
	/**
	 * The row number of this entity on the spreadsheet.
	 */
	row: number;

	/**
	 * @constructor
	 * @param game - The game this entity belongs to. 
	 * @param row - The row number of this entity on the spreadsheet.
	 */
	constructor(game: Game, row: number) {
		super(game);
		this.row = row;
	}
}