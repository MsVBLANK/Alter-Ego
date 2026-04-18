# Whisper

A **Whisper** is a data structure used by Alter Ego. It represents a group of two or more [Players](player.md)
speaking quietly to each other such that no one else in the [Room](room.md) can hear them.

A normal Whisper can only be created when a Player or [moderator](../../moderator_guide/moderating.md) uses
the [whisper](../commands/player_commands.md#whisper) [command](../commands/moderator_commands.md#whisper). There is no
upper limit to the number of Players that can be included in a Whisper, so long as they are all in the same Room.
However, it is not possible for one Player to create a Whisper with Players in the Room who have the `hidden`,
`concealed`, `no hearing`, or `unconscious` [behavior attributes](status.md#behavior-attributes). If a Player in a
Whisper becomes inflicted with a [Status Effect](status.md) with one of these behavior attributes or they leave the
Room, they will be removed from the Whisper. If, when a Player is removed from the Whisper, the group of Players
remaining is the same as a different Whisper that already exists, it will be deleted upon the Player's removal.
Otherwise, a Whisper will only be deleted once all Players have been removed from it.

A Whisper can also be created when a Player [hides](action.md#hide-action) in a [Fixture](fixture.md). This allows a
Whisper to be created with only one Player. However, if more Players hide in the same Fixture, the Whisper will be
deleted and a new one will be created with all Players. A Whisper created in this way behaves similarly to a Room, but
with most of the same properties as a normal Whisper. When a Player comes out of hiding or is inflicted with a Status
Effect with the `no channel` or `no hearing` behavior attributes, they will be removed from the Whisper. When all
Players are removed from the Whisper, it will be deleted.

Whispers are fully transient. They are only intended to exist temporarily, so they are not saved to the spreadsheet.
Consequently, if Alter Ego is rebooted, any data related to ongoing Whispers will be lost. If their channels still
exist and Players still have access to them, they will still be able to speak in them, but they will not be registered
as Whispers, and their speech in said channels will not be considered dialog. Those channels will have to be manually
deleted.

## Attributes

Whispers have few attributes.

### ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is a unique identifier for the Prefab. It is generated automatically upon creation of the Whisper, and updated any
time a Player is removed from the Whisper.

It has the following format:

`locationId(-hidingSpotName)?-playerList`

- `locationId` is the [ID of the Room](room.md#id) the Whisper is occurring in.
- `hidingSpotName` is optional. If the Whisper is associated with a [Hiding Spot](hiding_spot.md), this is its name.
- `playerList` is a list of display names of Players in the Whisper, sorted in alphabetical order,
  with each one separated by a dash (`-`).

Whisper IDs are generated to follow the same rules as Room IDs.

### Players

- Class attribute: [Collection](https://discord.js.org/docs/packages/collection/main/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Player](player.md)>
  `this.players`

This is a collection of Players in the Whisper. The key for each entry is the Player's name.

### Location ID

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.locationId`

This is the ID of the Room that the Whisper is occurring in.

### Location

- Class attribute: [Room](room.md) `this.location`

This is the actual Room that the Whisper is occurring in. All of the Players in the Whisper must be in this Room.

### Hiding Spot Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.hidingSpotName`

The name of the Hiding Spot the whisper belongs to. If this Whisper is not associated with a Hiding Spot,
this is `undefined`.

### Channel Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.channelName`

This is the name that the channel will be set to. It is usually identical to the Whisper's ID, but it is limited to 100
characters in length, as this is the maximum number of characters allowed in a Discord channel name. Whenever the
Whisper's ID is updated, so too is its channel name.

### Channel

- Class attribute: [TextChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/TextChannel:Class)
  `this.channel`

When the Whisper is initialized, a channel is created for it in the [Whisper category](../settings.md#whisper_category).
In this channel, Players can speak to each other freely without others in the Room hearing them.

If a Player is part of a Whisper but has the `no channel` behavior attribute, they will not be given permission to view
the channel. This is helpful for Players with the `concealed` behavior attribute, for example, because having that
permission would allow other Players in the Whisper to see their [Discord](../../about/discord.md) account, thus
revealing their identity. Similarly, Players in the Whisper with the `no hearing` behavior attribute are not given
permission to view the channel. NPCs are also not given permission to view the channel, because they don't have Discord
accounts. When a Player is removed from the Whisper, their permission to view the channel is revoked.

When a Whisper is marked to be deleted, one of two things can happen. If the
[autoDeleteWhisperChannels setting](../settings.md#auto_delete_whisper_channels) is `true`, then the channel will be
deleted as well. If it is `false`, then the channel's name will be set to `archived-(Room ID)`. Discord only allows a
single category to have up to 50 channels. Therefore, if Whisper channels are not automatically deleted, they must be
moved to another category or manually deleted before this limit is reached. Otherwise, no new Whispers can be created.

### Deleted

- Class Attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.deleted`

Whether or not the Whisper has been deleted. This is needed so that messages are not sent to a Whisper channel that has
since been deleted by the time Alter Ego sends the messages in its queue.
