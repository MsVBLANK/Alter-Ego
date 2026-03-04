import fs from 'fs';
import Player from '../Data/Player.ts';
import { parseDescriptionWithErrors } from '../Modules/parser.js';
import { EOL } from 'os';
import { Collection } from 'discord.js';
import {loadPlayerDefaults} from "../Modules/settingsLoader.ts";

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "testparser_moderator",
    description: "Tests the parsing module on your descriptions.",
    details: `Tests the parsing algorithm responsible for interpreting and editing descriptions. `
        + `Sends the results as a text file to the command channel. `
        + `You can input a player name to parse the text as if that player is reading it. `
        + `This command should be used to make sure you've written properly formatted descriptions. `
        + `If there are any errors in your descriptions, they will be listed alongside the resulting file.`,
    usableBy: "Moderator",
    aliases: ["testparser"],
    requiresGame: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}testparser\n`
        + `${settings.commandPrefix}testparser kyra`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    const file = "./parsedText.xml";
    fs.writeFile(file, "", function (err) {
        if (err) return console.log(err);
    });

    /** @type {Player} */
    let player;
    if (args[0] && args[0] !== "formatted") {
        player = game.entityFinder.getLivingPlayer(args[0]);
        if (player === undefined) return game.communicationHandler.reply(message, `Couldn't find player "${args[0]}".`);
    }
    else {
        const [playerdefaults] = loadPlayerDefaults();
        player = new Player(
            "",
            null,
            "Cella",
            "",
            "female",
            "a cheery voice",
            playerdefaults.defaultStats,
            true,
            "",
            "",
            [],
            "<desc><s>You examine <const v=\"container.displayName\" />.</s> <if cond=\"container.hasBehaviorAttribute('concealed')\"><s><const v=\"container.pronouns.Sbj\" /> <if cond=\"container.pronouns.plural\">are</if><if cond=\"!container.pronouns.plural\">is</if> [HEIGHT], but <const v =\"container.pronouns.dpos\" /> face is concealed.</s></if><if cond=\"!container.hasBehaviorAttribute('concealed')\"><s><const v=\"container.pronouns.Sbj\" /><if cond=\"container.pronouns.plural\">'re</if><if cond=\"!container.pronouns.plural\">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s></if> <s><const v=\"container.pronouns.Sbj\" /> wear<if cond=\"!container.pronouns.plural\">s</if> <il name=\"equipment\"><item>a SHIRT</item>, <item>a pair of PANTS</item>, and <item>a pair of TENNIS SHOES</item></il>.</s> <s>You see <const v=\"container.pronouns.obj\" /> carrying <il name=\"hands\"></il>.</s></desc>",
            new Collection(),
            null,
            null,
            3,
            game
        );
        player.setPronouns(player.originalPronouns, player.pronounString);
        player.setPronouns(player.pronouns, player.pronounString);
    }

    const result = await testparse(game, file, player);
    let warnings = [];
    for (let i = 0; i < result.warnings.length; i++) {
        for (let j = 0; j < result.warnings[i].warnings.length; j++) {
            result.warnings[i].warnings[j] = result.warnings[i].warnings[j].replace(/\t/g, " ").replace(/\n/g, " ");
            warnings.push(`Warning on ${result.warnings[i].cell}: ${result.warnings[i].warnings[j]}`);
        }
    }
    if (warnings.length > 0) {
        // Trim excess warnings to not exceed Discord's 2000 character limit.
        const tooManyWarnings = warnings.length > 20 || warnings.join('\n').length >= 1980;
        while (warnings.length > 20 || warnings.join('\n').length >= 1980)
            warnings = warnings.slice(0, warnings.length - 1);
        if (tooManyWarnings)
            warnings.push("Too many warnings.");
        game.communicationHandler.sendToCommandChannel(warnings.join('\n'));
    }
    let errors = [];
    for (let i = 0; i < result.errors.length; i++) {
        for (let j = 0; j < result.errors[i].errors.length; j++) {
            result.errors[i].errors[j] = result.errors[i].errors[j].replace(/\t/g, " ").replace(/\n/g, " ");
            errors.push(`Error on ${result.errors[i].cell}: ${result.errors[i].errors[j]}`);
        }
    }
    if (errors.length > 0) {
        // Trim excess errors to not exceed Discord's 2000 character limit.
        const tooManyErrors = errors.length > 20 || errors.join('\n').length >= 1980;
        while (errors.length > 20 || errors.join('\n').length >= 1980)
            errors = errors.slice(0, errors.length - 1);
        if (tooManyErrors)
            errors.push("Too many errors.");
        game.communicationHandler.sendToCommandChannel(errors.join('\n'));
    }

    game.guildContext.commandChannel.send({
        content: "Text parsed.",
        files: [
            {
                attachment: file,
                name: `parsedText.xml`
            }
        ]
    });

    return;
};

/**
 * Parses all in-game descriptions and writes the results to a file.
 * If there's something wrong with any of the descriptions, issues warnings and errors.
 * @param {Game} game - The game being tested.
 * @param {string} fileName - The name of the file to write the results to.
 * @param {Player} player - The player to pass into the parser module.
 * @returns {Promise<TestParserResults>} All of the warnings and errors found when parsing descriptions.
 */
async function testparse (game, fileName, player) {
    const warnings = [];
    const errors = [];

    // Get rooms first.
    {
        await appendFile(fileName, "ROOMS:");
        let text = "";
        for (const room of game.rooms.values()) {
            text += "   ";
            text += room.displayName + EOL;

            for (const exit of room.exits.values()) {
                text += "      ";
                text += exit.name + EOL;

                if (exit.description.text !== "") {
                    const parsedDescription = parseDescriptionWithErrors(exit.description, room, player);
                    if (parsedDescription.warnings.length !== 0) warnings.push({ cell: exit.descriptionCell(), warnings: parsedDescription.warnings });
                    if (parsedDescription.errors.length !== 0) errors.push({ cell: exit.descriptionCell(), errors: parsedDescription.errors });

                    text += "         ";
                    text += exit.description.text + EOL;

                    text += "         ";
                    text += parsedDescription.text + EOL;
                }
            }
            text += EOL;
        }
        await appendFile(fileName, text);
    }

    // Get fixtures next.
    {
        await appendFile(fileName, "FIXTURES:");
        let text = "";
        for (let i = 0; i < game.fixtures.length; i++) {
            text += "   ";
            text += game.fixtures[i].name + EOL;

            if (game.fixtures[i].description.text !== "") {
                const parsedDescription = parseDescriptionWithErrors(game.fixtures[i].description, game.fixtures[i], player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: game.fixtures[i].descriptionCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: game.fixtures[i].descriptionCell(), errors: parsedDescription.errors });

                text += "      ";
                text += game.fixtures[i].description.text + EOL;

                text += "      ";
                text += parsedDescription.text + EOL;
            }
        }
        await appendFile(fileName, text);
    }

    // Get prefabs next.
    {
        await appendFile(fileName, "PREFABS:");
        let text = "";
        for (const prefab of game.prefabs.values()) {
            text += "   ";
            text += prefab.id + EOL;

            if (prefab.description.text !== "") {
                const parsedDescription = parseDescriptionWithErrors(prefab.description, prefab, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: prefab.descriptionCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: prefab.descriptionCell(), errors: parsedDescription.errors });

                text += "      ";
                text += prefab.description.text + EOL;

                text += "      ";
                text += parsedDescription.text + EOL;
            }
        }
        await appendFile(fileName, text);
    }

    // Get recipes next.
    {
        await appendFile(fileName, "RECIPES:");
        let text = "";
        for (const recipe of game.recipes) {
            text += "   ";
            text += "ROW " + recipe.row + EOL;

            const taggedFixture = game.fixtures.find(fixture => fixture.recipeTag === recipe.fixtureTag);
            // First, do the initiated text.
            if (recipe.initiatedDescription.text !== "") {
                text += "      MESSAGE WHEN INITIATED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(recipe.initiatedDescription, taggedFixture ? taggedFixture : recipe, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: recipe.initiatedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: recipe.initiatedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += recipe.initiatedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Next, do the completed text.
            if (recipe.completedDescription.text !== "") {
                text += "      MESSAGE WHEN COMPLETED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(recipe.completedDescription, taggedFixture ? taggedFixture : recipe, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: recipe.completedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: recipe.completedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += recipe.completedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Finally, do the uncrafted text.
            if (recipe.uncraftedDescription.text !== "") {
                text += "      MESSAGE WHEN UNCRAFTED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(recipe.uncraftedDescription, recipe, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: recipe.uncraftedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: recipe.uncraftedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += recipe.uncraftedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }
        }
        await appendFile(fileName, text);
    }

    // Get items next.
    {
        await appendFile(fileName, "ITEMS:");
        let text = "";
        for (const roomItem of game.roomItems) {
            text += "   ";
            text += roomItem.name + EOL;

            if (roomItem.description.text !== "") {
                const parsedDescription = parseDescriptionWithErrors(roomItem.description, roomItem, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: roomItem.descriptionCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: roomItem.descriptionCell(), errors: parsedDescription.errors });

                text += "      ";
                text += roomItem.description.text + EOL;

                text += "      ";
                text += parsedDescription.text + EOL;
            }
        }
        await appendFile(fileName, text);
    }

    // Get puzzles next.
    {
        await appendFile(fileName, "PUZZLES:");
        let text = "";
        for (const puzzle of game.puzzles) {
            text += "   ";
            text += puzzle.name + EOL;

            // First, do the correct description.
            if (puzzle.correctDescription.text !== "") {
                text += "      CORRECT ANSWER:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.correctDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.correctCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.correctCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.correctDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Next, do the already solved description.
            if (puzzle.alreadySolvedDescription.text !== "") {
                text += "      ALREADY SOLVED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.alreadySolvedDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.alreadySolvedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.alreadySolvedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.alreadySolvedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Next, do the unsolved description.
            if (puzzle.unsolvedDescription.text !== "") {
                text += "      UNSOLVED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.unsolvedDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.unsolvedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.unsolvedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.unsolvedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Next, do the incorrect description.
            if (puzzle.incorrectDescription.text !== "") {
                text += "      INCORRECT ANSWER:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.incorrectDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.incorrectCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.incorrectCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.incorrectDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Next, do the no more attempts description.
            if (puzzle.noMoreAttemptsDescription.text !== "") {
                text += "      NO MORE ATTEMPTS:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.noMoreAttemptsDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.noMoreAttemptsCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.noMoreAttemptsCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.noMoreAttemptsDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Finally, do the requirements not met description.
            if (puzzle.requirementsNotMetDescription.text !== "") {
                text += "      REQUIREMENTS NOT MET:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(puzzle.requirementsNotMetDescription, puzzle, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: puzzle.requirementsNotMetCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: puzzle.requirementsNotMetCell(), errors: parsedDescription.errors });

                text += "         ";
                text += puzzle.requirementsNotMetDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            text += EOL;
        }
        await appendFile(fileName, text);
    }

    // Get events next.
    {
        await appendFile(fileName, "EVENTS:");
        let text = "";
        for (const event of game.events.values()) {
            text += "   ";
            text += event.id + EOL;

            // First, do the triggered text.
            if (event.triggeredNarration.text !== "") {
                text += "      MESSAGE WHEN TRIGGERED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(event.triggeredNarration, event, null);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: event.triggeredCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: event.triggeredCell(), errors: parsedDescription.errors });

                text += "         ";
                text += event.triggeredNarration + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Finally, do the ended text.
            if (event.endedNarration.text !== "") {
                text += "      MESSAGE WHEN ENDED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(event.endedNarration, event, null);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: event.endedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: event.endedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += event.endedNarration + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            text += EOL;
        }
        await appendFile(fileName, text);
    }

    // Get status effects next.
    {
        await appendFile(fileName, "STATUS EFFECTS:");
        let text = "";
        for (const statusEffect of game.statusEffects.values()) {
            text += "   ";
            text += statusEffect.id + EOL;

            // First, do the inflicted text.
            if (statusEffect.inflictedDescription.text !== "") {
                text += "      MESSAGE WHEN INFLICTED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(statusEffect.inflictedDescription, statusEffect, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: statusEffect.inflictedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: statusEffect.inflictedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += statusEffect.inflictedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            // Finally, do the cured text.
            if (statusEffect.curedDescription.text !== "") {
                text += "      MESSAGE WHEN CURED:" + EOL;

                const parsedDescription = parseDescriptionWithErrors(statusEffect.curedDescription, statusEffect, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: statusEffect.curedCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: statusEffect.curedCell(), errors: parsedDescription.errors });

                text += "         ";
                text += statusEffect.curedDescription.text + EOL;

                text += "         ";
                text += parsedDescription.text + EOL;
            }

            text += EOL;
        }
        await appendFile(fileName, text);
    }

    // Get players next.
    {
        await appendFile(fileName, "PLAYERS:");
        let text = "";
        for (const gamePlayer of game.players.values()) {
            text += "   ";
            text += gamePlayer.name + EOL;

            if (gamePlayer.description.text !== "") {
                const parsedDescription = parseDescriptionWithErrors(gamePlayer.description, gamePlayer, player);
                if (parsedDescription.warnings.length !== 0) warnings.push({ cell: gamePlayer.descriptionCell(), warnings: parsedDescription.warnings });
                if (parsedDescription.errors.length !== 0) errors.push({ cell: gamePlayer.descriptionCell(), errors: parsedDescription.errors });

                text += "      ";
                text += gamePlayer.description.text + EOL;

                text += "      ";
                text += parsedDescription.text + EOL;
            }
        }
        await appendFile(fileName, text);
    }

    // Finally, get inventory items.
    {
        await appendFile(fileName, "INVENTORY ITEMS:");
        let text = "";
        for (const inventoryItem of game.inventoryItems) {
            if (inventoryItem.prefab !== null) {
                text += "   ";
                text += inventoryItem.name + EOL;

                if (inventoryItem.description.text !== "") {
                    const parsedDescription = parseDescriptionWithErrors(inventoryItem.description, inventoryItem, player);
                    if (parsedDescription.warnings.length !== 0) warnings.push({ cell: inventoryItem.descriptionCell(), warnings: parsedDescription.warnings });
                    if (parsedDescription.errors.length !== 0) errors.push({ cell: inventoryItem.descriptionCell(), errors: parsedDescription.errors });

                    text += "      ";
                    text += inventoryItem.description.text + EOL;

                    text += "      ";
                    text += parsedDescription.text + EOL;
                }
            }
        }
        await appendFile(fileName, text);
    }

    return { warnings: warnings, errors: errors };
}

/**
 * Appends text to the file.
 * @param {string} fileName - The name of the file to append.
 * @param {string} text - The text to add to the end of the file.
 * @returns {Promise<string>} The name of the file.
 */
function appendFile(fileName, text) {
    return new Promise((resolve) => {
        fs.appendFile(fileName, text + EOL, function (err) {
            if (err) return console.log(err);
            resolve(fileName);
        });
    });
}
