# Eligible commands

Eligible commands are usable by users with
the [Eligible role](../settings.md#eligible_role) (or the [Tester role](../settings.md#tester_role) if Alter Ego is in
[debug mode](../settings.md#debug_mode)). These commands have extremely limited use, only usable by Players before
they've been given the Player role.

Aside from the help command, Eligible commands can only be used when a game is in progress. They can only be sent in
the user's DMs, or in the [general channel](../settings.md#general_channel) (or the
[testing channel](../settings.md#testing_channel) if debug mode is on). If Alter Ego accepts the user's command and it
was sent in the server, the message in which the command was issued will be deleted.

If a command is issued in DMs, the message does not need to begin with the
[command prefix](../settings.md#command_prefix) (`.` by default). However, if it is sent in a channel in the server,
then the command prefix is required.

Below is a list of all eligible commands, as well as information about each one.

### help

Lists all commands available to you.

#### Aliases

`.help`

#### Examples

    .help
    .help play

#### Details

Lists all commands available to the user. If a command is specified, displays the help menu for that command.

### play

Joins a game.

#### Aliases

`.play`

#### Examples

    .play

#### Details

Adds you to the list of players for the current game.
