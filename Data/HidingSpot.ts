import { generatePlayerListString } from "../Modules/helpers.ts";
import type Action from "./Action.ts";
import type Fixture from "./Fixture.ts";
import type Game from "./Game.ts";
import GameEntity from "./GameEntity.ts";
import type Player from "./Player.js";
import type Room from "./Room.js";
import Whisper from "./Whisper.js";

export default class HidingSpot extends GameEntity {
    /**
     * The name of the hiding spot.
     */
    name: string;
	/**
	 * The fixture this belongs to.
	 */
	readonly #fixture: Fixture;
	/**
	 * Whole number indicating how many players can hide in this hiding spot.
	 */
	capacity: number;
	/**
	 * A list of players currently hidden in this hiding spot.
	 */
	occupants: Player[];
	/**
	 * The whisper currently associated with this hiding spot. If no one is hidden in this hiding spot, this is null.
	 */
	whisper: Whisper;

	/**
	 * @param fixture - The fixture this belongs to.
	 * @param capacity - Whole number indicating how many players can hide in this hiding spot.
	 * @param row - The row number of the fixture in the sheet.
	 * @param game - The game this belongs to.
	 */
	constructor(fixture: Fixture, capacity: number, row: number, game: Game) {
		super(game, row);
		this.#fixture = fixture;
		this.name = this.#fixture.name;
		this.capacity = capacity;
		this.occupants = [];
		this.whisper = null;
	}

	/**
	 * Adds a player to the hiding spot.
     *
	 * @param player - The player to add to the hiding spot.
	 */
	async addPlayer(player: Player): Promise<void> {
		if (player.canSee()) this.deleteWhisper();
		this.occupants.push(player);
		player.hidingSpot = this.name;
		this.whisper = await this.getGame().entityLoader.createWhisper(this.occupants, this.name);
	}

	/**
	 * Removes a player from the hiding spot.
     *
	 * @param player - The player to remove from the hiding spot.
	 * @param action - The action that caused the player to be removed.
	 */
	removePlayer(player: Player, action?: Action): void {
		this.occupants.splice(this.occupants.indexOf(player), 1);
		const whisperNarration = action ? this.getGame().notificationGenerator.generateUnhideNotification(player, false, this.getContainingPhrase()) : "";
		player.removeFromWhispers(whisperNarration, action);
		player.hidingSpot = "";
	}

	/**
	 * Removes all occupants from the whisper and sets it to null.
	 */
	deleteWhisper(): void {
		for (const occupant of this.occupants)
			occupant.removeFromWhispers("");
		this.whisper = null;
	}

	/**
	 * Gets the fixture this belongs to.
	 */
	getFixture(): Fixture {
		return this.#fixture;
	}

	/**
     * Gets the fixture's name preceded by "the".
     */
    getContainingPhrase(): string {
        return `the ${this.name}`;
    }

	/**
	 * Gets the room this hiding spot is in.
	 */
	getLocation(): Room {
		return this.#fixture.location;
	}

	/**
	 * Generates a string representing the occupants of the hiding spot.
     *
	 * @param viewerHasNoSightBehaviorAttribute - Whether or not to return a vague list indicating the quantity of occupants. Defaults to `false`.
	 */
	generateOccupantsString(viewerHasNoSightBehaviorAttribute: boolean = false): string {
		if (viewerHasNoSightBehaviorAttribute) return this.occupants.length > 1 ? `${String(this.occupants.length)} people` : `someone`;
		return generatePlayerListString(this.occupants);
	}
}
