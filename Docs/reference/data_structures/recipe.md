# Recipe

A **Recipe** is a data structure used by Alter Ego. Its primary purpose is to allow [Players](player.md) to
transform [Room Items](room_item.md)
or [Inventory Items](inventory_item.md) into other Items using game-like crafting mechanics.

Recipes are static; once loaded from the [spreadsheet](index.md), they do not change in any way. Thus, the
[GameEntitySaver class](https://github.com/MolSnoo/Alter-Ego/blob/master/Classes/GameEntitySaver.ts) will never
make changes to the Recipes sheet. As a result, the Recipes sheet can be freely edited without
[edit mode](../../moderator_guide/edit_mode.md) being enabled.

This article will impose two terms:

* **Crafting** is the act of transforming two Recipe Items into up to two Recipe Items using the
  [craft](../commands/player_commands.md#craft) [command](../commands/moderator_commands.md#craft).
* **Processing** is the act of transforming one or more Recipe Items into zero or more Recipe Items using a
  [Fixture](fixture.md).

Every recipe is either a crafting-type Recipe or a processing-type Recipe, but not both.

## Attributes

Recipes have relatively few attributes. Their behavior is entirely static, incapable of changing. These attributes
simply serve to provide instructions for Alter Ego to follow. Note that if an attribute is _internal_, that means it
only exists within the [Recipe class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Recipe.ts). Internal
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

Note that the final rule does not prohibit a Recipe from requiring multiple instances of the same ingredient.

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
the [uncraft](../commands/player_commands.md#uncraft) [command](../commands/moderator_commands.md#uncraft) can be used
to convert the [product](recipe.md#products) into its [ingredients](recipe.md#ingredients). If this value is `false`,
then the Recipe cannot be reversed.

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

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.objectTag`

This internal attribute serves the same purpose as `this.fixtureTag`. It is still present to maintain compatibility
with legacy game data, but it will eventually be removed. References to this attribute in game data should be
replaced with `this.fixtureTag`.

### Duration

- Spreadsheet label: **Process Duration**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.durationString`

This is a string which determines how long the Recipe will take to process before it is completed. This can only be
given for processing-type Recipes. This should consist of a number (i.e. `30`, `1.5`) with a letter immediately
following it, with no space between them. There is a fixed set of predefined units that correspond with each letter.
They are as follows:

| Letter | Unit    |
| ------ | ------- |
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
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.productsStrings`

This is a comma-separated list of [Prefab IDs](prefab.md#id), in [Recipe Item format](#recipe-items).
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
than listing the same Prefab as a product multiple times. See the section on
[Recipe Item format](#recipe-items) for more information.

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
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.initiatedDescription`

This is a description that indicates when a Recipe has begun being processed. When a Player activates a Fixture that can
process this Recipe and all of the ingredients required for it are contained within the Fixture, they will receive a
parsed version of this string. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md)
for more information. Note that unlike most other data types, the `this` keyword does not refer to the Recipe, but
rather the Fixture processing the Recipe. For example, in the description
`<desc><s>You begin filling up the GLASS in the <var v="this.name" />.</s></desc>`, the variable `<var v="this.name" />`
would be replaced with the name of the Fixture processing the Recipe.

Crafting-type Recipes will never use this text because they are completed instantaneously.

### Completed Description

- Spreadsheet label: **Description When Completed**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.completedDescription`

This is a description that indicates when a Recipe has finished being processed. When a Player crafts two Inventory
Items together or a Fixture finishes processing a Recipe that they initiated by activating the Fixture and they are still
in the same Room as the Fixture, they will receive a parsed version of this string. Just like the initiated description,
the `this` keyword refers to the Fixture processing the Recipe. However, in crafting-type Recipes, the `this` keyword
does refer to the Recipe itself.

### Uncrafted Description

- Spreadsheet label: **Description When Uncrafted**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.uncraftedDescription`

When a Player uncrafts an Inventory Item, they will receive a parsed version of this string. Because uncraftable Recipes
cannot have a Fixture tag, the `this` keyword will always refer to the Recipe itself.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Recipe.

## Crafting

Crafting is a simple game mechanic that uses Recipes. It makes use of
the [craft Player method](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Data/Player.js#L1586).
Whether the action is initiated [by a Player](../commands/player_commands.md#craft)
or [by a moderator](../commands/moderator_commands.md#craft), the rules are the same:

- The Player must have [Equipment Slots](equipment_slot.md) named "RIGHT HAND" and "LEFT HAND".
- The Player must have two Inventory Items, one equipped to their RIGHT HAND and one equipped to their LEFT HAND.
- There must be a crafting-type Recipe whose ingredients are the Prefabs underlying the Player's two held Inventory
  Items.

If all of the above requirements are met, the Player will craft the two Inventory Items together.

First, Alter Ego checks to see if any of the ingredients are also products. If that is the case, it then checks if the
Inventory Item only has 1 use left. If so, the Inventory Item will be replaced with
its [next stage](prefab.md#next-stage). If it doesn't have a next stage, it will simply be destroyed. If the Inventory
Item has a limited number of uses but it has more than 1 use left, its number of uses will be decreased by 1.

As an example of the above condition, suppose there is a crafting-type Recipe whose ingredients are a CLEAN GLASS and a
JUG OF ORANGE JUICE, and whose products are a GLASS OF ORANGE JUICE and a JUG OF ORANGE JUICE. The JUG OF ORANGE JUICE
has 6 uses. Each time it is used to produce a GLASS OF ORANGE JUICE, its number of uses decreases by 1. If its number of
uses decreases to 0, then it will be replaced with its next stage, an EMPTY JUG OF ORANGE JUICE, at which point it can
no longer be crafted.

The respective Inventory Items will then
be [replaced](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Modules/itemManager.js#L126)
with the properties of the product Prefabs. When Inventory Items are replaced, any Inventory Items contained inside them
will be
recursively [destroyed](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Modules/itemManager.js#L163).
If there is only 1 product, then the second ingredient will simply be destroyed, and only the first ingredient will be
replaced. If there are 0 products, then both ingredients will be destroyed, and no products will be created.

Once the ingredients are finished being crafted, Alter Ego will send the Player the Recipe's completed description.
Additionally, if any of the product Prefabs are [non-discreet](prefab.md#discreet), Alter Ego
will [narrate](narration.md) the Player crafting them.

## Uncrafting

Uncrafting is a simplified reversal of the crafting mechanic. It makes use of
the [uncraft Player method](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Data/Player.js#L1644).
Whether the action is initiated by a Player or by a moderator, the rules are the same:

- The Player must have Equipment Slots named "RIGHT HAND" and "LEFT HAND".
- The Player must have one Inventory Item equipped to their RIGHT HAND or LEFT HAND.
- The Player's other hand must be empty.
- There must be a crafting-type Recipe whose only product is the Prefab underlying the Player held Inventory Item.

If all of the above requirements are met, the Player will uncraft their held Inventory Item.

First, Alter Ego checks the Recipe's ingredients to see if only one of them is discreet. If so, then the ingredient with
the discreet Prefab will be ingredient 1, and the non-discreet Prefab will be ingredient 2. If both are discreet or both
are non-discreet, ingredients 1 and 2 will be the ingredient Prefabs in alphabetical order by their IDs.

Next, the Player's held Inventory Item will be replaced with the properties of ingredient 1's Prefab, and any Inventory
Items contained inside of it will be recursively destroyed. The Prefab of ingredient 2 will then be instantiated in the
Player's free hand. Note that even if the original Inventory Item had a limited number of uses, both of the ingredients
will be created with the default number of uses of their respective Prefabs.

Alter Ego will then send the Player the Recipe's uncrafted description.

If either of the ingredients are non-discreet, Alter Ego will narrate the Player uncrafting them. If only one of them is
discreet, then the Narration will be as follows:

- `[Player displayName] removes [ingredient 1 singleContainingPhrase] from [ingredient 2 singleContainingPhrase].`

If both ingredients are non-discreet, then the Narration will instead be:

- `[Player displayName] separates [product singleContainingPhrase] into [ingredient 1 singleContainingPhrase] and [ingredient 2 singleContainingPhrase].`

## Processing

Processing is a complex game mechanic that uses Recipes. It makes use of
the [processRecipes Fixture method](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Data/Object.js#L96).

Recipes can be processed in a Fixture as long as that Fixture is [activated](fixture.md#activated) and has
a [Recipe tag](fixture.md#recipe-tag) that matches the Recipe's Fixture tag, regardless of how the Fixture was activated.
There are four ways a Fixture can be activated:

- By a Player using the [use player command](../commands/player_commands.md#use),
- By a moderator using the [object moderator command](../commands/moderator_commands.md#object),
- By a Puzzle or Event's solved/unsolved or triggered/ended commands using
  the [object bot command](../commands/bot_commands.md#object), or
- By being loaded from the spreadsheet with its activation state being set to `true`.

While a Fixture with a Recipe tag is activated, Alter Ego will attempt every second
to [find a Recipe](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Data/Object.js#L140)
that can be processed by the Fixture. In order to determine this, it looks for all Items contained in the Fixture, as well
as any Items contained inside those Items (recursively). Next, it checks all Recipes whose Fixture tag matches the
Fixture's Recipe tag. For each Recipe, it compares the list of Items contained within the Fixture (including child Items)
to the Recipe's ingredients list. If an exact match is found, it begins processing the Items. If the list of Items in
the Fixture does not exactly match any Recipe's ingredients list, Alter Ego collects a list of all Recipes whose
ingredients can all be found among the Fixture's Items. When it finishes, it chooses to process the Recipe that uses the
highest number of Items contained in the Fixture; i.e., the Recipe that will leave the fewest Items unprocessed.

If Alter Ego finds a Recipe that it can process using the Fixture, it will begin processing the Recipe. If the Fixture was
activated by a Player, whether forcibly or by their own will, they will be sent the Recipe's initiated description.
However, even if the Fixture was not activated by a Player for the current Recipe being processed, it will still be
processed. If a Recipe was already being processed and a different one that uses more of the Fixture's Items is found,
then it will be canceled in favor of the new one.

A Recipe being processed means that the [Fixture's process variable](fixture.md#process) has been assigned, and that Alter
Ego will decrement the process's duration by 1 every second. When the duration reaches 0, the Items
are [processed](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Data/Object.js#L208).

Alter Ego checks that all of the Items required for the Recipe are still contained in the Fixture. If it is, it then
checks to see if any of the ingredients are also products. If that is the case, it then checks if the Item only has 1
use left. If so, the Item will be replaced with its [next stage](prefab.md#next-stage). If the Item has a limited number
of uses but it has more than 1 use left, its number of uses will be decreased by 1. This follows the same logic as in
crafting-type Recipes.

If all of the Items are still in the Fixture, it destroys all of them regardless of quantity. So, even if a Recipe with
multiple ingredients only requires 1 of a certain ingredient, all copies of that ingredient will be destroyed. Items
contained inside of an ingredient will be recursively destroyed as well.

Then, all of the products are instantiated inside the Fixture. The only exception is that if an Item that is both an
ingredient and a product has a limited number of uses and would reach 0 uses and its Prefab does not have a next stage,
it will simply be destroyed.

If the Recipe being processed has only one ingredient and only one product, the quantity of the product will match the
quantity of the ingredient. This is why the use of cooking utensils in Recipes is discouraged. For example, if a Player
wants to cook 3 RAW EGG Items simultaneously using the same Fixture, they will be unable to do so if the Recipe also
includes a FRYING PAN as an ingredient. In such a scenario, only 1 COOKED EGG would be produced. However, if the only
ingredient is 1 RAW EGG and the only product is 1 COOKED EGG, then the Player can cook as many RAW EGG Items into an
equivalent number of COOKED EGG items in a single processing cycle.

Once Items are finished being processed, the Player who activated the Fixture and started the process will be sent the
Recipe's completed description, if it was a Player who did so and they are still in the same Room as the Fixture. If the
Fixture is set to automatically deactivate, it will be deactivated. If not, it will continue attempting to process
Recipes with the Items contained inside it, which may include the Items instantiated during the previous process.
