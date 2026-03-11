import Command from "./Command.ts";
import type Game from "../Data/Game.ts";
import type Player from "../Data/Player.ts";
import type GameSettings from "./GameSettings.js";

/**
 * A command usable by the bot itself. Command sets can be written for some in-game data structures to be executed when certain conditions are met.
 */
export default class BotCommand extends Command implements IBotCommand {
    /**
     * The code to execute when the command is called.
     */
    readonly execute: (game: Game, command: string, args: string[], player?: Player, callee?: Callee) => Promise<void>;

	/**
	 * @param config - The specific configuration of the command.
	 * @param usage - Examples of the command's usage.
	 * @param execute - The code to execute when the command is called.
	 */
	constructor(
        config: CommandConfig,
        usage: (settings: GameSettings) => string,
        execute: (game: Game, command: string, args: string[], player?: Player, callee?: Callee) => Promise<void>
    ) {
		super(config, usage);
		this.execute = execute;
	}
}
