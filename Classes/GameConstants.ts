/**
 * A collection of constants used to refer to cell ranges on the spreadsheet.
 */
export default class GameConstants {
    /**
     * The single instance of these constants that can exist.
     */
	static #instance: GameConstants;
	
	readonly roomSheetDataCells = "Rooms!A2:M";
    readonly roomSheetSaveCells = "Rooms!D2:M";
    readonly roomSheetDescriptionColumn = "Rooms!M";
    /** @deprecated Use fixtureSheetDataCells instead. */
    readonly objectSheetDataCells = "Objects!A2:K";
    /** @deprecated Use fixtureSheetDescriptionColumn instead. */
    readonly objectSheetDescriptionColumn = "Objects!K";
    readonly fixtureSheetDataCells = "Fixtures!A2:K";
    readonly fixtureSheetDescriptionColumn = "Fixtures!K";
    readonly prefabSheetDataCells = "Prefabs!A2:S";
    readonly prefabSheetDescriptionColumn = "Prefabs!S";
    readonly recipeSheetDataCells = "Recipes!A2:H";
    readonly recipeSheetInitiatedColumn = "Recipes!F";
    readonly recipeSheetCompletedColumn = "Recipes!G";
    readonly recipeSheetUncraftedColumn = "Recipes!H";
    /** @deprecated Use roomItemSheetDataCells instead. */
    readonly itemSheetDataCells = "Items!A2:H";
    /** @deprecated Use roomItemSheetDescriptionColumn instead. */
    readonly itemSheetDescriptionColumn = "Items!H";
    readonly roomItemSheetDataCells = "Room Items!A2:H";
    readonly roomItemSheetDescriptionColumn = "Room Items!H";
    readonly puzzleSheetDataCells = "Puzzles!A2:R";
    readonly puzzleSheetCorrectColumn = "Puzzles!M";
    readonly puzzleSheetAlreadySolvedColumn = "Puzzles!N";
    readonly puzzleSheetUnsolvedColumn = "Puzzles!O";
    readonly puzzleSheetIncorrectColumn = "Puzzles!P";
    readonly puzzleSheetNoMoreAttemptsColumn = "Puzzles!Q";
    readonly puzzleSheetRequirementsNotMetColumn = "Puzzles!R";
    readonly eventSheetDataCells = "Events!A2:K";
    readonly eventSheetTriggeredColumn = "Events!J";
    readonly eventSheetEndedColumn = "Events!K";
    readonly statusSheetDataCells = "Status Effects!A2:N";
    readonly statusSheetInflictedColumn = "Status Effects!M";
    readonly statusSheetCuredColumn = "Status Effects!N";
    readonly playerSheetDataCells = "Players!A3:O";
    readonly playerSheetDescriptionColumn = "Players!O";
    readonly inventorySheetDataCells = "Inventory Items!A2:H";
    readonly inventorySheetDescriptionColumn = "Inventory Items!H";
    readonly gestureSheetDataCells = "Gestures!A2:E";
    readonly flagSheetDataCells = "Flags!A2:D";
    
	private constructor() {
		if (GameConstants.#instance) {
			return GameConstants.#instance;
		}

		GameConstants.#instance = this;
	}

    /**
     * The single instance of these constants that can exist.
     */
    public static get Instance() {
        if (GameConstants.#instance) return GameConstants.#instance;
        else return this.#instance = new this();
    }
}