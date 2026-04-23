# Action

An **Action** is a data structure used by Alter Ego. It represents an action that changes the game state in some way.
If [persistent Game Entities](persistent.md) can be understood as _nouns_, Actions can be understood as _verbs_.
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

All derived Action classes have the following attributes.

### ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is a unique ID that is automatically generated when an Action is created.
This allows it to be distinguished from all other Actions.

### Message

- Class attribute: [OmitPartialGroupDMChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/OmitPartialGroupDMChannel:TypeAlias)<[Message](https://discord.js.org/docs/packages/discord.js/14.25.1/Message:Class)> | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
  `this.message`

This is a reference to the Discord message which caused this Action to be created. This is usually the command that was
issued by a Player or Moderator. However, this is sometimes `undefined`. This can occur when the Action wasn't created
by a user-issued command. For example, [Bot commands](../commands/bot_commands.md) always create Actions with an
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
[Bot command](../commands/bot_commands.md). This is used by the [log handler](game.md#log-handler) to indicate that a
Player did not perform an Action of their own volition. However, near-universally, any Action which is created by a
Moderator command or Bot command is considered to have been forced.

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

An **Attempt Action** attempts to solve a [Puzzle](puzzle.md) for a Player. It is performed when
the [puzzle](../commands/moderator_commands.md#puzzle) [command](../commands/bot_commands.md#puzzle) or
[use command](../commands/player_commands.md#use) is used. It is also performed when:

- A Dress Action or Take Action is performed on a [`take`-](puzzle.md#take), [`weight`-](puzzle.md#weight), or
  [`container`-type](puzzle.md#container) Puzzle, or
- A Drop Action or Undress Action is performed on a [`drop`-](puzzle.md#drop), `weight`-, or `container`-type Puzzle.

### Craft Action

A **Craft Action** [crafts](recipe.md#crafting) two [Inventory Items](inventory_item.md) together. It is performed when
the [craft](../commands/player_commands.md#craft) [command](../commands/moderator_commands.md#craft) is used.
It can also be performed with [interactables](../interactables.md).

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
Otherwise, its quantity is set to 0, and it is removed from its container. Usually, all of the child
Inventory Items are recursively destroyed as well.

A Destroy Inventory Item Action is performed when the
[destroy](../commands/moderator_commands.md#destroy) [command](../commands/bot_commands.md#destroy) is used.
It is also performed on a Recipe's ingredients when they are crafted.
It can also be performed with [interactables](../interactables.md).

### Destroy Room Item Action

A **Destroy Room Item Action** destroys a [Room Item](room_item.md). This means that its quantity is set to 0. If its
container is another Room Item, it is removed from its container. Usually all of the child Room Items are recursively
destroyed as well.

A Destroy Room Item Action is performed when the
[destroy](../commands/moderator_commands.md#destroy) [command](../commands/bot_commands.md#destroy) is used.
It is also performed on a Recipe's ingredients when they are [processed](recipe.md#processing), and when a Room Item's
[uses](room_item.md#uses) are decreased to 0.
It can also be performed with [interactables](../interactables.md).

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

A **Drop Action** removes an Inventory Item from one of the Player's [hands](equipment_slot.md), converts it to a
[Room Item](room_item.md), and puts it in the specified [container](room_item.md#container). It is performed when
the [drop](../commands/player_commands.md#drop) [command](../commands/moderator_commands.md#drop) is used.
It can also be performed with [interactables](../interactables.md).

### End Action

An **End Action** [ends](event.md#ongoing) an Event. It is performed when the
[event](../commands/moderator_commands.md#event) [command](../commands/bot_commands.md#event) is used. It is also
performed when an Event's [timer](event.md#timer) expires.

### Enter Action

An **Enter Action** adds a Player to the given Room. Then, if the Player's [move queue](player.md#move-queue) is not
empty, it performs a new [Queue Move Action](#queue-move-action). An Enter Action is only performed as part of a
[Move Action](#move-action).

### Equip Action

An **Equip Action** removes an Inventory Item from one of the Player's hands and equips it to one of their
[Equipment Slots](equipment_slot.md). It is performed when the [equip](../commands/player_commands.md#equip)
[command](../commands/moderator_commands.md#equip) is used.
It can also be performed with [interactables](../interactables.md).

### Exit Action

An **Exit Action** removes a Player from the given Room, and from any [Whispers](whisper.md) they're currently in.
It is only performed as part of a [Move Action](#move-action).

### Find Action

A **Find Action** takes a type of Game Entity and an optional search query and displays all of the Game Entities that
satisfy the given criteria in a table with their row numbers. It is performed when the
[find command](../commands/moderator_commands.md#find) is used.
It can also be performed with [interactables](../interactables.md).

### Gesture Action

A **Gesture Action** does a [Gesture](gesture.md) for a Player. It can also display a list of Gestures that can be done
by the Player performing it. It is performed when the [gesture](../commands/player_commands.md#gesture)
[command](../commands/moderator_commands.md#gesture) is used.

### Give Action

A **Give Action** removes an Inventory Item from one of the Player's hands and adds it to one of the hands of the
recipient Player. It is performed when the [give](../commands/player_commands.md#give)
[command](../commands/moderator_commands.md#give) is used.

### Help Action

A **Help Action** displays a list of [commands](../commands/index.md) available to the user. If an alias of a command is
given, it shows the help menu for that command, with all of its aliases, examples, and usage details. It is performed
when [the](../commands/eligible_commands.md#help) [help](../commands/player_commands.md#help)
[command](../commands/moderator_commands.md#help) is used.

### Hide Action

A **Hide Action** attempts to hide a Player in a given [Hiding Spot](hiding_spot.md). It is performed when the
[hide](../commands/player_commands.md#hide) [command](../commands/moderator_commands.md#hide) is used.

### Inflict Action

An **Inflict Action** inflicts a Player with a given [Status Effect](status.md). It is performed when the
[status](../commands/moderator_commands.md#status) [command](../commands/bot_commands.md#status) is used, and it is
performed to specifically inflict the "asleep" Status Effect when the
[sleep command](../commands/player_commands.md#sleep) is used. It is also performed when:

- Player data is loaded from the sheet,
- A Player is cured of a Status with a [cured condition](status.md#cured-condition-id),
- A Player performs a Hide Action---the "hidden" Status is inflicted,
- A Player is inflicted with a Status Effect that they already have which has a
  [duplicated Status](status.md#duplicated-status-id),
- A Player is in a Room [affected by](room.md#tags) [an ongoing Event](event.md#room-tag) which
  [inflicts Status Effects](event.md#inflicted-status-effects-strings),
- A Player runs out of [stamina](player.md#stamina)---the "weary" Status is inflicted,
- A Status inflicted on a Player with a [next stage](status.md#next-stage-id) expires, or
- A Player performs a [Use Action](#use-action) with an Inventory Item that [inflicts](prefab.md#effects-strings)
  one or more Status Effects.

### Inspect Action

An **Inspect Action** [parses the Description](description.md#parsefor) of the specified
[Room](room.md#room-description), [Fixture](fixture.md#description), [Room Item](room_item.md#description),
[Player](player.md#description), or [Inventory Item](inventory_item.md#description) and sends it to the Player
performing it. It is performed when the [inspect](../commands/player_commands.md#inspect)
[command](../commands/moderator_commands.md#inspect) is used.
It can also be performed with [interactables](../interactables.md).

### Instantiate Inventory Item Action

An **Instantiate Inventory Item Action** instantiates an [Inventory Item](inventory_item.md) with the given Prefab. It
can be instantiated to a Player's Equipment Slot or in an [Inventory Slot](inventory_slot.md) of one of their
other Inventory Items. If the Prefab being instantiated has Inventory Slots of its own, it will be generated with a
unique [identifier](inventory_item.md#identifier); if it is being instantiated with a
[quantity](inventory_item.md#quantity) greater than 1, each one will be created as a separate Inventory Item with its
own identifier.

An Instantiate Inventory Item Action is performed when the
[instantiate](../commands/moderator_commands.md#instantiate) [command](../commands/bot_commands.md#instantiate) is used.
It is also performed with a Recipe's products when they are [crafted](recipe.md#crafting).
It can also be performed with [interactables](../interactables.md).

### Instantiate Room Item Action

An **Instantiate Room Item Action** instantiates a [Room Item](room_item.md) with the given Prefab in the specified
[container](room_item.md#container). If the Prefab being instantiated has Inventory Slots of its own, it will be
generated with a unique [identifier](room_item.md#identifier); if it is being instantiated with a
[quantity](inventory_item.md#quantity) greater than 1, each one will be created as a separate Room Item with its
own identifier.

An Instantiate Room Item Action is performed when the
[instantiate](../commands/moderator_commands.md#instantiate) [command](../commands/bot_commands.md#instantiate) is used.
It is also performed with a Recipe's products when they are [processed](recipe.md#processing), and when a Room Item with
a [next stage](prefab.md#next-stage-id) has its [uses](room_item.md#uses) decreased to 0.
It can also be performed with [interactables](../interactables.md).

### Inventory Action

An **Inventory Action** displays a Player's [inventory](player.md#inventory). It is performed when the
[inventory](../commands/player_commands.md#inventory) [command](../commands/moderator_commands.md#inventory) is used.

### Knock Action

A **Knock Action** sends a [Narration](narration.md) in a Player's [location](player.md#location) that they are
knocking on the given Exit's [door](exit.md#getdoorphrase), and sends a Narration in the Room that the Exit
[leads to](exit.md#destination) that someone is knocking on the [corresponding Exit](exit.md#link). It is performed
when the [knock](../commands/player_commands.md#knock) [command](../commands/moderator_commands.md#knock) is used.

### Lock Action

A **Lock Action** [locks](exit.md#unlocked) the given Exit in a Room. It is performed when the
[exit](../commands/moderator_commands.md#exit) [command](../commands/bot_commands.md#exit) is used. A Lock Action does
not lock the Exit's corresponding [link](exit.md#link)---that must be done with a separate Lock Action.

### Monolog Action

A **Monolog Action** displays the given text in a [`MONOLOG` message display](../../about/discord.md#monolog) in the
[notification channel](player.md#notification-channel) and [spectate channel](player.md#spectate-channel) of the
character performing it. It represents the Player's inner thoughts. It is performed when the
[monolog command](../commands/player_commands.md#monolog) is used.

### Move Action

A **Move Action** removes a Player from one Room and adds them to another. Internally, it performs an
[Exit Action](#exit-action) and [Enter Action](#enter-action) in succession. If the Player is moving through
an Exit, and that Exit has an associated [`restricted exit`-type Puzzle](puzzle.md#restricted-exit) in which
their name is listed as a solution, they will perform a [Solve Action](#solve-action) on it.

A Move Action is performed when the [move Moderator](../commands/moderator_commands.md#move) or
[move Bot](../commands/bot_commands.md#move) command is used. It is also performed when a
[Queue Move Action](#queue-move-action) is performed by a Player with the
[Free Movement role](../settings.md#free_movement_role) without specifying an Exit, and when a Player's
[remaining time](player.md#remaining-time) reaches 0 in their [move timer](player.md#move-timer),
as long as the Exit they are moving toward is unlocked or [passable](puzzle.md#restricted-exit).

### Narrate Action

A **Narrate Action** sends a [Narration](narration.md) to all relevant destinations. First, it sends the Narration to
its [location](narration.md#location), as long as it isn't occurring in a [Hiding Spot](hiding_spot.md). Then, it sends
the Narration to its [Whisper](narration.md#whisper), if it has one. Finally, it sends the Narration to its respective
[video monitoring Rooms](narration.md#video-monitoring-rooms), as long as its
[location is video surveilled](narration.md#location-is-surveilled), it isn't occurring in a Hiding Spot, and the
Action being narrated isn't a [Say Action](#say-action). If any occupant of these destinations has the
[`see room` behavior attribute](status.md#see-room), they will be sent a [Notification](notification.md) communicating
the content of the Narration.

A Narrate Action is performed by every function in the [Game's narration handler](game.md#narration-handler).
It is also performed when:

- The [narrate](../commands/player_commands.md#narrate) [command](../commands/moderator_commands.md#narrate) is used,
- The [say Moderator command](../commands/moderator_commands.md#say) is used to send a message to a
  [Room channel](../settings.md#room_categories) or [Whisper channel](../settings.md#whisper_category), or
- A user with the [Moderator role](../settings.md#moderator_role) sends a message in a Room channel or Whisper channel.

### Queue Move Action

A **Queue Move Action** finds the user-entered Exit or Room. If it is found, a [Start Move Action](#start-move-action)
is performed. However, if the Player has the [Free Movement role](../settings.md#free_movement_role) and they entered
the name of a Room, they will instead instantly perform a [Move Action](#move-action).

A Queue Move Action is performed when the [move Player command](../commands/player_commands.md#move) or
[run Player command](../commands/player_commands.md#run) is used. It also performed when an
[Enter Action](#enter-action) is performed, if the Player's [move queue](player.md#move-queue) is not empty.
It can also be performed with [interactables](../interactables.md).

### Recipes Action

A **Recipes Action** displays a list of all [Recipes](recipe.md) that can be carried out by a Player. By default, all
Recipes that can be done using only the [Room Items](room_item.md) in the Player's [location](player.md#location) will
be shown, as long as they have at least one of the Recipe's ingredients in their [inventory](player.md#inventory).
However, if one of their [Inventory Items](inventory_item.md) is specified, all Recipes that use its [Prefab](prefab.md)
as an ingredient will be shown. It is performed when the [recipes command](../commands/player_commands.md) is used.

### Say Action

A **Say Action** sends the given dialog to all relevant destinations. How this works is detailed here.

The Player's own dialog is always mirrored in their
[spectate channel](player.md#spectate-channel). [NPCs](player.md#is-npc), as well as any Players with the
[`no hearing`](status.md#no-hearing) and [`unconscious`](status.md#unconscious) behavior attributes, will not receive
any [Notifications](notification.md) regarding spoken dialog, and it will not be mirrored in their spectate channels.
If a Player who can hear spoken dialog has the [`no sight` behavior attribute](status.md#no-sight), or they are being
[mimicked](player.md#voice-string), they will receive a Notification that takes priority over the ordinary style of
mirrored dialog in spectate channels. Otherwise, if the Player has the
[`hear room` behavior attribute](status.md#hear-room), or they [know the speaker's voice](status.md#knows-player-name)
but can't identify them by appearance, they will receive a Notification that does not take priority over the usual
style of mirrored dialog in spectate channels.

If the dialog was [whispered](whisper.md), it is mirrored in the
spectate channels of all Players in the Whisper. If any Players in the Room have the
[`acute hearing` behavior attribute](status.md#acute-hearing), they will receive a Notification communicating the
content of the whispered dialog.

If the dialog wasn't whispered, it will be mirrored in the spectate channels of all
Players in the Room, and any [`voice`-type Puzzles](puzzle.md#voice) in the Room will be attempted. Any Players in
[non-soundproof](room.md#soundproof) neighboring Rooms with the `acute hearing` behavior attribute will receive a
Notification communicating the content of the spoken dialog.

Then, if the Room is [audio surveilled](room.md#audio-surveilled), the dialog will be [narrated](#narrate-action) in
all [audio monitoring](room.md#audio-monitoring) Rooms, and mirrored in the spectate channels of their occupants.
`voice`-type Puzzles in these Rooms will also be attempted.

Next, if the dialog was shouted---either by the contents being in all uppercase, or by being preceded with
[heading characters](../../about/discord.md#markdown)---it will be narrated in any non-soundproof neighboring Rooms,
as well as all audio monitoring Rooms if one of the neighboring Rooms is audio surveilled. `voice`-type Puzzles in
these Rooms will be attempted, and the dialog will be mirrored in the spectate channels of all of their occupants.

Finally, if the speaker has the [`sender` behavior attribute](status.md#sender), the spoken dialog is narrated in
all Rooms with at least one Player with the [`receiver` behavior attribute](status.md#receiver). If any of these Rooms
are audio surveilled, the dialog will also be narrated in all audio monitoring Rooms. `voice`-type Puzzles in all of
these Rooms will be attempted, and the dialog will be mirrored in the spectate channels of all of their occupants.

A Say Action is performed when a Player or [latched Moderator](../commands/moderator_commands.md#latch) sends a message
in a [Room channel](../settings.md#room_categories) or [Whisper channel](../settings.md#whisper_category). It is also
performed when the [say](../commands/player_commands.md#say) [command](../commands/moderator_commands.md#say) is used,
or when the [whisper Moderator command](../commands/moderator_commands.md#whisper) is used to make an NPC speak
in a Whisper.

### Solve Action

A **Solve Action** [solves](puzzle.md#solved) a Puzzle and sets its [outcome](puzzle.md#outcome). It is performed when
the [puzzle](../commands/moderator_commands.md#puzzle) [command](../commands/bot_commands.md#puzzle) is used. It is
also performed when a Player moves through an [Exit](exit.md) that has an associated
[`restricted exit`-type Puzzle](puzzle.md#restricted-exit) if their name is listed as a solution, and when a Player's
dialog is spoken (or audible in) a Room with a [`voice`-type Puzzle](puzzle.md#voice) if the alphanumeric content
(case-insensitive) of the dialog contains one of the Puzzle's solutions.

### Start Move Action

A **Start Move Action** calculates how much time it will take for a Player to move to the given [Exit](exit.md) from
their current [position](player.md#position) and starts their [move timer](player.md#move-timer), beginning the process
of moving them to the destination. It is performed as part of a [Queue Move Action](#queue-move-action).

### Stash Action

A **Stash Action** removes an Inventory Item from one of the Player’s hands and inserts it into an
[Inventory Slot](inventory_slot.md) of one of their other Inventory Items. It is performed when the
[stash](../commands/player_commands.md#stash) [command](../commands/moderator_commands.md#stash) is used.
It can also be performed with [interactables](../interactables.md).

### Steal Action

A **Steal Action** attempts to remove a random Inventory Item from an Inventory Slot of one a Player's
[equipped](equipment_slot.md#equipped-item) Inventory Items and add it to one of the stealing Player's hands.
There are three possible outcomes:

1. The stealing Player fails to steal an Inventory Item, and the victim is [notified](notification.md) that they tried.
2. The stealing Player successfully steals an Inventory Item, but the victim is notified.
3. The stealing Player successfully steals an Inventory Item without the victim noticing.

The stealing Player's success is determined by the result of a [Die](die.md) weighted by their
[dexterity stat](player.md#dexterity), where a higher stat means a higher success rate. However, if the stolen
Inventory Item is [non-discreet](prefab.md#discreet), the victim will always notice. The only exception is if the
victim is [unconscious](status.md#unconscious)---in this case, they will never notice,
and Steal Actions will always succeed.

A Steal Action is performed when the [steal command](../commands/player_commands.md#steal) is used.

### Stop Action

A **Stop Action** stops a Player's [movement](player.md#is-moving) and clears their [move queue](player.md#move-queue).
It is performed when the [stop command](../commands/player_commands.md#stop) is used, and when a Player
[finishes moving](player.md#move-timer) to an Exit that is
[locked](exit.md#unlocked) or [impassable](puzzle.md#restricted-exit).
It can also be performed with [interactables](../interactables.md).

### Take Action

A **Take Action** removes a [Room Item](room_item.md) from its [container](room_item.md#container), converts it to an
[Inventory Item](inventory_item.md), and puts it in one of the Player's [hands](equipment_slot.md). It is performed
when the [take](../commands/player_commands.md#take) [command](../commands/moderator_commands.md#take) is used.
It can also be performed with [interactables](../interactables.md).

### Text Action

A **Text Action** sends a text message from the sending Player to a recipient Player. The message is sent as a
[`PLAIN_TEXT`](../../about/discord.md#plain_text) [Notification](notification.md) to both the recipient and sender
along with any [Attachments](https://discord.js.org/docs/packages/discord.js/14.25.1/Attachment:Class) and
[Embeds](https://discord.js.org/docs/packages/discord.js/14.25.1/Embed:Class) that were sent in the original message.
This Notification will be sent even to [unconscious](status.md#unconscious) Players.

A Text Action is performed when the [text](../commands/player_commands.md#text)
[command](../commands/moderator_commands.md#text) is used.

### Trigger Action

A **Trigger Action** [triggers](event.md#ongoing) an Event. It is performed when the
[event](../commands/moderator_commands.md#event) [command](../commands/bot_commands.md#event) is used. It is also
performed when the current date and time matches any of the Event's [trigger times](event.md#trigger-times-strings).

### Uncraft Action

An **Uncraft Action** [uncrafts](recipe.md#uncrafting) an [Inventory Item](inventory_item.md) into two Inventory Items
that can produce it in a Recipe. It is performed when
the [uncraft](../commands/player_commands.md#uncraft) [command](../commands/moderator_commands.md#uncraft) is used.
It can also be performed with [interactables](../interactables.md).

### Undress Action

An **Undress Action** removes all [unequippable](prefab.md#equippable) Inventory Items from the Player's
[Equipment Slots](equipment_slot.md) and drops them in the specified [container](room_item.md#container). It is
performed when the [undress](../commands/player_commands.md#undress)
[command](../commands/moderator_commands.md#undress) is used.

### Unequip Action

An **Unequip Action** removes an Inventory Item from one of the Player's [Equipment Slots](equipment_slot.md) and
puts it in one of their hands. It is performed when the [unequip](../commands/player_commands.md#unequip)
[command](../commands/moderator_commands.md#unequip) is used.
It can also be performed with [interactables](../interactables.md).

### Unhide Action

An **Unhide Action** removes a Player from their [Hiding Spot](hiding_spot.md). It is performed when the unhide alias
of the [hide](../commands/player_commands.md#hide) [command](../commands/moderator_commands.md#hide) is used.

### Unlock Action

An **Unlock Action** [unlocks](exit.md#unlocked) the given Exit in a Room. It is performed when the
[exit](../commands/moderator_commands.md#exit) [command](../commands/bot_commands.md#exit) is used. An Unlock Action
does not lock the Exit's corresponding [link](exit.md#link)---that must be done with a separate Unlock Action.

### Unsolve Action

An **Unsolve Action** [unsolves](puzzle.md#solved) a Puzzle and clears its [outcome](puzzle.md#outcome). It is performed
when the [puzzle](../commands/moderator_commands.md#puzzle) [command](../commands/bot_commands.md#puzzle) is used.

### Unstash Action

An **Unstash Action** removes an Inventory Item from an [Inventory Slot](inventory_slot.md) of one of the Player's
other Inventory Items and puts it in one of their [hands](equipment_slot.md). It is performed when the
[unstash](../commands/player_commands.md#unstash) [command](../commands/moderator_commands.md#unstash) is used.
It can also be performed with [interactables](../interactables.md).

### Use Action

A **Use Action** [uses](prefab.md#usable) an [Inventory Item](inventory_item.md) on a Player. It is performed when the
[use](../commands/player_commands.md#use) [command](../commands/moderator_commands.md#use) is used.
It can also be performed with [interactables](../interactables.md).

### View Action

A **View Action** displays the given Game Entity. By default, it displays most of the Game Entity's data as it would
appear on the sheet, but it is also possible to view one of its specific attributes individually. It is performed when
the [view command](../commands/moderator_commands.md#view) is used.
It can also be performed with [interactables](../interactables.md).

### Whisper Action

A **Whisper Action** creates a [Whisper](whisper.md) between the given Players. It is performed when the
[whisper](../commands/player_commands.md#whisper) [command](../commands/moderator_commands.md) is used.
