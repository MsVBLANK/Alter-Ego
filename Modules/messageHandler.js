import Dialog from '../Data/Dialog.js';
import Player from '../Data/Player.js';
import AnnounceAction from '../Data/Actions/AnnounceAction.js';
import NarrateAction from '../Data/Actions/NarrateAction.js';
import SayAction from '../Data/Actions/SayAction.js';
import * as discordUtils from './discordUtils.js';
import { MessageDisplayType } from './enums.js';
import { capitalizeFirstLetter } from './helpers.js';
import { MessageFlags, ChannelType, Attachment, Collection, GuildMember, TextChannel, Embed, Webhook } from 'discord.js';

/** @import Game from '../Data/Game.js' */
/** @import Narration from '../Data/Narration.js' */
/** @import Room from '../Data/Room.js' */
/** @import Whisper from '../Data/Whisper.js' */

/**
 * Processes a message sent in a guild during a game and directs it to the relevant handlers.
 * @param {Game} game - The game the message is intended for.
 * @param {UserMessage} message - The message to process.
 */
export function processIncomingMessage(game, message) {
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
            player.notify(game.notificationGenerator.generatePlayerNoSpeechNotification(playerNoSpeechStatusEffects[0].id), false, MessageDisplayType.ALERT);
            message.delete().catch();
            return;
        }
        const location = isInAnnouncementChannel || isInWhisperChannel ? player.location : room;
        const dialog = new Dialog(game, message, player, location, message.content, isInAnnouncementChannel, whisper, message.cleanContent);
        if (dialog.isAnnouncement) {
            const announceAction = new AnnounceAction(game, message, dialog.speaker, dialog.location, false, dialog.whisper);
            announceAction.performAnnounce(dialog);
        }
        else {
            const sayAction = new SayAction(game, message, dialog.speaker, dialog.location, false, dialog.whisper);
            sayAction.performSay(dialog);
        }
    }
    else if (isModerator && (room || whisper)) {
        const location = whisper ? whisper.location : room;
        const narrateAction = new NarrateAction(game, message, undefined, location, false, whisper);
        game.narrationHandler.sendNarrateAction(MessageDisplayType.PLAIN_TEXT, narrateAction, message.content, message.member);
    }
}

/**
 * Narrates a message to a room.
 * @param {Room} room - The room to send the message to.
 * @param {Narration} narration - The narration being sent.
 * @param {string} messageText - The message to send.
 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Player} [player] - The player whose action the narration is about, if applicable.
 * @param {string} [webhookUsername] - The username to use for the narrated webhook message, if applicable.
 */
export function sendNarrationToRoom(room, narration, messageText, messageDisplayType, addSpectate = true, player = null, webhookUsername = narration.narratorDisplayName) {
    if (messageText !== "") {
        const files = narration.attachments.map((attachment) => attachment.url);
        const sendWebhookMessage = messageDisplayType === MessageDisplayType.PLAYER;
        let messageCreateOptions;
        if (sendWebhookMessage)
            messageCreateOptions = discordUtils.generateWebhookMessageDisplayCreateOptions(messageDisplayType, room.getGame(), messageText, webhookUsername, narration.narratorDisplayIcon, narration.embeds, files, player);
        else messageCreateOptions = discordUtils.generateMessageDisplayCreateOptions(messageDisplayType, room.getGame(), messageText, player);

        room.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    if (sendWebhookMessage) {
                        const webhook = await getOrCreateWebhook(room.channel);
                        webhook.send(messageCreateOptions);
                    }
                    else await room.channel.send(messageCreateOptions);
                },
            },
            "tell"
        );
        if (addSpectate) {
            room.occupants.forEach((occupant) => {
                if (doMirrorInSpectateChannel(occupant, player)) {
                    sendNarrationSpectateMessage(occupant, messageText, messageDisplayType, files, messageCreateOptions);
                }
            });
        }
    }
}

/**
 * Narrates a message to a whisper.
 * @param {Whisper} whisper - The whisper to send the message to. 
 * @param {Narration} narration - The narration being sent.
 * @param {string} messageText - The message to send. 
 * @param {string} messageTextWithSpectatePrefix - The message to send with a prefix for spectate channels indicating which whisper the narration occurred in.
 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Player} [player] - The player whose action the narration is about, if applicable.
 */
export function sendNarrationToWhisper(whisper, narration, messageText, messageTextWithSpectatePrefix, messageDisplayType, addSpectate = true, player = null) {
    if (messageText !== "") {
        const files = narration.attachments.map((attachment) => attachment.url);
        const sendWebhookMessage = messageDisplayType === MessageDisplayType.PLAYER;

        whisper.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    if (whisper.deleted) return;
                    let messageCreateOptions;
                    if (sendWebhookMessage) {
                        messageCreateOptions = discordUtils.generateWebhookMessageDisplayCreateOptions(messageDisplayType, whisper.getGame(), messageText, narration.narratorDisplayName, narration.narratorDisplayIcon, narration.embeds, files, player);
                        const webhook = await getOrCreateWebhook(whisper.channel);
                        webhook.send(messageCreateOptions);
                    }
                    else {
                        messageCreateOptions = discordUtils.generateMessageDisplayCreateOptions(messageDisplayType, whisper.getGame(), messageText, player);
                        await whisper.channel.send(messageCreateOptions);
                    }
                },
            },
            "tell"
        );
        if (addSpectate) {
            whisper.players.forEach((player) => {
                if (player.canSee() && player.isConscious() && player.spectateChannel !== null) {
                    let messageCreateOptions;
                    if (sendWebhookMessage) messageCreateOptions = discordUtils.generateWebhookMessageDisplayCreateOptions(messageDisplayType, whisper.getGame(), messageTextWithSpectatePrefix, narration.narratorDisplayName, narration.narratorDisplayIcon, [], [], player);
                    else messageCreateOptions = discordUtils.generateMessageDisplayCreateOptions(messageDisplayType, whisper.getGame(), messageTextWithSpectatePrefix);
                    sendNarrationSpectateMessage(player, messageText, messageDisplayType, files, messageCreateOptions);
                }
            });
        }
    }
}

/**
 * Sends a notification message to a player.
 * @param {Player} player - The player to send the message to.
 * @param {string} messageText - The message to send.
 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
 * @param {boolean} [addSpectate] - Whether or not to mirror the message in spectate channels. Defaults to true.
 * @param {Collection<string, Attachment>} [attachments] - A collection of attachments to send, if any.
 */
export function sendNotification(player, messageText, messageDisplayType, addSpectate = true, attachments = new Collection()) {
    const files = attachments.map((attachment) => attachment.url);
    const messageCreateOptions = discordUtils.generateMessageDisplayCreateOptions(messageDisplayType, player.getGame(), messageText, player, files);

    if (!player.isNPC) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    await player.notificationChannel.send(messageCreateOptions);
                },
            },
            "tell"
        );
    }
    if (addSpectate && player.spectateChannel !== null) {
        sendNarrationSpectateMessage(player, messageText, messageDisplayType, files, messageCreateOptions);
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
export function sendRoomDescription(player, location, descriptionText, occupantsString, defaultDropFixtureText, addSpectate = true) {
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
export function sendCommandHelp(game, channel, command) {
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
export function sendLogMessage(game, messageText) {
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
export function sendReply(game, message, messageText) {
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
 * Mirrors a narration in a spectate channel.
 * @param {Player} player - The player whose spectate channel this message is being sent to.
 * @param {string} messageText - The text of the message to send.
 * @param {MessageDisplayType} messageDisplayType - The type of message to send.
 * @param {string[]} [files] - A collection of attachments to send, if any.
 * @param {object} [messageCreateOptions] - The message create options to send. Optional.
 */
export function sendNarrationSpectateMessage(player, messageText, messageDisplayType, files = [], messageCreateOptions = discordUtils.generateMessageDisplayCreateOptions(messageDisplayType, player.getGame(), messageText, player, files)) {
    player.getGame().messageQueue.enqueue(
        {
            fire: async () => {
                const sendWebhookMessage = messageDisplayType === MessageDisplayType.PLAYER;
                if (sendWebhookMessage) {
                    const webhook = await getOrCreateWebhook(player.spectateChannel);
                    await webhook.send(messageCreateOptions);
                }
                else await player.spectateChannel.send(messageCreateOptions);
            },
        },
        "spectator"
    );
}

/**
 * Mirrors a message in a spectate channel as a webhook.
 * @param {Player} player - The player whose spectate channel this message is being sent to.
 * @param {string} messageText - The text of the message to send.
 * @param {string} webhookUsername - The username to use for the mirrored webhook message.
 * @param {string} webhookAvatarURL - The avatar URL to use for the mirrored webhook message.
 * @param {Embed[]} [embeds] - An array of embeds to send in the message. Optional. 
 * @param {string[]} [files] - An array of URLs to send as attachments. Optional.
 * @param {UserMessage} [message] - The message being mirrored. Optional.
 * @param {MessageDisplayType} [messageDisplayType] - The type of message to send. Defaults to PLAIN_TEXT.
 * @param {Player} [speaker] - The player who initiated the webhook message. Optional.
 */
export function sendWebhookSpectateMessage(player, messageText, webhookUsername, webhookAvatarURL, embeds = [], files = [], message, messageDisplayType = MessageDisplayType.PLAIN_TEXT, speaker) {
    if (player.spectateChannel !== null) {
        player.getGame().messageQueue.enqueue(
            {
                fire: async () => {
                    const webhook = await getOrCreateWebhook(player.spectateChannel);
                    const webhookMessage = await sendWebhookMessage(
                        webhook,
                        messageText,
                        webhookUsername,
                        webhookAvatarURL,
                        embeds,
                        files,
                        player.getGame(),
                        messageDisplayType,
                        speaker
                    );
                    if (message) player.getGame().communicationHandler.cacheSpectateMirrorForDialog(message, webhookMessage.id, webhook.id);
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
export function editSpectatorMessage(game, messageOld, messageNew) {
    const spectateMirrors = game.communicationHandler.getDialogSpectateMirrors(messageOld);
    if (!spectateMirrors) return;
    spectateMirrors.forEach(async (mirror) => {
        const webhook = await messageOld.client.fetchWebhook(mirror.webhookId);
        if (webhook) {
            let messageText = messageNew.content;
            if (messageOld.channel.type === ChannelType.GuildText && messageOld.channel.parentId === game.guildContext.whisperCategoryId) {
                const relatedMessage = await webhook.fetchMessage(mirror.messageId);
                const regexGroups = relatedMessage.content.match(new RegExp(/((?:-# )?\*\(Whispered(?:.*)\):\*\n)(.*)/m));
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
 * @param {Embed[]} [embeds] - An array of embeds to send in the message. Optional. 
 * @param {string[]} [files] - An array of URLs to send as attachments. Optional.
 * @param {Game} [game] - The game the message is for. Optional.
 * @param {MessageDisplayType} [messageDisplayType] - The type of message to send. Defaults to PLAIN_TEXT.
 * @param {Player} [player] - The player who initiated the webhook message. Optional.
 */
export async function sendWebhookMessage(webhook, content, username, avatarURL, embeds = [], files = [], game, messageDisplayType = MessageDisplayType.PLAIN_TEXT, player) {
    const createdMessage = await webhook.send(discordUtils.generateWebhookMessageDisplayCreateOptions(messageDisplayType, game, content, username, avatarURL, embeds, files, player));
    return createdMessage;
}

/**
 * @param {Game} game - The game whose message queue should have its messages sent.
 */
export async function sendQueuedMessages(game) {
    if (game.messageQueue.firing) return;
    game.messageQueue.firing = true;
    while (game.messageQueue.size() > 0) {
        const message = game.messageQueue.dequeue();
        try {
            await message.fire();
        } catch (error) {
            console.error("Message Handler encountered exception sending message:", error);
        }
    }
    game.messageQueue.firing = false;
}

/**
 * @param {Game} game - The game whose message queue should be emptied. 
 */
export function clearQueue(game) {
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
