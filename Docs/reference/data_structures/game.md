# Game

A **Game** is a data structure used by Alter Ego. It contains all of the data associated with the game that Alter Ego
facilitates. Alter Ego can only ever manage one Game at a time. The singular Game object it manages is created on boot,
but until [data](index.md) is loaded from the spreadsheet, it is largely empty.

## Attributes

The Game object is not accessible in [descriptions](../../moderator_guide/writing_descriptions.md#if) or in
[Flag value scripts](flag.md#value-script). As such, most the attributes listed in this article are not directly
accessible either. However, a general overview will still be given here, as it can be useful to know how data is
structured in the Game class.

### Guild Context

- Class attribute: GuildContext `this.guildContext`

This is a class which contains a reference to the
[Guild](https://discord.js.org/docs/packages/discord.js/14.25.1/Guild:Class) in which the Game is occurring,
as well as all of the parts of it that are relevant to Alter Ego. This includes all of the
[Roles](../settings.md#role-ids) and [Channels](../settings.md#category-and-channel-ids) Alter Ego uses.

### Bot Context

- Class attribute: BotContext `this.botContext`

This is a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern) class which contains a reference to Alter Ego's
[Client](https://discord.js.org/docs/packages/discord.js/14.25.1/Client:Class), and a number of attributes and functions
that help it interface with [Discord](../discord.md).
For example, this is where all of its [commands](../commands/index.md) are stored.

### Settings

- Class attribute: GameSettings `this.settings`

This is an object which contains all of Alter Ego's [settings](../settings.md).

### Constants

- Class attribute: GameConstants `this.constants`

This is a singleton object which contains a number of constant values that are used to refer to cell ranges on the
spreadsheet. These are used during saving and loading.

### Communication Handler

- Class attribute: GameCommunicationHandler `this.communicationHandler`

This class acts as an interface for Alter Ego's
[message handler module](https://github.com/MsVBLANK/Alter-Ego/blob/master/Modules/messageHandler.js).
Instead of calling message handler functions directly, it is best to call the communication handler. It contains an
internal cache of recently-performed [Actions](action.md) to ensure that only one message describing a given Action
will be sent to each relevant channel, preventing redundant [Narrations](narration.md) and
[Notifications](notification.md). It also caches mirrors of dialog sent in
[spectate channels](player.md#spectate-channel), so that if the original message is edited or deleted, its mirrors will
be edited or deleted accordingly.

### Entity Finder

- Class attribute: GameEntityFinder `this.entityFinder`

This class acts as a search tool to retrieve [Game Entities](persistent.md). It has a variety of functions, and allows
Game Entities to be found using various combinations of criteria. Internally, the
[finder module](../../moderator_guide/writing_descriptions.md#finder-conditionals) is merely an interface
for the Game's entity finder.

### Entity Loader

- Class attribute: GameEntityLoader `this.entityLoader`

This class has numerous functions to load Game Entities from the spreadsheet, and to check for errors in each one.
This is what the [load command](../commands/moderator_commands.md#load) calls whenever it is used.

### Entity Saver

- Class attribute: GameEntitySaver `this.entitySaver`

This class has functions to save Game entities to the spreadsheet. It writes the entire state of the Game to the
spreadsheet in a format that can be loaded by the entity loader. It is automatically called periodically based on the
value of the [`AUTOSAVE_INTERVAL` setting](../settings.md#autosave_interval), but it can also be called by enabling
[edit mode](../../moderator_guide/edit_mode.md) or using the [save command](../commands/moderator_commands.md#save).

### Log Handler

- Class attribute: GameLogHandler `this.logHandler`

This class has functions to send messages to the [log channel](../settings.md#log_channel). Most Actions have a
corresponding log function.

### Notification Generator

- Class attribute: GameNotificationGenerator `this.notificationGenerator`

This class has numerous functions to generate the text of Notifications and Narrations. Most Actions have at least one
corresponding notification generator function.

### Narration Handler

- Class attribute: GameNarrationHandler `this.narrationHandler`

This class has numerous functions to send Narrations and Notifications. It is the only place where Narration and
Notification objects are created. Most Actions have at least one corresponding narration handler function. The Action
associated with each Narration and Notification is passed when calling each function, and this is eventually accessed by
the communication handler.

### In Progress

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.inProgress`

This Boolean value indicates whether the Game is currently in progress or not. When the Game is initially created on
boot, this is `false`. It is set to `true` when the [startgame command](../commands/moderator_commands.md#startgame) is
used, and then set as `false` again once the end timer expires. It is also set as `true` when the load command is used
with the `all start` or `all resume` arguments. When the
[endgame command](../commands/moderator_commands.md#endgame) is used, it is once again set as `false`.

Many commands cannot be used when this is `false`. For example, most [Player commands](../commands/player_commands.md)
cannot be used if the Game is not in progress.

### Can Join

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.canJoin`

This Boolean value is only relevant for use with the startgame command. It is set as `true` when the command is issued,
and it remains `true` until the end timer expires. At all other times, it is `false`. If it is `true`, then members with
the [Eligible role](../settings.md#eligible_role) can use the [play command](../commands/eligible_commands.md#play)
to voluntarily join the current Game.

### Half Timer

- Class attribute: [Timeout](https://nodejs.org/api/timers.html#class-timeout) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.halfTimer`

This is a timer which is used by the startgame command. It expires when half of the given duration has elapsed. When
this expires, Alter Ego will send a message to the [general channel](../settings.md#general_channel) warning Eligible
members that their time to use the play command is running out.

### End Timer

- Class attribute: [Timeout](https://nodejs.org/api/timers.html#class-timeout) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.endTimer`

This is a timer which is used by the startgame command. It expires when the length of time given in the command has
elapsed. When this occurs, the play command can no longer be used, and Alter Ego will save the generated default Player
data to the spreadsheet.

### Heated

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.heated`

This Boolean value indicates whether there is a heated situation occurring---a situation in which a Moderator is busy
coordinating a combat encounter between two or more Players. If any Player has the "heated" Status Effect,
this is `true`, and most in-game timers are affected by the
[HEATED_SLOWDOWN_RATE setting](../settings.md#heated_slowdown_rate).

### Edit Mode

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.editMode`

This Boolean value indicates whether [edit mode](../../moderator_guide/edit_mode.md) is currently activated.

### Loaded Entities With Errors

- Class attribute: [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.loadedEntitiesWithErrors`

This is a set of categories of Game Entities that have errors in their loaded data. If the entity loader finds errors
with any loaded Game Entities, it adds that category to this set; conversely, if these errors are fixed, it removes that
category from this set. Edit mode can only be disabled if this set is empty; this prevents gameplay from occurring if
there are errors in any of the Game's data.

### Rooms

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Room](room.md)>
  `this.rooms`

This is a collection of all Rooms loaded into the Game, keyed by [ID](room.md#id). As collections are an extension of
[Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), this means Rooms have
a constant lookup time of [\\(O(1)\\)](https://en.wikipedia.org/wiki/Big_O_notation). This effectively means that Rooms
can be looked up by ID repeatedly without incurring a significant performance cost.

### Fixtures

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Fixture](fixture.md)>
  `this.fixtures`

This is an array of all Fixtures loaded into the Game, in the same order as on the spreadsheet. As Fixtures don't have
a unique ID, this means that they have a linear lookup time of \\(O(n)\\). This means that the more Fixtures there are,
the higher the cost is of looking them up repeatedly. If a Fixture needs to be looked up repeatedly, it is best to
create a Flag with a value script to compute the desired property, and evaluate it as-needed.

### Objects

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.fixtures` instead.

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Fixture](fixture.md)>
  `this.objects`

This array is where Objects were stored prior to being renamed to Fixtures in Alter Ego 2.0. This is always an empty
array, and it will be removed in a future release.

### Prefabs

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Prefab](prefab.md)>
  `this.prefabs`

This is a collection of all Prefabs loaded into the Game, keyed by [ID](prefab.md#id). They have a constant lookup time
of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring a significant performance cost.

### Recipes

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Recipe](recipe.md)>
  `this.recipes`

This is an array of all Recipes loaded into the Game, in the same order as on the spreadsheet. They have a linear
lookup time of \\(O(n)\\). If a Recipe needs to be looked up repeatedly, it is best to create a Flag with a
value script to compute the desired property, and evaluate it as-needed.

### Room Items

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
  `this.roomItems`

This is an array of all Room Items loaded into the Game, in the same order as on the spreadsheet. They have a linear
lookup time of \\(O(n)\\). If a Room Item needs to be looked up repeatedly, it is best to create a Flag with a
value script to compute the desired property, and evaluate it as-needed.

### Items

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.roomItems` instead.

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
  `this.items`

This array is where Items were stored prior to being renamed to Room Items in Alter Ego 2.0. This is always an empty
array, and it will be removed in a future release.

### Puzzles

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Puzzle](puzzle.md)>
  `this.puzzles`

This is an array of all Puzzles loaded into the Game, in the same order as on the spreadsheet. They have a linear
lookup time of \\(O(n)\\). If a Puzzle needs to be looked up repeatedly, it is best to create a Flag with a
value script to compute the desired property, and evaluate it as-needed.

### Events

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Event](event.md)>
  `this.events`

This is a collection of all Events loaded into the Game, keyed by [ID](event.md#id). They have a constant lookup time
of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring a significant performance cost.

### Status Effects

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Status](status.md)>
  `this.statusEffects`

This is a collection of all Status Effects loaded into the Game, keyed by [ID](status.md#id). They have a constant
lookup time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost.

### Players

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Player](player.md)>
  `this.players`

This is a collection of all Players loaded into the Game, keyed by [name](player.md#name). They have a constant lookup
time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost. However, keep in mind that the key is a copy of the Player's name converted to all
uppercase, with all quotation characters removed. So, it may not match what their actual name is exactly.

### Living Players

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Player](player.md)>
  `this.livingPlayers`

This is a collection of all [living](player.md#alive) Players loaded into the Game, keyed by name. They have a constant
lookup time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost. However, keep in mind that the key is a copy of the Player's name converted to all
uppercase, with all quotation characters removed. So, it may not match what their actual name is exactly.

When a Player dies, they are removed from this collection.

### Dead Players

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Player](player.md)>
  `this.deadPlayers`

This is a collection of all dead Players loaded into the Game, keyed by name. They have a constant lookup time of
\\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost. However, keep in mind that the key is a copy of the Player's name converted to all
uppercase, with all quotation characters removed. So, it may not match what their actual name is exactly.

When a Player dies, they are added to this collection.

### Inventory Items

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
  `this.inventoryItems`

This is an array of all Inventory Items loaded into the Game, in the same order as on the spreadsheet. They have a
linear lookup time of \\(O(n)\\). If an Inventory Item needs to be looked up repeatedly, it is best to create a Flag
with a value script to compute the desired property, and evaluate it as-needed.

### Gestures

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Gesture](gesture.md)>
  `this.gestures`

This is a collection of all Gestures loaded into the Game, keyed by [ID](gesture.md#id). They have a constant
lookup time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost.

### Flags

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Flag](flag.md)>
  `this.flags`

This is a collection of all Flags loaded into the Game, keyed by [ID](flag.md#id). They have a constant
lookup time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost.

### Whispers

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Whisper](whisper.md)>
  `this.whispers`

This is a collection of all Whispers that currently exist in the game, keyed by [ID](whisper.md#id). They have a
constant lookup time of \\(O(1)\\), meaning that they can be looked up by ID repeatedly without incurring
a significant performance cost.

When a Whisper is created, it is added to this collection. When it is deleted, it is removed. Whispers are not saved to
the spreadsheet, so when Alter Ego is rebooted, all data pertaining to Whispers is irrevocably lost.

### Moderators

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), Moderator>
  `this.moderators`

This is a collection of known Moderators, keyed by Discord user ID. When a member with the
[Moderator role](../settings.md#moderator_role) issues a command or sends a message in one of the Game's channels,
they are added to this collection. A Moderator object contains their Discord ID and associated
[GuildMember](https://discord.js.org/docs/packages/discord.js/14.25.1/GuildMember:Class), and contains functions to
fetch the member's display name and display icon for use in the message handler module. It also contains their current
[latch](../commands/moderator_commands.md#latch).

When Alter Ego is rebooted, all data pertaining to Moderators is lost, but they can easily be recreated when member with
the Moderator role issues a command or sends a message in a Game channel.

### Message Queue

- Class attribute: PriorityQueue `this.messageQueue`

This is a queue of messages Alter Ego has yet to send. In order to avoid being
[rate limited](https://docs.discord.com/developers/topics/rate-limits), messages are stored in a queue corresponding
to the destination channel and sent when possible. This queue has five priority levels, to ensure that the most
important messages are sent first. In order of highest to lowest, these priority levels are:

- `mod`: Messages intended to be sent to the [command channel](../settings.md#command_channel) to communicate
  information to Moderators.
- `tell`: Messages intended to be shown to Players, such as Narrations and Notifications.
- `mechanic`: Messages which convey information related to Alter Ego's mechanics, but aren't directly related to
  in-game occurrences. These include things like the output of the [help command](../commands/player_commands.md#help),
  [Gesture lists](../commands/player_commands.md#gesture), and error messages warning users that their command wasn't
  executed successfully.
- `log`: Messages intended for the log channel.
- `spectate`: Messages intended for spectate channels.
