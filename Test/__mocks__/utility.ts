import Status from "../../Data/Status.ts";
import type Player from "../../Data/Player.ts";
import Moderator from "../../Data/Moderator.ts";
import {Duration} from "luxon";
import { createMockMember } from "./libs/discord.js";

export function createDisableStatus(player: Player, disabledCommand: string): Status {
    return new Status(
        "MOCK_DISABLED_STATUS",
        "10s",
        Duration.fromObject({seconds: 10}),
        false,
        false,
        [],
        [],
        "",
        "",
        "",
        [],
        new Set<string>([`disable ${disabledCommand}`]),
        "",
        "",
        1,
        game,
    );
}

export function createMockModerator(member = createMockMember()): Moderator {
    // @ts-expect-error
    return new Moderator(member.id, member, game)
}