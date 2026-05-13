# Hiding Spot

A **Hiding Spot** is a data structure used by Alter Ego. It represents a place where Players can
[hide](action.md#hide-action) to evade detection.

It functions somewhat like a [Room](room.md) contained within a single [Fixture](fixture.md). It is its own space where
Players can speak and interact with each other, albeit in a very limited and temporary manner.

In a Hiding Spot, Players cannot interact with any Fixtures other than the one they are hidden in. They also cannot
interact with any [Room Items](room_item.md) except for those contained inside of the Fixture the Hiding Spot belongs to.

Hiding Spots do not have a dedicated sheet on the spreadsheet. Rather, they are derived from data on the Fixtures sheet.
If a Fixture has a hiding spot capacity greater than 0, a Hiding Spot will be created and assigned to it.

## Attributes

Hiding Spots have few attributes.

### Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is the name of the Hiding Spot. It matches the name of the Fixture it belongs to.

### Capacity

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.capacity`

This is the capacity of the Hiding Spot. It represents how many Players can hide in it at once. It is inherited from
the hiding spot capacity of the Fixture it belongs to.

### Occupants

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Player](player.md)>
  `this.occupants`

This is an array of all of the Players currently hidden in this Hiding Spot.

### Whisper

- Class attribute: [Whisper](whisper.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.whisper`

This is the Whisper currently associated with this Hiding Spot. All Hiding Spots have a Whisper when they are occupied.
This is so that their occupants can whisper to each other without being heard in the surrounding Room.

Whenever a Player who doesn't have the [`no sight` behavior attribute](status.md#no-sight) is added to the Hiding Spot,
the current Whisper is deleted, and a new one is created with the new list of occupants.

When the Whisper is deleted, it is set as `null`.

## Methods

Hiding Spots have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### getFixture

```ts
this.getFixture();
```

- Purpose: Gets the fixture this belongs to.
- Returns: [Fixture](fixture.md)
- Parameters: None.

### getLocation

```ts
this.getLocation();
```

- Purpose: Gets the room this hiding spot is in.
- Returns: [Room](room.md)
- Parameters: None.

### generateOccupantsString

```ts
this.generateOccupantsString(viewerHasNoSightBehaviorAttribute?);
```

- Purpose: Generates a string representing the occupants of the hiding spot.
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters:
  - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
    `viewerHasNoSightBehaviorAttribute` - Whether or not to return a vague list indicating the quantity of occupants.
    If this is `true`, returns the number of occupants followed by ` people` if there is more than 1 occupant,
    or `someone` if there is only 1. Defaults to `false`.
