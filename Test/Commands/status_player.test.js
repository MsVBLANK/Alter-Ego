import PlayerCommand from "../../Classes/PlayerCommand.js";
import {usage, execute, config} from "../../Commands/status_player.js";
import {clearQueue, sendQueuedMessages} from "../../Modules/messageHandler.js";
import {createMockMessage} from "../__mocks__/libs/discord.js";
import GameCommunicationHandler from "../../Classes/GameCommunicationHandler.js";
import Status from "../../Data/Status.ts";
import {Duration} from "luxon";
import {createDisableStatus} from "../__mocks__/utility.ts";

let spy;

describe("status_player command", () => {
    beforeAll(async () => {
        if (!game.inProgress) await game.entityLoader.loadAll();
    });

    beforeEach(() => {
        spy = vi.spyOn(GameCommunicationHandler.prototype, "sendMessageToPlayer");
    })

    afterEach(async () => {
        clearQueue(game);
        vi.resetAllMocks();
    });

    const status_player = new PlayerCommand(config, usage, execute);

    test("player with status effects", async () => {
        const player = game.entityFinder.getPlayer("Kyra");
        await status_player.execute(game, createMockMessage(), "", [], player);
        expect(spy).toHaveBeenCalledWith(player, "You are currently:\nsatisfied, well rested, clean", false);
    });
    test("player without status effects", async () => {
        const player = game.entityFinder.getPlayer("Astrid");
        await status_player.execute(game, createMockMessage(), "", [], player);
        expect(spy).toHaveBeenCalledWith(player, "You are currently:\n", false);
    });
    test("player with command disabled", async () => {
        const player = game.entityFinder.getPlayer("Astrid");
        let getBehavior = vi.spyOn(player, "getBehaviorAttributeStatusEffects");
        getBehavior.mockReturnValue([createDisableStatus(player, "status")]);
        let replySpy = vi.spyOn(game.communicationHandler, "reply");
        let message = createMockMessage();
        await status_player.execute(game, message, "", [], player);
        expect(replySpy).toHaveBeenCalledWith(message, "You cannot do that because you are **MOCK_DISABLED_STATUS**.");
    });
});
