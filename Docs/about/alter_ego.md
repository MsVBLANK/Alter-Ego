# Alter Ego

Alter Ego facilitates a unique game with an original ruleset. It is a text adventure game using Discord as a medium.

## Gameplay

The basis of the gameplay is moving between [rooms](../reference/data_structures/room.md). Each room is
represented by a Discord channel. When a player moves from one room to another, they will be removed from the room
channel they are currently in and added to the channel corresponding to the desired room. Upon entering the new room,
they will receive a written description of the room, noting any
interesting [fixtures](../reference/data_structures/fixture.md) they find there. They may check who else is in the room
with them by looking at the Discord member list. In any given room, a player may speak to other players in the room,
inspect fixtures, take and discard [items](../reference/data_structures/room_item.md),
solve [puzzles](../reference/data_structures/puzzle.md), and do various other things.

The game is overseen by at least one [moderator](../moderator_guide/moderating.md). The moderator(s) are
responsible for creating the map, overseeing combat between players, facilitating role play between players, and much
more. Players can reach out to a moderator to perform any actions that cannot be done using Alter Ego. For example,
players can attempt to murder other players, use items in creative ways (such as spilling water on the floor to make
other players slip and fall), restrain other players, and much more. The purpose of Alter Ego is to automate all tasks
that can be automated so that the moderator(s) have more free time to assist players in their role play.
