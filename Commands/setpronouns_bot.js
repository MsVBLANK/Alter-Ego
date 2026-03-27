/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "setpronouns_bot",
    description: "Sets a player's pronouns.",
    details: `Sets the pronouns that will be used in the given player's description and other places where pronouns are `
        + `used. This will not change their pronouns on the spreadsheet, and when player data is reloaded, their `
        + `pronouns will be reverted to their original pronouns.\n\n`
        + `To set a player's pronouns, enter their name, followed by a set of pronouns. If you enter "player" instead `
        + `of a player's name, then the player who caused this command to be executed will have their pronouns set.\n`
        + `Pronoun sets must be given in the form:\n`
        + `\`subjective\\objective\\dependent possessive\\independent possessive\\reflexive\\plural\`.\n`
        + '**Pay close attention.** Because bot command sets are separated by a forward slash (`/`), you must use a '
        + 'backward slash (`\\`) to separate pronouns in a pronoun set. '
        + `However, you can also use shorthand for the most common pronoun sets:\n`
        + '- "female" (`she\\her\\her\\hers\\herself\\false`), \n'
        + '- "male" (`he\\him\\his\\his\\himself\\false`), and \n'
        + '- "neutral" (`they\\them\\their\\theirs\\themself\\true`).\n\n'
        + `Note that if the player is inflicted with a status effect with the \`concealed\` behavior attribute, their `
        + `pronouns will be set to "neutral", thus overwriting any that were set manually. However, this command can `
        + `be used to update their pronouns again afterwards. When the status is cured, their pronouns will be reset.`,
    usableBy: "Bot",
    aliases: ["setpronouns"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `setpronouns Lain female\n`
        + `setpronouns Amadeus neutral\n`
        + `setpronouns Platt male\n`
        + `setpronouns Unit_050 it\\it\\its\\its\\itself\\false\n`
        + `setpronouns Asuka she\\it\\her\\its\\herself\\false\n`
        + `setpronouns Hollow ey\\em\\eir\\eirs\\emself\\true\n`
        + `setpronouns Aeries xey\\xem\\xeir\\xeirs\\xemself\\true\n`
        + `setpronouns player female\n`
        + `setpronouns player neutral\n`
        + `setpronouns player male\n`
        + `setpronouns player ey\\em\\eir\\eirs\\emself\\true\n`
        + `setpronouns player`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} [player] - The player who caused the command to be executed, if applicable.
 * @param {Callee} [callee] - The in-game entity that caused the command to be executed, if applicable.
 */
export async function execute(game, command, args, player, callee) {
    const cmdString = command + " " + args.join(" ");
    if (args.length !== 2)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". You need to specify a player and a pronoun set. Usage:\n${exports.config.usage}`);

    if (args[0].toLowerCase() !== "player") {
        player = game.entityFinder.getLivingPlayer(args[0]);
        if (player === undefined) return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". Player "${args[0]}" not found.`);
    }
    else if (args[0].toLowerCase() === "player" && player === null)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". The "player" argument was used, but no player was passed into the command.`);

    args.splice(0, 1);

    const input = args.join(" ").toLowerCase().replace(/\\/g, "/");
    if (input !== "female" && input !== "male" && input !== "neutral" && input.split('/').length !== 6)
        return game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}". The supplied pronoun string is invalid.`);
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
        game.communicationHandler.sendToCommandChannel(`Error: Couldn't execute command "${cmdString}".\n${errorMessage}`);
        // Revert the player's pronouns.
        player.setPronouns(player.pronouns, player.pronounString);
    }
}
