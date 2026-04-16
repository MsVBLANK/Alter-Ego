# Status

A **Status**, also called a **Status Effect**, is a data structure used by Alter Ego. It represents a condition
that affects a [Player](player.md).

Status Effects that are loaded from the [spreadsheet](index.md) are static; once loaded, they do not change in any way.
Thus, the [GameEntitySaver class](https://github.com/MolSnoo/Alter-Ego/blob/master/Classes/GameEntitySaver.ts) will
never make changes to the Status Effects sheet. As a result, the Status Effects sheet can be freely edited
without [edit mode](../../moderator_guide/edit_mode.md) being enabled. Only _instantiated_ Status Effects — Status
Effects that are inflicted on a Player — are dynamic.

## Attributes

Status Effects have several attributes. However, their behavior is relatively limited. Note that if an attribute is
_internal_, that means it only exists within
the [Status class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Status.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Status Effect ID**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

This is the unique ID of the Status Effect. This should be given in all lowercase letters. Punctuation is allowed. This
should ideally be an adjective, because messages sent to Players which contain the ID of a Status Effect are written
assuming they will be given in the form of an adjective.

### Name

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.id` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This internal attribute is a copy of the Status Effect's ID. It was how Status Effects were identified prior to Alter
Ego version 2.0. This attribute will be removed in the future.

### Duration String

- Spreadsheet label: **Duration**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.durationString`

This is a string which determines how long it will take the Status to expire after it is inflicted. This should
consist of a number (i.e. `30`, `1.5`) with a letter immediately following it, with no space between them. There is a
fixed set of predefined units that correspond with each letter. They are as follows:

| Letter | Unit    |
|--------|---------|
| s      | seconds |
| m      | minutes |
| h      | hours   |
| d      | days    |
| w      | weeks   |
| M      | months  |
| y      | years   |

So, a Status Effect that should last 30 seconds should have a duration of `30s`, one that should last 15 minutes should
have a duration of `15m`, one that should last 2 hours should have a duration of `2h`, one that should last 1.5 days
should have a duration of `1.5d`, and so on. If no duration is provided, the Status Effect will not expire on its own.

### Duration

- Class attribute: [Duration](https://moment.github.io/luxon/api-docs/index.html#duration) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.duration`

This is an internal attribute which contains a Duration object created from the duration string. If the Status has no
duration string, this is `null`.

### Remaining

- Class attribute: [Duration](https://moment.github.io/luxon/api-docs/index.html#duration) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.remaining`

This is an internal attribute which contains a Duration object indicating how much time is remaining until the Status
Effect expires. This is `null` for all Status Effects loaded from the spreadsheet. This is only assigned to an
instantiated Status Effect that has a duration. If the instantiated Status Effect has no duration, this is `null`. While
the instantiated Status Effect is active, 1000 milliseconds are subtracted from this Duration every second until it is
less than or equal to zero, at which point the Status Effect expires. However, the amount subtracted every second can
vary. If at least one Player in the game has the "heated" Status Effect, the amount subtracted is multiplied by the
`heatedSlowdownRate` [setting](../settings.md#heated_slowdown_rate), effectively making the Status
Effect take longer to expire.

### Fatal

- Spreadsheet label: **Fatal?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.fatal`

This is a simple Boolean value indicating whether an instance of this Status Effect will kill the Player when it expires
or not. If this is `true`, then a Player inflicted with this Status Effect will die when the Status Effect expires. If
this is `false`, the Player will simply be cured of the Status Effect. However, Alter Ego will not check if the Status
Effect is fatal if it has a [next stage](status.md#next-stage).

### Visible

- Spreadsheet label: **Visible?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.visible`

This is a simple Boolean value indicating whether an instance of this Status Effect will appear if a Player inflicted
with it uses the [status command](../commands/player_commands.md#status). If this is `true`, then it will appear in the
Player's status. If this is `false`, then it will not. However, it will still be visible to
a [moderator](../../moderator_guide/moderating.md)
who [views the Player's status](../commands/moderator_commands.md#status).

### Overriders Strings

- Spreadsheet label: **Don't Inflict If Player Is**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.overridersStrings`

This is a comma-separated list of Status Effect IDs that prevent this Status Effect from being inflicted. If a Player
currently has any of the Status Effects listed here, then they cannot be inflicted with this Status Effect under any
circumstances. However, it should be noted that overriders do not automatically cure Status Effects that they override
when they are inflicted on a Player.

### Overriders

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Status](status.md)>
  `this.overriders`

This is an internal attribute which contains references to each of the Status Effect objects whose IDs are listed in
`this.overridersStrings`.

### Cures Strings

- Spreadsheet label: **Cures**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.curesStrings`

This is a comma-separated list of Status Effect IDs that an instance of this Status Effect will cure once it is
inflicted on a Player. Among other things, this allows particular Status Effects to be mutually exclusive, allowing for
cycles where a Player can only be inflicted with one Status Effect in the cycle at any given time. For that reason, if
the Status Effect is being inflicted due to being a previous Status Effect's next stage
or [cured condition](status.md#cured-condition), it will not cure any Status Effects on this list.

### Cures

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Status](status.md)>
  `this.cures`

This is an internal attribute which contains references to each of the Status Effect objects whose IDs are listed in
`this.curesStrings`.

### Next Stage ID

- Spreadsheet label: **Develops Into**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.nextStageId`

This is the ID of a single Status Effect that an instance of this Status Effect will develop into when it expires. When
it expires, it will be cured, and the next stage will be inflicted on the Player. If the Player cannot be inflicted with
the Status Effect's next stage because they are inflicted with any of the next stage's
[overriders](status.md#overriders), they will be sent the Status Effect's
[cured description](status.md#cured-description). Otherwise, they will be sent the next
stage's [inflicted description](status.md#inflicted-description).

It is not possible for a Status Effect to have more than one next stage.

### Next Stage

- Class attribute: [Status](status.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.nextStage`

This is an internal attribute which contains a reference to the Status Effect object whose ID is given in
`this.nextStageId`. If the Status Effect has no next stage, this is `null`.

### Duplicated Status ID

- Spreadsheet label: **When Duplicated**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.duplicatedStatusId`

This is the ID of a single Status Effect that an instance of this Status Effect will develop into if it is inflicted on
a Player who already has an instance of this Status Effect. If the Status Effect is duplicated, the Player will be cured
of it without being sent its cured description, and they will be inflicted with the duplicated Status. However, the
Status Effect cannot be duplicated if the Player is inflicted with one of its overriders.

It is not possible for a Status Effect to have more than one duplicated Status.

### Duplicated Status

- Class attribute: [Status](status.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.duplicatedStatus`

This is an internal attribute which contains a reference to the Status Effect object whose ID is given in
`this.duplicatedStatusId`. If the Status Effect has no duplicated Status, this is `null`.

### Cured Condition ID

- Spreadsheet label: **When Cured**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.curedConditionId`

This is the ID of a single Status Effect that an instance of this Status Effect will develop into if it is cured. When
it is cured, the cured condition will be inflicted on the Player. However, it will not be inflicted if the Status Effect
is cured by being duplicated, by being one of a recently inflicted Status Effect's cures, or by developing into its next
stage. The cured condition will only be inflicted if the Status Effect is cured by expiring with no next stage, or if it
is cured by some external phenomenon (such as a moderator command or the Player using
an [Inventory Item](inventory_item.md)) before it normally expires. When the cured condition is inflicted, the Player
will not receive its inflicted description; they will be sent the cured Status Effect's cured description.

It is not possible for a Status Effect to have more than one cured condition.

### Cured Condition

- Class attribute: [Status](status.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.curedCondition`

This is an internal attribute which contains a reference to the Status Effect object whose ID is given in
`this.curedConditionId`. If the Status Effect has no cured condition, this is `null`.

### Stat Modifiers

- Spreadsheet label: **Stat Modifiers**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  `this.statModifiers`

This is a comma-separated list of stat modifier objects that an instance of this Status Effect will apply to a Player
inflicted with it. Stat modifier objects have the following structure:

```ts
interface StatModifier {
    /** Whether the stat modifier modifies the player's own stat. */
    modifiesSelf: boolean;
    /** The stat to modify. */
    stat: string;
    /** Whether it assigns the value or adds to it. */
    assignValue: boolean;
    /** The value to assign or add. */
    value: number;
}
```

In order to define a stat modifier, the name or abbreviation of the stat to modify must be listed. This must be
`strength`, `perception`, `dexterity`, `speed`, or `stamina`; or their abbreviations, `str`, `per`, `dex`, `spd`, or
`sta`. It must then be followed by an operator: `+`, `-`, or `=`. Next must be an integer value from `1` to `10`.
Finally, if the stat is meant to modify the attacker's stat in a [Die roll](die.md) where a Player inflicted with this
Status Effect is the defender, prefix the modifier with `@`.

Valid examples of stat modifiers for a single Status Effect are:

- `per-1`. This decreases the Player's [perception](player.md#perception) stat by 1.
- `str-2, dex-2, spd-2, sta-2`. This decreases the
  Player's [strength](player.md#strength), [dexterity](player.md#dexterity), [speed](player.md#speed),
  and [stamina](player.md#stamina) stats by 2.
- `spd+4`. This increases the Player's speed stat by 4.
- `str+9, per+9, dex+9, spd+9, sta+9`. This increases all of the Player's stats by 9.
- `spd=1, sta=1`. This sets the Player's speed and stamina stats to 1.
- `@str=0, dex+9`. This increases the Player's dexterity stat by 9 and temporarily sets the attacking Player's strength
  stat to 0 when this Player is the defender. Effectively, this makes the defending Player immune to attacks.

Note that regardless of the values of stat modifiers, a Player's stat cannot be less than 1 or greater than 10. It will
be clamped between these values if the modifiers would exceed these values. The only exception is when a stat modifier
assigns a value with the `=` operator. In this case, the clamp function is bypassed, and the Player's stat can be set to
any integer value outside of that range.

Stat modifiers are stackable. If a Player has multiple Status Effects that modify the same stat, the modifiers will be
added together before being applied to the stat. However, stat modifiers which assign a value to a given stat will
overrule all other modifiers to that stat. So, even if a Player has one Status Effect with a stat modifier of `sta+9`,
if they have a Status Effect with a stat modifier of `sta=1`, their stamina stat will be set to 1.

### Behavior Attributes

- Spreadsheet label: **Behavior Attributes**
- Class attribute: [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.behaviorAttributes`

This is a comma-separated list of keywords that give the Status Effect predefined behavior when it is inflicted on a
Player. Through the combination of different behavior attributes, the Status Effect can transform gameplay for the
inflicted Player in drastic ways.

While it is possible to add behavior attributes to a Status Effect that do not have predefined behavior, these will not
have any effect. It can still be useful to do so, as it provides a way to store information about a Player in one of
their Status Effects, which can be accessed with the
[`hasBehaviorAttribute` Player method](player.md#hasBehaviorAttribute). For example, if a Status Effect has the behavior
attribute `computer expert` --- which has no predefined behavior, it is possible to write
[descriptions](../../moderator_guide/writing_descriptions.md) which can show additional information to any Players who
have a Status Effect with that behavior attribute.

However, the most useful behavior attributes are those with predefined behavior. Here, each predefined behavior
attribute will be listed, and their behavior will be detailed. Note that behavior attributes are case-sensitive.
Bracket characters (`[]`) should not be included when assigning behavior attributes to a Status.

#### `disable all`

- Disables all commands.

#### `disable [command]`

- Disables the given command.

#### `enable [command]`

- Enables the given command when the Player has a Status Effect with the `disable all` attribute.

#### `enable say`

- Enables the say command, which is disabled by default.

#### `enable text`

- Enables the text command, which is disabled by default.

#### `no channel`

- Removes the Player from the channel of the [Room](room.md) they're in.
- When the Player moves to a different Room, they will not be added to the Room's channel.
- If the Player is added to a [Whisper](whisper.md) as a result of hiding, they will not be given permission to read the
  Whisper channel, unless the only Status Effect they have with this attribute is the
  "hidden" Status Effect.

#### `hear room`

- All dialog from other Players in the Room will be sent to the Player via DM.

#### `acute hearing`

- All dialog from other Players in adjacent Rooms will be sent to the Player via DM.
- All Whisper messages from other Players in the same Room will be sent to the Player via DM.

#### `knows [Player name]`

- When the known Player speaks and their [display name](player.md#display-name) differs from their name, the Player will
  receive a DM revealing the known Player's identity. Example:
  `[Player display name], with [Player voice string] you recognize as [Player name]'s, says "[Message]".`
- When the Player has the `no sight` and `hear room` behavior attributes, they will receive a DM revealing the known
  Player's identity when they speak. Example: `[Player name] says "[Message]".`
- If the Player is in a Whisper and doesn't have permission to read the Whisper channel, they will receive a DM
  revealing the known Player's identity when they speak in the Whisper. Example:
  `[Player name] whispers "[Message]".`
- When the known Player's voice can be heard from an adjacent Room, the Player will receive a DM revealing the known
  Player's identity. Example: `[Player name] shouts "[Message]" in a nearby room.`
- When the known Player has the `sender` behavior attribute and someone in the same Room as the Player has the
  `receiver` attribute, the Player will receive a DM revealing the known Player's identity when they speak. Example:
  `[sender Player name] says "[Message]" through [receiver Player display name]'s [receiver Item name].`
- When the Player is in a Room with the [`audio monitoring` tag](room.md#audio-monitoring) and the known Player speaks
  in a Room with the [`audio surveilled` tag](room.md#audio-surveilled), the Player will receive a DM revealing the
  known Player's identity. Example:
  `[Room display name] [Player name] says "[Message]".`
- Note: The Player name is case-sensitive. It must match the Player's name exactly as it appears on the spreadsheet.

#### `no hearing`

- The Player cannot be Whispered to. They will be removed from any Whispers that they are a part of.
- If the Player is added to a Whisper as a result of hiding, they will not be given permission to read the Whisper
  channel.
- If the Player is in a Whisper as a result of hiding, they will not receive any notifications about dialog sent in that
  Whisper.
- The Player cannot hear shouted dialog from adjacent Rooms.
- The Player will not be notified when someone in an adjacent Room performs a [Knock Action](action.md#knock-action).
  Instead of being [narrated](narration.md) in the destination Room channel, knocking it will be sent to all
  hearing Players in the Room via DM.
- The Player will not hear dialog coming from a Player with the `receiver` behavior attribute.
- If the Player is in a Room with the `audio monitoring` tag, they will not hear dialog coming from a Room with the
  `audio surveilled` tag.

#### `sender`

- All of the Player's dialog (except Whispers) will be narrated in the Room of the Player with the `receiver`
  attribute, if there is one that isn't also the `sender` Player, regardless of the respective Players' locations.
- The Player will attempt to solve any [`voice`-type Puzzles](puzzle.md#voice) in the Room that the
  `receiver` Player is in.

#### `receiver`

- Non-Whispered dialog spoken by the Player with the `sender` attribute will be narrated in the Room of the
  `receiver` Player, regardless of the respective Players' locations. Example:
  `[sender Player voice string] coming from [receiver Player display name]'s [receiver Item name] says "[Message]".`

#### `no speech`

- Any message the Player sends to a Room or Whisper channel will be deleted.

#### `see room`

- All Narrations (including those from moderators and Alter Ego) that are sent to the Room the Player is in will be sent
  to the Player via DM, unless the Player has the `no sight` behavior attribute or the `hidden` behavior attribute.
- If the Player has the `hidden` attribute, all Narrations (including those from moderators and Alter Ego) that are sent
  to the Whisper they're in (if applicable) will be sent to the Player via DM, unless the Player has the
  `no sight` behavior attribute.

#### `no sight`

- The Player will not receive the Room description when they enter a Room. Instead, they will be sent
  `Fumbling against the wall, you make your way to the next room over.`
- The `see room` behavior attribute is overridden; the Player will not be sent Narrations via DM.
- The Player will not be told who is hiding in a Fixture if they inspect it or attempt to hide in it. Instead, the
  [Hiding Spot's](hiding_spot.md) occupants will be listed as `[quantity] people` or `someone`.
- If the Player is found in a Hiding Spot, they will not be told who found them.
  Instead, the Player who found them will be described as `someone`.
- If the Player has the `hear room` behavior attribute, the dialog they receive via DM will not have the speaking
  Player's identity attached. Example: `Someone in the room with [speaker voice string] says "[Message]".`
- If the Player has the `acute hearing` behavior attribute, any dialog they receive via DM will not have the
  speaking Player's identity attached. Example: `Someone in a nearby room with [speaker voice string] says "[Message]".`
- If the Player is in a Whisper and doesn't have permission to read the Whisper channel, they will receive dialog sent
  in that Whisper via DM. However, the dialog they receive will not have the speaking Player's identity attached.
  Example: `Someone with [speaker voice string] whispers "[Message]".`

#### `unconscious`

- Alter Ego will narrate `[Player display name] goes unconscious.` in the Room the Player is in when this behavior
  attribute is inflicted.
    - If the Status Effect which inflicts this behavior attribute onto the Player is named "asleep", Alter Ego will
      instead narrate `[Player display name] falls asleep.`
    - If the Status Effect which inflicts this behavior attribute onto the Player is named "blacked out", Alter Ego will
      instead narrate `[Player display name] blacks out.`
- Alter Ego will narrate `[Player display name] regains consciousness.` in the Room the Player is in when this behavior
  attribute is cured. They will also be sent the description of the Room they wake up in.
    - If the Status Effect which inflicted this behavior attribute onto the Player is named "asleep" or "blacked out",
      Alter Ego will instead narrate `[Player display name] wakes up.`
- The Player will receive no notifications except those about Status Effects.
- The Player will not receive dialog via DM, regardless of any other behavior attributes they may have.
- The Player cannot be Whispered to. They will be removed from any Whispers that they are a part of.
- Attempts to [steal](action.md#steal-action) an Inventory Item from this Player will always succeed.
- The Player will appear in the list of sleeping Players when another Player enters the Room they're in.
- The Player will not receive notifications about edit mode being enabled or disabled.

#### `hidden`

- Alter Ego will narrate `[Player display name] hides in the [Player hiding spot].` in the Room the Player is in when
  this behavior attribute is inflicted.
- Alter Ego will narrate `[Player display name] comes out of the [Player hiding spot].` in the Room the Player is in
  when this behavior attribute is cured.
- The Player cannot be Whispered to. They will be removed from any Whispers that they are a part of.
- If the Status Effect is inflicted by a [Hide Action](action.md#hide-action), a Whisper will automatically be created
  with all Players hiding in the same Fixture.
- If the Player whispers and someone in the Room has the `acute hearing` behavior attribute, the whispered dialog that
  will be sent via DM will not have the Player's identity attached. Example:
  `You overhear someone in the room with [Player voice string] whisper "[Message]".`
- Narrations about the Player's actions will not be sent to the channel of the Room they're in, unless the action is
  coming out of hiding.
- If the Player is in a Whisper, Narrations about their actions will be sent to the Whisper channel.
- The Player will not appear in the list of occupants when another Player enters the Room they're in.
- The Player will not appear in the [occupants string](room.md#occupants-string) of the Room they're in.
- The Player cannot be inspected, except by another Player hiding in the same Fixture as them.
- The Player cannot be given to or stolen from, except by another Player hiding in the same Fixture as them.
- The Player cannot be the target for a [Gesture](gesture.md), except by another Player hiding in the same Fixture as
  them.
- The Player can only use the dress command to dress from the Fixture they're hiding in, from
  its [child Puzzle](fixture.md#child-puzzle), or from Room Items contained within it.
- The Player can only drop Inventory Items into the Fixture they're hiding in, into its child Puzzle,
  or into Room Items contained within it.
- The Player can only perform Gestures with no target, or Gestures that target the Fixture they're hiding in, Room Items
  contained within it, Players hiding in the same Fixture they're hiding in, and their own Inventory Items.
- The Player can only give Inventory Items to Players hiding in the same Fixture as them.
- The Player can only inspect the Room, the Fixture they're hiding in, Room Items contained within it, their own
  Inventory Items, Players hiding in the same Fixture they're hiding in, and their Inventory Items.
- When the Player uses the say command, their display name appear as `Someone in the room with [Player voice string]`.
  However, their display name will not actually be changed.
- When the Player uses the say command, their display icon will appear as the
  [`hiddenIconURL`](../settings.md#hidden_icon_url) defined in Alter Ego's settings.
  However, their display icon will not actually be changed.
- The Player can only steal Inventory Items from Players hiding in the same Fixture as them.
- The Player can only take Room Items from the Fixture they're hiding in, from its child Puzzle,
  or from Room Items contained within it.
- The Player can only undress into the Fixture they're hiding in, into its child Puzzle,
  or into Room Items contained within it.
- The Player can only activate/deactivate the Fixture they're hiding in.
- The Player can only attempt the child Puzzle of the Fixture they're hiding in.

#### `concealed`

- When this behavior attribute is inflicted:
    - The Player's display name will be changed. If an equipped Inventory Item inflicted this behavior attribute, then
      it will be changed to `an individual wearing [Inventory Item single containing phrase]`. If the behavior attribute
      was inflicted some other way, it will be changed to `an individual wearing a MASK`.
    - The Player's [display icon](player.md#display-icon) will be changed to the
      [`defaultConcealedIconURL`](../settings.md#default_concealed_icon_url) defined in Alter Ego's settings.
    - The Player's [pronouns](player.md#pronouns) will be changed to `neutral`.
- When this behavior attribute is cured:
    - The Player's display name will be reset.
    - The Player's display icon will be reset.
    - The Player's pronouns will be reset.
    - Alter Ego will narrate `The [Inventory Item name] comes off, revealing the individual to be [Player name].` in the
      Room the Player is in, if an unequipped Inventory Item cured this behavior attribute. If the behavior attribute
      was cured some other way, "MASK" will be used in place of `[Inventory Item name]`.
- The Player cannot be Whispered to. They will be removed from any Whispers that they are a part of.

#### `all or nothing`

- All Die rolls when the Player is the attacker will be the [minimum](../settings.md#dice_min)
  or [maximum](../settings.md#dice_max) possible for the Die before modifiers are applied. For example,
  if the minimum is 1 and the maximum is 20, all of the Player's rolls will be 1 or 20 before modifiers.

#### `coin flipper`

- All Die rolls when the Player is the attacker will have a 50% chance of having a modifier of +1 applied if the Player
  has an Inventory Item with "COIN" in its [name](prefab.md#single-name).

#### `no stamina decrease`

- The Player will not consume stamina when moving.

#### `thief`

- The Player will always succeed without getting caught when stealing an Inventory Item from another Player. However,
  they will still get caught if the Inventory Item is [non-discreet](prefab.md#discreet).

### Attributes

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.behaviorAttributes` instead.

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.attributes`

This internal attribute is a copy of the Status Effect's behavior attributes, expressed as an array. It was how
behavior attributes were defined prior to Alter Ego version 2.0. This attribute will be removed in the future.

### Effect

- Spreadsheet label: **Effect**

This is an external attribute that is never loaded by Alter Ego. This should be a description of the Status Effect,
explaining entirely how it works and what it does to a Player inflicted with it. However, it can be left blank.

### Inflicted Description

- Spreadsheet label: **Description When Inflicted**
- Class attribute: [Description](description.md)
  `this.inflictedDescription`

When a Player is inflicted with this Status Effect, they will receive a parsed version of this string. See the article
on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more information.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`STANDARD` message display type](../../about/discord.md#display-components).

### Cured Description

- Spreadsheet label: **Description When Cured**
- Class attribute: [Description](description.md)
  `this.curedDescription`

When a Player is cured of this Status Effect, they will receive a parsed version of this string.

Unless it is manually specified, this Description will be sent using the `STANDARD` message display type.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Status Effect.

### Timer

- Class attribute: [Timer](https://momentjs.com/docs/#/plugins/timer/) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.timer`

This is an internal attribute which contains a timer counting down until the Status Effect expires. This is `null` for
all Status Effects loaded from the spreadsheet. This is only assigned to an instantiated Status Effect that has a
duration. If the instantiated Status Effect has no duration, this is `null`. While the instantiated Status Effect is
active, every 1000 milliseconds, 1 second is subtracted from the Status
Effect's [remaining Duration](status.md#remaining) until it reaches 0. When it does, the timer is stopped, and the
Status Effect is cured.
