# Bot Commands

Bot commands are not usable by any Discord user. These commands are passed into the commandHandler module directly by
Alter Ego. Their purpose is to allow greater flexibility in behavior
for [Prefabs](../data_structures/prefab.md), [Events](../data_structures/event.md),
[Puzzles](../data_structures/puzzle.md), and [Flags](../data_structures/flag.md).
They allow many built-in restrictions placed on Players' actions to be bypassed.

Bot commands can only be used when a game is in progress. They can only be entered on the spreadsheet. Unlike other
commands, bot commands must not start with the [command prefix](../settings.md#command_prefix).

Bot commands which act upon Players generally have three different arguments that can be used in place of a Player's
name, but this isn't always the case.

These arguments are:

- `player`
    - The command will act on the Player who caused the command to be executed. For Prefabs, this is the Player who
      equipped/unequipped the Inventory Item. For Puzzles, this is the Player who solved/unsolved the Puzzle.
- `room`
    - The command will act on all Players in the same Room as the Player who caused the command to be executed.
      Alternatively, for Events, this is all Players in all Rooms affected by the Event.
- `all`
    - The command will act on all living Players, except for NPCs and Players with the Free Movement role.

### destroy

Destroys an item.

#### Aliases

`destroy` `ds`

#### Examples

    destroy VOLLEYBALL at beach
    ds CAN OF GASOLINE on SHELVES at Warehouse
    destroy NOTE in LOCKER 1 at Men's Locker Room
    ds WRENCH in TOOL BOX 1 at beach-house
    destroy WHITE GLOVES in BREAST POCKET of TUXEDO at dressing room
    ds all in TRASH CAN at lounge
    destroy player BLUE BIRD MUSIC BOX
    ds all FACE
    destroy room NUMBERED BRACELETds Vivian's VIVIANS LAPTOP in VIVIANS SATCHEL
    destroy SHOTPUT BALL in Cassie's MAIN POCKET of LARGE BACKPACK 1
    ds all in Hitoshi's HITOSHIS TROUSERS
    destroy all in Evad's FRONT POCKET of DENIM OVERALLS 6

#### Details

Destroys an item in the specified location or in the player's inventory. The prefab ID or container identifier of the
item must be given.

To destroy a room item, the display name or ID of the room it's in must be given at the end of the command, following "
at". To destroy an inventory item, the name of the player must be given followed by `'s` before the item's identifier.

If, when destroying an inventory item, "player" is supplied instead of a player's name, then the given item will be
destroyed from the inventory of the player who caused this command to be executed. If "room" is supplied instead, then
the command will be executed on all players in the room as the initiating player. If "all" is supplied instead, then the
command will be executed on all living players, including NPCs and players with the Free Movement role.

It is possible to specify the container from which to destroy the item. To do so, add the container's preposition or "
in" after the item's identifier, followed by the container's name. If the container is another item, its identifier or
prefab ID must be used. The ID of the inventory slot to destroy the item from can also be specified, followed by "of".
If you enter "all" in place of an item's identifier and specify a container, all items in that container will be
destroyed.

It is also possible to destroy an inventory item by specifying only the ID of the equipment slot it's equipped to
instead of the item's identifier. This will destroy whatever is equipped to that equipment slot.

Note that if you destroy an inventory item, the player will be notified if it is an item they have equipped, and its
unequipped commands will be executed. The player will not be notified if it is an item they have stashed.

### event

Triggers or ends an event.

#### Aliases

`event` `trigger` `end`

#### Examples

    event trigger RAIN
    event end EXPLOSION
    trigger INTRUDER LOOSE ALERT
    end BLACKOUT

#### Details

Triggers or ends the specified event.

If `trigger` is used, the event must not already be ongoing. Its triggered commands will be executed. If `end` is used,
the event must be ongoing. Its ended commands will be executed.

Triggered/ended commands will not be executed if this command was called by the triggered/ended commands of another
event. They will executed if they were called by the commands of a different type of game entity, however.

### exit

Locks or unlocks an exit.

#### Aliases

`exit` `room` `lock` `unlock`

#### Examples

    exit lock Carousel DOOR
    exit unlock Chancellor's Quarters DOOR
    lock warehouse DOOR 3
    unlock floor-b1-hall-3 ELEVATOR

#### Details

Locks or unlocks an exit in the specified room. The corresponding entrance in the room the exit leads to will also be
locked/unlocked. When an exit is locked, players will be unable to move through that exit.

### fixture

Activates or deactivates a fixture, or sets its recipe tag.

#### Aliases

`fixture` `object` `activate` `deactivate`

#### Examples

    fixture activate BLENDER
    fixture deactivate MICROWAVE
    fixture tag BLENDER puree
    activate KEURIG Kyra
    deactivate OVEN player
    fixture activate FIREPLACE Log Cabin
    fixture deactivate FOUNTAIN flower-garden
    fixture tag BLENDER puree kitchen
    activate FREEZER player "player plugs in the FREEZER."
    deactivate WASHER 1 laundry-room "WASHER 1 turns off"

#### Details

This command has three sub-commands:

- **activate**: Activates the specified fixture. When a fixture is activated, it will begin processing the recipe with
  the highest count of ingredients satisfied by the room items contained inside of it. If no recipe is found, it will
  look for one that it can process every second while it is activated.
- **deactivate**: Deactivates the specified fixture. It will stop processing and looking for recipes.
- **tag**: Sets the fixture's recipe tag. This will immediately stop any ongoing recipe processes. If it is currently
  activated, it will begin looking for recipes it can process that satisfy the new tag. The spreadsheet will be updated
  with the new tag on the next save.

Keep in mind that a fixture can only be activated/deactivated if it has a recipe tag. If there is a puzzle whose state
is supposed to match that of the fixture's, you must use the `puzzle` command to update it separately.

If there are multiple fixtures with the same name, you can specify the room the fixture is in.

Alternatively, you may specify a player to activate/deactivate the fixture. In this case, only fixtures in the same room
as the player can be activated/deactivated. When a player is supplied, a narration will be sent. You may also enter "
player" instead of directly specifying the name of a player. In this case, the player who caused this command to be
executed will be the one made to activate/deactivate the fixture.

It is possible to supply a custom narration for the fixture being activated/deactivated. Simply add a string of text
surrounded by quotation marks at the end of the command. This can be done even without supplying a player. If the "
player" argument is used, the text "player" (case-sensitive) within a custom narration will be replaced with the display
name of the player who activates/deactivates the fixture.

### flag

Set and clear flags.

#### Aliases

`flag` `setflag` `clearflag`

#### Examples

    flag set COLD SEASON FLAG true
    setflag HOT SEASON FLAG False
    flag set TV PROGRAMMING 4
    setflag INDOOR TEMPERATURE {THERMOSTAT}
    flag set TV PROGRAMMING += 1
    setflag INDOOR TEMPERATURE -= 4.1
    flag set player BALANCE += 150
    setflag player BALANCE -= 21.5
    flag set SOUP OF THE DAY "French Onion"
    setflag BLOOD SPLATTER “player WAS HERE”
    flag set PRECIPITATION `` `findEvent('RAIN').ongoing === true || findEvent('SNOW').ongoing === true` ``
    setflag RANDOM ANIMAL `` `getRandomString(['dog', 'cat', 'mouse', 'owl', 'bear'])` ``
    flag clear BLOOD SPLATTER
    clearflag TV PROGRAMMING
    flag clear player DEBT
    clearflag player DEBT

#### Details

Set and clear flags.

- **set**: Sets the flag value as the specified input. If the flag does not already exist, then a new one will be
  created with the specified name. The specified value must be a boolean, number, or string. String values must be
  surrounded by quotation marks. If a string contains "player", and the command was executed because of a player's
  actions, it will be replaced with their display name. To add or subtract from the flag's current number value, prefix
  the number to add or subtract with `+=` or `-=`. If you want to set the flag's value script, surround your input with
  `` `tics` ``. This script will immediately be evaluated, and the flag's value will be set accordingly. Whether the
  flag's value or value script is set, the flag's set commands will be executed, unless the flag was set by another
  flag.

- **clear**: Clears the flag value. This will replace the flag's current value with `null`. When this is cleared, the
  flag's cleared commands will be executed, unless the flag was cleared by another flag.

For both sub-commands, if the command was executed because of a player's actions, and the ID of the flag contains "
player" (case-sensitive), "player" will be replaced with the player's name. If a flag with that ID exists, it will have
its value set or cleared accordingly. Otherwise, "player" will be treated as a literal part of the ID.

### instantiate

Generates an item.

#### Aliases

`instantiate` `create` `generate` `is` `gn`

#### Examples

    instantiate RAW FISH on FLOOR at Beach
    create PICKAXE in LOCKER 1 at mining-hub
    generate 3 EMPTY DRAIN CLEANER in CUPBOARDS at Kitchen
    instantiate GREEN BOOK in MAIN POCKET of LARGE BACKPACK 1 at dorm-library
    is 4 SCREWDRIVER in TOOL BOX at Beach House
    gn WET CLAY POT (quality = excellent) on POTTERY WHEEL at Art Studio
    instantiate KATANA in player RIGHT HAND
    create GORILLA MASK on all FACE
    instantiate NECK CLAMP to room NECK
    generate VIVIANS LAPTOP in Vivian's VIVIANS SATCHEL
    is 2 SHOTPUT BALL in Cassie's MAIN POCKET of LARGE BACKPACK
    gn 3 GACHA CAPSULE (color=metal + character=upa) in Asuka's LEFT POCKET of GAMER HOODIE

#### Details

Generates a room item or inventory item in the specified location. The prefab ID must be used. A quantity can also be
set by supplying a number before the prefab ID. If no quantity is given, the item will be instantiated with a quantity
of 1.

If the prefab has procedural options, they can be manually selected in parentheses. To do this, write the name of the
procedural tag and the poss tag to select within it, separated by an equal sign (`=`). Multiple procedural selections
can be made, separated by a plus sign (`+`).

To instantiate a room item, the display name or ID of the room must be given at the end, following "at". The container
to put it in must also be specified after the prefab's ID, preceded by the container's preposition or "in". If the
container is a fixture with a child puzzle, the puzzle will be its container. If the container is another room item, the
container's identifier, prefab ID, or name can be used.

To instantiate an inventory item, the name of the player must be given followed by `'s`. It is possible to instantiate
an inventory item directly to a player's equipment slot by specifying the equipment slot's ID. In this case, the player
will be notified that they equipped the item, and the prefab's equipped commands will be executed. However, a container
item can be specified instead by entering its preposition or "in" followed by its identifier, prefab ID, or name. The
player will not be notified when the item is instantiated this way.

If, when instantiating an inventory item, "player" is supplied instead of a player's name, then the prefab will be
instantiated in the inventory of the player who caused this command to be executed. If "room" is supplied instead, then
the command will executed on all players in the room as the initiating player. If "all" is supplied instead, then the
command will be executed on all living players, including NPCs and players with the Free Movement role.

If the container to instantiate the item into is a room item or inventory item, the ID of the inventory slot to
instantiate the item into can be specified, followed by "of" before the container's identifier.

### kill

Kills a player.

#### Aliases

`kill` `die`

#### Examples

    kill Platt
    die Strickland Wu Obi Katou
    kill player
    die room

#### Details

Kills the listed players. Player names must be separated by a space. If, instead of specifying the names of players, you
enter "player", then the player who caused this command to be executed will be killed. If "room" is used instead, then
all players in the room with the initiating player will be killed, including NPCs and players with the Free Movement
role. However, if the command was issued by an event and the "room" argument is used, all players in all rooms that have
the event's room tag will be killed.

When a player is killed, they are removed from the list of living players and added to the list of dead players. This
prevents them from using any player commands, thus making them unable to interact with the game world. When a player
dies, they are dead permanently. To bring them back to life, they must be manually edited on the spreadsheet. Only use
this command if you are absolutely sure.

Upon death, the player will be removed from whatever room and whisper channels they were in. The player will be
notified, and a narration will be sent indicating that they have died. All status effects the player had will be
cleared. They will retain any items they had in their inventory, but they will not be accessible in any way. In order to
make the player's corpse inspectable, it must be manually added to the appropriate location as a fixture, and their
inventory items must be manually added as room items.

A dead player will retain the Player role. To remove the Player role and give them the Dead role, use the `reveal`
command.

### move

Moves the given player to the specified room.

#### Aliases

`move` `go` `enter` `walk` `m`

#### Examples

    move Flint Chancellor's Office
    enter player general-managers-office
    go player Dining Hall
    move room ultimate-conference-hall
    m all Elevator

#### Details

Forcibly moves the given players to the specified room. When a player is moved, they will be removed from the room
channel they were already in and added to the destination room channel. They will move to the given destination
immediately, without consuming any stamina, and with no regard for whether the room is adjacent to their current room or
the exit leading to it is locked.

You can select multiple players by separating their names with a space. If instead of providing the names of players,
you enter "all", all living players will be moved to the specified room, except for players who are already in that
room, NPCs, and players with the Free Movement role. However, if you instead use "player", the player who caused this
command to be executed will be moved to the given destination. If "room" is used instead, then all players in the room
with the initiating player will be moved, including NPCs and players with the Free Movement role. However, if the
command was issued by an event and the "room" argument is used, all players in all rooms that have the event's room tag
will be moved.

When this command is used to move a player to a room that is not adjacent to their current room, the narration in the
destination room will not specify which exit they entered from.

### puzzle

Solves or unsolves a puzzle.

#### Aliases

`puzzle` `solve` `unsolve` `attempt`

#### Examples

    puzzle solve TERMINAL
    puzzle unsolve SEARCH QUERY
    solve AISHA PROGRAM Ava
    unsolve BURIED TREASURE Jackie
    solve USERNAME jl
    solve USERNAME doublehelix
    puzzle solve CALL BUTTON Floor B2 Hall 1
    puzzle unsolve SWITCH dorm-6
    solve DRINK IN PROGRESS player "Amy begins preparing a drink for player."
    unsolve DRINK IN PROGRESS player "Amy places a glass of TEQUILA SUNRISE on the BAR counter for player."
    puzzle attempt COMPARTMENT player
    attempt 3D PRINTER rabbit Huiyu

#### Details

Solves or unsolves a puzzle. You may specify an outcome, if the puzzle has more than one solution. When a puzzle is
solved, it will execute the solved commands for the outcome it was solved with. When a puzzle is unsolved, it will
execute the unsolved commands for the outcome it currently has. If there is a fixture whose state is supposed to match
that of the puzzle's, you must use the `fixture` command to update it separately.

If there are multiple puzzles with the same name, you can specify the room the puzzle is in.

Alternatively, you may specify a player to solve/unsolve the puzzle. In this case, only puzzles in the same room as the
player can be solved/unsolved. When a player is supplied, a narration will be sent. You may also enter "player" instead
of directly specifying the name of a player. In this case, the player who caused this command to be executed will be the
one made to solve/unsolve the puzzle.

It is possible to supply a custom narration for the puzzle being solved/unsolved. Simply add a string of text surrounded
by quotation marks at the end of the command. This can be done even without supplying a player. If the "player" argument
is used, the text "player" (case-sensitive) within a custom narration will be replaced with the display name of the
player who solves/unsolves the puzzle.

Additionally, if you specify a player, you can make them attempt the puzzle with the `attempt` option. This makes it
possible to force the player to fail the puzzle because they didn't provide a correct solution or they didn't satisfy
the requirements for the puzzle to be solved/unsolved.

### say

Sends a message.

#### Aliases

`say`

#### Examples

    say Unit_050 Welcome. If you would like to listen to piano music, you may request a song, and I will perform it for you.
    say Trash Disposal A strange smell begins emanating from the INCINERATOR.

#### Details

Sends a message. A room or player must be specified.

If a message is sent to a room, it will be treated as a narration.

If the name of a player is specified and that player is an NPC, the player will speak in the channel of the room
they're in. Their dialog will be treated just like that of any normal player's. The image URL set in the player's
Discord ID will be used for the player's avatar. It is not possible to use this command on a non-NPC player.

It is recommended that you do not add line breaks to cells on the sheet. To add line breaks to the command,
enter `\n`. It will be replaced with an actual line break in the sent message.

Likewise, because the normal comma character is used as a delimiter in lists of bot commands, you can use the
full-width comma character instead (`，`), and it will be replaced with a normal comma in the message.

### set

Sets a fixture, puzzle, or group of room items as accessible or inaccessible.

#### Aliases

`set`

#### Examples

    set accessible puzzle ROCK CLIMBING WALL
    set inaccessible puzzle LOGIN Infirmary
    set accessible fixture BUNSEN BURNER
    set inaccessible fixture UNDERBRUSH path-2
    set accessible puzzle items LOCK robotics-lab
    set inaccessible puzzle items LOOSE CRATE
    set accessible fixture items DOLLHOUSE
    set inaccessible fixture items TOP OF THE SHELVES Library

#### Details

Sets a fixture, puzzle, or group of room items as accessible or inaccessible. You have to specify whether to set a
fixture or puzzle, even if you want to set a group of room items. When you use the optional "items" argument, it will
set all of the items contained in that fixture or puzzle as accessible/inaccessible at once. This will also update the
accessibility of all child items contained inside of those room items. It is not possible to set the accessibility of
individual room items.

You can also specify a room display name or ID at the end of the command. If you do, only fixtures/puzzles/room items in
the room you specify can be set as accessible/inaccessible. This is useful if you have multiple fixtures or puzzles with
the same name in different locations.

### setdefaultroomicon

Sets the default room icon.

#### Aliases

`setdefaultroomicon`

#### Examples

    setdefaultroomicon https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png
    setdefaultroomicon

#### Details

Sets the icon that will display by default when the given room's information is sent to a player, if there exists no
specific icon for that room. The icon given must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. To
reset the default icon, simply do not specify a new icon.

Note that this will not persist across bot reboots. When the bot is rebooted, the default room icon will be reverted to
whatever is set for the `DEFAULT_ROOM_ICON_URL` setting in your `.env` file.

### setdest

Updates an exit's destination.

#### Aliases

`setdest`

#### Examples

    setdest Truck DOOR Mountain Cave TRUCK
    setdest Mountain Entrance TRUCK Mountain Entrance TRUCK
    setdest motor-boat PORT docks BOAT
    setdest wharf MOTOR BOAT wharf MOTOR BOAT

#### Details

Replaces the destination for the specified room's exit. Given the following initial room setup:

| Room ID | Exits  | Leads To | From   |
|---------|--------|----------|--------|
| room-1  | EXIT A | room-2   | EXIT B |
| room-2  | EXIT B | room-1   | EXIT A |
|         | EXIT C | room-3   | EXIT D |
| room-3  | EXIT D | room-2   | EXIT C |

If the destination for room-1's EXIT A is set to room-3's EXIT D, players passing through EXIT A would emerge from EXIT
D from that point onward. The Rooms sheet will be updated to reflect the updated destination, like so:

| Room ID | Exits  | Leads To | From              |
|---------|--------|----------|-------------------|
| room-1  | EXIT A | room-3   | EXIT D <- updated |
| room-2  | EXIT B | room-1   | EXIT A            |
|         | EXIT C | room-3   | EXIT D            |
| room-3  | EXIT D | room-1   | EXIT A <- updated |

Note that this will leave room-2's EXIT B and EXIT C without exits that lead back to them, which will result in errors
next time rooms are loaded. To prevent this, this command should be used sparingly, and all affected exits should have
their destinations reassigned.

### setdisplayicon

Sets a player's display icon.

#### Aliases

`setdisplayicon` `sdi`

#### Examples

    setdisplayicon kyra https://cdn.discordapp.com/attachments/697623260736651335/912103115241697301/mm.png
    setdisplayicon player https://cdn.discordapp.com/attachments/697623260736651335/911381958553128960/questionmark.png
    setdisplayicon player

#### Details

Sets the icon that will appear as the given player's avatar when their communications are mirrored as webhook messages.
Webhook messages are primarily sent in spectate channels to reflect a player's dialog, narrations, and monologs.
However, webhook messages are also sent in room and whisper channels when a player uses the `say`, `gesture`, and
`narrate` commands. Because NPCs don't have Discord accounts, *all* of their communications are sent as webhook
messages.

To set a player's display icon, you must provide an image URL with an extension of .jpg, .jpeg, .png, .webp, or .avif.
To reset a player's display icon to their default display icon, simply specify the player without providing an image
URL. If you enter "player" instead of a player's name, then the player who caused this command to be executed will have
their display icon set.

When player data is reloaded, all players will have their display icon reverted to their default display icon. For
standard players, this is their server avatar, or their account avatar if they don't have one set. For NPCs, this is the
display icon given for them on the sheet in lieu of a Discord user ID.

Note that if the player is inflicted with a status effect with the `concealed` behavior attribute, their display icon
will be updated to the image URL set in the `DEFAULT_CONCEALED_ICON_URL` setting in your `.env` file, thus overwriting
one that was set manually. However, this command can be used to update their display icon again afterwards. When the
status is cured, it will be reset to their default display icon.

This command will not change the player's avatar when they send messages to room channels normally.

### setdisplayname

Sets a player's display name.

#### Aliases

`setdisplayname` `sdn`

#### Examples

    setdisplayname Sadie Zinnia
    sdn player an individual wearing a PLAGUE DOCTOR MASK
    setdisplayname player
    sdn player

#### Details

Sets the name that will be used to refer to a player in narrations in lieu of their actual name. It will also be set as
their username when their communications are reflected with webhook messages. Webhook messages are primarily sent in
spectate channels to reflect a player's dialog, narrations, and monologs. However, webhook messages are also sent in
room and whisper channels when a player uses the `say`, `gesture`, and `narrate` commands. Because NPCs don't have
Discord accounts, *all* of their communications are sent as webhook messages.

To set a player's display name, enter their actual name, followed by the new display name. Display names can contain
spaces, but they have a maximum length of 32 characters. If the display name does not begin with a proper noun, the
first letter should not be capitalized. To reset a player's display name to their actual name, simply specify the player
without providing a display name. If you enter "player" instead of a player's name, then the player who caused this
command to be executed will have their display name set.

Setting a player's display name will not change their name on the spreadsheet, and when player data is reloaded, their
display name will be reverted to their actual name.

Note that if the player is inflicted with a status effect with the `concealed` behavior attribute, their display name
will be updated, thus overwriting one that was set manually. However, this command can be used to update their display
name again afterwards. When the status is cured, their display name will be reset.

This command will not change the player's nickname in the server.

### setpos

Sets a player's position.

#### Aliases

`setpos`

#### Examples

    setpos player 200 5 350
    setpos room 400 -10 420
    setpos vivian x 350
    setpos player y 10
    setpos all z 250

#### Details

Sets the specified player's position. If the "player" argument is used in place of a name, then the player who caused
the command to be executed will have their position updated. If the "room" argument is used instead, then all players in
the same room as the player who caused the command to be executed will have their positions updated. Lastly, if the "
all" argument is used, then all players will have their positions updated, except for NPCs and players with the Free
Movement role. You can set individual coordinates with the "x", "y", or "z" arguments and the value to set it to.
Otherwise, a space-separated list of coordinates in the order **x y z** must be given.

### setpronouns

Sets a player's pronouns.

#### Aliases

`setpronouns`

#### Examples

    setpronouns Lain female
    setpronouns Amadeus neutral
    setpronouns Platt male
    setpronouns Unit_050 it\it\its\its\itself\false
    setpronouns Asuka she\it\her\its\herself\false
    setpronouns Hollow ey\em\eir\eirs\emself\true
    setpronouns Aeries xey\xem\xeir\xeirs\xemself\true
    setpronouns player female
    setpronouns player neutral
    setpronouns player male
    setpronouns player ey\em\eir\eirs\emself\true
    setpronouns player

#### Details

Sets the pronouns that will be used in the given player's description and other places where pronouns are used. This
will not change their pronouns on the spreadsheet, and when player data is reloaded, their pronouns will be reverted to
their original pronouns.

To set a player's pronouns, enter their name, followed by a set of pronouns. If you enter "player" instead of a player's
name, then the player who caused this command to be executed will have their pronouns set.
Pronoun sets must be given in the form:
`subjective\objective\dependent possessive\independent possessive\reflexive\plural`.
**Pay close attention.** Because bot command sets are separated by a forward slash (`/`), you must use a backward
slash (`\`) to separate pronouns in a pronoun set. However, you can also use shorthand for the most common pronoun sets:

- "female" (`she\her\her\hers\herself\false`),
- "male" (`he\him\his\his\himself\false`), and
- "neutral" (`they\them\their\theirs\themself\true`).

Note that if the player is inflicted with a status effect with the `concealed` behavior attribute, their pronouns will
be set to "neutral", thus overwriting any that were set manually. However, this command can be used to update their
pronouns again afterwards. When the status is cured, their pronouns will be reset.

### setroomicon

Sets a room's display icon.

#### Aliases

`setroomicon`

#### Examples

    setroomicon Living Room https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png
    setroomicon kitchen

#### Details

Sets the icon that will display when the given room's information is sent to a player. This will override whatever is
set as the `DEFAULT_ROOM_ICON_URL` setting in your `.env` file, but only for the given room. The icon given must be a
URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. To reset a room's icon, simply do not specify a new icon.
When this command is used, the new icon will be saved to the sheet in place of the old one.

### setvoice

Sets a player's voice.

#### Aliases

`setvoice`

#### Examples

    setvoice player a deep modulated voice
    setvoice player a high digitized voice
    setvoice Persephone multiple overlapping voices
    setvoice Ghost a disembodied voice
    setvoice Typhos Diego
    setvoice player Haru
    setvoice player

#### Details

Sets a player's voice descriptor that will be used when the player's dialog is heard by someone who can't see their
face.

To set a player's voice, enter their name, followed by a voice descriptor. It is assumed that voice descriptors will be
written in the form "a(n) [adjective] voice". It is also possible to enter the name of another player (living or dead)
instead of a voice descriptor. In this case, the first player's voice will sound exactly like the second player's, which
they can use to deceive other players. If you enter "player" instead of a player's name, then the player who caused this
command to be executed will have their voice set.

Setting a player's voice will not change their voice descriptor on the spreadsheet, and when player data is reloaded,
their voice will be reverted to their original voice descriptor.

Note that unlike other commands which change a player's characteristics, the player's voice will **not** be changed by
being inflicted or cured of a status effect with the `concealed` behavior attribute. If this command is used to change a
character's voice, it must be used again to change it back to normal. It can be reset to their original voice descriptor
by specifying the player without providing a voice descriptor.

### status

Inflict or cure status effects on a player.

#### Aliases

`status` `inflict` `cure`

#### Examples

    status add player heated
    status add room safe
    inflict all deafened
    inflict Diego heated
    status remove player injured
    status remove room restricted
    cure Flint injured
    cure all deafened

#### Details

This command has two sub-commands:

- **add**/**inflict**: Inflicts the specified player with the given status effect. The player will receive the "
  Description When Inflicted" message for the specified status effect. If they already have that status effect and there
  is a status listed in the "When Duplicated" column, they will be cured of the given status effect and inflicted with
  that instead. If the inflicted status has a timer, the player will be cured and then inflicted with the status effect
  in the "Develops Into" column when the timer reaches 0, if there is one. If the status effect is fatal, they will
  simply die when the timer reaches 0 instead.
- **remove**/**cure**: Cures the specified player of the given status effect. The player will receive the "Description
  When Cured" message for the specified status effect. If there is a status listed in the "When Cured" column, they will
  then be inflicted with that status effect.

If instead of providing the name of a player, you enter "all" or "living", all living players will be inflicted/cured of
the given status effect, except for NPCs and players with the Free Movement role. However, if you instead use "player",
the player who caused this command to be executed will be inflicted/cured. If "room" is used instead, then all players
in the room with the initiating player will be inflicted/cured, including NPCs and players with the Free Movement role.

### tag

Adds or removes a room's tags.

#### Aliases

`tag` `addtag` `removetag`

#### Examples

    tag add Kitchen video surveilled
    tag remove Kitchen audio surveilled
    addtag vault soundproof
    removetag freezer cold

#### Details

This command has two sub-commands:

- **add**/**addtag**: Adds a tag to the given room. Events that affect rooms with that tag will immediately apply to the
  given room, and any tag that gives a room special behavior will immediately activate those functions. The new tag will
  be added to the spreadsheet on the next save.
- **remove**/**removetag**: Removes a tag from the given room. Events that affect rooms with that tag will immediately
  stop applying to the given room, and any tag that gives a room special behavior will immediately stop functioning. The
  tags will be removed from the spreadsheet on the next save.

Note that unlike the moderator version of this command, you cannot add/remove multiple tags at once.

### wait

Waits a set number of seconds.

#### Aliases

`wait`

#### Examples

    wait 5
    wait 60
    wait 300

#### Description

Not a true command, but a pseudo-command. When this command is used in a list of commands, Alter Ego will wait for the
given number of seconds before executing the next command.
