# Inventory Item

An Inventory Item is a data structure used by Alter Ego. It represents an item that is currently possessed by
a [Player](player.md). It is an instance of a [Prefab](prefab.md), and is similar to a [Room Item](room_item.md).

## Attributes

Inventory Items themselves have relatively few attributes. However, being instances of Prefabs, they inherit many
attributes as a result. Note that if an attribute is _internal_, that means it only exists within
the [InventoryItem class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/InventoryItem.ts). Internal attributes
will be given in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only
exists on the spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### Player Name

- Spreadsheet label: **Player Name**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.playerName`

This is the name of the Player whose inventory this Inventory Item is in. This must match the Player's name exactly on
the spreadsheet.

### Player

- Class attribute: [Player](player.md) `this.player`

This is an internal attribute which contains a reference to the actual Player object whose name is given in
`this.playerName`. All of the Player's attributes are accessible via this property.

### Prefab ID

- Spreadsheet label: **Prefab**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.prefabId`

This is the ID of the Prefab this Item is an instance of, as it was entered on the sheet.

This cell can never be left blank, even for empty [Equipment Slots](equipment_slot.md). If the Inventory Item is an
Equipment Slot with nothing equipped to it, this should be `NULL`.

### Prefab

- Class attribute: [Prefab](prefab.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.prefab`

This is an internal attribute which contains a reference to the actual Prefab object this Inventory Item is an
instance of. It gives the Inventory Item most of its properties. All of the Prefab's attributes are accessible
via this property.

If the Prefab ID given was `NULL`, then the Inventory Item's Prefab will be `null`.

### Identifier

- Spreadsheet label: **Container Identifier**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.identifier`

This is a unique name given to the Inventory Item if it is capable of containing other Inventory Items. This is
necessary when loading Inventory Items in order for Alter Ego to determine which container the child Inventory Items
belong to, in case there are multiple container Inventory Items with the same Prefab. Typically, this is the Prefab ID
followed by a number (the standard followed by
the [itemManager module](https://github.com/MolSnoo/Alter-Ego/blob/master/Modules/itemManager.js)), but there are no
naming rules for identifiers. No two Room Items or Inventory Items can have the same identifier. For an example of how
this looks, see the following table:

| Player Name | Prefab ID   | Container Identifier | Equipment Slot | Container                  | Quantity |
|-------------|-------------|----------------------|----------------|----------------------------|----------|
| Astrid      | BLACK PARKA | BLACK PARKA 1        | RIGHT HAND     |                            | 1        |
| Astrid      | BLACK PARKA | BLACK PARKA 2        | JACKET         |                            | 1        |
| Astrid      | COIN        |                      | RIGHT HAND     | BLACK PARKA 1/RIGHT POCKET | 10       |
| Astrid      | COIN        |                      | JACKET         | BLACK PARKA 2/RIGHT POCKET | 10       |

For Inventory Items that are not capable of containing Inventory Items, this can be left blank.

### Single Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is an internal attribute which is inherited from the Prefab's [possible names](prefab.md#possible-names). This is
the single name that the Inventory Item was instantiated with. If the Prefab has multiple possible names, and the
Inventory Item was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of
the possible names, its single name will be the single name of the first of the Prefab's possible names that it satisfied.

For example, if the Prefab has the possible names:

`[base color=default: PLATE, PLATES], [glaze color=orange: ORANGE PLATE, ORANGE PLATES], [glaze color=brown: BROWN PLATE, BROWN PLATES], [base color=red: RED PLATE, RED PLATES], [base color=white: WHITE PLATE, WHITE PLATES]`

And the Inventory Item was instantiated with the procedural selections `(glaze color=orange + base color=white)`,
then the first set of possible names that will be satisfied is the set for `glaze color=orange`,
so the Inventory Item's single name will be:

`ORANGE PLATE`

However, if the Prefab only has one set of possible names, then the Inventory Item's single name will be the sole
single name that the Prefab can have.

Note that an Inventory Item's single name is set on creation, and cannot be changed afterwards.

### Plural Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralName`

This is an internal attribute which is inherited from the Prefab's [possible names](prefab.md#possible-names). This is
the plural name that the Inventory Item was instantiated with. If the Prefab has multiple possible names, and the
Inventory Item was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of
the possible names, its plural name will be the plural name of the first of the Prefab's possible names that it
satisfied. If that set of possible names does not have a plural name, it will be set as an empty string.

Otherwise, all of the same principles of the single name apply to the plural name as well. For the example above, the
Inventory Item's plural name would be:

`ORANGE PLATES`

### Single Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.singleContainingPhrase`

This is an internal attribute which is inherited from the Prefab's
[possible containing phrases](prefab.md#possible-containing-phrases). This is the single containing phrase that the
Inventory Item was instantiated with. If the Prefab has multiple possible containing phrases, and the Inventory Item
was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
containing phrases, its single containing phrase will be the single containing phrase of the first of the Prefab's
possible containing phrases that it satisfied.

For example, if the Prefab has the possible containing phrases:

`[secondary base color=default: a TEACUP on a saucer, TEACUPS on saucers], [secondary glaze color=orange: an ORANGE TEACUP on a saucer, ORANGE TEACUPS on saucers], [secondary glaze color=brown: a BROWN TEACUP on a saucer, BROWN TEACUPS on saucers], [secondary base color=red: a RED TEACUP on a saucer, RED TEACUPS on saucers], [secondary base color=white: a WHITE TEACUP on a saucer, WHITE TEACUPS on saucers]`

And the Inventory Item was instantiated with the procedural selections
`(secondary glaze color=orange + secondary base color=white)`, then the first set of possible containing phrases that
will be satisfied is the set for `secondary glaze color=orange`, so the Inventory Item's single containing phrase will be:

`an ORANGE TEACUP on a saucer`

However, if the Prefab only has one set of possible containing phrases, then the Inventory Item's single containing
phrase will be the sole single containing phrase that the Prefab can have.

Note that an Inventory Item's single containing phrase is set on creation, and cannot be changed afterwards.

### Plural Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralContainingPhrase`

This is an internal attribute which is inherited from the Prefab's
[possible containing phrases](prefab.md#possible-containing-phrases). This is the plural containing phrase that the
Inventory Item was instantiated with. If the Prefab has multiple possible containing phrases, and the Inventory Item
was instantiated with at least one [procedural selection](#procedural-selections) that satisfies one of the possible
containing phrases, its plural containing phrase will be the plural containing phrase of the first of the Prefab's
possible containing phrases that it satisfied. If that set of possible containing phrases does not have a
plural containing phrase, it will be set as an empty string.

Otherwise, all of the same principles of the single containing phrase apply to the plural containing phrase as well.
For the example above, the Inventory Item's plural containing phrase would be:

`ORANGE TEACUPS on saucers`

### Equipment Slot

- Spreadsheet label: **Equipment Slot**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.equipmentSlot`

This is the ID of the Equipment Slot that this Inventory Item belongs to, whether it is equipped to it or contained in
another Inventory Item that is. This cell can never be left blank. For more information, see the article
on [Equipment Slots](equipment_slot.md).

### Container Name

- Spreadsheet label: **Container**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containerName`

This is the identifier of the container the Inventory Item can be found in. An Inventory Item's container is the
Inventory Item whose description will mention it in an [item list](../../moderator_guide/writing_descriptions.md#il).
When the Inventory Item is unstashed, the Inventory Item will no longer appear in the item list in its container. Note
that the Inventory Item's container must belong to the same Player and Equipment Slot as the Inventory Item itself.

In order to properly specify an Inventory Item's container, the container's identifier must be given, as well as the ID
of the specific [Inventory Slot](prefab.md#inventory) it is in, with both separated by a forward slash (`/`).
Unlike Room Items, Inventory Items cannot have containers of different types; they can only be other Inventory Items,
so a type doesn't need to be specified.

The following are some examples of correct container names:

- LAB COAT 1/RIGHT POCKET
- LAB COAT 2/LEFT POCKET
- PLASTIC BAG 34/PLASTIC BAG

Keep in mind that this attribute consists of the container names _as written_, including the forward slash and
Inventory Slot ID.

If no container name is supplied, then this Inventory Item is equipped to the listed Equipment Slot.

### Container Type

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containerType`

This is internal attribute is the type of the container the Inventory Item can be found in.
This will always be `InventoryItem`.

### Container

- Class attribute: [Inventory Item](inventory_item.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.container`

This is an internal attribute which simply contains a reference to the actual Inventory Item object in the Player's
inventory whose container identifier matches that of `this.containerName`. If this Inventory Item is equipped to an
Equipment Slot (and thus doesn't have a container name) or the container it belongs to no longer exists in the Player's
inventory, then this is `null`.

### Slot

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.slot`

This is an internal attribute which simply contains the ID of the specific Inventory Slot that this Inventory Item
is contained in. If this Inventory Item is not contained inside of another Inventory Item, this is an empty string.

### Quantity

- Spreadsheet label: **Quantity**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.quantity`

This is a whole number indicating how many instances of this Inventory Item there are in the given container. So long
as its quantity is greater than 0, this Inventory Item can be inspected and unstashed from its container. Unlike
Room Items, Inventory Items cannot have an infinite quantity; a value must be provided. Inventory Items capable of
containing other Inventory Items cannot have a quantity greater than 1. Multiple instances of container Inventory
Items must be entered as entirely different Inventory Items on the sheet, but they will be considered the same in
certain contexts, such as in item lists. Equipped Inventory Items cannot have a quantity other than 1, unless they have
the `NULL` Prefab - in that case, their quantity should be left blank.

### Uses

- Spreadsheet label: **Uses**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.uses`

This is a whole number indicating how many times this Inventory Item can be used in a [UseAction](action.md#use-action).
Although this number is derived from an Inventory Item's Prefab, it can be manually set to differ on the spreadsheet.
If no number of uses is given, the Inventory Item can be used infinitely. If the Inventory Item is dropped, its uses
will be retained when it's converted into a Room Item. This number can then be used when the subsequent Room Item is
processed as part of a [Recipe](recipe.md). For more details, see the section about [Room Item uses](room_item.md#uses).

Inventory Items can also be used another way. If a Player [crafts](action.md#craft-action) an Inventory Item, and the
Inventory Item is listed as an ingredient and a product in a Recipe, and it has a limited number of uses, its uses will
be decreased. The amount by which its uses will decrease depends on how many times the crafting ingredients satisfy the
Recipe being processed. Since crafting ingredients must be held in the Player's hand Equipment Slots, and equipped
Inventory Items can only have a quantity of 1, this means that the number of uses will _usually_ decrease by 1.
However, if ingredients are contained inside of one of the equipped Inventory Items and those ingredients have a higher
quantity, then the number of uses that will be subtracted can be greater than 1.

Note that when an Inventory Item is [uncrafted](action.md#uncraft-action), its number of uses is not retained. The
ingredient Prefabs will be instantiated with their default number of uses.

If an Inventory Item's uses are decreased to 0, one of two things will happen:

- If the Inventory Item's Prefab has a [next stage](prefab.md#next-stage), then it will be destroyed and its next stage
  will be instantiated in its place.
- If the Inventory Item's Prefab has no next stage, it will simply be destroyed.

### Size

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.size`

This is an internal attribute. It is a whole number inherited from the size of the Inventory Item's Prefab.

### Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.weight`

This is an internal attribute. It is a whole number inherited from the weight of Inventory Item's Prefab. If the
Inventory Item is capable of containing other Inventory Items, the Inventory Items inside of it will add to its weight.
This will also be added to the Player's [carry weight](player.md#carry-weight).

### Inventory

- Class attribute:
  [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Inventory Slot](inventory_slot.md)<[Inventory Item](inventory_item.md)>>
  `this.inventory`

This is a collection of Inventory Slot objects that the Inventory Item has, where the key is the Inventory Slot's ID.
It is inherited from its Prefab. However, unlike its Prefab, the Inventory Item's Inventory Slots
can actually contain Inventory Items.

For more details, see the section about [Prefab inventories](prefab.md#inventory).

### Description

- Spreadsheet label: **Description**
- Class attribute: [Description](description.md) `this.description`

This is the description of the Inventory Item. When a Player inspects this Inventory Item, they will receive a parsed
version of this string. Note that this can be completely different from the description of the Inventory Item's Prefab.
Its item lists will actually mention the Inventory Items contained inside, but if it is inspected by a different Player
than the one it belongs to, all sentences containing item lists will be removed. Also if the Prefab has
[procedural options](prefab.md#procedural-options), then when the Inventory Item is instantiated, its description will
only contain the procedurals and possibilities that were selected.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`PLAIN_TEXT` message display type](../../about/discord.md#display-components).

### Procedural Selections

- Class attribute: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.proceduralSelections`

This internal attribute is a map of procedural selections for the Inventory Item, where the key is the name of a
`procedural` tag in its description, and the value is the name of the `poss` tag that was selected in that procedural
when the Inventory Item was instantiated. This is used to determine which of the Prefab's possible names and possible
containing phrases to assign to the Inventory Item during instantiation.

Regardless of what procedural selections were supplied when the Inventory Item was instantiated, this map will only
contain the procedural selections that actually exist in the Inventory Item's description. Any others are discarded and
lost forever. As the Inventory Item's description is inherited from the description of its Prefab, its procedural
selections can only be procedural options that exist in the Prefab's description, unless the Inventory Item was added
to the sheet directly, with custom procedurals in its description that don't exist in its Prefab.
However, doing this is not recommended.

Procedural selections that belong to an Inventory Item are transferred whenever the Inventory Item is transformed into
something else. This can happen when an Inventory Item's uses are decreased to 0 and it is transformed into its next
stage, whether its uses were decremented by a Use Action or as part of crafting Recipe.
It can also occur in one of two ways:

- If an Inventory Item is used as an ingredient in a crafting Recipe, then the procedural selections of all ingredients
  will be combined, and applied to all of the instantiated products.
- If an Inventory Item is converted into its ingredients in an Uncraft Action, then its procedural selections will be
  applied to all of the instantiated ingredients.

Both of these occurrences are especially useful, as it makes it possible to create Recipe chains in which procedural
selections can be inherited and passed along to the next products in the chain. However, once again it is worth noting
that if a next stage or a product does not have procedural options in its description that would be satisfied by a given
procedural selection, that procedural selection will be discarded and lost when that Inventory Item is instantiated.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Inventory
Item.

## Methods

Inventory Items have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### getContainedItems

```ts
this.getContainedItems();
```

- Purpose: Gets all of the items this entity contains.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
- Parameters: None

### getContainedItemsForItemList

```ts
this.getContainedItemsForItemList(itemListName?, player?);
```

- Purpose: Gets all of the items that should appear in the given item list.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `itemListName` - The name of the item list. Only required if there is more than one item list.
  - [Player](player.md)
    `player` - The player the description is being sent to. Optional.


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

### getContainedItemsWeight

```ts
this.getContainedItemsWeight();
```

- Purpose: Gets the combined weight of all the items this entity contains.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters: None

### usableOn

```ts
this.usableOn(player);
```

- Purpose: Returns true if the item is usable on the given player.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [Player](player.md) `player`

### isCoveredByEquippedItem

```ts
this.isCoveredByEquippedItem();
```

- Purpose: Returns true if the item is covered by an equipped inventory item. Also returns true if it's stashed.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None
