import { default as Narration, NarrationType } from '../Data/Narration.js';
import { capitalizeFirstLetter } from './helpers.js';
import { TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

/**
 * @import Game from "../Data/Game.js"
 * @import Player from "../Data/Player.js"
 * @import Room from "../Data/Room.js";
 */

/**
 * Creates an array of components for a narration.
 * @param {NarrationType} narrationType - The type of the narration.
 * @param {Game} game - The game the narration is for.
 * @param {string} messageText - The text content of the narration.
 * @param {Player} [player] - The player the narration is about. Optional.
 */
export function createNarrateComponents(narrationType, game, messageText, player) {
    switch (narrationType) {
		case NarrationType.STANDARD:
			return createStandardNarrationComponents(game, messageText);
		case NarrationType.ALERT:
			return createAlertNarrationComponents(game, messageText);
		case NarrationType.MINOR:
			return createMinorNarrationComponents(game, messageText);
		case NarrationType.PLAYER:
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
            .setAccentColor(Number(`0x${game.settings.standardNarrationAccentColor}`))
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
            .setAccentColor(Number(`0x${game.settings.alertNarrationAccentColor}`))
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
            .setAccentColor(Number(`0x${game.settings.standardNarrationAccentColor}`))
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
