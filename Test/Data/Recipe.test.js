import CollatedRoomItem from "../../Data/CollatedRoomItem.js";
import { getSortedItems } from "../../Modules/helpers.js";

describe('Recipe test', () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    describe('test ingredientsMatch', () => {
        test('ingredientsMatch on canteen BURNER 1', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 1", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner1.getContainedItems()));
            expect(recipe.ingredientsMatch(items)).toBe(false);
        });

        test('ingredientsMatch on canteen BURNER 2', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner2 = game.entityFinder.getFixture("BURNER 2", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner2.getContainedItems()));
            expect(recipe.ingredientsMatch(items)).toBe(true);
        });

        test('ingredientsMatch on canteen BURNER 3', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner3 = game.entityFinder.getFixture("BURNER 3", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner3.getContainedItems()));
            expect(recipe.ingredientsMatch(items)).toBe(true);
        });

        test('ingredientsMatch on canteen BURNER 4', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner4 = game.entityFinder.getFixture("BURNER 4", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner4.getContainedItems()));
            expect(recipe.ingredientsMatch(items)).toBe(true);
        });
    });

    describe('test getSatisfactoryProcessCount', () => {
        test('getSatisfactoryProcessCount on canteen BURNER 1', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 1", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner1.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(0);
        });

        test('getSatisfactoryProcessCount on canteen BURNER 2', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner2 = game.entityFinder.getFixture("BURNER 2", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner2.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(1);
        });

        test('getSatisfactoryProcessCount on canteen BURNER 3', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner3 = game.entityFinder.getFixture("BURNER 3", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner3.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(1);
        });

        test('getSatisfactoryProcessCount on canteen BURNER 4', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner4 = game.entityFinder.getFixture("BURNER 4", "canteen");
            const items = CollatedRoomItem.collate(getSortedItems(burner4.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(2);
        });

        test('getSatisfactoryProcessCount in video-room BLENDER', () => {
            const recipe = game.entityFinder.getRecipes("processing", "blender", "ORANGE", "ORANGE SMOOTHIE")[0];
            const blender = game.entityFinder.getFixture("BLENDER", "video-room");
            const items = CollatedRoomItem.collate(getSortedItems(blender.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(3);
        });

        test('getSatisfactoryProcessCount in video-room SINK 1', () => {
            const recipe = game.entityFinder.getRecipes("processing", "small water source", "DIRTY PLATE, DETERGENT", "CLEAN PLATE, DETERGENT")[0];
            const sink = game.entityFinder.getFixture("SINK 1", "video-room");
            const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(13);
        });

        test('getSatisfactoryProcessCount in video-room SINK 2', () => {
            const recipe = game.entityFinder.getRecipes("processing", "small water source", "DIRTY PLATE, DETERGENT", "CLEAN PLATE, DETERGENT")[0];
            const sink = game.entityFinder.getFixture("SINK 2", "video-room");
            const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
            expect(recipe.getSatisfactoryProcessCount(items)).toBe(19);
        });
    });
});