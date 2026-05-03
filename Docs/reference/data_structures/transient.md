# Transient Game Entity

Transient game entities only exist in Alter Ego's internal game state. As such, they do not have a corresponding
sheet column and only have class attributes. They may be derived from data that exists on the sheet---in which case they
can be reconstructed when game data is reloaded---but they are not directly persisted onto the sheet.
