import GameConstants from '../Classes/GameConstants.js';
import GameSettings from '../Classes/GameSettings.js';
import { batchUpdateSheet, batchUpdateSheetValues, getSheetWithProperties } from './sheets.js';
import { generateListString } from './helpers.js';

import fs from 'fs';

/**
 * Automatically updates config files and the sheet.
 * @param {GameSettings} settings 
 */
export default async function autoUpdate(settings) {
    const constants = new GameConstants();
    await v1_9Update(settings, constants);
    await v1_10Update(settings, constants);
    await v2_0Update(settings, constants);
}

/**
 * @param {GameSettings} settings 
 * @param {GameConstants} constants
 */
async function v2_0Update(settings, constants) {
    // TODO: Update files.

    // Update sheets and formatting.
    const batchUpdateRequests = [];
    // Rename Objects sheet to Fixtures.
    let objectsSheetId;
    try {
        const objectsResponse = await getSheetWithProperties("Objects!A2:K", settings.spreadsheetID);
        objectsSheetId = objectsResponse?.data?.sheets[0]?.properties?.sheetId;
    } catch (err) {}
    if (objectsSheetId) {
        batchUpdateRequests.push({
            updateSheetProperties: {
                properties: {
                    sheetId: objectsSheetId,
                    title: "Fixtures"
                },
                fields: "title"
            }
        });
    }
    // Rename Items sheet to Room Items.
    let itemsSheetId;
    try {
        const itemsResponse = await getSheetWithProperties("Items!A2:H", settings.spreadsheetID);
        itemsSheetId = itemsResponse?.data?.sheets[0]?.properties?.sheetId;
    } catch (err) {}
    if (itemsSheetId) {
        batchUpdateRequests.push({
            updateSheetProperties: {
                properties: {
                    sheetId: itemsSheetId,
                    title: "Room Items"
                },
                fields: "title"
            }
        });
    }
    // Create Flags sheet.
    let createFlagsSheet = false;
    let flagsSheetId;
    try {
        const flagsResponse = await getSheetWithProperties(constants.flagSheetDataCells, settings.spreadsheetID);
        flagsSheetId = flagsResponse?.data?.sheets[0]?.properties?.sheetId;
    }
    catch (err) {
        createFlagsSheet = true;
    }
    if (createFlagsSheet) {
        flagsSheetId = 571378405;
        batchUpdateRequests.push({
            addSheet: {
                properties: {
                    sheetId: flagsSheetId,
                    title: "Flags",
                    gridProperties: {
                        rowCount: 100,
                        columnCount: 4,
                        frozenColumnCount: 1,
                        frozenRowCount: 1
                    }
                }
            }
        });
        const cellFormatting = {
            userEnteredFormat: {
                textFormat: {
                    bold: false,
                    fontSize: 11
                }
            }
        };
        const columns = [];
        for (let i = 0; i < 4; i++)
            columns.push(cellFormatting);
        const rows = [];
        for (let i = 0; i < 100; i++) {
            rows.push({
                values: columns
            });
        }
        batchUpdateRequests.push({
            updateCells: {
                rows: rows,
                fields: "*",
                start: {
                    sheetId: flagsSheetId,
                    rowIndex: 0,
                    columnIndex: 0
                }
            }
        });
        batchUpdateRequests.push({
            updateCells: {
                rows: [{
                    values: [
                        {
                            userEnteredValue: {
                                stringValue: "Flag ID"
                            },
                            userEnteredFormat: {
                                textFormat: {
                                    bold: true,
                                    fontSize: 11
                                }
                            }
                        },
                        {
                            userEnteredValue: {
                                stringValue: "Value"
                            },
                            userEnteredFormat: {
                                textFormat: {
                                    bold: true,
                                    fontSize: 11
                                }
                            }
                        },
                        {
                            userEnteredValue: {
                                stringValue: "Value Computed By"
                            },
                            userEnteredFormat: {
                                textFormat: {
                                    bold: true,
                                    fontSize: 11
                                }
                            }
                        },
                        {
                            userEnteredValue: {
                                stringValue: "When Set / Cleared"
                            },
                            userEnteredFormat: {
                                textFormat: {
                                    bold: true,
                                    fontSize: 11
                                }
                            }
                        }
                    ]
                }],
                fields: "*",
                start: {
                    sheetId: flagsSheetId,
                    rowIndex: 0,
                    columnIndex: 0
                }
            }
        });
        batchUpdateRequests.push({
            updateDimensionProperties: {
                properties: {
                    pixelSize: 50
                },
                fields: "*",
                range: {
                    sheetId: flagsSheetId,
                    dimension: "ROWS",
                    startIndex: 0,
                    endIndex: 1
                }
            }
        });
        batchUpdateRequests.push({
            updateDimensionProperties: {
                properties: {
                    pixelSize: 100
                },
                fields: "*",
                range: {
                    sheetId: flagsSheetId,
                    dimension: "ROWS",
                    startIndex: 1
                }
            }
        });
        batchUpdateRequests.push({
            updateDimensionProperties: {
                properties: {
                    pixelSize: 200
                },
                fields: "*",
                range: {
                    sheetId: flagsSheetId,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 1
                }
            }
        });
        batchUpdateRequests.push({
            updateDimensionProperties: {
                properties: {
                    pixelSize: 300
                },
                fields: "*",
                range: {
                    sheetId: flagsSheetId,
                    dimension: "COLUMNS",
                    startIndex: 1
                }
            }
        });
    }
    if (batchUpdateRequests.length > 0) {
        console.log(`Updating spreadsheet https://docs.google.com/spreadsheets/d/${settings.spreadsheetID} ...`);
        await batchUpdateSheet(batchUpdateRequests, settings.spreadsheetID).then(() => {
            /** @type {string[]} */
            const changedSheets = [];
            if (objectsSheetId) changedSheets.push("Objects sheet to Fixtures");
            if (itemsSheetId) changedSheets.push("Items sheet to Room Items");
            if (changedSheets.length > 0) console.log(`Renamed ${generateListString(changedSheets)}.`);
            if (createFlagsSheet) console.log(`Created Flags sheet.`);
        }).catch(err => console.error(err));
    }
    // The remaining changes don't affect anything significant.
    // If none of the above were changed, stop here.
    if (!objectsSheetId && !itemsSheetId && !createFlagsSheet) return;
    // Update sheet headers.
    /** @type {ValueRange[]} */
    const batchUpdateValuesRequests = [];
    // Rename Rooms headers.
    batchUpdateValuesRequests.push({ range: "Rooms!A1", values: [["Room Display Name"]] });
    // Rename Fixtures headers.
    batchUpdateValuesRequests.push({ range: "Fixtures!A1", values: [["Fixture Name"]] });
    // Rename Recipes headers.
    batchUpdateValuesRequests.push({ range: "Recipes!C1:H1", values: [[
        "Processed by Fixture With Tag",
        "Process Duration",
        "Produces Prefab(s)",
        "Description When Initiated",
        "Description When Completed",
        "Description When Uncrafted"
    ]]});
    // Rename Puzzles headers.
    batchUpdateValuesRequests.push({ range: "Puzzles!F1:Q1", values: [[
        "Parent Fixture",
        "Type",
        "Accessible?",
        "Requires",
        "Solution(s)",
        "Remaining Attempts",
        "When Solved / Unsolved",
        "Description When Solved",
        "Description When Already Solved",
        "Description When Incorrect Answer Given",
        "Description When No Attempts Remain",
        "Description When Requirements Not Met"
    ]]});
    batchUpdateValuesRequests.push({ range: "Events!A1:I1", values: [[
        "Event ID",
        "Ongoing?",
        "Duration",
        "Time Remaining",
        "Triggers At",
        "In Rooms with Tag",
        "When Triggered / Ended",
        "Inflicts Status Effect(s)",
        "Refreshes Status Effect(s)"
    ]]});
    // Rename Status Effects headers.
    batchUpdateValuesRequests.push({ range: "Status Effects!A1:N1", values: [[
        "Status Effect ID",
        "Duration",
        "Fatal?",
        "Don't Inflict If Player Is",
        "Cures",
        "Develops Into",
        "When Duplicated",
        "When Cured",
        "Stat Modifiers",
        "Behavior Attributes",
        "Effect",
        "Description When Inflicted",
        "Description When Cured"
    ]]});
    // Rename Players headers.
    batchUpdateValuesRequests.push({ range: "Players!C1:G2", values: [
        [ 'Title or "NPC"', "Pronouns", "Speaks With", "Stats" ],
        [ "", "", "", "Str", "Per" ]
    ]});
    // Rename Gestures headers.
    batchUpdateValuesRequests.push({ range: "Gestures!A1:E1", values: [[
        "Gesture ID",
        "Requires Target",
        "Don't Allow If Player Is",
        "Description In List",
        "Narration When Performed"
    ]]});
    await batchUpdateSheetValues(batchUpdateValuesRequests, settings.spreadsheetID).then(() => {
        console.log(`Updated sheet headers.`);
    }).catch(err => console.error(err));
}

/**
 * @param {GameSettings} settings 
 * @param {GameConstants} constants
 */
async function v1_10Update(settings, constants) {
    // Update constants file. This shouldn't be necessary if Docker is used.
    if (constants.recipeSheetDataCells === "Recipes!A2:F" ||
        constants.recipeSheetInitiatedColumn === "Recipes!E" ||
        constants.recipeSheetCompletedColumn === "Recipes!F" ||
        constants.recipeSheetUncraftedColumn === undefined
    ) {
        constants.recipeSheetDataCells = "Recipes!A2:H";
        constants.recipeSheetInitiatedColumn = "Recipes!F";
        constants.recipeSheetCompletedColumn = "Recipes!G";
        constants.recipeSheetUncraftedColumn = "Recipes!H";
        let json = JSON.stringify(constants);
        await fs.writeFileSync('Configs/constants.json', json, 'utf8');
        console.log("Updated constants file with new Recipes sheet coordinates.");
    }
    // Updated Recipes sheet with the new columns.
    const response = await getSheetWithProperties("Recipes!A1:H1", settings.spreadsheetID);
    const sheetProperties = response.data.sheets[0] ? response.data.sheets[0].properties : {};
    if (sheetProperties.gridProperties.columnCount === 6) {
        const requests = [
            {
                insertDimension: {
                    range: {
                        sheetId: sheetProperties.sheetId,
                        dimension: "COLUMNS",
                        startIndex: 1,
                        endIndex: 2
                    },
                    inheritFromBefore: false
                }
            },
            {
                insertDimension: {
                    range: {
                        sheetId: sheetProperties.sheetId,
                        dimension: "COLUMNS",
                        startIndex: 7,
                        endIndex: 8
                    },
                    inheritFromBefore: true
                }
            },
            {
                pasteData: {
                    coordinate: {
                        sheetId: sheetProperties.sheetId,
                        rowIndex: 0,
                        columnIndex: 1
                    },
                    data: "Uncraftable?",
                    type: "PASTE_VALUES",
                    delimiter: ","
                }
            },
            {
                pasteData: {
                    coordinate: {
                        sheetId: sheetProperties.sheetId,
                        rowIndex: 0,
                        columnIndex: 7
                    },
                    data: "Message When Uncrafted",
                    type: "PASTE_VALUES",
                    delimiter: ","
                }
            }
        ];
        batchUpdateSheet(requests, settings.spreadsheetID).then(() => {
            console.log("Inserted Uncraftable and Message When Uncrafted columns on Recipes sheet.");
        }).catch(err => console.error(err));
        
    }
}

/**
 * @param {GameSettings} settings 
 * @param {GameConstants} constants
 */
async function v1_9Update(settings, constants) {
    // Update constants file. This shouldn't be necessary if Docker is used.
    if (constants.playerSheetDataCells === "Players!A3:N" ||
        constants.playerSheetDescriptionColumn === "Players!N"
    ) {
        constants.playerSheetDataCells = "Players!A3:O";
        constants.playerSheetDescriptionColumn = "Players!O";
        let json = JSON.stringify(constants);
        fs.writeFileSync('Configs/constants.json', json, 'utf8');
        console.log("Updated constants file with new Players sheet coordinates.");
    }
    // Update Players sheet with the new voice column.
    const response = await getSheetWithProperties("Players!A1:O1", settings.spreadsheetID);
    const sheetProperties = response.data.sheets[0] ? response.data.sheets[0].properties : {};
    if (sheetProperties.gridProperties.columnCount === 14) {
        const requests = [
            {
                insertDimension: {
                    range: {
                        sheetId: sheetProperties.sheetId,
                        dimension: "COLUMNS",
                        startIndex: 4,
                        endIndex: 5,
                    },
                    inheritFromBefore: true
                }
            },
            {
                pasteData: {
                    coordinate: {
                        sheetId: sheetProperties.sheetId,
                        rowIndex: 0,
                        columnIndex: 4
                    },
                    data: "Voice",
                    type: "PASTE_VALUES",
                    delimiter: ","
                }
            },
            {
                mergeCells: {
                    range: {
                        sheetId: sheetProperties.sheetId,
                        startRowIndex: 0,
                        endRowIndex: 2,
                        startColumnIndex: 4,
                        endColumnIndex: 5
                    },
                    mergeType: "MERGE_COLUMNS"
                }
            }
        ];
        batchUpdateSheet(requests, settings.spreadsheetID).then(() => {
            console.log("Inserted Voice column on Players sheet.");
        }).catch(err => console.error(err));
    }
}
