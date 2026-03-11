import Action from "../Data/Action.ts";
import type Game from "../Data/Game.ts";
import type Player from "../Data/Player.ts";
import type Room from "../Data/Room.ts";
import type Whisper from "../Data/Whisper.ts";
import { subtle } from "crypto";

/**
 * @class ActionDirective
 * @classdesc Represents an action to perform when a Discord Interaction is executed.
 */
export default class ActionDirective<T extends Action = Action> {
	/**
	 * The action this directive should create.
	 */
	readonly action: { new(...args: any[]): T };
    /**
     * The player the action should be constructed with by default.
     */
    readonly #player: Player;
	/**
	 * The raw arguments provided for this action.
	 */
	readonly #args: string[];
	customId: string;

	/**
	 * @constructor
	 * @param action - The action this directive should create.
     * @param player - The player the action should be constructed with by default.
	 * @param args - The raw arguments provided for this action. These will be used to generate the custom ID, and will be passed to the action's perform function.
	 * @throws {TypeError} If the provided action is not a subclass of Action.
	 */
	constructor(action: T, player: Player, args: any[]) {
		this.action = action.constructor as { new(...args: any[]): T };
        this.#player = player;
		this.#args = args;
	}

	/**
	 * Generates a custom ID for this action directive based on its action and arguments. This is used to identify the directive when an interaction is received.
	 * @param user - The user this directive is being generated for. This is included in the hash to ensure that directives generated for different user with the same action and arguments will have different custom IDs, preventing conflicts.
	 */
	async generateCustomId(user: User) {
		const buffer = new TextEncoder().encode([user.id].concat(this.#args).join(","));
		const hashBuffer = await subtle.digest("SHA-256", buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
		return `${this.action.name}:${hashHex}`;
	}

	setCustomId(customId: string) {
		this.customId = customId;
	}

	/**
	 * Creates an instance of the given action.
	 * @param game - The game this belongs to.
	 * @param message - The message that initiated the action.
	 * @param player - The player performing the action.
	 * @param location - The location where this action is being performed.
	 * @param forced - Whether or not the action was performed by someone other than the player themselves.
	 * @param whisper - The whisper where this action is being performed, if applicable.
	 */
	createAction(game: Game, message: UserMessage, player: Player, location: Room, forced: boolean, whisper?: Whisper) {
		return new this.action(game, message, player, location, forced, whisper);
	}

    getPlayer() {
        return this.#player;
    }

	getArgs() {
		return this.#args;
	}
}
