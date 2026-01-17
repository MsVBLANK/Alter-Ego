import ModeratorCommand from '../../Classes/ModeratorCommand.js';
import { usage, execute, config } from '../../Commands/destroy_moderator.js'
import DestroyAction from '../../Data/Actions/DestroyAction.js';
import { clearQueue, sendQueuedMessages } from '../../Modules/messageHandler.js';
import { createMockMessage } from '../__mocks__/libs/discord.js';

describe('destroy_moderator command', () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    afterEach(async () => {
        clearQueue(game);
        vi.resetAllMocks();
    });

    const destroy_moderator = new ModeratorCommand(config, usage, execute);

    describe('on inventory items', () => {
        afterEach(async () => {
            await game.entityLoader.loadInventoryItems(false);
        });

        test('given player hand with item', async () => {
            const player = game.entityFinder.getPlayer("Kyra");
            const item = game.entityFinder.getInventoryItem("mug of coffee", "Kyra");
            /** @type {DestroyAction} */
            let context;
            const original = DestroyAction.prototype.performDestroyInventoryItem;
            const spy = vi.spyOn(DestroyAction.prototype, "performDestroyInventoryItem");
            spy.mockImplementation(function (...args) {
                context = this;
                return original.apply(this, args);
            });
            // @ts-ignore
            await destroy_moderator.execute(game, createMockMessage(), "destroy", ["kyra's", "right", "hand"]);
            expect(spy).toHaveBeenCalledWith(item, item.quantity, true, true);
            expect(context).not.toBeUndefined();
            expect(context.player.name).toBe(player.name);
        });
        test('given player hand without item', async () => {
            /** @type {DestroyAction} */
            let context;
            const original = DestroyAction.prototype.performDestroyInventoryItem;
            const spy = vi.spyOn(DestroyAction.prototype, "performDestroyInventoryItem");
            spy.mockImplementation(function (...args) {
                context = this;
                return original.apply(this, args);
            });
            const message = createMockMessage();
            const author = message.author;
            // @ts-ignore
            await destroy_moderator.execute(game, message, "destroy", ["kyra's", "left", "hand"]);
            await sendQueuedMessages(game);
            expect(spy).not.toHaveBeenCalled();
            expect(context).toBeUndefined();
            expect(author.send).toHaveBeenCalledWith("Cannot destroy item equipped to LEFT HAND because nothing is equipped to it.");
        });
        test('given player item', async () => {
            const player = game.entityFinder.getPlayer("Kyra");
            const item = game.entityFinder.getInventoryItem("mug of coffee", "Kyra");
            /** @type {DestroyAction} */
            let context;
            const original = DestroyAction.prototype.performDestroyInventoryItem;
            const spy = vi.spyOn(DestroyAction.prototype, "performDestroyInventoryItem");
            spy.mockImplementation(function (...args) {
                context = this;
                return original.apply(this, args);
            });
            // @ts-ignore
            await destroy_moderator.execute(game, createMockMessage(), "destroy", ["kyra's", "mug", "of", "coffee"]);
            expect(spy).toHaveBeenCalledWith(item, item.quantity, true, true);
            expect(context).not.toBeUndefined();
            expect(context.player.name).toBe(player.name);
        });
        test('given player item in container slot', async () => {
            const player = game.entityFinder.getPlayer("Kyra");
            const item = game.entityFinder.getInventoryItem("master key", "Kyra");
            /** @type {DestroyAction} */
            let context;
            const original = DestroyAction.prototype.performDestroyInventoryItem;
            const spy = vi.spyOn(DestroyAction.prototype, "performDestroyInventoryItem");
            spy.mockImplementation(function (...args) {
                context = this;
                return original.apply(this, args);
            });
            // @ts-ignore
            await destroy_moderator.execute(game, createMockMessage(), "destroy", ["master", "key", "in", "kyra's", "right", "pocket", "of", "kyras", "pants"]);
            expect(spy).toHaveBeenCalledWith(item, item.quantity, true, true);
            expect(context).not.toBeUndefined();
            expect(context.player.name).toBe(player.name);
        });
    });

    describe('on room items', () => {
        afterEach(async () => {
            await game.entityLoader.loadRoomItems(false);
        });
    });
});