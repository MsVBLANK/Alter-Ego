import GameConstruct from "./GameConstruct.js";
import Player from "./Player.js";
import UnhideAction from "./Actions/UnhideAction.js";
import { capitalizeFirstLetter } from "../Modules/helpers.ts";
import { MessageDisplayType } from "../Modules/enums.js";
import { Attachment, Collection, Embed } from "discord.js";

/** @import Action from "./Action.js" */
/** @import Game from "./Game.js" */
/** @import Room from "./Room.js" */
/** @import Whisper from "./Whisper.js" */
/** @import { GuildMember } from "discord.js" */

/**
 * @class Narration
 * @classdesc Represents a narration in the game.
 * @extends GameConstruct
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/narration.html
 */
export default class Narration extends GameConstruct {
    /**
     * The display type of the message to send for this narration.
     * @readonly
     * @type {MessageDisplayType}
     */
    messageDisplayType;
    /**
     * The action being narrated.
     * @readonly
     * @type {Action}
     */
    action;
    /**
     * The player whose action is being narrated.
     * @readonly
     * @type {Player}
     */
    player;
    /**
     * The room the narration is intended for.
     * @readonly
     * @type {Room}
     */
    location;
    /**
     * The whisper the narration is intended for. If the narration is not intended for a whisper, this is null.
     * @readonly
     * @type {Whisper}
     */
    whisper;
    /**
     * The text content for the narration.
     * @type {string}
     */
    content;
    /**
     * The message that the narration originated with, if applicable. If the narration didn't originate with a message, this is null.
     * @readonly
     * @type {UserMessage}
     */
    message;
    /**
	 * A collection of attachments sent with the original message.
	 * @type {Collection<string, Attachment>}
	 */
	attachments;
	/**
	 * An array of embeds sent with the original message.
	 * @type {Embed[]}
	 */
	embeds;
    /**
     * The player or guild member who wrote the narration, if applicable. If the narration didn't originate with a message, this is null.
     * @readonly
     * @type {Player|GuildMember}
     */
    narrator;
    /**
     * The display name to represent the narrator in a webhook.
     * @readonly
     * @type {string}
     */
    narratorDisplayName;
    /**
     * The avatar URL to represent the narrator in a webhook.
     * @readonly
     * @type {string}
     */
    narratorDisplayIcon;
    /**
	 * Whether or not this narration is considered out-of-character, and thus not a true narration.
	 * @type {boolean}
	 */
    isOOCMessage;
    /**
     * Whether or not the location has the `video surveilled` tag.
     * If this is an OOC message, this is false.
     * @type {boolean}
     */
    locationIsVideoSurveilled;
    /**
	 * A list of occupied rooms with the `video monitoring` tag.
	 * If the location doesn't have the `video surveilled` tag, or if this is an OOC message, this is empty.
	 * @type {Room[]}
	 */
    videoMonitoringRooms;

    /**
     * @constructor
     * @param {Game} game - The game this is for.
     * @param {MessageDisplayType} messageDisplayType - The display type of the message to send for this narration.
     * @param {Action} action - The action being narrated.
     * @param {Player} player - The player whose action is being narrated.
     * @param {Room} location - The room the narration is intended for.
     * @param {string} content - The text content for the narration.
     * @param {Whisper} [whisper] - The whisper the narration is intended for. Defaults to null.
     * @param {UserMessage} [message] - The message that the narration originated with. Defaults to null.
     * @param {Player|GuildMember} [narrator] - The player or guild member who wrote the narration. Defaults to null.
     */
    constructor(game, messageDisplayType, action, player, location, content, whisper = null, message = null, narrator = null) {
        super(game);
        this.messageDisplayType = messageDisplayType;
        this.action = action;
        this.player = player;
        this.location = location;
        this.content = content;
        // If no whisper was provided but the player is hidden, find the whisper associated with their hiding spot.
        if (!whisper && this.player && this.player.isHidden()) {
            const hidingSpotFixture = game.entityFinder.getFixture(this.player.hidingSpot, this.player.location.id);
            if (hidingSpotFixture) whisper = hidingSpotFixture.hidingSpot.whisper;
        }
        this.whisper = whisper;
        this.message = message;
        this.attachments = message?.attachments ?? new Collection();
		this.embeds = message?.embeds ?? [];
        this.isOOCMessage = false;
        this.narrator = narrator;
        if (this.narrator) {
            this.narratorDisplayName = capitalizeFirstLetter(this.narrator.displayName);
            if (this.narrator instanceof Player)
                this.narratorDisplayIcon = this.narrator.displayIcon ? this.narrator.displayIcon : this.narrator.member.displayAvatarURL();
            else this.narratorDisplayIcon = this.narrator.displayAvatarURL();
            this.isOOCMessage = this.content.startsWith('(');
        }
        this.locationIsVideoSurveilled = false;
        this.videoMonitoringRooms = [];
        if (!this.isOOCMessage) {
            this.locationIsVideoSurveilled = this.location.isVideoSurveilled();
            if (this.locationIsVideoSurveilled)
                this.videoMonitoringRooms = game.entityFinder.getRooms(undefined, "video monitoring", true);
        }
    }

    /**
     * Returns the prefix string to append before the rest of the message text in spectate messages. If the narration didn't occur in a whisper, returns an empty string.
     */
    getWhisperPrefixString() {
        if (!this.whisper || this.action instanceof UnhideAction) return "";
        const hidingSpot = this.getGame().entityFinder.getFixture(this.whisper.hidingSpotName, this.location.id);
        const playerList = this.player ? this.whisper.generatePlayerListStringExcluding(this.player) : this.whisper.generatePlayerListString();
        const playerListPhrase = playerList !== `` ? ` with ${playerList}` : ``;
        return `-# *(In ${hidingSpot ? hidingSpot.getContainingPhrase() : `a whisper`}${playerListPhrase}):*\n`;
    }

    /** 
     * Returns true if the narration's message display type is PLAYER.
     */
    isPlayerMessageType() {
        return this.messageDisplayType === MessageDisplayType.PLAYER;
    }

    /**
     * Returns true if the narration was sent by a moderator.
     */
    isModeratorNarration() {
        return this.narrator && !this.isPlayerMessageType();
    }

    /**
     * Returns true if the narration is only intended to be narrated in a hiding spot.
     */
    isInHidingSpot() {
        return (this.player && this.player.isHidden() || this.isModeratorNarration()) && this.whisper && !(this.action instanceof UnhideAction);
    }
}
