import Command from "./Command.ts";
import type Game from "../Data/Game.ts";
import type GameSettings from "./GameSettings.js";

/**
 * A command usable by someone with the eligible role.
 */
export default class EligibleCommand extends Command implements IEligibleCommand {
    /**
     * The code to execute when the command is called.
     */
    readonly execute: (game: Game, message: UserMessage, command: string, args: string[]) => Promise<void>;

	/**
	 * @param config - The specific configuration of the command.
	 * @param usage - Examples of the command's usage.
	 * @param execute - The code to execute when the command is called.
	 */
	constructor(
        config: CommandConfig,
        usage: (settings: GameSettings) => string,
        execute: (game: Game, message: UserMessage, command: string, args: string[]) => Promise<void>
    ) {
		super(config, usage);
		this.execute = execute;
	}
}
