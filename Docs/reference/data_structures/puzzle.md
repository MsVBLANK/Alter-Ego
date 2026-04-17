# Puzzle

A **Puzzle** is a data structure used by Alter Ego. Its primary purpose is to allow [Players](player.md) to
interact with the game world and change its state in predictable, predefined ways. While this can be in the form of a
gameplay puzzle that the Player can solve, a Puzzle can be far simpler than what would traditionally be called a puzzle
in most games.

## Attributes

In order to provide a versatile array of behaviors, Puzzles have many attributes. Note that if an attribute is
_internal_, that means it only exists within
the [Puzzle class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Puzzle.ts). Internal attributes will be given
in the "Class attribute" bullet point, preceded by their data type. If an attribute is _external_, it only exists on the
spreadsheet. External attributes will be given in the "Spreadsheet label" bullet point.

### Name

- Spreadsheet label: **Puzzle Name**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.name`

This is the name of the Puzzle. All letters should be capitalized, and spaces are allowed. Players will be able to
interact with this Puzzle by using it as an argument in the [use command](../commands/player_commands.md#use). Note that
multiple Puzzles can have the same name, so long as they are in different Rooms. However, to lower the likelihood of
collisions and enable certain features, it is recommended that each Puzzle be given a unique name whenever possible.

### Solved

- Spreadsheet label: **Solved?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.solved`

This is a simple Boolean value indicating whether the Puzzle has already been solved or not. If this is `true`, then the
Puzzle has been solved. If it is `false`, then the Puzzle has not been solved. How this affects a Puzzle's behavior
varies based on the Puzzle's [type](#type), but in general, if the Puzzle has not been solved, then a Player
can attempt to solve it. If the Puzzle has been solved, then the Player will simply receive the text in
the [already solved description](#already-solved-description).

### Outcome

- Spreadsheet label: **Outcome**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.outcome`

This is a string indicating which [solution](#solutions) the Puzzle has been solved with, if any. If the Puzzle
is not solved or only has one possible solution, then this must be blank. In general, this does not need to be set
manually. Alter Ego will automatically set this when the Puzzle is solved, if it has multiple possible solutions. This
should only be set manually if the Puzzle should be solved by default. If that is the case, then it should match exactly
one of the Puzzle's solutions.

### Requires Moderator

- Spreadsheet label: **Requires Mod?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.requiresMod`

This is another Boolean value indicating whether the Puzzle requires [moderator](../../moderator_guide/moderating)
intervention to solve. If this is `true`, then the Puzzle can only be solved by using the
[puzzle](../commands/moderator_commands.md#puzzle) [command](../commands/bot_commands.md#puzzle), and a Player who
attempts to solve the Puzzle will receive the message "You need moderator assistance to do that." If this is `false`,
then a Player will be able to attempt to solve the Puzzle freely.

A Puzzle that requires moderator intervention to solve can be useful in a few situations. A few examples are:

- A Puzzle whose solution cannot be entered in a [Discord](../../about/discord.md) message and interpreted by Alter Ego,
  such as an image or an arrangement of items in a certain order,
- A Puzzle with an open-ended solution that requires a Player to think creatively,
- A Puzzle that can only be attempted under certain conditions,
- A Puzzle that is not intended to be solved until a certain time, and
- A Puzzle that is not intended to be directly interacted with, only existing for game-mechanic purposes.

By making use of this attribute, a Puzzle can be given greater flexibility of solutions, while still making use of the
predefined behavior that makes Puzzles such a useful data type.

### Location Display Name

- Spreadsheet label: **Location**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.locationDisplayName`

This is the [display name](room.md#display-name) of the Room that the Puzzle can be found in. This must match the
Room's display name on the spreadsheet exactly, or its [ID](room.md#id).

### Location

- Class attribute: [Room](room.md) `this.location`

This internal attribute is a reference to the actual Room object the Puzzle can be found in.

### Parent Fixture Name

- Spreadsheet label: **Parent Fixture**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.parentFixtureName`

This is the name of a [Fixture](fixture.md) that is associated with the Puzzle, if any. The parent Fixture must be in
the same Room as the Puzzle referencing it. If the name of a Fixture is supplied, then a Player will be able to supply
the name of the parent Fixture as an argument in the use command instead of the name of the Puzzle.
[Narrations](narration.md) involving the Puzzle will also use the parent Fixture's name instead of the Puzzle's
name. This is particularly useful if every Puzzle is given a unique name. For example, if the Puzzle is named "PANIC
BUTTON" and the parent Fixture is named "YELLOW BUTTON", then a Player will be able to interact with the Puzzle by
sending `.use YELLOW BUTTON` or `.use PANIC BUTTON`. When the Puzzle is interacted with by a Player named Haru, Alter
Ego will send "Haru uses the YELLOW BUTTON." to the PANIC BUTTON's Room channel.

Additionally, by assigning a Puzzle a parent Fixture, it becomes possible for the Puzzle to contain
[Room Items](room_item.md). This allows Room Items to be made inaccessible until the Puzzle is solved, while also
allowing Players to take and drop Room Items from/into the parent Fixture if the Puzzle is solved. When a Fixture
capable of containing Items is assigned a child Puzzle, the
[item list](../../moderator_guide/writing_descriptions.md#il) must be in the Puzzle's already solved description.
If no parent Fixture is needed, this cell can simply be left blank on the spreadsheet.

### Parent Fixture

- Class attribute: [Fixture](fixture.md) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.parentFixture`

This is an internal attribute which simply contains a reference to the actual Fixture object whose name matches
`this.parentFixtureName` and whose location is the same as the Puzzle. If no parent Fixture name is given, this will be
`null` instead.

### Parent Object Name

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.parentFixtureName` instead.

- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.parentObjectName`

This internal attribute is a copy of the parent Fixture name. It is named this way because Fixtures were named Objects
prior to Alter Ego version 2.0. This attribute will be removed in the future.

### Parent Object

> [!WARNING]
> This attribute is deprecated and will be removed in a future release.
>
> Use `this.parentFixture` instead.

- Class attribute: [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
  `this.parentObject`

This is an internal attribute left over from when Fixtures were named Objects prior to Alter Ego version 2.0. This is
never assigned, so it is always `null`. This attribute will be removed in the future.

### Type

- Spreadsheet label: **Type**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.type`

This is a string which determines the specific behavior of the Puzzle. This must match exactly one of the predefined
Puzzle types that have been programmed into Alter Ego. Here, each Puzzle type will be listed, and their behavior will be
detailed. Note that if the term `[PUZZLE NAME]` is used, it doesn't necessarily refer to the Puzzle's name attribute. It
can refer to that, or the name of the Puzzle's parent Fixture, if it has one.

#### `password`

- A Player must enter the correct password in order to solve the Puzzle. The password is case-sensitive.
- If a Player enters an incorrect password, they will be sent the Puzzle's incorrect description.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `interact`

- A Player must only interact with the Puzzle in order to solve it.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `matrix`

- The Puzzle behaves exactly the same as an `interact`-type Puzzle. However, its [command sets](#command-sets-string)
  have special behavior.
- When the Puzzle's solved/unsolved commands are executed, its [requirements](#requirements-strings) are accessible in
  the commands being executed.
  - If a command contains the name of one of its required Puzzles in curly braces (for example: `{PUZZLE NAME}`), that
    text will be replaced with that Puzzle's outcome before it is executed.
  - If a command contains the ID of one of its required [Flags](flag.md) in curly braces
    (for example: `{ONCE GLAZED SCULPTURE IDENTIFIER}`) and that Flag has a String value, that text will be replaced
    with the Flag's value before it is executed. Note that although the example Flag must have been listed in the
    requirements in the form `Flag: ONCE GLAZED SCULPTURE IDENTIFIER`, the `Flag: ` prefix must be omitted here.
  - Requirements of other data types cannot be used for find-and-replace in `matrix`-type Puzzles.
- This special behavior allows solved/unsolved commands to have variable arguments that result in different behavior
  depending on the state of the Puzzle's requirements. This is especially useful for instantiating
  [procedurally-generated Prefabs](../../moderator_guide/writing_descriptions.md#poss-attribute-name) with possibilities
  manually selected by a Player in other Puzzles. However, this behavior can be used in any of the Puzzle's bot commands.

#### `toggle`

- A Player must only interact with the Puzzle in order to solve it.
- Once the Puzzle has been solved, it can be unsolved when a Player interacts with it again. This allows it to be
  "toggled" between two states at will.
- When a Player interacts with the Puzzle, whether they solve or unsolve it, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel. However, if the
  Player attempts to unsolve it and the requirements have not all been met, Alter Ego will narrate
  `[Player displayName] attempts to use the [PUZZLE NAME], but struggles.` instead.

#### `player`

- A Player must only interact with the Puzzle in order to solve it. However, the Player's name must match one of the
  Puzzle's solutions. The name is case-sensitive.
- If a Player attempts to solve the Puzzle and their name is not listed as one of its solutions, they will be sent
  the Puzzle's incorrect description.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description, even if
  they would not be able to solve it themself.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `room player`

- A Player must enter the display name of a Player in the same Room as them in order to solve the Puzzle. However, the
  chosen Player's display name must match one of the Puzzle's solutions. The display name is _not_ case-sensitive.
- If a Player solves the Puzzle, Alter Ego will narrate `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's
  Room channel. When the Puzzle's solved commands are executed, the selected Player will be passed into the
  commandHandler module. As a result, any bot commands that use the `player` argument will execute as if the selected
  Player was the one who initiated them.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description. Alter Ego
  will narrate `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.
- If a Player fails to solve the Puzzle, Alter Ego will narrate
  `[Player displayName] attempts to use the [PUZZLE NAME], but struggles.` in the Puzzle's Room channel.

#### `player toggle`

- A Player must only interact with the Puzzle in order to solve it. However, the Player's name must match one of the
  Puzzle's solutions. The name is case-sensitive.
- If a Player attempts to solve the Puzzle and their name is not listed as one of its solutions, they will be sent
  the Puzzle's incorrect description.
- Once the Puzzle has been solved, it can be unsolved by the Player whose name matches the current outcome, as long as
  all of the Puzzle's requirements are met. Effectively, this means it can only be unsolved by the Player who solved it.
- If a Player attempts to unsolve the Puzzle, but they are not the Player given in the Puzzle's outcome, or they attempt
  to unsolve it and the requirements have not all been met, they will be sent its already solved description.
- When a Player interacts with the Puzzle, whether they solve or unsolve it, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `combination lock`

- A Player must enter the correct password in order to solve the Puzzle. The password is case-sensitive. If a Player
  solves the Puzzle, Alter Ego will narrate `[Player displayName] unlocks the [PUZZLE NAME].` in the Puzzle's Room
  channel.
- Once the Puzzle has been solved, it can be unsolved when a Player attempts to solve it again using an incorrect
  password or by using the lock alias for the use command.
- If a Player unsolves the Puzzle, they will be sent its unsolved description, and Alter Ego will narrate
  `[Player displayName] locks the [PUZZLE NAME].` in the Puzzle's Room channel.
- If the Puzzle is already solved and a Player attempts to solve the Puzzle again using the right password, or without
  supplying a password, they will be sent its already solved description, and Alter Ego will narrate
  `[Player displayName] opens the [PUZZLE NAME].` in the Puzzle's Room channel.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description, and Alter Ego will narrate
  `[Player displayName] attempts and fails to unlock the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `key lock`

- A Player must have an [Inventory Item](inventory_item.md) based on the [Prefab](prefab.md) specified in the Puzzle's
  solution in order to solve the Puzzle. If the Puzzle has no solutions, it behaves almost identically to a
  `toggle`-type Puzzle. If a Player solves the Puzzle, Alter Ego will narrate
  `[Player displayName] unlocks the [PUZZLE NAME].` in the Puzzle's Room channel.
- Once the Puzzle has been solved, it can be unsolved when a Player uses the lock alias for the use command, but only if
  they have the required Inventory Item. If the Player does not have the required Inventory Item, they will be sent the
  Puzzle's requirements not met description, and Alter Ego will narrate
  `[Player displayName] attempts and fails to lock the [PUZZLE NAME].` in the Puzzle's Room channel.
- If a Player unsolves the Puzzle, they will be sent its unsolved description, and Alter Ego will narrate
  `[Player displayName] locks the [PUZZLE NAME].` in the Puzzle's Room channel.
- If the Puzzle is already solved and a Player attempts to solve the Puzzle again while holding the required Inventory
  Item, Alter Ego will narrate `[Player displayName] opens the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `probability`

- A Player must only interact with the Puzzle in order to solve it. One of the Puzzle's solutions will be randomly
  chosen as the outcome.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `stat probability`

- A Player must only interact with the Puzzle in order to solve it. A stat-weighted [Die](die.md) will be rolled to
  semi-randomly choose one of the Puzzle's solutions as the outcome.
- There are five versions of this Puzzle type: `str probability`, `per probability`, `dex probability`,
  `spd probability`, and `sta probability`. The stat that the Die is weighted with determines which of the Player's
  stats will be used. The Player's roll modifier in that stat will be applied to the initial roll, and the ratio of the
  final result to the maximum Die value is multiplied by the number of solutions to determine the outcome. In effect,
  this means that a higher stat value is more likely to consistently yield outcomes which appear later in the list of
  solutions; whereas a lower stat value is more likely to consistently yield outcomes which appear first in the list of
  solutions. A Player with a stat value of 1, for example, may never get the final listed solution and a Player with a
  stat value of 10 may never get the first listed solution, depending on how many solutions there are and the range of
  possible Die rolls.
- The precision of outcomes is limited by the range of Die values. For example, if the Die has
  a [minimum](../settings.md#dice_min) of 1 and a [maximum](../settings.md#dice_max) of 6,
  but there are 20 solutions, some outcomes may be impossible to achieve.
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If a Player attempts to solve the Puzzle again, they will be sent the Puzzle's already solved description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `channels`

- A Player must only interact with the Puzzle in order to solve it. However, the Player can also enter the correct
  password to solve the Puzzle. The password is case-sensitive. If a password is supplied, it will be used as the
  outcome. If no password is supplied and the Puzzle has no current outcome, the first solution in the list will be used
  as the outcome. If no password is supplied and the Puzzle _does_ have a current outcome, that outcome will be used.
  If a Player solves the Puzzle, Alter Ego will narrate `[Player displayName] turns on the [PUZZLE NAME].`
  in the Puzzle's Room channel.
- Once the Puzzle has been solved, it can be unsolved when a Player interacts with the Puzzle without providing a
  password. The outcome that the Puzzle was previously solved with will be retained and used if the Player solves the
  Puzzle again without providing a password.
- If a Player unsolves the Puzzle, they will be sent its unsolved description, and Alter Ego will narrate
  `[Player displayName] turns off the [PUZZLE NAME].` in the Puzzle's Room channel.
- If the Puzzle is already solved and a Player attempts to solve the Puzzle again using a correct solution, they will
  solve it again with that solution as the outcome, and Alter Ego will narrate `[Player displayName] changes the
  channel to [outcome] on the [PUZZLE NAME].` in the Puzzle's Room channel.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description, and Alter Ego will narrate
  `[Player displayName] attempts and fails to change the channel on the [PUZZLE NAME].` in the Puzzle's Room channel.

#### `weight`

- A Player must take from or drop into the Puzzle a Room Item which makes the total weight of all Room Items contained
  in the Puzzle equal one of the Puzzle's solutions in order to solve the Puzzle. In order to prevent the Player from
  simply entering the correct weight as a password with the use command, the Puzzle should be made inaccessible.
- Once the Puzzle has been solved, it can be unsolved when the Player takes from or drops into the Puzzle a Room Item
  which makes the total weight of all Room Items in the Puzzle not equal one of its solutions. The Player will be sent
  its unsolved description.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel.

#### `container`

- A Player must take from or drop into the Puzzle a Room Item which makes it contain all of the Room Items listed in one
  of its solutions. Every time a Room Item is dropped into the Puzzle, Alter Ego will check if the complete list of
  Room Items contained inside it matches one of its solutions. If multiple Room Items are required to solve
  the Puzzle, they should be separated with a plus sign (`+`) in the solution. In order to prevent the Player from
  simply entering the Prefab IDs as a password with the use command, the Puzzle should be made inaccessible.
- Once the Puzzle has been solved, it can be unsolved when the Player takes from or drops into the Puzzle a Room Item.
  However, if the new list of contained Room Items is also a valid solution, the Puzzle will immediately be solved again
  using them as an outcome. Otherwise, the Player will be sent its unsolved description.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel.

#### `take`

- A Player must take from the Puzzle a Room Item listed in one of its solutions in order to solve it.
- Once the Puzzle has been solved, it can be solved again by taking a Room Item listed in one of its solutions. It can
  be solved repeatedly this way. It can never be directly unsolved by a Player without moderator intervention.
- If a Player takes a Room Item from the Puzzle that is not listed among its solutions, they will fail to solve the
  Puzzle, and they will be sent its incorrect description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel. However, if the Room Item is [non-discreet](prefab.md#discreet), it will still narrate
  that they took it.

#### `drop`

- A Player must drop into the Puzzle a Room Item listed in one of its solutions in order to solve it.
- Once the Puzzle has been solved, it can be solved again by dropping a Room Item listed in one of its solutions into
  it. It can be solved repeatedly this way. It can never be directly unsolved by a Player without moderator intervention.
- If a Player drops a Room Item into the Puzzle that is not listed among its solutions, they will fail to solve the
  Puzzle, and they will be sent its incorrect description.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel. However, if the Room Item is non-discreet, it will still narrate that they dropped it.

#### `voice`

- A Player must say the correct password in the Puzzle's location to solve it. The password is case-insensitive, and
  non-alphanumeric (A-Z, 0-9, and spaces) characters will be ignored. Additionally, the Player's whole message does not
  need to be the password; it only needs to contain it. For example, if the password is "unlock the door", then a Player
  who says "How do I unlock the door?" will still solve the Puzzle.
- It is worth nothing that even if the Player is not in the Room directly, as long as their dialog is audible in the
  Room that the Puzzle is in, and the dialog is not [whispered](whisper.md), they will solve the Puzzle.
  This can happen when:
    - A Player shouts the correct password in a Room adjacent to the Puzzle,
    - A Player with the [`sender` behavior attribute](status.md#sender) says the correct password while a Player with
      the [`receiver` behavior attribute](status.md#receiver) is in the Room that the Puzzle is in, or
    - A Player says the correct password and their dialog is transmitted to the Room that the Puzzle is in, because it
      has the [`audio monitoring` tag](room.md#audio-monitoring).
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- If the Puzzle is already solved and a Player attempts to solve the Puzzle again with a valid solution, they will solve
  it again with that solution as the outcome.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel.

#### `switch`

- A Player must enter the correct password in order to solve the Puzzle. The password is case-sensitive. If a Player
  solves the Puzzle, Alter Ego will narrate `[Player displayName] sets the [PUZZLE NAME] to [outcome].` in the
  Puzzle's Room channel.
- A `switch`-type Puzzle can never be unsolved under any circumstances; it can only be set to different outcomes. For
  this reason, Alter Ego will fail to load `switch`-type Puzzles that are not solved
  and which do not have an outcome set.
- If the Player attempts to solve the Puzzle again using the same password as the current outcome,
  they will be sent its already solved description, and Alter Ego will narrate
  `[Player displayName] uses the [PUZZLE NAME], but nothing happens.` in the Puzzle's Room channel.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description, and Alter Ego will narrate
  `[Player displayName] attempts to set the [PUZZLE NAME], but struggles.` in the Puzzle's Room channel.

#### `option`

- A Player must enter the correct password in order to solve the Puzzle. The password is case-sensitive. If a Player
  solves the Puzzle, Alter Ego will narrate `[Player displayName] sets the [PUZZLE NAME] to [outcome].` in the
  Puzzle's Room channel.
- Once the Puzzle has been solved, it can be unsolved when a Player attempts to solve it without supplying a password.
- If a Player unsolves the Puzzle, they will be sent its unsolved description, and Alter Ego will narrate
  `[Player displayName] resets the [PUZZLE NAME].` in the Puzzle's Room channel.
- If the Puzzle is already solved and a Player attempts to solve it again with a valid solution that is different from
  the current outcome, they will solve it again.
- If the Puzzle is already solved and a Player attempts to solve it again using the same password as the current
  outcome, they will be sent its already solved description, and Alter Ego will narrate
  `[Player displayName] sets the [PUZZLE NAME], but nothing changes.` in the Puzzle's Room channel.
- If a Player fails to solve the Puzzle, they will be sent its incorrect description, and Alter Ego will narrate
  `[Player displayName] attempts to set the [PUZZLE NAME], but struggles.` in the Puzzle's Room channel.

#### `media`

- A Player must provide the name of an Inventory Item in their inventory which is one of the Puzzle's solutions in order
  to solve the Puzzle. Unlike other Puzzle types which require an Inventory Item to solve, the name of the Inventory
  Item **must** be provided in the Player's use command; simply having it in their inventory isn't sufficient. If a
  Player solves the Puzzle, Alter Ego will narrate `[Player displayName] inserts [item phrase] into the [PUZZLE NAME].`
  in the Puzzle's Room channel. The item phrase can be one of two things: if the Inventory Item's Prefab is discreet,
  it will simply be "an item"; otherwise, it will be the Inventory Item's
  [single containing phrase](inventory_item.md#single-containing-phrase).
- Once the Puzzle has been solved, it can be unsolved when a Player interacts with the Puzzle without providing the name
  of an Inventory Item.
- If a Player unsolves the Puzzle, they will be sent the Puzzle's unsolved description, and Alter Ego will narrate
  `[Player displayName] presses eject on the [PUZZLE NAME].` in the Puzzle's Room channel.
- If the Puzzle is already solved and a Player attempts to solve the Puzzle again with one of the Puzzle's solutions,
  they will be sent an error message.
- If a Player fails to solve the Puzzle, Alter Ego will narrate
  `[Player displayName] attempts to insert [item phrase] into the [PUZZLE NAME], but it doesn't fit.` in the Puzzle's
  Room channel. The item phrase can be one of two things: if the Inventory Item's Prefab is discreet, it will simply be
  "an item"; otherwise, it will be the Inventory Item's single containing phrase.
- If a Player attempts to solve the Puzzle without specifying the name of an Inventory Item, they will be sent its
  requirements not met description, and Alter Ego will narrate
  `[Player displayName] attempts to use the [PUZZLE NAME], but struggles.` in the Puzzle's Room channel.

#### `restricted exit`

- A Player must exit the Puzzle's location through the [Exit](exit.md) whose name matches the name of this Puzzle in
  order to solve it. However, the Player's name must match one of the Puzzle's solutions, and the Puzzle must be
  accessible. The Exit must be in the same Room as the Puzzle.
- If the Player solves the Puzzle, they will be able to move through the Exit, even if it's [locked](exit.md#unlocked).
- Once the Puzzle has been solved, it can never be directly unsolved by a Player without moderator intervention.
- Even if the Puzzle has been solved, it will be repeatedly solved any time a Player moves through the Exit if they are
  listed in its solutions and the Puzzle is accessible.
- When a Player interacts with the Puzzle in any way, whether they solve it or not, Alter Ego will not narrate anything
  in the Puzzle's Room channel.

### Accessible

- Spreadsheet label: **Accessible?**
- Class attribute: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
  `this.accessible`

This is a Boolean value indicating whether the Puzzle can currently be interacted with or not. If this is `true`,
then Players can attempt to solve the Puzzle with the use command. However, if the Puzzle has requirements and not all
of them are met, the Puzzle will be made inaccessible. If it is `false`, then a number of things will happen when a
Player uses the Puzzle, based on various factors. If the Puzzle has any requirements, Alter Ego will check each one to
see if it is met.

If all requirements are met, the Puzzle will be made accessible, and the Player will be able to attempt to solve it.
If all requirements are not met, the Player will receive the Puzzle's
[requirements not met description](puzzle.md#requirements-not-met-description), and Alter Ego will narrate
`[Player displayName] uses the [PUZZLE NAME].` in the Puzzle's Room channel. However, if the
Puzzle has no requirements not met description, Alter Ego will act as if the Puzzle doesn't exist if the Player tries
to use it, and no Narration will be sent.

Note that if a Puzzle's type is `weight`, `container`, `take`, or `drop`, the Puzzle does not need to be accessible to
be attempted. However, its requirements will still be evaluated, and its accessibility updated accordingly.

### Requirements Strings

- Spreadsheet label: **Requires**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  `this.requirementsStrings`

This is a comma-separated list of strings corresponding to Puzzle names, Event IDs, Prefab IDs, and/or Flag IDs that are
required for the Puzzle to be made accessible if it is not already, and vice versa. They have the following structure:

```ts
interface PuzzleRequirement {
    /** The type of entity required. Either `Puzzle`, `Event`, `Flag`, or `Prefab`. **/
    type: string;
    /** The ID of the required entity. */
    entityId: string;
}
```

Required Puzzle names must match a Puzzle's name exactly on the spreadsheet, although they can
optionally be prefixed with `Puzzle: `. They do not need to be in the same Room as the Puzzle that requires them. If
there are multiple Puzzles with the same name as one that is required, then the first to appear on the sheet will be
required. For this reason, it is strongly suggested that Puzzles are given unique names. If a Puzzle is a requirement,
then it must be solved in order for the requirement to be considered met.

Prefabs can also be listed as requirements. However, they **must** be prefixed with `Prefab: `, `Item: `, `RoomItem: `,
or `InventoryItem: `, followed by the Prefab ID. None of these aliases affect the requirement in any way --- they will
all be interpreted as a Prefab requirement. If a Prefab is a requirement, then the Player must have an Inventory
Item based on that Prefab for the requirement to be considered met.

Events can additionally be listed as requirements. However, they **must** be prefixed with `Event: `, followed by the
Event ID. If an Event is a requirement, then it must be ongoing for the requirement to be considered met.

Flags can additionally be listed as requirements. However, they **must** be prefixed with `Flag: `, followed by the Flag
ID. If a Flag is a requirement, its [value script](flag.md#value-script) will be evaluated first, if it has one.
It must either have a String value that is not empty, or have a Boolean value that is `true`
for the requirement to be considered met.

In order for a Puzzle to be made accessible, _all_ of its requirements must be met.

### Requirements

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Puzzle](puzzle.md) | [Prefab](prefab.md) | [Event](event.md) | [Flag](flag.md)>
  `this.requirements`

This is an internal attribute which contains references to each of the Puzzle, Prefab, Event, and Flag objects whose
IDs are listed in `this.requirementsStrings`.

### Solutions

- Spreadsheet label: **Solution(s)**
- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
  `this.solutions`

This is a comma-separated list of accepted solutions to the Puzzle. There is no limit to how many solutions can be
listed. There are two types of solutions: passwords and items.

Password solutions are generally case-sensitive and generally must be given in the Player's use command in order to
attempt to solve the Puzzle, although this varies by Puzzle type.

Item solutions must consist of `Item: `, `Prefab: `, or `InventoryItem: ` followed by a Prefab ID. In general, Item
solutions require only that the Player have an Inventory Item of the given Prefab in their inventory in order to solve
the Puzzle. In some situations, listing an Item as a requirement or as a solution to the Puzzle produces identical
behavior. The difference, however, is that required Items must all be present in the Player's inventory, whereas an
Item solution only requires one Item in the Player's inventory to solve the Puzzle.

A Puzzle can only be solved with one solution as its outcome at a time.

### Remaining Attempts

- Spreadsheet label: **Remaining Attempts**
- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.remainingAttempts`

This is a whole number indicating how many times the Puzzle can be failed. Each time a Player attempts to solve the
Puzzle and fails, this number will decrease by 1. If this reaches 0, the Puzzle cannot be solved, even if the correct
solution is provided, and a Player who attempts to do so will receive the Puzzle's
[no more attempts description](puzzle.md#no-more-attempts-description). If no number is given, the Puzzle can be
attempted and failed infinitely many times.

In general, it is good practice to indicate how many attempts a Puzzle has remaining _before_ a Player attempts to solve
it by including that information in the parent Fixture's [description](fixture.md#description). Otherwise, multiple
Players may independently attempt to solve it for the first time, unaware that it has a limited number of attempts, and
its number of attempts will be quickly exhausted.

It is also good practice not to lock important information behind a Puzzle with a limited number of attempts. It is not
possible to restore the number of attempts except by editing its remaining attempts manually on the spreadsheet. The
best use case for a Puzzle with a limited number of attempts is to restrict access to an optional, powerful Item
that is not needed for anything else.

### Command Sets String

- Spreadsheet label: **When Solved / Unsolved**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
  `this.commandSetsString`

This is a comma-separated list of sets of [bot commands](../commands/bot_commands.md) that will be executed when the
Puzzle is solved or unsolved.

If the Puzzle has only one solution, then command sets are implicit, and do not need to be written. Instead, a simple
list of commands is sufficient. This takes the form of a comma-separated list of bot commands that will be executed when
the Puzzle is solved. A comma-separated list of bot commands that will be executed when the Puzzle is unsolved can also
be included, with both sets separated by a forward slash (`/`). If no unsolved commands are desired, then the forward
slash can be omitted from the cell. If no solved commands are desired but unsolved commands are, the forward slash
should be the first character in the cell, with the unsolved commands following it.

Note that when writing bot commands, it is good practice to be as precise as possible and provide room IDs if they are
permitted, in order to prevent potential bugs.

These are all valid examples of commands for a Puzzle with only one solution:

- `unsolve GREEN 12, unsolve PANEL 12 floor-2-hall-3, lock suite-12 DOOR`
- `set accessible puzzle items LOCKER 1 locker-room / set inaccessible puzzle items LOCKER 1 locker-room`
- `/ set inaccessible fixture INPUT computer-lab`

If the Puzzle has multiple solutions, then the command set format is required, with each set being comma-separated. The
correct format is:

`[solution 1(, solution 2(, solution N)): solved commands / unsolved commands]`

Multiple solutions can share the same set of commands. The same rules as above apply, however there is one additional
rule to keep in mind: Item solutions must be listed exactly as they appear in the solutions set, with the `Item: `,
`Prefab: `, or `InventoryItem: ` prefix.

Due to the complexity of multi-solution Puzzles, their list of command sets can get quite long. For this reason, it is
best to learn and master [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) in
order to write command sets. [RegExr](https://regexr.com/) is an excellent resource for practicing and using regex.

These are all valid examples of Puzzles with multiple solutions:

- `[17, seventeen: unlock suite-10 VENT / lock suite-10 VENT]`

- `[2: solve VENT suite-2, unlock suite-2 VENT / unsolve VENT suite-2, lock suite-2 VENT], [3, 4, 5, 6, 19, 27, 30, 42, 43, 49, 65, 66, 69, 83, 91: unsolve VENT suite-2, lock suite-2 VENT]`

- `[OPEN: trigger BLAST DOOR 1, unlock cave-11 TUNNEL 1, unlock cave-11 TUNNEL 2, unlock cave-11 TUNNEL 3, trigger EXPLOSION COUNTDOWN END], [CLOSED: end BLAST DOOR 1, lock cave-11 TUNNEL 1, lock cave-11 TUNNEL 2, lock cave-11 TUNNEL 3]`

- `[Item: BLUE DANUBE CD: destroy player BLUE DANUBE CD, trigger BLUE DANUBE WALTZ / end BLUE DANUBE WALTZ, instantiate BLUE DANUBE CD on FLOOR at ballroom], [Item: EINE KLEINE NACHTMUSIK CD: destroy player EINE KLEINE NACHTMUSIK CD, trigger EINE KLEINE NACHTMUSIK WALTZ / end EINE KLEINE NACHTMUSIK WALTZ, instantiate EINE KLEINE NACHTMUSIK CD on FLOOR at ballroom], [Item: FUR ELISE CD: destroy player FUR ELISE CD, trigger FUR ELISE WALTZ / end FUR ELISE WALTZ, instantiate FUR ELISE CD on FLOOR at ballroom], [Item: BEETHOVENS FIFTH CD: destroy player BEETHOVENS FIFTH CD, trigger BEETHOVENS FIFTH WALTZ / end BEETHOVENS FIFTH WALTZ, instantiate BEETHOVENS FIFTH CD on FLOOR at ballroom], [Item: FOUR SEASONS CD: destroy player FOUR SEASONS CD, trigger FOUR SEASONS WALTZ / end FOUR SEASONS WALTZ, instantiate FOUR SEASONS CD on FLOOR at ballroom], [Item: MARRIAGE OF FIGARO CD: destroy player MARRIAGE OF FIGARO CD, trigger MARRIAGE OF FIGARO WALTZ / end MARRIAGE OF FIGARO WALTZ, instantiate MARRIAGE OF FIGARO CD on FLOOR at ballroom], [Item: CANON IN D MAJOR CD: destroy player CANON IN D MAJOR CD, trigger CANON IN D MAJOR WALTZ / end CANON IN D MAJOR WALTZ, instantiate CANON IN D MAJOR CD on FLOOR at ballroom], [Item: CLAIR DE LUNE CD: destroy player CLAIR DE LUNE CD, trigger CLAIR DE LUNE WALTZ / end CLAIR DE LUNE WALTZ, instantiate CLAIR DE LUNE CD on FLOOR at ballroom]`

- `[TIRAMISU, tiramisu: solve DESSERT IN PROGRESS player "Nestor begins preparing a dessert for player.", wait 60, instantiate TIRAMISU on TABLES at estia, unsolve DESSERT IN PROGRESS player "Penelope places a serving of TIRAMISU on one of the TABLES for player.", unsolve DESSERTS estia], [EK MEK, ek mek: solve DESSERT IN PROGRESS player "Nestor begins preparing an appetizer for player.", wait 60, instantiate EK MEK on TABLES at estia, unsolve DESSERT IN PROGRESS player "Penelope places a serving of EK MEK on one of the TABLES for player.", unsolve DESSERTS estia], [GELATO, gelato: solve DESSERT IN PROGRESS player "Nestor begins preparing a dessert for player.", wait 60, instantiate GELATO on TABLES at estia, unsolve DESSERT IN PROGRESS player "Penelope places a bowl of GELATO on one of the TABLES for player.", unsolve DESSERTS estia]`

#### Command Chaining

When a Puzzle's commands solve or unsolve another Puzzle, its commands will not be executed. This is to guard against
infinite loops, which can cause Alter Ego to crash. However, it is possible to circumvent this by causing an
[Event's triggered/ended commands](event.md#commands-string) or a
[Flag's set/cleared commands](flag.md#command-sets-string) to be executed, which in turn cause a Puzzle's
solved/unsolved to be executed. This practice is called **command chaining**, and it can be utilized to achieve very
complex behavior.

To give an example, suppose there are the following Puzzles:

| Puzzle Name            | When Solved / Unsolved                                              |
|------------------------|---------------------------------------------------------------------|
| KEYPAD                 | trigger SEED VAULT GAS WARNING                                      |
| SEED VAULT GAS PROCEED | trigger SEED VAULT GAS, wait 10, unsolve SEED VAULT GAS PROCEED     |
| SEED VAULT GAS FINISH  | trigger SEED VAULT GAS SAFE, wait 10, unsolve SEED VAULT GAS FINISH |

And the following Events:

| Event ID               | Duration | When Triggered / Ended                                                        |
|------------------------|----------|-------------------------------------------------------------------------------|
| SEED VAULT GAS WARNING | 30s      | / solve SEED VAULT GAS PROCEED                                                |
| SEED VAULT GAS         | 270s     | lock seed-vault DOOR / unsolve KEYPAD seed-vault, solve SEED VAULT GAS FINISH |
| SEED VAULT GAS SAFE    | 2m       | / unlock seed-vault DOOR                                                      |

When the KEYPAD Puzzle is solved, whether by a Player or some other means, it will trigger SEED VAULT GAS WARNING.
Much like Puzzles cannot cause Puzzles' commands to be executed, Events cannot cause Events' commands to be executed.
So, after its short duration, SEED VAULT GAS WARNING solves SEED VAULT GAS PROCEED, a Puzzle that only exists to trigger
SEED VAULT GAS, so that _its_ commands can be executed, and so on, until the final step, when SEED VAULT GAS SAFE ends.

This is how command chaining works: the bot commands of different Game Entities are _chained_ together, to achieve more
complex behavior than what is possible with individual Game Entities.

This particular example could be referred to as a Puzzle-Event-Puzzle chain, but more complex chains are possible.
Command chains usually involve Puzzles, because they are the easiest to chain, Players are able to interact with them
directly, and they are capable of having many different command sets.

To achieve the most versatile behavior, a Puzzle-Flag-Puzzle chain is ideal, as it is possible to set a Flag's value
script using bot commands---meaning it is possible to execute custom code depending on the outcome of a Puzzle---and
Flags, like Puzzles, can have multiple command sets. The `player` argument can even be repeatedly passed back and
forth in a Puzzle-Flag-Puzzle command chain, keeping the initiating Player in scope the entire time.

Mastery over command chaining is vital to unlocking the full potential of Alter Ego. However, caution should still be
taken in order to ensure that infinite loops cannot occur.

### Command Sets

- Class
  attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  `this.commandSets`

This is an internal attribute which consists of a list of command set objects. Command set objects have the following
structure:

```ts
interface PuzzleCommandSet {
    /** Strings indicating which puzzle solutions will execute the commands in this command set. Optional. */
    outcomes?: Array<string>;
    /** Bot commands that will be executed when the puzzle is solved. */
    solvedCommands: Array<string>;
    /** Bot commands that will be executed when the puzzle is unsolved. */
    unsolvedCommands: Array<string>;
}
```

### Solved Description

- Spreadsheet label: **Description When Solved**
- Class attribute: [Description](description.md) `this.correctDescription`

When a Player solves the Puzzle, they will receive a parsed version of this string. See the article
on [writing descriptions](../../moderator_guide/writing_descriptions.md) for more information. If a Puzzle has multiple
solutions, it can be beneficial to make this vary based on the outcome the Player receives using `if` conditionals. It
should be noted that solutions are all strings, even if they're numbers. Therefore, solutions in `if` conditionals
should be surrounded with single quote characters (`'`).

Unless it is [manually specified](../../moderator_guide/writing_descriptions.md#desc), this Description will be sent
using the [`PLAIN_TEXT` message display type](../../about/discord.md#display-components). However, the accompanying
[Narration](narration.md) will be sent using the `STANDARD` message display type.

### Already Solved Description

- Spreadsheet label: **Description When Already Solved**
- Class attribute: [Description](description.md) `this.alreadySolvedDescription`

When a Player attempts to solve the Puzzle when it is already solved, they will receive a parsed version of this string.
For Puzzles that contain Room Items, the `il` tag must be contained in this description.

Unless it is manually specified, this Description will be sent using the `PLAIN_TEXT` message display type.
However, the accompanying Narration will be sent using the `MINOR` message display type.

### Unsolved Description

- Spreadsheet label: **Description When Unsolved**
- Class attribute: [Description](description.md) `this.unsolvedDescription`

When a Player unsolves the Puzzle, they will receive a parsed version of this string. This will be parsed _before_ the
Puzzle is marked as unsolved, and _before_ the outcome is cleared, so `if` conditionals can still be used to make this
Description vary based on the Puzzle's current outcome.

Unless it is manually specified, this Description will be sent using the `PLAIN_TEXT` message display type.
However, the accompanying Narration will be sent using the `STANDARD` message display type.

### Incorrect Description

- Spreadsheet label: **Description When Incorrect Answer Given**
- Class attribute: [Description](description.md) `this.incorrectDescription`

When a Player attempts to solve the Puzzle and enters the wrong solution, they will receive a parsed version of this
string. It is not possible to access the exact password that the Player supplied in this Description; that information
is discarded.

Unless it is manually specified, this Description will be sent using the `PLAIN_TEXT` message display type.
However, the accompanying Narration will be sent using the `MINOR` message display type.

### No More Attempts Description

- Spreadsheet label: **Description When No Attempts Remain**
- Class attribute: [Description](description.md) `this.noMoreAttemptsDescription`

When a Player attempts to solve the Puzzle but it has 0 remaining attempts, they will receive a parsed version of this
string.

Unless it is manually specified, this Description will be sent using the `PLAIN_TEXT` message display type.
However, the accompanying Narration will be sent using the `MINOR` message display type.

### Requirements Not Met Description

- Spreadsheet label: **Description When Requirements Not Met**
- Class attribute: [Description](description.md) `this.requirementsNotMetDescription`

When a Player attempts to solve the Puzzle but all of the requirements have not been met, they will receive a parsed
version of this string. It is possible to use `if` conditionals to specify which of the requirements has not been met.

If the Puzzle is not accessible and this is blank, then Alter Ego will pretend as if the Puzzle doesn't exist when a
Player attempts to solve it.

Unless it is manually specified, this Description will be sent using the `PLAIN_TEXT` message display type.
However, the accompanying Narration will be sent using the `MINOR` message display type.

### Row

- Class attribute: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
  `this.row`

This is an internal attribute, but it can also be found on the spreadsheet. This is the row number of the Puzzle.

## Methods

Puzzles have a number of functions that can be useful to moderators. This is not an exhaustive list of publicly
accessible methods; only ones that are likely to be useful when writing [Flag value scripts](flag.md#value-script), or
[`if`](../../moderator_guide/writing_descriptions.md#if) and [`var`](../../moderator_guide/writing_descriptions.md#var)
tags in descriptions.

### isItemContainer

```ts
this.isItemContainer();
```

- Purpose: Returns true if the puzzle is capable of containing items.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters: None

### canCurrentlyContainItems

```ts
this.canCurrentlyContainItems(requireEmptySpace?, bypassLimitations?);
```

- Purpose: Returns true if the puzzle is currently capable of being taken from/dropped into.
- Returns: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- Parameters:
    - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
      `requireEmptySpace` - Whether the container needs to be below max capacity.
      Defaults to true. Does nothing for puzzles.
    - [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
      `bypassLimitations` - Whether limitations should be bypassed. If true, the puzzle does not need to be accessible
      or solved. Defaults to false.

### getContainedItems

```ts
this.getContainedItems();
```

- Purpose: Gets all of the items this entity contains. Includes inaccessible items.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
- Parameters: None

### getContainedItemsForItemList

```ts
this.getContainedItemsForItemList(itemListName?, player?);
```

- Purpose: Gets all of the items that should appear in the puzzle's item list. Includes inaccessible items.
- Returns: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Room Item](room_item.md)>
- Parameters:
    - [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
      `itemListName` - The name of the item list. Unused.
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
- Returns: [Room Item](room_item.md)
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

### getContainingPhrase

```ts
this.getContainingPhrase();
```

- Purpose: Gets the name of the parent fixture preceded by "the". If no parent fixture exists,
  returns the puzzle's name preceded by "the" instead.
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters: None

### getPreposition

```ts
this.getPreposition();
```

- Purpose: Gets the preposition of the parent fixture, if applicable. If no parent fixture exists, returns "in".
- Returns: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- Parameters: None
