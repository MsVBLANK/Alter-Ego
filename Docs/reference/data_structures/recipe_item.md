# Recipe Item

A **Recipe Item** is a data structure used by Alter Ego. It represents an ingredient or product
[Prefab](prefab.md) in a [Recipe](recipe.md), with extra information to improve Recipe flexibility. It is unrelated to
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

This is the string representation of the Recipe Item, as entered on the spreadsheet. This follows the
"Recipe Item Syntax" of a Recipe's ingredients or products. The syntax follows a very flexible format which is
difficult to wholly demonstrate in a human-readable manner, so some examples are provided here:

- `PREFAB ID`
  - Where "Prefab ID" is any given Prefab ID.
- `1 PREFAB ID`
  - Where `1` can be any whole number representing the quantity of the given Item to consume or produce,
    regardless of the amount of times the Recipe can be satisfied by its actual ingredients.
- `1X PREFAB ID`
  - Where `1` can be any whole number, and `X` can be any uppercase basic Latin character, to represent the quantity of
    the given Item to consume or produce relative to the amount of times the Recipe can be satisfied.
  - Example: If a Recipe Item is given as `2X PREFAB ID`, then the Recipe will either consume or produce 2 instances of
    that Item for as many times as the Recipe is satisfied by its ingredients. So, if the Recipe can be satisfied by
    its ingredients 2 times in a single process, the given Item will be consumed 4 times if it is an ingredient, or it
    will be produced 4 times if it is a product.
- `PREFAB ID [1X]`
  - Where `1` can be any whole number, and `X` can be any uppercase basic Latin character, to represent the number of
    Item uses to consume or produce relative to the amount of times the Recipe can be satisfied.
  - Example: If a Recipe Item is given as `PREFAB ID [2X]`, then the Recipe will either decrease its uses by 2 or
    produce it with 2 uses for as many times as the Recipe is satisfied by its ingredients. So, if the Recipe can be
    satisfied by its ingredients 2 times in a single process, the given Item will have its uses decremented by 4 if it
    is an ingredient, or it will be produced with 4 uses if it is a product. This will override the number of default
    uses as defined by its Prefab.
- `PREFAB ONE (PREFAB TWO)`
  - Where `PREFAB ONE` can be any Prefab ID denoting a Prefab with exactly one [Inventory Slot](inventory_slot.md) that
    can contain Items, and `PREFAB TWO` can be any Prefab ID that can fit inside its container.
  - `PREFAB TWO` can also utilize the syntax for variable quantity or uses consumption, like so:
    - `PREFAB ONE (1X PREFAB TWO)`
    - `PREFAB ONE (PREFAB TWO [1X])`
- `PREFAB ONE (PREFAB TWO + PREFAB THREE)`
  - Where `PREFAB ONE` can be any Prefab ID denoting a Prefab that can contain Items, `PREFAB TWO` can be any
    Prefab ID that can fit inside its container, and `PREFAB THREE` is another Prefab ID that can fit inside its
    container.
  - There is no limit to how many Prefabs can be contained inside `PREFAB ONE`. It is only limited by the combined
    sizes of all of its contained Prefabs.
  - `PREFAB TWO` and `PREFAB THREE` can also utilize the syntax for variable quantity or uses consumption.


The "variable" of a Recipe Item, represented as X above, can be used to make ingredients and products related to each other in uses or quantity. Some examples and explanations of this behavior are as follows:

- `1 BLENDER CUP OF MILK (1X BANANA CHUNK)` ➡️ `1 BANANA MILKSHAKE [1X]`
  - This example is a processing-type Recipe, which produces one `BANANA MILKSHAKE` with as many uses as
    `BANANA CHUNKS` were inside the `BLENDER CUP OF MILK` ingredient.
- `1 OILED PAN (1X FIRM TOFU BITES + 1X GREEN BEANS + 1X CHOPPED BROCCOLI + 1X CHOPPED MUSHROOMS + 1X SLICED CARROTS)`
  ➡️ `1 PAN OF STIR FRIED VEGETABLES [2X]`
  - This example is a processing-type Recipe, which produces one `PAN OF STIR FRIED VEGETABLES` with as many uses as
    `FIRM TOFU BITES`, `GREEN BEANS`, `CHOPPED BROCCOLI`, `CHOPPED MUSHROOMS`, AND `SLICED CARROTS` were inside the
    `OILED PAN` ingredient.
  - It's important to note that any of the contained ingredients whose quantity exceeds the actual value of `X` when
    the Recipe is processed will be destroyed, because the container they were in was destroyed as part of the Recipe.
- `CLEAN TEAPOT (1X ENERGIZING TEA LEAVES), KETTLE FILLED WITH HOT WATER`
  ➡️ `TEAPOT OF ENERGIZING TEA [1X], KETTLE FILLED WITH HOT WATER`
  - This example is a crafting-type Recipe, which produces one `TEAPOT OF ENERGIZING TEA` with as many uses as
    `ENERGIZING TEA LEAVES` were inside the `CLEAN TEAPOT` ingredient.
  - Since the `KETTLE FILLED WITH HOT WATER` ingredient is also a product, its number of uses will be decreased by
    however many `ENERGIZING TEA LEAVES` were inside the `CLEAN TEAPOT` ingredient.

### Prefab ID

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.prefabId`

This is the ID of the Recipe Item's Prefab, as it was entered on the sheet.

### Prefab

- Class Attribute: [Prefab](prefab.md)
  `this.prefab`

This contains a reference to the actual Prefab object of the Recipe Item.

### Contained Items String

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.containedItemsString`

This is the list of contained Items as a plus-separated string. Each Item is itself in the Recipe Item format, with
the caveat that they cannot contain other Items.

### Contained Items

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe Item](recipe_item.md)>
  `this.containedItems`

This is an array of the actual Recipe Items contained inside of this Recipe Item. Each contained Item is guaranteed to
not contain another Item.

### Container

- Class Attribute: [Recipe Item](recipe_item.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.container`

This is the Recipe Item that contains this Recipe Item. If this Recipe Item is not contained in another one,
then this is `null`.

### Quantity

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.quantity`

This is the quantity of the Recipe Item to be consumed or produced. It is a whole number. Defaults to 1 if not given.

### Quantity Variable Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.quantityVariableName`

This is the variable name to use for the quantity of this Recipe Item when the Recipe it belongs to is carried out.
It must be either an empty string, or a single uppercase basic Latin character. Defaults to an empty string.

### Uses

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.uses`

This is the number of uses that will be consumed from the Recipe Item if it is an ingredient, or the number of uses it
will be produced with if it is a product.

### Uses Variable Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.usesVariableName`

This is the variable name to use for the number of uses when a Recipe using this Recipe Item is carried out. It must
be either an empty string, or a single uppercase basic Latin character. Defaults to an empty string.

### Quantity Is Constant

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.quantityIsConstant`

Whether or not the quantity of this Recipe Item is constant. In order to be a constant, a variable must not be given.
However, whether the quantity is determined to be constant depends on the type of Recipe this Item belongs to.

If the Recipe is a crafting-type Recipe, then the quantity will always be a constant if no variable is given. That is
to say, if a Recipe Item is given with the syntax `PREFAB ID` in a crafting Recipe, the quantity will be
considered a constant.

If the Recipe is a processing-type Recipe, then the quantity will only be a constant if a quantity was explicitly
provided without a variable. For example, if a Recipe Item is given with the syntax `PREFAB ID` in a processing Recipe,
then it will _not_ be considered constant even though no variable name was provided. In order for one to be considered
a constant, a quantity must be given with no variable, like so: `1 PREFAB ID`.

### Uses Is Constant

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.usesIsConstant`

Whether or not the uses of this Recipe Item is constant. This is determined in the exact same way as
`this.quantityIsConstant`, except it depends on the number of uses instead of the quantity.
