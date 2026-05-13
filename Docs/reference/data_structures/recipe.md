# Recipe

A **Recipe** is a data structure used by Alter Ego. Its primary purpose is to allow [Players](player.md) to
transform [Room Items](room_item.md)
or [Inventory Items](inventory_item.md) into other Items using game-like crafting mechanics.

Recipes are static; once loaded from the [spreadsheet](index.md), they do not change in any way. Thus, the
[GameEntitySaver class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Classes/GameEntitySaver.ts) will never
make changes to the Recipes sheet. As a result, the Recipes sheet can be freely edited without
[edit mode](../../moderator_guide/edit_mode.md) being enabled.

This article will impose two terms:

* **Crafting** is the act of transforming two Recipe Items into up to two Recipe Items in a
  [Craft Action](action.md#craft-action).
* **Processing** is the act of transforming one or more Recipe Items into zero or more Recipe Items using a
  [Fixture](fixture.md).

Every Recipe is either a crafting-type Recipe or a processing-type Recipe, but not both.

## Attributes

Recipes have relatively few attributes. Their behavior is entirely static, incapable of changing. These attributes
simply serve to provide instructions for Alter Ego to follow. Note that if an attribute is _internal_, that means it
only exists within the [Recipe class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Data/Recipe.ts). Internal
attributes will be given in the "Class attribute" bullet point, preceded by their data type. If an attribute is
_external_, it only exists on the spreadsheet. External attributes will be given in the "Spreadsheet label" bullet
point.

### Ingredients Strings

- Spreadsheet label: **Ingredient Prefab(s)**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.ingredientsStrings`

This is a comma-separated list of [Prefab IDs](prefab.md#id), in [Recipe Item format](recipe_item.md). Ingredients
determine what Room Items or Inventory Items are required for the Recipe. Multiple Recipes can have the same list
of ingredients.

Regardless of what order ingredients appear in on the sheet, they are stored in alphabetical order, sorted by
Prefab ID. Additionally, ingredients that are contained inside of another ingredient are not included. This list
includes only the top-level ingredients.

There are different sets of rules for ingredients, depending on the Recipe's type.

Crafting-type Recipes:

- Must have exactly two ingredients and
- Can have two of the same Prefab as ingredients.

Processing-type Recipes:

- Must have at least one ingredient,
- Can have infinitely many ingredients, and
- Must not have more than one of the same Prefab as ingredients.

Note that the final rule does not prohibit a Recipe from requiring multiple instances of the same ingredient. For more
information, see the article on [Recipe Items](recipe_item.md).

Additionally, both Recipe types must not include ingredients that are containers with more than one
[Inventory Slot](inventory_slot.md), or more than one container.

### Ingredients

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.ingredients`

This is an internal attribute which consists of a list of Recipe Item objects created from the list of
ingredients in `this.ingredientsStrings`. As with `this.ingredientsStrings`, they are stored in alphabetical
order, sorted by Prefab ID. Contained ingredients are not included. This list includes only the top-level
ingredients.

### Ingredients Flat

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.ingredientsFlat`

This is an internal attribute which consists of a list of Recipe Item objects. It contains all of the ingredients
in `this.ingredients`, but it also includes all ingredients contained inside of them, all listed in a flat array.
They are stored in alphabetical order, sorted by Prefab ID.

### Uncraftable

- Spreadsheet label: **Uncraftable?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.uncraftable`

This is a Boolean value indicating whether or not this Recipe can be reversed. If this is `true`, then
an [Uncraft Action](action.md#uncraft-action) can be performed to convert the [product](recipe.md#products) into its
[ingredients](recipe.md#ingredients). If this value is `false`, then the Recipe cannot be reversed.

Note that in order for a Recipe to be uncraftable, it must be a crafting-type Recipe with only one product.
Crafting-type Recipes with two products cannot be uncraftable.

### Fixture Tag

- Spreadsheet label: **Processed by Fixture With Tag**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.fixtureTag`

This is a simple phrase that determines which Fixtures can be used to process this Recipe, if any. There are no rules
for how Fixture tags must be named, but a single Recipe can only have one Fixture tag. The presence of a Fixture tag
determines the type of each Recipe. If a Fixture tag is given, it will be a processing-type Recipe. If no Fixture tag
is given, it will be a crafting-type Recipe.

The tag should match exactly the [Recipe tag](fixture.md#recipe-tag) of any Fixtures that can be used to process this
Recipe. For example, a Recipe with the Fixture tag "blender" can only be processed by a Fixture with the Recipe tag
"blender" when it is activated.

### Object Tag

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.fixtureTag` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.objectTag`

This internal attribute serves the same purpose as `this.fixtureTag`. It is still present to maintain compatibility
with legacy game data, but it will eventually be removed. References to this attribute in game data should be
replaced with `this.fixtureTag`.

### Duration String

- Spreadsheet label: **Process Duration**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.durationString`

This is a string which determines how long the Recipe will take to process before it is completed. This can only be
given for processing-type Recipes. This should consist of a number (i.e. `30`, `1.5`) with a letter immediately
following it, with no space between them. There is a fixed set of predefined units that correspond with each letter.
They are as follows:

| Letter | Unit    |
|--------|---------|
| s      | seconds |
| m      | minutes |
| h      | hours   |
| d      | days    |
| w      | weeks   |
| M      | months  |
| y      | years   |

So, a Recipe that should take 30 seconds to process should have a duration of `30s`, one that should take 15 minutes
should have a duration of `15m`, one that should take 2 hours should have a duration of `2h`, one that should take 1.5
days should have a duration of `1.5d`, and so on.

### Duration

- Class attribute: [Duration](https://moment.github.io/luxon/api-docs/index.html#duration) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) `this.duration`

This is an internal attribute which contains a Duration object created from the duration string. If the Recipe has no
duration string, this is `null`.

### Products Strings

- Spreadsheet label: **Produces Prefab(s)**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.productsStrings`

This is a comma-separated list of [Prefab IDs](prefab.md#id), in [Recipe Item format](recipe_item.md).
Products determine what the ingredients will be turned into upon completion of the Recipe.

Unlike ingredients, products are not sorted. They are listed in the order they appear in on the sheet.
However, products that are contained inside of another product are not included. This list
includes only the top-level products.

There are different sets of rules for products, depending on the Recipe's type.

Crafting-type Recipes:

- Must not have more than two products and
- Can have two of the same Prefab as products.

Processing-type Recipes:

- Can have any number of products and
- Can have multiple of the same Prefab as products.

Note that although processing-type Recipes with multiple of the same Prefab as ingredients are typically not
allowed, the same does not apply to products. A processing-type Recipe can produce as many of the same
Prefab as desired. However, it usually makes more sense to express this as a quantity of the product, rather
than listing the same Prefab as a product multiple times. See the article on [Recipe Items](recipe_item.md)
for more information.

Additionally, both Recipe types must not include products that are containers with more than one Inventory Slot,
or more than one container.

### Products

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.products`

This is an internal attribute which consists of a list of Recipe Item objects created from the list of
products in `this.productsStrings`. As with `this.productsStrings`, contained products are not included.
This list includes only the top-level products.

### Products Flat

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.productsFlat`

This is an internal attribute which consists of a list of Recipe Item objects. It contains all of the products
in `this.products`, but it also includes all products contained inside of them, all listed in a flat array.
Unlike `this.products`, they are stored in alphabetical order, sorted by Prefab ID.

### Initiated Description

- Spreadsheet label: **Description When Initiated**
- Class attribute: [Description](description.md) `this.initiatedDescription`

This is a description that indicates when a Recipe has begun being processed. When a Player activates a Fixture that can
process this Recipe and all of the ingredients required for it are contained within the Fixture, they will receive a
parsed version of this string. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md)
for more information.

Note that unlike most other game entities, the `this` keyword does not refer to the Recipe, but rather the Fixture
processing the Recipe. For example, in the description
`<desc><s>You begin filling up the GLASS in the <var v="this.name" />.</s></desc>`, the variable `<var v="this.name" />`
would be replaced with the name of the Fixture processing the Recipe. This also means that you can access the Fixture's
[process attribute](fixture.md#process), and the ingredients contained inside. However, keep in mind that doing so may
result in errors when the [parse command](../commands/moderator_commands.md#parse) is used, unless guards are
implemented to prevent accessing data that doesn't exist when the command is used.

Crafting-type Recipes will never use this text because they are completed instantaneously.

### Completed Description

- Spreadsheet label: **Description When Completed**
- Class attribute: [Description](description.md) `this.completedDescription`

This is a description that indicates when a Recipe has finished being processed. When a Player crafts two Inventory
Items together, or a Fixture finishes processing a Recipe that they initiated by activating the Fixture and they are still
in the same Room as the Fixture, they will receive a parsed version of this string. Just like the initiated description,
the `this` keyword refers to the Fixture processing the Recipe. However, in crafting-type Recipes, the `this` keyword
refers to the Recipe itself, and not the Player, as one might assume.

### Uncrafted Description

- Spreadsheet label: **Description When Uncrafted**
- Class attribute: [Description](description.md) `this.uncraftedDescription`

When a Player uncrafts an Inventory Item, they will receive a parsed version of this string. Because uncraftable
Recipes cannot have a Fixture tag, the `this` keyword will always refer to the Recipe itself.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Recipe.

## Mechanics

### Crafting

Crafting is a simple game mechanic that uses Recipes. It is performed via a [Craft Action](action.md#craft-action).
Whether the action is initiated [by a Player](../commands/player_commands.md#craft)
or [by a moderator](../commands/moderator_commands.md#craft), the rules are the same:

- The Player must have [Equipment Slots](equipment_slot.md) named "RIGHT HAND" and "LEFT HAND".
- The Player must have two Inventory Items, one equipped to their RIGHT HAND and one equipped to their LEFT HAND.
- There must be a crafting-type Recipe whose top-level ingredients are the Prefabs underlying the Player's two held
  Inventory Items.
  - If the Recipe requires a held Inventory Item to contain one or more Inventory Items inside of it, then the Player
    must have those Inventory Items stashed inside of it.
- The quantities and uses of the Player's Inventory Items must all satisfy those specified by the Recipe's ingredients
  at least once.

If all of the above requirements are met, the Player will craft the two Inventory Items together.
See [this section](#how-ingredients-become-products) for more details on how this happens.

Once the products have been created, Alter Ego will send the Player the Recipe's completed description.
Additionally, if any of the product Prefabs are [non-discreet](prefab.md#discreet), Alter Ego will
[narrate](narration.md) the Player crafting them.

### Uncrafting

Uncrafting is a simplified reversal of the crafting mechanic.
It is performed via an [Uncraft Action](action.md#uncraft-action). Whether the action is initiated
[by a Player](../commands/player_commands.md#uncraft) or [by a moderator](../commands/moderator_commands.md#uncraft),
the rules are the same:

- The Player must have Equipment Slots named "RIGHT HAND" and "LEFT HAND".
- The Player must have one Inventory Item equipped to their RIGHT HAND or LEFT HAND.
- The Player's other hand must be empty.
- There must be a crafting-type Recipe whose only product is the Prefab underlying the Player's held Inventory Item.

If all of the above requirements are met, the Player will uncraft their held Inventory Item.

First, Alter Ego checks the Recipe's ingredients to see if only one of them is discreet. If so, the ingredient with the
discreet Prefab will be ingredient 1, and the non-discreet Prefab will be ingredient 2. If both are discreet or both
are non-discreet, ingredients 1 and 2 will be the ingredient Prefabs in alphabetical order by their IDs.

Next, the Player's held Inventory Item will be replaced with the properties of ingredient 1's Prefab, and any Inventory
Items contained inside of it will be recursively destroyed. The Prefab of ingredient 2 will then be instantiated in the
Player's free hand. Note that even if the original Inventory Item had a limited number of uses, both of the ingredients
will be created with the default number of uses of their respective Prefabs. They will also both be created with the
original held Inventory Item's [procedural selections](inventory_item.md#procedural-selections).

Note that even if any of the Recipe's ingredients are required to contain Inventory Items inside of them, those
contained Items will _not_ be instantiated when the product is uncrafted.

Alter Ego will then send the Player the Recipe's uncrafted description.

If the product or either of the ingredients are non-discreet, Alter Ego will narrate the Player uncrafting them. If
only one of the ingredients is discreet, then the Narration will be as follows:

- `[Player displayName] removes [ingredient 1 singleContainingPhrase] from [ingredient 2 singleContainingPhrase].`

If both ingredients are non-discreet, then the Narration will instead be:

- `[Player displayName] separates [product singleContainingPhrase] into [ingredient 1 singleContainingPhrase] and [ingredient 2 singleContainingPhrase].`

### Processing

Processing is a complex game mechanic that uses Recipes.

Recipes can be processed in a Fixture as long as that Fixture is [activated](fixture.md#activated) and has a
[Recipe tag](fixture.md#recipe-tag) that matches the Recipe's Fixture tag, regardless of how the Fixture was activated.
There are four ways a Fixture can be activated:

- By a Player using the [use player command](../commands/player_commands.md#use),
- By a moderator using the [fixture moderator command](../commands/moderator_commands.md#fixture),
- By a game entity that can issue bot commands using the [fixture bot command](../commands/bot_commands.md#fixture), or
- By being loaded from the spreadsheet with its activation state being set to `true`.

While a Fixture with a Recipe tag is activated, Alter Ego will attempt every second to
[find a Recipe](fixture.md#recipe-interval) that can be processed by the Fixture. In order to determine this, it looks
for all Room Items contained in the Fixture, as well as any Room Items contained inside those Room Items (recursively).
Next, it checks all Recipes whose Fixture tag matches the Fixture's Recipe tag. For each Recipe, it compares the list
of Room Items contained within the Fixture (including child Room Items) to the Recipe's ingredients list. If an exact
match is found, it begins processing the Room Items. If the list of Room Items in the Fixture does not exactly match
any Recipe's ingredients list, Alter Ego collects a list of all Recipes whose ingredients can all be found among the
Fixture's contained Room Items. When it finishes, it chooses to process the Recipe that uses the highest number of
Room Items contained in the Fixture; i.e., the Recipe that will leave the fewest Room Items unprocessed.

If Alter Ego finds a Recipe that it can process using the Fixture, it will begin processing the Recipe. If the Fixture
was activated by a Player, whether forcibly or by their own will, they will be sent the Recipe's initiated description.
However, even if the Fixture was not activated by a Player for the current Recipe being processed, it will still be
processed. If a Recipe was already being processed and a different one that uses more of the Fixture's contained Room
Items is found, then it will be canceled in favor of the new one.

A Recipe being processed means that the [Fixture's process variable](fixture.md#process) has been assigned, and that Alter
Ego will decrement the process's duration by 1 every second. When the duration reaches 0, the Recipe is carried out
using the ingredients stored in the Fixture's process variable. See [this section](#how-ingredients-become-products)
for more details on how this happens.

Keep in mind that Recipe Items in processing-type Recipes that are not explicitly set with a constant quantity
are considered to have a variable quantity. This can be convenient for many Recipes. For example, consider this Recipe:

`RAW EGG` ➡️ `COOKED EGG`

Both the ingredient and product Recipe Items are considered to have variable quantities. This means that if the Fixture
contained 3 `RAW EGGS`, then it would produce 3 `COOKED EGGS`. On the other hand, if the Recipe was instead:

`RAW EGG, SPATULA` ➡️ `COOKED EGG, SPATULA`

Then the `SPATULA` ingredient and product would also have variable quantities, meaning that for every `RAW EGG` the
Fixture contained, it would also need to contain an equal number of `SPATULAS` in order for the Recipe to be processed.
In order to modify this Recipe such that the Fixture only needs to contain 1 `SPATULA` and any amount of `RAW EGGS`,
the ideal syntax would be:

`1X RAW EGG, 1 SPATULA` ➡️ `1X COOKED EGG, 1 SPATULA`

For more information, see the article on [Recipe Items](recipe_item.md).

Once Room Items are finished being processed, the Player who activated the Fixture and started the process will be sent
the Recipe's completed description, if it was a Player who did so and they are still alive and in the same Room as the
Fixture. If the Fixture is set to automatically deactivate, it will be deactivated. If not, it will continue attempting
to process Recipes with the Room Items contained inside of it, which may include the Room Items instantiated
at the end of the previous process.

### How Ingredients Become Products

First, Alter Ego prepares to carry out the Recipe. Before anything else, the actual Items being used as ingredients
are collated, including all of the Items contained inside of them. This means that all Items with the same
identifier (or Prefab ID), container type, container name, and procedural selections are considered the same Item, and
are grouped together. Their quantities and uses are all added together. This allows multiple instances of the same
Prefab to be considered the same ingredient, and makes it easier to determine which ones to consume when the Items are
transformed as part of the Recipe.

Then, it calculates how many times the Recipe can be carried out with the given quantities and uses of the collated
Items. This number is referred to as the **satisfactory process count**. It also creates a map of variable names
assigned to each of the Recipe's ingredients, and calculates the actual value of each variable using the quantity or
uses of the corresponding Inventory Item. It also combines the
[procedural selections](inventory_item.md#procedural-selections) of all of the ingredients. Even if any procedural
selections have clashing values, one procedural can only be assigned to one possibility. The selected possibility when
collisions occur will be the one belonging to the ingredient whose Prefab ID is sorted the latest alphabetically.

Once the preparations are complete, Alter Ego iterates through the collated Items. For each one, it checks to see if
the ingredient is also a product. If that is the case, it decreases the Inventory Item's uses by the satisfactory
process count. If its uses is decreased to 0, then it will be replaced with its [next stage](prefab.md#next-stage).
If it doesn't have a next stage, it will simply be destroyed. If the collated Items contain multiple of the same Item,
it will divide the consumed uses among them as evenly as possible---even splitting one off of the stack into a new Item
if necessary---in order to ensure that the total number of uses remaining is exactly what it should be. Likewise, it
will not destroy any more of the used ingredients than it needs to.

As a demonstration of the above condition, suppose there is a Recipe with the following ingredients and products:

`DIRTY PLATE, DETERGENT` ➡️ `CLEAN PLATE, DETERGENT`

Now suppose that there is a Fixture `SINK` containing `DETERGENT` with a quantity of 2, and 10 uses. When the Room
Items are collated, the `DETERGENT` is considered to have 20 uses in total. Here are three examples of what would
happen if various quantities of `DIRTY PLATES` are added to the `SINK`:
- If `DIRTY PLATE` has a quantity of 10, then when the ingredients are processed, the `SINK` will contain 10
  `CLEAN PLATES` and 2 `DETERGENTS` with 5 uses.
- If the `DIRTY PLATE` has a quantity of 11, then when the ingredients are processed, the `SINK` will contain 11
  `CLEAN PLATES`, 1 `DETERGENT` with 4 uses, and 1 `DETERGENT` with 5 uses (for a total of 9 uses).
- If the `DIRTY PLATE` has a quantity of 19, then when the ingredients are processed, the `SINK` will contain 19
  `CLEAN PLATES`, 1 `DETERGENT` with 1 use, and 1 `EMPTY DETERGENT` with no uses.

If an ingredient is _not_ also a product, then it is destroyed. This occurs in a similar manner to how an ingredient's
uses are decreased if it is an ingredient and a product. Alter Ego will destroy only as many instances as it is
required to according to the specifications of the Recipe, even if the ingredient is a collated Item comprised of
multiple Items with varying quantities. However, keep in mind that any Items contained inside of the ingredient Item
will also be destroyed when this occurs.

Once all of the ingredients have either been destroyed or had their uses decreased appropriately, the products are
instantiated. Alter Ego iterates through all of the products in the Recipe and instantiates them with the quantities
and uses specified by the Recipe. If the quantity and/or uses of an individual product are variable, then the number
will be multiplied by the satisfactory process count. For uses specifically, if the product has a variable number of
uses that was specified with a named variable, then the actual value of that variable will be multiplied by the
[Recipe Item's uses](recipe_item.md#uses) instead of the satisfactory process count. If a product is specified to
contain Items, then those Items will be instantiated inside of it after it is created.
