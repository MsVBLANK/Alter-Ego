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
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 1);
			fixture.instantiateProducts(fixture.process.recipe, 1);
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
			fixture.destroyIngredients(fixture.process.recipe, fixture.process.ingredients, 3);
			fixture.instantiateProducts(fixture.process.recipe, 3);
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
			fixture.destroyIngredients(2);
			fixture.instantiateProducts(2);
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
			fixture.destroyIngredients(3);
			fixture.instantiateProducts(3);
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
			fixture.destroyIngredients(7);
			fixture.instantiateProducts(7);
			{
				let items = fixture.getContainedItems();
				expect(items.length).toBe(1);
				const smoothie = items[0];
				expect(smoothie.quantity).toBe(7);
				expect(smoothie.uses).toBe(3);
			}
		});
	});
});
