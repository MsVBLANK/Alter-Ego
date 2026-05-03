# Moderator commands

Moderator commands are usable by users with
the [Moderator role](../settings.md#moderator_role). These commands allow
[moderators](../../moderator_guide/moderating.md) to control the game world and Players. They allow many built-in
restrictions placed on Players' actions to be bypassed.

Most moderator commands can only be used when a game is in progress, but some can be used when this isn't the case.
With the exception of the delete command (which can be used in any channel), all moderator commands must either be sent
to the [bot commands channel](../settings.md#command_channel) or in a [Room channel](../settings.md#room_categories).

If a command is issued in the bot commands channel, the message does not need to begin with the
[command prefix](../settings.md#command_prefix) (`.` by default). However, if it is sent in a Room channel, then the
command prefix is required.

### addplayer

Adds a player to the game.

#### Aliases

`.addplayer`

#### Examples

    .addplayer @cella

#### Details

Adds a user to the list of players for the current game. This command will give the specified user the Player role and
add their data to the Players and Inventory Items spreadsheets. This will be generated using the data in the
`Player Defaults` section of your `.env` file. However, their name will be set as whatever their current nickname is in
the server. So, you should set their nickname to their character's name before using this command. Note that edit mode
must be turned on in order to use this command. After using this command, you may edit the new player's data. Then, the
Players sheet must be loaded, otherwise the new player will not be created correctly, and their data may be overwritten.

### clean

Cleans the room items and inventory items sheets.

#### Aliases

`.clean` `.autoclean`

#### Examples

    .clean
    .autoclean

#### Details

Combs through all room items and inventory items and deletes any whose quantity is 0. All game data will then be saved
to the spreadsheet, not just room items and inventory items. This process will effectively clean the spreadsheet of room
items and inventory items that no longer exist, reducing the size of both sheets. Note that edit mode must be turned on
in order to use this command. The room items and inventory items sheets must be loaded after this command finishes
executing, otherwise data may be overwritten on the sheet during gameplay.

### craft

Crafts two items in a player's inventory together.

#### Aliases

`.craft` `.combine` `.mix` `.c`

#### Examples

    .craft Kris DRAIN CLEANER and PLASTIC BOTTLE
    .combine Colette's SLICE OF BREAD and SLICE OF CHEESE
    .mix Flint RED VIAL with BLUE VIAL
    .c Sid's BAR OF SOAP with CARVING KNIFE

#### Details

Creates a new item using the two items in the given player's hands. The prefab IDs or container identifiers of the items
must be separated by "with" or "and". If no recipe for those two items exists, the items cannot be crafted together. If
any of the resulting items is non-discreet, this will be narrated in the room, so other players will see the player
craft them.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### createroomcategory

Creates a room category.

#### Aliases

`.createroomcategory` `.register`

#### Examples

    .createroomcategory Floor 1
    .register Floor 2

#### Details

Creates a room category channel with the given name. The ID of the new category channel will automatically be added to
the `roomCategories` setting in your `serverconfig.json` file. If a room category with the given name already exists,
but its ID hasn't been registered in the `roomCategories` setting, it will automatically be added.

Keep in mind that if `ROOM_CATEGORIES` is set in your `.env` file, room categories registered with this command will not
persist when the bot is rebooted. For that reason, the `ROOM_CATEGORIES` setting should not be set unless you plan to
manage room category IDs manually. To do this, you will have to create a category channel in Discord without using this
command, and add its ID to the `ROOM_CATEGORIES` setting manually, then reboot the bot.

### dead

Lists all dead players.

#### Aliases

`.dead` `.died`

#### Examples

    .dead
    .died

#### Details

Lists all dead players.

### delete

Deletes multiple messages at once.

#### Aliases

`.delete`

#### Examples

    .delete 3
    .delete 100
    .delete @Alter Ego 5
    .delete @MolSno 75

#### Details

Deletes multiple messages at once. You can delete up to 100 messages at a time. Only messages from the past 2 weeks can
be deleted. You can also choose to only delete messages from a certain user. Note that if you specify a user and for
example, 5 messages, it will not delete that user's last 5 messages. Rather, it will search through the past 5 messages,
and if any of those 5 messages were sent by the given user, they wil be deleted.

This command can be used in any channel in the server.

### destroy

Destroys an item.

#### Aliases

`.destroy` `.ds`

#### Examples

    .destroy VOLLEYBALL at beach
    .ds CAN OF GASOLINE on SHELVES at Warehouse
    .destroy NOTE in LOCKER 1 at Men's Locker Room
    .ds WRENCH in TOOL BOX 1 at beach-house
    .destroy WHITE GLOVES in BREAST POCKET of TUXEDO 3 at dressing room
    .ds all in TRASH CAN at lounge
    .destroy Nero's KATANA
    .ds Yuda's RIGHT HAND
    .destroy Vivian's VIVIANS LAPTOP in VIVIANS SATCHEL
    .ds SHOTPUT BALL in Cassie's MAIN POCKET of LARGE BACKPACK 1
    .destroy all in Hitoshi's HITOSHIS TROUSERS
    .ds all in Evad's FRONT POCKET of DENIM OVERALLS 6

#### Details

Destroys an item in the specified location or in the player's inventory. The prefab ID or container identifier of the
item must be given.

To destroy a room item, the display name or ID of the room it's in must be given at the end of the command, following
"at". To destroy an inventory item, the name of the player must be given followed by `'s` before the item's identifier.

It is possible to specify the container from which to destroy the item. To do so, add the container's preposition or
"in" after the item's identifier, followed by the container's name. If the container is another item, its identifier or
prefab ID must be used. The ID of the inventory slot to destroy the item from can also be specified, followed by "of".
If you enter "all" in place of an item's identifier and specify a container, all items in that container will be
destroyed.

It is also possible to destroy an inventory item by specifying only the ID of the equipment slot it's equipped to
instead of the item's identifier. This will destroy whatever is equipped to that equipment slot.

Note that if you destroy an inventory item, the player will be notified if it is an item they have equipped, and its
unequipped commands will be executed. The player will not be notified if it is an item they have stashed.

### dress

Takes and equips all items from a container for a player.

#### Aliases

`.dress` `.redress`

#### Examples

    .dress Ezekiel WARDROBE
    .dress Kelly LAUNDRY BASKET 7
    .redress Luna MAIN POCKET of BLUE BACKPACK

#### Details

Takes all room items from the given container and equips them for the given player, if possible. The container's name
must be given, or its container identifier if it is a room item. The specified player must have a free hand to take an
item. The player dressing will be narrated in the room they're in.

Items will be equipped in the order in which they appear on the spreadsheet. If an item is equippable to an equipment
slot, but the player already has something equipped to that slot, it will not be equipped, and they will not be notified
when this happens. If the container has multiple inventory slots, you can specify which slot to dress from by entering
the ID of the inventory slot followed by "of" before the container. Otherwise, the player will dress from all slots.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### drop

Drops the given item from a player's inventory.

#### Aliases

`.drop` `.discard` `.put` `.place` `.d`

#### Examples

    .drop Fable's LARGE KNIFE
    .discard Fable LARGE KNIFE on COUNTER
    .put Kyra's COOKIE SHEET 3 in OVEN
    .place Kanda's WATERMELON in CRATE 1
    .d Ava WRENCH on TOP RACK of TOOL BOX

#### Details

Discards an item from the given player's inventory and leaves it in the room they're in. The item must be in one of the
player's hands. The item's prefab ID or container identifier must be used. If the player discards a non-discreet item,
this will be narrated in the room, so other players will see them drop it.

A container to drop the item into can be specified. To do so, add the container's preposition or "in" after the item's
identifier, followed by the container's name. If the container is a room item, its prefab ID or container identifier
must be used. If you don't specify a container, the player will leave the item on the `DEFAULT_DROP_FIXTURE` defined in
the game's settings.

If the container has multiple inventory slots, you can also specify which slot to put the item in. To do this, enter the
ID of the inventory slot followed by "of" before the container's identifier. If an inventory slot is not specified, the
player will put the item in the container's first inventory slot.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### dumplog

Dump current game state to file.

#### Aliases

`.dumplog`

#### Examples

    .dumplog

#### Details

Dumps a log of the most recently used commands, as well as current internal game state. This will generate two files.
The data_commands file will contain all successfully-issued commands that have been used recently, but keep in mind that
the bot only stores up to 10,000 commands at a time. The data_game file will contain the entirety of the bot's internal
memory relating to the game, with certain data types being truncated when nested. Because these files can be quite
large, and Discord has a maximum file size limit of 10 MiB, they will be compressed into a .gz file before being sent.
If the file size exceeds this, they will instead be saved to disk.

This command is for debugging purposes, and has no use during regular gameplay. If you discover a bug that was not
caused by moderator error, please use this command and attach these files to a new Issue on
the [Alter Ego GitHub page](https://github.com/MolSnoo/Alter-Ego/issues).

### editmode

Toggles edit mode for editing the spreadsheet.

#### Aliases

`.editmode` `.em`

#### Examples

    .editmode
    .em
    .editmode on
    .em on
    .editmode off
    .em off

#### Details

Toggles edit mode on or off, allowing you to make edits to the spreadsheet. When edit mode is turned on, Alter Ego will
no longer save the game to the spreadsheet automatically. Additionally, all player activity, aside from speaking in room
channels or in whispers, will be disabled. Players who don't have the `unconscious` behavior attribute will be notified
when edit mode is enabled, so use it sparingly. Data will be saved to the spreadsheet before edit mode is enabled, so
you must wait until the confirmation message has been sent before making any edits, or your edits will be overwritten.
When you are finished making edits, be sure to load the updated spreadsheet data before disabling edit mode.

### endgame

Ends the game.

#### Aliases

`.endgame`

#### Examples

    .endgame

#### Details

Ends the game. All players will be removed from whatever room and whisper channels they were in. The Player and Dead
roles will be removed from all players, and they will be given the Spectator role.

**This command will clear all game data in memory.** While it is possible to load all data from the spreadsheet again
after using this command, players will need to have their roles reassigned manually.

### equip

Equips an item for a player.

#### Aliases

`.equip` `.wear` `.e`

#### Examples

    .equip Kyra's PLAGUE DOCTOR MASK
    .wear Lain WHITE PARKA
    .e Dexter KNIT WOOL SWEATER to SHIRT

#### Details

Equips an item to one of the given player's equipment slots. The item to equip must be in one of the player's hands.
When an item is equipped, it will be narrated in the room, regardless of whether it is discreet or not. If the item's
prefab has any equipped commands, they will be executed when it is equipped.

Any item can be equipped to any equipment slot with this command, regardless of whether its prefab is equippable or what
equipment slots it is restricted to. To specify which equipment slot to equip the item to, enter "to" after the prefab
ID or container identifier of the item, followed by the ID of the equipment slot. If no equipment slot is specified, the
player will equip it to the first equipment slot its prefab is restricted to.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### event

Triggers or ends an event.

#### Aliases

`.event` `.trigger` `.end`

#### Examples

    .event trigger RAIN
    .event end EXPLOSION
    .trigger INTRUDER LOOSE ALERT
    .end BLACKOUT

#### Details

Triggers or ends the specified event.

If `trigger` is used, the event must not already be ongoing. Its triggered commands will be executed. If `end` is used,
the event must be ongoing. Its ended commands will be executed.

### exit

Locks or unlocks an exit.

#### Aliases

`.exit` `.room` `.lock` `.unlock`

#### Examples

    .exit lock Carousel DOOR
    .exit unlock Chancellor's Quarters DOOR
    .lock warehouse DOOR 3
    .unlock floor-b1-hall-3 ELEVATOR

#### Details

Locks or unlocks an exit in the specified room. The corresponding entrance in the room the exit leads to will also be
locked/unlocked. When an exit is locked, players will be unable to move through that exit.

If the exit can also be locked or unlocked using the bot commands of a puzzle, you should not lock/unlock it with this
command. Instead, use the `puzzle` command to solve/unsolve it, so that the exit remains in sync with the puzzle that
controls it.

### find

Search in-game data.

#### Aliases

`.find` `.search` `.f`

#### Examples

    .find room dorm 201
    .search rooms stoke-hall
    .f fixture DESK
    .find fixtures at Chancellor's Office
    .search prefab FRIED RICE
    .f items THIGH HIGH
    .find room item LIFE PRESERVER at beach
    .search items in TRASH CAN
    .f room items on PREP STATIONS at dining-hall-kitchen
    .find roomitems COLORED PENCILS in MAIN POUCH of BACKPACK at school store
    .search recipes uncraftable
    .f recipes crafting producing GLASS OF ORANGE JUICE
    .find recipes processing using MILK, RAW EGG producing PANCAKE BATTER, EGGSHELL
    .search puzzles LOCK
    .f puzzle COMPUTER at infirmary
    .find events snow
    .search status effects medicated
    .f players an individual wearing a
    .find inventory items on JACKET
    .search inventoryitems in RIGHT POCKET of DEFAULT PANTS
    .f inventoryitem in Phoebe's RIGHT HAND
    .find inventory item in julie's MAIN POCKET of LUNA PURSE
    .search inventoryitem Lillie's BLUE FLANNEL
    .f gestures smile
    .find flag SEASON FLAG

#### Details

Search in-game data and display results with row numbers. You can search for any entry on the spreadsheet, but you must
specify which kind of data to find. With no arguments, all entries of that data type will be displayed. Results will be
divided into pages, with no more than 15 entries per page, or however many will fit in one Discord message. To narrow
down the results, you can add a search query. Queries are case-insensitive, and any entries which contain the search
query will be displayed. To examine an entry in more detail, use the view command.

It is also possible to add specifiers to your search for certain data types. Fixtures, Room Items, and Puzzles can be
filtered by location by ending your search query with "at" followed by the name of a Room. Recipes can be filtered by
type by starting your search with "crafting", "uncraftable", or "processing". It is also possible to filter Recipes by
comma-separated lists of ingredients and products. To filter by ingredients, prefix the list with "using"; to filter by
products, prefix the list with "producing". When using specifiers, it is not actually necessary to provide a search
query; the results will simply be all entries that match the specified criteria.

Room Items and Inventory Items can be filtered by container name and slot, by entering "[preposition] ([slot name]
of) [container name]". The container name is also a search query, so any container whose name, plural name, Prefab ID,
or container identifier contains the given string will be displayed; the same is not true for the slot, however. It is
also possible to filter Inventory Items by Equipment Slot and Player. To filter by Equipment Slot, enter "in" or "on",
followed by the name of an Equipment Slot. To filter by Player, enter their name followed by `'s`, directly after the
preposition, if there is one. Keep in mind that it is not possible to filter by Equipment Slot and container at the same
time.

To view search results in more detail, use the `view` command.

### fixture

Activates or deactivates a fixture, or sets its recipe tag.

#### Aliases

`.fixture` `.object` `.activate` `.deactivate`

#### Examples

    .fixture activate BLENDER
    .fixture deactivate MICROWAVE
    .fixture tag BLENDER puree
    .activate KEURIG Kyra
    .deactivate OVEN Noko
    .fixture activate FIREPLACE Log Cabin
    .fixture deactivate FOUNTAIN flower-garden
    .fixture tag BLENDER puree kitchen
    .activate FREEZER gabriella "Gabriella plugs in the FREEZER."
    .deactivate WASHER 1 laundry-room "WASHER 1 turns off"

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
as the player can be activated/deactivated. When a player is supplied, a narration will be sent.

It is possible to supply a custom narration for the fixture being activated/deactivated. Simply add a string of text
surrounded by quotation marks at the end of the command. This can be done even without supplying a player.

The **activate** and **deactivate** sub-commands support NPC latching. For more information, see the help details for
the `latch` command.

### flag

Set and clear flags.

#### Aliases

`.flag` `.setflag` `.clearflag`

#### Examples

    .flag set COLD SEASON FLAG true
    .setflag HOT SEASON FLAG False
    .flag set TV PROGRAMMING 4
    .setflag INDOOR TEMPERATURE 25.3
    .flag set TV PROGRAMMING += 1
    .setflag INDOOR TEMPERATURE -= 4.1
    .flag set SOUP OF THE DAY "French Onion"
    .setflag BLOOD SPLATTER “TWO MILKMEN GO COMEDY”
    .flag set PRECIPITATION `` `findEvent('RAIN').ongoing === true || findEvent('SNOW').ongoing === true` ``
    .setflag RANDOM ANIMAL `` `getRandomString(['dog', 'cat', 'mouse', 'owl', 'bear'])` ``
    .flag clear BLOOD SPLATTER
    .clearflag TV PROGRAMMING

#### Details

Set and clear flags.

- **set**: Sets the flag value as the specified input. If the flag does not already exist, then a new one will be
  created with the specified name. The specified value must be a boolean, number, or string. String values must be
  surrounded by quotation marks. To add or subtract from the flag's current number value, prefix the number to add or
  subtract with `+=` or `-=`. If you want to set the flag's value script, surround your input with `` `tics` ``. This
  script will immediately be evaluated, and the flag's value will be set accordingly. Whether the flag's value or value
  script is set, the flag's set commands will be executed, unless the flag was set by another flag.

- **clear**: Clears the flag value. This will replace the flag's current value with `null`. When this is cleared, the
  flag's cleared commands will be executed unless the flag was cleared by another flag.

### gesture

Performs a gesture for the given player.

#### Aliases

`.gesture` `.g`

#### Examples

    .gesture Astrid smile
    .g Ezekiel point at DOOR 1
    .gesture Holly wave Johnny
    .g Dexter sit CHAIR
    .gesture list
    .g list Kyra

#### Details

Makes the given player perform one of a set of pre-defined gestures. Everybody in the room with them will see them do
this gesture. This allows them to communicate non-verbally, though they cannot perform a gesture if they have one of the
gesture's disabled statuses. To see a list of all of the gestures they can currently perform, send the `gesture` command
followed by "list" and the name of the player. Omitting the name of a player after "list" will simply list all gestures
on the sheet.

Certain gestures may require a target to perform them. To specify a target, enter the identifier of the target directly
after the ID of the gesture. For a room item or inventory item, this must be its container identifier or prefab ID. For
any other type of target, it should be its name. Note that a gesture can only be performed with one target at a time.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### give

Gives a player's item to another player.

#### Aliases

`.give`

#### Examples

    .give Kanda's EMBALMING FLUID to Astrid
    .give Lucia BIRTHDAY PRESENT BOX 9 to Flint

#### Details

Transfers an item from the first player's inventory to the second player's inventory. Both players must be in the same
room. The item selected must be in one of the first player's hands. The receiving player must also have a free hand, or
else they will not be able to receive the item. If the giving player gives a non-discreet item to the receiving player,
it will be narrated in the room.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### help

Lists all commands available to you.

#### Aliases

`.help`

#### Examples

    .help
    .help status

#### Details

Lists all commands available to the user. If a command is specified, displays the help menu for that command.

### hide

Hides a player in the given fixture.

#### Aliases

`.hide` `.unhide`

#### Examples

    .hide Xenia DESK
    .hide Kiara SHOWER 1
    .unhide Aisha

#### Details

Forcibly hides a player in the specified fixture. They will be able to hide in the specified fixture even if it is
attached to a lock-type puzzle that is unsolved, and even if the hiding spot is beyond its capacity. To force them out
of hiding, use the `unhide` command.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### inspect

Inspects something for a player.

#### Aliases

`.inspect` `.investigate` `.examine` `.look` `.x`

#### Examples

    .inspect Michio DESK
    .examine Fable LARGE KNIFE
    .look Ava JUG OF ORANGE JUICE in REFRIGERATOR
    .x Florian WOOLEN MITTENS in MAIN POUCH of RED BACKPACK 1
    .investigate Ai AIS PISTOL
    .look Jun Amadeus
    .examine Kanda Huiyu
    .look Jackie Kyra's KYRAS GLASSES
    .x Unit_026 Jackie's JACKIES NECKLACE
    .inspect Aisha room

#### Details

Inspect something for the given player. The target must be the "room" argument, a fixture, a room item, a player, or an
inventory item, and it must be in the same room as the given player. The description will be parsed and sent to the
player. If the target is a fixture, or a non-discreet room item or inventory item belonging to the player, a narration
will be sent in the room.

When inspecting a room item or inventory item, the prefab ID or container identifier must be used. If the target is a
room item, you can specify which one to inspect by appending its container's preposition or "in" after the item's
identifier, followed by the container's name (if the container is a fixture or puzzle) or prefab ID or container
identifier (if the container is a room item).

If the target is an inventory item, you can specify the player that the inventory item belongs to by preceding the
item's identifier with the player's name followed by `'s`. The player can even inspect their own inventory items this
way. However, a player cannot inspect another player's non-discreet or stashed inventory items. Note that if a player
inspects a different player's inventory items, a narration will not be sent.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### instantiate

Generates an item.

#### Aliases

`.instantiate` `.create` `.generate` `.is` `.gn`

#### Examples

    .instantiate RAW FISH on FLOOR at Beach
    .create PICKAXE in LOCKER 1 at mining-hub
    .generate 3 EMPTY DRAIN CLEANER in CUPBOARDS at Kitchen
    .instantiate GREEN BOOK in MAIN POCKET of LARGE BACKPACK 1 at dorm-library
    .is 4 SCREWDRIVER in TOOL BOX at Beach House
    .gn WET CLAY POT (quality = excellent) on POTTERY WHEEL at Art Studio
    .instantiate KATANA in Nero's RIGHT HAND
    .create GORILLA MASK on Evad's FACE
    .generate VIVIANS LAPTOP in Vivian's VIVIANS SATCHEL
    .is 2 SHOTPUT BALL in Cassie's MAIN POCKET of LARGE BACKPACK
    .gn 3 GACHA CAPSULE (color=metal + character=upa) in Asuka's LEFT POCKET of GAMER HOODIE

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

If the container to instantiate the item into is a room item or inventory item, the ID of the inventory slot to
instantiate the item into can be specified, followed by "of" before the container's identifier.

### inventory

Lists a given player's inventory.

#### Aliases

`.inventory` `.i`

#### Examples

    .inventory Nero
    .i Aisha

#### Details

Lists all of the given player's equipment slots, and any items equipped to each one. The player's stashed items will be
listed underneath the container they're inside of, in parentheses. They will be preceded by the ID of the inventory slot
they're in.

In the player's inventory, the identifiers of all items will be contained in code blocks. This makes it easier to copy
them and paste them into other commands.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### kill

Kills a player.

#### Aliases

`.kill` `.die`

#### Examples

    .kill Platt
    .die Strickland Wu Obi Katou

#### Details

Kills the listed players. Player names must be separated by a space.

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

### knock

Knocks on a door for a player.

#### Aliases

`.knock`

#### Examples

    .knock Kanda DORM 2

#### Details

Knocks on an exit for the given player. This will be narrated in the room they're in, and in the room that the exit
leads to. If an exit has the `not knockable` exit tag, it cannot be knocked on.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### latch

Latches onto an NPC.

#### Aliases

`.latch` `.unlatch`

#### Examples

    .latch unit_050
    .latch Haru
    .latch
    .unlatch

#### Details

Latches onto an NPC player. If you issue a player-controlling command in a channel that the selected NPC is in while you
are latched, you do not have to specify which player to control. However, if you wish to control a different player in
that channel, you must still specify their name.

While latched, you can also speak for that NPC without using the `say` command. However, keep in mind that this prevents
you from sending narrations as a moderator in that channel.

Note that you cannot latch onto any player that is not an NPC.

To clear your latch, send the `latch` command without specifying an NPC, or use the `unlatch` alias.

### living

Lists all living players.

#### Aliases

`.living` `.alive`

#### Examples

    .living
    .alive

#### Details

Lists all living players.

### load

Loads game data.

#### Aliases

`.load` `.reload` `.las` `.lar`

#### Examples

    .load all start
    .las
    .load all resume
    .lar
    .load all
    .load rooms
    .load fixtures
    .load prefabs
    .load recipes
    .load room items
    .load roomitems
    .load puzzles
    .load events
    .load status effects
    .load players
    .load inventory items
    .load inventories
    .load gestures
    .load flags

#### Details

Loads game data from the spreadsheet and stores it in memory. You must specify what spreadsheet tab to load from. When
data from a particular tab is loaded, all data that was previously in memory for that tab will be cleared and replaced
with the newly-loaded data.

If there are any errors with the loaded game data, you will be warned, and the game cannot progress until they are fixed
and reloaded. However, some game data cannot be checked for errors with the load command. To check for errors in your
descriptions, use the `parse` command. At this time, it is not possible to check for errors in bot commands that appear
on the spreadsheet, until they are executed.

If game entities referenced data that has been reloaded (for example, fixtures reference the room they're located in),
the references will be updated to point to the new data, if possible. However, references can be broken, if newly-loaded
data does not contain the entities that other entities reference, and you will not be warned when this occurs. So, it is
good practice to load all game data together periodically.

To start the game, load all data and append "start" or "resume". When "start" is used, each living player will be sent
the description of the room they load into. When "resume" is used, the game is still started, but room descriptions will
not be sent to players. In general, "start" should be used when starting a game for the first time, and "resume" should
be used whenever the bot is rebooted. However, you do not have to do this if the `AUTO_LOAD` setting in your `.env` file
is set to `true`.

If you are loading data while a game is in progress, you should use the `editmode` command first.

### location

Tells you a player's location.

#### Aliases

`.location` `.l`

#### Examples

    .location Gabriella
    .l Amy

#### Details

Tells you the given player's location, with a link to the channel.

### move

Moves the given player to the specified room or exit.

#### Aliases

`.move` `.go` `.enter` `.walk` `.m`

#### Examples

    .move Kiki DOOR 2
    .enter Kiki Lingling Maple Wally biosphere-garden
    .go living Dining Hall
    .m all ELEVATOR

#### Details

Forcibly moves the given players to the specified room or exit. When a player is moved, they will be removed from the
room channel they were already in and added to the destination room channel. They will move to the given destination
immediately, without consuming any stamina, and with no regard for whether the room is adjacent to their current room or
the exit leading to it is locked.

You can select multiple players by separating their names with a space. If instead of providing the names of players,
you enter "living" or "all", all living players will be moved to the specified room, except for players who are already
in that room, NPCs, and players with the Free Movement role.

When this command is used to move a player to a room that is not adjacent to their current room, the narration in the
destination room will not specify which exit they entered from.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### narrate

Narrates an NPC's non-verbal actions.

#### Aliases

`.narrate` `.n`

#### Examples

    .narrate Ai She lands with a curtsy while balancing a tray with a tall stack of tablets on it in one hand.
    .n Unit_050 It sits up straight on the piano bench and prepares to play.
    .narrate Sid She is utterly perplexed by the $100 bill that's suddenly in the tip jar.
    .n Haru He walks over to the plushie rack and takes the used dog plushie. He puts it under the counter for safekeeping. Definitely not for easy access.

#### Details

Narrates non-verbal actions for an NPC. The name of an NPC must be specified. This narration will be sent to the room or
hiding spot the NPC is currently in. This behaves similarly to the `gesture` command, but it allows you to write more
complex narrations. Please note that you cannot send a narration that exceeds Discord's character limit, which is 2000
characters.

This command cannot be used to narrate actions for a non-NPC player. To do that, send a message in the room or whisper
channel they're currently in. This will be treated as a narration, but it will be clearly indicated as having been
written by you.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### occupants

Lists all occupants in a room.

#### Aliases

`.occupants` `.o`

#### Examples

    .occupants floor-b1-hall-1
    .o Ultimate Conference Hall

#### Details

Lists all occupants currently in the given room. If an occupant is in the process of moving, their move queue will be
included, along with the time remaining until they reach the next room in their queue. Note that the displayed time
remaining will not be adjusted according to the `HEATED_SLOWDOWN_RATE` setting. If a player in the game has the `heated`
status effect, movement times for all players will be displayed as shorter than they actually are. Occupants with the
`hidden` behavior attribute will also be listed alongside their hiding spots.

### ongoing

Lists all ongoing events.

#### Aliases

`.ongoing` `.events`

#### Examples

    .ongoing
    .events

#### Details

Lists all events which are currently ongoing, along with the time remaining on each one, if applicable.

### online

Lists all online players.

#### Aliases

`.online`

#### Examples

    .online

#### Details

Lists all players who are currently online.

### parse

Checks your descriptions for errors.

#### Aliases

`.parse` `.testparser`

#### Examples

    .parse
    .parse Kyra
    .parse plaintext
    .parse Ezekiel plain
    .testparser

#### Details

Runs all of your descriptions through the parser module. It will parse every single one and output the plain-text
results to a text file that will be sent to the command channel. If there are any errors with your descriptions, they
will be listed alongside the resulting file. It is important to fix all errors and warnings, or undesired behavior may
occur during gameplay.

You can input a player name to parse the text as if that player is reading it. This is useful if you want to see how
descriptions will appear to a given player. If you do not supply one, descriptions will be parsed as if they are being
read by a player named Cella.

You can specify "plain" or "plaintext" to output a file which consists only of plain text, with no XML. If you do, a
dictionary file will be generated and sent with the results. This dictionary will consist of all words that comprise
the IDs and names of in-game entities. Alter Ego will not run spellchecking for you, but you can use these files in
your preferred spellchecking program to look for errors. You will likely still need to add more words to the dictionary
yourself in order to avoid false flags in your preferred spellchecker; the dictionary Alter Ego generates will
simply act as a useful base.

### puzzle

Solves or unsolves a puzzle.

#### Aliases

`.puzzle` `.solve` `.unsolve` `.attempt`

#### Examples

    .puzzle solve TERMINAL
    .puzzle unsolve SEARCH QUERY
    .solve AISHA PROGRAM Ava
    .unsolve BURIED TREASURE Jackie
    .solve USERNAME jl
    .solve USERNAME doublehelix
    .puzzle solve CALL BUTTON Floor B2 Hall 1
    .puzzle unsolve SWITCH dorm-6
    .solve IRONWOOD TREES Jackie "Jackie takes a sturdy stance, holding her ax with confidence. With one-! two-! *three-!* swings, she chops through an IRONWOOD TREE, and it falls out of the way."
    .unsolve LOGIN infirmary "The COMPUTER automatically logs out"
    .puzzle attempt AISHA PROGRAM 05 4C 91 F1 04 1F AB F0 Ava
    .attempt 3D PRINTER rabbit Huiyu

#### Details

Solves or unsolves a puzzle. You may specify an outcome, if the puzzle has more than one solution. When a puzzle is
solved, it will execute the solved commands for the outcome it was solved with. When a puzzle is unsolved, it will
execute the unsolved commands for the outcome it currently has. If there is a fixture whose state is supposed to match
that of the puzzle's, you must use the `fixture` command to update it separately.

If there are multiple puzzles with the same name, you can specify the room the puzzle is in.

Alternatively, you may specify a player to solve/unsolve the puzzle. In this case, only puzzles in the same room as the
player can be solved/unsolved. When a player is supplied, a narration will be sent.

It is possible to supply a custom narration for the puzzle being solved/unsolved. Simply add a string of text surrounded
by quotation marks at the end of the command. This can be done even without supplying a player.

Additionally, if you specify a player, you can make them attempt the puzzle with the `attempt` option. This makes it
possible to force the player to fail the puzzle because they didn't provide a correct solution or they didn't satisfy
the requirements for the puzzle to be solved/unsolved.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### restore

Restores a player's stamina.

#### Aliases

`.restore`

#### Examples

    .restore Flint

#### Details

Sets the given player's stamina to its maximum value. This is based on their current max stamina, not their default
stamina. Note that this does not automatically cure the `weary` status effect.

### reveal

Gives a player the Dead role.

#### Aliases

`.reveal`

#### Examples

    .reveal Platt
    .reveal Strickland Wu Obi Katou

#### Details

Removes the Player role from the listed players and gives them the Dead role. All listed players must be dead.

### roll

Rolls a die.

#### Aliases

`.roll`

#### Examples

    .roll
    .roll Sadie
    .roll Christopher Nero
    .roll str Ai
    .roll strength Aisha Huiyu
    .roll perception Kanda
    .roll per Kyra Amadeus
    .roll dexterity Flint
    .roll dex Elijah Lucia
    .roll spd Luna
    .roll speed Xenia Fury
    .roll stamina Danica
    .roll sta Ezekiel Kelly

#### Details

Rolls a die. You can set the minimum and maximum possible values in your `.env` file with the `DICE_MIN` and `DICE_MAX`
settings, respectively.

If a stat and a player are specified, the result will have the modifier of the player's specified stat added to it. If
two players are specified, any status effects the second player has which affect the first player will be applied to the
first player, whose stats will be recalculated before their stat modifier is applied. Additionally, if a strength roll
is performed using two players, the second player's dexterity modifier will be inverted and applied to the first player'
s roll. Any modifiers will be mentioned in the result, but please note that the result sent has already had the
modifiers applied.

Valid stat inputs are: `str`, `strength`, `per`, `perception`, `dex`, `dexterity`, `spd`, `speed`, `sta`, `stamina`.

### save

Saves the game data to the spreadsheet.

#### Aliases

`.save`

#### Examples

    .save

#### Details

Manually saves the game data to the spreadsheet. Ordinarily, game data is automatically saved to the spreadsheet
periodically, as defined by the `AUTOSAVE_INTERVAL` in your `.env` file. However, this command allows you to save at any
time, even when edit mode is enabled.

### say

Sends a message.

#### Aliases

`.say`

#### Examples

    .say #general Hello. My name is Alter Ego.
    .say #park Haru taps the left part of the wall in certain locations in order, and it begins descending, revealing the entrance to PATH 10.
    .say amy One appletini, coming right up.

#### Details

Sends a message. A channel or player must be specified. Messages can be sent to any channel in the server, but if it is
sent to a room channel, it will be treated as a narration.

If the name of a player is specified and that player is an NPC, the player will speak in the channel of the room they're
in. Their dialog will be treated just like that of any normal player's. The image URL set in the player's Discord ID
will be used for the player's avatar. It is not possible to use this command on a non-NPC player.

It is possible to speak for an NPC without using this command. For more information, see the help details for the
`latch` command.

### set

Sets a fixture, puzzle, or group of room items as accessible or inaccessible.

#### Aliases

`.set`

#### Examples

    .set accessible puzzle ROCK CLIMBING WALL
    .set inaccessible puzzle LOGIN Infirmary
    .set accessible fixture BUNSEN BURNER
    .set inaccessible fixture UNDERBRUSH path-2
    .set accessible puzzle items LOCK robotics-lab
    .set inaccessible puzzle items LOOSE CRATE
    .set accessible fixture items DOLLHOUSE
    .set inaccessible fixture items TOP OF THE SHELVES Library

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

`.setdefaultroomicon`

#### Examples

    .setdefaultroomicon https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png
    .setdefaultroomicon

#### Details

Sets the icon that will display by default when the given room's information is sent to a player, if there exists no
specific icon for that room. The icon given must be a URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. To
reset the default icon, simply do not specify a new icon.

Note that this will not persist across bot reboots. When the bot is rebooted, the default room icon will be reverted to
whatever is set for the `DEFAULT_ROOM_ICON_URL` setting in your `.env` file.

### setdest

Updates an exit's destination.

#### Aliases

`.setdest`

#### Examples

    .setdest Truck DOOR Mountain Cave TRUCK
    .setdest Mountain Entrance TRUCK Mountain Entrance TRUCK
    .setdest motor-boat PORT docks BOAT
    .setdest wharf MOTOR BOAT wharf MOTOR BOAT

#### Details

Replaces the destination for the specified room's exit. Given the following initial room setup:

| Room ID | Exits  | Leads To | From   |
|---------|--------|----------|--------|
| room-1  | EXIT A | room-2   | EXIT B |
| room-2  | EXIT B | room-1   | EXIT A |
|         | EXIT C | room-3   | EXIT D |
| room-3  | EXIT D | room-2   | EXIT C |

If the destination for room-1's EXIT A is set to room-3's EXIT D, players passing through EXIT A would emerge from
EXIT D from that point onward. The Rooms sheet will be updated to reflect the updated destination, like so:

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

`.setdisplayicon` `.sdi`

#### Examples

    .setdisplayicon kyra https://cdn.discordapp.com/attachments/697623260736651335/912103115241697301/mm.png
    .setdisplayicon kyra

#### Details

Sets the icon that will appear as the given player's avatar when their communications are mirrored as webhook messages.
Webhook messages are primarily sent in spectate channels to reflect a player's dialog, narrations, and monologs.
However, webhook messages are also sent in room and whisper channels when a player uses the `say`, `gesture`, and
`narrate` commands. Because NPCs don't have Discord accounts, *all* of their communications are sent as webhook
messages.

To set a player's display icon, you must provide an image URL with an extension of .jpg, .jpeg, .png, .webp, or .avif.
To reset a player's display icon to their default display icon, simply specify the player without providing an image
URL.

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

`.setdisplayname` `.sdn`

#### Examples

    .setdisplayname Sadie Zinnia
    .sdn Kyra an individual wearing a PLAGUE DOCTOR MASK
    .setdisplayname Sadie Sadie

#### Details

Sets the name that will be used to refer to a player in narrations in lieu of their actual name. It will also be set as
their username when their communications are reflected with webhook messages. Webhook messages are primarily sent in
spectate channels to reflect a player's dialog, narrations, and monologs. However, webhook messages are also sent in
room and whisper channels when a player uses the `say`, `gesture`, and `narrate` commands. Because NPCs don't have
Discord accounts, *all* of their communications are sent as webhook messages.

To set a player's display name, enter their actual name, followed by the new display name. Display names can contain
spaces, but they have a maximum length of 32 characters. If the display name does not begin with a proper noun, the
first letter should not be capitalized.

Setting a player's display name will not change their name on the spreadsheet, and when player data is reloaded, their
display name will be reverted to their actual name.

Note that if the player is inflicted with a status effect with the `concealed` behavior attribute, their display name
will be updated, thus overwriting one that was set manually. However, this command can be used to update their display
name again afterwards. When the status is cured, their display name will be reset.

This command will not change the player's nickname in the server.

### setpronouns

Sets a player's pronouns.

#### Aliases

`.setpronouns`

#### Examples

    .setpronouns Lain female
    .setpronouns Amadeus neutral
    .setpronouns Platt male
    .setpronouns Unit_050 it/it/its/its/itself/false
    .setpronouns Asuka she/it/her/its/herself/false
    .setpronouns Hollow ey/em/eir/eirs/emself/true
    .setpronouns Aeries xey/xem/xeir/xeirs/xemself/true

#### Details

Sets the pronouns that will be used in the given player's description and other places where pronouns are used. This
will not change their pronouns on the spreadsheet, and when player data is reloaded, their pronouns will be reverted to
their original pronouns.

To set a player's pronouns, enter their name, followed by a set of pronouns. Pronoun sets must be given in the form:
`subjective/objective/dependent possessive/independent possessive/reflexive/plural`.
However, you can use shorthand for the most common pronoun sets:

- "female" (`she/her/her/hers/herself/false`),
- "male" (`he/him/his/his/himself/false`), and
- "neutral" (`they/them/their/theirs/themself/true`).

Note that if the player is inflicted with a status effect with the `concealed` behavior attribute, their pronouns will
be set to "neutral", thus overwriting any that were set manually. However, this command can be used to update their
pronouns again afterwards. When the status is cured, their pronouns will be reset.

### setroomicon

Sets a room's icon.

#### Aliases

`.setroomicon`

#### Examples

    .setroomicon Living Room https://media.discordapp.net/attachments/1290826220367249489/1441259427411001455/sLPkDhP.png
    .setroomicon kitchen

#### Details

Sets the icon that will display when the given room's information is sent to a player. This will override whatever is
set as the `DEFAULT_ROOM_ICON_URL` setting in your `.env` file, but only for the given room. The icon given must be an
attachment or URL with a .jpg, .jpeg, .png, .gif, .webp, or .avif extension. To reset a room's icon, simply do not
specify a new icon. When this command is used, the new icon will be saved to the sheet in place of the old one.

### setupdemo

Sets up a demo game.

#### Aliases

`.setupdemo`

#### Examples

    .setupdemo

#### Details

Populates an empty spreadsheet with default game data as defined in the `demodata.json` config file. This will create a
game environment to demonstrate most of the basic game mechanics.

If the channels for the demo game's rooms don't exist, they will be created automatically. This command will not create
any players for you. Once the demo data has been saved to the spreadsheet, you can use the `startgame` or `addplayer`
commands to add players, or manually add them to the spreadsheet. It is recommended that you have at least one other
Discord account to use as a player. Once the spreadsheet has been fully populated, you can use the `load` command with
the arguments `all start` to begin the demo.

**If there is already data on the spreadsheet, it will be overwritten. Only use this command if the spreadsheet is
currently blank.**

### setvoice

Sets a player's voice.

#### Aliases

`.setvoice`

#### Examples

    .setvoice Kyra a deep modulated voice
    .setvoice Spektrum a high digitized voice
    .setvoice Persephone multiple overlapping voices
    .setvoice Ghost a disembodied voice
    .setvoice Typhos Diego
    .setvoice Nero Haru
    .setvoice Kyra

#### Details

Sets a player's voice descriptor that will be used when the player's dialog is heard by someone who can't see their
face.

To set a player's voice, enter their name, followed by a voice descriptor. It is assumed that voice descriptors will be
written in the form "a(n) [adjective] voice". It is also possible to enter the name of another player (living or dead)
instead of a voice descriptor. In this case, the first player's voice will sound exactly like the second player's, which
they can use to deceive other players.

Setting a player's voice will not change their voice descriptor on the spreadsheet, and when player data is reloaded,
their voice will be reverted to their original voice descriptor.

Note that unlike other commands which change a player's characteristics, the player's voice will **not** be changed by
being inflicted or cured of a status effect with the `concealed` behavior attribute. If this command is used to change a
character's voice, it must be used again to change it back to normal. It can be reset to their original voice descriptor
by specifying the player without providing a voice descriptor.

### startgame

Starts a game.

#### Aliases

`.startgame` `.start`

#### Examples

    .startgame 24h
    .start 1h
    .startgame 30m
    .start 0.25m

#### Details

Starts a new game with a timed delay. You must specify an amount of time as a number followed by a unit, either hours
(`h`) or minutes (`m`). During this time, server members with the Eligible role will be able to voluntarily add
themselves to the game as players using the `play` command in the general channel. If debug mode is on, they must have
the Tester role, and send the command in the testing channel. When this occurs, they will be given the Player role, and
they will be added to the game's data as players with default player data as defined in the `Player Defaults` section
of your `.env` file.

When the timer you set reaches 0, all of the player data will be saved to the Players sheet. After that, you can edit
their data to accurately reflect their characters. If you edit their data before the timer expires, it will be
overwritten. When you are ready to begin the game, use the `load` command with the `all start` arguments.

**Only use this command if you are not planning to add players to the sheet yourself.** Any data already on the Players
and Inventory Items sheets will be overwritten by this command. If you just want an easier way to populate those sheets
without having to fill them out manually, use the `addplayer` command.

### stash

Stores a player's inventory item inside another inventory item.

#### Aliases

`.stash` `.store` `.s`

#### Examples

    .stash Vivian VIVIANS LAPTOP in VIVIANS SATCHEL
    .store Nero's KATANA in KATANA SHEATH
    .s Kyra's MASTER KEY in RIGHT POCKET of KYRAS LAB COAT 5
    .s Haru WATER BOTTLE in SIDE POUCH of GREEN BACKPACK 1

#### Details

Moves an item from the given player's hand into an inventory slot of one of their container items. The held item and
container item's prefab ID or container identifier must be used. If the player stashes a non-discreet item, this will be
narrated in the room.

The container item's identifier must be preceded by its preposition or "in". If the container item has multiple
inventory slots, you can also specify which slot to stash the item in. To do so, enter the ID of the inventory slot
followed by "of" before the container's identifier. If an inventory slot is not specified, the player will stash the
item in the container's first inventory slot. Note that it is not possible to stash an item in an inventory slot if
doing so would make it exceed its capacity.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### stats

Lists a given player's stats.

#### Aliases

`.stats`

#### Examples

    .stats Lucia

#### Details

Lists the given player's default and current stats, as well as the roll modifiers they have based on each of their
current stats, in square brackets. The maximum weight the player can currently carry will be listed, as well as how much
weight they are currently carrying. Additionally, the player's current stamina will be listed as a numerator over their
current maximum stamina. This shows how much stamina they have remaining.

### status

Inflict, cure, or view status effects on players.

#### Aliases

`.status` `.inflict` `.cure`

#### Examples

    .status add Ava Huiyu Kyra heated
    .inflict Xenia heated
    .status add Florian Michio Kanda Jackie asleep
    .inflict all deafened
    .status remove Flint injured
    .cure Elijah injured
    .status remove Astrid Kiara drunk
    .cure living asleep
    .status view Amadeus
    .status Mara

#### Details

This command has three sub-commands:

- **add**/**inflict**: Inflicts the specified players with the given status effect. Those players will receive the
  "Description When Inflicted" message for the specified status effect. If they already have that status effect and
  there is a status listed in the "When Duplicated" column, they will be cured of the given status effect and inflicted
  with that instead. If the inflicted status has a timer, the players will be cured and then inflicted with the status
  effect in the "Develops Into" column when the timer reaches 0, if there is one. If the status effect is fatal, they
  will simply die when the timer reaches 0 instead.
- **remove**/**cure**: Cures the specified players of the given status effect. Those players will receive the
  "Description When Cured" message for the specified status effect. If there is a status listed in the "When Cured"
  column, they will then be inflicted with that status effect.
- **view**/**status**: Views all of the status effects that one player currently has, along with the time remaining on
  each one, if applicable. This sub-command supports NPC latching. For more information, see the help details for the
  `latch` command.

If, when using the **inflict** or **cure** sub-commands, you enter "living" or all" instead of providing the names of
players, all living players will be inflicted/cured of the given status effect, except for NPCs and players with the
Free Movement role.

### tag

Adds, removes, or lists a room's tags.

#### Aliases

`.tag` `.addtag` `.removetag` `.tags`

#### Examples

    .tag add Kitchen video surveilled
    .tag remove Kitchen audio surveilled
    .addtag vault soundproof
    .removetag freezer cold
    .addtag Command Center video monitoring, audio monitoring
    .removetag command-center video monitoring, audio monitoring
    .tag list Kitchen
    .tags Kitchen

#### Details

This command has three sub-commands:

- **add**/**addtag**: Adds a comma-separated list of tags to the given room. Events that affect rooms with that tag will
  immediately apply to the given room, and any tags that give a room special behavior will immediately activate those
  functions. The new tags will be added to the spreadsheet on the next save.
- **remove**/**removetag**: Removes a comma-separated list of tags from the given room. Events that affect rooms with
  that tag will immediately stop applying to the given room, and any tags that give a room special behavior will
  immediately stop functioning. The tags will be removed from the spreadsheet on the next save.
- **list**/**tags**: Displays the list of tags currently applied to the given room.

### take

Takes the given item for a player.

#### Aliases

`.take` `.get` `.grab` `.t`

#### Examples

    .take Nero BUTCHERS KNIFE
    .get Unit_039 FIRST AID KIT
    .t Olavi BOTTLE OF MIDAZOLAM from MEDICINE CABINET
    .take Sadie TOWEL from BENCHES
    .grab Evad HAMMER from TOP RACK OF TOOLBOX 1
    .t Vivian CHEST KEY from RIGHT POCKET of VIVIANS SKIRT 4

#### Details

Takes an item from the room the given player is in and puts it in their inventory. They must have a free hand to take an
item. The item's prefab ID or container identifier must be used. If the player takes a non-discreet item, this will be
narrated in the room.

You can specify a container to take the item from. To do so, enter "from" after the item's identifier, followed by the
container's name. If the container is a room item, its prefab ID or container identifier must be used. If the container
item has multiple inventory slots, you can also specify which slot to take the item from. To do so, enter the ID of the
inventory slot followed by "of" before the container's identifier.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### testspeeds

Checks the move times between each exit.

#### Aliases

`.testspeeds`

#### Examples

    .testspeeds players
    .testspeeds stats

#### Details

Calculates the amount of time it takes to move between every exit in the game. Sends the results as a text file to the
command channel. An argument must be provided. If the "players" argument is given, then the move times will be
calculated for each player in the game. Note that the weight of any items the players are carrying will affect their
calculated speed. If the "stats" argument is given, then the move times will be calculated for hypothetical players with
speed from 1-10.

### text

Sends a text message from an NPC to a player.

#### Aliases

`.text`

#### Examples

    .text Amy Florian I work at the bar.
    .text Amy Florian Here's a picture of me at work. (attached image)
    .text ??? Sadie This is a message about your car's extended warranty.
    .text ??? Lisa (attached image)

#### Details

Sends a text message from the given NPC to a player. If an image is attached, it will be sent as well. It is possible to
send a text message to any player, even those that don't have a status effect with the `receive text`
behavior attribute.

This command supports NPC latching. For more information, see the help details for the `latch` command. However, keep in
mind that if you send a text with an attached image in the NPC's room channel, the message will be deleted, and the
attachment may not send properly.

### uncraft

Uncrafts an item for a player.

#### Aliases

`.uncraft` `.dismantle` `.disassemble` `.uc`

#### Examples

    .uncraft Olavi SHOVEL
    .dismantle Avani ASSEMBLED CROSSBOW
    .disassemble Juno LOADED PISTOL
    .uc Ray RING STAND WITH SUPPORT RING

#### Details

Separates an item in one of the given player's hands into its component parts. This reverses the process of a crafting
recipe, using the product of the recipe as an ingredient, and creating its ingredients as products. This will produce
two items, so they will need a free hand in order for this command to be usable. If there is no crafting recipe that
produces the given item which allows it to be uncrafted again, this command cannot be used.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### undress

Unequips and drops all items for a player.

#### Aliases

`.undress`

#### Examples

    .undress Haru
    .undress Aisha LOCKER 1
    .undress Astrid LAUNDRY BASKET 17
    .undress Xenia MAIN POCKET of XENIAS BACKPACK

#### Details

Unequips all of the player's equipped items and drops them in the room they're currently in. They will undress
completely, including any items in their hands. However, any items whose prefab is not equippable will not be removed
with this command. They can be forcibly removed with the `unequip` command. When the player undresses, it will narrated
in the room.

A container to drop the items into can be specified. To do so, enter the container's name. No preposition is necessary.
If the container is a room item, its prefab ID or container identifier must be used. If you don't specify a container,
they will leave the items on the `DEFAULT_DROP_FIXTURE` defined in the game's settings.

If the container has multiple inventory slots, you can also specify which slot to put the items in. To do this, enter
the ID of the inventory slot followed by "of" before the container's identifier. If an inventory slot is not specified,
the player will put the items in the container's first inventory slot. However, they will not be able to undress into an
inventory slot if the combined size of their items would overfill it.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### unequip

Unequips an item for a player.

#### Aliases

`.unequip` `.remove` `.u`

#### Examples

    .unequip Kyra's PLAGUE DOCTOR MASK
    .remove Lain WHITE PARKA
    .u Dexter KNIT WOOL SWEATER from SHIRT

#### Details

Unequips an item from one of the given player's equipment slots. The item will be placed in their hand, so they must
have a free hand. When an item is unequipped, it will be narrated in the room, regardless of whether it is discreet or
not. If the item's prefab has any unequipped commands, they will be executed when it is unequipped.

You can unequip any item with this command, even if its prefab is not equippable. You can also specify which equipment
slot to unequip the item from. To do so, enter "from" after the prefab ID or container identifier of the item, followed
by the ID of the equipment slot.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### unstash

Moves an inventory item into a player's hand.

#### Aliases

`.unstash` `.retrieve` `.r`

#### Examples

    .unstash Vivian's VIVIANS LAPTOP
    .retrieve Nero KATANA from KATANA SHEATH
    .r Kyra's MASTER KEY from RIGHT POCKET of KYRAS LAB COAT 5
    .r Haru WATER BOTTLE from SIDE POUCH of GREEN BACKPACK 1

#### Details

Moves an inventory item from a container item in the given player's inventory into their hand. They must have a free
hand to unstash an item. The item's prefab ID or container identifier must be used. If the player unstashes a
non-discreet item, this will be narrated in the room.

It is possible to specify a container to unstash an item from. To do so, enter "from" after the item's identifier,
followed by the container item's prefab ID or container identifier. If the container item has multiple inventory slots,
you can also specify which slot to unstash the item from. To do so, enter the ID of the inventory slot followed by "of"
before the container's identifier.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### use

Uses an item in the given player's inventory.

#### Aliases

`.use`

#### Examples

    .use Princeton FIRST AID KIT
    .use Michio TOOTHBRUSH WITH TOOTHPASTE
    .use Unit_039 ADHESIVE BANDAGE Huiyu "It applies an ADHESIVE BANDAGE over the wound, to prevent it from becoming infected again."
    .use Kanda's SYRINGE OF ESTRADIOL on Florian "Count Kanda quickly pushes the needle the rest of the way, injecting all of the fluid into Florian's body."

#### Details

Uses an item in one of the given player's hands. You can specify a second player for the first player to use the item
on. Both players must be in the same room. If no second player is given, the first player will use the item on themself.

When an item is used, it will inflict or cure the targeted player of any status effects listed under the "Gives Status
Effect(s)" and "Cures Status Effect(s)" columns for its prefab. If it has a limited number of uses, its uses will be
decremented by 1. If it reaches 0, the item will transform into its next stage prefab, or be destroyed if it doesn't
have one.

When a player uses an item, a narration will be sent in the room. It is possible to supply a custom narration for the
item being used. Simply add a string of text surrounded by quotation marks at the end of the command.

Note that you cannot solve puzzles using this command. To do that, use the `puzzle` command.

This command supports NPC latching. For more information, see the help details for the `latch` command.

### view

View a game entity.

#### Aliases

`.view` `.v`

#### Examples

    .view room 496
    .v room chancellors-office
    .view exit 497
    .v fixture 21
    .view prefab 75
    .v prefab COMBAT BOOTS
    .view recipe 43
    .v room item 1173
    .view item 692
    .v puzzle 81
    .view event 16
    .v event SUNRISE
    .view status effect 92
    .v status refreshed
    .view player 4
    .v player Sid
    .view inventory item 70
    .v inventoryitem 381
    .view gesture 102
    .v gesture point at
    .view flag 7
    .v flag AUTO LIGHTS

#### Details

View in-game data. You can view any entry on the spreadsheet, but you must specify which kind of data to find, as well
as its row number. If the entity has a unique ID, you can also view it using that. You will be shown most of the data
visible on the spreadsheet for that entity. To avoid exceeding Discord's character limit, some fields may be omitted.
These can be viewed with the interactables that are sent alongside the result.

To view a game entity that doesn't have a unique ID with this command, you must know its row number, which can be found
on the spreadsheet. Alternatively, you can obtain it with the `find` command.

### whisper

Initiates a whisper between the given players.

#### Aliases

`.whisper` `.w`

#### Examples

    .whisper Nestor Jun
    .w Sadie Elijah Flint
    .whisper Amy Asuka Clean it up.
    .w Amy Asuka The mess you made. Clean it up now.

#### Details

Creates a channel for the given players to whisper in. Only the selected players will be able to read messages posted in
the new channel, but a narration will be sent in the room indicating that they've begun whispering to each other. You
can select as many players as you want as long as they're all in the same room.

When a player in the whisper leaves the room, they will be removed from the channel. If everyone leaves the room, the
whisper channel will be deleted or archived, depending on the `AUTO_DELETE_WHISPER_CHANNELS` setting in your `.env`
file.

If one of the players listed is an NPC, any text that remains after the list of players will be sent to the new whisper
channel as dialog from that NPC. After the channel has been created, sending the command again with a different string
of text at the end will make the NPC whisper that text as dialog in the channel.

This command supports NPC latching. For more information, see the help details for the `latch` command.
