/** @import Room from '../Data/Room.ts'; */
/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "tag_moderator",
    description: "Adds, removes, or lists a room's tags.",
    details: `This command has three sub-commands:\n\n`
        + `- **add**/**addtag**: Adds a comma-separated list of tags to the given room. Events that affect rooms with `
        + `that tag will immediately apply to the given room, and any tags that give a room special behavior will `
        + `immediately activate those functions. The new tags will be added to the spreadsheet on the next save.\n`
        + `- **remove**/**removetag**: Removes a comma-separated list of tags from the given room. Events that affect `
        + `rooms with that tag will immediately stop applying to the given room, and any tags that give a room special `
        + `behavior will immediately stop functioning. The tags will be removed from the spreadsheet on the next save.\n`
        + `- **list**/**tags**: Displays the list of tags currently applied to the given room.`,
    usableBy: "Moderator",
    aliases: ["tag", "addtag", "removetag", "tags"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}tag add Kitchen video surveilled\n`
        + `${settings.commandPrefix}tag remove Kitchen audio surveilled\n`
        + `${settings.commandPrefix}addtag vault soundproof\n`
        + `${settings.commandPrefix}removetag freezer cold\n`
        + `${settings.commandPrefix}addtag Command Center video monitoring, audio monitoring\n`
        + `${settings.commandPrefix}removetag command-center video monitoring, audio monitoring\n`
        + `${settings.commandPrefix}tag list Kitchen\n`
        + `${settings.commandPrefix}tags Kitchen`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    let input = command + " " + args.join(" ");
    if (command === "tag") {
        if (args[0] === "add") command = "addtag";
        else if (args[0] === "remove") command = "removetag";
        else if (args[0] === "list") {
            command = "tags";
            if (!args[1])
                return game.communicationHandler.reply(message, `You need to specify a room. Usage:\n${usage(game.settings)}`);
        }
        input = input.substring(input.indexOf(args[1]));
        args = input.split(" ");
    }
    else input = args.join(" ");

    if (command !== "addtag" && command !== "removetag" && command !== "tags") return game.communicationHandler.reply(message, 'Invalid command given. Use "add", "remove", or "list".');
    if ((command === "addtag" || command === "removetag") && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a room and at least one tag. Usage:\n${usage(game.settings)}`);

    input = args.join(" ");

    /** @type {Room} */
    let room;
    for (let i = args.length; i >= 0; i--) {
        const searchString = args.slice(0, i).join(" ");
        room = game.entityFinder.getRoom(searchString);
        if (room) {
            args = args.slice(i);
            input = args.join(" ");
            break;
        }
    }
    if (room === undefined) return game.communicationHandler.reply(message, `Couldn't find room "${input}".`);

    if (command === "tags") {
        const tags = Array.from(room.tags).join(", ");
        game.communicationHandler.sendToCommandChannel(`__Tags in ${room.id}:__\n${tags}`);
    }
    else {
        if (input === "") return game.communicationHandler.reply(message, `You need to specify at least one tag.`);

        const tags = input.split(",");
        if (command === "addtag") {
            const addedTags = [];
            for (let i = 0; i < tags.length; i++) {
                if (room.tags.has(tags[i].trim()) || tags[i].trim() === "")
                    continue;
                addedTags.push(tags[i].trim());
                room.tags.add(tags[i].trim());
            }
            if (addedTags.length === 0) return game.communicationHandler.reply(message, `${room.id} already has the given tag(s).`);
            const addedTagsString = addedTags.join(", ");
            game.communicationHandler.sendToCommandChannel(`Successfully added the following tags to ${room.id}: ${addedTagsString}`);
        }
        else if (command === "removetag") {
            const removedTags = [];
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].trim() === "")
                    continue;
                if (room.tags.has(tags[i].trim())) {
                    removedTags.push(tags[i].trim());
                    room.tags.delete(tags[i].trim());
                }
            }
            if (removedTags.length === 0) return game.communicationHandler.reply(message, `${room.id} doesn't have the given tag(s).`);
            const removedTagsString = removedTags.join(", ");
            game.communicationHandler.sendToCommandChannel(`Successfully removed the following tags from ${room.id}: ${removedTagsString}`);
        }
    }
}
