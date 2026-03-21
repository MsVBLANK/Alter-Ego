describe('ItemInstance test', () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll(true, false);
    });

    describe('proceduralSelections test', () => {
        test('RoomItem CAPSULE proceduralSelections', () => {
            const entity = game.entityFinder.getRoomItem('CAPSULE', 'video-room', 'Fixture', 'FLOOR');
            /** @type {Map<string, string>} */
            const expected = new Map([
                ["color", "blue"],
                ["species", "tortide"],
                ["finish", "metal"]
            ]);
            expect(entity.proceduralSelections).toEqual(expected);
        });

        test('RoomItem DEPLETED CAPSULE proceduralSelections', () => {
            const entity = game.entityFinder.getRoomItem('DEPLETED CAPSULE', 'video-room', 'Fixture', 'FLOOR');
            /** @type {Map<string, string>} */
            const expected = new Map([
                ["species", "loamander"]
            ]);
            expect(entity.proceduralSelections).toEqual(expected);
        });

        test('RoomItem WET CLAY POT proceduralSelections', () => {
            const entity = game.entityFinder.getRoomItem('WET CLAY POT', 'video-room', 'Fixture', 'KILN 1');
            /** @type {Map<string, string>} */
            const expected = new Map([
                ["base color", "white"],
                ["quality", "decent"]
            ]);
            expect(entity.proceduralSelections).toEqual(expected);
        });

        test('RoomItem GLAZED CLAY POT\n proceduralSelections', () => {
            const entity = game.entityFinder.getRoomItem('GLAZED CLAY POT 1', 'video-room', 'Fixture', 'KILN 2');
            /** @type {Map<string, string>} */
            const expected = new Map([
                ["base color", "obscured"],
                ["quality", "excellent"],
                ["glaze color", "orange"],
                ["pattern", "waves"],
                ["pattern quality", "detailed"],
                ["pattern color", "teal"]
            ]);
            expect(entity.proceduralSelections).toEqual(expected);
        });
    });
});
