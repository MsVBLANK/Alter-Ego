// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
// SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Collection } from "discord.js";
import type GameEntity from "../../Data/GameEntity.ts";

/** Abstract class representing all Invocations. */
abstract class BaseInvocation<M extends boolean, V extends boolean> {
    private readonly _matched: M;

    private readonly _validated: V;

    /**
     * @param matched - Whether this Invocation is a Matched invocation.
     * @param validated - Whether this Invocation is a Validated invocation.
     */
    protected constructor(matched: M, validated: V) {
        this._matched = matched;
        this._validated = validated;
    }

    /** Whether this Invocation is Matched. */
    public get matched(): M {
        return this._matched;
    }

    /** Whether this Invocation is Validated. */
    public get validated(): V {
        return this._validated;
    }
}

/** Invocation whose arguments have been validated. */
export class ValidatedInvocation extends BaseInvocation<true, true> {
    /** The key-value pairs of slot names to Game Entities. One Game Entity per key. */
    args: Collection<string, GameEntity>;

    /** Any globbed data caught by the pattern matching. */
    glob: string[];

    /**
     * @param args - The key-value pairs of slot names to Game Entities. One Game Entity per key.
     * @param glob - Any globbed data caught by the pattern matching.
     */
    constructor(args: Collection<string, GameEntity>, glob: string[]) {
        super(true, true);
        this.args = args;
        this.glob = glob;
    }
}

/** Invocation whose arguments have been matched. */
export class MatchedInvocation extends BaseInvocation<true, false> {
    /** The key-value pairs of slot names to Game Entities. Multiple Game Entities allowed per key. */
    args: Collection<string, GameEntity[]>;

    /** Any globbed data caught by the pattern matching. */
    glob: string[];

    /**
     * @param args - The key-value pairs of slot names to Game Entities. Multiple Game Entities allowed per key.
     * @param glob - Any globbed data caught by the pattern matching.
     */
    constructor(args: Collection<string, GameEntity[]>, glob: string[]) {
        super(true, false);
        this.args = args;
        this.glob = glob;
    }
}

/** Invocation whose arguments have been invalidated. */
export class InvalidInvocation extends BaseInvocation<false, false> {
    /** The list of errors in the Invocation. */
    errors: string[];

    /**
     * @param errors - The list of errors in the Invocation.
     */
    constructor(errors: string[]) {
        super(false, false);
        this.errors = errors;
    }
}

export type MatchResult = MatchedInvocation | InvalidInvocation;
export type ValidationResult = ValidatedInvocation | InvalidInvocation;
export type Invocation = ValidatedInvocation | MatchedInvocation | InvalidInvocation;
