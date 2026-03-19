import ModeratorCommand from "../../Classes/ModeratorCommand.ts";
import { usage, execute, config } from "../../Commands/dead_moderator.js";
import { createMockMessage } from "../__mocks__/libs/discord.js";
import { sendQueuedMessages } from "../../Modules/messageHandler.js";
import { createMockModerator } from "../__mocks__/utility.ts";

describe("dead_moderator command", () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    const dead_moderator = new ModeratorCommand(config, usage, execute);

    const moderator = createMockModerator();

    test("with dead players", async () => {
        // @ts-ignore
        await dead_moderator.execute(game, createMockMessage(), "dead", [], moderator);
        sendQueuedMessages(game);
        /** @type {import('vitest').Mock} */
        // @ts-ignore
        const sendMock = game.guildContext.commandChannel.send;
        expect(sendMock).toHaveBeenCalledExactlyOnceWith("Dead players:\nEvad Wu");
    });
});
