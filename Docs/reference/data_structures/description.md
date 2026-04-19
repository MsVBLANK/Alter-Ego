# Description

A **Description** is a data structure used by Alter Ego. It represents a description of an in-game entity or occurrence.
It is constructed from a string of text containing XML, which allows the text to change in dynamic ways to reflect the
ever-changing state of the game world.

Descriptions cannot be created directly, and they are not saved on the spreadsheet directly; only text renditions of
them are. Once a Description has been created, it cannot change. It can be written to appear as if it changes, but these
changes are all made possible and accounted for in the original Description. To change a Description, a new one must be
made based on a different string of text.

For information on how to write Descriptions, see the tutorial on
[writing descriptions](../../moderator_guide/writing_descriptions.md).

## Attributes

Descriptions have few attributes.

### Text

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
`this.text`

This is the text that the Description is based on. This is what is loaded from and saved to the spreadsheet. Once the
Description has been created, this cannot be changed.

### Document

- Class Attribute: [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document)
`this.document`

This is the Document object created from the text of the Description. When a Description is created, the text is passed
into the parser module, which reads the XML contained inside of it and creates this Document. This is the actual body
of the Description---it is what allows the Description to appear as if it is dynamic.

### Message Display Type

- Class Attribute: [Enum (number)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)

This is the [message display type](../../about/discord.md#display-components) that is set for the Description in the
opening `desc` tag. If no message display type was manually set, this is `undefined`.

### Procedurals

- Class Attribute: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>>

This is a map of procedurals contained inside of this Description. The key for
each entry is the name of the `procedural` tag, and the value is the set of names of all named `poss` tags within that
`procedural` tag. This is used to set a Prefab's [procedural options](prefab.md#procedural-options), as well as the
procedural selections of both [Room Items](room_item.md#procedural-selections) and
[Inventory Items](inventory_item.md#procedural-selections).

## Methods

Descriptions have a single function that can be useful to moderators. This is primarily only useful when writing
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### parseFor

```ts
this.parseFor(player, container?);
```

- Purpose: Parses the description for the given player. Returns the parsed description as a string. Useful for inserting
  parsed descriptions into other descriptions.
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters:
  - [Player](player.md) `player` - The player to parse the description for.
  - GameEntity `container` - The game entity to treat as the description's container. This is the description's actual
    container by default. There is generally no reason to select something else as the container.
