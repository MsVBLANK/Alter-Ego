// SPDX-FileCopyrightText: 2026 LavCorps <lavcorps@protonmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    ConstantToken,
    EntityToken,
    ItemContainerToken,
    PrepositionToken,
    SentinelToken
} from "../../../Classes/Command/Token.ts";
import Trie from "../../../Classes/Command/Trie.ts";
import { clearQueue } from "../../../Modules/messageHandler.js";

describe("Trie class from NG Commands", () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    beforeEach(async () => {
        trie = new Trie();
    });

    afterEach(async () => {
        clearQueue(game);
        vi.resetAllMocks();
    });

    let trie: Trie;

    describe("data loading", () => {
        test("1", async () => {
            const data = "Last one in is a **{rotten egg}!**";
            trie.insert(data, new ConstantToken(data));
            expect(trie.size()).toBe(8); // 7 words + root node
        });
        test("2", async () => {
            const data1 = "The quick brown fox";
            const data2 = "The lazy dog";
            trie.insert(data1, new ConstantToken(data1));
            trie.insert(data2, new ConstantToken(data2));
            expect(trie.size()).toBe(7); // root node + shared "the" node + 3 words + 2 words
            expect(trie.root.children.get("the").children.size).toBe(2); // two descending nodes from "the"
        });
    });

    describe("input tokenization", () => {
        beforeEach(async () => {
            const data: string[] = ["Last one in is a **{rotten egg}!**"];
            for (const line of data) {
                trie.insert(line, new ConstantToken(line));
            }
        });
        test("1", async () => {
            const stream = trie.tokenize(["Last", "one", "in", "is", "a", "**{rotten", "egg}!**"]);
            expect(stream[0][0] instanceof ConstantToken).toBeTruthy();
            expect(stream[0][0].value).toBe("Last one in is a **{rotten egg}!**");
        });
        test("2", async () => {
            const stream = trie.tokenize(["Last", "one", "in", "is", "a", "rotten", "egg!"]);
            expect(stream[0][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[0][0].value).toBe("Last");
            expect(stream[1][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[1][0].value).toBe("one");
            expect(stream[2][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[2][0].value).toBe("in");
            expect(stream[3][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[3][0].value).toBe("is");
            expect(stream[4][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[4][0].value).toBe("a");
            expect(stream[5][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[5][0].value).toBe("rotten");
            expect(stream[6][0] instanceof SentinelToken).toBeTruthy();
            expect(stream[6][0].value).toBe("egg!");
        });
    });

    describe("benchmarking", () => {
        test("load all loadable game data into trie", async () => {
            const prepositions: Set<string> = new Set();
            const start = process.hrtime.bigint();
            for (const player of game.players.values()) {
                trie.insert(player.displayName, new EntityToken(player.displayName, player));
            }
            const playerConclude = process.hrtime.bigint();
            for (const item of game.inventoryItems) {
                if (item.prefab !== null && item.quantity > 0) {
                    trie.insert(item.prefab.id, new ItemContainerToken(item.prefab.id, item));
                    if (!prepositions.has(item.getPreposition())) {
                        const preposition = item.getPreposition();
                        prepositions.add(preposition);
                        trie.insert(preposition, new PrepositionToken(preposition));
                    }
                }
            }
            const inventoryItemConclude = process.hrtime.bigint();
            for (const item of game.roomItems) {
                if (item.prefab !== null && item.quantity > 0) {
                    trie.insert(item.prefab.id, new ItemContainerToken(item.prefab.id, item));
                    if (!prepositions.has(item.getPreposition())) {
                        const preposition = item.getPreposition();
                        prepositions.add(preposition);
                        trie.insert(preposition, new PrepositionToken(preposition));
                    }
                }
            }
            const roomItemConclude = process.hrtime.bigint();
            for (const fixture of game.fixtures) {
                trie.insert(fixture.name, new ItemContainerToken(fixture.name, fixture));
                if (!prepositions.has(fixture.getPreposition())) {
                    const preposition = fixture.getPreposition();
                    prepositions.add(preposition);
                    trie.insert(preposition, new PrepositionToken(preposition));
                }
            }
            const fixtureConclude = process.hrtime.bigint();
            for (const puzzle of game.puzzles) {
                trie.insert(puzzle.name, new ItemContainerToken(puzzle.name, puzzle));
            }
            const puzzleConclude = process.hrtime.bigint();
            for (const player of game.players.values()) {
                for (const slot of player.inventory.values()) {
                    trie.insert(slot.id, new EntityToken(slot.id, slot));
                }
            }
            const equipmentSlotConclude = process.hrtime.bigint();
            for (const room of game.rooms.values()) {
                trie.insert(room.id, new EntityToken(room.id, room));
            }
            const roomConclude = process.hrtime.bigint();
            for (const room of game.rooms.values()) {
                for (const exit of room.exits.values()) {
                    trie.insert(exit.name, new EntityToken(exit.name, exit));
                }
            }
            const exitConclude = process.hrtime.bigint();
            for (const event of game.events.values()) {
                trie.insert(event.id, new EntityToken(event.id, event));
            }
            const eventConclude = process.hrtime.bigint();
            for (const flag of game.flags.values()) {
                trie.insert(flag.id, new EntityToken(flag.id, flag));
            }
            const flagConclude = process.hrtime.bigint();
            for (const prefab of game.prefabs.values()) {
                trie.insert(prefab.id, new EntityToken(prefab.id, prefab));
            }
            const prefabConclude = process.hrtime.bigint();
            for (const status of game.statusEffects.values()) {
                trie.insert(status.id, new EntityToken(status.id, status));
            }
            const statusConclude = process.hrtime.bigint();
            console.log(`full trie load took ${Number(statusConclude - start) / 1000000}ms`);
            console.log(`  player trie load took ${Number(playerConclude - start) / 1000000}ms`);
            console.log(
                `  inventory item trie load took ${Number(inventoryItemConclude - playerConclude) / 1000000}ms`,
            );
            console.log(`  room item trie load took ${Number(roomItemConclude - inventoryItemConclude) / 1000000}ms`);
            console.log(`  fixture trie load took ${Number(fixtureConclude - roomItemConclude) / 1000000}ms`);
            console.log(`  puzzle trie load took ${Number(puzzleConclude - fixtureConclude) / 1000000}ms`);
            console.log(
                `  equipment slot trie load took ${Number(equipmentSlotConclude - puzzleConclude) / 1000000}ms`,
            );
            console.log(`  room trie load took ${Number(roomConclude - equipmentSlotConclude) / 1000000}ms`);
            console.log(`  exit trie load took ${Number(exitConclude - roomConclude) / 1000000}ms`);
            console.log(`  event trie load took ${Number(eventConclude - exitConclude) / 1000000}ms`);
            console.log(`  flag trie load took ${Number(flagConclude - eventConclude) / 1000000}ms`);
            console.log(`  prefab trie load took ${Number(prefabConclude - flagConclude) / 1000000}ms`);
            console.log(`  status trie load took ${Number(statusConclude - prefabConclude) / 1000000}ms`);
            console.log(`final trie size is ${trie.size()}`);
            const lookupStart = process.hrtime.bigint();
            const amaLookup = trie.tokenize(["amadeus"]);
            const amaConclude = process.hrtime.bigint();
            const potLookup = trie.tokenize(["pot"]);
            const potConclude = process.hrtime.bigint();
            const filledPotLookup = trie.tokenize(["pot", "filled", "with", "water"]);
            const filledPotConclude = process.hrtime.bigint();
            const complexLookup = trie.tokenize(["drop", "pot", "filled", "with", "water", "on", "reception", "desk"]);
            const complexConclude = process.hrtime.bigint();
            console.log(`all lookups took ${Number(complexConclude - lookupStart) / 1000}μs`);
            console.log(`  amadeus lookup took ${Number(amaConclude - lookupStart) / 1000}μs`);
            console.log(amaLookup);
            console.log(`  pot lookup took ${Number(potConclude - amaConclude) / 1000}μs`);
            console.log(potLookup);
            console.log(`  filled pot lookup took ${Number(filledPotConclude - potConclude) / 1000}μs`);
            console.log(filledPotLookup);
            console.log(`  complex lookup took ${Number(complexConclude - filledPotConclude) / 1000}μs`);
            console.log(complexLookup);
        });
    });
});
