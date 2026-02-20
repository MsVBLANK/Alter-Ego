import GameConstruct from "./GameConstruct.ts";
import { randomUUID } from "crypto";
import type Player from "./Player.js";
import type Room from "./Room.js";
import type Whisper from "./Whisper.js";
import type Game from "./Game.js";

/**
 * @class Action
 * @classdesc Represents an action taken by a player.
 * @extends GameConstruct
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/action.html
 */
export default abstract class Action extends GameConstruct {
	/**
	 * The unique ID of this action.
	 * @readonly
	 */
	id: string;
	/**
	 * The message that initiated the action.
	 * @readonly
	 */
	message: UserMessage;
	/**
	 * The player performing the action.
	 * @readonly
	 */
	player: Player;
	/**
	 * The location where this action is being performed.
	 * @readonly
	 */
	location: Room;
	/**
	 * Whether or not the action was performed by someone other than the player themselves.
	 * @readonly
	 */
	forced: boolean;
	/**
	 * The whisper where this action is being performed, if applicable.
	 * @readonly
	 */
	whisper: Whisper;
	/**
	 * Whether the action has already been performed. If this is true, the action cannot be performed again.
	 */
	protected performed: boolean;
	/**
	 * A set of channel IDs this action has already been communicated in. This is used to ensure that actions are not communicated in the same place twice.
	 * @private
	 */
	mirrors: Set<string>;

	/**
	 * @constructor
	 * @param game - The game this belongs to.
	 * @param message - The message that initiated the action. 
	 * @param player - The player performing the action.
	 * @param location - The location where this action is being performed.
	 * @param forced - Whether or not the action was performed by someone other than the player themselves.
	 * @param whisper - The whisper where this action is being performed, if applicable.
	 */
	constructor(game: Game, message: UserMessage, player: Player, location: Room, forced: boolean, whisper?: Whisper) {
		super(game);
		this.message = message;
		this.player = player;
		this.location = location;
		this.forced = forced;
		this.whisper = whisper;
        this.performed = false;
		this.id = randomUUID();
		this.mirrors = new Set();
	}

	/**
	 * Marks the action as performed.
	 */
	protected perform() {
		this.performed = true;
	}

	/**
	 * Returns true if the action has been communicated in the given channel.
	 * @param channelId
	 */
	hasBeenCommunicatedIn(channelId: string) {
		return this.mirrors.has(channelId);
	}

	/**
	 * Marks the action as having been mirrored in the given channel.
	 * @param channelId
	 */
	addToMirrors(channelId: string) {
		this.mirrors.add(channelId);
	}
}
