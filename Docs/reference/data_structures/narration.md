# Narration

A **Narration** is

## Attributes

### Message Display Type

- Class Attribute: [Enum (number)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
`this.messageDisplayType`

The display type of the message to send for this Narration, this is represented as an enumerated type, or enum. The following table outlines the values of the enum:

| Type       | Value |
| -----------| ----- |
| STANDARD   | 0     |
| WARNING    | 1     |
| ALERT      | 2     |
| MINOR      | 3     |
| PLAYER     | 4     |
| MONOLOG    | 5     |
| PLAIN_TEXT | 6     |

How the notification is displayed in Discord depends on its message display type. For examples on how this will look like, refer to the [Display Components](../../about/discord.md#display-components) section in the Discord page.

### Action

- Class Attribute: [Action](action.md) `this.action`

The action associated with this Narration.

### Player

- Class Attribute: [Player](player.md)
`this.player`

The player whose action is being narrated.

### Location

- Class Attribute: [Room](room.md)
`this.location`

The room the Narration is intended for.

### Whisper

- Class Attribute: [Whisper](whisper.md)
`this.whisper`

The whisper the Narration is intended for. If the Narration is not intended for a whisper, this is null.

### Content

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
`this.content`

The text content for the Narration.

### Message

- Class Attribute: [UserMessage]()
`this.message`

The message that the narration originated with, if applicable. If the narration didn't originate with a message, this is null.

### Attachments

- Class Attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[Attachment](https://discord.js.org/docs/packages/discord.js/main/Attachment:Class)>
`this.attachments`

A collection of attachments sent with the original message.

### Embeds

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Embed](https://discord.js.org/docs/packages/discord.js/main/Embed:Class)>
`this.embeds`

An array of embeds sent with the original message.

### Narrator

- Class Attribute: [User]()
`this.narrator`

The player or guild member who wrote the narration, if applicable. If the narration didn't originate with a message, this is null.

### Narrator Display Name

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
`this.narratorDisplayName`

The display name to represent the narrator in a webhook.

### Narrator Display Icon

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
`this.narratorDisplayIcon`

The avatar URL to represent the narrator in a webhook.

### Is OOC Message

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
`this.isOOCMessage`

Whether or not this narration is considered out-of-character, and thus not a true narration.

### Location is Surveilled

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
`this.locationIsSurveilled`

Whether or not the location has the `video surveilled` tag.
If this is an OOC message, this is false.

### Video Monitoring Rooms

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room](room.md)>
`this.videoMonitoringRooms`

A list of occupied rooms with the `video monitoring` tag.
If the location doesn't have the `video surveilled` tag, or if this is an OOC message, this is empty.
