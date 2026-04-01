# Inventory Slot

An **Inventory Slot** is a data structure in the Neo World Program.
It represents an inventory slot on a [Prefab](prefab.md), [Inventory Item](inventory_item.md), or [Room Item](room_item.md).

Inventory Slots are defined *entirely* within the **Contains Inventory Slots** column of a Spreadsheet.
They share a cell with all other Inventory Slots on the same Prefab, in the interest of saving space.
The syntax of an Inventory Slot cell on the spreadsheet is like so:
```csv
SLOT ID: CAPACITY, SLOT TWO: CAPACITY
```

## Attributes

Inventory Slots are the internal data structure used by Prefabs and Items to hold Items.
As such, most of their attributes serve this purpose.
Note that if an attribute is _internal_, that means it only exists within
the [Inventory Slot class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/InventorySlot.ts). Internal attributes will be given in
the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Contains Inventory Slots**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

> To aid in migrating from previous versions of Alter Ego, this attribute has an alias under `this.name`.
  This alias is deprecated, and will be removed in a future release of Alter Ego.

This is the ID of the Inventory Slot.
All letters should be capitalized, and spaces are allowed.
The ID of an Inventory Slot must be unique relative to other slots on the same Prefab.
This corresponds to the "SLOT ID" part of the **Contains Inventory Slots** column.

### Capacity

- Spreadsheet label: **Contains Inventory Slots**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.capacity`

This is the maximum capacity of the Inventory Slot.
It represents the maximum sum of sizes that can be stored in the slot.
This corresponds to the "CAPACITY" part of the **Contains Inventory Slots** column.

### Taken Space

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.takenSpace`

This is the currently occupied capacity of the Inventory Slot.
This will always be 0 on a Prefab.

### Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.weight`

This is the current combined weight of all items stored in the Inventory Slot.
This will always be 0 on a Prefab.

### Items

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[RoomItem](room_item.md) | [InventoryItem](inventory_item.md)>
  `this.items`

> This attribute used to be named `this.item` internally.
  To aid in migrating from previous versions of Alter Ego, that attribute remains a valid list, but will always be empty.
  That attribute is deprecated, and will be removed in a future release of Alter Ego.

This is the list of items currently stored in the Inventory Slot.
This will always be empty on a Prefab.