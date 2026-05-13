# Gesture

A **Gesture** is a data structure used by Alter Ego. It represents a form of body language that a
[Player](player.md) can perform to communicate with other Players nonverbally.

Gestures are static; once loaded from the spreadsheet, they do not change in any way. Thus, the
[GameEntitySaver class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Classes/GameEntitySaver.ts) will never make
changes to the Gestures sheet. As a result, the Gestures sheet can be freely edited
without [edit mode](../../moderator_guide/edit_mode.md) being enabled.

## Attributes

Gestures have very few attributes. Note that if an attribute is _internal_, that means it only exists within
the [Gesture class](https://github.com/MsVBLANK/Alter-Ego/blob/master/Data/Gesture.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Gesture ID**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is the unique ID of the Gesture. This is what a Player must input in order to perform this Gesture.
This should be given in all lowercase letters. Punctuation is allowed.

A Gesture cannot have the ID "list", as attempting to perform a Gesture with that ID
would instead bring up the list of all Gestures.

### Name

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.id` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This internal attribute is a copy of the Gesture's ID. It was how Gestures were identified prior to Alter Ego
version 2.0. This attribute will be removed in the future.

### Requires

- Spreadsheet label: **Requires Target**
- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.requires`

This is a comma-separated list of data types the Gesture can take as a target. Accepted data types are:

- [Exit](exit.md)
- [Fixture](fixture.md)
- [Room Item](room_item.md)
- [Player](player.md)
- [Inventory Item](inventory_item.md)

If this is not blank, then a Player who attempts to perform this Gesture must supply something in the [Room](room.md)
they're in of one of the accepted data types as a target. For example, if the Gesture requires a Fixture, then the
Player must give the name of a Fixture in the Room in order to perform this Gesture. If the Gesture requires a Room Item
or an Inventory Item, then the Player must give the name of a Room Item in the Room they're in or an Inventory Item in
their RIGHT HAND or LEFT HAND. If this is blank, then the Player can perform this Gesture without specifying a target.

### Disabled Statuses Strings

- Spreadsheet label: **Don't Allow If Player Is**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.disabledStatusesStrings`

This is a comma-separated list of [Status Effect](status.md) IDs that prevent this Gesture from being performed. If a
Player who is inflicted with any of the Status Effects listed here attempts to perform this Gesture,
they will be unable to do so.

Additionally, if the Player has any of these Status Effects, the Gesture will not appear in the list of Gestures
they can perform.

### Disabled Statuses

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Status](status.md)>
  `this.disabledStatuses`

This is an internal attribute which contains references to each of the Status Effect objects whose IDs are listed in
`this.disabledStatusesStrings`.

### Description

- Spreadsheet label: **Description In List**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.description`

This is a plain-text string that describes what the Player will do when they perform this Gesture. This appears in the
Gesture list. It does not use XML tags - it must be plain text. An ideal Gesture description should be in second person
and use as few words as possible.

### Narration

- Spreadsheet label: **Narration When Performed**
- Class attribute: [Description](description.md) `this.narration`

This is a Description that will be parsed and then [narrated](narration.md) in the Room that the Player is in
when this Gesture is performed. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md)
for more information.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Narration will be sent
using the [`PLAYER` message display type](../discord.md#display-components).

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Gesture.

### Target Type

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.targetType`

This is an internal attribute which is only assigned when a Gesture is instantiated in
a [Gesture Action](action.md#gesture-action). It indicates the data type of the Gesture's target.
This allows the Gesture's Narration to contain
[conditional formatting](../../moderator_guide/writing_descriptions.md#if) based on the data type of the target.

### Target

- Class attribute: [Exit](exit.md) | [Fixture](fixture.md) | [Room Item](room_item.md) | [Player](player.md) | [Inventory Item](inventory_item.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.target`

This is an internal attribute which is only assigned when a Gesture is instantiated in a Gesture Action. It
contains a reference to the target object. This allows the Gesture's Narration to
[make use of the target's class attributes](../../moderator_guide/writing_descriptions.md#var). For example, if a
Gesture requires a Fixture as a target, then the tag `<var v="this.target.name" />` can be used to insert
the [name](fixture.md#name) of the Fixture in the Narration; if a Gesture requires a Room Item or Inventory Item as a
target, then the tag `<var v="this.target.singleContainingPhrase" />` can be used to insert the
[single containing phrase](room_item.md#single-containing-phrase) of the Item in the Narration; and so on.
