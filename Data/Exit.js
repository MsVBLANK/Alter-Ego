import Description from './Description.js';
import GameEntity from './GameEntity.js';

/** @import Game from './Game.js' */
/** @import Room from './Room.js' */

/**
 * @class Exit
 * @classdesc Represents an exit in a room.
 * @extends GameEntity
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html
 */
export default class Exit extends GameEntity {
    /** 
     * The name of the exit.
     * @type {string}
     */
    name;
    /**
     * A phrase used to refer to the exit in narrations.
     * @type {string}
     */
    phrase;
    /**
     * The tags associated with the exit.
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html#tags
     * @type {Set<string>}
     */
    tags;
    /**
     * The position of the exit.
     * @type {Pos}
     */
    pos;
    /**
     * Whether or not the exit is unlocked.
     * @type {boolean}
     */
    unlocked;
    /**
     * The display name of the room that the exit leads to.
     * @type {string}
     */
    destDisplayName;
    /**
     * The room that the exit leads to.
     * @type {Room}
     */
    dest;
    /**
     * The name of the exit in the destination room that this exit links to.
     * @type {string}
     */
    link;
    /**
     * The description of the room when a player enters from this exit.
     * @readonly
     * @type {Description}
     */
    description;

    /**
     * @constructor
     * @param {string} name - The name of the exit.
     * @param {string} phrase - A phrase used to refer to the exit in narrations.
     * @param {Set<string>} tags - The tags associated with the exit. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/exit.html#tags}
     * @param {Pos} pos - The position of the exit.
     * @param {boolean} unlocked - Whether or not the exit is unlocked.
     * @param {string} destDisplayName - The display name of the room that the exit leads to.
     * @param {string} link - The name of the exit in the destination room that this exit links to.
     * @param {string} description - The description of the room when a player enters from this exit.
     * @param {number} row - The row number of the exit in the sheet.
     * @param {Game} game - The game this belongs to.
     */
    constructor(name, phrase, tags, pos, unlocked, destDisplayName, link, description, row, game) {
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
    unlock() {
        this.unlocked = true;
    }

    /**
     * Locks the exit.
     */
    lock() {
        this.unlocked = false;
    }

    /**
     * Sets the exit's destination.
     * @param {Room} room - The room this exit should lead to.
     * @param {Exit} exit - The exit in the destination room this exit should lead to.
     */
    setDest(room, exit) {
        this.dest = room;
        this.destDisplayName = room.displayName;
        this.link = exit.name;
    }

    /**
     * Gets a phrase to refer to the exit in narrations.
     */
    getNamePhrase() {
        if (this.phrase !== "") return this.phrase;
        return this.name.match(/.*\d+$/) ? this.name : `the ${this.name}`;
    }

    /**
     * Gets a phrase to refer to the door in narrations.
     */
    getDoorPhrase() {
        const namePhrase = this.getNamePhrase();
        const prefix = namePhrase.match(/.*\d+$/) || namePhrase.toLocaleUpperCase().includes("DOOR") || this.hasTag("not knockable") ? `` : `the door to `;
        return `${prefix}${namePhrase}`;
    }

    /**
     * Returns true if the exit has the given tag.
     * @param {string} tag 
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /** @returns {string} */
    descriptionCell() {
        return this.getGame().constants.roomSheetDescriptionColumn + this.row;
    }
}
