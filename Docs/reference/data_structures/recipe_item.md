# Recipe Item

A **Recipe Item** is a data structure used by Alter Ego. It represents an ingredient or product
[Prefab](prefab.md) in a [Recipe](recipe.md), with extra information to improve recipe flexibility.

## Attributes

Recipe Items are the internal data structure representing ingredients and products, and their technical information,
in a Recipe. As such, most of their attributes serve this purpose. Note that if an attribute is _internal_, that
means it only exists within the [RecipeItem class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/RecipeItem.ts). Internal
attributes will be given in the "Class attribute" bullet point, preceded by their data type.

### Recipe Item String

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.recipeItemString`

This is the name of the Recipe Item, as entered on the spreadsheet.

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
