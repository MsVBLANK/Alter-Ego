import { MessageDisplayType } from './enums.js';
import { capitalizeFirstLetter } from './helpers.js';
import { EmbedBuilder, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from 'discord.js';

/**
 * @import Game from "../Data/Game.js"
 * @import Player from "../Data/Player.js"
 * @import Room from "../Data/Room.js";
 * @typedef {import('discord.js').BitFieldResolvable<"SuppressEmbeds" | "SuppressNotifications" | "IsComponentsV2", MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications | MessageFlags.IsComponentsV2>} Flags
 */

/**
 * Generates the message create options for a narration or notification.
 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
 * @param {Game} game - The game the message is for.
 * @param {string} messageText - The text content of the message. 
 * @param {Player} [player] - The player the message is about. Optional.
 * @param {string[]} [files] - An array of file URLs to send. Optional.
 */
export function generateMessageDisplayCreateOptions(messageDisplayType, game, messageText, player, files = []) {
    /** @type {Flags} */
    let flags;
    if (messageDisplayType === MessageDisplayType.MINOR) flags = MessageFlags.IsComponentsV2 | MessageFlags.SuppressNotifications;
    else if (messageDisplayType !== MessageDisplayType.PLAIN_TEXT) flags = MessageFlags.IsComponentsV2; 
    return {
        content: messageDisplayType === MessageDisplayType.PLAIN_TEXT ? messageText : '',
        components: messageDisplayType === MessageDisplayType.PLAIN_TEXT ? [] : createNarrateComponents(messageDisplayType, game, messageText, player),
        flags: flags,
        files: files
    };
}

/**
 * Creates an array of components for a narration.
 * @param {MessageDisplayType} messageDisplayType - The display type of the message to send.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 * @param {Player} [player] - The player the narration is about. Optional.
 */
function createNarrateComponents(messageDisplayType, game, messageText, player) {
    switch (messageDisplayType) {
		case MessageDisplayType.STANDARD:
			return createStandardNarrationComponents(game, messageText);
        case MessageDisplayType.WARNING:
            return createWarningNarrationComponents(game, messageText);
		case MessageDisplayType.ALERT:
			return createAlertNarrationComponents(game, messageText);
		case MessageDisplayType.MINOR:
			return createMinorNarrationComponents(game, messageText);
		case MessageDisplayType.PLAYER:
			return createPlayerNarrationComponents(game, messageText, player);
		default:
			return createStandardNarrationComponents(game, messageText);
	} 
}

/**
 * Creates the components for a standard narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 */
function createStandardNarrationComponents(game, messageText) {
	return [
		new ContainerBuilder()
            .setAccentColor(Number(`0x${game.settings.standardMessageDisplayAccentColor}`))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(messageText),
        )
	];
}

/**
 * Creates the components for a warning narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 */
function createWarningNarrationComponents(game, messageText) {
	return [
		new ContainerBuilder()
            .setAccentColor(Number(`0x${game.settings.warningMessageDisplayAccentColor}`))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(messageText),
        )
	];
}

/**
 * Creates the components for an alert narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 */
function createAlertNarrationComponents(game, messageText) {
	return [
		new ContainerBuilder()
            .setAccentColor(Number(`0x${game.settings.alertMessageDisplayAccentColor}`))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(messageText),
        )
	];
}

/**
 * Creates the components for a minor narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 */
function createMinorNarrationComponents(game, messageText) {
	return [
		new TextDisplayBuilder().setContent(`> -# ${messageText}`)
	];
}

/**
 * Creates the components for a player narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 * @param {Player} player - The player the narration is about.
 */
function createPlayerNarrationComponents(game, messageText, player) {
	return [
		new ContainerBuilder()
            .setAccentColor(Number(`0x${game.settings.standardMessageDisplayAccentColor}`))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(messageText),
        )
	];
}

/**
 * Creates an array of components for a room description.
 * @param {Room} location - The room to be displayed.
 * @param {string} descriptionText - The description of the room to send. 
 * @param {string} occupantsString - The list of occupants in the room.
 * @param {string} defaultDropFixtureText - The description of the default drop fixture in this room. 
 * @param {string} color - The color as a hex code.
 */
export function createRoomDescriptionComponents(location, descriptionText, occupantsString, defaultDropFixtureText, color) {
    return [
        new ContainerBuilder()
            .setAccentColor(Number(`0x${color}`))
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(location.getIconURL())
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("_ _"),
                        new TextDisplayBuilder().setContent(`**${location.displayName}**`),
                        new TextDisplayBuilder().setContent("_ _")
                    )
            ),
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false),
        new TextDisplayBuilder().setContent(descriptionText),
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false),
        new TextDisplayBuilder().setContent("**Occupants**"),
        new TextDisplayBuilder().setContent(occupantsString),
        new TextDisplayBuilder().setContent(`**${capitalizeFirstLetter(location.getGame().settings.defaultDropFixture.toLocaleLowerCase())}**`),
        new TextDisplayBuilder().setContent(defaultDropFixtureText),
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    ];
}

/**
 * Creates an array of components for a command help display.
 * @param {string} title - The title of the help display. Should include the name of the command.
 * @param {string} description - The description of the command.
 * @param {string} aliasString - A comma-separated list of aliases for the command.
 * @param {string} usage - A newline-separated list of examples of the command's usage.
 * @param {string} details - Details about the command's usage.
 * @param {string} thumbnailURL - The URL of an image to use as the thumbnail of the display.
 * @param {string} color - The color as a hex code.
 */
export function createCommandHelpComponents(title, description, aliasString, usage, details, thumbnailURL, color) {
    return [
        new ContainerBuilder()
            .setAccentColor(Number(`0x${color}`))
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(thumbnailURL)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(title),
                        new TextDisplayBuilder().setContent(description)
                    )
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("**Aliases**")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(aliasString)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("**Examples**")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(usage)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("**Details**")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(details)
            )
    ];
}

/**
 * Creates a page of an embed.
 * @param {Game} game - The game context.
 * @param {number} page - The current page number.
 * @param {*[][]} pages - All of the entries, divided into pages.
 * @param {string} authorName - The title of the embed.
 * @param {string} authorIcon - The thumbnail URL to display for the embed.
 * @param {string} description - The description of the embed.
 * @param {(entryIndex: any) => string} getFieldName - A function to generate the name of each field in the embed.
 * @param {(entryIndex: any) => string} getFieldValue - A function to generate the value of each field in the embed.
 */
export function createPaginatedEmbed(game, page, pages, authorName, authorIcon, description, getFieldName, getFieldValue) {
	let embed = new EmbedBuilder()
		.setColor(Number(`0x${game.settings.embedAccentColor}`))
		.setAuthor({ name: authorName, iconURL: authorIcon })
		.setDescription(description)
		.setFooter({ text: `Page ${page + 1}/${pages.length}` });
	let fields = [];
	for (let entryIndex = 0; entryIndex < pages[page].length; entryIndex++)
		fields.push({ name: getFieldName(entryIndex), value: getFieldValue(entryIndex) });
	embed.addFields(fields);
	return embed;
}
