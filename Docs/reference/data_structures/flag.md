# Flag

A **Flag** is a data structure used by Alter Ego. It represents a small piece of data that needs to be stored
so it can be accessed by other data structures. They are primarily useful when
[writing descriptions](../../moderator_guide/writing_descriptions.md).

## Attributes

As Flags are a relatively simple data type, they have few attributes. Note that if an attribute is _internal_,
that means it only exists within the [Flag class](https://github.com/MolSnoo/Alter-Ego/blob/master/Data/Flag.ts).
Internal attributes will be given in the "Class attribute" bullet point, preceded by their data type. If an
attribute is _external_, it only exists on the spreadsheet. External attributes will be given in the
"Spreadsheet label" bullet point.

### ID

- Spreadsheet label: **Flag ID**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) `this.id`

This is a unique identifier for the Flag. All letters should be capitalized, and spaces are allowed. No two
Flags can have the same ID.

### Value

- Spreadsheet label: **Value**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) `this.value`

This is the current value of the Flag, and is the core attribute around which all of its other behavior
revolves. It is so important that unlike every other function in the
[finder module](../../moderator_guide/writing_descriptions.md#finder-conditionals), the `findFlag` function
returns only the Flag's _value_, and not the Flag itself. This is the stored data that necessitates the
Flag class's entire existence.

A Flag's value can either be a String, Number, or Boolean. Any other data type is invalid. However, its data
type can change at any time, if it is set with a value of a different data type. When a Flag's value is
replaced with one of these data types, it is being _set_. However, if its value is replaced with `null`,
this means the Flag is being _cleared_.

The value can only be updated directly by using the using the
[flag](../commands/moderator_commands.md#flag) [commands](../commands/bot_commands.md#flag).

However, the value can also be updated by evaluating its value script, explained below.

### Value Script

> [!CAUTION]
> This feature has the ability to run code. In order to evaluate a Flag's value script,
> Alter Ego uses its scriptParser module, which evaluates code in a heavily restricted context. While
> it has been tested to prevent access to many functions which can cause severe damage, its security cannot
> be guaranteed, especially if Alter Ego is run outside of a Docker container. Given that the only way to
> insert code is to write it on the spreadsheet or use moderator commands, write access to the sheet
> and access to the Moderator role should be given to as few people as possible.
> There may exist exploits that allow malicious users to do such things as:
>
> - Sending Alter Ego's authentication token to the server
> - Killing a player in the game
> - Shutting down Alter Ego
> - Read, modify, and delete files on your computer
>
> We, the Alter Ego developers, assume no responsibility for damage caused by malicious use of this feature.
> You have been warned.

- Spreadsheet label: **Value Computed By**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) `this.valueScript`

This is a small script that allows a Flag's value to be generated dynamically. Value scripts are short
snippets of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) that return
either a String, Number, or Boolean value. When the script is evaluated, the Flag's value will be
updated accordingly.

Value scripts can be evaluated in one of four ways:
- Loading a Flag with a value script from the sheet,
- Setting one with the [flag](../commands/moderator_commands.md#flag) [commands](../commands/bot_commands.md#flag),
- Attempting or solving a [Puzzle](puzzle.md) that lists the Flag as a requirement, or
- Setting the `evaluate` parameter in the finder module's `findFlag` function to `true`.

Scripts are evaluated using the same function that evaluates `if` and `var` tags in descriptions.
As such, value scripts are beholden to the same rules, and have access to all of the same functions.
However, keep in mind that the `this` keyword in a value script will always refer to the Flag the
value script belongs to. Additionally, the `player` keyword is only accessible when a Flag's value
script is evaluated by the `findFlag` function, when a Player attempts or solves a Puzzle, or when the
flag Bot command is called with a `player` passed along. This means that when value scripts are evaluated
when Flags are loaded from the sheet, an error will be thrown if any of them use the `player` keyword
without being guarded against with a clause such as `player !== undefined`.

Note that for security, scripts are evaluated in a heavily restricted context. A Flag's value script
can only contain a single expression, and it cannot return a value of any type that a Flag cannot be
set with. Additionally, many object properties and functions are outright blocked. Value scripts can
only read data, not write it. Attempting to evaluate any script which breaks these rules will result
in an error being thrown, and the Flag's value will not be updated.

The scriptParser module which evaluates these scripts has been tested to ensure that it cannot do
things such as access the process in which Alter Ego is running, or require modules that would
allow access to files on your computer. However, we, the Alter Ego developers, cannot guarantee
that it is 100% secure. Please heed the warning above, and use this feature with caution. If you
find vulnerabilities with the scriptParser, please report them by opening a new Issue on the
[Alter Ego GitHub page](https://github.com/MolSnoo/Alter-Ego/issues) so they can be fixed.

For more information on writing value scripts, see the
[writing descriptions tutorial](../../moderator_guide/writing_descriptions.md#if).

### Command Sets String

- Spreadsheet label: **When Set / Cleared**
- Class attribute: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) `this.commandSetsString`

This is a comma-separated list of sets of [Bot commands](../commands/bot_commands.md) that will be
executed when the Flag is set or cleared. Set and cleared commands are separated by a forward
slash (`/`). If no cleared commands are desired, then the forward slash can be omitted from the
cell. If no set commands are desired but cleared commands are, the forward slash should be the first
character in the cell, with the cleared commands following it.

Note that when writing Bot commands, it is good practice to be as precise as possible and provide
room IDs if they are permitted, in order to prevent potential bugs. It should also be noted that
when a Flag's commands set or clear another Flag, its commands will not be executed.

It is possible to create separate command sets for different Flag values. If the Flag is set with the
value listed, or it already had that value and it is being cleared, then that command set will be
executed. Multiple values can share the same command set. The command set format is as follows:

`[value 1(, value 2(, value N)): set commands / cleared commands]`

They share the same syntax as [Puzzle command sets](puzzle.md#command-sets-string). However, keep in
mind that the "player" or "room" argument usable in many Bot commands will only be available if the
Flag is being set or cleared because a Player attempted or solved a Puzzle that listed it as a
requirement, or if the flag Bot command was executed and passed the initiating Player along. It is
possible to keep a Player in scope through the use of Puzzle-Flag-Puzzle
[command chaining](puzzle.md#command-chaining).

Set and cleared commands are not executed when a Flag is set or cleared by calling the `findFlag`
function with the `evaluate` parameter set to `true`.

### Command Sets

- Class attribute: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)\<FlagCommandSet> `this.commandSets`

This is an internal attribute which consists of a list of command set objects. Command set objects
have the following structure:

`{ Array<String> values, Array<String> setCommands, Array<String> clearedCommands }`
