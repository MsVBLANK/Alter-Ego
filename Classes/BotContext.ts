import { ActivityType } from "discord.js";
import PrettyPrinter from "./PrettyPrinter.ts";
import BotInteractableManager from "./BotInteractableManager.ts";
import BotInteractionHandler from "./BotInteractionHandler.ts";
import type Game from "../Data/Game.ts";
import BotCommand from "./BotCommand.ts";
import ModeratorCommand from "./ModeratorCommand.ts";
import PlayerCommand from "./PlayerCommand.ts";
import EligibleCommand from "./EligibleCommand.ts";
import type { Client, Collection } from "discord.js";

/**
 * Represents the bot as a singleton.
 */
export default class BotContext {
	/**
	 * The single instance of the bot that can exist.
	 */
	static #instance: BotContext;
	/** 
	 * The Discord Client associated with the bot.
	 */
	readonly client: Client;
	/** 
	 * All commands usable by the bot itself.
	 */
	readonly botCommands: Collection<string, BotCommand>;
	/**
	 * All commands usable by moderators.
	 */
	readonly moderatorCommands: Collection<string, ModeratorCommand>;
	/**
	 * All commands usable by players.
	 */
	readonly playerCommands: Collection<string, PlayerCommand>;
	/**
	 * All commands usable by members with the eligible role.
	 */
	readonly eligibleCommands: Collection<string, EligibleCommand>;
	/**
	 * The game the bot is managing.
	 */
	readonly game: Game;
	/**
	 * An array of the most recently-issued commands. Used by the dumplog command for debugging purposes.
	 */
	readonly #commandLog: Array<CommandLogEntry>;
    /**
     * The maximum number of commands to keep in the command log at once. If the log exceeds this size, the oldest command will be removed.
     */
    readonly #commandLogSizeLimit = 10000;
	/**
	 * A set of functions to cleanly display objects.
	 */
	readonly prettyPrinter: PrettyPrinter;
	/**
	 * A set of functions for creating and managing Interactables.
	 */
	readonly interactableManager: BotInteractableManager;
	/**
	 * A set of functions for handling Interactions.
	 */
	readonly interactionHandler: BotInteractionHandler;
	/**
	 * A timeout which updates the client user's presence every 30 seconds.
	 */
	readonly #presenceUpdateInterval: NodeJS.Timeout;

	/**
	 * @param client - The Discord Client associated with the bot.
	 * @param botCommands - All commands usable by the bot itself.
	 * @param moderatorCommands - All commands usable by moderators.
	 * @param playerCommands - All commands usable by players.
	 * @param eligibleCommands - All commands usable by members with the eligible role.
	 * @param game - The game the bot is managing.
	 */
	private constructor(client: Client, botCommands: Collection<string, BotCommand>, moderatorCommands: Collection<string, ModeratorCommand>, playerCommands: Collection<string, PlayerCommand>, eligibleCommands: Collection<string, EligibleCommand>, game: Game) {
		this.client = client;
		this.botCommands = botCommands;
		this.moderatorCommands = moderatorCommands;
		this.playerCommands = playerCommands;
		this.eligibleCommands = eligibleCommands;
		this.game = game;
		this.#commandLog = [];
		this.prettyPrinter = new PrettyPrinter();
		this.interactableManager = new BotInteractableManager(this.game);
		this.interactionHandler = new BotInteractionHandler(this.game);
		this.#presenceUpdateInterval = setInterval(
			() => this.updatePresence(),
			30 * 1000
		);
	}

    /**
     * Gets the bot context, or creates it if it doesn't exist.
     * @param client - The Discord Client associated with the bot.
	 * @param botCommands - All commands usable by the bot itself.
	 * @param moderatorCommands - All commands usable by moderators.
	 * @param playerCommands - All commands usable by players.
	 * @param eligibleCommands - All commands usable by members with the eligible role.
	 * @param game - The game the bot is managing.
     */
    public static Instance(client: Client, botCommands: Collection<string, BotCommand>, moderatorCommands: Collection<string, ModeratorCommand>, playerCommands: Collection<string, PlayerCommand>, eligibleCommands: Collection<string, EligibleCommand>, game: Game): BotContext {
        if (BotContext.#instance) return BotContext.#instance;
        else return this.#instance = new this(client, botCommands, moderatorCommands, playerCommands, eligibleCommands, game);
    }

    /**
     * The single instance of the bot that can exist.
     */
    public static get instance() {
        return BotContext.#instance;
    }

    /** 
     * An array of the most recently-issued commands. Used by the dumplog command for debugging purposes.
     */
    public get commandLog() {
        return this.#commandLog;
    }

    /**
     * Adds a command to the command log. If the log is at maximum capacity, removes the oldest one.
     * @param authorName - The name of the user who issued the command.
     * @param commandStr - The full text of the command that was issued.
     * @param timestamp - The timestamp at which the command was issued.
     */
    public logCommand(authorName: string, commandStr: string, timestamp: Date): void {
        if (this.#commandLog.length >= this.#commandLogSizeLimit)
            this.#commandLog.shift();
        this.#commandLog.push({
            timestamp: timestamp,
            author: authorName,
            content: commandStr
        });
    }

    /**
     * Gets a command by its type and alias. If the command does not exist, returns undefined.
     * @param type - The type of command.
     * @param alias - The alias to look up.
     */
    getCommand(type: "Bot" | "Moderator" | "Player" | "Eligible", alias: string): BotCommand | ModeratorCommand | PlayerCommand | EligibleCommand {
        if (type === "Bot") return this.botCommands.find(command => command.config.aliases.includes(alias));
        if (type === "Moderator") return this.moderatorCommands.find(command => command.config.aliases.includes(alias));
        if (type === "Player") return this.playerCommands.find(command => command.config.aliases.includes(alias));
        if (type === "Eligible") return this.eligibleCommands.find(command => command.config.aliases.includes(alias));
        return undefined;
    }

    /**
     * Returns true if the command was issued in a valid channel for its type.
     * @param command - The command that was issued.
     * @param message - The message in which the command was sent.
     */
    commandIssuedInValidChannel(command: ModeratorCommand | PlayerCommand | EligibleCommand, message: UserMessage): boolean {
        const guild = this.game.guildContext;
        if (command instanceof ModeratorCommand)
            return guild.sentInCommandChannel(message) || guild.sentInRoomChannel(message) || command.config.name === "delete_moderator";
        if (command instanceof PlayerCommand)
            return guild.sentInDMChannel(message) || guild.sentInRoomChannel(message);
        if (command instanceof EligibleCommand)
            return guild.sentInDMChannel(message) || this.game.settings.debug && guild.sentInTestingChannel(message) || !this.game.settings.debug && guild.sentInGeneralChannel(message);
        return false;
    }

	/**
	 * Updates the client user's presence.
	 */
	updatePresence() {
		let onlineSuffix = '';
		if (this.game.settings.showOnlinePlayerCount && this.game.inProgress && !this.game.canJoin) {
			let onlinePlayers = 0;
			this.game.livingPlayers.forEach(player => {
				if (player.online) onlinePlayers++;
			});
			const statusSuffix = onlinePlayers === 1 ? "player online" : "players online";
			onlineSuffix = ` - ${onlinePlayers} ${statusSuffix}`;
		}

		const activityName =
			this.game.settings.debug ? `${this.game.settings.debugModeActivity.name}${onlineSuffix}`
			: this.game.inProgress && !this.game.canJoin ? `${this.game.settings.gameInProgressActivity.name}${onlineSuffix}`
			: this.game.settings.onlineActivity.name;
		const activityType = this.game.settings.debug ? this.game.settings.debugModeActivity.type
			: this.game.inProgress && !this.game.canJoin ? this.game.settings.gameInProgressActivity.type
			: this.game.settings.onlineActivity.type;
		let url: string;
		if (this.game.inProgress && !this.game.canJoin) url = this.game.settings.gameInProgressActivity.url;

		const presence: import("discord.js").PresenceData = {
			status: this.game.settings.debug ? "dnd" : "online",
			activities: [
				{
					name: activityName,
					type: activityType,
					url: url
				}
			]
		};
		this.client.user.setPresence(presence);
	}

	static getActivityType(type: string): ActivityType {
		switch (type.toUpperCase()) {
			case "PLAYING":
				return ActivityType.Playing;
			case "STREAMING":
				return ActivityType.Streaming;
			case "LISTENING":
				return ActivityType.Listening;
			case "WATCHING":
				return ActivityType.Watching;
			case "COMPETING":
				return ActivityType.Competing;
			case "CUSTOM":
				return ActivityType.Custom;
		}
	}
}
