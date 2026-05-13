<!--
SPDX-FileCopyrightText: 2026 Amy Poon <amy@amypoon.me>

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Expressing Yourself

Alter Ego is a game about role-playing with others. So what is a role-playing game without talking? This chapter will
teach you how to express yourself using words (and more!) in-game.

## Talking with Others

Talking in Alter Ego is simple; it doesn't even involve any commands! To talk, navigate to your **room channel** and
start sending messages. That's it! Now everyone in the room can read what your character is speaking.

Let's try that out.

```txt
Hello Alter Ego!
```

<!--TODO: Add screenshot of speaking output.-->

### Yelling

<!--TODO: Add section about heading text formatting (does not need to be all caps)-->

Aren't there times where you're angry, or frightened, or just want to LET IT ALL OUT?! That's when you yell so loudly
that everyone in the house can hear you right? Good news is that you can do that too in Alter Ego. Bad news is that
it's just as embarrassing for everyone involved.

> [!IMPORTANT]
> Your entire message must be in ALL CAPS for *yelling* to work. So `HELLO EVERYONE!` will count as *yelling*, but
> `HELLO everyone!` won't.

To **yell** in Alter Ego, type your message in `ALL CAPS` and send it! *Yelling* in Alter Ego works in just about the
same way as real life; characters that are in adjacent rooms can hear you yell.

Let's try it out together. We will *yell* loudly and see if others notice.

```txt
HI EVERYONE! I'M YELLING REALLY LOUDLY!!!
```

<!--TODO: Add screenshot of yelling from another character's perspective in another room-->

### Speaking Out-of-Character

There are times when we must speak **out-of-character (OOC)**. For instance, when we want to tell others that we're
stepping away from the keyboard, or if we want to comment on something funny.

> [!IMPORTANT]
> Any message that starts with a `(` is considered to be OOC. So don't include any dialog in them!

To speak OOC in Alter Ego, we start our message with a right parentheses `(`. This tells Alter Ego that our message is
OOC and that it shouldn't be shown in [spectate channels](../reference/data_structures/player.md#spectate-channel).[^1]
Think of these messages as being off-the-record, as people spectating you won't see them.

Let's try this out by saying that we're going to the restroom.

```txt
(brb girls bio break
```

There, now everyone won't think we just disappeared into thin air.

## Sharing Secrets

While it's all well and good to talk to everyone in the room (or everyone in adjacent rooms if we're yelling), there
are times where subtlety is warranted. This is where *whispering* comes in handy.

### The *Whisper* Command

If you wish to talk to other players in secret, you can [***whisper***](../reference/data_structures/whisper.md)
to them. This is done through the use of the [*whisper* command](../reference/commands/player_commands.html#whisper).
To *whisper* to one or more players, send `.whisper [player] [player2]...` while you are in the same room as the other player(s).

Let's say we want to *whisper* to our friend Huiyu.

```txt
.whisper huiyu
```

<!--TODO: Screenshot of whisper channel sidebar-->

This opens a **whisper channel** between us and Huiyu where we can share secrets!

Now let's try and say something to Huiyu in the whisper channel. Hmm... how about telling her about our secret plan to
achieve world domination through the use of bunnies?

```txt
Pssst. Huiyu! I'm going to take over the world with buns!
```

<!--TODO: Show screenshot of whisper channel composited with regular channel.-->

Others in the room can see that we are whispering, but can't actually hear what we're saying.

### Group Whispers

> [!NOTE]
> You can't add someone to a whisper channel that already exists, but if a person leaves the room or becomes otherwise
> incapacitated, they will be removed from the whisper channel.

Let's try starting a *whisper* circle with more people. I think our friends Kyra and Aisha would like to join our secret
plan as well so let's bring them into the fold.

We're going to start a new whisper channel with all three of them.

```txt
.whisper huiyu kyra aisha
```

<!--TODO: Screenshot of new group whisper channel-->


## Making Gestures

## Narrating Your Actions

## Monologing

[^1]: Don't worry about knowing what spectate channels are yet, we'll be going into them later.
