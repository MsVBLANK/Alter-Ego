# Recipe Item

A **Recipe Item** is a data structure in the Neo World Program. It represents an ingredient or product
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

