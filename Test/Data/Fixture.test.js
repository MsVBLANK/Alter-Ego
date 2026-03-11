import CollatedItem from '../../Data/CollatedItem.ts';

describe('Fixture test', () => {
	beforeAll(async () => {
		if (!game.inProgress) await game.entityLoader.loadAll();
	});

	describe('Processing tests', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(async () => {
			vi.clearAllTimers();
			vi.useRealTimers();
			await game.entityLoader.loadFixtures(false);
			await game.entityLoader.loadRoomItems(false);
		});

		test('Fixture.destroyIngredients for CUTTING BOARD 1 of video-room', () => {
			const fixture = game.entityFinder.getFixture('CUTTING BOARD 1', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const orange = items[0];
				const knife = items[1];
				expect(orange.quantity).toBe(10);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 1);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const orange = items[0];
				const knife = items[1];
				expect(orange.quantity).toBe(9);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
			}
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 3);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const orange = items[0];
				const knife = items[1];
				expect(orange.quantity).toBe(6);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
			}
		});

		test('Fixture.instantiateProducts for CUTTING BOARD 1 of video-room', () => {
			const fixture = game.entityFinder.getFixture('CUTTING BOARD 1', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const orange = items[0];
				const knife = items[1];
				expect(orange.quantity).toBe(10);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
			fixture.instantiateProducts(fixture.process.recipe, 1);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(3);
				const orange = items[0];
				const knife = items[1];
				const slices = items[2];
				expect(orange.quantity).toBe(10);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
				expect(slices.quantity).toBe(1);
				expect(slices.uses).toBe(1);
			}
			fixture.instantiateProducts(fixture.process.recipe, 3);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(3);
				const orange = items[0];
				const knife = items[1];
				const slices = items[2];
				expect(orange.quantity).toBe(10);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
				expect(slices.quantity).toBe(4);
				expect(slices.uses).toBe(1);
			}
		});

		test('Fixture process flow for CUTTING BOARD 1 of video-room', () => {
			const fixture = game.entityFinder.getFixture('CUTTING BOARD 1', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const orange = items[0];
				const knife = items[1];
				expect(orange.quantity).toBe(10);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
            let variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 1);
			fixture.instantiateProducts(fixture.process.recipe, 1, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(3);
				const orange = items[0];
				const knife = items[1];
				const slices = items[2];
				expect(orange.quantity).toBe(9);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
				expect(slices.quantity).toBe(1);
				expect(slices.uses).toBe(1);
			}
            variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 3);
			fixture.instantiateProducts(fixture.process.recipe, 3, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(3);
				const orange = items[0];
				const knife = items[1];
				const slices = items[2];
				expect(orange.quantity).toBe(6);
				expect(orange.uses).toBe(1);
				expect(knife.quantity).toBe(1);
				expect(knife.uses).toBe(NaN);
				expect(slices.quantity).toBe(4);
				expect(slices.uses).toBe(1);
			}
		});

		test('Fixture process flow for BLENDER 2 of video-room', () => {
			const fixture = game.entityFinder.getFixture('BLENDER 2', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const cup = items[0];
				const banana = cup.inventory.get(cup.inventory.firstKey()).items[0];
				expect(cup.quantity).toBe(1);
				expect(cup.uses).toBe(NaN);
				expect(banana.quantity).toBe(2);
				expect(banana.uses).toBe(1);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
            const variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 2);
			fixture.instantiateProducts(fixture.process.recipe, 2, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const milkshake = items[0];
				expect(milkshake.quantity).toBe(1);
				expect(milkshake.uses).toBe(2);
			}
		});

		test('Fixture process flow for BLENDER 3 of video-room', () => {
			const fixture = game.entityFinder.getFixture('BLENDER 3', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const apple = items[0];
				const orange = items[1];
				expect(apple.quantity).toBe(3);
				expect(apple.uses).toBe(1);
				expect(orange.quantity).toBe(3);
				expect(orange.uses).toBe(1);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
            const variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 3);
			fixture.instantiateProducts(fixture.process.recipe, 3, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const smoothie = items[0];
				expect(smoothie.quantity).toBe(3);
				expect(smoothie.uses).toBe(2);
			}
		});

		test('Fixture process flow for BLENDER 4 of video-room', () => {
			const fixture = game.entityFinder.getFixture('BLENDER 4', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(2);
				const banana = items[0];
				const orange = items[1];
				expect(banana.quantity).toBe(7);
				expect(banana.uses).toBe(1);
				expect(orange.quantity).toBe(7);
				expect(orange.uses).toBe(1);
			}
			const recipeData = fixture.findRecipe();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
            const variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 7);
			fixture.instantiateProducts(fixture.process.recipe, 7, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const smoothie = items[0];
				expect(smoothie.quantity).toBe(7);
				expect(smoothie.uses).toBe(3);
			}
		});

		test('Fixture process flow for BLENDER 7 of video-room', () => {
			const fixture = game.entityFinder.getFixture('BLENDER 7', 'video-room');
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const orangeJuice = items[0];
				expect(orangeJuice.quantity).toBe(1);
				expect(orangeJuice.uses).toBe(4);
			}
			const recipeData = fixture.findRecipe();
			expect(recipeData.recipe).not.toBeNull();
			fixture.process.recipe = recipeData.recipe;
			fixture.process.ingredients = recipeData.ingredients;
			const spc = fixture.process.recipe.getSatisfactoryProcessCount(CollatedItem.collate(fixture.getContainedItems()));
            const variableValues = fixture.process.recipe.getIngredientVariableValues(fixture.process.ingredients);
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, spc);
			fixture.instantiateProducts(fixture.process.recipe, spc, variableValues);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const milk = items[0];
				expect(milk.quantity).toBe(1);
				expect(milk.uses).toBe(4);
			}
		});
	});

	describe('Full flow tests', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(async () => {
            vi.clearAllTimers();
            vi.useRealTimers();
            await game.entityLoader.loadFixtures(false);
            await game.entityLoader.loadRoomItems(false);
        });

        test('Full flow for CUTTING BOARD 1 of video-room', () => {
            const fixture = game.entityFinder.getFixture('CUTTING BOARD 1', 'video-room');
            fixture.activate()
            vi.advanceTimersByTime(1000);
            {
                let items = fixture.getContainedItems();
                expect(items.length).toBe(2);
                const knife = items[0];
                const slices = items[1];
                expect(knife.prefabId).toBe("LARGE KNIFE")
                expect(knife.quantity).toBe(1);
                expect(knife.uses).toBe(NaN);
                expect(slices.prefabId).toBe("PEELED ORANGE")
                expect(slices.quantity).toBe(10);
                expect(slices.uses).toBe(1);
            }
        });

        test('Full flow for BURNER 3 of video-room', () => {
            const fixture = game.entityFinder.getFixture('BURNER 3', 'video-room');
            fixture.activate()
            vi.advanceTimersByTime(1000);
            {
                let items = fixture.getContainedItems();
                expect(items.length).toBe(2);
                const pan1 = items[0];
                const pan2 = items[1];
                expect(pan1.prefabId).toBe("DIRTY PAN")
                expect(pan1.quantity).toBe(1);
                expect(pan1.uses).toBe(NaN);
                expect(pan1.inventory.first().items[0].prefabId).toBe("COOKED STEAK")
                expect(pan1.inventory.first().items[0].quantity).toBe(1)
                expect(pan1.inventory.first().items[0].uses).toBe(2)
                expect(pan2.prefabId).toBe("DIRTY PAN")
                expect(pan2.quantity).toBe(1);
                expect(pan2.uses).toBe(NaN);
                expect(pan2.inventory.first().items[0].prefabId).toBe("COOKED STEAK")
                expect(pan2.inventory.first().items[0].quantity).toBe(1)
                expect(pan2.inventory.first().items[0].uses).toBe(2)
            }
        });
    });
});
