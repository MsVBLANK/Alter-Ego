import { randomUUID } from "crypto";
import type Game from "./Game.ts";
import GameConstruct from "./GameConstruct.ts";
import type Interactable from "../Classes/Interactables/Interactable.ts";
import type Player from "./Player.ts";
import type Room from "./Room.ts";
import type Whisper from "./Whisper.ts";

/**
 * Represents an action taken by a player.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/action.html
 */
export default abstract class Action extends GameConstruct {
	/**
	 * The unique ID of this action.
	 */
    readonly id: string;
	/**
	 * The message that initiated the action.
	 */
    readonly message: UserMessage;
	/**
	 * The player performing the action.
	 */
    readonly player: Player;
	/**
	 * The location where this action is being performed.
	 */
    readonly location: Room;
	/**
	 * Whether or not the action was performed by someone other than the player themselves.
	 */
    readonly forced: boolean;
	/**
	 * The whisper where this action is being performed, if applicable.
	 */
    readonly whisper: Whisper;
    /**
     * The user who created the action.
     */
    readonly user: User;
	/**
	 * Whether the action has already been performed. If this is true, the action cannot be performed again.
	 */
	protected performed: boolean;
    /**
     * The message to send when the action successfully finishes performing.
     */
    #successMessage: string;
	/**
	 * A set of channel IDs this action has already been communicated in. This is used to ensure that actions are not communicated in the same place twice.
	 */
	private mirrors: Set<string>;

	/**
	 * @param game - The game this belongs to.
	 * @param message - The message that initiated the action.
	 * @param player - The player performing the action.
	 * @param location - The location where this action is being performed.
	 * @param forced - Whether or not the action was performed by someone other than the player themselves.
	 * @param whisper - The whisper where this action is being performed, if applicable.
     * @param user - The user who created the action, if applicable.
	 */
	constructor(game: Game, message: UserMessage, player: Player, location: Room, forced: boolean, whisper?: Whisper, user?: User) {
		super(game);
		this.message = message;
		this.player = player;
		this.location = location;
		this.forced = forced;
		this.whisper = whisper;
        this.performed = false;
		this.id = randomUUID();
		this.mirrors = new Set();
        this.user = user;
        if (!this.user && forced && message) this.user = game.entityFinder.getModeratorById(message.author.id);
        else if (this.user && !forced) this.user = player;
	}

	/**
	 * Marks the action as performed.
	 */
	protected perform(): void {
		this.performed = true;
	}

    get successMessage(): string {
        return this.#successMessage;
    }

    protected set successMessage(string: string) {
        this.#successMessage = string;
    }

    /**
     * Sends the success message to the command channel.
     * @param interactables - An array of interactables to send. Optional.
     */
    sendSuccessMessageToCommandChannel(interactables: Interactable[] = []): void {
        if (this.#successMessage)
            this.getGame().communicationHandler.sendToCommandChannel(this.#successMessage, interactables);
    }

	/**
	 * Returns true if the action has been communicated in the given channel.
	 */
	hasBeenCommunicatedIn(channelId: string): boolean {
		return this.mirrors.has(channelId);
	}

	/**
	 * Marks the action as having been mirrored in the given channel.
	 */
	addToMirrors(channelId: string): void {
		this.mirrors.add(channelId);
	}
}
