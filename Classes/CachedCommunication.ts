import type { Snowflake } from "discord.js";

/** Represents a spectator mirrored communication. */
export interface MirroredCommunication {
    /** The message ID of the mirrored message. */
    message: Snowflake
    /** The webhook ID of the webhook used to mirror the message. */
    webhook: Snowflake
}

/** Represents a cached communication. */
export default class CachedCommunication {
    /** Message ID of the communication. */
    id: Snowflake
    /** List of mirrored messages representing this cached communication. */
    spectated: MirroredCommunication[]
    /** Author ID of the communication, or `null` if not proxied. */
    author: Snowflake | null
    /** Webhook ID used to proxy the communication, or `null` if not proxied. */
    webhook: Snowflake | null

    /**
     * @param id - Message ID of the communication.
     * @param [author=null] - Author ID of the communication, or `null` if not proxied.
     * @param [webhook=null] - Webhook ID used to proxy the communication, or `null` if not proxied.
     */
    constructor(id: Snowflake, author: Snowflake | null = null, webhook: Snowflake | null = null) {
        this.id = id
        this.spectated = []
        this.author = author
        this.webhook = webhook
    }

    cacheSpectated(message: Snowflake, webhook: Snowflake) {
        this.spectated.push({message: message, webhook: webhook})
    }
}