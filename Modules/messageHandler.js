import Dialog from '../Data/Dialog.js';
import { NarrationType } from '../Data/Narration.js';
import Player from '../Data/Player.js';
import AnnounceAction from '../Data/Actions/AnnounceAction.js';
import NarrateAction from '../Data/Actions/NarrateAction.js';
import SayAction from '../Data/Actions/SayAction.js';
import * as discordUtils from './discordUtils.js';
import { capitalizeFirstLetter } from './helpers.js';
import { MessageFlags, ChannelType, Attachment, Collection, GuildMember, TextChannel, Embed, Webhook } from 'discord.js';

/** @typedef {import('../Data/Game.js').default} Game */
/** @typedef {import('../Data/Narration.js').default} Narration */
/** @typedef {import('../Data/Room.js').default} Room */
/** @typedef {import('../Data/Whisper.js').default} Whisper */

/**
 * Processes a message sent in a guild during a game and directs it to the relevant handlers.
 * @param {Game} game - The game the message is intended for.
 * @param {UserMessage} message - The message to process.
 */
export async function processIncomingMessage(game, message) {
    if (message.channel.type !== ChannelType.GuildText) return;
    const isInWhisperChannel = message.channel.parentId === game.guildContext.whisperCategoryId;
    const isInAnnouncementChannel = message.channel.id === game.guildContext.announcementChannel.id;
    const isInRoomChannel = game.guildContext.roomCategories.includes(message.channel.parentId);
    if (!isInWhisperChannel && !isInAnnouncementChannel && !isInRoomChannel) return;

    game.communicationHandler.cacheDialog(message);

    const isModerator = message.member && message.member.roles.cache.has(game.guildContext.moderatorRole.id);
    const room = game.entityFinder.getRoom(message.channel.name);
    const whisper = game.entityFinder.getWhisperByChannelId(message.channel.id);
    const player = game.entityFinder.getLivingPlayerById(message.author.id);
    if (player) {
        player.setOnline();
        const playerNoSpeechStatusEffects = player.getBehaviorAttributeStatusEffects("no speech");
        if (playerNoSpeechStatusEffects.length > 0) {
            player.notify(game.notificationGenerator.generatePlayerNoSpeechNotification(playerNoSpeechStatusEffects[0].id), false, NarrationType.ALERT);
            message.delete().catch();
            return;
        }
        const location = isInAnnouncementChannel || isInWhisperChannel ? player.location : room;
        const dialog = new Dialog(game, message, player, location, message.cleanContent, isInAnnouncementChannel, whisper);
        if (dialog.isAnnouncement) {
            const announceAction = new AnnounceAction(game, message, dialog.speaker, dialog.location, false, dialog.whisper);
            await announceAction.performAnnounce(dialog);
        }
        else {
            const sayAction = new SayAction(game, message, dialog.speaker, dialog.location, false, dialog.whisper);
            await sayAction.performSay(dialog);
        }
    }
    else if (isModerator && (room || whisper)) {
        const location = whisper ? whisper.location : room;
        const narrateAction = new NarrateAction(game, message, undefined, location, false, whisper);
        game.narrationHandler.sendDialogTypeNarration(narrateAction, message.content, message.member);
    }
}

/**
 * Narrates a message to a room.
 * @param {Room} room - The room to send the message to.
 * @param {string} messageText - The message to send.
 * @param {NarrationType} narrationType - The type of narration to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Player} [player] - The player whose action the narration is about, if applicable.
 */
export async function sendNarrationToRoom(room, messageText, narrationType, addSpectate = true, player = null) {
    if (messageText !== "") {
        const components = discordUtils.createNarrateComponents(narrationType, room.getGame(), messageText, player);

        room.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await room.channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                },
            },
            "tell"
        );
        if (addSpectate) {
            room.occupants.forEach((occupant) => {
                if (doMirrorInSpectateChannel(occupant, player)) {
                    room.getGame().messageQueue.enqueue(
                        {
                            fire: async () => {
                                await occupant.spectateChannel.send({
                                    components: components,
                                    flags: MessageFlags.IsComponentsV2
                                });
                            },
                        },
                        "spectator"
                    );
                }
            });
        }
    }
}

/**
 * Narrates a message to a room as plain text.
 * @param {Room} room - The room to send the message to.
 * @param {string} messageText - The message to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Player} [player] - The player whose action the narration is about, if applicable.
 */
export async function sendPlainTextNarrationToRoom(room, messageText, addSpectate = true, player = null) {
    if (messageText !== "") {
        room.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await room.channel.send(messageText);
                },
            },
            "tell"
        );
        if (addSpectate) {
            room.occupants.forEach((occupant) => {
                if (doMirrorInSpectateChannel(occupant, player)) {
                    room.getGame().messageQueue.enqueue(
                        {
                            fire: async () => {
                                await occupant.spectateChannel.send(messageText);
                            },
                        },
                        "spectator"
                    );
                }
            });
        }
    }
}

/**
 * Narrates a message to a whisper.
 * @param {Whisper} whisper - The whisper to send the message to. 
 * @param {string} messageText - The message to send. 
 * @param {NarrationType} narrationType - The type of narration to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 */
export async function sendNarrationToWhisper(whisper, messageText, narrationType, addSpectate = true) {
    if (messageText !== "") {
        whisper.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await whisper.channel.send({
                        components: discordUtils.createNarrateComponents(narrationType, whisper.getGame(), messageText),
                        flags: MessageFlags.IsComponentsV2,
                    });
                },
            },
            "tell"
        );
        if (addSpectate) {
            whisper.playersCollection.forEach((player) => {
                const hidingSpot = whisper.getGame().entityFinder.getFixture(whisper.hidingSpotName, player.location.id);
                const preposition = hidingSpot ? capitalizeFirstLetter(hidingSpot.getPreposition()) : "In";
                let spectateMessageText = `-# *(${preposition} ${hidingSpot ? hidingSpot.getContainingPhrase() : `a whisper`} with ${whisper.generatePlayerListString()}):*\n${messageText}`;
                if (player.canSee() && player.isConscious() && player.spectateChannel !== null) {
                    whisper.getGame().messageQueue.enqueue(
                        {
                            fire: async () => {
                                await player.spectateChannel.send({
                                    components: discordUtils.createNarrateComponents(narrationType, whisper.getGame(), spectateMessageText),
                                    flags: MessageFlags.IsComponentsV2,
                                });
                            },
                        },
                        "spectator"
                    );
                }
            });
        }
    }
}

/**
 * Sends a notification message to a player.
 * @param {Player} player - The player to send the message to.
 * @param {string} messageText - The message to send.
 * @param {NarrationType} notificationType - The type of notification to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Collection<string, Attachment>} [attachments] - A collection of attachments to send, if any.
 */
export async function sendNotification(player, messageText, notificationType, addSpectate = true, attachments = new Collection()) {
    const components = discordUtils.createNarrateComponents(notificationType, player.getGame(), messageText, player);
    const files = attachments.map((attachment) => attachment.url);

    if (!player.isNPC) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await player.notificationChannel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                        files: files
                    });
                },
            },
            "tell"
        );
    }
    if (addSpectate && player.spectateChannel !== null) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await player.spectateChannel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                        files: files
                    });
                },
            },
            "spectator"
        );
    }
}

/**
 * Sends a notification message to a player as plain text.
 * @param {Player} player - The player to send the message to.
 * @param {string} messageText - The message to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Collection<string, Attachment>} [attachments] - A collection of attachments to send, if any.
 */
export async function sendPlainTextNotification(player, messageText, addSpectate = true, attachments = new Collection()) {
    const files = attachments.map((attachment) => attachment.url);

    if (!player.isNPC) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await player.notificationChannel.send({
                        content: messageText,
                        files: files
                    });
                },
            },
            "tell"
        );
    }
    if (addSpectate && player.spectateChannel !== null) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await player.spectateChannel.send({
                        content: messageText,
                        files: files
                    });
                },
            },
            "spectator"
        );
    }
}

/**
 * Sends the room description to a player as an array of Discord Components.
 * @param {Player} player - The player to send the message to.
 * @param {Room} location - The room whose description is being sent. 
 * @param {string} descriptionText - The description of the room to send. 
 * @param {string} occupantsString - The list of occupants in the room.
 * @param {string} defaultDropFixtureText - The description of the default drop fixture in this room. 
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 */
export async function sendRoomDescription(player, location, descriptionText, occupantsString, defaultDropFixtureText, addSpectate = true) {
    if (!player.isNPC || (addSpectate && player.spectateChannel !== null)) {
        const components = discordUtils.createRoomDescriptionComponents(location, descriptionText, occupantsString, defaultDropFixtureText, location.getGame().settings.embedAccentColor);
        if (!player.isNPC) {
            location.getGame().messageQueue.enqueue(
                {
                    fire: async () => {
                        await player.notificationChannel.send({
                            components: components,
                            flags: MessageFlags.IsComponentsV2,
                        });
                    },
                },
                "tell"
            );
        }
        if (addSpectate && player.spectateChannel !== null) {
            location.getGame().messageQueue.enqueue(
                {
                    fire: async () => {
                        await player.spectateChannel.send({
                            components: components,
                            flags: MessageFlags.IsComponentsV2,
                        });
                    },
                },
                "spectator"
            );
        }
    }
}

/**
 * Sends the help menu for a command as an array of Discord Components.
 * @param {Game} game - The game context in which this help menu is being sent.
 * @param {Messageable} channel - The channel to send the help menu to.
 * @param {Command} command - The command to display the help menu for.
 */
export async function sendCommandHelp(game, channel, command) {
    const commandName = capitalizeFirstLetter(command.config.name.substring(0, command.config.name.indexOf('_')));
    const title = `**${commandName} Command Help**`;
    const description = command.config.description;
    let aliasString = "";
    for (const alias of command.config.aliases)
        aliasString += `\`${game.settings.commandPrefix}${alias}\` `;
    const usage = command.usage(game.settings);
    const details = command.config.details;
    const thumbnailURL = game.guildContext.guild.members.me.avatarURL() || game.guildContext.guild.members.me.user.avatarURL();
    const color = game.settings.embedAccentColor;

    game.messageQueue.enqueue(
        {
            fire: async () =>
                {
                    await channel.send({
                        components: discordUtils.createCommandHelpComponents(title, description, aliasString, usage, details, thumbnailURL, color),
                        flags: MessageFlags.IsComponentsV2,
                    });
                }
        },
        channel.id === game.guildContext.commandChannel.id ? "mod" : "mechanic"
    );
}

/**
 * Sends a message to the game's log channel.
 * @param {Game} game - The game in which to send a log message.
 * @param {string} messageText - The message to send.
 */
export async function sendLogMessage(game, messageText) {
    game.messageQueue.enqueue(
        {
            fire: async () => {
                await game.guildContext.logChannel.send(messageText);
            },
        },
        "log"
    );
}

/**
 * Sends a standard message indicating the outcome of a game mechanic in the specified channel.
 * @param {Game} game - The game in which this mechanic is occurring.
 * @param {Messageable} channel - The channel to send the message to.
 * @param {string} messageText - The message to send.
 */
export function sendGameMechanicMessage(game, channel, messageText) {
    game.messageQueue.enqueue(
        {
            fire: async () => {
                await channel.send(messageText);
            },
        },
        channel.id === game.guildContext.commandChannel.id ? "mod" : "mechanic"
    );
}

/**
 * Replies to a message. This is usually done when a user has sent a message with an error.
 * @param {Game} game - The game this message was sent in.
 * @param {UserMessage} message - The message to reply to.
 * @param {string} messageText - The text to send in response.
 */
export async function sendReply(game, message, messageText) {
    game.messageQueue.enqueue(
        {
            fire: async () => {
                if (message.channel.type === ChannelType.GuildText && message.channel.id === game.guildContext.commandChannel.id) {
                    await message.reply(messageText);
                } else {
                    await message.author.send(messageText);
                }
            },
        },
        message.channel.type === ChannelType.GuildText && message.channel.id === game.guildContext.commandChannel.id ? "mod" : "mechanic"
    );
}

/**
 * Mirrors a dialog message in a spectate channel.
 * @deprecated
 * @param {Player} player - The player whose spectate channel this message is being sent to.
 * @param {Player|PseudoPlayer|GuildMember} speaker - The player who originally sent the dialog message.
 * @param {UserMessage} message - The message in which this dialog originated.
 * @param {Whisper} [whisper] - The whisper the dialog was sent in, if applicable.
 * @param {string} [displayName] - The displayName to use for the mirrored webhook message. If none is specified, the speaker's current displayName will be used.
 */
export async function addSpectatedPlayerMessage(player, speaker, message, whisper = null, displayName = null) {
    if (player.spectateChannel !== null) {
        const messageText =
            whisper && whisper.playersCollection.size > 1
                ? `*(Whispered to ${whisper.generatePlayerListStringExcludingDisplayName(speaker.displayName)}):*\n${message.content || ""}`
                : whisper
                    ? `*(Whispered):*\n${message.content || ""}`
                    : message.content || "";

        const webhook = await getOrCreateWebhook(player.spectateChannel);
        const files = message.attachments.map((attachment) => attachment.url);

        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    const webhookMessage = await sendWebhookMessage(
                        webhook,
                        messageText,
                        displayName ? displayName : speaker.displayName,
                        !(speaker instanceof GuildMember) && speaker.displayIcon
                            ? speaker.displayIcon
                            : speaker instanceof Player && speaker.member
                                ? speaker.member.displayAvatarURL()
                                : message.author.avatarURL() || message.author.defaultAvatarURL,
                        message.embeds,
                        files,
                    );
                    player.getGame().communicationHandler.cacheSpectateMirrorForDialog(message, webhookMessage.id, webhook.id);
                },
            },
            "spectator"
        );
    }
}

/**
 * Mirrors a message in a spectate channel.
 * @param {Player} player - The player whose spectate channel this message is being sent to.
 * @param {UserMessage} message - The message being mirrored.
 * @param {string} messageText - The text of the message to send.
 * @param {string} webhookUsername - The username to use for the mirrored webhook message.
 * @param {string} webhookAvatarURL - The avatar URL to use for the mirrored webhook message.
 * @param {Embed[]} [embeds] - An array of embeds to send in the message. Optional. 
 * @param {string[]} [files] - An array of URLs to send as attachments. Optional.
 */
export async function sendWebhookSpectateMessage(player, message, messageText, webhookUsername, webhookAvatarURL, embeds = [], files = []) {
    if (player.spectateChannel !== null) {
        const webhook = await getOrCreateWebhook(player.spectateChannel);
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    const webhookMessage = await sendWebhookMessage(
                        webhook,
                        messageText,
                        webhookUsername,
                        webhookAvatarURL,
                        embeds,
                        files
                    );
                    player.getGame().communicationHandler.cacheSpectateMirrorForDialog(message, webhookMessage.id, webhook.id);
                },
            },
            "spectator"
        );
    }
}

/**
 * Edits spectate messages when the dialog they mirror is edited.
 * @param {Game} game - The game this dialog belongs to.
 * @param {UserMessage|import('discord.js').PartialMessage} messageOld - The original message being edited.
 * @param {UserMessage} messageNew - The new message after being edited.
 */
export async function editSpectatorMessage(game, messageOld, messageNew) {
    const spectateMirrors = game.communicationHandler.getDialogSpectateMirrors(messageOld);
    if (!spectateMirrors) return;
    spectateMirrors.forEach(async (mirror) => {
        const webhook = await messageOld.client.fetchWebhook(mirror.webhookId);
        if (webhook) {
            let messageText = messageNew.content;
            if (messageOld.channel.type === ChannelType.GuildText && messageOld.channel.parentId === game.guildContext.whisperCategoryId) {
                const relatedMessage = await webhook.fetchMessage(mirror.messageId);
                const regexGroups = relatedMessage.content.match(new RegExp(/(\*\(Whispered(?:.*)\):\*\n)(.*)/m));
                if (regexGroups) messageText = regexGroups[1] + messageNew.content;
            }
            webhook.editMessage(mirror.messageId, { content: messageText });
        }
    });
}

/**
 * Gets the client's webhook for the given channel, or creates one if it doesn't exist already.
 * @param {TextChannel} channel - The channel to get or create a webhook for. 
 */
export async function getOrCreateWebhook(channel) {
    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(webhook => webhook.owner.id === channel.client.user.id);
    if (webhook === undefined)
        webhook = await channel.createWebhook({ name: channel.name });
    return webhook;
}

/**
 * Sends a webhook message in the specified channel.
 * @param {Webhook} webhook - The channel to send the webhook message to.
 * @param {string} content - The content of the message to send. 
 * @param {string} username - The username of the webhook message. 
 * @param {string} avatarURL - The URL of the icon to use for the webhook message. 
 * @param {Embed[]} embeds - An array of embeds to send in the message. Optional. 
 * @param {string[]} files - An array of URLs to send as attachments. Optional.
 */
export async function sendWebhookMessage(webhook, content, username, avatarURL, embeds = [], files = []) {
    const createdMessage = await webhook.send({
        content: content,
        username: username,
        avatarURL: avatarURL,
        embeds: embeds,
        files: files
    });
    return createdMessage;
}

/**
 * @param {Game} game - The game whose message queue should have its messages sent.
 */
export async function sendQueuedMessages(game) {
    while (game.messageQueue.size() > 0) {
        const message = game.messageQueue.dequeue();
        try {
            await message.fire();
        } catch (error) {
            console.error("Message Handler encountered exception sending message:", error);
        }
    }
}

/**
 * @param {Game} game - The game whose message queue should be emptied. 
 */
export async function clearQueue(game) {
    game.messageQueue.clear();
}

/**
 * Returns true if the message should be mirrored in the given player's spectate channel.
 * @param {Player} player - The player whose spectate channel the message would be mirrored in.
 * @param {Player} performer - The player who performed the action.
 */
function doMirrorInSpectateChannel(player, performer) {
    return (performer === null || performer.name !== player.name)
        && (!player.hasBehaviorAttribute("no channel") || player.hasBehaviorAttribute("see room"))
        && player.canSee()
        && player.isConscious()
        && player.spectateChannel !== null
}
