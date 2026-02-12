import Action from "../Data/Action.js";
import type Game from "../Data/Game.js";
import type Player from "../Data/Player.js";
import type Room from "../Data/Room.js";
import type Whisper from "../Data/Whisper.js";
import { subtle } from "crypto";

/**
 * @class ActionDirective
 * @classdesc Represents an action to perform when a Discord Interaction is executed.
 */
export default class ActionDirective<T extends Action = Action> {
	/**
	 * The action this directive should create.
	 * @readonly
	 */
	action: { new(...args: any[]): T };
	/**
	 * The raw arguments provided for this action.
	 * @readonly
	 */
	#args: any[];
	customId: string;

	/**
	 * @constructor
	 * @param action - The action this directive should create.
	 * @param args - The raw arguments provided for this action. These will be used to generate the custom ID, and will be passed to the action's perform function.
	 * @throws {TypeError} If the provided action is not a subclass of Action.
	 */
	constructor(action: T, args: any[]) {
		this.action = action.constructor as { new(...args: any[]): T };
		this.#args = args;
	}

	async generateCustomId() {
		const buffer = new TextEncoder().encode(this.#args.join(","));
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

	getArgs() {
		return this.#args;
	}
}