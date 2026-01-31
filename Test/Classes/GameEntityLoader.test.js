import EquipmentSlot from "../../Data/EquipmentSlot.js";
import Event from "../../Data/Event.js";
import Fixture from "../../Data/Fixture.js";
import Game from "../../Data/Game.js";
import InventoryItem from "../../Data/InventoryItem.js";
import Player from "../../Data/Player.js";
import Prefab from "../../Data/Prefab.js";
import Puzzle from "../../Data/Puzzle.js";
import Room from "../../Data/Room.js";
import RoomItem from "../../Data/RoomItem.js";
import sheets from "../__mocks__/libs/sheets.js";

describe('GameEntityLoader test', () => {
    /** @type {Error[]} */
    let errors;

    beforeEach(() => {
        errors = [];
    });

    afterEach(() => {
        sheets.__clearMock();
    });

    afterAll(() => {
        game.entityLoader.clearAll();
    });

    describe('loadAll test', () => {
        describe('standard load all response', () => {
            let updatePresenceSpy;
            let eventStartTimerSpy;
            let eventStartEffectsTimerSpy;
            let playerSendDescriptionSpy;

            beforeEach(() => {
                updatePresenceSpy = vi.spyOn(game.botContext, 'updatePresence').mockImplementation(() => {});
                eventStartTimerSpy = vi.spyOn(Event.prototype, 'startTimer').mockImplementation(async () => {});
                eventStartEffectsTimerSpy = vi.spyOn(Event.prototype, 'startEffectsTimer').mockImplementation(() => {});
                playerSendDescriptionSpy = vi.spyOn(Player.prototype, 'sendDescription').mockImplementation(() => {});
            });

            afterEach(() => {
                updatePresenceSpy.mockRestore();
                eventStartTimerSpy.mockRestore();
                eventStartEffectsTimerSpy.mockRestore();
                playerSendDescriptionSpy.mockRestore();
            });

            test('startGame false', async () => {
                const message = await game.entityLoader.loadAll();
                expect(message).not.toContain('Error');
                expect(message).toContain('retrieved.');
                expect(game.inProgress).toBe(false);
                expect(game.canJoin).toBe(false);
                expect(updatePresenceSpy).not.toHaveBeenCalled();
                expect(eventStartTimerSpy).toHaveBeenCalled();
                expect(eventStartEffectsTimerSpy).toHaveBeenCalled();
                expect(playerSendDescriptionSpy).not.toHaveBeenCalled();
            });
            
            test('startGame true', async () => {
                const message = await game.entityLoader.loadAll(true);
                expect(message).not.toContain('Error');
                expect(message).toContain('The game has started.');
                expect(game.inProgress).toBe(true);
                expect(game.canJoin).toBe(false);
                expect(updatePresenceSpy).toHaveBeenCalled();
                expect(eventStartTimerSpy).toHaveBeenCalled();
                expect(eventStartEffectsTimerSpy).toHaveBeenCalled();
                expect(playerSendDescriptionSpy).not.toHaveBeenCalled();
            });

            test('sendPlayerRoomDescriptions true', async () => {
                const message = await game.entityLoader.loadAll(true, true);
                expect(message).not.toContain('Error');
                expect(message).toContain('The game has started.');
                expect(game.inProgress).toBe(true);
                expect(game.canJoin).toBe(false);
                expect(updatePresenceSpy).toHaveBeenCalled();
                expect(eventStartTimerSpy).toHaveBeenCalled();
                expect(eventStartEffectsTimerSpy).toHaveBeenCalled();
                expect(playerSendDescriptionSpy).toHaveBeenCalledTimes(9);
            });
        });
    });

    describe('loadRooms test', () => {
        describe('erroneous room response', () => {
            test('no response returned', async () => {
                sheets.__setMock(game.constants.roomSheetDataCells, undefined);
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                expect(errors).toEqual([]);
                expect(roomCount).toBe(0);
            });

            test('incomplete rooms', async () => {
                sheets.__setMock(game.constants.roomSheetDataCells, [
                    ["aaa"],
                    [],
                    ["aaa", "aaa"],
                    ["aaa", "", "aaa"],
                    ["aaa", "", "", "aaa"],
                    ["aaa", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "", "", "aaa"],
                ]);
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                expect(errors).not.toEqual([]);
                expect(roomCount).toBe(0);
            });

            test('no room ID', async () => {
                sheets.__setMock(game.constants.roomSheetDataCells, [
                    ["'"]
                ]);
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                expect(roomCount).toBe(0);
                expect(errors).toEqual([Error("Couldn't load room on row 2. The room display name resolved to a unique ID with an empty value.")]);
            });

            test('room error messages', async () => {
                sheets.__setMock(game.constants.roomSheetDataCells, [
                    [""],
                    ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
                    ["aaa", "", "aaaaaaaaa"],
                    ["aaa"]
                ]);
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load room on row 2. No room display name was given.",
                    "Error: Couldn't load room on row 3. The room ID exceeds 100 characters in length.",
                    "Error: Couldn't load room on row 4. The icon URL must have a .jpg, .jpeg, .png, .gif, .webp, or .avif extension.",
                    "Error: Couldn't load room on row 5. Another room with the same ID already exists.",
                ];
                expect(roomCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('exit error messages', async () => {
                sheets.__setMock(game.constants.roomSheetDataCells, [
                    ["Room 1", "", ""],
                    ["Room 2", "", "", "DOOR A", "", "", "X"],
                    ["Room 3", "", "", "DOOR B", "", "", "0", "Y"],
                    ["Room 4", "", "", "DOOR C", "", "", "0", "0", "Z"],
                    ["Room 5", "", "", "DOOR D", "", "", "0", "0", "0", "TRUE"],
                    ["Room 6", "", "", "DOOR E", "", "", "0", "0", "0", "TRUE", "Room 0"],
                    ["Room 7", "", "", "DOOR F", "", "", "0", "0", "0", "TRUE", "Room 2"],
                    ["Room 8", "", "", "DOOR G", "", "", "0", "0", "0", "TRUE", "Room 9", "DOOR Y"],
                    ["Room 9", "", "", "DOOR Z","", "",  "0", "0", "0", "TRUE", "Room 8", "DOOR G"],
                    ["", "", "", "DOOR Z", "", "", "0", "0", "0", "TRUE", "Room 8", "DOOR G"],
                ]);
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load exit on row 2. No exit name was given.",
                    "Error: Couldn't load exit on row 3. The X-coordinate given is not an integer.",
                    "Error: Couldn't load exit on row 4. The Y-coordinate given is not an integer.",
                    "Error: Couldn't load exit on row 5. The Z-coordinate given is not an integer.",
                    "Error: Couldn't load exit on row 6. No destination was given.",
                    "Error: Couldn't load exit on row 7. The destination given is not a room.",
                    "Error: Couldn't load exit on row 8. No linked exit was given.",
                    "Error: Couldn't load exit on row 9. Room \"Room 9\" does not have an exit that links back to it.",
                    "Error: Couldn't load exit on row 11. The room already has an exit named \"DOOR Z\".",
                ];
                expect(roomCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard room response', () => {
            test('errorChecking true', async () => {
                /** @type {Error[]} */
                let errors = [];
                const roomCount = await game.entityLoader.loadRooms(true, errors);
                expect(errors).toEqual([]);
                expect(roomCount).toBe(198);
                for (const room of game.roomsCollection.values()) {
                    const roomDescriptionText = room.description.toString();
                    expect(roomDescriptionText).not.toContain("<item>");
                    expect(roomDescriptionText).not.toContain("</item>");
                    for (const exit of room.exitCollection.values()) {
                        const exitDescriptionText = exit.description.toString();
                        expect(exitDescriptionText).not.toContain("<item>");
                        expect(exitDescriptionText).not.toContain("</item>");
                    }
                }
            });
        });
    });

    describe('loadFixtures test', () => {
        beforeAll(async () => {
            await game.entityLoader.loadRooms(false);
        });

        describe('erroneous fixture response', () => {
            test('no response returned', async () => {
                sheets.__setMock(game.constants.fixtureSheetDataCells, undefined);
                const fixtureCount = await game.entityLoader.loadFixtures(true, errors);
                expect(errors).toEqual([]);
                expect(fixtureCount).toBe(0);
            });

            test('incomplete fixtures', async () => {
                sheets.__setMock(game.constants.fixtureSheetDataCells, [
                    ["aaa"],
                    [],
                    ["aaa", "aaa"],
                    ["aaa", "", "aaa"],
                    ["aaa", "", "", "aaa"],
                    ["aaa", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "", "aaa"],
                    ["aaa", "", "", "", "", "", "", "", "", "", "aaa"],
                ]);
                const fixtureCount = await game.entityLoader.loadFixtures(true, errors);
                expect(errors).not.toEqual([]);
                expect(fixtureCount).toBe(0);
            });

            test('fixture error messages', async () => {
                sheets.__setMock(game.constants.fixtureSheetDataCells, [
                    [""],
                    ["FLOOR", "saloon"],
                    ["FLOOR", "lobby"],
                    ["DESK", "lobby", "", "VAPORIZER"],
                    ["BAR LOCK", "Cooler", "TRUE", "ICE"],
                    ["EVAPORATOR", "Cooler", "TRUE", "BAR LOCK"],
                    ["TORTURE LABYRINTH", "Circus Tent", "TRUE", "", "", "FALSE", "FALSE", "FALSE", "A Lillian"],
                ]);
                await game.entityLoader.loadFixtures(false);
                await game.entityLoader.loadPuzzles(false);
                const fixtureCount = await game.entityLoader.loadFixtures(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load fixture on row 2. No fixture name was given.",
                    "Error: Couldn't load fixture on row 3. The location given is not a room.",
                    "Error: Couldn't load fixture on row 5. The child puzzle given is not a puzzle.",
                    "Error: Couldn't load fixture on row 6. The child puzzle on row 8 has no parent fixture.",
                    "Error: Couldn't load fixture on row 7. The child puzzle on row 9 has a different parent fixture.",
                    "Error: Couldn't load fixture on row 8. The hiding spot capacity given is not a number.",
                ];
                expect(fixtureCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            }, 10000);
        });

        describe('standard fixture response', () => {
            test('errorChecking true', async () => {
                await game.entityLoader.loadFixtures(false);
                await game.entityLoader.loadPuzzles(false);
                const fixtureCount = await game.entityLoader.loadFixtures(true, errors);
                expect(errors).toEqual([]);
                expect(fixtureCount).toBe(1546);
                for (const fixture of game.fixtures) {
                    const descriptionText = fixture.description.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }
            });
        });
    });

    describe('loadPrefabs test', () => {
        describe('erroneous prefab response', () => {
            test('incomplete prefabs', async () => {
                sheets.__setMock(game.constants.prefabSheetDataCells, [
                    [""],
                    ["aaa", ""],
                    ["aaa", ""],
                    ["bbb", "aaa", "", "", "123", "456"],
                    ["ccc", "aaa", "aaa", "", "aaa", "456"],
                    ["ddd", "aaa", "aaa", "", "123", "aaa"],
                ]);
                const prefabCount = await game.entityLoader.loadPrefabs(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load prefab on row 2. No prefab ID was given.",
                    "Error: Couldn't load prefab on row 3. No prefab name was given.",
                    "Error: Couldn't load prefab on row 4. Another prefab with this ID already exists.",
                    "Error: Couldn't load prefab on row 5. No single containing phrase was given.",
                    "Error: Couldn't load prefab on row 6. The size given is not a number.",
                    "Error: Couldn't load prefab on row 7. The weight given is not a number.",
                ];
                expect(errors).not.toEqual([]);
                expect(prefabCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid prefabs', async () => {
                sheets.__setMock(game.constants.prefabSheetDataCells, [
                    ["aaa", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "", "", "FALSE", "", "", "", "DUMMY SLOT: 10", "", ""],
                    ["bbb", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "", "000", "FALSE", "", "", "", "", "", ""],
                    ["ccc", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "", "", "FALSE", "", "", "", ": 10", "", ""],
                    ["ddd", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "", "", "FALSE", "", "", "", "DUMMY SLOT: ", "", ""],
                    ["eee", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "INVALID", "", "", "FALSE", "", "", "", "", "", ""],
                    ["fff", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "INVALID", "", "FALSE", "", "", "", "", "", ""],
                    ["ggg", "aaa", "aaa", "FALSE", "123", "456", "FALSE", "", "", "", "", "", "FALSE", "", "", "", "DUMMY SLOT: 10, DUMMY SLOT: 10", "in", ""],
                ]);
                const prefabCount = await game.entityLoader.loadPrefabs(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load prefab on row 2. AAA has inventory slots, but no preposition was given.",
                    "Error: Couldn't load prefab on row 3. \"000\" in turns into is not a prefab.",
                    "Error: Couldn't load prefab on row 4. No name was given for inventory slot 1.",
                    "Error: Couldn't load prefab on row 5. The capacity given for inventory slot \"DUMMY SLOT\" is not a number.",
                    "Error: Couldn't load prefab on row 6. \"invalid\" in effects is not a status effect.",
                    "Error: Couldn't load prefab on row 7. \"invalid\" in cures is not a status effect.",
                    "Error: Couldn't load prefab on row 8. The prefab already has an inventory slot with the ID \"DUMMY SLOT\".",
                ];
                expect(errors).not.toEqual([]);
                expect(prefabCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard prefab response', () => {
            test('errorChecking true', async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                const prefabCount = await game.entityLoader.loadPrefabs(true, errors);
                expect(errors).toEqual([]);
                expect(prefabCount).toBe(1494);
                for (const prefab of game.prefabsCollection.values()) {
                    const descriptionText = prefab.description.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }
            });
        });
    });

    describe('loadRecipes test', () => {
        describe('erroneous recipe response', () => {
            beforeEach(async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
            });

            test('incomplete recipes', async () => {
                sheets.__setMock(game.constants.recipeSheetDataCells, [
                    [""],
                ]);
                const recipeCount = await game.entityLoader.loadRecipes(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = ["Error: Couldn't load recipe on row 2. No ingredients were given."];
                expect(errors).not.toEqual([]);
                expect(recipeCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid recipes', async () => {
                sheets.__setMock(game.constants.recipeSheetDataCells, [
                    ["INVALID", "", "", "", "", "", "", ""],
                    ["ORANGE, PINEAPPLE, POT", "", "", "", "", "", "", ""],
                    ["ORANGE, PINEAPPLE", "", "", "", "ORANGE, PINEAPPLE, POT", "", "", ""],
                    ["ORANGE, PINEAPPLE", "", "", "1s", "ORANGE, PINEAPPLE", "", "", ""],
                    ["ORANGE, PINEAPPLE", "", "dummy", "1x", "ORANGE, PINEAPPLE", "", "", ""],
                    ["ORANGE, PINEAPPLE", "", "", "", "INVALID", "", "", ""],
                    ["ORANGE", "TRUE", "dummy", "", "ORANGE", "", "", ""],
                    ["ORANGE, PINEAPPLE", "TRUE", "", "", "ORANGE, PINEAPPLE", "", "", ""],
                ]);
                const recipeCount = await game.entityLoader.loadRecipes(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load recipe on row 2. \"INVALID\" in ingredients is not a prefab.",
                    "Error: Couldn't load recipe on row 3. Recipes with more than 2 ingredients must require a fixture tag.",
                    "Error: Couldn't load recipe on row 4. Recipes with more than 2 products must require a fixture tag.",
                    "Error: Couldn't load recipe on row 5. Recipes without a fixture tag cannot have a duration.",
                    "Error: Couldn't load recipe on row 6. An invalid duration was given.",
                    "Error: Couldn't load recipe on row 7. \"INVALID\" in products is not a prefab.",
                    "Error: Couldn't load recipe on row 8. Recipes with a fixture tag cannot be uncraftable.",
                    "Error: Couldn't load recipe on row 9. Recipes with more than one product cannot be uncraftable.",
                ];
                expect(errors).not.toEqual([]);
                expect(recipeCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard recipe response', () => {
            test('errorChecking true', async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                const recipeCount = await game.entityLoader.loadRecipes(true, errors);
                expect(errors).toEqual([]);
                expect(recipeCount).toBe(488);
            });
        });
    });

    describe('loadRoomItems test', () => {
        describe('erroneous room item response', () => {
            beforeEach(async () => {
                if (game.roomsCollection.size === 0) await game.entityLoader.loadRooms(false);
                if (game.fixtures.length === 0) await game.entityLoader.loadFixtures(false);
                if (game.puzzles.length === 0) await game.entityLoader.loadPuzzles(false);
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                if (game.inventoryItems.length === 0) await game.entityLoader.loadInventoryItems(false);
            });

            test('incomplete room items', async () => {
                sheets.__setMock(game.constants.roomItemSheetDataCells, [
                    [""],
                    ["ORANGE"],
                    ["ORANGE","","lobby"],
                ]);
                const roomItemCount = await game.entityLoader.loadRoomItems(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load room item on row 2. \"\" is not a prefab.",
                    "Error: Couldn't load room item on row 3. \"\" is not a room.",
                    "Error: Couldn't load room item on row 4. The container type wasn't specified.",
                ];
                expect(errors).not.toEqual([]);
                expect(roomItemCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid room items', async () => {
                sheets.__setMock(game.constants.roomItemSheetDataCells, [
                    ["VINYL GLOVE BOX","","lobby","","Fixture: COFFEE TABLE"],
                    ["VINYL GLOVE BOX","VINYL GLOVE BOX 1","lobby","","Fixture: COFFEE TABLE"],
                    ["VINYL GLOVE BOX","VINYL GLOVE BOX 1","lobby","","Fixture: COFFEE TABLE"],
                    ["KYRAS LAB COAT","KYRAS LAB COAT 1","kitchen","","Fixture: HAND WASH STATION 1","1"],
                    ["SIGN IN SHEET","","lobby","","Fixture: COFFEE TABLE", "2"],
                    ["ORANGE","","lobby","","Invalid: THE BACKROOMS"],
                    ["ORANGE","","lobby","","Fixture: INVALID"],
                    ["ORANGE","","lobby","","Item: INVALID"],
                    ["ORANGE","","lobby","","Puzzle: INVALID"],
                    ["ORANGE","","lobby","","Item: VINYL GLOVE BOX 1/VINYL GLOVE BOX","65536"],
                    ["ORANGE","","lobby","","Item: VINYL GLOVE BOX 1/INVALID SLOT","1"],
                    ["ORANGE","","lobby","","Item: VINYL GLOVE BOX 1/","1"],
                    ["ORANGE","ORANGE 1","lobby","","Fixture: COFFEE TABLE","1"],
                    ["ORANGE","ORANGE","lobby","","Item: ORANGE 1/ORANGE DIMENSION"],
                    ["POT","POT 1","lobby","","Item: POT 2/POT","1"],
                    ["POT","POT 2","lobby","","Item: POT 1/POT","1"],
                ]);
                const roomItemCount = await game.entityLoader.loadRoomItems(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load room item on row 2. This item is capable of containing items, but no container identifier was given.",
                    "Error: Couldn't load room item on row 3. Items capable of containing items must have a quantity of 1.",
                    "Error: Couldn't load room item on row 4. Another room item with this container identifier already exists.",
                    "Error: Couldn't load room item on row 5. Another item or inventory item with this container identifier already exists.",
                    "Error: Couldn't load room item on row 6. Quantity is higher than 1, but its prefab on row 2 has no plural containing phrase.",
                    "Error: Couldn't load room item on row 7. \"Invalid\" is not a valid container type.",
                    "Error: Couldn't load room item on row 8. The container given is not a fixture.",
                    "Error: Couldn't load room item on row 9. The container given is not a room item.",
                    "Error: Couldn't load room item on row 10. The container given is not a puzzle.",
                    "Error: Couldn't load room item on row 11. The item's container is over capacity.",
                    "Error: Couldn't load room item on row 12. The item's container prefab on row 5 has no inventory slot \"INVALID SLOT\".",
                    "Error: Couldn't load room item on row 13. The item's container is a room item, but a prefab inventory slot ID was not given.",
                    "Error: Couldn't load room item on row 15. The item's container is a room item, but the item container's prefab on row 292 has no inventory slots.",
                    "Error: Couldn't load room item on row 16. The item's container chain contains itself, resulting in an infinite loop.",
                    "Error: Couldn't load room item on row 17. The item's container chain contains itself, resulting in an infinite loop."
                ];
                expect(errors).not.toEqual([]);
                expect(roomItemCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard room item response', () => {
            test('errorChecking true', async () => {
                if (game.roomsCollection.size === 0) await game.entityLoader.loadRooms(false);
                if (game.fixtures.length === 0) await game.entityLoader.loadFixtures(false);
                if (game.puzzles.length === 0) await game.entityLoader.loadPuzzles(false);
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                const roomItemCount = await game.entityLoader.loadRoomItems(true, errors);
                expect(errors).toEqual([]);
                expect(roomItemCount).toBe(1766);
                for (const roomItem of game.roomItems) {
                    expect(roomItem.prefab).toBeInstanceOf(Prefab);
                    expect(roomItem.prefab.id).toEqual(Game.generateValidEntityName(roomItem.prefabId));
                    expect(roomItem.location).toBeInstanceOf(Room);
                    expect(roomItem.location.id).toEqual(Room.generateValidId(roomItem.locationDisplayName));
                    if (roomItem.containerType === "Fixture") {
                        expect(roomItem.container).toBeInstanceOf(Fixture);
                        expect(roomItem.container.name).toEqual(Game.generateValidEntityName(roomItem.containerName));
                    }
                    else if (roomItem.containerType === "Puzzle") {
                        expect(roomItem.container).toBeInstanceOf(Puzzle);
                        expect(roomItem.container.name).toEqual(Game.generateValidEntityName(roomItem.containerName));
                    }
                    else if (roomItem.containerType === "RoomItem") {
                        expect(roomItem.container).toBeInstanceOf(RoomItem);
                        if (roomItem.container instanceof RoomItem)
                            expect(`${roomItem.container.getIdentifier()}/${roomItem.slot}`).toEqual(Game.generateValidEntityName(roomItem.containerName));
                    }
                    expect(roomItem.inventoryCollection.size).toEqual(roomItem.prefab.inventoryCollection.size);
                    const descriptionText = roomItem.description.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }
                const cornDogBoxes = game.entityFinder.getRoomItems("BOX OF CORN DOGS", "freezer", undefined, "Fixture", "SHELF 1");
                for (const cornDogBox of cornDogBoxes) {
                    expect(cornDogBox.weight).toBe(22);
                }
            });
        });
    });

    describe('loadPuzzles test', () => {
        describe('erroneous puzzle response', () => {
            beforeEach(async() => {
                if (game.roomsCollection.size === 0) await game.entityLoader.loadRooms(false);
                if (game.fixtures.length === 0) await game.entityLoader.loadFixtures(false);
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
            });

            test('incomplete puzzles', async () => {
                sheets.__setMock(game.constants.puzzleSheetDataCells, [
                    [""]
                ]);
                const puzzleCount = await game.entityLoader.loadPuzzles(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load puzzle on row 2. No puzzle name was given."
                ];
                expect(errors).not.toEqual([]);
                expect(puzzleCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid puzzles part 1', async () => {
                sheets.__setMock(game.constants.puzzleSheetDataCells, [
                    ["aaa","","","","INVALID"],
                    ["bbb","","","","lobby","INVALID"],
                    ["ccc","","","","lobby","FLOOR"],
                    ["ddd","","","","floor-1-hall-1","CALL BUTTON"],
                    ["eee","","","","lobby",""],
                    ["fff","","","","lobby","","probability"],
                    ["ggg","","","","lobby","","invalid probability","","","1, 2"],
                    ["hhh","","","","lobby","","weight","","","NaN"],
                    ["iii","","","","lobby","","media","","","Invalid: LARGE MONKEY"],
                    ["jjj","","","","lobby","","container","","","Invalid: LARGE MONKEY"],
                    ["lll","FALSE","","","lobby","","switch","","",""],
                    ["mmm","TRUE","","","lobby","","switch","","",""],
                    ["nnn","TRUE","ON","","lobby","","switch","","","OFF"],
                    ["ooo","TRUE","","","lobby","","media","","","Prefab: STEAK KNIFE"],
                    ["ppp","TRUE","Invalid: LARGE MONKEY","","lobby","","media","","","Prefab: STEAK KNIFE"],
                    ["qqq","TRUE","Item: BLUE DANUBE CD","","lobby","","media","","","Item: BLUE DANUBE CD","","[Item: BLUE DANUBE CD: destroy player BLUE DANUBE CD, trigger BLUE DANUBE WALTZ / end BLUE DANUBE WALTZ, instantiate BLUE DANUBE CD on FLOOR at ballroom], [Item: EINE KLEINE NACHTMUSIK CD: destroy player EINE KLEINE NACHTMUSIK CD, trigger EINE KLEINE NACHTMUSIK WALTZ / end EINE KLEINE NACHTMUSIK WALTZ, instantiate EINE KLEINE NACHTMUSIK CD on FLOOR at ballroom]"],
                ]);
                const puzzleCount = await game.entityLoader.loadPuzzles(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load puzzle on row 2. \"INVALID\" is not a room.",
                    "Error: Couldn't load puzzle on row 3. The parent fixture given is not a fixture.",
                    "Error: Couldn't load puzzle on row 4. The parent fixture on row 2 has no child puzzle.",
                    "Error: Couldn't load puzzle on row 5. The parent fixture has a different child puzzle.",
                    "Error: Couldn't load puzzle on row 6. \"\" is not a valid puzzle type.",
                    "Error: Couldn't load puzzle on row 7. The puzzle is a probability-type puzzle, but no solutions were given.",
                    "Error: Couldn't load puzzle on row 8. \"invalid probability\" is not a valid stat probability puzzle type.",
                    "Error: Couldn't load puzzle on row 9. The puzzle is a weight-type puzzle, but the solution \"NaN\" is not an integer.",
                    "Error: Couldn't load puzzle on row 10. The puzzle is a media-type puzzle, but the solution \"Invalid: LARGE MONKEY\" does not have the \"Item: \" or \"Prefab: \" prefix.",
                    "Error: Couldn't load puzzle on row 11. The puzzle is a container-type puzzle, but the solution \"Invalid: LARGE MONKEY\" does not have the \"Item: \" or \"Prefab: \" prefix.",
                    "Error: Couldn't load puzzle on row 12. The puzzle is a switch-type puzzle, but it is not solved.",
                    "Error: Couldn't load puzzle on row 13. The puzzle is a switch-type puzzle, but no outcome was given.",
                    "Error: Couldn't load puzzle on row 14. The puzzle is a switch-type puzzle, but its outcome is not among the list of its solutions.",
                    "Error: Couldn't load puzzle on row 15. The puzzle is a media-type puzzle, but it was solved without an outcome.",
                    "Error: Couldn't load puzzle on row 16. The puzzle is a media-type puzzle, but its outcome is not among the list of its solutions.",
                    "Error: Couldn't load puzzle on row 17. \"Item: EINE KLEINE NACHTMUSIK CD\" in command sets is not an outcome in the puzzle's solutions.",
                ];
                expect(errors).not.toEqual([]);
                expect(puzzleCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid puzzles part 2', async () => {
                sheets.__setMock(game.constants.puzzleSheetDataCells, [
                    ["rrr","FALSE","","","lobby","","toggle","","Prefab: INVALID","Item: MASTER KEY"],
                    ["ttt","FALSE","","","lobby","","toggle","","Event: INVALID","Item: MASTER KEY"],
                    ["uuu","FALSE","","","lobby","","toggle","","Flag: INVALID","Item: MASTER KEY"],
                    ["vvv","FALSE","","","lobby","","toggle","","Puzzle: INVALID","Item: MASTER KEY"],
                    ["www","FALSE","","","lobby","","toggle","","Invalid: INVALID","Item: MASTER KEY"],
                ]);
                const puzzleCount = await game.entityLoader.loadPuzzles(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load puzzle on row 2. \"INVALID\" in requires is not a prefab.",
                    "Error: Couldn't load puzzle on row 3. \"INVALID\" in requires is not an event.",
                    "Error: Couldn't load puzzle on row 4. \"INVALID\" in requires is not a flag.",
                    "Error: Couldn't load puzzle on row 5. \"INVALID\" in requires is not a puzzle.",
                    "Error: Couldn't load puzzle on row 6. \"Invalid\" is not a valid requirement type."
                ];
                expect(errors).not.toEqual([]);
                expect(puzzleCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard puzzle response', () => {
            test('errorChecking true', async () => {
                if (game.roomsCollection.size === 0) await game.entityLoader.loadRooms(false);
                if (game.fixtures.length === 0) await game.entityLoader.loadFixtures(false);
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                const puzzleCount = await game.entityLoader.loadPuzzles(true, errors);
                expect(errors).toEqual([]);
                expect(puzzleCount).toBe(398);
                for (const puzzle of game.puzzles) {
                    const descriptionText = puzzle.alreadySolvedDescription.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }
            });
        });
    });

    describe('loadEvents test', () => {
        describe('erroneous event response', () => {
            test('incomplete events', async () => {
                sheets.__setMock(game.constants.eventSheetDataCells, [
                    [""]
                ]);
                const eventCount = await game.entityLoader.loadEvents(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load event on row 2. No event ID was given."
                ];
                expect(errors).not.toEqual([]);
                expect(eventCount).toBe(0);
                expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });

            test('invalid events', async () => {
                sheets.__setMock(game.constants.eventSheetDataCells, [
                    ["aaa","","90x"],
                    ["bbb","TRUE","90s","90y"],
                ]);
                const eventCount = await game.entityLoader.loadEvents(true, errors);
                const errorStrings = errors.join('\n').split('\n');
                const expectedErrorStrings = [
                    "Error: Couldn't load event on row 2. \"90x\" is not a valid duration.",
                    "Error: Couldn't load event on row 3. \"90y\" is not a valid representation of the time remaining.",
                ];
                console.log(errorStrings);
                expect(errors).not.toEqual([]);
                expect(eventCount).toBe(0);
                //expect(errorStrings).toHaveLength(expectedErrorStrings.length);
                for (const errorString of expectedErrorStrings) {
                    expect(errorStrings).toContain(errorString);
                }
            });
        });

        describe('standard event response', () => {
            test('errorChecking true', async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                const eventCount = await game.entityLoader.loadEvents(true, errors);
                expect(errors).toEqual([]);
                expect(eventCount).toBe(125);
            });
        });
    });

    describe('loadStatusEffects test', () => {
        describe('standard status effect response', () => {
            test('errorChecking true', async () => {
                const statusEffectCount = await game.entityLoader.loadStatusEffects(true, errors);
                expect(errors).toEqual([]);
                expect(statusEffectCount).toBe(152);
            });
        });
    });

    describe('loadPlayers test', () => {
        describe('standard player response', () => {
            test('errorChecking true', async () => {
                if (game.roomsCollection.size === 0) await game.entityLoader.loadRooms(false);
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                const playerCount = await game.entityLoader.loadPlayers(true, errors);
                expect(errors).toEqual([]);
                expect(playerCount).toBe(11);
                for (const player of game.playersCollection.values()) {
                    const descriptionText = player.description.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }
            });
        });
    });

    describe('loadInventoryItems test', () => {
        describe('standard inventory item response', () => {
            test('errorChecking true', async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                if (game.prefabsCollection.size === 0) await game.entityLoader.loadPrefabs(false);
                if (game.playersCollection.size === 0) await game.entityLoader.loadPlayers(false);
                const inventoryItemCount = await game.entityLoader.loadInventoryItems(true, errors);
                expect(errors).toEqual([]);
                expect(inventoryItemCount).toBe(130);
                for (const inventoryItem of game.inventoryItems) {
                    if (inventoryItem.prefabId !== "") {
                        expect(inventoryItem.prefab).toBeInstanceOf(Prefab);
                        expect(inventoryItem.prefab.id).toEqual(Game.generateValidEntityName(inventoryItem.prefabId));
                        expect(inventoryItem.inventoryCollection.size).toEqual(inventoryItem.prefab.inventoryCollection.size);
                    }
                    else expect(inventoryItem.prefab).toBe(null);
                    expect(inventoryItem.player).toBeInstanceOf(Player);
                    expect(inventoryItem.player.name).toEqual(inventoryItem.playerName);
                    expect(inventoryItem.player.inventoryCollection.get(inventoryItem.equipmentSlot)).toBeInstanceOf(EquipmentSlot);
                    if (inventoryItem.containerName !== "") {
                        expect(inventoryItem.container).toBeInstanceOf(InventoryItem);
                        expect(inventoryItem.containerType).toEqual("InventoryItem");
                        expect(`${inventoryItem.container.getIdentifier()}/${inventoryItem.slot}`).toEqual(Game.generateValidEntityName(inventoryItem.containerName));
                    }
                    const descriptionText = inventoryItem.description.toString();
                    expect(descriptionText).not.toContain("<item>");
                    expect(descriptionText).not.toContain("</item>");
                }

                const kyra = game.entityFinder.getPlayer("Kyra");
                expect(kyra.carryWeight).toBe(5);
                const kyraJacket = kyra.inventoryCollection.get("JACKET");
                expect(kyraJacket.items).toHaveLength(1);
                expect(kyraJacket.equippedItem).not.toBeNull();
                expect(kyraJacket.equippedItem.identifier).toBe("KYRAS LAB COAT 1");
                expect(kyraJacket.equippedItem.inventoryCollection.size).toBe(2);
                for (const inventorySlot of kyraJacket.equippedItem.inventoryCollection.values()) {
                    expect(inventorySlot.takenSpace).toBe(0);
                    expect(inventorySlot.weight).toBe(0);
                }
                const kyraPants = kyra.inventoryCollection.get("PANTS");
                expect(kyraPants.items).toHaveLength(2);
                expect(kyraPants.equippedItem).not.toBeNull();
                expect(kyraPants.equippedItem.inventoryCollection.size).toBe(2);
                expect(kyraPants.items[1].prefab.id).toBe("MASTER KEY");
                const kyraPantsRightPocket = kyraPants.equippedItem.inventoryCollection.get("RIGHT POCKET");
                expect(kyraPantsRightPocket.takenSpace).toBe(1);
                expect(kyraPantsRightPocket.weight).toBe(1);
                expect(kyraPantsRightPocket.items).toHaveLength(1);
                expect(kyraPantsRightPocket.items[0].prefab.id).toBe("MASTER KEY");

                const vivian = game.entityFinder.getPlayer("Vivian");
                expect(vivian.carryWeight).toBe(22);
                const vivianBag = vivian.inventoryCollection.get("BAG");
                expect(vivianBag.items).toHaveLength(6);
                expect(vivianBag.equippedItem).not.toBe(null);
                expect(vivianBag.equippedItem.identifier).toBe("VIVIANS QUIVER");
                expect(vivianBag.equippedItem.weight).toBe(20);
                expect(vivianBag.equippedItem.inventoryCollection.size).toBe(1);
                const vivianQuiver = vivianBag.equippedItem.inventoryCollection.get("QUIVER");
                expect(vivianQuiver.takenSpace).toBe(5);
                expect(vivianQuiver.weight).toBe(1);
                expect(vivianQuiver.items).toHaveLength(1);
                expect(vivianQuiver.items[0].identifier).toBe("WHITE JEANS 2");
                const whiteJeans = vivianQuiver.items[0];
                expect(whiteJeans.weight).toBe(19);
                expect(whiteJeans.inventoryCollection.size).toBe(4);
                const whiteJeansRightPocket = whiteJeans.inventoryCollection.get("RIGHT POCKET");
                const whiteJeansLeftPocket = whiteJeans.inventoryCollection.get("LEFT POCKET");
                const whiteJeansRightBackPocket = whiteJeans.inventoryCollection.get("RIGHT BACK POCKET");
                const whiteJeansLeftBackPocket = whiteJeans.inventoryCollection.get("LEFT BACK POCKET");
                expect(whiteJeansRightBackPocket.items).toHaveLength(0);
                expect(whiteJeansLeftBackPocket.items).toHaveLength(0);
                expect(whiteJeansRightPocket.items).toHaveLength(1);
                expect(whiteJeansRightPocket.takenSpace).toBe(2);
                expect(whiteJeansLeftPocket.items).toHaveLength(1);
                expect(whiteJeansLeftPocket.takenSpace).toBe(2);
                expect(whiteJeansRightPocket.items[0].identifier).toBe("PACK OF TOILET PAPER 2");
                expect(whiteJeansLeftPocket.items[0].identifier).toBe("PACK OF TOILET PAPER 3");
                expect(whiteJeansRightPocket.items[0].weight).toBe(12);
                expect(whiteJeansLeftPocket.items[0].weight).toBe(6);
                expect(whiteJeansRightPocket.items[0].inventoryCollection.size).toBe(1);
                expect(whiteJeansLeftPocket.items[0].inventoryCollection.size).toBe(1);
                const tpPack2 = whiteJeansRightPocket.items[0].inventoryCollection.get("PACK");
                const tpPack3 = whiteJeansLeftPocket.items[0].inventoryCollection.get("PACK");
                expect(tpPack2.items).toHaveLength(1);
                expect(tpPack3.items).toHaveLength(1);
                expect(tpPack2.takenSpace).toBe(12);
                expect(tpPack3.takenSpace).toBe(5);
                expect(tpPack2.weight).toBe(12);
                expect(tpPack3.weight).toBe(6);
                expect(tpPack2.items[0].prefab.id).toBe("HAMBURGER BUN");
                expect(tpPack3.items[0].prefab.id).toBe("DETERGENT");
            });
        });
    });

    describe('loadGestures test', () => {
        describe('standard gesture response', () => {
            test('errorChecking true', async () => {
                if (game.statusEffectsCollection.size === 0) await game.entityLoader.loadStatusEffects(false);
                const gestureCount = await game.entityLoader.loadGestures(true, errors);
                expect(errors).toEqual([]);
                expect(gestureCount).toBe(138);
            });
        });
    });

    describe('loadFlags test', () => {
        describe('standard flag response', () => {
            test('errorChecking true', async () => {
                const flagCount = await game.entityLoader.loadFlags(true, errors);
                expect(errors).toEqual([]);
                expect(flagCount).toBe(16);
            });
        });
    });
});