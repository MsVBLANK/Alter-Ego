# Data Structures

All game data is stored on a Google Sheet. There are a number of reasons for this:

1. It allows multiple [moderators](../../moderator_guide/moderating.md) to collaborate and develop the map together.
2. It requires the data be organized in a consistent way which is easily readable by a bot such as Alter Ego.
3. All edits to the spreadsheet are automatically saved, and the moderator(s) can revert the spreadsheet to any previous
   state they please if need be.
4. Data entered on the spreadsheet is persistent. If Alter Ego crashes, is restarted, or otherwise shuts off, all of the
   game data will be preserved in its most recent state.

Alter Ego uses the [Google Sheets API](https://developers.google.com/sheets/api/) to load the data from the spreadsheet,
as well as make edits to the spreadsheet. The data for each set of data structures in the map is kept in a separate
sheet. This section lists all of the persistent game entities that can be found on the sheet, as well as some of the
transient data structures that are not saved to the spreadsheet.

## Creation

In order to create a workable spreadsheet, the latest version template should be duplicated into a moderator's Google
Drive by accessing
[this link](https://docs.google.com/spreadsheets/d/1aIlJIRVdqRaaLiECPYx_UPcSPdUkq4_BIhX--I_VuHA/edit?usp=sharing),
opening the **File** menu, and selecting **Make a copy**. At this point, they will have a copy that they can edit as
they please.
