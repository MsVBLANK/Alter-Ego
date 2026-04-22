# Action

An **Action** is a data structure used by Alter Ego. It represents an action that changes the game state in some way.
They are usually performed by [Players](player.md) in specific [Rooms](room.md), but this is not always the case.

Actions are fully transient. They are only intended to exist temporarily, so they are not saved to the spreadsheet.
Actions have a very short life; they are only persisted briefly in the
[communication handler's](game.md#communication-handler) Action cache, after which they disappear forever.

A single instance of an Action can only be performed once.
In order to perform that Action again, a new Action must be created.

It is not possible to create an Action by itself---it is an
[abstract base class](https://en.wikipedia.org/wiki/Class_(programming)#Abstract) with many derived classes that do
different things. Each derived class will be listed below, along with a general overview of its purpose and behavior.

## Attributes

All derived Action classes have these attributes.

### ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is a [unique ID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) that is automatically
generated when an Action is created. This allows it to be distinguished from all other Actions.

### Message

- Class attribute: [OmitPartialGroupDMChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/OmitPartialGroupDMChannel:TypeAlias)<[Message](https://discord.js.org/docs/packages/discord.js/14.25.1/Message:Class)> | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.message`

This is a reference to the Discord message which caused this Action to be created. This is usually the command that was
issued by a Player or Moderator. However, this is sometimes `undefined`. This can occur when the Action wasn't created
by a user-issued command. For example, [bot commands](../commands/bot_commands.md) always create Actions with an
`undefined` message, and Actions created by other Actions often create those Actions with an `undefined` message.

This is usually used when an Action cannot proceed because of an error. If the Action was created with a message,
Alter Ego will reply to the message to indicate why it couldn't be executed successfully.

### Player

- Class attribute: [Player](player.md) | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.player`

This is the Player performing the Action. However, this is sometimes `undefined`, as not all Actions are performed by
Players. Typically, if an Action was created by another Action, the original Player is passed along to the new Action.

### Location

- Class attribute: [Room](room.md) | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.location`

This is the Room that the Action is being performed in. Usually, if a Player is performing the Action, this is that
Player's [location](player.md#location). However, this is sometimes `undefined`, as not all Actions are performed in
specific Rooms.

### Forced

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.forced`

This is a Boolean value which indicates whether or not the Action is being performed forcibly. This usually means that
a Player is being forced to perform the Action by a [Moderator command](../commands/moderator_commands.md), or by a
[bot command](../commands/bot_commands.md). This is used by the [log handler](game.md#log-handler) to indicate that a
Player did not perform an Action of their own volition. However, near-universally, any Action which is created by a
moderator command or bot command is considered to have been forced.

### Whisper

- Class attribute: [Whisper](whisper.md) | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.whisper`

This is the Whisper associated with the Action, if there is one. This is used in [Narrations](narration.md).
If no Whisper is associated with the Action, this is `undefined`.

### User

- Class attribute: [Player](player.md) | [Moderator](game.md#moderators) | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.user`

This is the user who caused the Action to be created. If the Action was created by a Moderator command, the user is the
Moderator who issued the command. Otherwise, the user is the Player performing the Action.

### Success Message

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.successMessage`

This is a message indicating that the Action was performed successfully. Currently, this is automatically generated
when the Action is finished being performed successfully. Currently, this is only used by Moderator commands.

## Types of Actions

### Activate Action

An **Activate Action** [activates a Fixture](fixture.md#activated). It is performed when the
[fixture](../commands/moderator_commands.md#fixture) [command](../commands/bot_commands.md#fixture) or
[use command](../commands/player_commands.md#use) is used.

### Announce Action

An **Announce Action** is performed when a Player with the [Free Movement role](../settings.md#free_movement_role)
speaks in the [announcement channel](../settings.md#announcement_channel).

### Attempt Action

An **Attempt Action** attempts to solve a [Puzzle](puzzle.md). It is always performed by a Player. It is performed when
the [puzzle](../commands/moderator_commands.md#puzzle) [command](../commands/bot_commands.md#puzzle) or
[use command](../commands/player_commands.md#use) is used. It is also performed when:

- A Dress Action or Take Action is performed on a [`take`-](puzzle.md#take), [`weight`-](puzzle.md#weight), or
  [`container`-type](puzzle.md#container) Puzzle, or
- A Drop Action or Undress Action is performed on a [`drop`-](puzzle.md#drop), `weight`-, or `container`-type Puzzle.

### Craft Action

A **Craft Action** [crafts](recipe.md#crafting) two [Inventory Items](inventory_item.md) together. It is performed when
the [craft](../commands/player_commands.md#craft) [command](../commands/moderator_commands.md#craft) is used.

### Cure Action

A **Cure Action** cures a Player of a given [Status Effect](status.md). It is performed when the
[status](../commands/moderator_commands.md#status) [command](../commands/bot_commands.md#status) is used, and it is
performed to specifically cure the "asleep" Status Effect when the [wake command](../commands/player_commands.md#wake)
is used. It is also performed when:

- A Status inflicted on a Player with a [duration](status.md#duration-string) expires
  and isn't [fatal](status.md#fatal),
- A Player is inflicted with a Status Effect that they already have, which is supposed to be replaced with its
  [duplicated Status](status.md#duplicated-status-id)---the original Status is cured before the duplicated Status is
  inflicted,
- A Player is inflicted with a Status that [cures](status.md#cures-strings) one or more Status Effects,
- A Player performs an [Unhide Action](#unhide-action)---the "hidden" Status is cured,
- A Player is inflicted with a Status with a [next stage](status.md#next-stage-id)---the next stage is cured before it
  it is inflicted (if it already exists), or
- A Player performs a [Use Action](#use-action) with an Inventory Item that
  [cures](prefab.md#cures-strings) one or more Status Effects.

### Deactivate Action

A **Deactivate Action** [deactivates a Fixture](fixture.md#activated). It is performed when the
[fixture](../commands/moderator_commands.md#fixture) [command](../commands/bot_commands.md#fixture) or
[use command](../commands/player_commands.md#use) is used. It is also performed when a Fixture's
[process timer](fixture.md#process) expires, but only if the Fixture is set to
[deactivate automatically](fixture.md#automatically-deactivated).

### Destroy Inventory Item Action

A **Destroy Inventory Item Action** destroys an [Inventory Item](inventory_item.md). If the Inventory Item was
[equipped](equipment_slot.md#equipped-item), it is destroyed completely, and replaced with a `null` Inventory Item.
Otherwise, its quantity is set to 0, and it is removed from its container. Usually, all of the child Inventory Items are
recursively destroyed as well. A Destroy Inventory Item Action is performed when the
[destroy](../commands/moderator_commands.md#destroy) [command](../commands/bot_commands.md#destroy) is used.
It is also performed on a Recipe's ingredients when they are crafted.

### Destroy Room Item Action

A **Destroy Room Item Action** destroys a [Room Item](room_item.md). This means that its quantity is set to 0. If its
container is another Room Item, it is removed from its container. Usually all of the child Room Items are recursively
destroyed as well. A Destroy Room Item Action is performed when the
[destroy](../commands/moderator_commands.md#destroy) [command](../commands/bot_commands.md#destroy) is used.
It is also performed on a Recipe's ingredients when they are [processed](recipe.md#processing), and when a Room Item's
[uses](room_item.md#uses) are decreased to 0.

### Die Action

> [!NOTE]
> Not to be confused with [Die](die.md), an unrelated transient data structure.

A **Die Action** [kills](player.md#alive) a Player. It is performed when the
[kill](../commands/moderator_commands.md#kill) [command](../commands/bot_commands.md#kill) is used. It is also performed
when a [fatal Status](status.md#fatal) inflicted on a Player expires.

### Dress Action

A **Dress Action** takes all [equippable](prefab.md#equippable) Room Items from a specified container and equips them
to the Player's [Equipment Slots](equipment_slot.md). It is performed when the
[dress](../commands/player_commands.md#dress) [command](../commands/moderator_commands.md#dress) is used.

### Drop Action

A **Drop Action** removes an Inventory Item in one of the Player's [hands](equipment_slot.md), converts it to a
[Room Item](room_item.md), and puts it in the specified [container](room_item.md#container). It is performed when
the [drop](../commands/player_commands.md#drop) [command](../commands/moderator_commands.md#drop) is used.

### End Action


### Enter Action


### Equip Action


### Exit Action


### Find Action


### Gesture Action


### Give Action


### Help Action


### Hide Action


### Inflict Action


### Inspect Action


### Instantiate Inventory Item Action


### Instantiate Room Item Action


### Inventory Action


### Knock Action


### Lock Action


### Monolog Action


### Move Action


### Narrate Action


### QueueMove Action


### Recipes Action


### Say Action


### Solve Action


### StartMove Action


### Stash Action


### Steal Action


### Stop Action


### Take Action


### Text Action


### Trigger Action


### Uncraft Action


### Undress Action


### Unequip Action


### Unhide Action


### Unlock Action


### Unsolve Action


### Unstash Action


### Use Action


### View Action


### Whisper Action

