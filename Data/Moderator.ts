import GameConstruct from "./GameConstruct.ts";
import type { GuildMember } from "discord.js";
import type Game from "./Game.ts";

/**
 * Represents a moderator of the game.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/moderator.html
 */
export default class Moderator extends GameConstruct implements User {
    /**
     * The Discord ID of the moderator.
     */
    readonly id: string;
    /**
     * The Discord member object of the moderator.
     */
    readonly member: GuildMember;

    constructor(id: string, member: GuildMember, game: Game) {
        super(game);
        this.id = id;
        this.member = member;
    }

    /**
     * Gets the moderator's current member display name.
     */
    public get displayName() {
        return this.member.displayName;
    }

    /**
     * Gets the moderator's current member display avatar URL.
     */
    public get displayIcon() {
        return this.member.displayAvatarURL();
    }
}
