/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setpronouns_moderator",
    description: "Sets a player's pronouns.",
    details: `Sets the pronouns that will be used in the given player's description and other places where pronouns are `
        + `used. This will not change their pronouns on the spreadsheet, and when player data is reloaded, their `
        + `pronouns will be reverted to their original pronouns.\n\n`
        + `To set a player's pronouns, enter their name, followed by a set of pronouns. Pronoun sets must be given `
        + `in the form:\n`
        + `\`subjective/objective/dependent possessive/independent possessive/reflexive/plural\`.\n`
        + `However, you can use shorthand for the most common pronoun sets:\n`
        + '- "female" (`she/her/her/hers/herself/false`), \n'
        + '- "male" (`he/him/his/his/himself/false`), and \n'
        + '- "neutral" (`they/them/their/theirs/themself/true`).\n\n'
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `pronouns will be set to "neutral", thus overwriting any that were set manually. However, this command can `
        + `be used to update their pronouns again afterwards. When the status is cured, their pronouns will be reset.`,
    usableBy: "Moderator",
    aliases: ["setpronouns"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}setpronouns Lain female\n`
        + `${settings.commandPrefix}setpronouns Amadeus neutral\n`
        + `${settings.commandPrefix}setpronouns Platt male\n`
        + `${settings.commandPrefix}setpronouns Unit_050 it/it/its/its/itself/false\n`
        + `${settings.commandPrefix}setpronouns Asuka she/it/her/its/herself/false\n`
        + `${settings.commandPrefix}setpronouns Hollow ey/em/eir/eirs/emself/true\n`
        + `${settings.commandPrefix}setpronouns Aeries xey/xem/xeir/xeirs/xemself/true`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    if (args.length !== 2)
        return game.communicationHandler.reply(message, `You need to specify a player and a pronoun set. Usage:\n${usage(game.settings)}`);

    const player = game.entityFinder.getLivingPlayer(args[0]);
    if (player === undefined) return game.communicationHandler.reply(message, `Player "${args[0]}" not found.`);
    args.splice(0, 1);

    const input = args.join(" ").toLowerCase();
    if (input !== "female" && input !== "male" && input !== "neutral" && input.split('/').length !== 6)
        return game.communicationHandler.reply(message, `The supplied pronoun string is invalid.`);
    player.setPronouns(player.pronouns, input);

    // Check if the pronouns were set correctly.
    let correct = true;
    let errorMessage = "";
    if (player.pronouns.sbj === null || player.pronouns.sbj === "") {
        correct = false;
        errorMessage += "No subject pronoun was given.\n";
    }
    if (player.pronouns.obj === null || player.pronouns.obj === "") {
        correct = false;
        errorMessage += "No object pronoun was given.\n";
    }
    if (player.pronouns.dpos === null || player.pronouns.dpos === "") {
        correct = false;
        errorMessage += "No dependent possessive pronoun was given.\n";
    }
    if (player.pronouns.ipos === null || player.pronouns.ipos === "") {
        correct = false;
        errorMessage += "No independent possessive pronoun was given.\n";
    }
    if (player.pronouns.ref === null || player.pronouns.ref === "") {
        correct = false;
        errorMessage += "No reflexive pronoun was given.\n";
    }
    if (player.pronouns.plural === null) {
        correct = false;
        errorMessage += "Whether the player's pronouns pluralize verbs was not specified.\n";
    }

    if (correct === false) {
        game.communicationHandler.sendToCommandChannel(errorMessage);
        // Revert the player's pronouns.
        player.setPronouns(player.pronouns, player.pronounString);
    }
    else game.communicationHandler.sendToCommandChannel(`Successfully set ${player.name}'s pronouns.`);
}
