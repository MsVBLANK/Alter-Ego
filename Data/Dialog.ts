import { type Attachment, Collection, type Embed } from "discord.js";
import { capitalizeFirstLetter } from "../Modules/helpers.ts";
import type Game from "./Game.ts";
import GameConstruct from "./GameConstruct.ts";
import type InventoryItem from "./InventoryItem.ts";
import type Player from "./Player.ts";
import type Room from "./Room.ts";
import type Whisper from "./Whisper.ts";

/**
 * Represents dialog spoken aloud by a player.
 *
 * @see https://msvblank.github.io/Alter-Ego/reference/data_structures/dialog.html
 */
export default class Dialog extends GameConstruct {
    /**
     * The message that the dialog originated with.
     */
    message: UserMessage;
    /**
     * The player who spoke the dialog.
     */
    speaker: Player;
    /**
     * The room the dialog occurred in.
     */
    location: Room;
    /**
     * Whether or not the dialog was made by a player in the announcement channel.
     */
    isAnnouncement: boolean;
    /**
     * The whisper the dialog occurred in.
     * If the dialog was not whispered, this is null.
     */
    whisper: Whisper;
    /**
     * The text content of the message.
     */
    content: string;
    /**
     * The cleanContent of the message.
     */
    cleanContent: string;
    /**
     * The text content of the message without any markdown formatting characters.
     */
    unformattedContent: string;
    /**
     * The cleanContent of the dialog, but only including alphanumeric characters, cast to lowercase.
     */
    alphanumericContent: string;
    /**
     * A collection of attachments sent with the original message.
     */
    attachments: Collection<string, Attachment>;
    /**
     * An array of embeds sent with the original message.
     */
    embeds: Embed[];
    /**
     * The display name to represent the speaker.
     */
    speakerDisplayName: string;
    /**
     * The avatar URL to represent the speaker in a webhook.
     */
    speakerDisplayIcon: string;
    /**
     * The voice string that will be used to describe the player's voice to other players. By default, this is the player's voice string.
     * If the player's voice string is the name of another player, this will instead by the original voice string of the mimicked player.
     */
    speakerVoiceString: string;
    /**
     * The name that will be used to represent the player to other players with the `knows [Player]` behavior attribute. By default, this is the player's name.
     * If this is not the name of another player, and the speaker's voice string is different from their original voice string, this is "unknown".
     */
    speakerRecognitionName: string;
    /**
     * Whether or not this dialog is considered out-of-character, and thus not true dialog.
     */
    isOOCMessage: boolean;
    /**
     * Whether or not this dialog is being shouted.
     * If the contents of the message excluding emojis is in all capital letters, and the message contains at least two letters, it is considered shouted.
     * If this is an OOC message, this is false.
     */
    isShouted: boolean;
    /**
     * A collection of adjacent rooms. Excludes any rooms with the `soundproof` tag and any unoccupied rooms (unless they have the `audio monitoring` tag).
     * If the location itself has the `soundproof` tag, or this is an OOC message, this is empty.
     */
    neighboringRooms: Collection<string, Room>;
    /**
     * A collection of rooms with at least one player that has the `receiver` behavior attribute. The key of each entry is the room's ID.
     * If the player doesn't have the `sender` behavior attribute, or if this is an OOC message, this is empty.
     */
    receiverRooms: Collection<string, Room>;
    /**
     * Whether or not the location has the `audio surveilled` tag.
     * If this is an OOC message, this is false.
     */
    locationIsAudioSurveilled: boolean;
    /**
     * Whether or not the location has the `video surveilled` tag.
     * If this is an OOC message, this is false.
     */
    locationIsVideoSurveilled: boolean;
    /**
     * A collection of rooms adjacent to the location with the `audio surveilled` tag.
     * Any rooms with the `soundproof` tag are excluded.
     * If this is an OOC message, this is empty.
     */
    neighboringAudioSurveilledRooms: Collection<string, Room>;
    /**
     * A collection of rooms with the `audio surveilled` tag that also have at least one player that has the `receiver` behavior attribute.
     * If the player doesn't have the `sender` behavior attribute, or if this is an OOC message, this is empty.
     */
    receiverAudioSurveilledRooms: Collection<string, Room>;
    /**
     * A collection of occupied rooms with the `audio monitoring` tag.
     * If the location, its neighboring rooms, or the receiver rooms don't have the `audio surveilled` tag, or if this is an OOC message, this is empty.
     */
    audioMonitoringRooms: Collection<string, Room>;
    /**
     * A collection of inventory items that inflict the `receiver` behavior attribute. The key of each entry is the name of the player it belongs to.
     * If the player doesn't have the `sender` behavior attribute, or if this is an OOC message, this is empty.
     */
    receivers: Collection<string, InventoryItem>;
    /**
     * Whether or not the speaker's display name is different from the name that they'll be recognized by.
     */
    readonly speakerDisplayNameIsDifferent: boolean;

    /**
     * @param game - The game the dialog occurred in.
     * @param message - The message that this dialog originated with.
     * @param player - The player who spoke the dialog.
     * @param location - The room the dialog occurred in.
     * @param content - The content of the dialog. Optional.
     * @param isAnnouncement - Whether or not the dialog was made by a player in the announcement channel. Defaults to false.
     * @param whisper - The whisper the dialog occurred in. Defaults to null.
     * @param cleanContent - The clean content of the dialog. Optional.
     */
    constructor(game: Game, message: UserMessage, player: Player, location: Room, content: string = message.content,
        isAnnouncement: boolean = false, whisper: Whisper = null, cleanContent: string = content) {
        super(game);
        this.message = message;
        this.speaker = player;
        this.location = location;
        this.isAnnouncement = isAnnouncement;
        this.whisper = whisper;
        this.content = content;
        this.cleanContent = cleanContent;
        this.unformattedContent = this.content.replace(/^(-#|#{1,3}) /, '');
        this.alphanumericContent = this.cleanContent.replace(/[^a-zA-Z0-9 ]+/g, "").toLowerCase().trim();
        this.attachments = this.message?.attachments ?? new Collection();
        this.embeds = this.message?.embeds ?? [];
        this.speakerDisplayName = this.speaker.displayName;
        this.speakerDisplayIcon = this.speaker.displayIcon ? this.speaker.displayIcon : this.speaker.member.displayAvatarURL();
        this.speakerVoiceString = this.speaker.voiceString;
        this.speakerRecognitionName = this.speaker.name;
        if (this.speaker.voiceString !== this.speaker.originalVoiceString) {
            const mimickedPlayer = game.entityFinder.getPlayer(this.speaker.voiceString);
            if (mimickedPlayer) {
                this.speakerVoiceString = mimickedPlayer.originalVoiceString;
                this.speakerRecognitionName = mimickedPlayer.name;
            }
            // If the player's voice descriptor is different but doesn't match the name of another player,
            // set their recognition name to unknown so that other players won't recognize their voice.
            if (this.speakerRecognitionName === this.speaker.name)
                this.speakerRecognitionName = "unknown";
        }
        const OOCMessageRegex = /^[_*~|\-#\d.> ]*\(.*/;
        this.isOOCMessage = OOCMessageRegex.test(this.cleanContent);
        this.isShouted = false;
        this.neighboringRooms = new Collection();
        this.receiverRooms = new Collection();
        this.locationIsAudioSurveilled = false;
        this.locationIsVideoSurveilled = false;
        this.neighboringAudioSurveilledRooms = new Collection();
        this.receiverAudioSurveilledRooms = new Collection();
        this.audioMonitoringRooms = new Collection();
        this.receivers = new Collection();
        this.speakerDisplayNameIsDifferent = this.speakerDisplayName !== this.speakerRecognitionName;
        // The remaining properties only need to be initialized if the dialog isn't an out-of-character message.
        if (!this.isOOCMessage) {
            const startsWithHeadingFormatting = /^#{1,3} /.test(this.content);
            const startsWithSubheadingFormatting = /^-# /.test(this.content);
            const contentWithoutEmotes = this.cleanContent.replace(/<?:.*?:\d*>?/g, '');
            const textIsJustOK = contentWithoutEmotes.replace(/[^a-zA-Z]/g, '') === "OK";
            const isInAllCaps = /[a-zA-Z](?=(.*)[a-zA-Z])/g.test(contentWithoutEmotes) && contentWithoutEmotes === contentWithoutEmotes.toLocaleUpperCase() && !textIsJustOK;
            this.isShouted = !startsWithSubheadingFormatting && (isInAllCaps || startsWithHeadingFormatting);
            this.locationIsAudioSurveilled = this.location.isAudioSurveilled();
            this.locationIsVideoSurveilled = this.location.isVideoSurveilled();
            this.neighboringRooms = new Collection();
            if (!this.location.tags.has("soundproof")) {
                for (const exit of this.location.exits.values()) {
                    const neighboringRoom = exit.dest;
                    // Prevent duplication when two rooms are connected by multiple exits.
                    if (this.neighboringRooms.has(neighboringRoom.id)) continue;
                    if (!neighboringRoom.tags.has("soundproof") && neighboringRoom.id !== this.location.id && (neighboringRoom.occupants.length > 0 || neighboringRoom.isAudioSurveilled())) {
                        this.neighboringRooms.set(neighboringRoom.id, neighboringRoom);
                        if (!this.locationIsAudioSurveilled && neighboringRoom.isAudioSurveilled())
                            this.neighboringAudioSurveilledRooms.set(neighboringRoom.id, neighboringRoom);
                    }
                }
            }
            if (this.speaker.hasBehaviorAttribute("sender")) {
                for (const livingPlayer of game.livingPlayers.values()) {
                    const receiverStatusEffects = livingPlayer.getBehaviorAttributeStatusEffects("receiver").map(status => status.id);
                    if (livingPlayer.hasBehaviorAttribute("receiver") && livingPlayer.name !== this.speaker.name && !this.receiverRooms.has(livingPlayer.location.id)) {
                        for (const equipmentSlot of livingPlayer.inventory.values()) {
                            for (const receiverStatusEffect of receiverStatusEffects) {
                                if (equipmentSlot.equippedItem !== null && equipmentSlot.equippedItem.prefab.equippedCommands.join(',').toLowerCase().includes(`inflict player ${receiverStatusEffect}`)) {
                                    this.receivers.set(livingPlayer.name, equipmentSlot.equippedItem);
                                    this.receiverRooms.set(livingPlayer.location.id, livingPlayer.location);
                                    if (livingPlayer.location.isAudioSurveilled()) this.receiverAudioSurveilledRooms.set(livingPlayer.location.id, livingPlayer.location);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (this.locationIsAudioSurveilled || this.neighboringAudioSurveilledRooms.size > 0 || this.receiverAudioSurveilledRooms.size > 0)
                this.audioMonitoringRooms = game.rooms.filter(room => room.isAudioMonitoring() && room.occupants.length !== 0 && room.id !== this.location.id && !this.neighboringAudioSurveilledRooms.has(room.id) && !this.receiverAudioSurveilledRooms.has(room.id));
        }
    }

    /**
     * Sets the message of this dialog object with the given message. Also sets the attachments and embeds with those belonging to the given message.
     * @param message 
     */
    setMessage(message: UserMessage): void {
        this.message = message;
        this.attachments = this.message.attachments;
        this.embeds = this.message.embeds;
    }

    /**
     * Returns true if this dialog is mimicking the given player.
     *
     * @param player - The player to check.
     */
    isMimicking(player: Player): boolean {
        return this.speaker.name !== player.name && this.speakerRecognitionName === player.name;
    }

    /**
     * Returns the prefix string to append before the rest of the message text in webhook messages. If the dialog was not whispered, returns an empty string.
     *
     * @param playerCanSeeSpeaker - Whether or not the given player can see the speaker.
     */
    getWhisperPrefixStringForWebhook(playerCanSeeSpeaker: boolean): string {
        const recipientPhrase = this.whisper?.players.size > 1 && playerCanSeeSpeaker ? ` to ${this.whisper.generatePlayerListStringExcluding(this.speaker)}` : ``;
        const hidingSpot = this.getGame().entityFinder.getFixture(this.whisper?.hidingSpotName, this.location.id);
        const hidingSpotPhrase = hidingSpot && playerCanSeeSpeaker ? ` in ${hidingSpot.getContainingPhrase()}` : ``;
        return this.whisper ? `-# *(Whispered${recipientPhrase}${hidingSpotPhrase}):*\n` : "";
    }

    /**
     * Returns the display name to use for the speaker in webhook messages. This depends on whether or not a given player can see the speaker.
     *
     * @param playerCanSeeSpeaker - Whether or not the given player can see the speaker.
     */
    getDisplayNameForWebhook(playerCanSeeSpeaker: boolean): string {
        return this.speaker.isHidden() && !playerCanSeeSpeaker ? `Someone in the room with ${this.speakerVoiceString}` : capitalizeFirstLetter(this.speakerDisplayName);
    }

    /**
     * Returns the display icon to use for the speaker in webhook messages. This depends on whether or not a given player can see the speaker.
     *
     * @param playerCanSeeSpeaker - Whether or not the given player can see the speaker.
     */
    getDisplayIconForWebhook(playerCanSeeSpeaker: boolean): string {
        return this.speaker.isHidden() && !playerCanSeeSpeaker ? this.getGame().settings.hiddenIconURL : this.speakerDisplayIcon;
    }
}
