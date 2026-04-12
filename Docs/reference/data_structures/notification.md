# Notification

A Notification is

## Attributes

### Player

- Class Attribute: [Player](player.md)
`this.player`

The player the Notification is intended for.

### Message Display Type

- Class Attribute: [Enum (number)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
`this.messageDisplayType`

The display type of the message to send for this Notification, this is represented as an enumerated type, or enum. The following table outlines the values of the enum:

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

The action associated with this notification.

### Content

- Class Attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
`this.content`

The text content for the notification.

### Mirror in Spectate Channel

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
`this.mirrorInSpectateChannel`

Whether or not the notification is mirrored in the player's spectate channel.

### Attachments

- Class Attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[Attachment](https://discord.js.org/docs/packages/discord.js/main/Attachment:Class)>
`this.attachments`

A collection of attachments sent with the original message.

### Embeds

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Embed](https://discord.js.org/docs/packages/discord.js/main/Embed:Class)>
`this.embeds`

An array of embeds sent with the original message.

### Interactables

- Class Attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Interactable](interactable.md)>

An array of interactables to send with the notification.
