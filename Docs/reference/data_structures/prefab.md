# Prefab

A **Prefab** is a data structure used by Alter Ego. It represents the concept of an item, and is the underlying
data structure which gives [Room Items](room_item.md) and [Inventory Items](inventory_item.md) their properties.

Prefabs are static; once loaded from the [spreadsheet](index.md), they do not change in any way. Thus,
the [GameEntitySaver class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Classes/GameEntitySaver.ts) will never
make changes to the Prefabs sheet. As a result, the Prefabs sheet can be freely edited without
[edit mode](../../moderator_guide/edit_mode.md) being enabled.

## Attributes

Due to the versatility of functions that different items can have, Prefabs have many attributes. Note that if an
attribute is _internal_, that means it only exists within
the [Prefab class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Data/Prefab.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Prefab ID**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is a unique identifier for the Prefab. All letters should be capitalized, and spaces are allowed. Though different
Prefabs can have many attributes in common, no two Prefabs can have the same ID.

### Possible Names

- Spreadsheet label: **Prefab Name**
- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>, [[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]>
  `this.possibleNames`

A Prefab's name is what will be shown to [Players](player.md). It is what they are expected to enter in order to
interact with an Item. A Prefab must have a "single name" to refer to a single instance of it, but it can also have
a "plural name" to refer to multiple instances of it.

This attribute is a collection of possible names that a Room Item or Inventory Item that uses this Prefab can have.
The key of the collection is a procedural selection, which consists of a map where the key is the name of a procedural,
and the value is a selected possibility. The value of the collection is a pair of strings, where the first will be the
Item's [single](room_item.md#single-name) [name](inventory_item.md#single-name), and the second (if supplied) will
be the Item's [plural](room_item.md#plural-name) [name](inventory_item.md#plural-name).

In effect, this allows Item instances of this Prefab to have different names depending on what
[procedural](room_item.md#procedural-selections) [selections](inventory_item.md#procedural-selections) it generates
with. These must correspond with the Prefab's [procedural options](#procedural-options).

It is possible to enter this field without specifying any procedural selections. This will make all Item instances
of the Prefab have the same single name and plural name. If this is desirable, simply enter the single name of the
Prefab. If only one instance of a Prefab is intended to exist, it does not need a plural name. Additionally, it
does not need a plural name if it would be the same as its single name. However, if a plural name is desired,
it can be added after the single name, separated by a comma.

For example, a Prefab with the single name `SCISSORS` does not need a plural name, as the plural name would be the
same. However, a Prefab with the single name `SMALL KNIFE` would benefit from a plural name. To enter both, input
`SMALL KNIFE, SMALL KNIVES` into the cell. As demonstrated in these examples, all letters in the Prefab's names
should be capitalized, and spaces are allowed. However, apostrophes and quotation marks will be ignored.

To create names that are set based on an Item instance's procedural selections, they must be given in the form:

`[procedural name=possibility name: SINGLE NAME(, PLURAL NAME)]`

Extra whitespace will be ignored.

The same rules as static names apply: if a Prefab doesn't need a plural name, it can be omitted. So, for example,
this is a perfectly valid possible name:

`[tea flavor = chamomile: CHAMOMILE TEA]`

Multiple possible names can be given, each one separated by a comma, like the following examples:

`[cheese=american: AMERICAN CHEESE], [cheese=swiss: SWISS CHEESE], [cheese=colby: COLBY CHEESE], [cheese=colby jack: COLBY JACK CHEESE]`

`[lunch meat=turkey: TURKEY SANDWICH, TURKEY SANDWICHES], [lunch meat=ham: HAM SANDWICH, HAM SANDWICHES], [lunch meat=chicken: CHICKEN SANDWICH, CHICKEN SANDWICHES], [lunch meat=roast beef: ROAST BEEF SANDWICH, ROAST BEEF SANDWICHES]`

`[base color=default: MUG, MUGS], [glaze color=red: RED MUG, RED MUGS], [glaze color=orange: ORANGE MUG, ORANGE MUGS], [glaze color=brown: BROWN MUG, BROWN MUGS], [glaze color=yellow: YELLOW MUG, YELLOW MUGS], [glaze color=green: GREEN MUG, GREEN MUGS], [glaze color=teal: TEAL MUG, TEAL MUGS], [glaze color=light blue: LIGHT BLUE MUG, LIGHT BLUE MUGS], [glaze color=indigo: INDIGO MUG, INDIGO MUGS], [glaze color=violet: VIOLET MUG, VIOLET MUGS], [glaze color=pink: PINK MUG, PINK MUGS], [glaze color=white: WHITE MUG, WHITE MUGS], [glaze color=gray: GRAY MUG, GRAY MUGS], [glaze color=black: BLACK MUG, BLACK MUGS], [base color=red: RED MUG, RED MUGS], [base color=white: WHITE MUG, WHITE MUGS]`

If an Item is instantiated without procedural selections that satisfy any of the listed possible names, then its
names will be set as the first set of possible names listed. If it is instantiated with _multiple_ procedural
selections that satisfy the listed possible names, then its names will be set as the first set of possible names
that its procedural selections satisfy. Effectively, this means that the earlier in the list a possible name is
given, the higher priority it has.

### Possible Containing Phrases

- Spreadsheet label: **Containing Phrases**
- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>, [[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]>
  `this.possibleContainingPhrases`

A Prefab's containing phrase is what will be used to refer to an Item instance of the Prefab in contexts where
grammar is important. This will be how the Item appears in [item lists](../../moderator_guide/writing_descriptions.md#il),
[Narrations](narration.md), and [Notifications](notification.md). A Prefab must have a "single containing phrase"
to refer to a single instance of it, but it can also have a "plural containing phrase" to refer to multiple
instances of it. The single containing phrase should almost always include the Prefab's single name, and the plural
containing phrase should almost always include the Prefab's plural name, if it has one. If the Prefab does not have a
plural name because it would be the same as its single name, the plural containing phrase should contain the Prefab's
single name instead.

The structure, syntax, and behavior are mostly identical to that of the Prefab's possible names. The only differences
worth noting are:

- If more than one Item instance of a Prefab is expected to exist, it _must_ have a plural containing phrase, and
- A containing phrase can have lowercase text and symbols, because Players are not expected to enter these.

If variable containing phrases are not desired, it is sufficient to simply enter a single containing phrase into the
cell, like so:

`a MACHETE`

To input a plural containing phrase, enter it after the single containing phrase, with a comma separating the two:

`a MACHETE, MACHETES`

Lastly, here are a few examples of containing phrases which change based on an Item's procedural selections:

`[tea flavor = chamomile: a cup of CHAMOMILE TEA on a saucer, cups of CHAMOMILE TEA on saucers]`

`[cheese=american: a slice of AMERICAN CHEESE, slices of AMERICAN CHEESE], [cheese=swiss: a slice of SWISS CHEESE, slices of SWISS CHEESE], [cheese=colby: a slice of COLBY CHEESE, slices of COLBY CHEESE], [cheese=colby jack: a slice of COLBY JACK CHEESE, slices of COLBY JACK CHEESE]`

`[lunch meat=turkey: a TURKEY SANDWICH with lettuce and tomato, TURKEY SANDWICHES with lettuce and tomato], [lunch meat=ham: a HAM SANDWICH with lettuce and tomato, HAM SANDWICHES with lettuce and tomato], [lunch meat=chicken: a CHICKEN SANDWICH with lettuce and tomato, CHICKEN SANDWICHES with lettuce and tomato], [lunch meat=roast beef: a ROAST BEEF SANDWICH with lettuce and tomato, ROAST BEEF SANDWICHES with lettuce and tomato]`

`[base color=default: a MUG, MUGS], [glaze color=red: a RED MUG, RED MUGS], [glaze color=orange: an ORANGE MUG, ORANGE MUGS], [glaze color=brown: a BROWN MUG, BROWN MUGS], [glaze color=yellow: a YELLOW MUG, YELLOW MUGS], [glaze color=green: a GREEN MUG, GREEN MUGS], [glaze color=teal: a TEAL MUG, TEAL MUGS], [glaze color=light blue: a LIGHT BLUE MUG, LIGHT BLUE MUGS], [glaze color=indigo: an INDIGO MUG, INDIGO MUGS], [glaze color=violet: a VIOLET MUG, VIOLET MUGS], [glaze color=pink: a PINK MUG, PINK MUGS], [glaze color=white: a WHITE MUG, WHITE MUGS], [glaze color=gray: a GRAY MUG, GRAY MUGS], [glaze color=black: a BLACK MUG, BLACK MUGS], [base color=red: a RED MUG, RED MUGS], [base color=white: a WHITE MUG, WHITE MUGS]`

### Single Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This internal attribute is the first possible single name the Prefab has. This is rarely used. It is recommended to
use the single name of an Item instance of the Prefab, rather than the single name of the Prefab itself.

### Plural Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralName`

This internal attribute is the first possible plural name the Prefab has. This is rarely used. It is recommended to
use the plural name of an Item instance of the Prefab, rather than the plural name of the Prefab itself.

### Single Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.singleContainingPhrase`

This internal attribute is the first possible single containing phrase the Prefab has. This is rarely used. It is
recommended to use the single containing phrase of an Item instance of the Prefab, rather than the single
containing phrase of the Prefab itself.

### Plural Containing Phrase

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pluralContainingPhrase`

This internal attribute is the first possible plural containing phrase the Prefab has. This is rarely used. It is
recommended to use the plural containing phrase of an Item instance of the Prefab, rather than the plural
containing phrase of the Prefab itself.

### Discreet

- Spreadsheet label: **Discreet?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.discreet`

This is a simple Boolean value indicating whether interactions with Room Items and Inventory Items using this Prefab
will be narrated or not. Specifically, if this is `false`, then Alter Ego will send a Narration to the Room if a Player
inspects, takes, or drops a Room Item using this Prefab; or inspects, stashes, unstashes, steals, gives, crafts,
uncrafts, or moves to another Room carrying an Inventory Item using this Prefab. Additionally, if this is `false`, then
when an Inventory Item using this Prefab is moved to either of the Player's hands, it will appear in the `hands`
item list in that Player's description.

### Size

- Spreadsheet label: **Size**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.size`

This is a whole number representing how large the Prefab is. It is not associated with any particular unit of
measurement, but instead represents relative sizes. For example, an ID card may have a size of 1 whereas a pistol may
have a size of 5 and a ladder may have a size of 30. There are no hard rules to determine what size a Prefab should
have, however it should be non-negative.

In general, it is good practice to choose sizes based on the capacities of the most common [Inventory Slots](#inventory)
in the game. For instance, if most equippable Prefabs with Inventory Slots such as pockets have capacities of 3 or 4,
any Prefabs that should not be able to fit in those pockets should have a size of 5 or higher.

It is also good to consider what each Prefab will be used for when deciding on its size. For example, if a Prefab is
intended to be used as an ingredient in a [Recipe](recipe.md) that requires it to be contained inside of another
ingredient, and it is possible to input one or more of that ingredient to create a product with that many uses, the
Prefab's size should be set based on the capacity of the Inventory Slot it is expected to be in as part of the Recipe.

As an example of the previous practice, consider a Recipe in which a Prefab `CLEAN BLENDER CUP` is an ingredient, and
it must contain 1X quantity of the Prefab `APPLE SLICES`, in order to produce 1 `BLENDER CUP OF APPLE JUICE` with 1X
uses. If the `CLEAN BLENDER CUP` has a single Inventory Slot with a capacity of 10, then it is possible to limit the
maximum number of servings that can be produced at once by setting the size of the `APPLE SLICES` Prefab based on that
capacity. For example, if the size is set to 2, then up to 5 `APPLE SLICES` can be put inside of the
`CLEAN BLENDER CUP`, producing a `BLENDER CUP OF APPLE JUICE` with 5 uses. If it is instead set to 3, then the maximum
number of servings would instead be 3, as no more than 3 `APPLE SLICES` would fit inside of the `CLEAN BLENDER CUP`.

### Weight

- Spreadsheet label: **Weight**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.weight`

This is a whole number representing roughly how much the Prefab weighs in kilograms. This number determines whether a
Player is capable of taking a Room Item using this Prefab with their [strength stat](player.md#strength). For more
details, see the sections about [Room Item](room_item.md#weight)
and [Inventory Item](inventory_item.md#weight) weights.

### Usable

- Spreadsheet label: **Usable?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.usable`

This is another Boolean value indicating whether Inventory Items using this Prefab can be used to inflict/cure one or
more [Status Effects](status.md) on the Player using it. If this is `false`, the Player will be told the Inventory Item
has no programmed use. Additionally, if a Player already has all of the Status Effects the Prefab inflicts and doesn't
have any of the Status Effects it cures, the Player will not be able to use the Inventory Item and will instead be told
that it has no effect.

### Third Person Verb

- Spreadsheet label: **Use Verb**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.thirdPersonVerb`

This is the phrase that will be used in the Narration when a Player uses an Inventory Item with this Prefab. Usage of
an Inventory Item will always be narrated, and will use the following format:

`[Player displayName] [this.thirdPersonVerb] [InventoryItem singleContainingPhrase].`

See the following table for some examples of the resulting Narration:

| Player displayName           | Single Containing Phrase     | Third Person Verb | Narration                                            |
|------------------------------|------------------------------|-------------------|------------------------------------------------------|
| Florian                      | a STRAWBERRY TART            | eats              | Florian eats a STRAWBERRY TART.                      |
| Kyra                         | a glass of LEMONADE          | drinks            | Kyra drinks a glass of LEMONADE.                     |
| An individual wearing a MASK | a TOWEL                      | dries off with    | An individual wearing a MASK dries off with a TOWEL. |
| Michio                       | a TOOTHBRUSH with toothpaste | brushes with      | Michio brushes with a TOOTHBRUSH with toothpaste.    |

It's important to note that this is specifically the verb to use to refer to the player in third person. However, this
is strictly a static string. As such, it cannot use the Player's [pronouns](player.md#pronoun-string). Third person
verbs should be written in such a way that pronoun usage is avoided.

If no third person verb is given, "uses" will be used in its place.

### Second Person Verb

- Spreadsheet label: **Use Verb**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.secondPersonVerb`

This is a phrase that will be used in Notifications when a Player uses an Inventory Item with this Prefab. It shares
the same cell as the third person verb. To supply a second person verb, enter it after the third person verb,
separating the two with a comma. Usage of an Inventory Item will always send a Notification to the Player, and will
use the following format:

`You [this.secondPersonVerb] [InventoryItem singleContainingPhrase].`

See the following table for some examples of the resulting Notification:

| Single Containing Phrase     | Second Person Verb    | Notification                                            |
|------------------------------|-----------------------|---------------------------------------------------------|
| a STRAWBERRY TART            | eat                   | You eat a STRAWBERRY TART.                              |
| a glass of LEMONADE          | drink                 | You drink a glass of LEMONADE.                          |
| a TOWEL                      | dry off with          | You dry off with a TOWEL.                               |
| a TOOTHBRUSH with toothpaste | brush your teeth with | You brush your teeth with a TOOTHBRUSH with toothpaste. |

If no second person verb is given, "use" will be used in its place.

### Use Verb

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.thirdPersonVerb` or `this.secondPersonVerb` instead.

- Spreadsheet label: **Use Verb**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.verb`

Identical to `this.thirdPersonVerb`. This will eventually be removed.

### Uses

- Spreadsheet label: **Uses**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.uses`

This is a whole number indicating how many times a single instance of this Prefab can be used. For more details, see the
sections about [Room Item uses](room_item.md#uses) and [Inventory Item uses](inventory_item.md#uses).

### Effects Strings

- Spreadsheet label: **Gives Status Effect(s)**
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.effectsStrings`

This is a comma-separated list of Status Effects that Inventory Items using this Prefab will inflict the Player with
when used.

### Effects

- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Status Effect](status.md)>
  `this.effects`

This is an internal attribute which contains references to each of the Status Effect objects whose IDs are listed in
`this.effectsStrings`.

### Cures Strings

- Spreadsheet label: **Cures Status Effect(s)**
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.curesStrings`

This is a comma-separated list of Status Effects that Inventory Items using this Prefab will cure the Player of when
used. Status Effects will turn into their [cured condition](status.md#cured-condition), if applicable. Note that it will
attempt to cure them in the order given. As a consequence, if the next Status Effect in the list is the current Status
Effect's cured condition, it will immediately be cured after being inflicted, turning into _its_ cured condition, and so
on. For example, imagine the following series of Status Effects, where each one's cured condition follows the `->`
symbol:

`starving->famished->hungry->satisfied->full`

If a Player with the `starving` Status Effect uses an Inventory Item whose Prefab has the cures string
`starving, famished, hungry, satisfied`, then the Player will be cured of `starving` and inflicted with `famished`, then
cured of `famished` and inflicted with `hungry`, and so on until the Player is eventually inflicted with `full`.

In order to avoid this behavior, if a Prefab's cures string is meant to contain a list of Status Effects in a series,
they should be listed in reverse order. In the above example, the cures string should be
`satisfied, hungry, famished, starving`. That way, the Player will only be cured of `starving` and inflicted with
`famished`.

### Cures

- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Status Effect](status.md)>
  `this.cures`

This is an internal attribute which contains references to each of the Status Effect objects whose IDs are listed in
`this.curesStrings`.

### Next Stage ID

- Spreadsheet label: **Turns Into**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.nextStageId`

This is the ID of the Prefab that Items using this Prefab will turn into once their number of uses reaches 0. Items
with infinite uses will never access this attribute. When an Item turns into its next stage, all of its attributes
will be replaced with that of the new Prefab. However, the Item's procedural selections will be carried over to
the next stage. If any of its procedural selections do not satisfy the procedural options of the next stage Prefab,
they will be discarded.

Note that if an Item has a limited number of uses and this is blank, then it will simply be destroyed once it
runs out of uses.

### Next Stage

- Class attribute: [Prefab](prefab.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.nextStage`

This is an internal attribute which simply contains a reference to the actual Prefab object whose ID matches
`this.nextStageId`. If no next stage ID is given, this will be `null` instead.

### Equippable

- Spreadsheet label: **Equippable?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.equippable`

This is another Boolean value indicating whether Inventory Items using this Prefab can be equipped to one of the
player's [Equipment Slots](equipment_slot.md). If this is `true`, then Players will be able to equip it to one of the
Equipment Slots that it's restricted to. If this is `false`, they will simply be told that the item is unequippable.
Additionally, if this is `false`, Players will be unable to unequip the Inventory Item if it's already equipped. Note
that a [moderator](../../moderator_guide/moderating.md) can forcibly equip and unequip Inventory Items for a Player
regardless of whether this is `true` or `false`. Note that when an Inventory Item is equipped or unequipped, a Narration
will always be sent to the Room the Player is in.

### Equipment Slots

- Spreadsheet label: **Restrict to Equip. Slots**
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.equipmentSlots`

This is a list of Equipment Slots that Inventory Items using this Prefab can be equipped to. This should be a
comma-separated list. If a Player or a moderator attempts to equip an Inventory Item without specifying an Equipment
Slot to equip it to, Alter Ego will attempt to equip it to the first Equipment Slot listed here. If something is already
equipped to that Equipment Slot, another one will have to be manually specified. Note that if no Equipment Slots are
given here, Players will be unable to equip Inventory Items using this Prefab, even if its equippable attribute is set
to `true`. However, moderators can forcibly equip Inventory Items to _any_ of a Player's Equipment Slots, regardless of
whether or not it is listed here.

### Covered Equipment Slots

- Spreadsheet label: **Covers Equip. Slots**
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.coveredEquipmentSlots`

This is a list of Equipment Slots that this Prefab will cover when it is equipped. When an Equipment Slot is covered by
another equipped Inventory Item, the single containing phrase of whatever Inventory Item is equipped to it will be
not appear in the `equipment` item list in the [Player's description](player.md#description). Only when the Player
unequips all Inventory Items whose Prefabs cover that Equipment Slot will the single containing phrase of that
Inventory Item appear in the Player description's `equipment` item list again.

### Commands String

- Spreadsheet label: **When Equipped / Unequipped**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.commandsString`

This is a comma-separated list of [bot commands](../commands/bot_commands.md) that will be executed when an Inventory
Item using this Prefab is equipped. A comma-separated list of bot commands that will be executed when the Inventory
Item is unequipped can also be included, with both sets separated by a forward slash (`/`). If no unequipped commands
are desired, then the forward slash can be omitted from the cell. If no equipped commands are desired, the forward
slash should be the first character in the cell, with the unequipped commands following it.

Note that when writing equipped and unequipped bot commands, the `player` argument will always refer to the Player the
Inventory Item belongs to.

### Equipped Commands

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.equippedCommands`

This is an internal attribute which contains a list of commands that will be executed when an Inventory Item using this
Prefab is equipped.

### Unequipped Commands

- Spreadsheet label: **When Equipped / Unequipped**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.unequippedCommands`

This is an internal attribute which contains a list of commands that will be executed when an Inventory Item using this
Prefab is unequipped.

### Inventory

- Spreadsheet label: **Contains Inventory Slots**
- Class
  attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Inventory Slot](inventory_slot.md)>
  `this.inventory`

This is a collection of [Inventory Slot](inventory_slot.md) objects that instances of this Prefab will have, where the
key is the Inventory Slot's ID. Room Items and Inventory Items with Inventory Slots are capable of containing other
Items of the same type (i.e. a Room Item can contain other Room Items,
and an Inventory Item can contain otherInventory Items).

In order to define an Inventory Slot for a Prefab, the ID of the Inventory Slot and its `capacity` should be given,
separated by a colon (`:`). For example, a Prefab with the ID "PANTS" might have two Inventory Slots, named "LEFT
POCKET" and "RIGHT POCKET", each with a `capacity` of 3. In this case, the cell for the "PANTS" Prefab's Inventory
Slots would be `LEFT POCKET: 3, RIGHT POCKET: 3`. There is no theoretical limit to the amount of Inventory Slots a
single Prefab can have.

The size of every Item placed into a single Inventory Slot is added to that Inventory Slot's `takenSpace` value. If the
quantity of that Item is higher than 1, its size will be multiplied by its quantity before being added. If inserting
an Item would cause the Inventory Slot's `takenSpace` value to exceed its `capacity`, it cannot be inserted into that
Inventory Slot. Additionally, every Item inserted adds its own weight to the Inventory Slot's weight. Lastly, the Item
itself will be inserted into the Inventory Slot's `items` array.

When Inventory Slots are initialized, their `takenSpace` and `weight` attributes are set to 0. Their items arrays are
initially empty. Prefab Inventory Slots will always retain this initialized state. That is, even if an Item contains
other Items in one of its Inventory Slots, the corresponding Inventory Slots of its associated Prefab will remain in
its initialized, empty state. **Prefabs cannot contain Items. The inventory attribute of Prefabs is merely a template
for _instances_ of those Prefabs to use so that _they_ can contain Items.**

### Preposition

- Spreadsheet label: **Preposition**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.preposition`

This attribute is similar to the [preposition attribute in the Fixture class](fixture.md#preposition). However, it does
not determine whether instances of this Prefab can contain Room Items/Inventory Items. That function is taken care of
by the `inventory` attribute of the Prefab. Otherwise, it functions the same. When a Player drops/stashes a
non-discreet Room Item/Inventory Item into an instance of this Prefab, Alter Ego will narrate them doing so using this
preposition. For example, if the player Seamus stashes an Inventory Item named MALLET into another Inventory Item named
GUITAR CASE whose Prefab has the preposition "in", Alter Ego will send "Seamus stashes a MALLET in his GUITAR CASE." to
the Room channel Seamus is currently in. If, however, Seamus drops the MALLET Inventory Item into a GUITAR CASE Item in
the Room, Alter Ego will send "Seamus puts a MALLET in the GUITAR CASE."

### Description

- Spreadsheet label: **Description**
- Class attribute: [Description](description.md) `this.description`

This is the description of the Prefab. When a Player inspects an instance of this Prefab, they will receive a parsed
version of this string. Any item lists in a Prefab's description _must_ be blank. Note that when a Player inspects an
Inventory Item that is equipped to one of another Player's Equipment Slots, all sentences containing item lists will be
removed from the description before it is parsed, effectively making it so that Players cannot see what is stashed in
that Inventory Item. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more
information.

### Procedural Options

- Class attribute: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>> `this.proceduralOptions`

This is an internal attribute which contains a map where all of the keys are the named `procedural` tags in the
Prefab's description, and the values are all of the named `poss` tags belonging to each one. For more information, see
the [procedural](../../moderator_guide/writing_descriptions.md#procedural) and
[poss](../../moderator_guide/writing_descriptions.md#poss) sections of the article on writing descriptions.

Procedural options can only affect Prefabs aesthetically. They cannot affect the Prefab's functionality. So, for
example, it is not possible to create procedural options that allow the Prefab to inflict or cure different Status
Effects, or alter what Equipment Slots it can be equipped to. Additionally, if a Prefab is usable as an ingredient in a
Recipe, or it is used as a requirement or solution to a Puzzle, or is otherwise referenced by other game entities, then
all instances of that Prefab, regardless of procedural options, will be treated the same.

So, for example, it is not possible to create a generic `KEY` Prefab that can be used to unlock specific `LOCKER`
Puzzles based on what procedural selections it was instantiated with. All instances of that `KEY` Prefab would be able
to solve every Puzzle in which it was listed as a requirement. In such a scenario, they would need to be made into
multiple entirely different Prefabs.

Procedural options _can_ be used to create Prefabs with different descriptions; that is their primary purpose. However,
they can also be used to create Prefabs with names and containing phrases that differ based on which procedural is
selected when it is instantiated as an Item. For more information on how to do this, see the sections on
[possible names](#possible-names) and [possible containing phrases](#possible-containing-phrases).

Because procedural options can only affect Prefabs aesthetically, their primary use case is to allow Items to be
created with small, minor variations, without making them entirely separate Prefabs. This is extremely useful in
reducing the size of the spreadsheet---especially when these Prefabs are used in Recipes.

To give an example, suppose there is a series of [crafting](recipe.md#crafting) Recipes that allow a Player to create
a sandwich consisting of one slice of cheese and/or one slice of meat. Because of the mechanics of crafting Recipes,
there must be a Prefab for every possible combination of cheese and meat. Assuming meat and cheese will always have the
same number of varieties, \\(n\\), then the number of Prefabs that would be needed to account for every possible
combination would be calculated with the formula:

\\[ n^2 + 2n \\]

And the number of crafting Recipes that would be required to create every variation (keeping in mind that ingredients
can be added in any order) would be calculated with the formula:

\\[ 2n^2 + 2n \\]

In effect, this means that in order to allow the Player to create sandwiches with one of 4 different kinds of meat
and/or one of 4 different kinds of cheese, 24 Prefabs and 40 Recipes would need to be created. In order to add just one
more kind of meat and one more kind of cheese would necessitate _35_ Prefabs and _60_ Recipes.

However, this can be avoided by creating just one `CHEESE` Prefab and one `MEAT` Prefab, with procedural options for
the different kinds. Then, only 3 Prefabs and 4 Recipes need to be created. And since procedural options are
significantly easier to add---it is as simple as adding a new tag in the Prefab's description---this also allows for
more varieties of meat and cheese than would be feasible if they were all separate Prefabs.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Prefab.
