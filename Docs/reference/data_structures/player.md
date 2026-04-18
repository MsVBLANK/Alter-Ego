# Player

A Player is a data structure used by Alter Ego. It represents a player that can interact with the game world in a
variety of ways.

There are two types of Players: full Players and NPCs. A full Player is associated with a Discord account, and can be
controlled by that account. An NPC, short for non-player character, can do nearly everything a full Player can do,
however it is not associated with a Discord account; it can only be controlled by a moderator.

It should be noted that when Player data is loaded, so too are [Inventory Items](inventory_item.md). Inventory Items can
be loaded without loading Player data, but not vice versa.

## Attributes

In order to provide a wide array of functionality, Players have many attributes. Note that if an attribute is
_internal_, that means it only exists within
the [Player class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Player.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Discord ID**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.id`

For full Players, this is the [unique ID](https://discord.js.org/docs/packages/discord.js/14.25.1/Snowflake:TypeAlias)
assigned to their Discord account. [Developer Mode](../../moderator_guide/installation.md#enable-developer-mode) must be
enabled in order to obtain this ID by right-clicking on a Discord user and selecting **Copy ID**. When Player data is
loaded, Alter Ego will fetch the [guild member](https://discord.js.org/docs/packages/discord.js/14.25.1/GuildMember:Class)
whose account has this ID. That Discord user will then be able to control this Player. Because Alter Ego requires guild
member data, this account must belong to a Discord user in the server. If the user associated with a particular Player
leaves the server, Alter Ego will be unable to load that Player's data; they must either be removed from the
spreadsheet, converted to an NPC, or reassigned a different ID.

Because NPCs aren't associated with a Discord account, this attribute is repurposed for them. Instead of a Discord user
ID, this must be an image URL with a `.png`, `.jpg`, `.jpeg`, `.webp`, or `.avif` file extension. This image will be
used as the NPC's avatar when they speak; it will appear in [Room](room.md), [Whisper](whisper.md),
and [spectate channels](player.md#spectate-channel).

### Member

- Class attribute: [GuildMember](https://discord.js.org/docs/packages/discord.js/14.25.1/GuildMember:Class) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.member`

This is an internal attribute which contains a reference to the guild member whose Discord ID matches the Player ID. For
NPCs, this is `null`.

### Name

- Spreadsheet label: **Name**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is the name of the Player. Because this is also used as the name of the Player's spectate channel, it is subject to
Discord's limits on channel names. Only alphanumeric characters (A-Z, a-z, 0-9) and hyphens (-) are permitted; spaces,
symbols, and punctuation are not. This should generally match the Player's nickname on the server, although it doesn't
have to. For that reason, this should be 32 characters or fewer. This conventionally follows naming customs: the first
letter is capitalized, and the rest is in lowercase. However, this is not a requirement.

Within the [Game's](game.md) data, Players are indexed by their name. As such, it must be unique. However, keep in mind
that the version of their name that will be used as a key within the Game's data will be converted to all uppercase, and
all quotation characters will be removed. So, the key may not match what their actual name is exactly.

### Display Name

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.displayName`

This internal attribute is the string which Alter Ego uses to refer to the Player during most gameplay scenarios. It is
used instead of the name in [Narrations](narration.md), spectate channels, and more. The reason this is used is that
unlike the Player's name, this can change during gameplay. It is automatically changed when the Player is inflicted with
a [Status Effect](status.md) that has the [`concealed` behavior attribute](status.md#concealed), and it can be manually
changed with the [setdisplayname](../commands/moderator_commands.md#setdisplayname)
[command](../commands/bot_commands.md#setdisplayname).

When Player data is loaded, this is the same as the Player's name. For that reason, moderators should be careful when
loading Player data during gameplay, as any Players with different display names will have their display names reset.

### Display Icon

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.displayIcon`

This is an internal attribute which contains an image URL that will be used as an avatar when the Player uses
the [say](../commands/player_commands.md#say) [command](../commands/moderator_commands.md#say), and when their dialog
appears in a spectate channel. It is also used when NPCs use
the [whisper command](../commands/moderator_commands.md#whisper). For full Players, this is most often `null` - their
[display avatar](https://discord.js.org/docs/packages/discord.js/14.25.1/GuildMember:Class#displayAvatarURL) is used
instead. Only NPCs have this set to a non-`null` value by default: the image URL in their ID.

Much like the Player's display name, this can change during gameplay. It is automatically set to the
[`defaultConcealedIconURL`](../settings.md#default_concealed_icon_url) defined in Alter Ego's settings when the Player
is inflicted with a Status Effect that has the `concealed` behavior attribute, and it can be manually changed with the
[setdisplayicon](../commands/moderator_commands.md#setdisplayicon) [command](../commands/bot_commands.md#setdisplayicon).
However, it should be noted this will **not** replace a full Player's avatar when they speak in a Room or Whisper
channel by sending a message to it; it will only appear in spectate channels when this is the case.

### Title

- Spreadsheet label: **Title or "NPC"**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.title`

This is primarily a relic from older versions of Alter Ego which used this attribute to produce behavior that has since
been re-implemented using Status Effect behavior attributes. For full Players, this can be left blank without issue.
However, its main benefit is that it can be used as a variable
in [descriptions](../../moderator_guide/writing_descriptions.md#if).

There is one programmed use case for this attribute. If this is set to `NPC`, then the Player will become an NPC. If the
Player has the `NPC` title, then Alter Ego will not do anything to them that would require a Discord account, such as
sending them DMs, granting/revoking them permission to read channels, and adding/removing roles. NPC Players also will
not be counted in the online Player count, will not be inflicted with or cured of Status Effects when the "all" argument
is used in the [status](status.md) [command](../commands/bot_commands.md#status), and will not be moved when the "all"
argument is used in the [move](../commands/moderator_commands.md#move) [command](../commands/bot_commands.md#move).

### Talent

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.title` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.talent`

This was the previous name of the title attribute. It was renamed in Alter Ego version 2.0 to be more general-use. This
attribute contains a copy of the Player's title. However, it will be removed entirely in a future release.

### Is NPC

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.isNPC`

This internal attribute denotes whether or not the Player is an NPC. If the Player's title is `NPC`, this is `true`.
Otherwise, it is `false`. Once a Player is loaded, this cannot be changed.

### Pronoun String

- Spreadsheet label: **Pronouns**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronounString`

This is a string which determines what set of third-person
singular [personal pronouns](https://en.wikipedia.org/wiki/English_personal_pronouns#Basic) will be used to refer to the
Player by default. This must adhere to a strict format:
`subjective/objective/dependent possessive/independent possessive/reflexive/plural`, although there are shorthands for
the three most common pronoun sets:

- `male` is shorthand for `he/him/his/his/himself/false`.
- `female` is shorthand for `she/her/her/hers/herself/false`.
- `neutral` is shorthand for `they/them/their/theirs/themself/true`.

There are several parts to this format. They are as follows:

- The subjective pronoun is used to refer to the Player as the subject of a verb. For example, "**She** speaks."
- The objective pronoun is used to refer to the Player as an object of a verb. For example, "I saw **him**."
- The dependent possessive pronoun is used to refer to the Player as the owner of something which is the object of the
  verb. For example, "That's **their** room."
- The independent possessive pronoun is used to refer to the Player as the owner of something which is the subject of
  the verb. For example, "The car is **hers**."
- The reflexive pronoun is used to refer to the Player when they are the object of a verb where they are also the
  subject. For example, "They wash **themself**."
- The plural variable determines whether this set of pronouns pluralizes verbs. If this is `true`, then verbs will take
  the form they use with plural pronouns. For example, "They **are** here. They **have** money. They **smell** strange."
  If this is `false`, then verbs will take the form they use with singular pronouns. For example, "He **is** here. She
  **has** money. It **smells** strange."

As long as this format is followed, any set of pronouns can be used. For example, a Player who uses _it_ pronouns would
have the pronoun string `it/it/its/its/itself/false`.

A Player cannot have more than one pronoun set at a time. For example, a Player who uses both _he_ and _they_ pronouns
interchangeably can be referred to with _he_ or _they_ by Alter Ego, but not both. It cannot alternate between them at
will. However, this is relatively minor, as Player pronouns are seldom used in built-in Narrations. Descriptions, custom
Narrations, and dialog can all be written with alternating pronouns.

### Original Pronouns

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.originalPronouns`

This internal attribute is an object containing variables that contain each of the Player's default pronouns. This is
primarily used in response messages in [moderator commands](../commands/moderator_commands.md) and in log messages.

Please see the following class attribute for more info.

### Pronouns

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.pronouns`

This internal attribute is an object containing variables that contain each of the Player's current pronouns. This is
primarily what is used in Narrations. The reason this is used is that unlike the Player's original pronouns, this can
change during gameplay. It is automatically changed to the `neutral` pronoun set when the Player is inflicted with a
Status Effect that has the `concealed` behavior attribute, and it can be manually changed with
the [setpronouns](../commands/moderator_commands.md#setpronouns) [command](../commands/bot_commands.md#setpronouns).
When Player data is loaded, this is the same as the Player's original pronouns, right down to the structure. For that
reason, moderators should be careful when loading Player data during gameplay, as any Players with pronouns different
from their original pronouns will have their pronouns reset.

This, as well as the original pronouns attribute, has the following structure:

```ts
interface Pronouns {
    /** The subjective pronoun. */
    sbj?: string;
    /** The subjective pronoun with first letter capitalized. */
    Sbj?: string;
    /** The objective pronoun. */
    obj?: string;
    /** The objective pronoun with first letter capitalized. */
    Obj?: string;
    /** The dependent possessive pronoun. */
    dpos?: string;
    /** The dependent possessive pronoun with first letter capitalized. */
    Dpos?: string;
    /** The independent possessive pronoun. */
    ipos?: string;
    /** The independent possessive pronoun with first letter capitalized. */
    Ipos?: string;
    /** The reflexive pronoun. */
    ref?: string;
    /** The reflexive pronoun with first letter capitalized. */
    Ref?: string;
    /** Whether this set of pronouns turns verbs into their plural form. */
    plural?: boolean;
}
```

This essentially groups what would be multiple class attributes into one. They are listed below:

#### Subjective

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.sbj`

This is the Player's subjective pronoun.

#### Capital Subjective

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.Sbj`

This is the Player's subjective pronoun, except the first letter is capitalized. This is useful at the beginning of a
sentence when writing descriptions that use the Player's pronouns as variables.

#### Objective

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.obj`

This is the Player's objective pronoun.

#### Capital Objective

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.Obj`

This is the Player's objective pronoun, except the first letter is capitalized.

#### Dependent Possessive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.dpos`

This is the Player's dependent possessive pronoun.

#### Capital Dependent Possessive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.Dpos`

This is the Player's dependent possessive pronoun, except the first letter is capitalized.

#### Independent Possessive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.ipos`

This is the Player's independent possessive pronoun.

#### Capital Independent Possessive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.Ipos`

This is the Player's independent possessive pronoun, except the first letter is capitalized.

#### Reflexive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.ref`

This is the Player's reflexive pronoun.

#### Capital Reflexive

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.pronouns.Ref`

This is the Player's reflexive pronoun, except the first letter is capitalized.

#### Plural

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.pronouns.plural`

This is a Boolean value indicating whether this pronoun set pluralizes verbs.

### Original Voice String

- Spreadsheet label: **Speaks With**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.originalVoiceString`

This is a phrase that will be used in Narrations when the Player speaks while their identity is obscured in some way.
All Narrations which use this are written with the assumption that this string will begin with "a" or "an" and end
with "voice". Here are some examples with the Player's voice string in bold:

- You hear **a bitter voice** in the room say "...What are you looking at?"
- You hear **a brash voice** from a nearby room shout "HEY! IS ANYONE IN THERE!?"
- You overhear an individual wearing a PLAGUE DOCTOR MASK, with **a crisp voice** you recognize to be Kyra's, whisper
  "Yes, everything is going according to plan."
- **A deep modulated voice** coming from Amy's WALKIE TALKIE says "That is correct. I am hidden somewhere in this
  facility."

### Voice String

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.voiceString`

This internal attribute contains the Player's current voice descriptor. This is primarily what is used in Narrations.
The reason this is used is that unlike the Player's original voice string, this can change during gameplay. It can be
manually changed with
the [setvoice](../commands/moderator_commands.md#setvoice) [command](../commands/bot_commands.md#setvoice). When Player
data is loaded, this is the same as the Player's original voice string. For that reason, moderators should be careful
when loading Player data during gameplay, as any Players with a voice string different from their original voice string
will have their voice string reset. If the name of another Player, whether living or dead, is supplied, then the Player
will speak using that Player's voice. This will even trick Players with the
[`knows [Player name]` behavior attribute](status.md#knows-player-name) into recognizing this Player's voice as the
mimicked Player.

### Stats

- Spreadsheet label: **Stats**

This is an external attribute. It only exists to group the Player's stats together under one label. A Player's stats are
used in a variety of situations. Common applications of all of them include their ability to
be [modified by Status Effects](status.md#stat-modifiers) and their ability to be used as a modifier
in [Die rolls](die.md). Here, their individual properties and applications will be detailed below.

### Default Strength

- Spreadsheet label: **Str**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultStrength`

This is the Player's default strength stat. This quantifies the Player's physical strength. It must be a whole number
from 1 - 10.

### Strength

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.strength`

This internal attribute is the Player's current strength stat. By default, this equals their default strength, however
it can be changed by Status Effects with stat modifiers.

This stat is used to calculate the Player's [maximum carry weight](player.md#max-carry-weight). This value is
recalculated every time the Player's strength stat changes. The formula to calculate the Player's max carry weight in
kilograms is quadratic, not linear. It is roughly based on the range of real human weightlifting capacities. The full
formula, where \\(x\\) is the Player's strength stat, is:

\\[ W_{max} = 1.783x^2 - 2x + 22 \\]

The result is rounded down to the nearest whole number.

In effect, each strength stat value corresponds with a predetermined max carry weight, as shown in this chart:

| Strength Value | Max Carry Weight (kg) | Max Carry Weight (lb) |
|----------------|-----------------------|-----------------------|
| 1              | 21                    | 46                    |
| 2              | 25                    | 55                    |
| 3              | 32                    | 70                    |
| 4              | 42                    | 92                    |
| 5              | 56                    | 123                   |
| 6              | 74                    | 163                   |
| 7              | 95                    | 209                   |
| 8              | 120                   | 264                   |
| 9              | 148                   | 326                   |
| 10             | 180                   | 396                   |

The strength stat also has special behavior in Die rolls. If a Die is rolled using this Player's strength stat,
the [defender's](die.md#defender) [dexterity](player.md#dexterity) [roll modifier](die.md#stat-roll-modifier)
will be multiplied by \\(-1\\) and added to the Die's modifier. In effect, this factors in the defender's ability to
dodge the Player's attack.

### Default Perception

- Spreadsheet label: **Per**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultPerception`

This is the Player's default perception stat. This quantifies the Player's perceptiveness. It must be a whole
number from 1 - 10.

### Perception

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.perception`

This internal attribute is the Player's current perception stat. By default, this equals their default perception,
however it can be changed by Status Effects with stat modifiers.

This stat has no programmed use. However, it can be used
in [if conditionals](../../moderator_guide/writing_descriptions.md#if) when writing descriptions to affect what the
Player sees when inspecting various things. For example, a Player with a high perception stat may receive more clues
to assist in solving [Puzzles](puzzle.md) and murders than a Player with a low perception stat. Whereas a Player with
a low perception stat might see this:

`It's a small compartment below the dartboard. Written on it is "Prime x Prime x Prime = 266". There doesn't seem to be any way to open it. Maybe it will open if you hit three prime numbers on the dartboard that multiply together to make 266.`

A Player with an average perception stat might see this:

`It's a small compartment below the dartboard. Written on it is "Prime x Prime x Prime = 266". There doesn't seem to be any way to open it. Maybe it will open if you hit three prime numbers on the dartboard that multiply together to make 266. If that's the case, then you know a prime number is a number whose only products are 1 and itself. You don't even have to try any of the double or triple point values, or 50 for that matter.`

And a Player with a high perception stat might see this:

`It's a small compartment below the dartboard. Written on it is "Prime x Prime x Prime = 266". There doesn't seem to be any way to open it. Maybe it will open if you hit three prime numbers on the dartboard that multiply together to make 266. If that's the case, then you know a prime number is a number whose only products are 1 and itself. You don't even have to try any of the double or triple point values, or 50 for that matter. The only prime numbers on this board would be 2, 3, 5, 7, 11, 13, 17, and 19. Better yet, 266 is an even number, so you know one of the products MUST be 2, and you only need to find the other two numbers. This should be easy.`

It should be noted that because this stat has no programmed use, it doesn't necessarily have to correlate with the
Player's perceptiveness. It could correlate with the Player's logical intelligence, or anything else. How this stat is
used is entirely up to the moderator's discretion when writing descriptions.

### Default Dexterity

- Spreadsheet label: **Dex**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultDexterity`

This is the Player's default dexterity stat. This quantifies the Player's skill and speed when using their hands or
body. It must be a whole number from 1 - 10.

### Dexterity

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.dexterity`

This internal attribute is the Player's current dexterity stat. By default, this equals their default dexterity, however
it can be changed by Status Effects with stat modifiers.

This stat is used to determine the Player's probability of success when attempting to
steal [Inventory Items](inventory_item.md) from another Player. When this occurs, a Die is rolled using this Player's
dexterity stat, with the victim as the defender. If the Player has a high dexterity stat, and thus a positive dexterity
roll modifier, then they will be more likely to succeed when attempting to steal. If the Player has a low dexterity
stat, and thus a negative dexterity roll modifier, then they will be more likely to fail when attempting to steal.

It also has special behavior in Die rolls. If a Die is rolled using a different Player's strength stat where this Player
is the defender, this Player's dexterity roll modifier will be multiplied by `-1` and added to the Die's modifier. In
effect, this factors in the Player's ability to dodge the attacker's attack. If the Player has a high dexterity stat,
the attacker will be more likely to have a low attack roll, and vice versa.

### Default Speed

- Spreadsheet label: **Spd**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultSpeed`

This is the Player's default speed stat. This quantifies the Player's walking and running speed. It must be a whole
number from 1 - 10.

### Speed

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.speed`

This internal attribute is the Player's current speed stat. By default, this equals their default speed, however it can
be changed by Status Effects with stat modifiers.

This stat is used to calculate the amount of time it takes for the Player to travel from one [Exit](exit.md) to another
in a [Room](room.md).

The flat distance in pixels between the Player's current position and the desired Exit's position is calculated using
the [distance formula](https://en.wikipedia.org/wiki/Euclidean_distance#Two_dimensions) with the two positions'
respective [X](exit.md#x) and [Z](exit.md#z) coordinates. The flat distance is then converted to meters by dividing this
value by the [pixelsPerMeter setting](../settings.md#pixels_per_m). The rise of the Exit's position
relative to the Player's is calculated by subtracting the Player's [Y coordinate](player.md#y)
from [the Exit's](exit.md#y) and dividing the resulting value by the pixels per meter setting. The slope between the two
positions is then calculated by dividing the rise in meters by the flat distance in meters.

Movement speed is roughly based on the range of real human movement speeds. For example, a Player with a speed stat of
10 would have a movement speed of 8.34 meters per second. This is slightly less than Usain Bolt's top sprinting speed of
10.44 meters per second. The base formula to calculate a Player's movement speed in meters per millisecond (m/ms) is
quadratic, not linear. It is as follows:

\\[ R = (0.0183(rx)^2 + 0.005rx + 0.916)w \\]

In this formula are several variables:

- \\(x\\) is the Player's speed stat.
- \\(r\\) is \\(1\\) if the Player is walking and \\(2\\) if the Player is running.
- \\(w\\) is a fraction which represents slowdown based on the [combined weight](player.md#carry-weight) of all of the
  Player's Inventory Items. The formula to calculate this, where \\(c\\) is the Player's carry weight, is \\(w =
  \frac{15}{c}\\). However, the calculated value is clamped between \\( \frac{1}{4} \\) and \\(1\\).

The final rate, \\(R'\\), in meters per millisecond (m/ms), is then calculated with the following formula, where \\(R\\)
is the base rate and \\(s\\) is the slope:

\\[ R' = R - sR \\]

The time it takes to move, \\(t\\), in seconds, is then calculated with the following formula, where \\(d\\) is the flat
distance in meters and \\(R'\\) is the final rate in meters per millisecond:

\\[ t = \frac{d}{R'} * 1000 \\]

However, there is an alternative calculation method. If the flat distance between the Player's position and the Exit's
position is \\(0\\), then the time it takes to move between them is calculated based on the assumption that the Player
is in a stairwell consisting of two horizontally-flipped right triangles with legs of equal length vertically stacked on
top of one another, like this diagram:

![](../../images/K0eQsw3.png)

Here, the Player is marked by the bottom red line and the Exit is marked by the top red line. They have the same X and Z
coordinates; only their Y coordinates differ. The distance, \\(d\\), in meters between the Player and the Exit is
calculated by using the [Pythagorean theorem](https://en.wikipedia.org/wiki/Pythagorean_theorem) to find the length of
the hypotenuse for each triangle. In this formula, \\(l\\) represents the length of each leg, calculated by dividing the
rise in meters by \\(2\\):

\\[ d = 2 * \sqrt{2l^2} \\]

Then, if the rise is positive, meaning the Player is moving upstairs, the Player's base rate is multiplied by \\(
\frac{2}{3} \\). If the rise is negative, meaning the Player is moving downstairs, the Player's base rate is multiplied
by \\( \frac{4}{3} \\). In effect, their rate is decreased when moving upstairs and increased when moving downstairs.

Finally, the time it takes to move in this scenario, \\(t\\), in seconds, is calculated with the following formula,
where \\(d\\) is the recently determined distance in meters and \\(R\\) is the base rate (without accounting for slope)
in meters per millisecond:

\\[ t = \frac{d}{R} * 2 * 1000 \\]

### Default Stamina

- Spreadsheet label: **Sta**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultStamina`

This is the Player's default speed stat. This quantifies the Player's physical endurance. It must be a whole number from
1 - 10.

### Max Stamina

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.maxStamina`

This internal attribute is the Player's current maximum stamina stat. By default, this equals their default stamina,
however it can be changed by Status Effects with stat modifiers.

This stat is used to determine how long the Player can walk or run before being inflicted with the `weary` Status
Effect. The higher this is, the longer the Player can move without resting.

### Stamina

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.stamina`

This internal attribute is the Player's current stamina stat. By default, this equals their maximum stamina, however it
changes as the Player moves and rests. Whenever the Player's max stamina changes, so too does their stamina; the ratio
of their current stamina to their max stamina is retained.

As the Player moves, their stamina stat decreases. Every 100 milliseconds, the amount of stamina the Player loses, \\(
L\\), is calculated using the following formula:

\\[ L = dm * (u + su) \\]

In this formula are several variables:

- \\(d\\) is the flat distance in meters the Player has moved in the past 100 milliseconds.
- \\(m\\) is \\(1\\) if the Player is walking and \\(3\\) if the Player is running.
- \\(u\\) is the [staminaUseRate setting](../settings.md#stamina_use_rate).
- \\(s\\) is the slope of the Player's movement, calculated by dividing the number of meters they've risen in meters by
  the flat distance in meters they've moved in the past 100 milliseconds.

However, there is an alternative calculation method. If the flat distance between the Player's position and the Exit's
position is \\(0\\), then the time it takes to move between them is calculated based on the assumption that the Player
is in a stairwell. If the rise is positive, meaning the Player is moving upstairs, the amount of stamina the Player
loses is calculated like so:

\\[ L = 4dmu \\]

If the rise is negative, meaning the Player is moving downstairs, the amount of stamina the Player loses is calculated
like so:

\\[ L = -\frac{dmu}{4} \\]

When the Player's stamina dips below half of their max stamina, they will be sent a warning that they're starting to get
tired. If it reaches \\(0\\), they will stop moving and be inflicted with the `weary` Status Effect.

When the Player is not moving, their stamina is gradually restored. Every 30 seconds, they recover \\( \frac{1}{20} \\)
of their max stamina.

### Default Intelligence

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.defaultPerception` instead.

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.defaultIntelligence`

This was the previous name of the perception stat. It was renamed in Alter Ego version 2.0 to reflect its modern usage.
This attribute contains a copy of the Player's default perception. However, it will eventually be removed.

### Intelligence

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.perception` instead.

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.intelligence`

This was the previous name of the perception stat. It was renamed in Alter Ego version 2.0 to reflect its modern usage.
This attribute contains a copy of the Player's perception. Whenever the Player's perception is updated, this is also
updated to match it. However, it will eventually be removed.

### Alive

- Spreadsheet label: **Alive?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.alive`

This indicates whether the player is alive or not. If this is `true`, then the Player is alive, and can interact with
the game world like normally. If this is `false`, then the Player is dead, and they cannot do anything. When a Player
dies, some of their data is lost. In particular, their location, hiding spot, and Status Effects will be lost. However,
they retain everything else, including their Inventory Items. However, because dead Players cannot be inspected or
interacted with, all of their data is inaccessible.

### Location Display Name

- Spreadsheet label: **Location**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.locationDisplayName`

This is the [display name](room.md#display-name) of the Room that the Player is currently in. This must match the
Room's display name on the spreadsheet exactly.

### Location

- Class attribute: [Room](room.md) `this.location`

This internal attribute is a reference to the actual Room object the Player is currently in.

### Position

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.pos`

This internal attribute is an object containing variables that contain each of the Player's current coordinates. This is
used to calculate the amount of time it will take for the Player to move to an Exit. When the Player is moving, their
position is constantly updated. Every 100 milliseconds, the amount of time that has elapsed since the Player started
moving is taken as a ratio of the total amount of time it will take to move to the desired Exit. Each of the Player's
starting coordinates is subtracted from the Exit's corresponding coordinates, and the resulting value is multiplied by
that ratio and rounded to the nearest whole number. Then, each of these values are added to the Player's starting
coordinates to determined the Player's updated position. This effectively makes it so that if the Player stops moving,
they won't have to move the full distance if they decide to move to that Exit again.

When the Player enters a Room, their position is updated to match the position of the Exit they entered from. However,
if the Player didn't enter from a specific Exit, as would be the case when Player or Room data is loaded or when moving
to a non-adjacent Room, their position is set to the average position of all Exits in the Room.

The Player's position has the following structure:

```ts
interface Pos {
    x: number;
    y: number;
    z: number;
}
```

This essentially groups what would be multiple class attributes into one. They are listed below:

#### X

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.pos.x`

This is the Player's current X coordinate. This corresponds with the X-axis on a 3D grid.

#### Y

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.pos.y`

This is the Player's current Y coordinate. This corresponds with the Y-axis on a 3D grid,
which represents vertical height.

#### Z

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.pos.z`

This is the Player's current Z coordinate. This corresponds with the Z-axis on a 3D grid.

### Hiding Spot

- Spreadsheet label: **Hiding Spot**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.hidingSpot`

This is a string which contains the name of the Fixture the Player is currently hiding in. Since this is just a string,
it can be set manually on the spreadsheet to anything, whether it's the name of a Fixture in the Room or not. If the
Player is not currently hidden, this should be left blank.

### Status Displays

- Spreadsheet label: **Status Effects**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  `this.statusDisplays`

This string is a comma-separated list of the IDs of all Status Effects that the Player currently has, including those
that aren't [visible](status.md#visible). If a Status Effect has a [duration](status.md#duration), it can be listed here
by putting the duration in parentheses. The duration must follow a specific format:

`(D) H:mm:ss`

`D` stands for the number of 24-hour days remaining; it is optional. `H` stands for the number of hours remaining. `mm`
stands for the number of minutes remaining; leading zeroes are required. `ss` stands for the number of seconds
remaining; leading zeroes are required. For example, a Status Effect named `famished` with 2 days, 13 hours, 45 minutes,
and 11 seconds remaining would be listed as `famished (2 13:45:11)`. A Status Effect named `clean` with 1 day, 4 hours,
9 minutes, and 7 seconds remaining would be listed as `clean (1 4:09:07)`. A Status Effect named `mortally wounded` with
59 minutes remaining would be listed as `mortally wounded (0:59:00)`.

It should be noted that when entering Status Effects on the spreadsheet manually, it isn't necessary to include the
duration. If the Status Effect has a limited duration, it will automatically have its duration listed on the spreadsheet
when Alter Ego saves the game data. The Player's status string is regenerated with updated durations every second of
gameplay.

The status display object has the following structure:

```ts
interface StatusDisplay {
    /** The ID of the status effect. */
    id: string;
    /** The remaining time for the status effect. */
    timeRemaining: string;
}
```

When Player data is loaded from the sheet, the Status Effects listed, as well their Durations, are parsed and converted
into these objects. When data is saved to the sheet, all of the status displays are converted to strings and separated
by a comma.

### Status String

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> If this is used to check whether or not a Player has a Status with the given ID, use the
> [`this.hasStatus`](#hasStatus) method instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.statusString`

This internal attribute was used prior to Alter Ego version 2.0 to display all of the Player's current Status Effects
as a string, with representations of their time remaining. However, it has since been replaced by `this.statusDisplays`,
and now it is always an empty string. This will be removed in a future release.

### Status

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Status](status.md)>
  `this.status`

This internal attribute contains a collection of all instantiated Status Effects that the Player currently has, keyed
by Status ID. Every time a Status Effect is inflicted or cured, the Player's stats are recalculated.

### Description

- Spreadsheet label: **Description**
- Class attribute: [Description](description.md) `this.description`

This is the description of the Player. When another Player inspects this Player, they will receive a parsed version of
this string. See the article on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more
information.

Player descriptions have a few peculiarities that set them apart from other descriptions, mostly due to the complexity
of Players. In this section, Player descriptions will be explained in full detail.
The [default Player description](../settings.md#default_description) provided in the playerdefaults file is:

```xml
<desc><s>You examine <var v="this.displayName"/>.</s> <if cond="this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /> <if cond="this.pronouns.plural">are</if><if cond="!this.pronouns.plural">is</if> [HEIGHT], but <var v="this.pronouns.dpos" /> face is concealed.</s></if><if cond="!this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /><if cond="this.pronouns.plural">'re</if><if cond="!this.pronouns.plural">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s> <if cond="this.hasStatus('tired')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> bags under <var v="this.pronouns.dpos"/> eyes.</s></if><if cond="this.hasStatus('exhausted')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> dark bags under <var v="this.pronouns.dpos"/> eyes.</s> <s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> absolutely **exhausted**.</s></if><if cond="this.hasStatus('delirious')"><s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> completely **delirious**, like <var v="this.pronouns.sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if>n't slept in days.</s></if></if><br /><br /><s><var v="this.pronouns.Sbj" /> wear<if cond="!this.pronouns.plural">s</if> <il name="equipment"></il>.</s><if cond="this.getContainedItemsForItemList('equipment').length === 0"><s><var v="this.pronouns.Sbj" /> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> completely naked.</s></if> <s>You see <var v="this.pronouns.obj"/> carrying <il name="hands"></il>.</s> <if cond="this.hasStatus('stinky')"><s><var v="this.pronouns.Sbj"/>'<if cond="this.pronouns.plural">re</if><if cond="!this.pronouns.plural">s</if> a little stinky.</s></if><if cond="this.hasStatus('rancid')"><s><var v="this.pronouns.Sbj"/> smell<if cond="!this.pronouns.plural">s</if> absolutely **rancid**.</s></if> <if cond="this.hasStatus('soaking wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> soaking wet.</s></if><if cond="this.hasStatus('wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> a bit wet.</s></if></desc>
```

This description always refers to the Player with the correct name and pronouns according to the situation, and it does
so by making use of the Player's class attributes with `if` and `var` tags. While prior to Alter Ego version 2.0, it was
necessary to replace the `this` keyword in Player descriptions with `container` in order to access a Player's
attributes, this is no longer the case. Now, Player descriptions can use the `this` keyword like any other description,
and allowing a Player to view their own description in a MIRROR or some other reflective Fixture is as simple as:

```xml
<desc><s>It's a mirror hung on the wall above the sink.</s> <s>You can see your reflection in it:</s><br /><s> >>> </s><var v="player.description.parseFor(player)" /></desc>
```

Within the `desc` tags of the Player's description, there are eight main sections:

- Section 1: Player display name
  ```xml
  <s>You examine <var v="this.displayName"/>.</s>
  ```
    - This refers to the Player by their current display name. This should never be changed.

- Section 2: Concealed description
  ```xml
  <if cond="this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /> <if cond="this.pronouns.plural">are</if><if cond="!this.pronouns.plural">is</if> [HEIGHT], but <var v="this.pronouns.dpos" /> face is concealed.</s></if>
  ```
    - This section describes the Player with very little detail in order to avoid revealing their identity when they
      have the `concealed` behavior attribute.
    - The `concealed` behavior attribute automatically changes the Player's pronouns to the `neutral` set. Consequently,
      for the sake of simplicity, this section could be written as:
      ```xml
      <if cond="this.hasBehaviorAttribute('concealed')"><s>They are [HEIGHT], but their face is concealed.</s></if>
      ```
      However, doing so removes the possibility of using the setpronouns command after the Player is
      inflicted with the `concealed` behavior attribute. It can still be used, but the new pronouns will not be
      reflected in the Player's description.

- Section 3: Non-concealed description
  ```xml
  <if cond="!this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /><if cond="this.pronouns.plural">'re</if><if cond="!this.pronouns.plural">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s> <if cond="this.hasStatus('tired')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> bags under <var v="this.pronouns.dpos"/> eyes.</s></if><if cond="this.hasStatus('exhausted')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> dark bags under <var v="this.pronouns.dpos"/> eyes.</s> <s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> absolutely **exhausted**.</s></if><if cond="this.hasStatus('delirious')"><s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> completely **delirious**, like <var v="this.pronouns.sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if>n't slept in days.</s></if></if>
  ```
    - This section describes the Player in more detail. It's used when the Player doesn't have the `concealed` behavior
      attribute.
    - Because the Player's pronouns do not automatically change unless they are inflicted with the `concealed` behavior
      attribute, this section could be written without making use of the Player's pronouns in `var` tags. Instead, the
      Player's pronouns could be written as plain text. This would allow a Player who uses multiple pronouns
      interchangeably to be referred to with alternating pronouns, for example. However, this would hamper the use of
      the setpronouns command for the Player unless additional logic checking is added.
    - This section can be further divided into two subsections:
      - Subsection 1: Main description
        ```xml
        <s><var v="this.pronouns.Sbj" /><if cond="this.pronouns.plural">'re</if><if cond="!this.pronouns.plural">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s>
        ```
          - In this subsection, the Player can be described in much more detail than the default description allows for,
            and detail can be added throughout the course of the game if the Player's appearance changes in significant
            ways. However, Player descriptions should ideally be kept short to not overwhelm Players with
            too much irrelevant information.
          - An example of this section that makes use of static pronouns, extra detail, and extra conditionals, might
            look like this:
            ```xml
            <s>She's very tall with moderately light skin.</s> <s>She's quite scrawny, and a bit lanky, with a small bust.</s> <if cond="this.hasEquippedItem('FLORIANS EYEPATCH', 'GLASSES')"><s>It only has one eye, which is deep red in color.</s> <s>Its left eye is covered with an eyepatch.</s></if><if cond="!this.hasEquippedItem('FLORIANS EYEPATCH', 'GLASSES')"><s>Her eyes are deep red in color<if cond="player.name === 'Florian' || player.perception > 6">, but on closer inspection, her left eye appears to be made of glass, and doesn't quite match the color of her right eye</if>.</s></if> <s>They have short, dark mauve hair <if cond="this.hasEquippedItem('PAIR OF HAIR TIES', 'HAT')">that's tied into two small pigtails,</if><if cond="!this.hasEquippedItem('PAIR OF HAIR TIES', 'HAT')"> that goes down to her upper chest,</if> with bangs swept to the right.</s> <s>She has a wavy side fringe that goes down to her shoulder.</s> <s>The tips of this fringe and some scattered strands of his hair are dyed black.</s> <s>His nails are painted black, as well.</s> <s>Its face bears a skeptical look to it, as if it's either judging or analyzing you.</s>
            ```
      - Subsection 2: Tiredness indicator
        ```xml
        <if cond="this.hasStatus('tired')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> bags under <var v="this.pronouns.dpos"/> eyes.</s></if><if cond="this.hasStatus('exhausted')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> dark bags under <var v="this.pronouns.dpos"/> eyes.</s> <s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> absolutely **exhausted**.</s></if><if cond="this.hasStatus('delirious')"><s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> completely **delirious**, like <var v="this.pronouns.sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if>n't slept in days.</s></if>
        ```
          - In this subsection are several `if` conditionals that appear if the Player has one of several mutually
            exclusive Status Effects: `tired`, `exhausted`, or `delirious`. This indicates that the Player hasn't slept
            in a while.
          - This subsection can be safely removed if it is not desired.

- Section 4: Equipment item list
  ```xml
  <br /><br /><s><var v="this.pronouns.Sbj" /> wear<if cond="!this.pronouns.plural">s</if> <il name="equipment"></il>.</s>
  ```
    - Right before this sentence is a pair of line breaks. This breaks up the description into two separate parts,
      making it easier to read.
    - This sentence lists all Inventory Items that the Player currently has [equipped](equipment_slot.md), except for
      those equipped to their `RIGHT HAND` and `LEFT HAND` Equipment Slots and those whose Equipment Slot
      is [covered](prefab.md#covered-equipment-slots) by another equipped Inventory Item. These items will be
      automatically inserted based on the Player's current inventory whenever they are inspected.
    - If nothing appears in the `il` tag, this sentence will not appear in the parsed description.
    - Because this sentence appears regardless of whether or not the Player has the `concealed` behavior attribute,
      `var` tags should be used to reference the Player's pronouns. They should not be replaced with static pronouns.

- Section 5: No equipped items indicator
  ```xml
  <if cond="this.getContainedItemsForItemList('equipment').length === 0"><s><var v="this.pronouns.Sbj" /> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> completely naked.</s></if>
  ```
    - This `if` conditional calls the [`getContainedItemsForItemList` method](#getContainedItemsForItemList) for the
      `equipment` item list, and if it returns an empty array (meaning the Player has no equipped Inventory Items), then
      the sentence indicating that the Player is completely naked will appear in their description.
    - Because this only evaluates as true if the `equipment` item list is empty, this sentence will appear even if the
      Player's `hands` item list is not empty.
    - Since the sentence before this will have been removed if this sentence appears, there is no need to insert a space
      between the two sentences.
    - Because this sentence appears regardless of whether or not the Player has the `concealed` behavior attribute,
      `var` tags should be used to reference the Player's pronouns. They should not be replaced with static pronouns.
    - This section can be safely removed if it is not desired.

- Section 6: Hands item list
  ```xml
  <s>You see <var v="this.pronouns.obj"/> carrying <il name="hands"></il>.</s>
  ```
    - This sentence lists all [non-discreet](prefab.md#discreet) Inventory Items that the Player currently has equipped
      to their `RIGHT HAND` or `LEFT HAND` Equipment Slots. These items will be
      automatically inserted based on the Player's current inventory whenever they are inspected.
    - If nothing appears in the `il` tag, this sentence will not appear in the parsed description.
    - Because this sentence appears regardless of whether or not the Player has the `concealed` behavior attribute,
      `var` tags should be used to reference the Player's pronouns. They should not be replaced with static pronouns.

- Section 7: Odor indicator
  ```xml
  <if cond="this.hasStatus('stinky')"><s><var v="this.pronouns.Sbj"/>'<if cond="this.pronouns.plural">re</if><if cond="!this.pronouns.plural">s</if> a little stinky.</s></if><if cond="this.hasStatus('rancid')"><s><var v="this.pronouns.Sbj"/> smell<if cond="!this.pronouns.plural">s</if> absolutely **rancid**.</s></if>
  ```
    - In this section are two `if` conditionals that appear if the Player has one of two mutually exclusive Status
      Effects: `stinky` or `rancid`. This indicates that the Player hasn't bathed in a while.
    - Because this sentence appears regardless of whether or not the Player has the `concealed` behavior attribute,
      `var` tags should be used to reference the Player's pronouns. They should not be replaced with static pronouns.
    - This section can be safely removed if it is not desired.

- Section 8: Wetness indicator
  ```xml
  <if cond="this.hasStatus('soaking wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> soaking wet.</s></if><if cond="this.hasStatus('wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> a bit wet.</s></if>
  ```
    - In this section are two `if` conditionals that appear if the Player has one of two mutually exclusive Status
      Effects: `soaking wet` or `wet`. This indicates that the Player was recently soaked with water.
    - Because this sentence appears regardless of whether or not the Player has the `concealed` behavior attribute,
      `var` tags should be used to reference the Player's pronouns. They should not be replaced with static pronouns.
    - This section can be safely removed if it is not desired.

Additional information can be added to the Player's description as needed. However, when doing so, precautions should be
taken to ensure that it does not conflict with the effects of the `concealed` behavior attribute. If additional sections
are added, they generally must use `var` tags to reference the Player's pronouns.

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`PLAIN_TEXT` message display type](../../about/discord.md#display-components).

### Inventory

- Class attribute: [Collection](https://discord.js.org/docs/packages/discord.js/14.25.1/Collection:Class)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Equipment Slot](equipment_slot.md)>
  `this.inventory`

This internal attribute is a collection of Equipment Slots that the Player has, keyed by Equipment Slot ID. See the
article on [Equipment Slots](equipment_slot.md) for more information.

### Notification Channel

- Class attribute: [DMChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/DMChannel:Class) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.notificationChannel`

This is an internal attribute. When Player data is loaded, Alter Ego will attempt to create a DM channel with the guild
member corresponding to this Player. This channel is where all messages intended to be sent to only this Player will be
sent. This includes parsed Descriptions, [Notifications](notification.md), error messages, and so on. If the Player is
an NPC, this is `null`.

### Spectate Channel

- Class attribute: [TextChannel](https://discord.js.org/docs/packages/discord.js/14.25.1/TextChannel:Class) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.spectateChannel`

This is an internal attribute. When Player data is loaded, Alter Ego will attempt to find the channel in
the [Spectate category](../settings.md#spectate_category) whose name matches the name of the Player. If
it is not found, it will create one with that Player's name. It will not do this if there are already 50 spectate
channels in the Spectate category, however. It also will not attempt to find or create spectate channels for NPCs. In
both scenarios, this is `null`.

A spectate channel replicates the experience of being this Player. Everything the Player sees, including descriptions,
Narrations, dialog, and more, is sent to this channel in chronological order. Here, spectators and dead Players can
watch the game happen in real time, or read it at any point in the future, even after the game has concluded.

There are some things that do not appear in spectate channels, however. Out-Of-Character (OOC) messages---messages that
begin with `(`---are not sent, as
they are not considered true dialog. The Player's commands are also not sent, nor are error messages about command
syntax. When the Player uses the [status command](../commands/player_commands.md#status) or
[time command](../commands/player_commands.md#time), the responses will not appear in their spectate channel.

### Max Carry Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.maxCarryWeight`

This internal attribute is the maximum weight the Player can currently carry in kilograms. How it is calculated is
described in more detail in the [strength stat section](player.md#strength). If the Player attempts to take a Room Item
that is heavier than this number, they will be told it is too heavy to lift, and if the Room Item is non-discreet, their
attempt to take it will be Narrated in the Room channel. Likewise, if they attempt to take a Room Item that would make
their current carry weight exceed this value, they will be told that they're carrying too much weight; however, this
will not be Narrated. The same happens if another Player attempts to give this Player an Inventory Item that would
exceed this value. If the Player uses the [dress command](../commands/player_commands.md#dress), they will be unable to dress
themself in any Room Items that would exceed this value, although they will not be notified of it.

### Carry Weight

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.carryWeight`

This internal attribute is the combined [weight](inventory_item.md#weight) of all of the Player's Inventory Items. This
is updated every time the Player's inventory changes. This is used to determine how much slower the Player will
be [when moving](player.md#speed).

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Player.

### Is Moving

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.isMoving`

This internal attribute indicates whether the Player is currently in the process of moving or not. If this is `true`,
then they are currently moving. If this is `false`, then they are resting.

It should be noted that the Player can be forcibly stopped from moving in many ways. If Player data is reloaded,
if [edit mode](../../moderator_guide/edit_mode.md) is enabled, if the Player is inflicted with a Status Effect with the
`disable all`, `disable move`, or `disable run` behavior attributes, if the Player is forcibly moved using moderator or
bot commands, or if the Player dies, they will stop moving, and all class attributes associated
with movement will be reset.

### Move Timer

- Class attribute: [Timeout](https://nodejs.org/api/timers.html#class-timeout) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.moveTimer`

This internal attribute uses the [setInterval method](https://nodejs.org/api/timers.html#setintervalcallback-delay-args)
to handle the Player's movement. Every 100 milliseconds, 100 milliseconds are subtracted from the Player's
[remaining time](player.md#remaining-time), and the Player's position and stamina are updated. However, if at least one
Player in the game has the `heated` Status Effect, the amount of milliseconds subtracted from the Player's remaining
time is first multiplied by the [heatedSlowdownRate setting](../settings.md#heated_slowdown_rate), effectively making
the Player move more slowly. If the Player stops moving for any reason, the
[clearInterval method](https://nodejs.org/api/timers.html#clearintervaltimeout) is used on this so that the Player's
movement will no longer continue. When Player data is loaded, this is `null`.

### Remaining Time

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.remainingTime`

This internal attribute is the number of milliseconds remaining until the Player is done moving to the Exit they're
currently moving to. If the Player stops moving for any reason, this is set to `0`.

### Move Queue

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.moveQueue`

This internal attribute is a list of all movements the Player wishes to make in sequential order. When the Player uses
the [move command](../commands/player_commands.md#move) or [run command](../commands/player_commands.md#run), the Exits
they supply as arguments are inserted into this list. Each one is parsed, and if the desired Exit is found, the Player
begins moving to that Exit. When they reach the next Room, the next entry in the queue is parsed and the cycle continues
until the Player reaches the final destination. However, if any entry in the queue is an invalid destination or they
attempt to enter a [locked Exit](exit.md#unlocked), the Player is notified of their mistake, they stop moving, and the
queue is emptied.

This class attribute is unused if the Player is moved with the moderator or bot command, because those commands move the
Player instantaneously. As such, NPCs cannot have queued movements.

### Online

- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.online`

This internal attribute determines whether or not the Player is included in the count of online Players in Alter
Ego's [status message](../settings.md#online_activity_type-online_activity_string). If this is `true`, then the
Player is counted. If this is `false`, then they are not. A Player is set as online whenever they use a command or speak
in-game. NPCs are never considered online.

### Process

- Class attribute: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  `this.process`

This is an internal attribute used to process [Recipes](recipe.md). It has the following structure:

```ts
interface Process {
    /** The recipe being processed. **/
    recipe: Recipe;
    /** The ingredients used in the recipe. */
    ingredients: Array<CollatedItem<InventoryItem>>;
    /** The products created during recipe processing. */
    products: Array<InventoryItem>;
    /** How many times the given ingredients satisfy the recipe. Only set right before products are instantiated. */
    satisfactoryProcessCount: number;
    /** The duration of the recipe. */
    duration: null;
    /** The timer used to track the duration of the recipe. */
    timer: null;
}
```

Unlike [Fixtures](fixture.md), the duration and timer are never set. The Player's process is only set during
[crafting](action.md#craft-action) and [uncrafting](action.md#uncraft-action), and it is cleared immediately after.

## Methods

Players have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### calculateMoveRate

```ts
this.calculateMoveRate(isRunning?);
```

- Purpose: Calculates the player's movement rate in meters per second, irrespective of distance or slope.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters:
  - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
    `isRunning` - Whether the player is running or not. Defaults to false.

### hasStatus

```ts
this.hasStatus(statusId);
```

- Purpose: Returns true if the player has a status with the specified ID.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `statusId` - The ID of the status to look for.

### hasBehaviorAttribute

```ts
this.hasBehaviorAttribute(behaviorAttribute);
```

- Purpose: Returns true if the player has a status with the specified behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `behaviorAttribute` - The name of the behavior attribute.

### hasAttribute

> [!WARNING]
> This method is deprecated and will be removed in a future release.
>
> Use `this.hasBehaviorAttribute` instead.

```ts
this.hasAttribute(attribute);
```

- Purpose: Returns true if the player has a status with the specified behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `attribute` - The name of the behavior attribute.

### canSee

```ts
this.canSee();
```

- Purpose: Returns true if the player doesn't have the `no sight` behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### canHear

```ts
this.canHear();
```

- Purpose: Returns true if the player doesn't have the `no hearing` behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### knows

```ts
this.knows(playerName);
```

- Purpose: Returns true if the player has the `knows ${playerName}` behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `playerName` - The name of a player.

### isConscious

```ts
this.isConscious();
```

- Purpose: Returns true if the player doesn't have the `unconscious` behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### isHidden

```ts
this.isHidden();
```

- Purpose: Returns true if the player has the `hidden` behavior attribute.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### getStatModifier

```ts
this.getStatModifier(stat);
```

- Purpose: Calculates dice roll modifier based on the specified stat value.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters:
  - [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
    `stat` - The stat value.

### getContainedItems

```ts
this.getContainedItems();
```

- Purpose: Gets all of the items this entity contains.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
- Parameters: None

### getContainedItemsForItemList

```ts
this.getContainedItemsForItemList(itemListName?, player?);
```

- Purpose: Gets all of the items that should appear in the given item list.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Inventory Item](inventory_item.md)>
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `itemListName` - The name of the item list. Either "equipment" or "hands".
  - [Player](player.md)
    `player` - The player the description is being sent to. Unused.

### containsNoItems

```ts
this.containsNoItems();
```

- Purpose: Returns true if this entity contains no items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### containsItem

```ts
this.containsItem(identifier);
```

- Purpose: Returns true if this entity contains an item with the given identifier or prefab ID.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `identifier` - The identifier or prefab ID to search for.

### getContainedItem

```ts
this.getContainedItem(identifier);
```

- Purpose: Returns the item contained inside of this container with the given identifier or prefab ID.
  If no such item exists, returns undefined.
- Returns: [Inventory Item](inventory_item.md)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `identifier` - The identifier or prefab ID to search for.

### getContainedItemsWeight

```ts
this.getContainedItemsWeight();
```

- Purpose: Gets the combined weight of all the items this entity contains.
- Returns: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- Parameters: None

### getIngredientItem

```ts
this.getIngredientItem(prefabId);
```

- Purpose: Gets the actual ingredient item instance that was used as an ingredient in the currently processed recipe.
  If no such item exists, returns the corresponding ingredient prefab of the currently processed recipe.
  If no recipe is currently being processed, returns undefined.
- Returns: [Prefab](prefab.md) | [Inventory Item](inventory_item.md)
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `prefabId` - The prefab ID to search for.

### getProductItem

```ts
this.getProductItem(prefabId);
```

- Purpose: Gets the actual product item instance that was instantiated in the currently processed recipe.
  If no such item exists, returns the corresponding product prefab of the currently processed recipe.
  If no recipe is currently being processed, returns undefined.
- Returns: [Prefab](prefab.md) | [Inventory Item](inventory_item.md)
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `prefabId` - The prefab ID to search for.

### getEquipmentSlot

```ts
this.getEquipmentSlot(equipmentSlotId);
```

- Purpose: Gets the equipment slot in the player's inventory with the given ID. If it doesn't exist, returns undefined.
- Returns: [Equipment Slot](equipment_slot.md)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `equipmentSlotId` - The equipment slot ID to search for.

### hasEquippedItem

```ts
this.hasEquippedItem(identifier, equipmentSlotId);
```

- Purpose: Returns true if the player has an item with the given identifier or prefab ID
  equipped to the given equipment slot.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `identifier` - The item identifier to search for.
  - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    `equipmentSlotId` - The equipment slot ID it should be equipped to.
