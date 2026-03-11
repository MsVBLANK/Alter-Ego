import GameConstants from "../../Classes/GameConstants.ts";

describe("GameConstants test", () => {
    const gameConstants = GameConstants.Instance;

    test("Check Singleton Enforcement", () => {
        const newGameConstants = GameConstants.Instance;
        expect(gameConstants === newGameConstants).toBeTruthy();
    });
});
