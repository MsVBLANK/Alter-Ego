import CollatedRoomItem from "../../Data/CollatedRoomItem.js";
import { getSortedItems } from "../../Modules/helpers.js";

describe('CollatedRoomItem test', () => {
	beforeAll(async () => {
		if (!game.inProgress) await game.entityLoader.loadAll();
	});

	describe('test collate method', () => {
		test('collate items on canteen BURNER 1', () => {
			const burner1 = game.entityFinder.getFixture("BURNER 1", "canteen");
			const items = CollatedRoomItem.collate(getSortedItems(burner1.getContainedItems()));
			expect(items.length).toBe(7);
			const butter = items[0];
			const chickenBroth = items[1];
			const cookingSherry = items[2];
			const dicedOnions = items[3];
			const pan = items[4];
			const potOfRice = items[5];
			const shreddedCheese = items[6];
			expect(butter.prefab.id).toBe("BUTTER");
			expect(butter.quantity).toBe(1);
			expect(butter.uses).toBe(6);
			expect(chickenBroth.prefab.id).toBe("CHICKEN BROTH");
			expect(chickenBroth.quantity).toBe(1);
			expect(chickenBroth.uses).toBeNaN();
			expect(cookingSherry.prefab.id).toBe("COOKING SHERRY");
			expect(cookingSherry.quantity).toBe(1);
			expect(cookingSherry.uses).toBe(10);
			expect(dicedOnions.prefab.id).toBe("DICED ONIONS");
			expect(dicedOnions.quantity).toBe(1);
			expect(dicedOnions.uses).toBeNaN();
			expect(pan.prefab.id).toBe("PAN");
			expect(pan.quantity).toBe(1);
			expect(pan.uses).toBeNaN();
			expect(potOfRice.prefab.id).toBe("POT OF RICE");
			expect(potOfRice.quantity).toBe(1);
			expect(potOfRice.uses).toBe(3);
			expect(shreddedCheese.prefab.id).toBe("SHREDDED CHEESE");
			expect(shreddedCheese.quantity).toBe(1);
			expect(shreddedCheese.uses).toBeNaN();
		});

		test('collate items on canteen BURNER 2', () => {
			const burner2 = game.entityFinder.getFixture("BURNER 2", "canteen");
			const items = CollatedRoomItem.collate(getSortedItems(burner2.getContainedItems()));
			expect(items.length).toBe(7);
			const butter = items[0];
			const chickenBroth = items[1];
			const cookingSherry = items[2];
			const dicedOnions = items[3];
			const pan = items[4];
			const potOfRice = items[5];
			const shreddedCheese = items[6];
			expect(butter.prefab.id).toBe("BUTTER");
			expect(butter.quantity).toBe(3);
			expect(butter.uses).toBe(6);
			expect(chickenBroth.prefab.id).toBe("CHICKEN BROTH");
			expect(chickenBroth.quantity).toBe(1);
			expect(chickenBroth.uses).toBeNaN();
			expect(cookingSherry.prefab.id).toBe("COOKING SHERRY");
			expect(cookingSherry.quantity).toBe(1);
			expect(cookingSherry.uses).toBe(10);
			expect(dicedOnions.prefab.id).toBe("DICED ONIONS");
			expect(dicedOnions.quantity).toBe(1);
			expect(dicedOnions.uses).toBeNaN();
			expect(pan.prefab.id).toBe("PAN");
			expect(pan.quantity).toBe(1);
			expect(pan.uses).toBeNaN();
			expect(potOfRice.prefab.id).toBe("POT OF RICE");
			expect(potOfRice.quantity).toBe(1);
			expect(potOfRice.uses).toBe(3);
			expect(shreddedCheese.prefab.id).toBe("SHREDDED CHEESE");
			expect(shreddedCheese.quantity).toBe(2);
			expect(shreddedCheese.uses).toBeNaN();
		});

		test('collate items on canteen BURNER 3', () => {
			const burner3 = game.entityFinder.getFixture("BURNER 3", "canteen");
			const items = CollatedRoomItem.collate(getSortedItems(burner3.getContainedItems()));
			expect(items.length).toBe(7);
			const butter = items[0];
			const chickenBroth = items[1];
			const cookingSherry = items[2];
			const dicedOnions = items[3];
			const pan = items[4];
			const potOfRice = items[5];
			const shreddedCheese = items[6];
			expect(butter.prefab.id).toBe("BUTTER");
			expect(butter.quantity).toBe(2);
			expect(butter.uses).toBe(7);
			expect(chickenBroth.prefab.id).toBe("CHICKEN BROTH");
			expect(chickenBroth.quantity).toBe(2);
			expect(chickenBroth.uses).toBeNaN();
			expect(cookingSherry.prefab.id).toBe("COOKING SHERRY");
			expect(cookingSherry.quantity).toBe(2);
			expect(cookingSherry.uses).toBe(20);
			expect(dicedOnions.prefab.id).toBe("DICED ONIONS");
			expect(dicedOnions.quantity).toBe(2);
			expect(dicedOnions.uses).toBeNaN();
			expect(pan.prefab.id).toBe("PAN");
			expect(pan.quantity).toBe(2);
			expect(pan.uses).toBeNaN();
			expect(potOfRice.prefab.id).toBe("POT OF RICE");
			expect(potOfRice.quantity).toBe(2);
			expect(potOfRice.uses).toBe(6);
			expect(shreddedCheese.prefab.id).toBe("SHREDDED CHEESE");
			expect(shreddedCheese.quantity).toBe(2);
			expect(shreddedCheese.uses).toBeNaN();
		});

		test('collate items on canteen BURNER 4', () => {
			const burner4 = game.entityFinder.getFixture("BURNER 4", "canteen");
			const items = CollatedRoomItem.collate(getSortedItems(burner4.getContainedItems()));
			expect(items.length).toBe(7);
			const butter = items[0];
			const chickenBroth = items[1];
			const cookingSherry = items[2];
			const dicedOnions = items[3];
			const pan = items[4];
			const potOfRice = items[5];
			const shreddedCheese = items[6];
			expect(butter.prefab.id).toBe("BUTTER");
			expect(butter.quantity).toBe(4);
			expect(butter.uses).toBe(24);
			expect(chickenBroth.prefab.id).toBe("CHICKEN BROTH");
			expect(chickenBroth.quantity).toBe(2);
			expect(chickenBroth.uses).toBeNaN();
			expect(cookingSherry.prefab.id).toBe("COOKING SHERRY");
			expect(cookingSherry.quantity).toBe(3);
			expect(cookingSherry.uses).toBeNaN();
			expect(dicedOnions.prefab.id).toBe("DICED ONIONS");
			expect(dicedOnions.quantity).toBe(2);
			expect(dicedOnions.uses).toBeNaN();
			expect(pan.prefab.id).toBe("PAN");
			expect(pan.quantity).toBe(2);
			expect(pan.uses).toBeNaN();
			expect(potOfRice.prefab.id).toBe("POT OF RICE");
			expect(potOfRice.quantity).toBe(2);
			expect(potOfRice.uses).toBe(6);
			expect(shreddedCheese.prefab.id).toBe("SHREDDED CHEESE");
			expect(shreddedCheese.quantity).toBe(4);
			expect(shreddedCheese.uses).toBeNaN();
		});

		test('collate items in video room SINK 1', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			expect(items.length).toBe(2);
			const detergent = items[0];
			const dirtyPlate = items[1];
			expect(detergent.prefab.id).toBe("DETERGENT");
			expect(detergent.quantity).toBe(4);
			expect(detergent.uses).toBe(13);
			expect(dirtyPlate.prefab.id).toBe("DIRTY PLATE");
			expect(dirtyPlate.quantity).toBe(20);
			expect(dirtyPlate.uses).toBeNaN();
		});

		test('collate items in video room SINK 2', () => {
			const sink = game.entityFinder.getFixture("SINK 2", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			expect(items.length).toBe(2);
			const detergent = items[0];
			const dirtyPlate = items[1];
			expect(detergent.prefab.id).toBe("DETERGENT");
			expect(detergent.quantity).toBe(2);
			expect(detergent.uses).toBe(20);
			expect(dirtyPlate.prefab.id).toBe("DIRTY PLATE");
			expect(dirtyPlate.quantity).toBe(19);
			expect(dirtyPlate.uses).toBeNaN();
		});
	});

	describe('test decreaseUses method', () => {
		afterEach(async () => {
			await game.entityLoader.loadRoomItems(false);
		});

		test('decrease uses of detergent in video room SINK 1 by 1', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(1);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(4);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			const detergent3 = newItems[3];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("DETERGENT");
			expect(detergent3.prefab.id).toBe("DETERGENT");
			expect(detergent1.quantity).toBe(2);
			expect(detergent2.quantity).toBe(1);
			expect(detergent3.quantity).toBe(1);
			expect(detergent1.quantity).toBe(2);
			expect(detergent2.quantity).toBe(1);
			expect(detergent3.quantity).toBe(1);
		});

		test('decrease uses of detergent in video room SINK 1 by 2', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(2);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(4);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			const detergent3 = newItems[3];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("DETERGENT");
			expect(detergent3.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(detergent1.quantity).toBe(2);
			expect(detergent2.quantity).toBe(1);
			expect(detergent3.quantity).toBe(1);
			expect(detergent1.uses).toBe(4);
			expect(detergent2.uses).toBe(3);
			expect(detergent3.uses).toBeNaN();
		});

		test('decrease uses of detergent in video room SINK 1 by 5', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(5);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(3);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(detergent1.quantity).toBe(2);
			expect(detergent2.quantity).toBe(2);
			expect(detergent1.uses).toBe(4);
			expect(detergent2.uses).toBeNaN();
		});

		test('decrease uses of detergent in video room SINK 1 by 8', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(8);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(4);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			const detergent3 = newItems[3];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("DETERGENT");
			expect(detergent3.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(detergent1.quantity).toBe(1);
			expect(detergent2.quantity).toBe(1);
			expect(detergent3.quantity).toBe(2);
			expect(detergent1.uses).toBe(4);
			expect(detergent2.uses).toBe(1);
			expect(detergent3.uses).toBeNaN();
		});

		test('decrease uses of detergent in video room SINK 1 by 9', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(9);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(3);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(detergent1.quantity).toBe(2);
			expect(detergent2.quantity).toBe(1);
			expect(detergent1.uses).toBe(2);
			expect(detergent2.uses).toBeNaN();
		});

		test('decrease uses of detergent in video room SINK 1 by 12', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(12);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(3);
			const detergent1 = newItems[1];
			const detergent2 = newItems[2];
			expect(detergent1.prefab.id).toBe("DETERGENT");
			expect(detergent2.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(detergent1.quantity).toBe(1);
			expect(detergent2.quantity).toBe(2);
			expect(detergent1.uses).toBe(1);
			expect(detergent2.uses).toBeNaN();
		});

		test('decrease uses of detergent in video room SINK 1 by 13', () => {
			const sink = game.entityFinder.getFixture("SINK 1", "video-room");
			const items = CollatedRoomItem.collate(getSortedItems(sink.getContainedItems()));
			const detergent = items[0];
			detergent.decreaseUses(13);
			const newItems = sink.getContainedItems();
			expect(newItems).toHaveLength(2);
			const newDetergent = newItems[1];
			expect(newDetergent.prefab.id).toBe("EMPTY DETERGENT BOTTLE");
			expect(newDetergent.quantity).toBe(3);
			expect(newDetergent.uses).toBeNaN();
		});
	});
});