import type GameSettings from "./GameSettings.js";

export default abstract class Command implements ICommand {
    /**
     * The specific configuration of the command.
     */
    readonly config: CommandConfig;
    /**
     * Examples of the command's usage.
     */
    readonly usage: (settings: GameSettings) => string;
    
    protected constructor(config: CommandConfig, usage: (settings: GameSettings) => string) {
        this.config = config;
        this.usage = usage;
    }
}