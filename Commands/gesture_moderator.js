import GestureAction from '../Data/Actions/GestureAction.ts';
import { createPaginatedEmbed } from '../Modules/discordUtils.js';

/** @import Moderator from '../Data/Moderator.ts' */
/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "gesture_moderator",
    description: "Performs a gesture for the given player.",
    details: `Makes the given player perform one of a set of pre-defined gestures. Everybody in the room with them will see them do this gesture. `
        + `This allows them to communicate non-verbally, though some gestures cannot be performed if them have certain status effects. `
        + `For example, if they have the "concealed" status effect, they may not use gestures like "smile" or "frown", as nobody would be able to see it. `
        + `To see a list of all of the gestures they can currently perform, send the \`gesture\` command followed by "list" and the name of the player. `
        + `Omitting the name of a player after "list" will simply list all gestures on the sheet.\n\n`
        + `Certain gestures may require a target to perform them. For example, a gesture might require you specify an exit, a fixture, another player, etc. `
        + `To specify a target, enter the identifier of the target directly after the name of the gesture. For a room item or inventory item, this must be its `
        + `container identifier or prefab ID. For any other type of target, it should be its name. Note that a gesture can only be performed with one target at a time.`,
    usableBy: "Moderator",
    aliases: ["gesture", "g"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}gesture Astrid smile\n`
        + `${settings.commandPrefix}gesture Ezekiel point at DOOR 1\n`
        + `${settings.commandPrefix}gesture Holly wave Johnny\n`
        + `${settings.commandPrefix}gesture Dexter sit CHAIR\n`
        + `${settings.commandPrefix}gesture list\n`
        + `${settings.commandPrefix}gesture list Kyra`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Moderator} moderator - The moderator who issued the command.
 */
export async function execute(game, message, command, args, moderator) {
    let showList = false;
    if (args[0] === "list") {
        showList = true;
        args.splice(0, 1);
    }
    const sentMessageInLatchChannel = moderator.sentMessageInLatchChannel(message);
    if (!showList && !sentMessageInLatchChannel && args.length < 2)
        return game.communicationHandler.reply(message, `You need to specify a player and a gesture. Usage:\n${usage(game.settings)}`);
    if (!showList && sentMessageInLatchChannel && args.length < 1)
        return game.communicationHandler.reply(message, `You need to specify a gesture. Usage:\n${usage(game.settings)}`);

    const playerName = args[0] ?? '';
    let player = game.entityFinder.getLivingPlayer(playerName);
    if (player) args.splice(0, 1);
    if (!player && sentMessageInLatchChannel)
        player = moderator.getLatch();

    if (showList) {
        const fields = game.entityFinder.getGestures().filter(gesture => gesture.disabledStatuses.every(status => player === undefined || !player.hasStatus(status.id)));
        const pages = [];
        let page = 0;

        // Divide the fields into pages.
        for (let i = 0, pageNo = 0; i < fields.length; i++) {
            // Divide the menu into groups of 10.
            if (i % 15 === 0) {
                pages.push([]);
                if (i !== 0) pageNo++;
            }
            pages[pageNo].push(fields[i]);
        }

        const embedAuthorName = `Gestures List`;
        const embedAuthorIcon = game.guildContext.guild.members.me.avatarURL() || game.guildContext.guild.members.me.user.avatarURL();
        const playerAppendString = player ? ` ${player.name} can currently perform` : ``;
        const embedDescription = `These are all of the gestures${playerAppendString}.\nFor more information on the gesture command, send \`${game.settings.commandPrefix}help gesture\`.`;
        const fieldName = (entryIndex) => pages[page][entryIndex].id;
        const fieldValue = (entryIndex) => pages[page][entryIndex].description;
        let embed = createPaginatedEmbed(game, page, pages, embedAuthorName, embedAuthorIcon, embedDescription, fieldName, fieldValue);
        game.guildContext.commandChannel.send({ embeds: [embed] }).then(msg => {
            msg.react('⏪').then(() => {
                msg.react('⏩');

                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id;
                const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id;

                const backwards = msg.createReactionCollector({ filter: backwardsFilter, time: 300000 });
                const forwards = msg.createReactionCollector({ filter: forwardsFilter, time: 300000 });

                backwards.on("collect", () => {
                    const reaction = msg.reactions.cache.find(reaction => reaction.emoji.name === '⏪');
                    if (reaction) reaction.users.cache.forEach(user => { if (user.id !== game.botContext.client.user.id) reaction.users.remove(user.id); });
                    if (page === 0) return;
                    page--;
                    embed = embed = createPaginatedEmbed(game, page, pages, embedAuthorName, embedAuthorIcon, embedDescription, fieldName, fieldValue);
                    msg.edit({ embeds: [embed] });
                });

                forwards.on("collect", () => {
                    const reaction = msg.reactions.cache.find(reaction => reaction.emoji.name === '⏩');
                    if (reaction) reaction.users.cache.forEach(user => { if (user.id !== game.botContext.client.user.id) reaction.users.remove(user.id); });
                    if (page === pages.length - 1) return;
                    page++;
                    embed = createPaginatedEmbed(game, page, pages, embedAuthorName, embedAuthorIcon, embedDescription, fieldName, fieldValue);
                    msg.edit({ embeds: [embed] });
                });
            });
        });
    }
    else {
        if (player === undefined) return game.communicationHandler.reply(message, `Player "${playerName}" not found.`);
        let input = args.join(" ").toLowerCase().replace(/\'/g, "");

        let gesture;
        let targetType = "";
        let target = null;
        for (let index = args.length; index >= 0; index--) {
            gesture = game.entityFinder.getGesture(args.slice(0, index).join(" "));
            if (gesture) {
                args = args.slice(index);
                break;
            }
        }
        if (gesture === undefined)
            return game.communicationHandler.reply(message,  `Couldn't find gesture "${input}". For a list of gestures, send \`${game.settings.commandPrefix}gesture list\`.`);
        else if (args.length === 0 && gesture.requires.length > 0)
            return game.communicationHandler.reply(message, `You need to specify a target for that gesture.`);
        else if (args.length > 0 && gesture.requires.length === 0)
            return game.communicationHandler.reply(message, `That gesture doesn't take a target.`);
        else if (args.length > 0 && gesture.requires.length > 0) {
            const input2 = args.join(" ").toLowerCase().replace(/\'/g, "");
            for (const requireType of gesture.requires) {
                if (requireType === "Exit") {
                    target = game.entityFinder.getExit(player.location, input2);
                    if (target) targetType = "Exit";
                    else target = null;
                } else if (requireType === "Fixture" || requireType === "Object") {
                    target = game.entityFinder.getFixtures(input2, player.location.id, true)[0];
                    if (target) targetType = "Fixture";
                    else target = null;
                } else if (requireType === "RoomItem" || requireType == "Item") {
                    target = game.entityFinder.getRoomItems(input2, player.location.id, true)[0];
                    if (target) targetType = "RoomItem";
                    else target = null;
                } else if (requireType === "Player") {
                    const hiddenStatus = player.getBehaviorAttributeStatusEffects("hidden");
                    for (const occupant of player.location.occupants) {
                        if (
                            occupant.name.toLowerCase().replace(/\'/g, "") === input2 &&
                            ((hiddenStatus.length === 0 && !occupant.isHidden()) ||
                                occupant.hidingSpot === player.hidingSpot)
                        ) {
                            if (occupant.name === player.name)
                                return game.communicationHandler.reply(message, `${player.name} can't gesture toward ${player.originalPronouns.ref}.`);
                            targetType = "Player";
                            target = occupant;
                            break;
                        }
                    }
                } else if (requireType === "InventoryItem") {
                    for (const hand of game.entityFinder.getPlayerHands(player)) {
                        if (
                            hand.equippedItem !== null &&
                            (hand.equippedItem.identifier !== "" && hand.equippedItem.identifier.toLowerCase() === input2 ||
                                hand.equippedItem.prefab.id.toLowerCase() === input2)
                        ) {
                            targetType = "InventoryItem";
                            target = hand.equippedItem;
                            break;
                        }
                    }
                }
                if (target !== null) break;
            }
        }
        input = input.substring(gesture.id.toLowerCase().replace(/\'/g, "").length).trim();
        if (target === null && gesture.requires.length > 0)
            return game.communicationHandler.reply(message, `Couldn't find target "${input}" in the room with ${player.name}.`);
        for (let i = 0; i < gesture.disabledStatuses.length; i++) {
            if (player.status.has(gesture.disabledStatuses[i].id))
                return game.communicationHandler.reply(message, `${player.name} cannot do that gesture because ${player.originalPronouns.sbj} ${player.originalPronouns.plural ? "are" : "is"} **${gesture.disabledStatuses[i].id}**.`);
        }

        const action = new GestureAction(game, message, player, player.location, true);
        action.performGesture(gesture, targetType, target);
        game.communicationHandler.sendToCommandChannel(`Successfully made ${player.name} perform gesture ${gesture.id}.`);
    }
}
