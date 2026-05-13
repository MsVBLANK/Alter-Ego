# Persistent Game Entity

Persistent game entities are stored both on the sheet and in Alter Ego's internal game state. When the game is loaded,
the data from the sheet is downloaded and the internal game state is updated to reflect the sheet. Conversely, when the
game is saved, the state of all persistent game entities is saved to the sheet.

Even though persistent game entities and the sheet are synced, there are attributes that only exist in the internal game
data, and are derived from the data on the sheet. These attributes will not have a sheet column that it is associated
with and instead will only have a class attribute.
