# Equipment Slot

> [!NOTE]
> Not to be confused with [Inventory Slots](inventory_slot.md).

An **Equipment Slot** is a data structure used by Alter Ego. It represents a part of a [Player's](player.md) body
that they can equip [Inventory Items](inventory_item.md) to.

Equipment Slots do not have a dedicated sheet on the spreadsheet. Rather, they are derived from data on the Inventory
Items sheet. If an Inventory Item has no [container name](inventory_item.md#container-name), then an Equipment Slot will
be created for it to be equipped to.

Equipment Slots are almost fully customizable. A single Player can have as many or as few Equipment Slots as desired,
and each Player can have a unique set of Equipment Slots. If
the [startgame](../commands/moderator_commands.md#startgame) or [addplayer](../commands/moderator_commands.md#addplayer)
commands are used, then all Players will have the [default inventory](../settings.md#default_inventory), but this can
be edited after the data is saved to the spreadsheet.

[Crafting](action.md#craft-action), as well as many interactions involving equipping and stashing, are currently
*hard-coded* to expect up to two "hand" slots: a `RIGHT HAND` and a `LEFT HAND`. There is currently no other way to
define hands for use in interactions involving hands. Players can be missing their `LEFT HAND`, but this will forbid
them from engaging in hand-crafting. `RIGHT HAND`s are expected to come before `LEFT HAND`s on the Inventory Items
sheet. Moderators may encounter erroneous behavior if they fail to conform to this expectation.

Equipment Slots can contain 0 or 1 Inventory Items.
To define an Equipment Slot without an Inventory Item, then the Prefab for this Equipment Slot should be `NULL`.

## Attributes

Equipment Slots have very few attributes.

### ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is the ID of the Equipment Slot, which is inherited from the [Equipment Slot](inventory_item.md#equipment-slot)
attribute of the Inventory Item equipped to it. All letters should be capitalized, and spaces are allowed.

### Name

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.id` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is a copy of the Equipment Slot's ID. It was how Equipment Slots were identified prior to Alter Ego version 2.0.
This attribute will be removed in the future.

### Equipped Item

- Class attribute: [Inventory Item](inventory_item.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) `this.equippedItem`

This is the Inventory Item currently equipped to this Equipment Slot. If the Inventory Item has a `NULL` Prefab ---
indicating that nothing is currently equipped, then this is `null`.

### Items

- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
  `this.items`

This is a list of Inventory Items that currently occupy this Equipment Slot. This includes the Inventory Item currently
equipped to it, any Inventory Items contained within it, any Inventory Items contained within those, and so on.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is the row number of the Inventory Item equipped to this Equipment Slot.

## Methods

Equipment Slots have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### containsNoItems

```ts
this.containsNoItems();
```

- Purpose: Returns true if the equipment slot contains no items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None
