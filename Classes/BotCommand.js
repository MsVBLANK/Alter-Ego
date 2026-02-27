/** @import Event from "../Data/Event.ts" */
/** @import Flag from "../Data/Flag.ts" */
/** @import Game from "../Data/Game.ts" */
/** @import GameSettings from "./GameSettings.js" */
/** @import InventoryItem from "../Data/InventoryItem.ts" */
/** @import Player from "../Data/Player.ts" */
/** @import Puzzle from "../Data/Puzzle.ts" */

/**
 * @class BotCommand
 * @classdesc A command usable by the bot itself. Command sets can be written for some in-game data structures to be executed when certain conditions are met.
 * @implements {IBotCommand}
 */
export default class BotCommand {
	/**
	 * @constructor
	 * @param {CommandConfig} config 
	 * @param {(settings: GameSettings) => string} usage 
	 * @param {(game: Game, command: string, args: string[], player?: Player, callee?: Event|Flag|InventoryItem|Puzzle) => Promise<void>} execute 
	 */
	constructor(config, usage, execute) {
		this.config = config;
		this.usage = usage;
		this.execute = execute;
	}
}
