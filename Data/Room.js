import Description from './Description.js';
import GameEntity from './GameEntity.js';
import { generatePlayerListString, sortPlayersByDisplayName } from '../Modules/helpers.js';
import { Collection } from 'discord.js';

/** @import Exit from './Exit.js' */
/** @import Game from './Game.js' */
/** @import Player from './Player.js' */
/** @import { TextChannel } from 'discord.js' */

/**
 * @class Room
 * @classdesc Represents a room in the game.
 * @extends GameEntity
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/room.html
 */
export default class Room extends GameEntity {
    /**
     * The unique ID of the room.
     * @readonly
     * @type {string}
     */
    id;
    /**
     * The name of the room. Deprecated. Use `id` instead.
     * @deprecated
     * @readonly
     * @type {string}
     */
    name;
    /**
     * The name of the room for display purposes. Can contain uppercase letters and special characters. Not to be used for identification.
     * @readonly
     * @type {string}
     */
    displayName;
    /**
     * The channel associated with the room.
     * @readonly
     * @type {TextChannel}
     */
    channel;
    /**
     * The tags associated with the room.
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/room.html#tags
     * @type {Set<string>}
     */
    tags;
    /**
     * The URL of the icon associated with the room.
     * @type {string}
     */
    iconURL;
    /**
     * The exits of the room. Deprecated. Use `exits` instead.
     * @deprecated
     * @type {Exit[]}
     */
    exit;
    /**
     * A collection of all exits in the room. The key is the exit's name.
     * @type {Collection<string, Exit>}
     */
    exits;
    /**
     * The default description of the room for when a player enters from the first listed exit or inspects the room.
     * @readonly
     * @type {Description}
     */
    description;
    /**
     * An array of all players currently in the room.
     * @type {Player[]}
     */
    occupants;
    /**
     * A list of all players currently in the room, listed by their displayNames in alphabetical order.
     * Players with the `hidden` behavior attribute are omitted.
     * @type {string}
     */
    occupantsString;

    /**
     * @constructor
     * @param {string} id - The unique ID of the room.
     * @param {string} displayName - The name of the room for display purposes. Can contain uppercase letters and special characters.
     * @param {TextChannel} channel - The channel associated with the room.
     * @param {Set<string>} tags - The tags associated with the room. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/room.html#tags}
     * @param {string} iconURL - The URL of the icon associated with the room.
     * @param {Collection<string, Exit>} exits - The exits of the room.
     * @param {string} description - The default description of the room for when a player enters from the first listed exit or inspects the room.
     * @param {number} row - The row number of the room in the sheet.
     * @param {Game} game - The game this belongs to.
     */
    constructor(id, displayName, channel, tags, iconURL, exits, description, row, game) {
        super(game, row);
        this.id = id;
        this.displayName = displayName;
        this.name = this.id;
        this.channel = channel;
        this.tags = tags;
        this.iconURL = iconURL;
        this.exit = [];
        this.exits = exits;
        this.description = new Description(description, this, game);

        /** @type {Player[]} */
        this.occupants = [];
        this.occupantsString = "";
    }

    /**
     * Adds a player to the room.
     * @param {Player} player - The player to add to the room.
     * @param {Exit} [entrance] - The exit they're entering from, if applicable.
     */
    addPlayer(player, entrance) {
        player.setLocation(this);
        // Set the player's position.
        if (entrance) {
            player.pos.x = entrance.pos.x;
            player.pos.y = entrance.pos.y;
            player.pos.z = entrance.pos.z;
        }
        // If no entrance is given, try to calculate the center of the room by averaging the coordinates of all exits.
        else {
            /** @type {Pos} */
            let coordSum = { x: 0, y: 0, z: 0 };
            this.exits.forEach(exit => {
                coordSum.x += exit.pos.x;
                coordSum.y += exit.pos.y;
                coordSum.z += exit.pos.z;
            });
            /** @type {Pos} */
            let pos = { x: 0, y: 0, z: 0 };
            pos.x = Math.floor(coordSum.x / this.exits.size);
            pos.y = Math.floor(coordSum.y / this.exits.size);
            pos.z = Math.floor(coordSum.z / this.exits.size);
            player.pos = pos;
        }

        if (!player.hasBehaviorAttribute("no channel"))
            this.joinChannel(player);

        this.occupants.push(player);
        this.setOccupantsString();
    }

    /**
     * Removes a player from the room.
     * @param {Player} player - The player to remove from the room.
     */
    removePlayer(player) {
        this.leaveChannel(player);
        this.occupants.splice(this.occupants.indexOf(player), 1);
        this.setOccupantsString();
    }

    /**
     * Gets a list of the room's occupants excluding the given player, sorted alphabetically by display name.
     * @param {Player} player - The player to exclude. 
     * @param {Player[]} [list] - A custom list of players. By default, this is the list of the room's occupants with hidden players and the given player excluded.
     */
    getOccupantsExcluding(player, list = this.occupants.filter(occupant => !occupant.isHidden() && occupant.name !== player.name)) {
        sortPlayersByDisplayName(list);
        return list;
    }

    /**
     * Generates a string representing the occupants of the room, sorted alphabetically by display name.
     * @param {Player[]} [list] - A custom list of players. By default, this is the list of the room's occupants with hidden players excluded.
     * @returns {string}
     */
    generateOccupantsString(list = this.occupants.filter(occupant => !occupant.isHidden())) {
        return generatePlayerListString(list);
    }

    /**
     * Generates a string representing the occupants of the room excluding the given player, sorted alphabetically by display name.
     * @param {Player} player - The player to exclude. 
     * @param {Player[]} [list] - A custom list of players. By default, this is the list of the room's occupants with hidden players and the given player excluded.
     * @returns {string}
     */
    generateOccupantsStringExcluding(player, list = this.occupants.filter(occupant => !occupant.isHidden() && occupant.name !== player.name)) {
        return generatePlayerListString(list);
    }

    /**
     * Sets the room's occupants string to the given string. By default, sets it to the room's occupants, sorted alphabetically by display name with hidden players excluded.
     */
    setOccupantsString(occupantsString = this.generateOccupantsString()) {
        this.occupantsString = occupantsString;
    }

    /**
     * Gives player permission to view the room's channel.
     * @param {Player} player
     */
    joinChannel(player) {
        if (!player.isNPC) this.channel.permissionOverwrites.create(player.member, { ViewChannel: true });
    }

    /**
     * Removes player's permission to view the room's channel.
     * @param {Player} player
     */
    leaveChannel(player) {
        if (!player.isNPC) this.channel.permissionOverwrites.create(player.member, { ViewChannel: null });
    }

    /**
     * Gets the exit with the given name.
     * @param {string} name - The name of the exit to get.
     */
    getExit(name) {
        return this.getGame().entityFinder.getExit(this, name);
    }

    /**
     * Returns the URL to use for the room in the room description display component.
     */
    getIconURL() {
        return this.iconURL !== "" ? this.iconURL
            : this.getGame().settings.defaultRoomIconURL !== "" ? this.getGame().settings.defaultRoomIconURL
                : this.getGame().guildContext.guild.iconURL();
    }

    /**
     * Returns true if the room has the given tag.
     * @param {string} tag 
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * Returns true if the room has the `audio surveilled` tag.
     */
    isAudioSurveilled() {
        return this.hasTag("audio surveilled");
    }

    /**
     * Returns false if the room has the `video surveilled` tag.
     */
    isVideoSurveilled() {
        return this.hasTag("video surveilled");
    }

    /**
     * Returns true if the room has the `audio monitoring` tag.
     */
    isAudioMonitoring() {
        return this.hasTag("audio monitoring");
    }

    /**
     * Returns false if the room has the `video monitoring` tag.
     */
    isVideoMonitoring() {
        return this.hasTag("video monitoring");
    }

    /**
     * Returns the display name to use for the room in rooms with the `audio monitoring` or `video monitoring` tag.
     * @param {boolean} monitoringRoomCanBeSeen - Whether or not the room that's monitoring this one can be seen.
     */
    getSurveilledDisplayName(monitoringRoomCanBeSeen) {
        return this.hasTag("secret")
            ? this.isVideoSurveilled() && monitoringRoomCanBeSeen
                ? "Surveillance feed" : "Intercom"
            : this.displayName;
    }

    /**
     * Returns a custom ID for this room.
     */
    getInteractableCustomId() {
        return `Room|${this.id}`;
    }

    /** @returns {string} */
    descriptionCell() {
        return this.getGame().constants.roomSheetDescriptionColumn + this.row;
    }

    /**
     * Convert a room name to a valid Discord channel name which can be used as a Room's ID.
     * @param {string} name - A string, preferably the name of a room.
     */
    static generateValidId(name) {
        return name?.toLowerCase().replace(/[+=/<>\[\]!@#$%^&*()'":;,?`~\\|{}]/g, '').trim().replace(/ /g, '-');
    }
}
