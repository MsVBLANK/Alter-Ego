# Settings

Alter Ego has various **settings** that can be configured in the file `.env`, or as environment variables. All values in
`.env` should be enclosed with single quotes. Remember to uncomment (i.e. remove the `#` before the line) for them to go
into effect. This page details each setting and what it does.

## Time Zone

### TZ

This is the time zone that Alter Ego will operate in. Note that this is only used if Alter Ego is run in a Docker
container. If it is run directly in Node, it will use the system's time zone.

For help filling this out, see the [setting time zone](../moderator_guide/installation.md#setting-time-zone)
section of the installation article.

*Default: `America/New_York`*

## Credentials

For help filling these out, see the [setting credentials](../moderator_guide/installation.md#setting-credentials)
section of the installation article.

## Bot settings

### SPREADSHEET_ID

This is the ID of the spreadsheet that Alter Ego will read and write to. For help filling this out, see the
[setting spreadsheet ID](../moderator_guide/installation.md#setting-spreadsheet-id) section of the installation article.

### COMMAND_PREFIX

This is what users must begin their messages with in order to run a command. If Alter Ego detects that a message begins
with this string, it will pass the message into its command handler module to determine if it was a command or not, and
run it if it was.

*Default: `.`*

### DEBUG_MODE

This is a simple [Boolean value](https://en.wikipedia.org/wiki/Boolean_data_type). If this is `true`, Alter Ego will
start in debug mode. If this is `false`, it will start normally.

If debug mode is enabled, Alter Ego will output loaded data to the console whenever the
[load command](../reference/commands/moderator_commands.md#load) is used. Commands issued in the server will not be
deleted, and commands issued in DMs will be displayed in the console. Additionally, the
[startgame](../reference/commands/moderator_commands.md#startgame) and
[endgame](../reference/commands/moderator_commands.md#endgame) commands will be announced in the
[Testing channel](#testing_channel) instead of the [General channel](#general_channel), and only members with the
[Tester role](#tester_role) will be able to use the [play command](../reference/commands/eligible_commands.md#play).

Unless you plan to develop new features for Alter Ego, there is generally no reason to enable debug mode.

*Default: `false`*

### AUTO_LOAD

This is a Boolean value that determines if the game should be automatically loaded when Alter Ego boots up. It does the
equivalent of sending `load all resume`. This is useful if you reboot the bot frequently.

*Default: `false`*

## Gameplay settings

### PIXELS_PER_METER

This is how many pixels it takes to represent 1 meter on your [Map](../moderator_guide/mapmaking.md). When calculating
the amount of time it takes a player to move from one room to another, Alter Ego needs to convert the distance
between the two rooms from pixels to meters. In order to set this properly, find a part of your map with a standard
size (for example, a basketball court must be 28 x 15 meters according to the International Basketball Federation).
Divide the number of pixels making up its length by its length in meters. The result should go here.

*Default: `25`*

### STAMINA_USE_RATE

This is used to calculate how much stamina a player will lose every 1/10th of a second they are moving. You can change
this to be higher or lower, depending on how quickly you want players to lose stamina, but it should always be a
negative number.

*Default: `-0.01`*

### HEATED_SLOWDOWN_RATE

This number is used to slow down time when at least one player is inflicted with the "heated" Status Effect. To
accomplish this feat, the amount of time that elapses between ticks during player movement, player stamina recovery,
and timed Status Effects is multiplied by this number. This allows you to narrate heated situations such as combat
without worrying about how much time is passing. The lower this number, the more slowed down time will become. Players
are not informed that time is being slowed, so setting this number too low can tip them off that a
heated situation is ongoing.

*Default: `0.5`*

### AUTOSAVE_INTERVAL

This is how often, in seconds, Alter Ego should save all game data to the spreadsheet.

*Default: `30`*

### DICE_MIN

This is an integer that indicates the lowest possible number for a standard die roll. This should usually be set to `1`.

### DICE_MAX

This is an integer that indicates the highest possible number for a standard die roll. The default is `6`, but it can be
changed to any number higher than DICE_MAX.

### DEFAULT_DROP_FIXTURE

This is the name of the [Fixture](../reference/data_structures/fixture.md) in each room that players will drop Items on
if they don't specify one themselves. Every Room must have a Fixture with this name capable of holding Items. If they
don't, players _must_ specify where to drop Items.

*Default: `FLOOR`*

### DEFAULT_ROOM_ICON_URL

This is the URL of an image that will be inserted into
the [Room description message](../reference/data_structures/room.md#room-description)
when a player enters or inspects a Room if the Room does not have a unique icon URL. This must end in `.jpg`, `.jpeg`,
`.png`, `.gif`, `.webp`, or `.avif`.

If this is left blank and the Room does not have a unique icon URL, then Alter Ego will use the server icon
instead. If the server icon is not set, then no image will be sent in the description message.

*Default: blank*

### DEFAULT_CONCEALED_ICON_URL

This is the URL of an image that will be used as the display icon for a player or NPC who is inflicted with a status
effect with the [`concealed` behavior attribute](../reference/data_structures/status.md#concealed).
However, a new display icon can also be set with moderator or bot commands.
This must end in `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, or `.avif`.

*Default: `https://cdn.discordapp.com/attachments/697623260736651335/911381958553128960/questionmark.png`*

### HIDDEN_ICON_URL

This is the URL of an image that will be used as the display icon for a player or NPC speaks in the room while being
inflicted with a status effect with the [`hidden` behavior attribute](../reference/data_structures/status.md#hidden).
This must end in `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, or `.avif`.

*Default: `https://cdn.discordapp.com/attachments/697623260736651335/911381958553128960/questionmark.png`*

### AUTO_DELETE_WHISPER_CHANNELS

This is a Boolean value that determines whether or not [Whisper](../reference/data_structures/whisper.md) channels will
be automatically deleted when all players have left the room. If this is `true`, they will be deleted. If this is
`false`, they will be renamed `archived-(Room ID)`. Because [Discord](discord.md) only allows a single category
to have up to 50 channels, this should be `true` unless you plan on manually deleting Whisper channels when you no
longer need to see them.

*Default: `true`*

### READ_MESSAGE_HISTORY

This is a Boolean value that determines whether or not the Read Message History permission will be granted to the
@everyone role in the server. If this is `true`, then players will be able to read the message history for every channel
they enter, unless that channel has manual permission overwrites to disable it. This can grant them knowledge that their
character wouldn't and couldn't possibly know---a practice referred to as
[metagaming](https://en.wikipedia.org/wiki/Metagame).

Alter Ego was designed to make metagaming impossible, which is why this permission is disabled by default. It is
strongly recommended that this setting be left alone, but it can be enabled, if this is not a concern. When this setting
is changed, Alter Ego will update the Read Message History permission of the @everyone role to synchronize it with this
setting the next time it is rebooted.

*Default: `false`*

## Accent colors

### EMBED_ACCENT_COLOR

This is a string that determines the accent color of
[embeds](https://docs.discord.com/developers/resources/message#embed-object) sent by Alter Ego. String should be in the
format of a 24-bit hexadecimal number without a hash symbol, e.g. `1F8B4C`.

*Default: `1F8B4C`*

### STANDARD_MESSAGE_DISPLAY_ACCENT_COLOR

This is a string that determines the accent color of messages sent by Alter Ego that use its
[`STANDARD` message display type](discord.md#standard).
String should be in the format of a 24-bit hexadecimal number without a hash symbol, e.g. `1F8B4C`.

*Default: `1F8B4C`*

### WARNING_MESSAGE_DISPLAY_ACCENT_COLOR

This is a string that determines the accent color of messages sent by Alter Ego that use its
[`WARNING` message display type](discord.md#warning).
String should be in the format of a 24-bit hexadecimal number without a hash symbol, e.g. `FFC107`.

The default color was chosen to be attention-grabbing, with a clear meaning. It is recommended to leave this alone.

*Default: `FFC107`*

### ALERT_MESSAGE_DISPLAY_ACCENT_COLOR

This is a string that determines the accent color of messages sent by Alter Ego that use its
[`ALERT` message display type](discord.md#alert).
String should be in the format of a 24-bit hexadecimal number without a hash symbol, e.g. `FF0E0E`.

The default color was chosen to be attention-grabbing, with a clear meaning. It is recommended to leave this alone.

*Default: `FF0E0E`*

## Bot status message

### SHOW_ONLINE_PLAYER_COUNT

This is a Boolean value that determines whether or not the bot shows the number of online players (that is, players who
are not asleep and are active) in its status.

*Default: `true`*

## Bot activity

These are Discord user activities that Alter Ego will set for itself at certain times. They each have two options:

- **type**: This is the verb that will be used. This is
  a [Discord ActivityType](https://discord.js.org/docs/packages/discord.js/14.25.1/ActivityType:Enum),
  so valid strings are:
    - PLAYING
    - STREAMING
    - LISTENING
    - WATCHING
    - CUSTOM
    - COMPETING
- **string**: This is the name of the activity that will be used after the verb.

### ONLINE_ACTIVITY_TYPE, ONLINE_ACTIVITY_STRING

This is the activity that Alter Ego will set for itself when it comes online.
Alter Ego will set its status to Online.

*Type Default: `CUSTOM`*

*String Default: `Waiting for commands...`*

### DEBUG_MODE_ACTIVITY_TYPE, DEBUG_MODE_ACTIVITY_STRING

This is the activity that Alter Ego will set for itself when it comes online in debug mode.
Alter Ego will set its status to Do Not Disturb.

*Type Default: `PLAYING`*

*String Default: `Debug Mode`*

### GAME_IN_PROGRESS_ACTIVITY_TYPE, GAME_IN_PROGRESS_ACTIVITY_STRING, GAME_IN_PROGRESS_ACTIVITY_URL

This is the activity that Alter Ego will set for itself when a game has begun.
Alter Ego's status will be set to Online, however if a valid Twitch or YouTube URL is set, it will appear
to be streaming. The number of players online will be appended and updated periodically if `SHOW_ONLINE_PLAYER_COUNT`
is set to `true`.

*Type Default: `STREAMING`*

*String Default: `NWP`*

*Url Default: `https://www.twitch.tv/twitch`*

## Default player data

All of the settings in this section will be uploaded to the Players sheet when the startgame timer ends. They can be
changed to suit each individual player on the spreadsheet itself before all game data is loaded for the first time.

### DEFAULT_PRONOUNS

This is the default [pronoun string](../reference/data_structures/player.md#pronoun-string) that each player will have.
Once it is on the spreadsheet, it should be edited to suit each player.

*Default: `neutral`*

### DEFAULT_VOICE

This is the default [original voice string](../reference/data_structures/player.md#original-voice-string) that each
player will have.
Once it is on the spreadsheet, it should be edited to suit each player.

*Default: `a neutral voice`*

### Default Stats

These are the default [stats](../reference/data_structures/player.md#stats) a player will have. These should generally
be changed on the spreadsheet to suit each individual player before the game is officially started. These must be a
whole number between 1 and 10.

#### DEFAULT_STR

This is the strength stat that each player will have by default. For more information, read the
[strength section](../reference/data_structures/player.md#strength) of the Player article.

*Default: `5`*

#### DEFAULT_PER

This is the perception stat that each player will have by default. For more information, read the
[perception section](../reference/data_structures/player.md#perception) of the Player article.

*Default: `5`*

#### DEFAULT_DEX

This is the dexterity stat that each player will have by default. For more information, read the
[dexterity section](../reference/data_structures/player.md#dexterity) of the Player article.

*Default: `5`*

#### DEFAULT_SPD

This is the speed stat that each player will have by default. For more information, read the
[speed section](../reference/data_structures/player.md#speed) of the Player article.

*Default: `5`*

#### DEFAULT_STA

This is the stamina stat that each player will have by default. For more information, read the
[stamina section](../reference/data_structures/player.md#stamina) of the Player article.

*Default: `5`*

### DEFAULT_LOCATION

This is the ID of the [Room](../reference/data_structures/room.md) that all players will start in at the
beginning of the game.

*Default: `Dorm 1`*

### DEFAULT_STATUS_EFFECTS

This is a comma-separated list of [Status Effects](../reference/data_structures/status.md) that will be inflicted on
all players at the beginning of the game.

*Default: `satisfied, well rested, clean, normal`*

### DEFAULT_INVENTORY

This is an [array](https://en.wikipedia.org/wiki/Array_data_structure) of arrays that creates the default player
inventory on the spreadsheet. This is used to initialize the Inventory Items sheet when the startgame timer ends. If you
wish to change the default inventory that players start with, you can do so here. Note that if the `#` character is
found in the container identifier slot, Alter Ego will replace it with a unique number for each player.
The format for default player inventory corresponds to the sheet format for inventory items, with the exception that the
player name column is not present.
While the default is multiple lines, it is simpler to specify a compact, single-line array.

*Default:*

```json
[
    ["NULL", "", "RIGHT HAND", "", "", "", ""],
    ["NULL", "", "LEFT HAND", "", "", "", ""],
    ["NULL", "", "HAT", "", "", "", ""],
    ["NULL", "", "GLASSES", "", "", "", ""],
    ["NULL", "", "FACE", "", "", "", ""],
    ["NULL", "", "NECK", "", "", "", ""],
    ["NULL", "", "ACCESSORY", "", "", "", ""],
    ["NULL", "", "CHEST", "", "", "", ""],
    ["DEFAULT SHIRT", "", "SHIRT", "", "1", "", "<desc><s>It's a plain, <procedural name=\"clothing color\"><poss name=\"white\">white</poss></procedural> T-shirt.</s></desc>"],
    ["NULL", "", "JACKET", "", "", "", ""],
    ["NULL", "", "BAG", "", "", "", ""],
    ["NULL", "", "GLOVES", "", "", "", ""],
    ["DEFAULT PANTS", "DEFAULT PANTS #", "PANTS", "", "1", "", "<desc><s>It's a plain pair of <procedural name=\"clothing color\"><poss name=\"light blue\">light blue</poss></procedural> jeans.</s> <s>It has two pockets on the front.</s> <s>In the right pocket, you find <il name=\"RIGHT POCKET\"></il>.</s> <s>In the left pocket, you find <il name=\"LEFT POCKET\"></il>.</s></desc>"],
    ["DEFAULT UNDERWEAR", "", "UNDERWEAR", "", "1", "", "<desc><s>It's a plain, <procedural name=\"clothing color\"><poss name=\"white\">white</poss></procedural> pair of underwear.</s></desc>"],
    ["DEFAULT SOCKS", "", "SOCKS", "", "1", "", "<desc><s>It's a pair of plain, <procedural name=\"clothing color\"><poss name=\"white\">white</poss></procedural> ankle socks.</s></desc>"],
    ["DEFAULT SHOES", "", "SHOES", "", "1", "", "<desc><s>It's a pair of plain, <procedural name=\"clothing color\"><poss name=\"white\">white</poss></procedural> tennis shoes.</s></desc>"]
]
```

### DEFAULT_DESCRIPTION

This is the default description that will be applied to each player's Description cell on the Players sheet when the
startgame timer ends. Once it is on the spreadsheet, it should be edited to describe each player's appearance.

*Default:*

```xml
<desc><s>You examine <var v="this.displayName"/>.</s> <if cond="this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /> <if cond="this.pronouns.plural">are</if><if cond="!this.pronouns.plural">is</if> [HEIGHT], but <var v="this.pronouns.dpos" /> face is concealed.</s></if><if cond="!this.hasBehaviorAttribute('concealed')"><s><var v="this.pronouns.Sbj" /><if cond="this.pronouns.plural">'re</if><if cond="!this.pronouns.plural">'s</if> [HEIGHT] with [SKIN TONE], [HAIR], and [EYES].</s> <if cond="this.hasStatus('tired')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> bags under <var v="this.pronouns.dpos"/> eyes.</s></if><if cond="this.hasStatus('exhausted')"><s><var v="this.pronouns.Sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if> dark bags under <var v="this.pronouns.dpos"/> eyes.</s> <s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> absolutely **exhausted**.</s></if><if cond="this.hasStatus('delirious')"><s><var v="this.pronouns.Sbj"/> look<if cond="!this.pronouns.plural">s</if> completely **delirious**, like <var v="this.pronouns.sbj"/> <if cond="this.pronouns.plural">have</if><if cond="!this.pronouns.plural">has</if>n't slept in days.</s></if></if><br /><br /><s><var v="this.pronouns.Sbj" /> wear<if cond="!this.pronouns.plural">s</if> <il name="equipment"></il>.</s><if cond="this.getContainedItemsForItemList('equipment').length === 0"><s><var v="this.pronouns.Sbj" /> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> completely naked.</s></if> <s>You see <var v="this.pronouns.obj"/> carrying <il name="hands"></il>.</s> <if cond="this.hasStatus('stinky')"><s><var v="this.pronouns.Sbj"/>'<if cond="this.pronouns.plural">re</if><if cond="!this.pronouns.plural">s</if> a little stinky.</s></if><if cond="this.hasStatus('rancid')"><s><var v="this.pronouns.Sbj"/> smell<if cond="!this.pronouns.plural">s</if> absolutely **rancid**.</s></if> <if cond="this.hasStatus('soaking wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> soaking wet.</s></if><if cond="this.hasStatus('wet')"><s>Also, <var v="this.pronouns.sbj"/> <if cond="!this.pronouns.plural">is</if><if cond="this.pronouns.plural">are</if> a bit wet.</s></if></desc>
```

## Role IDs

In general, these should not need be changed, as they are now autopopulated by Alter Ego. However, if you created your
own roles instead of using a template, or if Alter Ego cannot find the correct role names, you can manually change the
IDs here.

In order to copy a role ID, make sure your Discord account
has [Developer Mode](../moderator_guide/installation.md#enable-developer-mode) enabled. Mention a role by typing
`@(Role name)` on Discord, but place a `\` before the `@` symbol. When you send the message, the role will display its
ID, which is a string of numbers.

### TESTER_ROLE

The Tester role is the role that members must have in order to use
[Eligible commands](../reference/commands/eligible_commands.md) when debug mode is enabled.
This should be the ID of the role in single quotes.

### ELIGIBLE_ROLE

The Eligible role is the role that members must have in order to use Eligible commands when debug mode is disabled.
This should be the ID of the role in single quotes.

### PLAYER_ROLE

The Player role is the role that members must have in order to use
[Player commands](../reference/commands/player_commands.md).
This should be the ID of the role in single quotes.

### FREE_MOVEMENT_ROLE

The Free Movement role allows players (who must also have the Player role) to move to any room they wish, adjacent or
not. This should generally not be given out freely.
This should be the ID of the role in single quotes.

### MODERATOR_ROLE

The Moderator role is the role that members must have in order to use
[Moderator commands](../reference/commands/moderator_commands.md).
This should be the ID of the role in single quotes.

### DEAD_ROLE

The Dead role is given to players when the [reveal command](../reference/commands/moderator_commands.md#reveal) is used.
This should be the ID of the role in single quotes.

### SPECTATOR_ROLE

The Spectator role is given to all players (living or dead) when the
[endgame command](../reference/commands/moderator_commands.md#endgame) is used.
This should be the ID of the role in single quotes.

## Category and channel IDs

In general, these should not need be changed, as they are now autopopulated by Alter Ego. However, if you created your
own channels instead of using a template, or if Alter Ego cannot find the correct channels, you can manually change
the IDs here.

In order to copy a category or channel ID, right click on it in the channel list and click **Copy ID**.

### ROOM_CATEGORIES

>[!WARNING]
> You can now use the `.createroomcategory` command to set these, so it is very unlikely that you will need to
> change this. If this is set, changes to the server config made by the `.createroomcategory` command will not
> persist across bot reboots.

This is a list of IDs of all of the category channels which contain [Rooms](../reference/data_structures/room.md).
Any channel contained within one of these categories will be considered a Room channel. Players and Moderators can send
commands and speak in these channels, and Alter Ego will recognize that messages in these channels are part of the game.
It will also attempt to create channels in these categories for any Rooms that don't already have
channels in the server.

This can be multiple categories because Discord only allows a single category to have 50 channels. Since this is too
restrictive for the game, Alter Ego allows you to divide the room channels amongst several categories, in whatever way
you like. The IDs for all room category channels should be separated by commas in a single string.

### WHISPER_CATEGORY

This is the category where Alter Ego will create [Whisper](../reference/data_structures/whisper.md) channels.
This should be the ID of the category in single quotes.

### SPECTATE_CATEGORY

This is the category where Alter Ego will create
[spectate channels](../reference/data_structures/player.md#spectate-channel) for each player.
This should be the ID of the category in single quotes.

### TESTING_CHANNEL

This channel is only necessary if you use debug mode. If you do, the startgame and endgame announcements will be made in
this channel instead of in the General channel, and members must have the Tester role to use Eligible commands.
This should be the ID of the channel in single quotes.

### GENERAL_CHANNEL

This channel is where the startgame and endgame announcements will be made. Members with the Eligible role can send
Eligible commands in this channel.
This should be the ID of the channel in single quotes.

### ANNOUNCEMENT_CHANNEL

This channel is used in very limited circumstances. If a message is sent in this channel by a player
with the Free Movement role, it will be sent to the spectate channels of all players.
This should be the ID of the channel in single quotes.

### COMMAND_CHANNEL

This channel is where Alter Ego will accept commands from a moderator.
This should be the ID of the channel in single quotes.

### LOG_CHANNEL

This channel is where Alter Ego will post the time and location of almost every in-game action. This keeps every in-game
occurrence in one place, in a linear order, which is useful for moderator reference.
This should be the ID of the channel in single quotes.

Due to the sheer number of messages that will be posted in this channel, it is strongly recommended you mute it.
