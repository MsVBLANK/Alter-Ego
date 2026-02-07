import DropAction from "../../../Data/Actions/DropAction.js";
import UnequipAction from "../../../Data/Actions/UnequipAction.js";
import { clearQueue } from "../../../Modules/messageHandler.js";
import { createMockMessage } from "../../__mocks__/libs/discord.js";

describe("DropAction test", () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    afterAll(async () => {
        clearQueue(game);
        vi.resetAllMocks();
        await game.entityLoader.loadInventoryItems(false);
        await game.entityLoader.loadRoomItems(false);
    });

    test("ported legacy test", async () => {
        const kyra = game.entityFinder.getPlayer("Kyra");
        const vivian = game.entityFinder.getPlayer("Vivian");
        const kyraHand = game.entityFinder.getPlayerHandHoldingItem(kyra, "MUG OF COFFEE");
        const vivianHand = game.entityFinder.getPlayerFreeHand(vivian);
        const kyraFloor = game.entityFinder.getFixture("FLOOR", kyra.location.id);
        const vivianFloor = game.entityFinder.getFixture("FLOOR", vivian.location.id);

        {
            const coffee = kyraHand.equippedItem;
            const dropAction = new DropAction(game, createMockMessage(), kyra, kyra.location, false);
            dropAction.performDrop(coffee, kyraHand, kyraFloor, null);
        }

        {
            let quiver = game.entityFinder.getInventoryItem("VIVIANS QUIVER");
            const unequipAction = new UnequipAction(game, createMockMessage(), vivian, vivian.location, false);
            unequipAction.performUnequip(quiver,game.entityFinder.getPlayerEquipmentSlotWithEquippedItem(vivian, quiver.getIdentifier()),vivianHand);
            quiver = game.entityFinder.getInventoryItem("VIVIANS QUIVER");
            const dropAction = new DropAction(game, createMockMessage(), vivian, vivian.location, false);
            dropAction.performDrop(quiver, vivianHand, vivianFloor, null);
        }

        const coffee = game.entityFinder.getRoomItem("MUG OF COFFEE", kyra.location.id, "FIXTURE", kyraFloor.name);
        const quiver = game.entityFinder.getRoomItem("VIVIANS QUIVER", vivian.location.id, "FIXTURE", vivianFloor.name);
        const jeans = quiver.inventory.get("QUIVER").items[0];

        expect(coffee).not.toBeUndefined();
        expect(quiver).not.toBeUndefined();
        expect(jeans).not.toBeUndefined();
        
        expect(coffee.name).toStrictEqual("COFFEE");
        expect(coffee.pluralName).toStrictEqual("");
        expect(coffee.singleContainingPhrase).toStrictEqual("a mug of COFFEE");
        expect(coffee.pluralContainingPhrase).toStrictEqual("mugs of COFFEE");
        expect(coffee.location.id).toStrictEqual("suite-9");
        expect(coffee.accessible).toBeTruthy();
        expect(coffee.containerName).toStrictEqual("FLOOR");
        expect(coffee.container.name).toStrictEqual("FLOOR");
        expect(coffee.slot).toStrictEqual("");
        expect(coffee.quantity).toStrictEqual(1);
        expect(coffee.uses).toStrictEqual(1);
        expect(coffee.weight).toStrictEqual(coffee.prefab.weight);
        expect(coffee.inventory.size).toStrictEqual(0);
        expect(coffee.row).toStrictEqual(1016);

        expect(quiver.name).toStrictEqual("QUIVER");
        expect(quiver.pluralName).toStrictEqual("QUIVERS");
        expect(quiver.singleContainingPhrase).toStrictEqual("a QUIVER");
        expect(quiver.pluralContainingPhrase).toStrictEqual("QUIVERS");
        expect(quiver.location.id).toStrictEqual("general-managers-office");
        expect(quiver.accessible).toBeTruthy();
        expect(quiver.containerName).toStrictEqual("FLOOR");
        expect(quiver.container.name).toStrictEqual("FLOOR");
        expect(quiver.slot).toStrictEqual("");
        expect(quiver.quantity).toStrictEqual(1);
        expect(isNaN(quiver.uses)).toBeTruthy();
        expect(quiver.weight).toStrictEqual(quiver.prefab.weight + quiver.inventory.reduce((weight, slot) => weight + slot.items.reduce((innerWeight, item) => innerWeight + item.weight, 0), 0));
        expect(quiver.inventory.size).toStrictEqual(1);
        expect(quiver.row).toStrictEqual(326);

        expect(jeans.name).toStrictEqual("WHITE JEANS");
        expect(jeans.pluralName).toStrictEqual("");
        expect(jeans.singleContainingPhrase).toStrictEqual("a pair of WHITE JEANS");
        expect(jeans.pluralContainingPhrase).toStrictEqual("pairs of WHITE JEANS");
        expect(jeans.location.id).toStrictEqual("general-managers-office");
        expect(jeans.accessible).toBeTruthy();
        expect(jeans.containerName).toStrictEqual("VIVIANS QUIVER/QUIVER");
        expect(jeans.container.name).toStrictEqual("QUIVER");
        expect(jeans.slot).toStrictEqual("QUIVER");
        expect(jeans.quantity).toStrictEqual(1);
        expect(isNaN(jeans.uses)).toBeTruthy();
        expect(jeans.weight).toStrictEqual(jeans.prefab.weight + jeans.inventory.reduce((weight, slot) => weight + slot.items.reduce((innerWeight, item) => innerWeight + item.weight, 0), 0));
        expect(jeans.inventory.size).toStrictEqual(4);
        expect(jeans.row).toStrictEqual(327);
    });
});
