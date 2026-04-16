# Fixture

> [!NOTE]
> These were previously called Objects, but were renamed in Alter Ego 2.0 to avoid confusion with JavaScript's
> [Object data type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object).

A **Fixture** is a data structure used by Alter Ego. It represents a fixed structure within a [Room](room.md) that
cannot be taken or moved by a [Player](player.md). Their primary purpose is to give
structure and interactivity to a Room.

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

This is the name of the Fixture. All letters should be capitalized, and spaces are allowed. Note that multiple Fixtures
can have the same name, so long as they are in different Rooms.

### Location Display Name

- Spreadsheet label: **Location**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.locationDisplayName`

This is the [display name](room.md#display-name) of the Room that the Fixture can be found in. This must match the
Room's display name on the spreadsheet exactly, or its [ID](room.md#id).

### Location

- Class attribute: [Room](room.md) `this.location`

This internal attribute is a reference to the actual Room object the Fixture can be found in.

### Accessible

- Spreadsheet label: **Accessible?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.accessible`

This is a simple Boolean value indicating whether the Fixture can currently be interacted with or not. If this is
`true`, then players can inspect the Fixture, among other things. If it is `false`, Alter Ego will act as if the
Fixture doesn't exist when a Player tries to interact with it in any way.

### Child Puzzle Name

- Spreadsheet label: **Child Puzzle**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.childPuzzleName`

This is the name of a [Puzzle](puzzle.md) that is associated with the Fixture, if any. The child Puzzle must be in the
same Room as the Fixture referencing it. If the name of a Puzzle is supplied, then any [Room Items](room_item.md)
contained within the Fixture will technically be contained within the child Puzzle. This allows Room Items to be made
inaccessible until the child Puzzle is solved, while also allowing players to take and drop Room Items from/into the
Fixture if the child Puzzle is solved. Additionally, when a Fixture containing Room Items is assigned a child Puzzle,
the [item list](../../moderator_guide/writing_descriptions.md#il) must be in the child Puzzle's
[already solved description](puzzle.md#already-solved-description). If no child Puzzle is needed, this cell can
simply be left blank on the spreadsheet.

Assigning a child Puzzle to a Fixture is most useful when the Puzzle is intended to contain Room Items. For example,
if there is a Fixture named `LOCKER`, and it has a child Puzzle named `COMBINATION LOCK`, all of the Room Items
contained inside of the `LOCKER` will actually belong to the `COMBINATION LOCK`, and Players will be able to solve the
`COMBINATION LOCK` by entering `LOCKER` instead of the name of the Puzzle itself. This makes it easier to assign unique
names to Puzzles while still making it easy for Players to interact with them.

However, a child Puzzle isn't always needed, even if there is a Puzzle that should ostensibly be linked. For example,
suppose there is a Fixture named `SHOWER` which is intended to contain Room Items such as `SOAP` and `SHAMPOO`.
It would be beneficial to have a Puzzle in the same location also named `SHOWER` so that it can use bot commands to
clean a Player who solves it, but if it were a child Puzzle, the Room Items would be listed in its already solved
description, which may not make sense. If, instead of assigning it as a child Puzzle, the Puzzle simply has the same
name as the Fixture, Players will still be able to solve the Puzzle, and Room Items can be listed in the description
of the Fixture itself.

### Child Puzzle

- Class attribute: [Puzzle](puzzle.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.childPuzzle`

This is an internal attribute which simply contains a reference to the actual Puzzle object whose name matches
`this.childPuzzleName` and whose location is the same as the Fixture. If no child Puzzle name is given, this will be
`null` instead.

### Recipe Tag

- Spreadsheet label: **Recipe Tag**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.recipeTag`

This a keyword or phrase assigned to a Fixture that allows it to process [Recipes](recipe.md) that require that tag.
A Fixture can only have a single Recipe tag, but it can be changed with the
[fixture](../commands/moderator_commands.md#fixture) [command](../commands/bot_commands.md#fixture).
There are no rules for how Recipe tags must be named.

### Activatable

- Spreadsheet label: **Activatable?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.activatable`

This is another Boolean value indicating whether the Fixture can be activated or deactivated by a Player with
the [use command](../commands/player_commands.md#use). If this is `true`, then a Player can activate and deactivate the
Fixture at will. If this is `false`, then its activation state cannot be altered by a Player. Even if the Fixture is
not activatable, it can still be activated and deactivated with the fixture command, and it will still process
Recipes if it is activated.

### Activated

- Spreadsheet label: **Activated?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.activated`

This is another Boolean value indicating whether the Fixture is currently checking for and processing Recipes. If this
is `true`, then the Fixture will check every second if it contains the necessary ingredients for any Recipe with a
matching tag. If it does, then the Recipe will be processed and the Recipe's products will be instantiated in the
Fixture when it is complete. A Fixture can only process one Recipe at a time. If it is found that the Fixture is able
to process multiple Recipes with the ingredients it contains, then it will process whichever Recipe has the highest
number of matched ingredients, and the remaining Room Items will be left untouched. If the Fixture is still able to
process a Recipe with the remaining Room Items, then it will do so upon finishing the first one, as long as it is not
automatically deactivated.

### Automatically Deactivated

- Spreadsheet label: **Deactivate Automatically?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.autoDeactivate`

This is another Boolean value indicating whether the Fixture will automatically deactivate after processing a Recipe.
If this is `true`, then the Fixture will stop checking for and processing Recipes every time it finishes processing
one, even if the Fixture's activatable attribute is `false`. Note that if the Fixture is automatically deactivated and
no processable Recipe is found, then it will deactivate after one minute of activation. If this is `false`, then the
Fixture will continue checking for and processing Recipes after completing each one.

### Hiding Spot Capacity

- Spreadsheet label: **Hiding Spot Capacity**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.hidingSpotCapacity`

This is a whole number indicating how many Players can [hide](action.md#hide-action) in this Fixture simultaneously.
If this is greater than 0, then that many Players can hide in it, and this value can be bypassed with the use of
the [hide moderator command](../commands/moderator_commands.md#hide). If this is 0, the Fixture cannot be used as a
hiding spot at all.

### Hiding Spot

- Class attribute: [Hiding Spot](hiding_spot.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.hidingSpot`

This internal attribute is a reference to the Hiding Spot object belonging to the Fixture.
If the hiding spot capacity is 0, this is `null`.

### Preposition

- Spreadsheet label: **Preposition**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.preposition`

This attribute is a string that performs two functions:

1. It determines whether or not the Fixture can contain Items. If it is blank, players cannot take Room Items from or
   drop Room Items into the Fixture. If it is not blank, then they can.
2. When a Player drops a [non-discreet](prefab.md#discreet) Room Item into the Fixture, Alter Ego will
   [narrate](narration.md) them doing so using this preposition. For example, if the player Nero drops a Room Item
   named `SWORD` into a Fixture named `CABINET` whose preposition is "in", Alter Ego will send
   "Nero puts a SWORD in the CABINET." to `CABINET`'s Room channel.

Note that a preposition can be multiple words, but in most cases, it should only be one word. Most commands that take
a Fixture's preposition expect it to be one word, so its actual preposition would not be usable in commands if it is
more than one word. If multiple words are necessary, care should be taken to ensure that the Narration Alter Ego sends
will make grammatical sense. For example, if in the above example, Nero instead dropped the `SWORD` into a Fixture
named `DESK`, a preposition of "on top" would result in the strange sentence "Nero puts a SWORD on top the DESK."
A preposition of "on top of" or just simply "on" would result in a better sentence.

### Description

- Spreadsheet label: **Description**
- Class attribute: [Description](description.md) `this.description`

This is the description of the Fixture. When a Player inspects this Fixture, they will receive a parsed version of this
string. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more information.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`PLAIN_TEXT` message display type](../../about/discord.md#display-components).

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Fixture.

### Process

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.process`

This is an internal attribute used to process Recipes. It has the following structure:

```ts
interface Process {
    /** The recipe being processed. **/
    recipe: Recipe;
    /** The ingredients used in the recipe. */
    ingredients: Array<CollatedItem<RoomItem>>;
    /** The products created during recipe processing. */
    products: Array<RoomItem>;
    /** How many times the given ingredients satisfy the recipe. Only set right before products are instantiated. */
    satisfactoryProcessCount: number;
    /** The duration of the recipe. */
    duration: Duration;
    /** The timer used to track the duration of the recipe. */
    timer: Timer | null;
}
```

For more information on the Duration data type, see the documentation for [Luxon](https://moment.github.io/luxon/#/).

### Recipe Interval

- Class attribute: [Duration](https://moment.github.io/luxon/api-docs/index.html#duration) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.recipeInterval`

This is an internal attribute that allows Fixtures to check for and process Recipes every second. If the Fixture does
not have a Recipe tag, then this will be `null`.

## Methods

Fixtures have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### isItemContainer

```ts
this.isItemContainer();
```

- Purpose: Returns true if the fixture is capable of containing items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### canCurrentlyContainItems

```ts
this.canCurrentlyContainItems(requireEmptySpace?, bypassLimitations?);
```

- Purpose: Returns true if the fixture is currently capable of being taken from/dropped into.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
      `requireEmptySpace` - Whether the container needs to be below max capacity.
      Defaults to true. Does nothing for fixtures.
    - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
      `bypassLimitations` - Whether limitations should be bypassed. If true, the fixture can be processing items.
      Defaults to false.

### getContainedItems

```ts
this.getContainedItems();
```

- Purpose: Gets all of the items this entity contains.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
- Parameters: None

### getContainedItemsForItemList

```ts
this.getContainedItemsForItemList(itemListName?, player?);
```

- Purpose: Gets all of the items that should appear in the fixture's item list.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `itemListName` - The name of the item list. Unused.
    - [Player](player.md)
      `player` - The player the description is being sent to. Unused.

### containsNoItems

```ts
this.containsNoItems();
```

- Purpose: Returns true if this entity contains no items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### containsItem

```ts
this.containsItem(identifier);
```

- Purpose: Returns true if this entity contains an item with the given identifier or prefab ID.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `identifier` - The identifier or prefab ID to search for.

### getContainedItem

```ts
this.getContainedItem(identifier);
```

- Purpose: Returns the item contained inside of this container with the given identifier or prefab ID.
  If no such item exists, returns undefined.
- Returns: [Room Item](room_item.md)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `identifier` - The identifier or prefab ID to search for.

### getContainedItemsWeight

```ts
this.getContainedItemsWeight();
```

- Purpose: Gets the combined weight of all the items this entity contains.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters: None

### isProcessingItems

```ts
this.isProcessingItems();
```

- Purpose: Returns true if the fixture is activated and deactivates automatically.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### getContainingPhrase

```ts
this.getContainingPhrase();
```

- Purpose: Gets the fixture's name preceded by "the".
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters: None

### getPreposition

```ts
this.getPreposition();
```

- Purpose: Gets the fixture's preposition. If no preposition is set, returns "in".
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters: None

### getIngredientItem

```ts
this.getIngredientItem(prefabId);
```

- Purpose: Gets the actual ingredient item instance that was used as an ingredient in the currently processed recipe.
  If no such item exists, returns the corresponding ingredient prefab of the currently processed recipe.
  If no recipe is currently being processed, returns undefined.
- Returns: [Prefab](prefab.md) | [Room Item](room_item.md)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `prefabId` - The prefab ID to search for.

### getProductItem

```ts
this.getProductItem(prefabId);
```

- Purpose: Gets the actual product item instance that was instantiated in the currently processed recipe.
  If no such item exists, returns the corresponding product prefab of the currently processed recipe.
  If no recipe is currently being processed, returns undefined.
- Returns: [Prefab](prefab.md) | [Room Item](room_item.md)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `prefabId` - The prefab ID to search for.
