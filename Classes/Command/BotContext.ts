// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
// SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Context from "./Context.ts"
import type { Pattern } from "./Pattern.ts";
import type { Token } from "./Token.ts";

/**
 * Represents the command context of a new-generation bot command.
 */
export default class BotContext extends Context {
    /**
     * Alias the command was invoked with.
     */
    readonly invokedAlias: string;

    /**
     * @param invoked - The alias the command was invoked with.
     */
    constructor(invoked: string) {
        super();
        this.invokedAlias = invoked;
    }

    getLexicon(patterns: Pattern[]): Token[] {
        return [];
    }
}
