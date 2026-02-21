import Description from './Description.ts';
import GameEntity from './GameEntity.ts';
import type Room from "./Room.js"
import type Game from "./Game.js"

/**
 * Represents an exit in a room.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html
 */
export default class Exit extends GameEntity {
    /**
     * The name of the exit.
     */
    name: string;
    /**
     * A phrase used to refer to the exit in narrations.
     */
    phrase: string;
    /**
     * The tags associated with the exit.
     *
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html#tags
     */
    tags: Set<string>;
    /**
     * The position of the exit.
     */
    pos: Pos;
    /**
     * Whether or not the exit is unlocked.
     */
    unlocked: boolean;
    /**
     * The display name of the room that the exit leads to.
     */
    destDisplayName: string;
    /**
     * The room that the exit leads to.
     */
    dest: Room;
    /**
     * The name of the exit in the destination room that this exit links to.
     */
    link: string;
    /**
     * The description of the room when a player enters from this exit.
     */
    readonly description: Description;

    /**
     * @param name - The name of the exit.
     * @param phrase - A phrase used to refer to the exit in narrations.
     * @param tags - The tags associated with the exit. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html#tags}
     * @param pos - The position of the exit.
     * @param unlocked - Whether or not the exit is unlocked.
     * @param destDisplayName - The display name of the room that the exit leads to.
     * @param link - The name of the exit in the destination room that this exit links to.
     * @param description - The description of the room when a player enters from this exit.
     * @param row - The row number of the exit in the sheet.
     * @param game - The game this belongs to.
     */
    constructor(name: string, phrase: string, tags: Set<string>, pos: Pos, unlocked: boolean, destDisplayName: string,
        link: string, description: string, row: number, game: Game) {
        super(game, row);
        this.name = name;
        this.phrase = phrase;
        this.tags = tags;
        this.pos = pos;
        this.unlocked = unlocked;
        this.destDisplayName = destDisplayName;
        this.link = link;
        this.description = new Description(description, this, game);
    }

    /**
     * Unlocks the exit.
     */
    unlock(): void {
        this.unlocked = true;
    }

    /**
     * Locks the exit.
     */
    lock(): void {
        this.unlocked = false;
    }

    /**
     * Sets the exit's destination.
     *
     * @param room - The room this exit should lead to.
     * @param exit - The exit in the destination room this exit should lead to.
     */
    setDest(room: Room, exit: Exit): void {
        this.dest = room;
        this.destDisplayName = room.displayName;
        this.link = exit.name;
    }

    /**
     * Gets the args for moving to this exit for an action directive.
     *
     * @param currentLocation - The player's current location.
     * @param isRunning - Whether not the player is running.
     * @returns [currentLocationId, isRunning, exitName]
     */
    getQueueMoveActionDirectiveArgs(currentLocation: Room, isRunning: boolean): [string, string, string] {
        return [currentLocation.id, String(isRunning), this.name];
    }

    /**
     * Gets a phrase to refer to the exit in narrations.
     */
    getNamePhrase(): string {
        if (this.phrase !== "") return this.phrase;
        return this.name.match(/.*\d+$/) ? this.name : `the ${this.name}`;
    }

    /**
     * Gets a phrase to refer to the door in narrations.
     */
    getDoorPhrase(): string {
        const namePhrase = this.getNamePhrase();
        const prefix = namePhrase.match(/.*\d+$/) || namePhrase.toLocaleUpperCase().includes("DOOR") || this.hasTag("not knockable") ? `` : `the door to `;
        return `${prefix}${namePhrase}`;
    }

    /**
     * Returns true if the exit has the given tag.
     */
    hasTag(tag: string): boolean {
        return this.tags.has(tag);
    }

    descriptionCell(): string {
        return this.getGame().constants.roomSheetDescriptionColumn + this.row;
    }
}
