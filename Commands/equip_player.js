import EquipAction from '../Data/Actions/EquipAction.ts';

/** @import GameSettings from '../Classes/GameSettings.js' */
/** @import Game from '../Data/Game.ts' */
/** @import Player from '../Data/Player.ts' */

/** @type {CommandConfig} */
export const config = {
    name: "equip_player",
    description: "Equips an item.",
    details: `Equips an item to one of your equipment slots. The item you want to equip must be in one of your hands. `
        + `When you equip an item, it will be narrated in the room, so other people can see you equip it, regardless of its size. `
        + `It will then appear in your description, unless it's covered by another equipped item. For example, something equipped to `
        + `your PANTS slot is likely to cover something equipped to your UNDERWEAR slot.\n\n`
        + `Each item can only be equipped to certain equipment slots, if they're equippable at all. For example, `
        + `a mask is likely to only be equippable to the FACE slot. If you are unable to equip an item to its default equipment slot, `
        + `you can specify which slot you want to equip it to. To do this, enter "to" after the name of the item, followed by `
        + `the name of one of your equipment slots. You can view a list of all of your equipment slots with the \`inventory\` command.\n\n`
        + `To equip many items at once, use the \`dress\` command. If you wish to remove one of your equipped items, use the \`unequip\` command.`,
    usableBy: "Player",
    aliases: ["equip", "wear", "e"],
    requiresGame: true
};

/**
 * @param {GameSettings} settings
 * @returns {string}
 */
export function usage(settings) {
    return `${settings.commandPrefix}equip PLAGUE DOCTOR MASK\n`
        + `${settings.commandPrefix}wear WHITE PARKA\n`
        + `${settings.commandPrefix}e KNIT WOOL SWEATER to SHIRT`;
}

/**
 * @param {Game} game - The game in which the command is being executed.
 * @param {UserMessage} message - The message in which the command was issued.
 * @param {string} command - The command alias that was used.
 * @param {string[]} args - A list of arguments passed to the command as individual words.
 * @param {Player} player - The player who issued the command.
 */
export async function execute(game, message, command, args, player) {
    if (args.length === 0)
        return game.communicationHandler.reply(message, `You need to specify an item. Usage:\n${usage(game.settings)}`);

    const status = player.getBehaviorAttributeStatusEffects("disable equip");
    if (status.length > 0) return game.communicationHandler.reply(message, `You cannot do that because you are **${status[0].id}**.`);

    const input = args.join(' ');
    const parsedInput = input.toUpperCase().replace(/\'/g, "");
    const newArgs = parsedInput.split(" TO ");
    const itemName = newArgs[0].trim();
    let slotName = newArgs[1] ? newArgs[1] : "";

    const hand = game.entityFinder.getPlayerHandHoldingItem(player, itemName, undefined, "player");
    const item = hand ? hand.equippedItem : undefined;
    if (item === undefined) return game.communicationHandler.reply(message, `Couldn't find item "${itemName}" in either of your hands. If this item is elsewhere in your inventory, please unequip or unstash it before trying to equip it.`);
    if (!item.prefab.equippable || item.prefab.equipmentSlots.length === 0) return game.communicationHandler.reply(message, `${itemName} is not equippable.`);

    // If no slot name was given, pick the first one this item can be equipped to.
    if (slotName === "") slotName = item.prefab.equipmentSlots[0];
    if (!item.prefab.equipmentSlots.includes(slotName)) return game.communicationHandler.reply(message, `${itemName} can't be equipped to equipment slot ${slotName}.`);

    let slot = player.inventory.get(slotName);
    if (slot === undefined) return game.communicationHandler.reply(message, `Couldn't find equipment slot "${slotName}".`);
    if (slot.equippedItem !== null) return game.communicationHandler.reply(message, `Cannot equip items to ${slotName} because ${slot.equippedItem.name} is already equipped to it.`);

    const action = new EquipAction(game, message, player, player.location, false);
    action.performEquip(item, slot, hand);
}
