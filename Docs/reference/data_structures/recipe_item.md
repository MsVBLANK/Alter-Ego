# Recipe Item

A **Recipe Item** is a data structure used by Alter Ego. It represents an ingredient or product
[Prefab](prefab.md) in a [Recipe](recipe.md), with extra information to improve recipe flexibility. It is unrelated to
[Room Items](room_item.md) and [Inventory Items](inventory_item.md), instead defining the ways in which these Items
can be transformed via a Recipe.

Recipe Items were created to better articulate the added complexity of Recipes as reworked in Alter Ego 2.0. These
objects represent the necessary sheet data for Alter Ego to perform the transformations specified by a Recipe.

## Attributes

Recipe Items are the internal data structure representing ingredients and products, and their technical information,
in a Recipe. As such, all of their attributes serve this purpose, correlating to either the Ingredients column or
Products column of a Recipe row.

### Recipe Item String

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.recipeItemString`

This is the name of the Recipe Item, as entered on the spreadsheet. This follows the "Recipe Item Syntax" of a
Recipe's Products or Ingredients. The syntax follows a very flexible format which is a difficult format to wholly
demonstrate in a human-readable manner, so some examples are provided here:

* `PREFAB ID`
  * Where "Prefab ID" is any given Prefab ID, consumed or produced similarly to Prefabs in recipes before
  Alter Ego 2.0.
* `1 PREFAB ID`
  * Where `1` can be any whole number representing the quanity of Prefabs to consume or produce for the entire Recipe,
  regardless of the amount of times the Recipe can be satisfied.
* `1X PREFAB ID`
  * Where `1` can be any whole number, and `X` can be any uppercase basic Latin character, to represent the quanity
  of Prefabs to consume or produce relative to the amount of times the Recipe can be satisfied.
* `PREFAB ID [1X]`
  * Where `1` can be any whole number, and `X` can be any uppercase basic Latin character, to represent the number of
  Prefab uses to consume or produce relative to the amount of times the Recipe can be satisfied.
* `PREFAB ONE (PREFAB TWO)`
  * Where `PREFAB ONE` can be any Prefab ID denoting a Prefab that can contain items, and `PREFAB TWO` can be any
  Prefab ID that can fit inside its container.
  * Prefab Two can also utilize the syntax for variable quantity or uses consumption, like so:
  `PREFAB ONE (1X PREFAB TWO)`, `PREFAB ONE (PREFAB TWO [1X])`
* `PREFAB ONE (PREFAB TWO + PREFAB THREE)`
  * Where `PREFAB ONE` can be any Prefab ID denoting a Prefab that can contain items, `PREFAB TWO` can be any
  Prefab ID that can fit inside its container, and `PREFAB THREE` is another Prefab ID that can fit inside its
  container.

The "variable" of a Recipe Item, represented as X above, can be used to make ingredients and products related to each other in uses or quantity. Some examples and explanations of this behavior are as follows:

* `1 BLENDER CUP OF MILK (1X BANANA CHUNK)` ➡️ `1 BANANA MILKSHAKE [1X]`
  * This example is a Processing-type Recipe, which produces one BANANA MILKSHAKE with as many uses as BANANA CHUNKS
  were inside the BLENDER CUP OF MILK ingredient.

### Prefab ID

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.prefabId`

This is the associated Prefab ID of the Recipe Item.

### Prefab

- Class Attribute: [Prefab](prefab.md)
  `this.prefab`

This is the associated Prefab of the Recipe Item, as looked up via the Prefab ID entered on the spreadsheet.

### Contained Items String

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containedItemsString`

This is the list of contained items as a plus-separated string. Each item is itself in the Recipe Item format, with
the caveat that they cannot contain other items.

### Contained Items

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.containedItems`

This is the array representation of contained items as parsed Recipe Items. Each item is guaranteed to not contain
another item.

### Container

- Class Attribute: [Recipe Item](recipe_item.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.container`

This is the Recipe Item that contains this Recipe Item. If this Recipe Item is not contained in another, then this is
`null`.

### Quantity

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.quantity`

This is the quantity of the item to be used or created. Defaults to 1 if not given.

### Quantity Variable Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.quantityVariableName`

This is the variable name to use for the quantity of this item when processing the recipe. It must be either an empty
string, or a single basic Latin character. Defaults to an empty string.

### Uses

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.uses`

This is the number of uses the item requires or will be produced with.

### Uses Variable Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.usesVariableName`

This is the variable name to use for the uses of this item when processing the recipe. It must be either an empty
string, or a single basic Latin character. Defaults to an empty string.

### Quantity Is Constant

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.quantityIsConstant`

Whether or not the quantity of this recipe item is constant. If a quantity is given, but it is not accompanied by a
variable, it is assumed to be constant.

### Uses Is Constant

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.usesIsConstant`

Whether or not the uses of this recipe item is constant. If a number of uses is given, but it is not accompanied by a
variable, it is assumed to be constant.
