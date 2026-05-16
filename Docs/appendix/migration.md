# Migration Guide

This document will explain the process of migrating your existing data when new versions of Alter Ego are released.

## Upgrading to 2.0.0

### Status Effect and Gesture Updates

Many Status Effects and Gestures have been updated. You can copy them from the demo environment.
If you don't want to use the `.setupdemo` command, you can find a copy
[here](https://docs.google.com/spreadsheets/d/1XcZvzLKv-KhmQT4ZEwb9CJjeEOnoWbLT4fqFsTIMjss/edit?usp=sharing).

### General Description Updates

While your spreadsheet should hopefully load just fine, the introduction of the script parser module means that many of
your descriptions are likely to be broken now. If you relied on arbitrary code execution in descriptions in the past,
some things may be impossible to do now.

Remember to use the [parse command](../reference/commands/moderator_commands.md#parse) to find errors in your
descriptions! It will help you find out what needs to be updated.

#### Item Lists

In version 2.0.0, [`il` tags](../moderator_guide/writing_descriptions.md#il) are now populated automatically whenever
the description they're in is parsed. If there are `item` tags in your descriptions as they are loaded, Alter Ego will
try to remove them every time it parses the description. However, it may not be able to do so perfectly every time.

> [!IMPORTANT]
> You should remove all `item` tags from your descriptions. Mentions of Fixtures and infinite items can stay, but
> existing `item` tags may cause item lists to be populated strangely.

#### Procedurals

Any existing Room Items or Inventory Items whose Prefabs have `procedural` tags in their descriptions will not be
considered to have any [procedural](../reference/data_structures/room_item.md#procedural-selections)
[selections](../reference/data_structures/inventory_item.md#procedural-selections). As such, they will not be carried
over when those items are transformed. If you would like to give them the procedural selections they should have, you
will need to manually add the selected named `procedural` and `poss` tags to the descriptions of those items.

#### Puzzle Descriptions

The text of the already solved description should be moved to the new unsolved description column for the following
Puzzle types:

- `toggle`
- `media`

#### New Default Player Description

With the release of version 2.0.0, a new default Player description has been included. It is as follows:

```xml
<desc><s>You examine <var v="this.displayName"/>.</s> <if cond="this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /> <if cond="this.pronouns.plural">are</if><if cond="!this.pronouns.plural">is</if> [HEIGHT], but <var v="this.pronouns.dpos" /> face is concealed.</s></if><if cond="!this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /><if cond="this.pronouns.plural">'re</if><if cond="!this.pronouns.plural">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s> <if cond="this.hasStatus('tired')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> bags under <var v="this.pronouns.dpos"/> eyes.</s></if><if cond="this.hasStatus('exhausted')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> dark bags under <var v="this.pronouns.dpos"/> eyes.</s> <s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> absolutely **exhausted**.</s></if><if cond="this.hasStatus('delirious')"><s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> completely **delirious**, like <var v="this.pronouns.sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if>n't slept in days.</s></if></if><br /><br /><s><var v="this.pronouns.Sbj" /> wear<if cond="!this.pronouns.plural">s</if> <il name="equipment"></il>.</s><if cond="this.getContainedItemsForItemList('equipment').length === 0"><s><var v="this.pronouns.Sbj" /> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> completely naked.</s></if> <s>You see <var v="this.pronouns.obj"/> carrying <il name="hands"></il>.</s> <if cond="this.hasStatus('stinky')"><s><var v="this.pronouns.Sbj"/>'<if cond="this.pronouns.plural">re</if><if cond="!this.pronouns.plural">s</if> a little stinky.</s></if><if cond="this.hasStatus('rancid')"><s><var v="this.pronouns.Sbj"/> smell<if cond="!this.pronouns.plural">s</if> absolutely **rancid**.</s></if> <if cond="this.hasStatus('soaking wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> soaking wet.</s></if><if cond="this.hasStatus('wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> a bit wet.</s></if></desc>
```

What every section does is detailed [here](../reference/data_structures/player.md#description). It is recommended you
update your Player descriptions to fit this template, but you are free to modify it as you see fit.

> [!IMPORTANT]
> Old Player descriptions used to use `container` in their `if` and `var` tags to refer to the Player. Every instance of
> `container` in Player descriptions should be replaced with `this`.

#### Inserting Descriptions into Descriptions

In the past, it was sufficient to insert descriptions into other descriptions by accessing the `.description`
(or similarly named) attribute. However, [Descriptions are now objects](../reference/data_structures/description.md).
As such, this is no longer possible. Now, you must use the
[`parseFor` method](../reference/data_structures/description.md#parsefor).

The following list contains several strings on the left side of the arrow (`->`) and what you should replace them with
on the right side of the arrow.

- `.description` -> `.description.parseFor(player)`
- `.correctDescription` -> `.correctDescription.parseFor(player)`
- `.alreadySolvedDescription` -> `.alreadySolvedDescription.parseFor(player)`

#### New Mirror Styles

The way mirrors reflect Player descriptions has changed, too. It used to be something like this:

```xml
<desc><s>You look at your reflection.</s> <var v="player.description.replace(/container./g, 'player.')" /></desc>
```

However, now it is recommended that you use something like this:

```xml
<desc><s>It's a mirror hung on the wall.</s> <s>You can see your reflection in it:</s><br /><s> >>> </s><var v="player.description.parseFor(player)" /></desc>
```

### Finder Module Calls

The finder module has been a core part of descriptions, and that remains the case. However, a few finder functions have
changed.

#### Renamed Data Types

With the release of 2.0.0, Objects have been renamed to [Fixtures](../reference/data_structures/fixture.md), and Items
have been renamed to [Room Items](../reference/data_structures/room_item.md). As such, you should make the
following replacements:

- `findObject` -> `findFixture`
- `findItem` -> `findRoomItem`

#### Updated Function Signatures

`findRoomItem` has had its function signature changed. It is now:

`findRoomItem('ITEM IDENTIFIER OR PREFAB ID', ('location-name'), (Type of Container: 'Fixture' || 'Puzzle' || 'RoomItem'), ('CONTAINER NAME(/INVENTORY SLOT ID)'))`

See the following example for how to update calls:

- `findItem('COMFORTER', this.location.name, 'Object: BED')` -> `findRoomItem('COMFORTER', this.location.id, 'Fixture', 'BED')`

### Deprecated Attributes

The following properties have been deprecated. They will be listed here along with their replacements:

- [`EquipmentSlot.name`](../reference/data_structures/equipment_slot.md#name) -> [`EquipmentSlot.id`](../reference/data_structures/equipment_slot.md#id)
- [`Event.name`](../reference/data_structures/event.md#name) -> [`Event.id`](../reference/data_structures/event.md#id)
- [`Gesture.name`](../reference/data_structures/gesture.md#name) -> [`Gesture.id`](../reference/data_structures/gesture.md#id)
- [`InventorySlot.name`](../reference/data_structures/inventory_slot.md#name) -> [`InventorySlot.id`](../reference/data_structures/inventory_slot.md#id)
- [`InventorySlot.item`](../reference/data_structures/inventory_slot.md#item) -> [`InventorySlot.items`](../reference/data_structures/inventory_slot.md#items)
- [`Player.talent`](../reference/data_structures/player.md#talent) -> [`Player.title`](../reference/data_structures/player.md#title)
- [`Player.defaultIntelligence`](../reference/data_structures/player.md#default-intelligence) -> [`Player.defaultPerception`](../reference/data_structures/player.md#default-perception)
- [`Player.intelligence`](../reference/data_structures/player.md#intelligence) -> [`Player.perception`](../reference/data_structures/player.md#perception)
- [`Player.statusString`](../reference/data_structures/player.md#status-string) -> [`Player.hasStatus`](../reference/data_structures/player.md#hasstatus)
- [`Player.hasAttribute`](../reference/data_structures/player.md#hasattribute) -> [`Player.hasBehaviorAttribute`](../reference/data_structures/player.md#hasbehaviorattribute)
- [`Prefab.verb`](../reference/data_structures/prefab.md#use-verb) ->
  [`Prefab.thirdPersonVerb`](../reference/data_structures/prefab.md#third-person-verb) or [`Prefab.secondPersonVerb`](../reference/data_structures/prefab.md#second-person-verb)
- [`Puzzle.parentObjectName`](../reference/data_structures/puzzle.md#parent-object-name) -> [`Puzzle.parentFixtureName`](../reference/data_structures/puzzle.md#parent-fixture-name)
- [`Puzzle.parentObject`](../reference/data_structures/puzzle.md#parent-object) -> [`Puzzle.parentFixture`](../reference/data_structures/puzzle.md#parent-fixture)
- [`Recipe.objectTag`](../reference/data_structures/recipe.md#object-tag) -> [`Recipe.fixtureTag`](../reference/data_structures/recipe.md#fixture-tag)
- [`Puzzle.parentObject`](../reference/data_structures/puzzle.md#parent-object) -> [`Puzzle.parentFixture`](../reference/data_structures/puzzle.md#parent-fixture)
- [`Room.name`](../reference/data_structures/room.md#name) ->
  [`Room.id`](../reference/data_structures/room.md#id) or [`Room.displayName`](../reference/data_structures/room.md#display-name)
- [`Room.exit`](../reference/data_structures/room.md#exit) -> [`Room.exits`](../reference/data_structures/room.md#exits)
- [`Status.name`](../reference/data_structures/status.md#name) -> [`Status.id`](../reference/data_structures/status.md#id)
- [`Status.attributes`](../reference/data_structures/status.md#attributes) -> [`Status.behaviorAttributes`](../reference/data_structures/status.md#behavior-attributes)

### Common Code Patterns

It is impossible to list all examples of code execution that were used in descriptions prior to 2.0.0. Here are some
common patterns, along with their suggested replacements.

---

```js
let prob = 8; const x = Math.floor(Math.random() * prob); x === 0
```

Should become:

```js
doWithChance(8) === true
```

---
```js
let prob = 500; if (player.statusString.includes('exhausted')) prob /= 50; if (player.statusString.includes('delirious')) prob /= 500; const x = Math.floor(Math.random() * prob); x === 0
```

Should become:

```js
player.hasStatus('delirious') || doWithChanceModifiedByPlayerStatus(500, player, 'exhausted', 50) === true
```

---

```js
game.items.filter(item => item.location.name === container.location.name && item.containerName === `Puzzle: ${container.name}` && !isNaN(item.quantity) && item.quantity > 0).reduce((total, item) => total + item.quantity * item.weight, 0)
```

Should become:

```js
this.childPuzzle.getContainedItemsWeight()
```

---

```js
this.exit[3].unlocked === true
```

Should become:

```js
this.getExit('FLOOR 2').unlocked === true
```

---

```js
const words = ['about','above','across']; words[Math.floor(Math.random() * words.length)]
```

Should become:

```js
getRandomString(['about','above','across'])
```

### Flags

With the introduction of [Flags](../reference/data_structures/flag.md), many common code patterns
in descriptions can be replaced with calls to the finder module's
[`findFlag` function](../moderator_guide/writing_descriptions.md#finder-conditionals).

### Edge Cases

When in doubt, check the [writing descriptions tutorial](../moderator_guide/writing_descriptions.md) to see if there's
a way to fix your descriptions while retaining the same functionality. All of the articles on
[data structures](../reference/data_structures/index.md) also detail their useful methods.
