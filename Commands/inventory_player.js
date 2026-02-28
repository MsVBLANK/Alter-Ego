/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.js' */
/** @import Player from '../Data/Player.js' */

/** @type {CommandConfig} */
export const config = {
    name: "inventory_player",
    description: "Lists the items in your inventory.",
    details: `Lists all of the equipment slots you have available, and any items that are equipped to each one. `
        + `Your "RIGHT HAND" and "LEFT HAND" equipment slots are your hands, which are your main ways of interacting with inventory items. `
        + `You can manage the items in these equipment slots primarily with the \`take\` and \`drop\` commands. For all other equipment slots, `
        + `you can equip items to them with the \`equip\` command, and remove items from them with the \`unequip\` command.\n\n`
        + `If any of your equipped items have inventory slots, then you can store other items inside of them. These inventory slots will be `
        + `listed underneath the equipped item, and any items they contain will be listed in parentheses. To store an item in one of these `
        + `inventory slots, use the \`stash\` command. To retrieve one and put it in your hand, use the \`unstash\` command. Be warned `
        + `that items that you have stashed in inventory slots can be stolen by other players, sometimes without you noticing.`,
    usableBy: "Player",
    aliases: ["inventory", "i"],
    requiresGame: true,
    whitespaceSensitive: false
};

/**
 * @param {GameSettings} settings 
 * @returns {string} 
 */
export function usage(settings) {
    return `${settings.commandPrefix}inventory\n`
        + `${settings.commandPrefix}i`;
}

/**
 * @param {Game} game - The game in which the command is being executed. 
 * @param {UserMessage} message - The message in which the command was issued. 
 * @param {string} command - The command alias that was used. 
 * @param {string[]} args - A list of arguments passed to the command as individual words. 
 * @param {Player} player - The player who issued the command. 
 */
export async function execute(game, message, command, args, player) {
    const status = player.getBehaviorAttributeStatusEffects("disable inventory");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const inventoryString = player.viewInventory(false);
    player.notify(inventoryString);
}
