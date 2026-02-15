describe('Recipe test', () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    describe('test ingredientsMatch', () => {
        test('ingredientsMatch on canteen BURNER 1', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 1", "canteen");
            const items = burner1.getContainedItems();
            expect(recipe.ingredientsMatch(items, true)).toBe(false);
        });

        test('ingredientsMatch on canteen BURNER 2', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 2", "canteen");
            const items = burner1.getContainedItems();
            expect(recipe.ingredientsMatch(items, true)).toBe(true);
        });

        test('ingredientsMatch on canteen BURNER 3', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 3", "canteen");
            const items = burner1.getContainedItems();
            expect(recipe.ingredientsMatch(items, true)).toBe(true);
        });

        test('ingredientsMatch on canteen BURNER 4', () => {
            const recipe = game.entityFinder.getRecipes("processing", "stovetop", "POT OF RICE, DICED ONIONS, BUTTER, COOKING SHERRY, SHREDDED CHEESE, CHICKEN BROTH, PAN")[0];
            const burner1 = game.entityFinder.getFixture("BURNER 4", "canteen");
            const items = burner1.getContainedItems();
            expect(recipe.ingredientsMatch(items, true)).toBe(true);
        });
    });
});