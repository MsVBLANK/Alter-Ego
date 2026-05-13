# Player commands

Player commands are usable by users with the [Player](../settings.md#player_role) role. These commands allow Players to
interact with the game world of their own volition.

Player commands can only be used when a game is in progress. They can be sent to Alter Ego through DM or in the channel
corresponding with the [Room](../data_structures/room.md) that the Player is in. The Player must
be [alive](../data_structures/player.md#alive) to use commands, and they must not be inflicted with
a [Status Effect](../data_structures/status.md) which disables the command they're trying to use. With few exceptions,
Players cannot use commands when [edit mode](../../moderator_guide/edit_mode.md) is enabled. If Alter Ego accepts the
Player's command and it was sent in a Room channel, the message in which the command was issued will be deleted.

If a command is issued in DMs, the message does not need to begin with the
[command prefix](../settings.md#command_prefix) (`.` by default). However, if it is sent in a Room channel, then the
command prefix is required.

### craft

Crafts two items in your inventory together.

#### Aliases

`.craft` `.combine` `.mix` `.c`

#### Examples

    .craft DRAIN CLEANER and PLASTIC BOTTLE
    .combine BREAD and CHEESE
    .mix RED VIAL with BLUE VIAL
    .craft SOAP with KNIFE

#### Details

Creates a new item using the two items in your hands. The names of the items must be separated by "with" or "and". If no
recipe for those two items exists, the items cannot be crafted together. If any of the resulting items is particularly
large, this will be narrated in the room, so other players will see you craft them.

You can view a list of all recipes that you can craft with the items in your inventory using the `recipes` command. Some
crafting recipes can be reversed once performed using the `uncraft` command. For more information on both of these
commands, use the `help` command.

### dress

Takes and equips all items from a container.

#### Aliases

`.dress` `.redress`

#### Examples

    .dress WARDROBE
    .dress LAUNDRY BASKET
    .redress MAIN POCKET of BLUE BACKPACK

#### Details

Takes all items from a container of your choosing and equips them, if possible. You must have a free hand to take items
with. This will be narrated, so any other players in the room will see you dress.

Items will be equipped in the order in which they appear in the game's data, which should be the order they appear in
the container's description. If an item is equippable to an equipment slot, but you already have something equipped to
that slot, it will not be equipped, and you will not be notified when this happens. If the container you choose has
multiple inventory slots (for example, a backpack with several pockets), you can specify which slot to dress from.
Otherwise, you will dress from all slots.

### drop

Discards an item from your inventory.

#### Aliases

`.drop` `.discard` `.put` `.place` `.d`

#### Examples

    .drop FIRST AID KIT
    .discard BASKETBALL
    .put KNIFE in SINK
    .d TOWEL on BENCHES
    .drop KEY in RIGHT POCKET of PLAID SKIRT
    .d WRENCH on TOP RACK of TOOL BOX

#### Details

Discards an item from your inventory and leaves it in the room you're currently in. The item you want to drop must be in
one of your hands. If you discard a very large item (a sword, for example), this will be narrated in the room, so other
players will see you drop it.

If you want to put the item in a specific fixture or item in the room, add a preposition after the name of the item,
followed by the container's name. Every container has a set preposition which should be fairly obvious. For example, a
fixture called "DESK" is likely to have the preposition "on". However, if the preposition is unclear, "in" will always
work. Keep in mind that not all fixtures and items can be item containers. If you don't specify a container, you will
simply leave the item on the floor.

If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which
slot you want to put the item in. To do this, enter the name of the inventory slot followed by "of" before the name of
the container. If you don't specify an inventory slot, you will put it in the first slot it has.

You can only put items in containers in the room that you're in. If you want to put an item in one of your inventory
items, use the `stash` command.

### equip

Equips an item.

#### Aliases

`.equip` `.wear` `.e`

#### Examples

    .equip PLAGUE DOCTOR MASK
    .wear WHITE PARKA
    .e KNIT WOOL SWEATER to SHIRT

#### Details

Equips an item to one of your equipment slots. The item you want to equip must be in one of your hands. When you equip
an item, it will be narrated in the room, so other people can see you equip it, regardless of its size. It will then
appear in your description, unless it's covered by another equipped item. For example, something equipped to your PANTS
slot is likely to cover something equipped to your UNDERWEAR slot.

Each item can only be equipped to certain equipment slots, if they're equippable at all. For example, a mask is likely
to only be equippable to the FACE slot. If you are unable to equip an item to its default equipment slot, you can
specify which slot you want to equip it to. To do this, enter "to" after the name of the item, followed by the name of
one of your equipment slots. You can view a list of all of your equipment slots with the `inventory` command.

To equip many items at once, use the `dress` command. If you wish to remove one of your equipped items, use the
`unequip` command.

### gesture

Performs a gesture.

#### Aliases

`.gesture` `.g`

#### Examples

    .gesture smile
    .g point at DOOR 1
    .gesture wave Johnny
    .g sit CHAIR
    .gesture list

#### Details

Performs one of a set of pre-defined gestures. Everybody in the room with you will see you do this gesture. This allows
you to communicate non-verbally, though some gestures cannot be performed if you have certain status effects. For
example, if your face is concealed with a mask, you cannot use gestures like "smile" or "frown", as nobody would be able
to see it. To see a list of all of the gestures you can currently perform, send the `gesture` command followed by
"list".

Certain gestures may require a target to perform them. For example, a gesture might require you specify an exit, a
fixture, another player, etc. To specify a target, enter the name of the target directly after the name of the gesture.
Note that a gesture can only be performed with one target at a time.

### give

Gives an item to another player.

#### Aliases

`.give`

#### Examples

    .give Astrid EMBALMING FLUID
    .g Flint BIRTHDAY PRESENT

#### Details

Transfers an item from your inventory to another player in the room. The item selected must be in one of your hands. The
receiving player must also have a free hand, or else they will not be able to receive the item. If a particularly large
item is given (a chainsaw, for example), it will be narrated in the room, so other players in the room will see you
giving it to the recipient.

### help

Lists all commands available to you.

#### Aliases

`.help`

#### Examples

    .help
    .help move

#### Details

Lists all commands available to the user. If a command is specified, displays the help menu for that command.

### hide

Hides you in a fixture.

#### Aliases

`.hide` `.unhide`

#### Examples

    .hide DESK
    .hide SHOWER 1
    .unhide

#### Details

Allows you to use a fixture in a room as a hiding spot. When hidden, you will be removed from the room's channel so that
when other players enter the room, they won't see you on the user list. They will also not see you listed as an occupant
when they enter the room. When players speak in the room that you're hiding in, you will hear what they say. While
hidden, many of your actions will be restricted. For example, you will only be able to inspect and take items that are
in the fixture you're hiding in.

Under normal circumstances, a whisper channel will be created for you to speak in. Most players will be unable to hear
what you say in this channel. However, if you want to speak so that everyone can hear you (while having your identity
remain a secret), use the `say` command. If someone hides in the same hiding spot as you, you will be placed in a
whisper channel together. If someone inspects or tries to hide in the fixture that you're hiding in, your position will
be revealed.

If you wish to come out of hiding, use the `unhide` command.

### inspect

Learn more about a fixture, item, or player.

#### Aliases

`.inspect` `.investigate` `.examine` `.look` `.x`

#### Examples

    .inspect DESK
    .examine KNIFE
    .look JUG OF ORANGE JUICE in REFRIGERATOR
    .x WOOLEN MITTENS in MAIN POUCH of RED BACKPACK
    .investigate my PISTOL
    .look Kiara
    .examine an individual wearing a PLAGUE DOCTOR MASK
    .look Marielle's CIRCLE GLASSES
    .x an individual wearing a PLAGUE DOCTOR MASK's BLACK CLOAK
    .inspect room

#### Details

Tells you about a fixture, item, or player in the room you're in. A fixture is something in the room that you can
interact with but not take with you. An item is something that you can both interact with and take with you. If you
inspect a fixture, everyone in the room will see you inspect it. The same goes for very large items.

If there are multiple items with the same name in the room, you can specify which one you want to inspect using the name
of the container it's in. To do this, you must enter the container's preposition before its name. If you don't know its
preposition, "in" will always work. If you are inspecting an item contained inside another item that has multiple
inventory slots (for example, a backpack with several pockets), you can specify which of the container's slots you want
to search in, by entering the name of the slot followed by "of" before the container item's name.

You can also inspect items in your inventory. If you have an item with the same name as an item in the room you're
currently in, you can specify that you want to inspect your item by adding "my" before the item name.

To inspect a player, enter their display name as it appears when you enter the room or when they perform an action. You
can even inspect visible items in their inventory by adding 's to the end of their name, followed by the name of the
item you want to inspect. No one will see you do this, but you will receive slightly less info when inspecting another
player's items.

To see the description of the room you're in without having to leave and come back, you can enter "room".

### inventory

Lists the items in your inventory.

#### Aliases

`.inventory` `.i`

#### Examples

    .inventory
    .i

#### Details

Lists all of the equipment slots you have available, and any items that are equipped to each one. Your "RIGHT HAND"
and "LEFT HAND" equipment slots are your hands, which are your main ways of interacting with inventory items. You can
manage the items in these equipment slots primarily with the `take` and `drop` commands. For all other equipment slots,
you can equip items to them with the `equip` command, and remove items from them with the `unequip` command.

If any of your equipped items have inventory slots, then you can store other items inside of them. These inventory slots
will be listed underneath the equipped item, and any items they contain will be listed in parentheses. To store an item
in one of these inventory slots, use the `stash` command. To retrieve one and put it in your hand, use the `unstash`
command. Be warned that items that you have stashed in inventory slots can be stolen by other players, sometimes without
you noticing.

In your inventory, the names of all items will be contained in code blocks. This makes it easier to copy them so that
you can paste them into other commands.

### knock

Knocks on a door.

#### Aliases

`.knock`

#### Examples

    .knock DOOR 1

#### Details

Knocks on a door in the room that you're in. This will be narrated in the room you're in, and in the room that the exit
leads to. You can knock on a door even if it's locked. However, some exits don't have doors. If they don't, you will be
unable to knock on them.

### monolog

Narrates your inner thoughts.

#### Aliases

`.monolog` `.monologue` `.mo` `.mn`

#### Examples

    .monolog Kyra stares intently at the screen. What could this jumble of text mean, exactly?
    .monologue I can't believe this. How did this even happen?
    .monolog No matter what happens, there won't be anything she can do to help anyone after she dies here. That's what hurts most of all.
    .monologue He could have forgotten about her. Honestly, he seemed to be pretty close to it just now, right? But this photo album... He suddenly remembers so much more than he thought he would.

#### Details

Narrates your inner thoughts privately. You will receive a copy of your monolog in DMs, and it will be sent to your
spectate channel. Other players in the room will not be able to see or hear your private thoughts, so you can enter
anything you like. However, keep in mind that if you send the command in the room channel, it will still appear there
before being deleted. For that reason, this command works best when it is sent in DMs. Please note that you cannot send
a monolog that exceeds Discord's character limit, which is 2000 characters.

### move

Moves you to another room.

#### Aliases

`.move` `.go` `.exit` `.enter` `.walk` `.m`

#### Examples

    .move DOOR 1
    .enter Kitchen
    .go locker-room
    .exit DOOR
    .move DOOR 1>DOOR 1>DOOR 1
    .walk HALL 1 > HALL 2 > HALL 3 > HALL 4
    .m Lobby>Path 3>Path 1>Park>Path 7>Botanical garden

#### Details

Moves you to another room. You must specify an exit in the room you're currently in, or the name of the desired room, if
you know it. Unless you have the free movement role, you can only move to a room directly connected to the one you're
currently in. It will take time for you to move to your destination. How much time it takes depends on its distance from
your current position, and your speed. While you are moving, you will use stamina. If you are close to running out of
stamina, you will receive a warning. If you run out of stamina entirely, you will become **weary**, and you will be
unable to move for some time. You can recover lost stamina by staying in one place for a while.

Once you reach the destination, you will be removed from your current room channel and put into the channel
corresponding to the room you specify, as long as the exit leading to it isn't locked.

When you enter a new room, its description will be sent to you via DMs. However, it is recommended that you open the new
channel immediately so that you can start seeing messages as soon as you're added.

You can also create a queue of movements to perform such that upon entering one room, you will immediately start moving
to the next one. To do this, separate each destination with `>`.

Note that if you are carrying any large items in your hands (for example, a sword), they will be mentioned when you exit
or enter a room.

### narrate

Narrates your non-verbal actions.

#### Aliases

`.narrate` `.n`

#### Examples

    .narrate She slowly sinks behind the podium.
    .n 06 shakes his head, as if he's clearing a thought from his mind.
    .narrate Their eyes widen and they cross their arms, looking down. They'd clearly never considered this before.
    .n He coughs a little, blood trickling down his face. His smile doesn't waver, though.

#### Details

Narrates non-verbal actions. This narration will be sent to the room or hiding spot you're currently in. This behaves
similarly to the `gesture` command, but it allows you to write more complex narrations. Please note that you cannot send
a narration that exceeds Discord's character limit, which is 2000 characters.

### recipes

Lists all recipes available to you.

#### Aliases

`.recipes`

#### Examples

    .recipes
    .recipes GLASS
    .recipes POT OF RICE

#### Details

Lists all recipes you can carry out with the items in your inventory and items in the room. Even if all of the
ingredients necessary for a recipe are in the room you're in, if you don't have at least one of them in your inventory,
there will be no results. However, if you supply the name of an item in your inventory, you will receive a list of all
recipes that use that item as an ingredient, even if the remaining ingredients are not available.

There are two types of recipes: crafting recipes and processing recipes.

To carry out a crafting recipe, you must have both of the ingredients in your hands and combine them with the `craft`
command. These recipes take no time. Some crafting recipes are reversible. If they are, you can use the `uncraft`
command to get the ingredients again.

To carry out a processing recipe, use the `drop` command to place all the ingredients in a fixture, and then activate
the fixture with the `use` command. These recipes take a set amount of time to complete. If you did it correctly, you'll
receive a message indicating that the process has begun, and then another message when it finishes, as long as you're
still in the same room as the fixture you used to process it. If the fixture was already activated when all of the
ingredients were put in, you won't receive a message when it's initiated or completed, but the recipe will still be
carried out so long as all of the ingredients are in place.

### run

Runs to another room.

#### Aliases

`.run`

#### Examples

    .run DOOR 1
    .run Kitchen
    .run locker-room
    .run DOOR
    .run DOOR 1>DOOR 1>DOOR 1
    .run HALL 1 > HALL 2 > HALL 3 > HALL 4
    .run Lobby>Path 3>Path 1>Park>Path 7>Botanical garden

#### Details

Moves you to another room by running. This functions identically to the `move` command, however you will move twice as
quickly and lose stamina at three times the normal rate.

You must specify an exit in the room you're currently in, or the name of the desired room, if you know it. Unless you
have the free movement role, you can only move to a room directly connected to the one you're currently in. It will take
time for you to move to your destination. How much time it takes depends on its distance from your current position, and
your speed. Once you reach the destination, you will be removed from your current room channel and put into the channel
corresponding to the room you specify, as long as the exit leading to it isn't locked.

When you enter a new room, its description will be sent to you via DMs. However, it is recommended that you open the new
channel immediately so that you can start seeing messages as soon as you're added.

You can also create a queue of movements to perform such that upon entering one room, you will immediately start moving
to the next one. To do this, separate each destination with `>`.

Note that if you are carrying any large items in your hands (for example, a sword), they will be mentioned when you exit
or enter a room.

### say

Sends your message to the room you're in.

#### Aliases

`.say` `.speak`

#### Examples

    .say What happened?
    .speak Did someone turn out the lights?

#### Details

Sends your message to the channel of the room you're currently in as dialog. It will appear in the channel with a
webhook, meaning it will use the display name and display avatar that you have in-game. By default, your display name is
your character's name, and your display avatar is the avatar you have in the game server, or your account's avatar.
However, if something has changed your display name or avatar (for example, if you are wearing a mask), then those will
be used instead.

This command is only available to players with certain status effects. In most situations, you should send your message
to the room channel directly.

### sleep

Puts you to sleep.

#### Aliases

`.sleep`

#### Examples

    .sleep

#### Details

Puts you to sleep by inflicting you with the **asleep** status effect. In most situations, you will not be able to wake
back up again without moderator assistance. This should be used at the end of the day before the game pauses to ensure
you wake up feeling well rested.

If you are able to wake back up of your own volition, you can do so with the `wake` command.

### stash

Stores an inventory item inside another inventory item.

#### Aliases

`.stash` `.store` `.s`

#### Examples

    .stash LAPTOP in BEIGE SATCHEL
    .store SWORD in SHEATH
    .stash OLD KEY in RIGHT POCKET of BLACK DRESS PANTS
    .s WATER BOTTLE in SIDE POUCH of GREEN BACKPACK

#### Details

Moves an item from your hand to another item in your inventory. You can specify any item in your inventory that has the
capacity to hold items by entering the container item's preposition followed by its name. If you don't know its
preposition, "in" will always work.

If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which
slot you want to put the item in. To do this, enter the name of the inventory slot followed by "of" before the name of
the container. If you don't specify an inventory slot, you will put it in the first slot it has. Note that each slot has
a maximum capacity that it can hold, so if it's too full or too small to contain the item you're trying to stash, you
won't be able to stash it there.

If you stash a very large item (a sword, for example), this will be narrated in the room, so other players will see you
stash it.

To retrieve a stashed item and put it in your hand, use the `unstash` command.

### status

Shows your status.

#### Aliases

`.status`

#### Examples

    .status

#### Details

Shows you what status effects you're currently afflicted with. Note that some status effects may not be visible to you.
You will also be unable to see their durations.

### steal

Steals an item from another player.

#### Aliases

`.steal` `.pickpocket`

#### Examples

    .steal from Vivian's BEIGE SATCHEL
    .pickpocket from Kyra's LAB COAT
    .steal Michio's RIGHT SLEEVE of PASTEL HAORI
    .pickpocket Olavi's LEFT POCKET of BLUE TRENCH COAT
    .steal from an individual wearing a PLAGUE DOCTOR MASK's BLACK CLOAK
    .pickpocket an individual wearing a BUCKET's SIDE POUCH of BLUE BACKPACK

#### Details

Attempts to steal an item from another player in the room. You must specify one of the player's equipped items to steal
from. You can see a list of their equipped items by inspecting them with the `inspect` command. Then, you can steal from
it by entering their name followed by 's and the name of the equipped item.

If you inspect their equipped items, you may also learn what inventory slots each one has, if any. You can specify which
inventory slot to steal from by entering the name of the slot followed by "of" before the equipped item's name. If no
inventory slot is specified, but the equipped item has multiple slots (for example, a pair of pants with several
pockets), one slot will be randomly chosen. If the inventory slot contains multiple items, you will attempt to steal one
at random.

There are three possible outcomes that can result from attempting to steal an item: you steal the item without them
noticing, you steal the item but they notice, and you fail to steal the item because they notice in time. If you happen
to steal a very large item, the other player will notice you taking it regardless of whether you were successful or not,
and so will everyone else in the room.

Your dexterity stat has a significant impact on how successful you are at stealing an item. If you have a high dexterity
stat, you are more likely to succeed. Various status effects affect the outcome as well. For example, if the player
you're stealing from is asleep or unconscious, they won't notice you stealing their items no matter what.

### stop

Stops your movement.

#### Aliases

`.stop` `.st`

#### Examples

    .stop

#### Details

Stops you in your tracks while moving to another room. Your distance to that room will be preserved, so if you decide to
move to that room again, it will not take as long. This command will also cancel any queued movements.

### take

Takes an item and puts it in your inventory.

#### Aliases

`.take` `.get` `.grab` `.t`

#### Examples

    .take BUTCHERS KNIFE
    .get FIRST AID KIT
    .t BOTTLE OF MIDAZOLAM from MEDICINE CABINET
    .take TOWEL from BENCHES
    .grab HAMMER from TOP RACK of TOOLBOX
    .t KEY from RIGHT POCKET of PLAID SKIRT

#### Details

Takes an item from the room you're in and puts it in your inventory. You must have a free hand to take an item. If you
take a very large item (a sword, for example), this will be narrated in the room, so other players will see you take it.

If there are multiple items with the same name in a room, you can specify which container you want to take it from. To
do this, you must enter the container's preposition before its name. If you don't know its preposition, "in" will always
work. If you want to take an item from another item that has multiple inventory slots (for example, a backpack with
several pockets), you can specify which of the container's slots you want to take it from, by entering the name of the
slot followed by "of" before the container item's name.

### text

Sends a text message to another player.

#### Aliases

`.text`

#### Examples

    .text Elijah Hello. I understand that you have come into possession of some illicit substances, and I would like to partake.
    .text Astrid i often paint cityscapes, urban scenes, and portraits of people - but today i decided to experiment with something a bit more abstract. (attached image)
    .text Vivian (attached image)

#### Details

Sends a text message to the player you specify. If an image is attached, it will be sent as well. This command works
best when sent via direct message, rather than in a room channel. This command is only available to players with certain
status effects. Additionally, even if you have a status effect that enables the use of the command, if the recipient you
choose does not, you will not be able to send text messages to them.

### time

Shows the current in-game time.

#### Aliases

`.time`

#### Examples

    .time

#### Details

Shows the current in-game time and date. This will show you the time in the timezone that the bot is currently operating
in. This may differ from your local time.

### uncraft

Separates an item in your inventory into its component parts.

#### Aliases

`.uncraft` `.dismantle` `.disassemble` `.uc`

#### Examples

    .uncraft SHOVEL
    .dismantle CROSSBOW
    .disassemble PISTOL
    .uc RING STAND

#### Details

Separates an item in one of your hands into its component parts. This allows you to reverse a crafting recipe, turning a
single product into its two ingredients. Because it produces two items, you will need a free hand in order to use this
command. If the item being uncrafted or its components are particularly large, this will be narrated in the room, so
other players will see you uncraft it.

If there is no crafting recipe that produces the item you want to uncraft that also allows it to be reversed, then the
item cannot be uncrafted.

To see all of the items in your inventory that can be uncrafted, use the `recipes` command.

### undress

Unequips and drops all items.

#### Aliases

`.undress`

#### Examples

    .undress
    .undress WARDROBE
    .undress LAUNDRY BASKET
    .undress MAIN POCKET of BLUE BACKPACK

#### Details

Unequips all items you have equipped and drops them in the room you're currently in. You will undress completely,
including any items in your hands. This will be narrated, so any other players in the room will see you undress.

If you want to put your items in a specific fixture or item in the room, add the container's name. No preposition is
necessary. If you don't specify a container, you will simply leave the items on the floor.

If the container has multiple inventory slots (for example, a backpack with several pockets), you can also specify which
slot you want to put the items in. To do this, enter the name of the inventory slot followed by "of" before the name of
the container. If you don't specify an inventory slot, you will put the items in the first slot it has. Keep in mind
that the specified container must have a large enough capacity to hold all of the items in your inventory.

### unequip

Unequips an item.

#### Aliases

`.unequip` `.remove` `.u`

#### Examples

    .unequip PLAGUE DOCTOR MASK
    .remove WHITE PARKA
    .u KNIT WOOL SWEATER from SHIRT

#### Details

Unequips an item you currently have equipped. The item will be placed in your hand, so you must have a free hand. When
you unequip an item, it will be narrated in the room, so other people can see you unequip it, regardless of its size. It
will then be removed from your description, and any equipped items that it was covering will become visible. For
example, if you unequip something from your PANTS slot, it is likely that whatever is equipped to your UNDERWEAR slot
will then appear in your description.

You can specify which equipment slot you want to unequip the item from, if you want. This can be useful if you have
multiple items with the same name equipped to different equipment slots. To do this, enter "from" after the name of the
item you want to unequip, followed by the name of the equipment slot you want to unequip it from. You can view a list of
all of your equipment slots with the `inventory` command.

To unequip many items at once, use the `undress` command. If you wish to equip an item again, use the `equip` command.

### unstash

Moves an inventory item into your hand.

#### Aliases

`.unstash` `.retrieve` `.r`

#### Examples

    .unstash LAPTOP
    .retrieve SWORD from SHEATH
    .unstash OLD KEY from RIGHT POCKET of BLACK DRESS PANTS
    .r WATER BOTTLE from SIDE POUCH of GREEN BACKPACK

#### Details

Moves an inventory item from another item in your inventory into your hand. You must have a free hand to unstash an
item. If you unstash a very large item (a sword, for example), this will be narrated in the room, so other players will
see you unstash it.

If you have multiple inventory items with the same name as the one you want to unstash, you can specify which item to
retrieve it from. To do this, you must enter "from" before the container's name. If the container has multiple inventory
slots (for example, a backpack with several pockets), you can specify which of the container's slots you want to unstash
the item from, by entering the name of the inventory slot followed by "of" before the container item's name.

To store an item in one of your inventory items, use the `stash` command.

### use

Uses an item in your inventory or a fixture in a room.

#### Aliases

`.use` `.unlock` `.lock` `.type` `.activate` `.deactivate` `.flip` `.push` `.press` `.ingest` `.consume` `.swallow`
`.eat` `.drink`

#### Examples

    .use FIRST AID KIT
    .eat CHICKEN FRIED RICE
    .drink COFFEE
    .swallow ORANGE CAPSULE
    .use OLD KEY CHEST
    .use LIGHTER CANDLE
    .lock LOCKER 1
    .type KEYPAD Proboscis Monkey
    .unlock LOCKER 1 12-22-11
    .press RED BUTTON
    .flip LEVER
    .activate BLENDER

#### Details

Uses an item from your inventory. Not all items have programmed uses. Those that do will inflict you with or cure you of
a status effect of some kind. Status effects can be good, bad, or neutral, but it should be fairly predictable what kind
of effect a particular item will have on you.

Some items can be used on fixtures in the room. For example, using a key on a locker will unlock the locker, using a
crowbar on a crate will open the crate, etc.

Some fixtures are capable of turning items into other items. This is known as processing a recipe. For example, an oven
can turn raw food into cooked food. In order to use fixtures to process recipes, drop the items in the fixture and use
it. For more information, see the help details for the `recipes` command.

You can even use fixtures in the room without using an item at all. However, not all fixtures are usable in this way.
Those that are usable without an item have puzzles attached, which can result in many different outcomes depending on
how they're used. When interacting with a puzzle, anything entered after the name of the fixture will be treated as a
password, combination, or selection. These inputs are almost always case-sensitive. If the fixture is a lock of some
kind, you can re-lock it using the `lock` command. Other fixtures may require a puzzle to be solved before they do
anything special.

### wake

Wakes you up.

#### Aliases

`.wake` `.awaken` `.wakeup`

#### Examples

    .wake
    .awaken
    .wakeup

#### Details

Wakes you up when you're asleep. However, you may not be able to use this command without moderator assistance.

### whisper

Allows you to speak privately with the selected player(s).

#### Aliases

`.whisper` `.w`

#### Examples

    .whisper Jun
    .w Florian Michio Ava

#### Details

Creates a channel for you to whisper to the selected recipients. Only you and the people you select will be able to read
messages posted in the new channel, but everyone in the room will be notified that you've begun whispering to each
other. You can select as many players as you want as long as they're in the same room as you. When one of you leaves the
room, they will be removed from the channel. If everyone leaves the room, the whisper channel will be deleted.
