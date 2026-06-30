// SPDX-FileCopyrightText: 2019 Alter Ego Contributors
// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
// SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Collection } from "discord.js";
import { ValidatedInvocation, type MatchedInvocation } from "../../Classes/Command/Invocation.ts";
import { Pattern, Slot, Constant } from "../../Classes/Command/Pattern.ts";
import PlayerCommand from "../../Classes/Command/PlayerCommand.ts";
import type PlayerContext from "../../Classes/Command/PlayerContext.ts";
import type GameSettings from "../../Classes/GameSettings.js";
import InventoryItem from "../../Data/InventoryItem.ts";

export default new PlayerCommand({
    config: {
        name: "craft_player",
        description: "Crafts two items in your inventory together.",
        details:
            `Creates a new item using the two items in your hands. The names of the items must be separated by "with" or "and". ` +
            `If no recipe for those two items exists, the items cannot be crafted together. ` +
            `If any of the resulting items is particularly large, this will be narrated in the room, so other players will see you craft them.\n\n` +
            `You can view a list of all recipes that you can craft with the items in your inventory using the \`recipes\` command. Some crafting recipes ` +
            `can be reversed once performed using the \`uncraft\` command. For more information on both of these commands, use the \`help\` command.`,
        usableBy: "Player",
        aliases: ["craft", "combine", "mix", "c"],
        requiresGame: true,
    },

    usage: (settings: GameSettings) => {
        return (
            `${settings.commandPrefix}craft DRAIN CLEANER and PLASTIC BOTTLE\n` +
            `${settings.commandPrefix}combine BREAD and CHEESE\n` +
            `${settings.commandPrefix}mix RED VIAL with BLUE VIAL\n` +
            `${settings.commandPrefix}craft SOAP with KNIFE`
        );
    },

    patterns: [
        new Pattern([
            new Slot(InventoryItem, "item1"),
            new Constant("and"),
            new Slot(InventoryItem, "item2"),
        ]),
        new Pattern([
            new Slot(InventoryItem, "item1"),
            new Constant("with"),
            new Slot(InventoryItem, "item2"),
        ]),
    ],

    validate: async (context: PlayerContext, invocation: MatchedInvocation) => {
        return new ValidatedInvocation(new Collection(), []);
    },

    execute: async (ctx: PlayerContext) => {

    }
});
