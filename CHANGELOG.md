<!--
SPDX-FileCopyrightText: 2026 Ms. VBLANK <alteregomolly@pm.me>

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Changelog

All notable changes to this project will be documented in this file.
This project does **not** adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [v1.10.1] - 2025-11-24

## Fixed
- Fixed the first boot message to link to the new docs.

---

# [v1.10.0] - 2025-11-06

# Alter Ego returns! Version 1.10.0 is here now!
After nearly a year and a half of dormancy, Alter Ego returns with a brand new major update: the Procedural Update.

The major new feature of this update is the addition of procedurally-generated Prefabs. With the brand new
`<procedural>` and `<poss>` tags, it's possible to create Prefabs that have unique descriptions when instantiated. You
can create as many procedurals as you like in a Prefab's description and assign each one any number of possibilities
with set chances of appearing in Items instantiated from them. It's also possible to instantiate these Prefabs with
manually-chosen possibilities. For more information on how to use these new tags, check
out [the documentation](https://msvblank.github.io/Alter-Ego/moderator_guide/writing_descriptions.html#procedural).

These Prefabs work in tandem with the new [
`matrix` Puzzle type](https://msvblank.github.io/Alter-Ego/reference/data_structures/puzzle.html#matrix). Although it
behaves just like `interact`-type Puzzles, it is capable of accessing the outcomes of all of the Puzzles that are
required to solve it within its solved commands. With this, it's possible to create Puzzles where Players can choose the
procedural possibilities that a Prefab will be generated with. For example, if a `matrix` Puzzle named "PRINT" with the
required Puzzle "CAMERA SUBJECT" has the solved commands
`instantiate PHOTO (subject={CAMERA SUBJECT}) in PRINTER at library`, then a Player could solve the "CAMERA SUBJECT"
Puzzle with the name of a Player (for this example, Kyra), then solve the "PRINT" Puzzle to create an instance of the
"PHOTO" Prefab where, in the tag `<procedural name="subject">`, the tag `<poss name="Kyra">` is the one that generates.
And since the `matrix` Puzzle type can pass Puzzle outcomes to any bot command, there are many more possibilities.

There are other new Puzzle types, too. The [
`option` type](https://msvblank.github.io/Alter-Ego/reference/data_structures/puzzle.html#option) allows you to create
Puzzles with a set number of options that a Player can select from. These are similar to `switch`-type Puzzles, but they
can be unsolved by attempting it again without supplying a selection. The [
`room player` type](https://msvblank.github.io/Alter-Ego/reference/data_structures/puzzle.html#room-player) allows you to
create Puzzles where a Player has to select the display name of a Player in the Room with them. What makes this special
is that the selected Player will be passed into the commandHandler module when executing its solved commands, so that
any bot commands that use the `player` argument will execute as if the selected Player was the one who initiated them.

Those aren't the only new features, though. With the help of my new assistant @LavCorps, many long-requested minor
features have been added in this update:

- [Recipes](https://msvblank.github.io/Alter-Ego/reference/data_structures/recipe.html) can now be set as uncraftable, so
  that Players can convert the product of a Recipe back into their original ingredients with the new
  [`.uncraft`](https://msvblank.github.io/Alter-Ego/reference/commands/player_commands.html#uncraft)
  [command](https://msvblank.github.io/Alter-Ego/reference/commands/moderator_commands.html#uncraft).
- When [inspecting](https://msvblank.github.io/Alter-Ego/reference/commands/player_commands.html#inspect) Items, Players
  can now specify the container that the Item belongs to. This helps out in cases where multiple Items with the same
  name exist in different containers in the same Room.
- When Players edit their dialog messages, those edits are reflected in spectate channels, instead of being set in
  stone.
- Moderators can now add Players to the sheet more easily with the
  [`.addplayer` command](https://msvblank.github.io/Alter-Ego/reference/commands/moderator_commands.html#addplayer).
- Players can now check the current date and time of the server that Alter Ego is running on with the
  [`.time` command](https://msvblank.github.io/Alter-Ego/reference/commands/player_commands.html#time).
- [Events](https://msvblank.github.io/Alter-Ego/reference/data_structures/event.html) can now be set to trigger on
  certain days of the week, certain dates of the month, or on set days of the year.
- Moderators can dump the entire state of the game and a log of recently used commands for debugging purposes with the
  [`.dumplog` command](https://msvblank.github.io/Alter-Ego/reference/commands/moderator_commands.html#dumplog).

Lastly, thanks to the help of @flufflesamy, the documentation for Alter Ego has been migrated from the Wiki
to [mdBook](https://rust-lang.github.io/mdBook/). They can still be accessed online
from [this link](https://msvblank.github.io/Alter-Ego/), or viewed offline in your local copy of Alter Ego. Now, you will
always have access to documentation that matches whichever version of Alter Ego you're running.

## How to update

As with 1.9.0, updating should be quick and painless. Even though the Recipes sheet has new columns, Alter Ego will
automatically create them on your already-existing sheet, and update your constants file with the correct values.

### With Docker

Follow the instructions listed on the installation tutorial for how to update, using `1.10.0` for the version number.

https://msvblank.github.io/Alter-Ego/moderator_guide/installation.html#updating-alter-ego

### Without Docker
Using Git, or the official GitHub app, simply fetch and pull from origin.

## Changelog

* Implemented procedurally generated Prefabs by @MsVBLANK in https://github.com/MsVBLANK/Alter-Ego/pull/199
* Added configurable default pronouns and default voice to .env.example and default_playerdefaults.json by @MsVBLANK
  (6bb37d1aa0f46104a8593602fb3fb2ecd8876271)
* Implemented addplayer_moderator command by @LavCorps in https://github.com/MsVBLANK/Alter-Ego/pull/186
* Implemented dumplog_moderator command by @LavCorps in https://github.com/MsVBLANK/Alter-Ego/pull/190
* Add item container as an inspect command argument by @LavCorps in https://github.com/MsVBLANK/Alter-Ego/pull/192
* Implemented uncraft_player and uncraft_moderator commands by @LavCorps
  in https://github.com/MsVBLANK/Alter-Ego/pull/184
* Implemented time_player command by @LavCorps in https://github.com/MsVBLANK/Alter-Ego/pull/183
* Added weekday, date, and month options to Event trigger times by @MsVBLANK (8ec04ef56441a4a9ab163ea052293b4b88b433ba)
  (b010a51fb67265a34fc6af59fd9d9ca98d2e0143)
* Implemented dialog message edit mirroring for spectate channels by @LavCorps
  in https://github.com/MsVBLANK/Alter-Ego/pull/191
* Fix default demo data error by @LavCorps in https://github.com/MsVBLANK/Alter-Ego/pull/188
* Move docs to mdBook by @flufflesamy in https://github.com/MsVBLANK/Alter-Ego/pull/212
* Docker tweaks by @flufflesamy in https://github.com/MsVBLANK/Alter-Ego/pull/217
* Updated dependencies by @MsVBLANK (e25ef7d1ed7e207f90241569be3030ec7530b6f8)

---

# [v1.9.0] - 2024-06-06

# Version 1.9.0 is officially here!

This update, the Dialog Update, adds several brand new features relating to player dialog.

The first major feature is that Players now have a voice attribute. When a Player speaks and their identity is obscured
for any reason, the Narration conveying their dialog will contain a brief description of their voice. This description
is defined using a new column on the Players sheet, but it can also be temporarily changed using the brand new
`.setvoice` command. This command can change their voice descriptor to another phrase, but it can also be used to make
the Player impersonate another Player by mimicking their voice exactly. This can even be used to trick Players with the
`knows Player` attribute into believing it's really them speaking.

The second major feature of this update is the new intercom/surveillance system. Using the new predefined
`audio surveilled` and `audio monitoring` Room tags, it's now possible for Players in one Room to hear everything said
in another Room. Likewise, the new `video surveilled` and `video monitoring` Room tags allow Players in one Room to see
everything happening in another Room. When combined, these tags can create a fully functioning audiovisual surveillance
system, and they can even enable perfect communication between distant Rooms. When combining these tags with the new
`secret` Room tag, the surveilled Room's name will be hidden, in case you want to keep the speaker's location a secret.
These features can be combined any way you want to create interesting results, and they can even be enabled or disabled
at will using the new `.tag` command to add or remove Room tags.

Be sure to read the help menu for the new `.setvoice` and `.tag` commands to learn more. They each have moderator and
bot variants, which enables further flexibility. To learn more about the new features, check the following sections on
the Wiki:
https://github.com/MsVBLANK/Alter-Ego/wiki/Data-Structure:-Player#original-voice-string
https://github.com/MsVBLANK/Alter-Ego/wiki/Data-Structure:-Room#tags

## How to update

Although in the past, adding a new column to the spreadsheet necessitated every Alter Ego user to do the same, I've
streamlined the process. Now, Alter Ego will automatically check if the Voice column is present on the Players sheet,
and if it isn't, it will add it. You don't have to worry about a thing! Simply update using whichever method you prefer:

### With Docker

Follow the instructions listed on the installation and setup tutorial for how to update, using `1.9.0` for the version
number.
https://github.com/MsVBLANK/Alter-Ego/wiki/Tutorial:-Installation-and-setup#updating-alter-ego

### Without Docker

Using Git, or the official GitHub app, simply fetch and pull from origin.

## Changelog

### Changes

* Added `originalVoiceString` and `voiceString` attributes to Player class.
* Added `.setvoice` moderator and bot commands.
* Added `audio surveilled`, `audio monitoring`, `video surveilled`, `video monitoring`, and `secret` Room tags with
  predefined behavior.
* Added `.tag` moderator and bot commands.
* Updated `playerSheetDataCells` and `playerSheetDescriptionColumn` default constants to coincide with new Players sheet
  column.
* Added updateHandler module to automatically implement updates to Alter Ego's environment.
* Added ARM64 support.

### Bugfixes

* Fixed a bug where Players with the `no sight` behavior attribute would see which Players were hiding with them.

---

# [v1.8.0] - 2024-01-14

# The wait is over! Version 1.8.0 has officially been released!

This update, named quickstart, as the name suggests, makes the process of installing and setting up Alter Ego much
faster. If you've already installed Alter Ego and have been using it for quite a while, not all that much will be
different. But if you're setting up Alter Ego for the first time, you'll find that the process is much easier.

The first major addition to this update is the use of Docker, a container management platform that allows users to run
applications on their machines regardless of operating system or dependencies. To put it simply, Docker creates an
isolated environment for Alter Ego to run in - all without you needing to install Git, Node.js, NPM, dependencies, or
even Alter Ego's source code itself. With the use of Docker, it's possible to get Alter Ego up and running and fully
ready to run a game after downloading only a single file and filling out a file with your desired settings. And you can
do it on any operating system! The process of updating Alter Ego when new versions are released is much easier with the
power of Docker, too.

But that's not all. I've added several other features to Alter Ego to further simplify the setup process. Now, when you
start up Alter Ego, it will automatically attempt to fill out the role and channel IDs in the settings for you by
searching for the default names for each one provided in the server template linked on the Wiki. No longer will you have
to copy IDs and fill them out manually. Once the bot has filled them out for you, you can change their names to whatever
you like.

You can also create new Room categories in the server with a simple command: `.createroomcategory`! This command will
automatically create a category with the name you give it and add it to the `roomCategories` list in your
`serverconfig.json` file automatically, so that you can start filling it up with Room channels without worrying about
editing files. This, combined with a script that fills out the rest of your config files automatically, makes editing
`.json` files a thing of the past.

The last new addition is the `.setupdemo` command! When Alter Ego detects that it's being installed for the first time,
it will prompt you to give it a try. This command will automatically generate a small demo environment on the
spreadsheet for you to get a feel for the basics of Neo World Program gameplay and development. It's nothing fancy, but
it demonstrates many of the gameplay mechanics in a clear, intuitive way. Give it a try if you haven't started working
on a spreadsheet yet! If you use it while your spreadsheet already has data on it, though, it will be overwritten, so be
cautious!

## How to update:

### With Docker:

It's easiest to start with a fresh install. Follow the newly-updated installation and setup tutorial for more info. If
you've already set up Alter Ego before, you can skip steps 3-9 entirely. You'll have to fill out your .env file with all
of the appropriate settings, though!
https://github.com/MsVBLANK/Alter-Ego/wiki/Tutorial:-Installation-and-setup

### Without Docker:

If you're using Docker on a computer running Windows, there may be some performance issues due to its reliance on
virtualization. If you're seriously concerned about your computer's performance, you can skip using Docker altogether
and continue using Alter Ego as you always have. In this case, the easiest way to update would be with Git. You can pull
from origin as usual, or you can switch to a numbered version (1.8.0) using the terminal commands on the Node
installation page:
https://github.com/MsVBLANK/Alter-Ego/wiki/Tutorial:-Node-installation#with-git

However, due to the new changes, you will need to split up your previous settings file among various config files.
Follow step 11 of the Node installation page:
https://github.com/MsVBLANK/Alter-Ego/wiki/Tutorial:-Node-installation#step-11-copy-configuration-files

You will also need to move your credentials file into the Configs folder.

## Changelog

### Changes

* Added Docker functionality.
* Added script to automatically populate config files using environment variables.
* Added functionality to autopopulate role and category IDs
* Added first-time-run message
* Added `.createroomcategory` command.
* Added `.setupdemo` command.

### Bugfixes

* Can now load from a empty spreadsheet without crashing.

---

# [v1.7.1] - 2024-01-14

## Changes

* Included note about heated slowdown in help menu.
* Finder module can now find equipped InventoryItems.
* Update README.md
* Merge pull request #163 from flufflesamy/gh-actions
* Remove docker compose build PR action

---

# [v1.7.0] - 2022-12-14

I just rolled out a new feature update! It's a small one, but hopefully moderators will find it helpful. This update
adds two features:

- The use moderator command allows you to enter the name of a second Player. This allows you to force the first Player to
use an Inventory Item on the second Player, rather than being restricted to only using it on themself. The player
version of this command doesn't include this functionality so that Players cannot force Status Effects on other Players
without moderator intervention.
- I added a brand new occupants command! This lists all of the Players that are currently in the Room you specify. Any
Players in the Room with the `hidden` behavior attribute will also be listed with their hiding spots. More importantly,
though, Players who are currently moving will be listed alongside their current movement queue, including how long it
will take for them to move to the next Room in the queue! Be warned, though, that the times shown won't be adjusted to
match how long it will actually take via the heatedSlowdownRate if a Player in the game has the heated Status Effect -
it will take longer than the time shown! I hope this makes it easier to track Players as they move across the map.

As always, you can read the help menus for both commands for more information. Enjoy!

---

# [v1.6.0] - 2022-10-01

I've just updated Alter Ego to use Discord.js v14. No new features have been added in this update. However, it will
require a bit of extra effort on your part to update. After updating from GitHub (you can fetch/pull origin in the
GitHub app to do this), open the Node.js command prompt and navigate to your Alter Ego folder with the cd (filepath)
command. Enter `npm install` and wait for it to finish. After that, you should be all set!

---

# [v1.5.0] - 2022-08-17

## Changes

- Recipes command can now take an inventory item.

---

# [v1.4.1] - 2022-07-28

## Fixes

- Fixed a bug where players couldn't give items if two players in a room had similar names.

---

# [v1.4.0] - 2022-07-23

## Changes

- Added room argument to move_bot command.

---

# [v1.3.2] - 2022-06-21

## Fixes

- Updated save data formatting.

---

# [v1.3.1] - 2022-05-16

## Fixes

- Fixed bot command help menus.
- Update destroy_bot.js
- Fixed typo.

---

# [v1.3.0] - 2022-05-15

A new feature update has been released! This one includes two new features:

- The ongoing command allows you to view all currently ongoing Events, as well as see how much time is remaining until
  they end.
- The restricted exit-type Puzzle allows you to create Exits that are locked to all but specific Players, like the
  chutes from UC! All you need to do is lock the Exit, make a restricted exit-type Puzzle whose name matches the Exit
  and which is in the same Room as the Exit, make the Puzzle accessible, and list all the Players (case-sensitive) who
  can pass through the Exit. Moving through the Exit counts as solving the Puzzle, so you can add commands to run when a
  Player passes through the Exit and send them a message for solving the Puzzle, with support for multiple solutions and
  differing command sets! On top of that, the Exit doesn't even have to be locked for you to make use of these features;
  you could allow anyone to pass through and trigger commands whenever they do so! This opens up a whole new array of
  possibilities. For more details about how this Puzzle type behaves, check out the types section on the Puzzle wiki
  page: https://github.com/MsVBLANK/Alter-Ego/wiki/Data-Structure:-Puzzle#type

---

# [v1.2.0] - 2022-04-18

Alter Ego version 1.2.0 is finally here! This update completely overhauls the way that hiding works.
Here are the differences.

## Hiding

1. Instead of Objects having a binary `true` or `false` property to determine if they can be hidden in or not, they now
   have a numeric hiding spot capacity. This means that multiple people can hide in the same hiding spot, and this
   capacity can be set per Object.
2. When someone hides in an Object, a Whisper will be created with everyone who is hiding in that Object, under normal
   conditions. This will occur even if they're alone. This Whisper functions like a normal Whisper for the most part,
   but if someone new joins the hiding spot, it will be deleted and a new Whisper will be created. If someone leaves,
   then they will simply be removed from the Whisper.
3. There are a few circumstances where someone won't be added to a hiding spot Whisper. If they have the `no channel`
   Status Effect attribute that doesn't come from the hidden Status Effect (for example, if they're also concealed or
   blinded), they won't be added to the Whisper. If they have the `no hearing` attribute (for example, if they're
   deafened), they also won't be added. NPCs also won't be added to the Whisper. Such Players **will** be informed of
   narrations sent in the Whisper channel, and they **will** hear messages sent in the Whisper. However, they will not
   be able to whisper in the channel themself.
4. If someone attempts to hide in a hiding spot that's already occupied, they will be notified of who all is hiding
   there, and everyone already hiding there will be notified that someone tried to hide there. The same will happen if
   the hiding spot is at max capacity, but they will be unable to join, and the messages will indicate as such. Hidden
   players will no longer get kicked out of their hiding spot when this occurs.
5. When a hidden Player performs an action, it will be narrated in the Whisper channel, not the Room channel.
6. If a Player is removed from a Whisper for any reason (for example, if all they become deafened), then there is no way
   for them to rejoin without unhiding and hiding in the same spot again.

## Commands

7. When hidden, the dress command will only allow you to dress from the Object you're hiding in or from Items contained
   within it.
8. When hidden, the drop command will only allow you to drop your Inventory Items into the Object you're hiding in or
   into Items contained within it.
9. When hidden, the gesture command limits what your target can be. Exits cannot be a gesture target at all. The only
   Object that can be a gesture target is the one you're hiding in. The only Items that can be gesture targets are ones
   contained within the Object you're hiding in. The only Players that can be gesture targets are ones that are hidden
   in the same Object as you. You can still gesture to your own Inventory Items regardless.
10. When hidden, the give command will only work if the recipient is hidden in the same Object as you.
11. The inspect command will notify you of any Players hiding in an Object, and they will be notified that they have
    been found. However, they will no longer be forced out of hiding.
12. When hidden, the inspect command will only allow you to inspect the Room, the Object you're hiding in, Items
    contained within it, your own Inventory Items, Players hidden in the same Object as you, and Inventory Items
    belonging to them.
13. When hidden, the say command will send a message in the Room channel in a similar manner as NPCs. However, your
    identity will be obscured. If someone recognizes your voice, they will be notified that it was you speaking. Players
    hidden in the same Object as you will also be notified that it was you speaking.
14. When hidden, the steal command will only work if the victim is hidden in the same Object as you.
15. When hidden, the take command will only allow you to take Items contained in the Object you're hiding in.
16. When hidden, the undress command will only allow you to undress into the Object you're hiding in, or into Items
    contained within it.
17. When hidden, the use command will only allow you to use the Object you're hiding in, whether it's an activatable
    Object or solvable Puzzle. However, you can still use Inventory Items without restriction.

## How to Update

With the upgrade to Alter Ego 1.2.0, a new version of the spreadsheet is needed. However, the loader module has been
configured to automatically convert the data without throwing an error. When you load the spreadsheet after updating,
all Objects which were previously hiding spots will have their hiding spot capacity set to 1, and all others will be set
to 0. This change will be reflected on your spreadsheet when Alter Ego saves data. So, there are only two things you
need to do in order to update:

- Open the GitHub app, make sure that **Alter-Ego** is selected as the current repository, and click **Fetch origin**.
- On your Status Effects sheet, delete the contents of the **Attributes** cell for the `hidden` Status Effect. Replace
  it with
  `disable knock, disable move, disable run, disable stop, disable whisper, no channel, hear room, hidden, enable say`.

However, there are multiple recommended changes to make:

- In your settings file, add the `whisperCategory` ID to the list of IDs in the `roomCategories` property. This will
  allow Players to use commands in Whisper channels.
- On your Objects sheet, change the header of the **Hiding Spot?** column to **Hiding Spot Capacity**.
- Manually set the capacity of hiding spots you want to accommodate more than one Player.
- On the Gestures sheet, add `hidden` to the **Don't Allow If** cell for any Gestures which would realistically make a
  noise, such as `gasp` or `cough`. I have done this for you on the new blank spreadsheet template. Just take care not
  to overwrite any Gestures you may have added.

Blank spreadsheet template for version 1.2.0:
https://docs.google.com/spreadsheets/d/1NQGlD9c8ZF7WIs4nJuTeQ5LRTLvT7MaFUhpxbNwN9Lc/edit?usp=sharing

That's all for now! If you have any questions or find any bugs, be sure to report them immediately. Thank you!

---

# [v1.1.0] - 2022-03-21

I just rolled out a feature update! This time, I've added two highly-requested Puzzle types: player and container-type
Puzzles!

- player-type Puzzles can only be solved by a Player if the Player's name is a solution to the Puzzle. Once solved, they
  can't be unsolved without moderator intervention.
- container-type Puzzles can only be solved when the Puzzle contains exactly the list of Items in the solution; no more,
  no less. They're automatically unsolved if an Item is taken from/dropped into the container. Multiple Items can be
  separated in the solution cell by separating them with a plus sign (`+`), like so:
  `Item: RED KEY + Item: GREEN KEY + Item: BLUE KEY`. Remember to use the Prefab IDs to identify the Items!
- For more details about how the new Puzzle types behave, check out the types section on the Puzzle wiki
  page: https://github.com/MsVBLANK/Alter-Ego/wiki/Data-Structure:-Puzzle#type

This update also makes some changes to the way that data is loaded and saved to the
spreadsheet. The most notable changes are:

- A bug fix in the itemManager module that prevents items from disappearing when stashed in another item. I like to call
  this the "laundry basket" bug.
- Added a new moderator command, the .clean command. With this command, you can delete all items and inventory items
  with a quantity of 0 from the sheet more easily. Please read the help menu for this command carefully, or you could
  risk items and inventory items getting overwritten!

This necessitates an update to the settings file, which means you will have to change some things.

## How to update

- Move your settings.json file outside of your Alter Ego folder.
- Open the GitHub app, make sure that Alter-Ego is selected as the current repository, and click Fetch origin.
- Delete the settings.json file in your Alter Ego folder and replace it with the old copy you moved earlier.
- Open your settings.json file in a text editor program. Find the line that says `"autoClean": false,` and delete the
  whole line. Next, find the line that says `"roomSheetAllCells": "Rooms!A1:K",` and delete **it and all of the lines
  below it, up to (but not including) the final line with the** `}`. Before the final `}`, add the following code:

```json
  "roomSheetDataCells": "Rooms!A2:K",
  "roomSheetSaveCells": "Rooms!D2:K",
  "roomSheetDescriptionColumn": "Rooms!K",
  "objectSheetDataCells": "Objects!A2:K",
  "objectSheetDescriptionColumn": "Objects!K",
  "prefabSheetDataCells": "Prefabs!A2:S",
  "prefabSheetDescriptionColumn": "Prefabs!S",
  "recipeSheetDataCells": "Recipes!A2:F",
  "recipeSheetInitiatedColumn": "Recipes!E",
  "recipeSheetCompletedColumn": "Recipes!F",
  "itemSheetDataCells": "Items!A2:H",
  "itemSheetDescriptionColumn": "Items!H",
  "puzzleSheetDataCells": "Puzzles!A2:Q",
  "puzzleSheetCorrectColumn": "Puzzles!M",
  "puzzleSheetAlreadySolvedColumn": "Puzzles!N",
  "puzzleSheetIncorrectColumn": "Puzzles!O",
  "puzzleSheetNoMoreAttemptsColumn": "Puzzles!P",
  "puzzleSheetRequirementsNotMetColumn": "Puzzles!Q",
  "eventSheetDataCells": "Events!A2:K",
  "eventSheetTriggeredColumn": "Events!J",
  "eventSheetEndedColumn": "Events!K",
  "statusSheetDataCells": "Status Effects!A2:N",
  "statusSheetInflictedColumn": "Status Effects!M",
  "statusSheetCuredColumn": "Status Effects!N",
  "playerSheetDataCells": "Players!A3:N",
  "playerSheetDescriptionColumn": "Players!N",
  "inventorySheetDataCells": "Inventory Items!A2:H",
  "inventorySheetDescriptionColumn": "Inventory Items!H",
  "gestureSheetDataCells": "Gestures!A2:E"
```

---

# [v1.0.4] - 2022-01-29

## Changes

- Replaced autoClean feature with clean_moderator command.

---

# [v1.0.3] - 2022-01-24

## Changes

- Added presences intent.
- Command handler will now ignore webhook messages.
- Fixed container slot items bug.

---

# [v1.0.2] - 2021-12-18

Another new update just dropped! This time, it's two HIGHLY requested features:

- You can now queue movements! Have you ever wanted your character to wake up and walk all the way to the rec center
  gym, but you didn't feel like sending more than one command? Now your desires are real! You can use the `>` character
  to chain together a list of exits/room names such that your character will start moving to the next room in the queue
  immediately after entering the previous one. This even works with the run command. Be careful, though! If you enter an
  invalid exit/room name or try to enter a locked room, you won't find out until you reach that point in the queue. Be
  sure to send `.help move` to see specific examples of how to use this feature.
- You can also effortlessly dress your character with the brand new dress command! This does the opposite of the undress
  command -- it automatically takes and equips all items in the given container, if possible. It will skip over any
  equipment slots that you already have an item equipped to, though. Be sure to send `.help dress` for more info on how
  this command works.

## Fixes

- Fixed a bug that resulted in duplicated items.
- Fixed a bug where you're unable to wake your character without first sending a message in the server.

---

# [v1.0.1] - 2021-12-15

## Fixes

- Bot will no longer fail to fetch the guild member associated with players.

---

# [v1.0.0] - 2021-11-29

A new update to has been rolled out! In this update, Alter Ego has been upgraded from Discord.js v11 to v13. This is a
**major update** that requires a bit more effort than usual on your part in order to update.

## How to update

- Install the latest LTS version of Node.js. You can download it here: https://nodejs.org/en/download/
- Move your settings.json file outside of your Alter Ego folder.
- Open the GitHub app, make sure that **Alter-Ego** is selected as the current repository, and click **Fetch origin**.
- Delete the settings.json file in your Alter Ego folder and replace it with the old copy you moved earlier.
- Open your settings.json file in a text editor program. Find the line that says `"testing": false,` and delete the
  whole line. Next, find the line that says `"metersPerPixel"`. Change that to `"pixelsPerMeter"`. You will need to
  recalculate the value following it by taking the inverse of it. To do that, raise it to the power of -1. For example,
  if your old `"metersPerPixel"` value was `0.04`, type `=0.04^-1` into Google. The resulting calculation is what your
  new `"pixelsPerMeter"` value will be -- in this case, `25`. Remember to save your changes when you're done.
- Open the Node.js command prompt and navigate to your Alter Ego folder with the `cd (filepath)` command. Enter
  `npm install`.
- Run Alter Ego with `node bot.js` as usual. If it successfully logs in, you're all done!

This isn't urgent, but in the future, Discord will be preventing bots from reading the content of messages without a
special permission. In order to enable this permission, navigate to the Discord Developer
Portal (https://discord.com/developers/applications), select your Alter Ego application, navigate to the Bot tab, and
check the Message Content Intent. That's all you need to do to prepare.

With this update, a few new features have been added. First, and most important, is that the NPC update has been fully
finished and ironed out. NPCs are like Players in every way, except they don't need to be associated with a Discord
account, and thus can only be controlled with moderator commands. NPC dialog is sent to their room channel using
webhooks, like Player dialog in spectator channels. NPCs do not have spectator channels of their own. In order to load a
Player as an NPC, set their talent to `NPC`. Instead of a Discord ID, set a URL that ends with `.jpg` or `.png`, which
will be used as their icon when they speak.

With the addition of NPCs, several changes had to be made to Alter Ego's messageHandler module. This created a perfect
opportunity to change how the .say command works. Much like NPCs, Players who use the .say command will have their
dialog sent to their room channel using webhooks. In order to display dialog from concealed players and the like without
revealing their identity, players can be assigned a display icon that will be used in place of their server icon/profile
picture. By default, concealed players will use an icon with a white question mark on a black background. However, this
can be replaced with the new .setdisplayicon moderator and bot command. This is particularly useful if you want to
associate different masks and such with specific icons. I encourage you to read the help menu for the command.

Lastly, I've added a simple version checking feature to Alter Ego. Every time you boot up Alter Ego, it will check to
see if your version is out of date. If it is, it will send a warning to the bot commands channel. However, you will not
be forced to do so. I hope this will encourage you all to keep Alter Ego up to date as I continue to add new features.
Recently, I've added a few miscellaneous new features, and more updates are on the way in the future!
Thank you for using Alter Ego. :]

---

# [v0.9.91] - 2020-12-16

I've just added a new command! Have you ever wanted to automatically change where a room's exits lead to? Well now you
can! Be sure to pull this update from GitHub, but be warned! You will have to edit your settings file slightly. Be sure
to add the following two lines to the last section of the file under the "roomSheetUnlockedColumn" setting:

```json
"roomSheetLeadsToColumn": "Rooms!I",
"roomSheetFromColumn": "Rooms!J",
```

...

I've added a new setting! Be sure to back up your current settings file before pulling from GitHub, and then add the
following line under the "defaultDropObject" setting:
`"defaultRoomIconURL": "",`
By putting an image URL between the quotation marks, you can set the icon that players will see when entering/inspecting
a room. This is part of a future update where you will be able to set the icon on a room-by-room basis, but for now it
will apply to all rooms. If you do not set a URL, Alter Ego will use the server icon, which is very low res.

...

Alter Ego has had a new major update that changes how it interacts with the spreadsheet. More information about what
this means for you as a moderator will be detailed below, but for now, you need to do a few things in order to update.

- First, update the source code with Git. Be sure to make a copy of your settings file first.
  -Once your code has been updated, repeat Step 3 of the Installation and Setup tutorial to update your
  dependencies: https://github.com/MsVBLANK/Alter-Ego/wiki/Tutorial:-Installation-and-setup#step-3-install-dependencies
- The settings file has been changed quite a bit. Therefore, you should open your copied settings file and, one by one,
  copy the settings from it into the updated one, leaving out any that are not in the updated file. For example, you
  will find the "defaultLocation" setting in both files, so you should update the new settings file to match your old
  file for that setting. However, the old settings file has the "queueInterval" setting, which is no longer needed, so
  you should not copy it over.

The new update changes how Alter Ego interacts with the spreadsheet. Previously, any time game data changed in its
internal memory, Alter Ego would make a note of that edit and put it in a queue, and then every so often (exactly how
often could be set with the "queueInterval" setting), all of the updates waiting in the queue would be sent to the
spreadsheet. Effectively, this resulted in only updated data getting sent to the spreadsheet, however due to various
circumstances, it was possible for updates to arrive out of order, which was especially problematic for the Inventory
Items sheet.

This update aims to fix that. How it does so is that instead of sending only updated data to the spreadsheet, Alter Ego
now sends the entire state of the game as stored in its memory to the spreadsheet every so often (which can be set with
the "autoSaveInterval" setting, which is given in seconds). This should ensure that all game data on the spreadsheet is
fully synchronized with the data Alter Ego has in its memory, and thus should solve many bugs related to the Items and
Inventory Items sheets.

One of the new caveats with this update is that since the entire spreadsheet is updated every so often, you cannot make
edits to it during gameplay, because your edits will be overwritten during the next save. To fix this, a new mode has
been added to Alter Ego: **edit mode**, which can be toggled on and off with the `editmode` command. When edit mode is
enabled, game data will not be saved to the spreadsheet, and Players will not be able to use any commands (except for
the `say` command, if applicable) to avoid changing the game state. This allows you to make edits to the spreadsheet
without worrying about them getting overwritten. It is crucial that you only make edits to the spreadsheet while edit
mode is enabled. Be sure to check the help menu for the `editmode` command as well as the new `save` command, which lets
you save manually at any time.

...

A new minor update has been made to the way Alter Ego loads rooms! The "No. Exits" column, which became defunct due to a
past update, has been repurposed. Now, if you insert an image URL with a .jpg, .png, or .gif extension into that column
for a given room, Alter Ego will display the linked image when sending the room description to a player as in the
example shown below! The only change you need to make after updating your code is clearing out the contents of the "No.
Exits" column and replacing the label with "Icon URL". If you do not wish to set icons for any rooms, you do not have to
use this feature. If no icon URL is provided for a given room, then Alter Ego will simply use the URL in the
defaultRoomIconURL setting in your settings file, and if *that* isn't set, then it will default to the server icon.

---

# [v0.9.9] - 2020-05-09

Alter Ego version 0.9.9 has been released!

New features include:

- Added Events to the game. Events are occurrences that can happen either at set times of day or when triggered by
  something else. For example, you can now have a day/night cycle that consists of Events triggered at certain times of
  day, as well as weather Events, explosions, etc.
- Rooms can now have tags. Room tags are a comma-separated list of words/phrases that allow Events to occur in that
  Room.
- Puzzles can now have multiple solutions. The solution used to solve a Puzzle is now output to its Outcome cell.
- Puzzles can now have multiple sets of solved/unsolved commands to run depending on their outcome.
- Added voice, probability, channels, and weight Puzzle types.
- Added spectator channels which allow you to view the whole game from any player's perspective in chronological order.
- Added Gestures - predefined Narrations that players can use to communicate nonverbally even when muted.
- Added heatedSlowdownRate to the settings file. When at least one player is inflicted with the heated Status Effect,
  all players will have their movement time multiplied by this value, giving you slightly more time to handle heated
  situations.
- Players can now shout by sending message in all caps. Their message will be heard in all adjacent rooms.
- Added finder module, which can be used to find pieces of game data in if/var tags.
- Added sender, receiver, and thief Status Effect attributes.
- Status Effects messages that are applied to all players at once will no longer be sent to the announcements channel.
- When loading players, Alter Ego will now check if there are any players who cannot receive direct messages from server
  members.

The newest spreadsheet format can be found here:
https://docs.google.com/spreadsheets/d/1MqdWPqUmhR6qqJJsC5zMwyvIYmIwENEFcYENBd50Iwg/edit?usp=sharing

---

[v2.0.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.10.1...2.0.0
[v1.10.1]: https://github.com/MsVBLANK/Alter-Ego/compare/1.10.0...1.10.1
[v1.10.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.9.0...1.10.0
[v1.9.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.8.0...1.9.0
[v1.8.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.7.1...1.8.0
[v1.7.1]: https://github.com/MsVBLANK/Alter-Ego/compare/1.7.0...1.7.1
[v1.7.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.6.0...1.7.0
[v1.6.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.5.0...1.6.0
[v1.5.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.4.1...1.5.0
[v1.4.1]: https://github.com/MsVBLANK/Alter-Ego/compare/1.4.0...1.4.1
[v1.4.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.3.2...1.4.0
[v1.3.2]: https://github.com/MsVBLANK/Alter-Ego/compare/1.3.1...1.3.2
[v1.3.1]: https://github.com/MsVBLANK/Alter-Ego/compare/1.3.0...1.3.1
[v1.3.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.2.0...1.3.0
[v1.2.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.1.0...1.2.0
[v1.1.0]: https://github.com/MsVBLANK/Alter-Ego/compare/1.0.4...1.1.0
[v1.0.4]: https://github.com/MsVBLANK/Alter-Ego/compare/1.0.3...1.0.4
[v1.0.3]: https://github.com/MsVBLANK/Alter-Ego/compare/1.0.2...1.0.3
[v1.0.2]: https://github.com/MsVBLANK/Alter-Ego/compare/1.0.1...1.0.2
[v1.0.1]: https://github.com/MsVBLANK/Alter-Ego/compare/1.0.0...1.0.1
[v1.0.0]: https://github.com/MsVBLANK/Alter-Ego/compare/0.9.91...1.0.0
[v0.9.91]: https://github.com/MsVBLANK/Alter-Ego/compare/0.9.9...0.9.91
[v0.9.9]: https://github.com/MsVBLANK/Alter-Ego/compare/0.9.8...0.9.9
