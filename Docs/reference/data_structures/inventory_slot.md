# Inventory Slot

> [!NOTE]
> Not to be confused with [Equipment Slots](equipment_slot.md).

An **Inventory Slot** is a data structure used by Alter Ego. It represents an inventory slot belonging to a
[Room Item](room_item.md) or [Inventory Item](inventory_item.md) which can contain other Items, akin to pockets.

Inventory Slots are defined *entirely* within the **Contains Inventory Slots** column of the
[Prefabs](prefab.md#inventory) sheet. They share a cell with all other Inventory Slots belonging to the same Prefab,
in the interest of saving space. The syntax of an Inventory Slot cell on the spreadsheet is like so:

```csv
SLOT ONE: CAPACITY, SLOT TWO: CAPACITY(, SLOT N: CAPACITY)
```

## Attributes

Inventory Slots are the internal data structure used by Prefabs, Room Items, and Inventory Items to contain Items.
As such, most of their attributes serve this purpose.

### ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is the ID of the Inventory Slot. This is how it will be accessed and referred to, for both [Players](player.md)
and Moderators. All letters should be capitalized, and spaces are allowed. The ID of an Inventory Slot must be unique
relative to other slots belonging to the same Prefab.

This corresponds to the "SLOT ID" part of the **Contains Inventory Slots** column---that is, the part before the colon.

### Name

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is a copy of the Inventory Slot's ID. It was how Inventory Slots were identified prior to Alter Ego version 2.0.
This attribute will be removed in the future.

### Capacity

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.capacity`

This is the maximum capacity of the Inventory Slot.
It represents the maximum sum of [sizes](prefab.md#size) that can be stored in the slot. This corresponds to the
"CAPACITY" part of the **Contains Inventory Slots** column---that is, the part after the colon.

### Taken Space

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.takenSpace`

This is the current sum of sizes of Items stored inside of the Inventory Slot. When an Item is inserted into the
Inventory Slot, its size will be multiplied by its quantity, and added to this value.

This will always be 0 on a Prefab.

### Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.weight`

This is the current combined weight of all Items stored inside of the Inventory Slot. When an Item is inserted into the
Inventory Slot, its weight will be multiplied by its quantity, and added to this value.

This will always be 0 on a Prefab.

### Items

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[RoomItem](room_item.md) | [InventoryItem](inventory_item.md)>
  `this.items`

This is the list of Items currently stored inside of the Inventory Slot. Note that if the Inventory Slot belongs to a
Room Item, this array can only contain Room Items. Likewise, if it belongs to an Inventory Item, this can only contain
Inventory Items.

If this belongs to a Prefab, it will always be empty.

### Item

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[RoomItem](room_item.md) | [InventoryItem](inventory_item.md)>
  `this.item`

This was how Items were stored prior to Alter Ego 2.0. Now, it is always an empty array.
This attribute will be removed in the future.

## Methods

Inventory Slots have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### getContainedItems

```ts
this.getContainedItems();
```

- Purpose: Gets all of the items this inventory slot contains.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[RoomItem](room_item.md) | [InventoryItem](inventory_item.md)>
- Parameters: None

### containsNoItems

```ts
this.containsNoItems();
```

- Purpose: Returns true if this inventory slot contains no items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### getContainedItemsWeight

```ts
this.getContainedItemsWeight();
```

- Purpose: Gets the combined weight of all the items this inventory slot contains.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters: None

### capacityIsSmallerThan

```ts
this.capacityIsSmallerThan(item, quantity?);
```

- Purpose: Returns true if the inventory slot's capacity is smaller than the given item.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [RoomItem](room_item.md) | [InventoryItem](inventory_item.md) | [Prefab](prefab.md)
    `item` - The item to check for.
  - [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
    `quantity` - The quantity to multiply the item's size by. Defaults to 1.

### willBeOverFilledBy

```ts
this.willBeOverFilledBy(item, quantity?);
```

- Purpose: Returns true if the inventory slot will be over capacity if it takes the given item.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [RoomItem](room_item.md) | [InventoryItem](inventory_item.md) | [Prefab](prefab.md)
      `item` - The item to check for.
    - [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
      `quantity` - The quantity to multiply the item's size by. Defaults to 1.
