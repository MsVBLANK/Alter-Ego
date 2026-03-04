/**
 * @class GameConstants
 * @classdesc A collection of constants used to refer to cell ranges on the spreadsheet.
 */
export default class GameConstants {
    /** @type {GameConstants} */
    static instance;
    
    roomSheetDataCells = "Rooms!A2:M";
    roomSheetSaveCells = "Rooms!D2:M";
    roomSheetDescriptionColumn = "Rooms!M";
    /** @deprecated */
    objectSheetDataCells = "Objects!A2:K";
    /** @deprecated */
    objectSheetDescriptionColumn = "Objects!K";
    fixtureSheetDataCells = "Fixtures!A2:K";
    fixtureSheetDescriptionColumn = "Fixtures!K";
    prefabSheetDataCells = "Prefabs!A2:S";
    prefabSheetDescriptionColumn = "Prefabs!S";
    recipeSheetDataCells = "Recipes!A2:H";
    recipeSheetInitiatedColumn = "Recipes!F";
    recipeSheetCompletedColumn = "Recipes!G";
    recipeSheetUncraftedColumn = "Recipes!H";
    /** @deprecated */
    itemSheetDataCells = "Items!A2:H";
    /** @deprecated */
    itemSheetDescriptionColumn = "Items!H";
    roomItemSheetDataCells = "Room Items!A2:H";
    roomItemSheetDescriptionColumn = "Room Items!H";
    puzzleSheetDataCells = "Puzzles!A2:R";
    puzzleSheetCorrectColumn = "Puzzles!M";
    puzzleSheetAlreadySolvedColumn = "Puzzles!N";
    puzzleSheetUnsolvedColumn = "Puzzles!O";
    puzzleSheetIncorrectColumn = "Puzzles!P";
    puzzleSheetNoMoreAttemptsColumn = "Puzzles!Q";
    puzzleSheetRequirementsNotMetColumn = "Puzzles!R";
    eventSheetDataCells = "Events!A2:K";
    eventSheetTriggeredColumn = "Events!J";
    eventSheetEndedColumn = "Events!K";
    statusSheetDataCells = "Status Effects!A2:N";
    statusSheetInflictedColumn = "Status Effects!M";
    statusSheetCuredColumn = "Status Effects!N";
    playerSheetDataCells = "Players!A3:O";
    playerSheetDescriptionColumn = "Players!O";
    inventorySheetDataCells = "Inventory Items!A2:H";
    inventorySheetDescriptionColumn = "Inventory Items!H";
    gestureSheetDataCells = "Gestures!A2:E";
    flagSheetDataCells = "Flags!A2:D";
    
    constructor() {
        if (GameConstants.instance) {
            return GameConstants.instance;
        }

        GameConstants.instance = this;
    }
}