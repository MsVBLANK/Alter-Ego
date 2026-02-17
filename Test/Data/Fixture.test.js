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

		test('Fixture.destroyIngredients', () => {
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
			fixture.destroyIngredients(1);
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
			fixture.destroyIngredients(3);
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

		test('Fixture.instantiateProducts', () => {
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
			fixture.instantiateProducts(1);
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
			fixture.instantiateProducts(3);
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

		test('Fixture process flow', () => {
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
			fixture.destroyIngredients(1);
			fixture.instantiateProducts(1);
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
			fixture.destroyIngredients(3);
			fixture.instantiateProducts(3);
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
	});
});
