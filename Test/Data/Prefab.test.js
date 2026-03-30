describe('Prefab test', () => {
    beforeAll(async () => {
        if (game.prefabs.size === 0) await game.entityLoader.loadPrefabs(false);
    });

    describe('proceduralOptions test', () => {
        test('CAPSULE proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("CAPSULE");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["color", new Set(["red", "blue", "green", "black", "white"])],
                ["species", new Set(["lavazard", "loamander", "tortide"])],
                ["finish", new Set(["glass", "metal", "standard"])]
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('DEPLETED CAPSULE proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("DEPLETED CAPSULE");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["species", new Set(["lavazard", "loamander", "tortide"])],
                ["finish", new Set(["glass", "metal", "standard"])]
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('WET CLAY POT proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("WET CLAY POT");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["base color", new Set(["red", "white"])],
                ["quality", new Set(["terrible", "poor", "decent", "excellent"])]
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('FIRED CLAY POT proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("FIRED CLAY POT");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["base color", new Set(["red", "white"])],
                ["quality", new Set(["default", "terrible", "poor", "decent", "excellent"])]
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('GLAZED CLAY POT proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("GLAZED CLAY POT");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["base color", new Set(["obscured", "red", "white"])],
                ["quality", new Set(["default", "terrible", "poor", "decent", "excellent"])],
                ["glaze color", new Set(["clear", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
                ["pattern", new Set(["stripes", "spots", "stars", "zigzagging lines", "hearts", "broken hearts", "webs", "drip lines", "flowers", "trees", "clouds", "waves", "bubbles", "fish", "turtles", "sea creatures", "rabbits", "horses", "farm animals", "cats", "dogs", "birds", "spiders", "beetles"])],
                ["pattern quality", new Set(["crude", "simple", "detailed", "ornate"])],
                ["pattern color", new Set(["colorful", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('FIRED GLAZED CLAY POT proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("FIRED GLAZED CLAY POT");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["base color", new Set(["obscured", "red", "white"])],
                ["quality", new Set(["default", "terrible", "poor", "decent", "excellent"])],
                ["glaze color", new Set(["clear", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
                ["pattern", new Set(["stripes", "spots", "stars", "zigzagging lines", "hearts", "broken hearts", "webs", "drip lines", "flowers", "trees", "clouds", "waves", "bubbles", "fish", "turtles", "sea creatures", "rabbits", "horses", "farm animals", "cats", "dogs", "birds", "spiders", "beetles"])],
                ["pattern quality", new Set(["crude", "simple", "detailed", "ornate"])],
                ["pattern color", new Set(["colorful", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });

        test('GLAZE proceduralOptions', () => {
            const entity = game.entityFinder.getPrefab("GLAZE");
            /** @type {Map<string, Set<string>>} */
            const expected = new Map([
                ["glaze color", new Set(["clear", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
                ["secondary glaze color", new Set(["clear", "red", "orange", "brown", "yellow", "green", "teal", "light blue", "indigo", "violet", "pink", "white", "gray", "black"])],
                ["base color", new Set(["obscured"])],
                ["secondary base color", new Set(["obscured"])]
            ]);
            expect(entity.proceduralOptions).toEqual(expected);
        });
    });
});
