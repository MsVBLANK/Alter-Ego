# Room Item

> [!NOTE]
> These were previously called Items, but were renamed in Alter Ego 2.0 to better
> differentiate them from Inventory Items.

A Room Item is a data structure used by Alter Ego. It represents an item in a [Room](room.md)
that a [Player](player.md) can take with them. It is an instance of a [Prefab](prefab.md), and is similar to
an [Inventory Item](inventory_item.md).

## Attributes

Room Items themselves have relatively few attributes. However, being instances of Prefabs, they inherit many attributes
as a result. Note that if an attribute is _internal_, that means it only exists within the
[RoomItem class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/RoomItem.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on
the spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### Prefab ID

- Spreadsheet label: **Prefab**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.prefabId`

This is the ID of the Prefab this Item is an instance of, as it was entered on the sheet.

### Prefab

- Class attribute: [Prefab](prefab.md) `this.prefab`

This is an internal attribute which contains a reference to the actual Prefab object this Room Item is an instance of.
It gives the Room Item most of its properties. All of the Prefab's attributes are accessible via this property.

### Identifier

- Spreadsheet label: **Container Identifier**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.identifier`

This is a unique name given to the Room Item if it is capable of containing other Room Items. This is necessary when
loading Room Items in order for Alter Ego to determine which container the child Room Items belong to, in case there
are multiple container Room Items with the same Prefab. Typically, this is the Prefab ID followed by a number (the
standard followed by the [itemManager module](https://github.com/MolSnoo/Alter-Ego/blob/master/Modules/itemManager.js)),
but there are no naming rules for identifiers. No two Room Items or Inventory Items can have the same identifier.
For an example of how this looks, see the following table:

| Prefab ID       | Container Identifier | Location | Container                                   | Quantity |
|-----------------|----------------------|----------|---------------------------------------------|----------|
| VINYL GLOVE BOX | VINYL GLOVE BOX 1    | Kitchen  | Fixture: HAND WASH STATION 1                | 1        |
| VINYL GLOVE BOX | VINYL GLOVE BOX 2    | Kitchen  | Fixture: HAND WASH STATION 2                | 1        |
| VINYL GLOVES    |                      | Kitchen  | RoomItem: VINYL GLOVE BOX 1/VINYL GLOVE BOX | 10       |
| VINYL GLOVES    |                      | Kitchen  | RoomItem: VINYL GLOVE BOX 2/VINYL GLOVE BOX | 10       |

For Room Items that are not capable of containing Room Items, this can be left blank.

### Single Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is an internal attribute which is inherited from the Prefab's [possible names](prefab.md#possible-names). This is
the single name that the Room Item was instantiated with. If the Prefab has multiple possible names, and the Room Item
was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
names, its single name will be the single name of the first of the Prefab's possible names that it satisfied.

For example, if the Prefab has the possible names:

`[base color=default: PLATE, PLATES], [glaze color=orange: ORANGE PLATE, ORANGE PLATES], [glaze color=brown: BROWN PLATE, BROWN PLATES], [base color=red: RED PLATE, RED PLATES], [base color=white: WHITE PLATE, WHITE PLATES]`

And the Room Item was instantiated with the procedural selections `(glaze color=orange + base color=white)`, then the
first set of possible names that will be satisfied is the set for `glaze color=orange`,
so the Room Item's single name will be:

`ORANGE PLATE`

However, if the Prefab only has one set of possible names, then the Room Item's single name will be the sole single
name that the Prefab can have.

Note that a Room Item's single name is set on creation, and cannot be changed afterwards.

### Plural Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralName`

This is an internal attribute which is inherited from the Prefab's [possible names](prefab.md#possible-names). This is
the plural name that the Room Item was instantiated with. If the Prefab has multiple possible names, and the Room Item
was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
names, its plural name will be the plural name of the first of the Prefab's possible names that it satisfied. If that
set of possible names does not have a plural name, it will be set as an empty string.

Otherwise, all of the same principles of the single name apply to the plural name as well. For the example above, the
Room Item's plural name would be:

`ORANGE PLATES`

### Single Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.singleContainingPhrase`

This is an internal attribute which is inherited from the Prefab's
[possible containing phrases](prefab.md#possible-containing-phrases). This is the single containing phrase that the
Room Item was instantiated with. If the Prefab has multiple possible containing phrases, and the Room Item was
instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
containing phrases, its single containing phrase will be the single containing phrase of the first of the Prefab's
possible containing phrases that it satisfied.

For example, if the Prefab has the possible containing phrases:

`[secondary base color=default: a TEACUP on a saucer, TEACUPS on saucers], [secondary glaze color=orange: an ORANGE TEACUP on a saucer, ORANGE TEACUPS on saucers], [secondary glaze color=brown: a BROWN TEACUP on a saucer, BROWN TEACUPS on saucers], [secondary base color=red: a RED TEACUP on a saucer, RED TEACUPS on saucers], [secondary base color=white: a WHITE TEACUP on a saucer, WHITE TEACUPS on saucers]`

And the Room Item was instantiated with the procedural selections
`(secondary glaze color=orange + secondary base color=white)`, then the first set of possible containing phrases that
will be satisfied is the set for `secondary glaze color=orange`, so the Room Item's single containing phrase will be:

`an ORANGE TEACUP on a saucer`

However, if the Prefab only has one set of possible containing phrases, then the Room Item's single containing phrase
will be the sole single containing phrase that the Prefab can have.

Note that a Room Item's single containing phrase is set on creation, and cannot be changed afterwards.

### Plural Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralContainingPhrase`

This is an internal attribute which is inherited from the Prefab's
[possible containing phrases](prefab.md#possible-containing-phrases). This is the plural containing phrase that the
Room Item was instantiated with. If the Prefab has multiple possible containing phrases, and the Room Item was
instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
containing phrases, its plural containing phrase will be the plural containing phrase of the first of the Prefab's
possible containing phrases that it satisfied. If that set of possible containing phrases does not have a
plural containing phrase, it will be set as an empty string.

Otherwise, all of the same principles of the single containing phrase apply to the plural containing phrase as well.
For the example above, the Room Item's plural containing phrase would be:

`ORANGE TEACUPS on saucers`

### Location Display Name

- Spreadsheet label: **Location**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.locationDisplayName`

This is the [display name](room.md#display-name) of the Room that the Room Item can be found in. This must match the
Room's display name on the spreadsheet exactly, or its [ID](room.md#id).

### Location

- Class attribute: [Room](room.md) `this.location`

This internal attribute is a reference to the actual Room object the Room Item can be found in.

### Accessible

- Spreadsheet label: **Accessible?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.accessible`

This is a simple Boolean value indicating whether the Room Item can currently be interacted with or not. If this is
`true`, then Players can inspect and take the Room Item. If it is `false`, Alter Ego will act as if the Room Item
doesn't exist when a Player tries to interact with it in any way.

### Container Name

- Spreadsheet label: **Container**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containerName`

This is the name of the container the Room Item can be found in. A Room Item's container is the data structure whose
description will mention the Room Item in an [item list](../../moderator_guide/writing_descriptions.md#il). When the
Room Item is taken, the Room Item will be no longer appear in the item list in its container. Note that the Room Item's
container must be in the same Room as the Room Item itself.

In order to properly specify a Room Item's container, the type of the container must be specified, then a colon, then
the container's name. However, if the container is another Room Item, then its identifier must be given instead of its
name, and so must the ID of the [Inventory Slot](inventory_slot.md) this Room Item is in, with both separated by a
forward slash (`/`). For some examples of correct container names, see the following table:

| Type     | Name / Identifier | Inventory Slot ID | Container Name                | Cell Contents                           |
|----------|-------------------|-------------------|-------------------------------|-----------------------------------------|
| Fixture  | SHELF             |                   | SHELF                         | Fixture: SHELF                          |
| Puzzle   | LOCKER 1          |                   | LOCKER 1                      | Puzzle: LOCKER 1                        |
| RoomItem | KIARAS BACKPACK 1 | MAIN POCKET       | KIARAS BACKPACK 1/MAIN POCKET | RoomItem: KIARAS BACKPACK 1/MAIN POCKET |

Keep in mind that this attribute contains _only_ the container name, as shown in the table. However, when entering this
cell manually, it must be input as specified in the **Cell Contents** column of the table above.

### Container Type

- Spreadsheet label: **Container**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containerType`

This is the type of the container the Room Item can be found in. This can be either `Fixture`, `Puzzle`, or `RoomItem`.
This attribute is set based on the type given in the same cell as the container name.

### Container

- Class attribute: [Fixture](fixture.md) | [Puzzle](puzzle.md) | [Room Item](room_item.md)
  `this.container`

This is an internal attribute which simply contains a reference to the actual Fixture, Puzzle, or Room Item object
whose name matches `this.containerName` and whose location is the same as the Room Item.

### Slot

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.slot`

This is an internal attribute which simply contains the ID of the specific Inventory Slot that this Room Item is
contained in. If this Room Item is not contained inside of another Room Item, this is an empty string.

### Quantity

- Spreadsheet label: **Quantity**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.quantity`

This is a whole number indicating how many instances of this Room Item there are in the given container. So long as its
quantity is greater than 0, this Room Item can be inspected and taken from its container. If no quantity is given, the
Room Item will be treated as though it has an infinite quantity. Room Items capable of containing other Room Items
cannot have a quantity greater than 1. Multiple instances of container Room Items must be entered as entirely different
Room Items on the sheet, but they will be considered the same in certain contexts, such as in item lists.

### Uses

- Spreadsheet label: **Uses**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.uses`

This is a whole number indicating how many times this Room Item can be used. Although this number is derived from a
Room Item's Prefab, it can be manually set to differ on the spreadsheet. If no number of uses is given, the Room Item
can be used infinitely. Note that Room Items cannot be used by a Player directly, so this attribute primarily denotes
how many times a Room Item can be used if it is turned into an Inventory Item by being taken. For more details, see the
section about [Inventory Item uses](inventory_item.md#uses).

Alter Ego uses this attribute when processing this Room Item as part of a [Recipe](recipe.md). If this Room Item is
used as an ingredient and its Prefab is listed as a product in the Recipe, and it has a limited number of uses, its
uses will be decreased every time the Recipe is finished processing. The amount by which its uses will decrease
depends on how many times the ingredients contained in the Fixture the Room Item belongs to satisfy the Recipe being
processed. If, when the Fixture is finished processing the Recipe, the Room Item's uses are decreased to 0, one of two
things will happen:

- If the Room Item's Prefab has a [next stage](prefab.md#next-stage), then it will be destroyed and its next stage will
  be instantiated in its place.
- If the Room Item's Prefab has no next stage, it will simply be destroyed.

### Size

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.size`

This is an internal attribute. It is a whole number inherited from the size of the Room Item's Prefab.

### Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.weight`

This is an internal attribute. It is a whole number inherited from the weight of the Room Item's Prefab. If the
Room Item is capable of containing other Room Items, the Room Items inside of it will add to its weight.

### Inventory

- Class attribute:
  [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Inventory Slot](inventory_slot.md)<[Room Item](room_item.md)>>
  `this.inventory`

This is a collection of Inventory Slot objects that the Room Item has, where the key is the Inventory Slot's ID. It is
inherited from its Prefab. However, unlike its Prefab, the Room Item's Inventory Slots can actually contain Room Items.

For more details, see the section about [Prefab inventories](prefab.md#inventory).

### Description

- Spreadsheet label: **Description**
- Class attribute: [Description](description.md) `this.description`

This is the description of the Room Item. When a Player inspects this Room Item, they will receive a parsed version of
this string. Note that this can be completely different from the description of the Room Item's Prefab. Not only will
its item lists actually mention the Room Items contained inside, but if the Prefab has
[procedural options](prefab.md#procedural-options), then when the Room Item is instantiated, its description will only
contain the procedurals and possibilities that were selected.

See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more information.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`PLAIN_TEXT` message display type](../discord.md#display-components).

### Procedural Selections

- Class attribute: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.proceduralSelections`

This internal attribute is a map of procedural selections for the Room Item, where the key is the name of a
`procedural` tag in its description, and the value is the name of the `poss` tag that was selected in that procedural
when the Room Item was instantiated. This is used to determine which of the Prefab's possible names and possible
containing phrases to assign to the Room Item during instantiation.

Regardless of what procedural selections were supplied when the Room Item was instantiated, this map will only contain
the procedural selections that actually exist in the Room Item's description. Any others are discarded and lost forever.
As the Room Item's description is inherited from the description of its Prefab, its procedural selections can only be
procedural options that exist in the Prefab's description, unless the Room Item was added to the sheet directly, with
custom procedurals in its description that don't exist in its Prefab. However, doing this is not recommended.

Procedural selections that belong to a Room Item are transferred whenever the Room Item is transformed into something
else. This happens whenever a Room Item is processed by a Fixture as part of a Recipe. This can occur in one of two ways:

- If the Room Item has a limited number of uses and it is transformed into its Prefab's next stage when its uses
  decreases to 0, its next stage will be instantiated with the same procedural selections.
- If a Room Item is used as an ingredient in a Recipe, then the procedural selections of all ingredients will be
  combined, and applied to all of the instantiated products.

The latter occurrence is especially useful, as it makes it possible to create Recipe chains in which procedural
selections can be inherited and passed along to the next products in the chain. However, once again it is worth noting
that if a next stage or a product does not have procedural options in its description that would be satisfied by a
given procedural selection, that procedural selection will be discarded and lost when that Room Item is instantiated.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Room Item.

## Methods

Room Items have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### isItemContainer

```ts
this.isItemContainer();
```

- Purpose: Returns true if the room item is capable of containing items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### canCurrentlyContainItems

```ts
this.canCurrentlyContainItems(requireEmptySpace?, bypassLimitations?);
```

- Purpose: Returns true if the room item is currently capable of being taken from/dropped into.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
    `requireEmptySpace` - Whether the container needs to be below max capacity. Defaults to true.
  - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
    `bypassLimitations` - Whether limitations should be bypassed. Does nothing for room items. Defaults to false.

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

- Purpose: Gets all of the items that should appear in the given item list.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `itemListName` - The name of the item list. Only required if there is more than one item list.
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

### ownerIs

```ts
this.ownerIs(player);
```

- Purpose: Returns true if the owner of this item instance is the given player. For room items, always returns false.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [Player](player.md) `player` - The player to check ownership against.

### hasProceduralSelection

```ts
this.hasProceduralSelection([proceduralName, possName]);
```

- Purpose: Returns true if the item has the given procedural selection.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - \[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)\]
      `proceduralOption` - A procedural name and possibility name, expressed as a tuple array.
