# Fixture

> NOTE: These were previously called Objects, but were renamed to avoid confusion with
> JavaScript's [Object data type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object).

A Fixture is a data structure in the Neo World Program. It represents a fixed structure within a [Room](room.md) that
cannot be taken or moved by a [Player](player.md). Their primary purpose is to give structure and interactivity to a
Room.

## Attributes

Fixtures have relatively few attributes. Although their behavior is mostly static, they are capable of quite a few
things. Note that if an attribute is _internal_, that means it only exists within
the [Fixture class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Fixture.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### Name

- Spreadsheet label: **Fixture Name**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is the name of the Fixture. All letters should be capitalized, and spaces are allowed. Note that multiple Objects
can have the same name, so long as they are in different Rooms.

### Location

- Spreadsheet label: **Location**
- Class attribute: [Room](room.md) `this.location`

This is the Room the Fixture can be found in. This must match the Room's name exactly on the spreadsheet.

### Accessible

- Spreadsheet label: **Accessible?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.accessible`

This is a simple Boolean value indicating whether the Fixture can currently be interacted with or not. If this is `true`,
then players can inspect the Fixture, among other things. If it is `false`, Alter Ego will act as if the Fixture doesn't
exist when a player tries to interact with it in any way.

### Child Puzzle Name

- Spreadsheet label: **Child Puzzle**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.childPuzzleName`

This is the name of a [Puzzle](puzzle.md) that is associated with the Fixture, if any. The child Puzzle must be in the
same Room as the Fixture referencing it. If the name of a Puzzle is supplied, then any [Room Items](room_item.md) contained within
the Fixture will technically be contained within the child Puzzle. This allows Items to be made inaccessible until the
child Puzzle is solved, while also allowing players to take and drop Items from/into the Fixture if the child Puzzle is
solved. Additionally, when a Fixture containing Items is assigned a child Puzzle,
the [item list](../../moderator_guide/writing_descriptions.md#il) must be in the child
Puzzle's [already solved description](puzzle.md#already-solved-description). If no child Puzzle is needed, this cell can
simply be left blank on the spreadsheet.

### Child Puzzle

- Class attribute: [Puzzle](puzzle.md) `this.childPuzzle`

This is an internal attribute which simply contains a reference to the actual Puzzle object whose name matches
`this.childPuzzleName` and whose location is the same as the Fixture. If no child Puzzle name is given, this will be
`null` instead.

### Recipe Tag

- Spreadsheet label: **Recipe Tag**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.recipeTag`

This a keyword or phrase assigned to a Fixture that allows it to carry out [Recipes](recipe.md) that require that tag.
A Fixture can only have a single Recipe tag. There are no rules for how Recipe tags must be named.

### Activatable

- Spreadsheet label: **Activatable?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.activatable`

This is another Boolean value indicating whether the Fixture can be activated or deactivated by a Player with
the [use command](../commands/player_commands.md#use). If this is `true`, then a Player can activate and deactivate the
Fixture at will. If this is `false`, then its activation state cannot be altered by a Player. Even if the Fixture is not
activatable, it can still be activated and deactivated by other means, and it will still carry out Recipes if it is
activated.

### Activated

- Spreadsheet label: **Activated?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.activated`

This is another Boolean value indicating whether the Fixture is currently checking for and processing Recipes. If this is
`true`, then the Fixture will check every second if it contains the necessary ingredients for any Recipe with a matching
tag. If it does, then the Recipe will be processed and the Recipe's products will be instantiated in the Fixture when it
is complete. A Fixture can only process one Recipe at a time. If it is found that the Fixture is able to process multiple
Recipes with the ingredients it contains, then the Fixture will process whichever Recipe has the highest number of
matched ingredients, and the remaining Items will be left untouched. If the Fixture is still able to carry out a Recipe
with the remaining Items, then it will do so upon finishing the first one, as long as it is not automatically
deactivated.

### Automatically Deactivated

- Spreadsheet label: **Deactivate Automatically?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.autoDeactivate`

This is another Boolean value indicating whether the Fixture will automatically deactivate after processing a Recipe. If
this is `true`, then the Fixture will stop checking for and processing Recipes every time it finishes processing one,
even if the Fixture's activatable attribute is `false`. Note that if the Fixture is automatically deactivated and no
processable Recipe is found, then it will deactivate after one minute of activation. If this is `false`, then the Fixture
will continue checking for and processing Recipes after completing each one.

### Hiding Spot Capacity

- Spreadsheet label: **Hiding Spot Capacity**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.hidingSpotCapacity`

This is a whole number indicating how many Players can hide in this Fixture simultaneously. If this is greater than 0,
then that many Players can hide in it, and this value can be bypassed with the use of
the [hide moderator command](../commands/moderator_commands.md#hide). If this is 0, the Fixture cannot be used as a
hiding spot at all. For more information, see the article on [hiding]().

### Preposition

- Spreadsheet label: **Preposition**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.preposition`

This attribute is a string that performs two functions:

1. It determines whether or not the Fixture can contain Items. If it is blank, players cannot take Items from or drop
   Items into the Fixture. If it is not blank, then they can.
2. When a Player drops a non-discreet Item into the Fixture, Alter Ego will [narrate](narration.md) them doing so using
   this preposition. For example, if the player Nero drops an Item named SWORD into a Fixture named CABINET whose
   preposition is "in", Alter Ego will send "Nero puts a SWORD in the CABINET." to CABINET's Room channel.

Note that a preposition can be multiple words, however care should be taken to ensure that the Narration Alter Ego sends
will make grammatical sense. For example, if in the above example, Nero instead dropped the SWORD into a Fixture named
DESK a preposition of "on top" would result in the strange sentence "Nero puts a SWORD on top the DESK." A preposition
of "on top of" or just simply "on" would result in a better sentence.

### Description

- Spreadsheet label: **Description**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.description`

This is the description of the Fixture. When a Player inspects this Fixture, they will receive a parsed version of this
string. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more information.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Fixture.

### Process

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.process`

This is an internal attribute used to process Recipes. It has the following structure:

`{ Recipe recipe, Array<Item> ingredients, luxon duration, Timer timer }`

For more information on the moment data type, see the documentation for [Luxon](https://moment.github.io/luxon/#/).

### Recipe Interval

- Class attribute: [Duration](https://moment.github.io/luxon/api-docs/index.html#duration) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) `this.recipeInterval`

This is an internal attribute that allows Objects to check for and process Recipes every second. If the Fixture does not
have a Recipe tag, then this will be `null`.
