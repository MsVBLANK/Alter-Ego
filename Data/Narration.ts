import GameConstruct from "./GameConstruct.ts";
import Player from "./Player.js";
import UnhideAction from "./Actions/UnhideAction.ts";
import { capitalizeFirstLetter } from "../Modules/helpers.ts";
import { MessageDisplayType } from "../Modules/enums.js";
import { Attachment, Collection, Embed, type GuildMember } from "discord.js"
import type Action from "./Action.ts"
import type Room from "./Room.js"
import type Whisper from "./Whisper.js"
import type Game from "./Game.ts"

/**
 * Represents a narration in the game.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/narration.html
 */
export default class Narration extends GameConstruct {
    /**
     * The display type of the message to send for this narration.
     */
    readonly messageDisplayType: MessageDisplayType;
    /**
     * The action being narrated.
     */
    readonly action: Action;
    /**
     * The player whose action is being narrated.
     */
    readonly player: Player;
    /**
     * The room the narration is intended for.
     */
    readonly location: Room;
    /**
     * The whisper the narration is intended for. If the narration is not intended for a whisper, this is null.
     */
    readonly whisper: Whisper;
    /**
     * The text content for the narration.
     */
    content: string;
    /**
     * The message that the narration originated with, if applicable. If the narration didn't originate with a message, this is null.
     */
    readonly message: UserMessage;
    /**
	 * A collection of attachments sent with the original message.
	 */
	attachments: Collection<string, Attachment>;
	/**
	 * An array of embeds sent with the original message.
	 */
	embeds: Embed[];
    /**
     * The player or guild member who wrote the narration, if applicable. If the narration didn't originate with a message, this is null.
     */
    readonly narrator: Player | GuildMember;
    /**
     * The display name to represent the narrator in a webhook.
     */
    readonly narratorDisplayName: string;
    /**
     * The avatar URL to represent the narrator in a webhook.
     */
    readonly narratorDisplayIcon: string;
    /**
	 * Whether or not this narration is considered out-of-character, and thus not a true narration.
	 */
    isOOCMessage: boolean;
    /**
     * Whether or not the location has the `video surveilled` tag.
     * If this is an OOC message, this is false.
     */
    locationIsVideoSurveilled: boolean;
    /**
	 * A list of occupied rooms with the `video monitoring` tag.
	 * If the location doesn't have the `video surveilled` tag, or if this is an OOC message, this is empty.
	 */
    videoMonitoringRooms: Room[];

    /**
     * @param game - The game this is for.
     * @param messageDisplayType - The display type of the message to send for this narration.
     * @param action - The action being narrated.
     * @param player - The player whose action is being narrated.
     * @param location - The room the narration is intended for.
     * @param content - The text content for the narration.
     * @param whisper - The whisper the narration is intended for. Defaults to null.
     * @param message - The message that the narration originated with. Defaults to null.
     * @param narrator - The player or guild member who wrote the narration. Defaults to null.
     */
    constructor(game: Game, messageDisplayType: MessageDisplayType, action: Action, player: Player, location: Room,
        content: string, whisper: Whisper = null, message: UserMessage = null, narrator: Player | GuildMember = null) {
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
    getWhisperPrefixString(): string {
        if (!this.whisper || this.action instanceof UnhideAction) return "";
        const hidingSpot = this.getGame().entityFinder.getFixture(this.whisper.hidingSpotName, this.location.id);
        const playerList = this.player ? this.whisper.generatePlayerListStringExcluding(this.player) : this.whisper.generatePlayerListString();
        const playerListPhrase = playerList !== `` ? ` with ${playerList}` : ``;
        return `-# *(In ${hidingSpot ? hidingSpot.getContainingPhrase() : `a whisper`}${playerListPhrase}):*\n`;
    }

    /**
     * Returns true if the narration's message display type is PLAYER.
     */
    isPlayerMessageType(): boolean {
        return this.messageDisplayType === MessageDisplayType.PLAYER;
    }

    /**
     * Returns true if the narration was sent by a moderator.
     */
    isModeratorNarration(): boolean {
        return this.narrator && !this.isPlayerMessageType();
    }

    /**
     * Returns true if the narration is only intended to be narrated in a hiding spot.
     */
    isInHidingSpot(): boolean {
        return (this.player && this.player.isHidden() || this.isModeratorNarration()) && this.whisper && !(this.action instanceof UnhideAction);
    }
}
