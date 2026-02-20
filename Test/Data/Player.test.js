describe('Player test', () => {
	beforeAll(async () => {
		if (!game.inProgress) await game.entityLoader.loadAll();
	});

	describe('Crafting', () => {
		afterEach(async () => {
			await game.entityLoader.loadInventoryItems(false);
		});

		test('Hand-crafting 1', () => {
			const player = game.entityFinder.getPlayer('Astrid');
			const appleSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'APPLE');
			const orangeSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'ORANGE');
			expect(appleSlot).not.toBeUndefined();
			expect(orangeSlot).not.toBeUndefined();
			expect(appleSlot.equippedItem).not.toBeUndefined();
			expect(orangeSlot.equippedItem).not.toBeUndefined();
			expect(appleSlot.equippedItem.uses).toBe(1);
			expect(orangeSlot.equippedItem.uses).toBe(1);
			expect(appleSlot.equippedItem.quantity).toBe(1);
			expect(orangeSlot.equippedItem.quantity).toBe(1);
			const recipe = game.entityFinder.getRecipes('crafting', '', 'apple, orange', 'apple orange smoothie')[0];
			expect(recipe).not.toBeUndefined();
			player.craft(recipe);
			const smoothieSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'APPLE ORANGE SMOOTHIE');
			expect(smoothieSlot).not.toBeUndefined();
			expect(smoothieSlot.equippedItem).not.toBeUndefined();
			expect(smoothieSlot.equippedItem.uses).toBe(2);
			expect(smoothieSlot.equippedItem.quantity).toBe(1);
		});

		test('Hand-crafting 2', () => {
			const player = game.entityFinder.getPlayer('Asuka');
			let potSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'POT');
			const eggSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'RAW EGG');
			expect(potSlot).not.toBeUndefined();
			expect(eggSlot).not.toBeUndefined();
			expect(potSlot.equippedItem).not.toBeUndefined();
			expect(eggSlot.equippedItem).not.toBeUndefined();
			expect(potSlot.equippedItem.uses).toBe(NaN);
			expect(eggSlot.equippedItem.uses).toBe(1);
			expect(potSlot.equippedItem.quantity).toBe(1);
			expect(eggSlot.equippedItem.quantity).toBe(1);
			const recipe = game.entityFinder.getRecipes('crafting', '', 'pot, raw egg', 'pot')[0];
			expect(recipe).not.toBeUndefined();
			player.craft(recipe);
			potSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'POT');
			expect(potSlot).not.toBeUndefined();
			expect(potSlot.equippedItem).not.toBeUndefined();
			expect(potSlot.equippedItem.uses).toBe(NaN);
			expect(potSlot.equippedItem.quantity).toBe(1);
			const eggItem = game.entityFinder.getInventoryItem("RAW EGG", "Asuka", "POT 39");
			expect(eggItem).not.toBeUndefined();
			expect(eggItem.uses).toBe(1);
			expect(eggItem.quantity).toBe(1);
		});

		test('Hand-crafting 3', () => {
			const player = game.entityFinder.getPlayer('Luna');
			let potSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'POT');
			const orangeJuiceSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'ORANGE JUICE');
			expect(potSlot).not.toBeUndefined();
			expect(orangeJuiceSlot).not.toBeUndefined();
			expect(potSlot.equippedItem).not.toBeUndefined();
			expect(orangeJuiceSlot.equippedItem).not.toBeUndefined();
			expect(potSlot.equippedItem.uses).toBe(NaN);
			expect(orangeJuiceSlot.equippedItem.uses).toBe(4);
			expect(potSlot.equippedItem.quantity).toBe(1);
			expect(orangeJuiceSlot.equippedItem.quantity).toBe(1);
			const recipe = game.entityFinder.getRecipes('crafting', '', 'pot, orange juice', 'pot')[0];
			expect(recipe).not.toBeUndefined();
			player.craft(recipe);
			potSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'POT');
			expect(potSlot).not.toBeUndefined();
			expect(potSlot.equippedItem).not.toBeUndefined();
			expect(potSlot.equippedItem.uses).toBe(NaN);
			expect(potSlot.equippedItem.quantity).toBe(1);
			const orangeJuiceItem = game.entityFinder.getInventoryItem("ORANGE JUICE", "Luna", "POT 3939");
			expect(orangeJuiceItem).not.toBeUndefined();
			expect(orangeJuiceItem.uses).toBe(4);
			expect(orangeJuiceItem.quantity).toBe(1);
		});

		test('Hand-crafting 4', () => {
			const player = game.entityFinder.getPlayer('Kiara');
			let tamponSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'TAMPON');
			const orangeJuiceSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'ORANGE JUICE');
			expect(tamponSlot).not.toBeUndefined();
			expect(orangeJuiceSlot).not.toBeUndefined();
			expect(tamponSlot.equippedItem).not.toBeUndefined();
			expect(orangeJuiceSlot.equippedItem).not.toBeUndefined();
			expect(tamponSlot.equippedItem.uses).toBe(NaN);
			expect(orangeJuiceSlot.equippedItem.uses).toBe(4);
			expect(tamponSlot.equippedItem.quantity).toBe(1);
			expect(orangeJuiceSlot.equippedItem.quantity).toBe(1);
			const recipe = game.entityFinder.getRecipes('crafting', '', 'tampon, orange juice', 'tampon, milk')[0];
			expect(recipe).not.toBeUndefined();
			player.craft(recipe);
			tamponSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'TAMPON');
			expect(tamponSlot).not.toBeUndefined();
			expect(tamponSlot.equippedItem).not.toBeUndefined();
			expect(tamponSlot.equippedItem.uses).toBe(NaN);
			expect(tamponSlot.equippedItem.quantity).toBe(1);
			const milkSlot = game.entityFinder.getPlayerHandHoldingItem(player, 'MILK');
			expect(milkSlot).not.toBeUndefined();
			expect(milkSlot.equippedItem).not.toBeUndefined();
			expect(milkSlot.equippedItem.uses).toBe(4);
			expect(milkSlot.equippedItem.quantity).toBe(1);
		});
	});
});
