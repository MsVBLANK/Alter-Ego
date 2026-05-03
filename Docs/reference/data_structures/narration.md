# Narration

A **Narration** is a data structure used by Alter Ego. It represents a narration of in-game occurrences that can be
communicated to multiple Players at once. Narrations are exclusively created and sent by the
[Game's narration handler](game.md#narration-handler).

Once a Narration has been created,
a [Narrate Action](action.md#narrate-action) is performed with it. A Narration object acts as a set of instructions for
how the Narration should be communicated in a Narrate Action.

In general, Narrations are sent to Room channels, for all Players inside of them to see. As such, they are usually
written to be somewhat generic, and not tailored to any one Player's perspective.

Narrations are fully transient. They are only intended to exist temporarily, so they are not saved to the spreadsheet.
Narrations have an extremely short life; once a Narration has been sent as a message, it disappears forever.

Narrations have a counterpart that are more tailored to individual Players: [Notifications](notification.md).

## Attributes

Narrations have several attributes.

### Message Display Type

- Class attribute: [Enum (number)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.messageDisplayType`

This is the [message display type](../discord.md#display-components) to use for the message that will be sent to
communicate the Narration. This determines how it will be displayed. This is assigned automatically by the narration
handler, and these assignments are almost all hard-coded. However, it is possible to set the message display type
for Narrations written as [Descriptions](../../moderator_guide/writing_descriptions.md#desc).

### Action

- Class attribute: [Action](action.md) `this.action`

This is the Action being narrated. It is used by the Game's [communication handler](game.md#communication-handler) to
ensure that Actions are only communicated in the same channel once.

### Player

- Class attribute: [Player](player.md) `this.player`

This is the Player whose Action is being narrated.

### Location

- Class attribute: [Room](room.md) `this.location`

This is the Room where the Action being narrated is occurring. The Narration is usually sent to
the [channel](room.md#channel) of its location.

### Whisper

- Class attribute: [Whisper](whisper.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
  `this.whisper`

This is the Whisper where the Action being narrated is occurring. If the Action is not occurring in a Whisper,
this is `null`. Usually, if it is occurring in a Whisper, this means that the Narration will be sent to the
[channel](whisper.md#channel) of the Whisper, instead of its location.

### Content

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.content`

The text content for the Narration. This is always what gets sent as a message. However, it can sometimes be altered to
add contextual information before it is sent, such as where the Narration originated from if it came from another Room.

### Message

- Class attribute: [OmitPartialGroupDMChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/OmitPartialGroupDMChannel:TypeAlias)<[Message](https://discord.js.org/docs/packages/discord.js/14.25.1/Message:Class)> | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
  `this.message`

This is the original message that caused the Narration to be sent, if applicable. This is usually the message of the
Narration's Action. However, if the Narration didn't originate with a message, this is `null`.

### Attachments

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Attachment](https://discord.js.org/docs/packages/discord.js/main/Attachment:Class)>
  `this.attachments`

This is a collection of attachments sent with the original message. These will be sent with the message communicating
the Narration, and in any [spectate mirrors](player.md#spectate-channel) of the Narration. If the Narration doesn't
have a message, or the message was sent with no attachments, this is an empty collection.

### Embeds

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Embed](https://discord.js.org/docs/packages/discord.js/14.25.1/Embed:Class)>
  `this.embeds`

This is an array of embeds sent with the original message. These will be sent with the message communicating
the Narration, and in any spectate mirrors of the Narration. If the Narration doesn't have a message, or the message
was sent with no embeds, this is an empty array.

### Narrator

- Class attribute: [Player](player.md) | [Moderator](game.md#moderators) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
  `this.narrator`

This is the Player or Moderator who wrote the Narration, if applicable. A narrator is required to send a Narration with
the `PLAYER` message display type. This is usually only set if the originating Action was a Narrate Action. However,
a narrator is also set when a [Gesture Action](action.md#gesture-action) is performed.
If there is no narrator, this is `null`.

### Narrator Display Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.narratorDisplayName`

This is the display name that will be used to represent the narrator in a webhook message---the type of message sent
in the `PLAYER` message display type. If the narrator is a Player, this will usually be their
[display name](player.md#display-name). If the narrator is a Moderator, this will be their nickname in the server, or
their account's display name if they don't have one set.

### Narrator Display Icon

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.narratorDisplayIcon`

This is the avatar URL that will be used to represent the narrator in a webhook message---the type of message sent
in the `PLAYER` message display type. If the narrator is a Player, this will usually be their
[display icon](player.md#display-icon). If the narrator is a Moderator, this will be their server avatar, or their
account's avatar if they don't have one set.

### Is OOC Message

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.isOOCMessage`

This Boolean value indicates whether or not the Narration is considered an out-of-character. A Narration can only be
out-of-character if it has a narrator, and the content of the Narration begins with an opening parenthesis (`(`).
If this is `true`, the Narration will not be mirrored in spectate channels.

### Location is Surveilled

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.locationIsSurveilled`

This Boolean value indicates whether or not the Narration's location has the
[`video surveilled` tag](room.md#video-surveilled). If this is `true`, then the Narration will be mirrored in all Rooms
with the [`video monitoring` tag](room.md#video-monitoring). However, if the Narration is an OOC message,
this is always `false`.

### Video Monitoring Rooms

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room](room.md)>
  `this.videoMonitoringRooms`

This is a list of all occupied Rooms with the `video monitoring` tag. [NPCs](player.md#title) count as occupants.
If the location doesn't have the `video surveilled` tag, or if the Narration is an OOC message, this is empty.
