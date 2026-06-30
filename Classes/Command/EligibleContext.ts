// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
// SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { User as DiscordUser } from "discord.js";
import Context from "./Context.ts";
import type { Token } from "./Token.ts";
import type { Pattern } from "./Pattern.ts";

/**
 * Represents the command context of a new-generation eligible command.
 */
export default class EligibleContext extends Context {
    /**
     * Alias the command was invoked with.
     */
    readonly invokedAlias: string;

    /**
     * Message that invoked the command.
     */
    readonly message: UserMessage;

    /**
     * User that invoked the command.
     */
    readonly author: DiscordUser;

    /**
     * @param invoked - The alias the command was invoked with.
     * @param message - The message that invoked the command.
     *
     */
    constructor(invoked: string, message: UserMessage) {
        super();
        this.invokedAlias = invoked;
        this.message = message;
        this.author = this.message.author;
    }

    getLexicon(patterns: Pattern[]): Token[] {
        return [];
    }
}
