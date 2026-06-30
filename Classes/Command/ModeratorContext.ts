// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
// SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Context from "./Context.ts";
import type { Pattern } from "./Pattern.ts";
import type { Token } from "./Token.ts";

/**
 * Represents the command context of a new-generation moderator command.
 */
export default class ModeratorContext extends Context {
    /**
     * Alias the command was invoked with.
     */
    readonly invokedAlias: string;

    /**
     * Message that invoked the command.
     */
    readonly message: UserMessage;

    /**
     * @param invoked - The alias the command was invoked with.
     * @param message - The message that invoked the command.
     *
     */
    constructor(invoked: string, message: UserMessage) {
        super();
        this.invokedAlias = invoked;
        this.message = message;
    }

    getLexicon(patterns: Pattern[]): Token[] {
        return [];
    }
}
