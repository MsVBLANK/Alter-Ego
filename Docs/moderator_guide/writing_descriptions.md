# Writing Descriptions

Writing for the Neo World Program is somewhat complex, but thanks to Alter Ego's
custom [parser module](https://github.com/MolSnoo/Alter-Ego/blob/8432696144b167993d299b8ddec5958e10fc649d/Modules/parser.js),
it is incredibly flexible. Alter Ego makes use of [XML](https://en.wikipedia.org/wiki/XML) formatting to understand what
the [moderator](moderating.md) has written so that it can make changes as necessary.

## Basic concepts of XML

XML, short for eXtensible Markup Language, was designed to store and transport data, and to be relatively simple to
understand. In XML, data is wrapped in **tags**, like so: `<tag>data</tag>`.

In XML, you can nest tags. For example, you can write:

```xml
<tag>
  <text>
    data
  </text>
</tag>
```

Note that when nesting tags, you must close them in the same order you opened them. Therefore, you cannot write
something like this:

```xml
<tag>
  <text>
  data
</tag>
    </text>
```

Additionally, you can add **attributes** to tags to give them more information. In order to assign an attribute, use the
following format: `<tag attribute="something">data</tag>`.

XML is similar to [HTML](https://en.wikipedia.org/wiki/HTML). However, the primary difference between the two is that
unlike HTML, XML doesn't _do_ anything. XML is used to carry data, but unless a program was designed to interpret that
specific data, the XML won't do anything. HTML, on the other hand, is used to modify how data looks. Additionally, XML
tags are not predefined like HTML tags are. For example, entering `<b>text</b>` in an HTML document will display **text
** in a bold font. Entering that in an XML document, however, will have no effect because XML tags have no inherent
meaning.

## `<desc>`

Example: 

```xml
<desc>This is the simplest description you can write.</desc>
```

The `desc` tag is used to mark the beginning and ending of a description. It _must_ be included in every single
description.

---

## `<s>`

Example:

```xml
<desc><s>After leaving the PARK, you come to a crossroads.</s> <s>To your left is PATH 2.</s> <s>Straight ahead is PATH 3.</s> <s>To your right is PATH 4.</s> <s>It seems all of these roads lead you to the north side of the island.</s></desc>
```

The `s` tag, short for **sentence**, is used to mark the beginning and ending of a sentence. The closing tag should
always go after the final punctuation mark of the sentence. There should generally be a space between the closing tag of
one sentence and the opening tag of another sentence. It isn't _technically_ required that every sentence be in its own
`s` tag. For the most part, unless a single sentence contains other tags, such as [item lists](#il), the `s` tag can go
around multiple sentences. For example, this would be perfectly acceptable:

```xml
<desc><s>You inspect the couches. They are soft and comfortable, and each is lined with a few pillows.</s> <s>Looking underneath the cushions, you find <il></il>.</s></desc>
```

---

## `<br>`

Example:

```xml
<desc><s>You flip through the diary.</s> <s>Most of the pages are blacked out.</s> <s>A few things remain:</s><br /><s>-"my wife's birthday is on the 4th Monday of the month this year,"</s><br /><s>-"anniversary dinner went great, but my wife's birthday is in just 3 days and I don't know what to get her!"</s></desc>
```

The `br` tag, short for **break**, is used to divide text into multiple lines. In general, you should _never_ split the
contents of a cell on the spreadsheet into multiple lines. Instead, use the `br` tag. Note that the `br` tag cannot
surround text, so it must be closed in the same tag that it is opened with, like so: `<br />`. If a Player inspects the
example description above, it will be divided into multiple lines, like this:

```
You flip through the diary. Most of the pages are blacked out. A few things remain:
-"my wife's birthday is on the 4th Monday of the month this year,"
-"anniversary dinner went great, but my wife's birthday is in just 3 days and I don't know what to get her!"
```

---

## `<il>`

Example:

```xml
<desc><s>The floor beneath you is soft and earthy.</s> <s>You find <il></il> haphazardly placed on it.</s></desc>
```

The `il` tag, short for **item list**, is used to mark where items will be inserted into a description. Items are 
inserted between the opening and closing `il` tags whenever a description is sent to a player. They are generated 
on-demand by fetching the list of items that are currently contained in the game entity that the description belongs to.

If an item list is empty, the entire sentence containing the item list will be removed from the parsed description. 
So, in the example above, if the item list is determined to be empty, the player will be sent: 
`The floor beneath you is soft and earthy.`

If you want to prevent an item list sentence from being removed from the parsed description when the container it 
belongs to contains no items, you can enter text between the opening and closing `il` tags, like so:

```xml
<desc><s>It's a long, white countertop.</s> <s>It's broken up only by a SINK in the middle.</s> <s>On it, you find <il>a BLENDER and a MIXER</il>.</s></desc>
```

Pay close attention to the above example, and ensure that sentence-ending punctuation is never placed inside of `il` tags.

`il` tags are capable of having attributes. There is one attribute with defined behavior, the `name` attribute. This
allows you to insert multiple item lists into a description, giving each a name. This looks like:

```xml
<desc><s>It's a plain pair of black jeans.</s> <s>It has four pockets in total.</s> <s>In the right pocket, you find <il name="RIGHT POCKET"></il>.</s> <s>In the left pocket, you find <il name="LEFT POCKET"></il>.</s> <s>In the right back pocket, you find <il name="RIGHT BACK POCKET"></il>.</s> <s>In the left back pocket, you find <il name="LEFT BACK POCKET"></il>.</s></desc>
```

Note that only [Prefabs](../reference/data_structures/prefab.md), 
[Room Items](../reference/data_structures/room_item.md),
[Inventory Items](../reference/data_structures/inventory_item.md), 
and [Players](../reference/data_structures/player.md) support multiple `il` tags in a single description.

`il` tags can only be used in a certain number of places, and each one has its own limitations. They can be used
in:

- A [Fixture](../reference/data_structures/fixture.md)'s description. A single Fixture can only have one item list 
  in its description.
- A [Prefab](../reference/data_structures/prefab.md)'s description. A single Prefab can have multiple item lists;
  however, there must be one for each [Inventory Slot](../reference/data_structures/inventory_slot.md), with names to
  match each slot's ID. Item lists in a Prefab's description will never have items inserted into them, since players 
  cannot directly inspect Prefabs. They simply serve as a base for instances of that Prefab.
- A [Room Item](../reference/data_structures/room_item.md)
  or [Inventory Item](../reference/data_structures/inventory_item.md)'s description. The same rules that Prefabs have
  apply, however these item lists can actually display items.
- A [Puzzle](../reference/data_structures/puzzle.md)'s Already Solved Description. A single Puzzle can only have one 
  item list in its Already Solved Description.
- A [Player](../reference/data_structures/player.md)'s description. A single Player can only have two item lists in
  their description, and they must be named `equipment` and `hands`. Any other item lists will never be updated.

Lastly, every item list must be in its own sentence. That is, a single `s` tag can only have one `il` tag within it.

---

## `<item>`

Example:

```xml
<desc><s>You open the locker.</s> <s>Inside, you find <il><item>a SWIMSUIT</item></il>.</s></desc>
```

The `item` tag is used to mark the beginning and ending of items. In previous versions of Alter Ego, it was necessary 
to include these when writing item lists in descriptions. However, **as of version 2.0, you should not enter these 
manually**.

`item` tags are generated on-demand whenever a description containing an item list is parsed and sent to a player.
They do not persist within the description after that. Additionally, if `item` tags are found to already be in a 
description when it is created, Alter Ego will attempt to remove them in a grammatically correct manner. However, 
it may not be able to do so completely perfectly. Therefore, if you already have `item` tags in your descriptions, 
you should remove them manually.

When an item list is generated for a given `il` tag, the parser module retrieves all items currently contained inside 
the game entity the item list corresponds with, and collates them so that any item with the same 
[Prefab ID](../reference/data_structures/prefab.md#id) and 
[containing](../reference/data_structures/room_item.md#single-containing-phrase)
[phrases](../reference/data_structures/inventory_item.md#single-containing-phrase) are considered the same item. Then, 
for each item in the list, it creates an `item` tag, whose contents are as follows:

- The item's plural containing phrase, if it has an infinite quantity and isn't already mentioned in the sentence,
- The item's quantity and plural containing phrase if it has a quantity greater than 1, or
- The item's single containing phrase, if it has a quantity of 1.

`item` tags are inserted into the description in the order they appear in on the sheet. They are inserted so as to 
follow several grammatical rules:

- If there are two items, they will be separated by the word "and", like so:
    - `<il><item>ITEM 1</item> and <item>ITEM 2</item></il>`
- If there are three or more items, the `item` tags will be comma-separated, and an Oxford comma will be inserted
  before the word "and" preceding the last `item` tag, like so:
    - `<il><item>ITEM 1</item>, <item>ITEM 2</item>, and <item>ITEM 3</item></il>`
- If the word "is" or the word "are" is the last word in the clause just before an item list or the first word in the 
  clause just after an item list, it will be changed to the other word in order to properly reflect the plurality of 
  the referenced items. For example, if a sentence like `<s>There is <il></il> on the desk.</s>` contains an item with 
  a quantity greater than 1, or multiple items, it will be changed like so:
    - `<s>There are <il><item>2 PENCILS</item></il> on the desk.</s>`, or 
    - `<s>There are <il><item>a PENCIL</item> and <item>an ERASER</item></il> on the desk.</s>`
- If an item list contains non-items, they will be updated according to the same rules that `item` tags follow. For 
  example, in the sentence `<s>The shelves are lined with <il>different ingredients for baking and dough mixes</il>.</s>`,
  if the description's container contains an item, an Oxford comma will be inserted before the final "and", like so:
    - `<s>The shelves are lined with <il><item>2 bags of RICE</item>, different ingredients for baking, and dough mixes</il>.</s>`

It is worth noting that `item` tags will always be inserted at the beginning of an item list, never at the end.

---

## `<if>`

> [!CAUTION]
> This tag has the ability to run code. In order to determine if the condition in the `cond` attribute is
> true, Alter Ego uses its scriptParser module, which evaluates code in a heavily restricted context. While
> it has been tested to prevent access to many functions which can cause severe damage, its security cannot
> be guaranteed, especially if Alter Ego is run outside of a Docker container. Given that the only way to
> insert code is to write it on the spreadsheet, write access should be given to as few people as possible.
> There may exist exploits that allow malicious users to do such things as:
>
> - Sending Alter Ego's authentication token to the server
> - Killing a player in the game
> - Shutting down Alter Ego
> - Read, modify, and delete files on your computer
>
> We, the Alter Ego developers, assume no responsibility for damage caused by malicious use of this feature.
> You have been warned.

Example:

```xml
<desc><s>It's a small, glossy red berry.</s> <s>It looks ripe.</s> <if cond="player.name === 'Nestor' || player.name === 'Jun'"><s>It's a holly berry.</s> <s>It can cause vomiting and diarrhea.</s> <s>It's best not to eat this.</s></if></desc>
```

The `if` tag is used to modify the contents of a description before it is sent to a player. If the condition in the
`cond` (condition) attribute is true, then the contents of the `if` tag will be kept in the description. If it is false,
the contents will be removed. In the above example, there are two outcomes:

- If the Player inspecting this Room Item has the name "Nestor" or "Jun", the condition is true, and they will be sent
  `It's a small, glossy red berry. It looks ripe. It's a holly berry. It can cause vomiting and diarrhea. It's best not to eat this.`
- If the Player inspecting this Room Item doesn't have the name "Nestor" or "Jun", the condition is false, and they
  will be sent `It's a small, glossy red berry. It looks ripe.`

You can chain multiple `if` tags together for different outcomes. For example, in this Fixture description:

```xml
<desc><s>The window covers most of the wall, filling the room with <if cond="findEvent('NIGHT').ongoing === true">moonlight</if><if cond="findEvent('NIGHT').ongoing === false">sunlight</if>.</s></desc>
```

- If the `NIGHT` Event is ongoing, the Player inspecting this Fixture will be sent:
  `The window covers most of the wall, filling the room with moonlight.`
- If the `NIGHT` Event is _not_ ongoing, the Player inspecting this Fixture will be sent:
  `The window covers most of the wall, filling the room with sunlight.`

Since there is no `else` tag, if you want to chain `if` tags together to display different text for different outcomes,
you must ensure that the conditions described in the `cond` attribute are mutually exclusive, and cannot overlap. If
you wanted to expand the example above to have text for when it's inspected by a Player whose name isn't Jun or Nestor,
you would express the condition as:

```xml
<desc><s>It's a small, glossy red berry.</s> <s>It looks ripe.</s> <if cond="player.name === 'Nestor' || player.name === 'Jun'"><s>It's a holly berry.</s> <s>It can cause vomiting and diarrhea.</s> <s>It's best not to eat this.</s></if><if cond="player.name !== 'Nestor' && player.name !== 'Jun'"><s>You're not sure what this is.</s> <s>Would it really be so bad to eat just one?</s></if></desc>
```

Knowledge of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) and
[Boolean algebra](https://en.wikipedia.org/wiki/Boolean_algebra) will help significantly in writing good `if` conditions.

There are several loosely-defined categories of `if` conditions that are used frequently when writing descriptions:

### Player conditionals

The function which parses descriptions (and thus, `if` tags) has access to the Player inspecting it. As a result, you
can easily write descriptions that change based on a number of the Player's attributes. Here are a few examples:

- Based on the Player's name:
  ```xml
  <if cond="player.name === 'Astrid'">Your name is Astrid.</if>
  ```
- Based on the Player's title:
  ```xml
  <if cond="player.title === 'Mortician'">You are a Mortician.</if>
  ```
- Based on the Player's [perception stat](../reference/data_structures/player.md#perception):
  ```xml
  <if cond="player.perception > 7">Something about a portion of the wall behind the curtain seems off. It's almost as if... you could push right past it and walk through.</if>
  ```
- Based on whether a Player has a given [Status Effect](../reference/data_structures/status.md):
  ```xml
  <if cond="player.hasStatus('hungry')">This food looks delicious.</if>
  ```
- Based on whether a Player has a given [behavior attribute](../reference/data_structures/status#behavior-attributes):
  ```xml
  <if cond="player.hasBehaviorAttribute('acute hearing')">It produces an extremely faint noise that you should be able to make out if you listen closely.</if>
  ```
- Based on whether a Player has an Inventory Item with a specific Prefab ID:
  ```xml
  <if cond="player.hasItem('MAGNIFYING GLASS') === true">You use your MAGNIFYING GLASS to read the text, which is as follows: "HBD KKZ RDD ZKK".</if>
  ```

### Container conditionals

The function which parses descriptions also has access to the entire _container_ of the description, which is accessible
with the `this` keyword. That is, if the description belongs to a [Room](../reference/data_structures/room.md), you can
write descriptions that change:

- Based on the number of Players in the room:
  ```xml
  <if cond="this.occupants.length > 6">It's a little cramped with so many people in a room this small.</if>
  ```
- Based on whether a given Exit is unlocked:
  ```xml
  <s>You step out of the TRUCK into a <if cond="this.getExit('BLAST DOOR').unlocked === false">dark cave, which is illuminated only by flashlight</if><if cond="this.getExit('BLAST DOOR').unlocked === true">dimly lit cave, with the only light coming from outside</if>.</s>
  ```

If the description belongs to an [Fixture](../reference/data_structures/fixture.md), you can write descriptions that
change:

- Based on whether the Fixture's child Puzzle has been solved:
  ```xml
  <desc><if cond="this.childPuzzle.solved === true"><s>You examine the poster.</s> <s>It looks like this: https://i.imgur.com/wtUujam.png</s></if><if cond="this.childPuzzle.solved === false"><s>It is too dark to see anything.</s></if></desc>
  ```
- Based on whether the Fixture is currently activated:
  ```xml
  <desc><s>It's a stovetop burner.</s> <s>It's gas-powered, which means you'll be cooking with actual fire.</s> <if cond="this.activated"><s>It's currently burning.</s></if> <s>On it, you find <il></il>.</s></desc>
  ```
- Based on whether the Fixture contains a Room Item with the given Prefab ID:
  ```xml
  <desc><s>It's a queen bed with perfectly white sheets<if cond="this.containsItem('COMFORTER') === true"> and a thick, black comforter tucked neatly under the mattress</if>.</s> <s>On it, you find <il></il>.</s></desc>
  ```

If the description belongs to a [Room Item](../reference/data_structures/room_item.md) or 
[Inventory Item](../reference/data_structures/inventory_item.md), you can write descriptions that change:

- Based on the number of uses the Item has left:
  ```xml
  <desc><s>This is a fresh cucumber.</s> <if cond="this.uses < 2"><s>Only half of it remains.</s></if></desc>
  ```
- Based on whether the Item contains no Items inside of it:
  ```xml
  <desc><s>It's a blue box of medical masks.</s> <s>In it are <il></il>.</s> <if cond="this.containsNoItems() === true"><s>Or at least it's supposed to be, but it's empty.</s></if></desc>
  ```
- Based on whether the Item has a container with a given name:
  ```xml
  <desc><s>This is a pot made of white clay.</s> <s>It was made on a pottery wheel.</s> <s>The craftsmanship is fairly decent. It has a flat, sturdy bottom that sits perfectly level. The sides are mostly even, but it has a bit of a rough texture, with a few small divots and bumps here and there.</s> <s>It's unglazed, and it still needs to be fired in a kiln.</s> <if cond="this.container && this.container.name === 'POTTERY BAT'"><s>Be sure to take it off of the POTTERY BAT before putting it in the kiln!</s></if></desc>
  ```

Note that the examples given above are not the only things you can do with the description's container; they are simply
the most helpful and commonly used.

### Finder conditionals

The function which parses descriptions also has access to the 
[finder module](https://github.com/MolSnoo/Alter-Ego/blob/master/Modules/finder.js), which allows you to find almost 
any game entity. The finder module includes the following functions (parameters listed in parentheses are optional):

- `findRoom('room-id')`
- `findFixture('FIXTURE NAME', ('location-name'))`
- `findPrefab('PREFAB ID')`
- `findRoomItem('ITEM IDENTIFIER OR PREFAB ID', ('location-name'), (Type of Container: 'Fixture' || 'Puzzle' || 'RoomItem'), ('CONTAINER NAME(/INVENTORY SLOT ID)'))`
- `findPuzzle('PUZZLE NAME', ('location-name'))`
- `findEvent('EVENT ID')`
- `findStatusEffect('status effect ID')`
- `findPlayer('Player name')`
- `findLivingPlayer('Player name')`
- `findDeadPlayer('Player name')`
- `findInventoryItem('ITEM IDENTIFIER OR PREFAB ID', ('Player name'), ('CONTAINER NAME(/INVENTORY SLOT ID)'), ('EQUIPMENT SLOT ID'))`

Here are just a few examples of ways to use the finder module in `if` tags:

- Indicate if a Puzzle is solved or not:

  ```xml
  <desc><s>This is a table for praying.</s> <s>On it there are two CANDLES.</s> <if cond="findPuzzle('CANDLES').solved === true"><s>They are currently lit.</s></if><if cond="findPuzzle('CANDLES').solved === false"><s>If you lit them, maybe you'd be able to pray for something.</s></if></desc>
  ```
- Indicate if a Puzzle is solved or not when there are several Puzzles with the desired name in different Rooms:
  ```xml
  <desc><s>You step onto the bridge from the BOTANICAL GARDEN.</s> <if cond="findPuzzle('LOCK', 'bridge').solved === true"><s>A mysterious CAVE is behind where the waterfall used to be.</s></if><if cond="findPuzzle('LOCK', 'bridge').solved === false"><s>A WATERFALL roars right next to the bridge as you enter, spraying you with a cool mist.</s></if> <s>The bridge arches up slightly over a beautiful lake, and in the middle of the bridge is a GAZEBO.</s> <s>The other end leads to a GREENHOUSE.</s></desc>
  ```
- Indicate which Puzzle of a pair is currently solved:
  ```xml
  <desc><s>The terminal appears to control the heat sensor for the freezer.</s> <s>It has two buttons: the OFF BUTTON and the ON BUTTON.</s> <if cond="findPuzzle('OFF BUTTON').solved === true"><s>The sensor is already off.</s></if><if cond="findPuzzle('ON BUTTON').solved === true"><s>The sensor is currently on.</s></if></desc>
  ```
- Indicate if there are Players in a given Room:
  ```xml
  <desc><s>You look through the peephole.</s> <if cond="findRoom('hall-1').occupants.length > 0"><s>There's someone in the hall outside.</s></if><if cond="findRoom('hall-1').occupants.length === 0"><s>You don't see anyone in the hall.</s></if></desc>
  ```
- Add additional details to a description based on the presence of an Item:
  ```xml
  <desc><s>You step through the DOUBLE DOORS into a spacious warehouse.</s> <s>The CEILING in this room is rather high, and a CAMERA is hung from it.</s> <s>Many SHELVES line the room, forming aisles in the space between them.</s> <s>There are also several CRATES <if cond="findRoomItem('OIL DRUM', 'warehouse', 'Fixture', 'FLOOR') !== undefined">and an OIL DRUM </if>lined up against the wall near the doors you just came from.</s> <s>To your right is a door to the CONFERENCE ROOM.</s> <s>In the back right corner is the door to the OFFICE.</s> <s>The conference room and the office create a fairly wide hallway leading to the SIDE DOOR.</s> <s>Above the doors you just came from is a MONITOR on the wall.</s></desc>
  ```
- Indicate if another Fixture is activated or not:
  ```xml
  <desc><s>It’s a life-sized iron bull made out of metal, with a chamber so you can climb inside.</s> <var v="this.childPuzzle.alreadySolvedDescription.parseFor(player)" /> <s>Underneath it is <if cond="findFixture('BUTTON', 'torture-chamber').activated === false">what looks like a pit for a campfire</if><if cond="findFixture('BUTTON', 'torture-chamber').activated === true">a roaring fire</if>.</s> <s>There is a BUTTON on its nose.</s> <s>Do you dare push it?</s></desc>
  ```
- Indicate whether an Event is ongoing or not:
  ```xml
  <desc><s>It's a high-powered ceiling fan.</s> <if cond="findEvent('FAN OFF').ongoing === false"><s>It's humming away, circulating air through the vault and helping the dehumidifying system suck up any excess moisture.</s></if><if cond="findEvent('FAN OFF').ongoing === true"><s>It isn't on right now.</s></if></desc>
  ```

---

## `<var>`

> [!CAUTION]
> This tag has the ability to run code. In order to display the output of the script in the `v` attribute, 
> Alter Ego uses its scriptParser module, which evaluates code in a heavily restricted context. While
> it has been tested to prevent access to many functions which can cause severe damage, its security cannot
> be guaranteed, especially if Alter Ego is run outside of a Docker container. Given that the only way to
> insert code is to write it on the spreadsheet, write access should be given to as few people as possible.
> There may exist exploits that allow malicious users to do such things as:
>
> - Sending Alter Ego's authentication token to the server
> - Killing a player in the game
> - Shutting down Alter Ego
> - Read, modify, and delete files on your computer
>
> We, the Alter Ego developers, assume no responsibility for damage caused by malicious use of this feature.
> You have been warned.

Example:

```xml
<desc><if cond="this.childPuzzle.solved === true"><s>The locker can be locked with a combination LOCK, but it's currently unlocked.</s> <var v="this.childPuzzle.alreadySolvedDescription.parseFor(player)" /></if><if cond="this.childPuzzle.solved === false"><s>The locker is locked with a combination LOCK.</s> <s>It seems someone scribbled on the front with marker: xyz.</s> <s>What's that supposed to mean?</s></if></desc>
```

The `var` tag is used to insert data from the game into the text of a description. The data in question is accessed
with a script written in the `v` (variable) attribute. In the above example, the
[`parseFor`](../reference/data_structures/description.md#parseFor) function of
`this.childPuzzle.alreadySolvedDescription` is called using the Player currently inspecting this Fixture. The
Already Solved Description of this Fixture's child Puzzle is:

```xml
<desc><s>You open the locker.</s> <s>Inside, you find <il></il>.</s></desc>
```

Thus, if the child Puzzle is solved, it will be parsed, and the output will be inserted in place of the `var` tag.
So, the Player will be sent:

```
The locker can be locked with a combination LOCK, but it's currently unlocked. You open the locker. Inside, you find a FIRST AID KIT, a bottle of PAINKILLERS, a PILL BOTTLE, and an OLD KEY.
```

Note that the `var` tag cannot surround text, so it must be closed in the same tag that it is opened with, like so:
`<var v="some variable" />`.

The `var` tag is incredibly useful due to its flexibility for writing dynamic descriptions. Here are just a few common
uses for it:

### Indicating Puzzle status

One of the `var` tag's most common uses is changing the description of a Fixture or something else based on the solved
status of a Puzzle. Here are a few examples:

- Indicating what items are inside the Fixture's child Puzzle:
  ```xml
  <desc><s>You examine the table.</s> <s>Looking closely, you can see that it's not a table at all, but a chest!</s> <if cond="this.childPuzzle.solved === true"><s>It looks like it requires an old key to open, but it seems to be unlocked.</s> <var v="this.childPuzzle.alreadySolvedDescription.parseFor(player)" /></if><if cond="this.childPuzzle.solved === false"><s>It looks like it requires an old key to open.</s></if></desc>
  ```
    - `this.childPuzzle.alreadySolvedDescription`:
      ```xml
      <desc><s>You open the chest.</s> <s>Inside, you find <il></il>.</s></desc>
      ```
    - Parsed description if `this.childPuzzle.solved === true`:
      ```
      You examine the table. Looking closely, you can see that it's not a table at all, but a chest! It looks like it requires an old key to open, but it seems to be unlocked. You open the chest. Inside, you find a bottle of PEPSI, a ROPE, and a KNIFE.
      ```
    - Parsed description if `this.childPuzzle.solved === false`:
      ```
      You examine the table. Looking closely, you can see that it's not a table at all, but a chest! It looks like it requires an old key to open.
      ```
- Replace the entire description with `childPuzzle.alreadySolvedDescription`:
  ```xml
  <desc><if cond="this.childPuzzle.solved === true"><var v="this.childPuzzle.alreadySolvedDescription.parseFor(player)" /></if><if cond="this.childPuzzle.solved === false"><s>The computer is asking for a password.</s></if></desc>
  ```
    - `this.childPuzzle.alreadySolvedDescription`:
      ```xml
      <desc><s>The computer is logged in.</s> <s>There's no Internet connection, but it seems whoever was using this computer left a saved EMAIL open.</s> <if cond="findPuzzle('DETONATOR').solved === false"><s>There's also a program called DETONATOR open.</s></if></desc>
      ```
    - Parsed description if `this.childPuzzle.solved === true`:
      ```
      The computer is logged in. There's no Internet connection, but it seems whoever was using this computer left a saved EMAIL open. There's also a program called DETONATOR open.
      ```
    - Parsed description if `this.childPuzzle.solved === false`:
      ```
      The computer is asking for a password.
      ```
- Indicate which outcome a Puzzle was solved with:
  ```xml
  <desc><s>It's a TV input switcher that seems to be primarily for very old consoles, as all of the inputs are old formats such as coaxial and composite.</s> <s>There are eight inputs, all on the back.</s> <s>The output comes out from the side, and you can set which system to output by pressing one of the numbered buttons on the front.</s> <s>It's currently set to button <var v="this.childPuzzle.outcome" />.</s></desc>
  ```
    - Output if `this.childPuzzle.outcome` is `3`:
      ```
      It's a TV input switcher that seems to be primarily for very old consoles, as all of the inputs are old formats such as coaxial and composite. There are eight inputs, all on the back. The output comes out from the side, and you can set which system to output by pressing one of the numbered buttons on the front. It's currently set to button 3.
      ```
- Indicate how many remaining attempts a Puzzle has:
  ```xml
  <desc><s>You enter a password, but the computer tells you that it's incorrect.</s> <s>You have <var v="this.remainingAttempts" /> attempt<if cond="this.remainingAttempts !== 1">s</if> left.</s></desc>
  ```

### Indicate Item uses

Another very useful feature of the `var` tag is indicating how many uses a particular Item has left. Here are a few
examples:

```xml
<desc><if cond="this.uses === 6"><s>It's a whole watermelon.</s> <s>It feels perfectly ripe.</s></if><if cond="this.uses > 1 && this.uses < 6"><s>It's a partially sliced watermelon.</s> <s>You could get about <var v="this.uses" /> more slices out of it.</s></if><if cond="this.uses === 1"><s>It's a single slice of watermelon.</s> <s>You should eat it before it goes bad.</s></if></desc>
```
- Parsed description if this Item has 6 uses left:
  ```
  It's a whole watermelon. It feels perfectly ripe.
  ```
- Parsed description if this Item has (for example) 4 uses left:
  ```
  It's a partially sliced watermelon. You could get about 4 more slices out of it.
  ```
- Parsed description if this Item has 1 use left:
  ```
  It's a single slice of watermelon. You should eat it before it goes bad.
  ```

```xml
<desc><s>It's a family-sized box of salted crackers.</s> <s>The box says it contains 6 packs.</s> <s>Looking inside, you find <var v="this.uses / 2.0" /> pack<if cond="this.uses / 2.0 !== 1.0">s</if>.</s></desc>
```
- Parsed description if this Item has (for example) 8 uses left:
  ```
  It's a family-sized box of salted crackers. The box says it contains 6 packs. Looking inside, you find 4 packs.
  ```
- Parsed description if this Item has (for example) 2 uses left:
  ```
  It's a family-sized box of salted crackers. The box says it contains 6 packs. Looking inside, you find 1 pack.
  ```
- Parsed description if this Item has (for example) 1 use left:
  ```
  It's a family-sized box of salted crackers. The box says it contains 6 packs. Looking inside, you find 0.5 packs.
  ```

### Other uses

Because the `var` tag is able to access all of the game's data, it has many more uses. Here are just a few:

- Indicate which players are in another Room:
  ```xml
  <desc><s>You look through the window into the pool room below.</s> <s>On the right side of the room you see an Olympic-size swimming pool and on the left is a larger recreational pool, surrounded by a number of beach chairs.</s> <if cond="findRoom('rec-pool').occupantsString !== ''"><s>You think you see <var v="findRoom('rec-pool').occupantsString" /> down there.</s></if></desc>
  ```
- Show the inspecting Player's description:
  ```xml
  <desc><s>You look in the mirror.</s> <s>It shows you your reflection.</s> <var v="player.description.parseFor(player)" /></desc>
  ```
- Indicate how many seconds remain in a Fixture's current process:
  ```xml
  <desc><s>It's the patented Empire Electronics Smart Cooker!</s> <s>It's capable of cooking almost anything in one minute.</s> <s>It looks kind of like a microwave, as a red box with a door that opens from the side.</s> <s>How exactly it cooks is a closely guarded trade secret, but it's truly an amazing piece of technology.</s> <if cond="this.activated === true"><s>It's currently powered on, with <var v="Math.floor(this.process.duration / 1000)"/> second<if cond="this.process.duration >= 2000">s</if> remaining.</s></if> <s>Inside, you find <il></il>.</s></desc>
  ```
- Display the current time:
  ```xml
  <desc><s>It's a brass gold pocket watch with a gold chain attached to the handle.</s> <s>The time is <var v="new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })" />.</s></desc>
  ```
- Display a randomly chosen string of text:
  ```xml
  <desc><s>Entering through GATE 1, you step into a lush and well-tended garden surrounded by a tall FENCE.</s> <s>It's rectangular in shape, and from where you enter, you can see GATE 2 on the wall to your left.</s> <s><var v="getRandomString(['', 'You see a butterfly gently flutter by. ', 'You hear the buzz of a bumblebee as it flies by. '])" /></s><s>A neat cobblestone path winds through the garden, which has plots for FRUITS, VEGETABLES, and HERBS, with FLOWERS spread liberally all around them.</s> <s>HANGING PLANTS are suspended from the ceiling by transparent wire, giving the eerie impression that they're floating.</s> <s>Just to your left, a thin HOSE hangs in loops from the side of the fence, stored neatly alongside other GARDENING EQUIPMENT.</s> <s>There's also a small wooden BENCH beside the path in an especially floral section of the garden.</s> <s>A small CAMERA stares down at you from the corner post, and there's a MONITOR on the north fence wall.</s></desc>
  ```
- Display a string of text with a probability of 1/20:
  ```xml
  <desc><s>You step up to the right viewing platform, which is quite short.</s> <s>Here, you can look down at the ground through the window.</s> <s>You aren't terribly high up, but you still have quite a nice view of the ocean.</s> <s>You can look through binoculars to see even further.</s> <s>There isn't much to see aside from more ocean.</s> <if cond="doWithChance(20) === true"><s>Wait, no!</s> <s>You see a few dolphins jumping out of the water in the distance!</s></if></desc>
  ```
- Display a hallucination with a probability that increases if the inspecting Player has the `exhausted` Status Effect:
  ```xml
  <desc><s>You examine the rope.</s> <s>It looks fairly strong, and it's very long.</s> <s>You could use it for so many things.</s> <if cond="player.hasStatus('delirious') || doWithChanceModifiedByPlayerStatus(500, player, 'exhausted', 50) === true"><s>It feels like a giant worm in your hands.</s> <s>...Because it has transformed into a giant worm.</s></if></desc>
  ```
  - If the Player has the `delirious` Status, the hallucination will appear 100% of the time.
  - If the Player has the `exhausted` Status, the base probability (`500`) will be divided by the divisor (`50`) for an effective probability of `1/10`.
  - Otherwise, the hallucination will randomly appear with the base probability of `1/500`.

---

## `<procedural>`

Example:

```xml
<desc><s>It's a trading card from the hugely popular card game, Capsulebeasts.</s> <s>This one features the ocean-type fan-favorite, Tortide.</s> <procedural chance="5"><s>This card has a holographic finish, making it extra rare!</s></procedural></desc>
```

The `procedural` tag allows Prefabs to be instantiated as Room Items and Inventory Items with procedurally-generated
descriptions. This can allow you to add some variation in instances of Prefabs without having to create entirely new
Prefabs or manually edit the descriptions of instances of those Prefabs. Keep in mind that `procedural` tags only affect
instantiated Prefabs aesthetically. They cannot affect an Item's functionality. For more information on what properties
`procedural` tags can affect, see the Prefab article's section on
[procedural options](../reference/data_structures/prefab.md#procedural-options).

Note that when a Prefab is instantiated as a Room Item or Inventory Item, the parser module evaluates all of the
`procedural` tags in the description and algorithmically decides which ones to keep. The description it generates
contains only the the `procedural` and `poss` tags that were selected. However, any attributes those tags had,
except for `name`, will be removed. All `procedural` and `poss` tags that weren't selected are completely removed,
along with the text that was inside them. All other tags remain unaffected.

### Procedural attributes

`procedural` tags can have attributes. There are three attributes with defined behavior:

#### Procedural attribute: `name`

`name` allows you to give each `procedural` tag its own identifier. This allows you to manually select procedurals
and the possibilities contained within them when using the
[instantiate](../reference/commands/moderator_commands.md#instantiate)
[command](../reference/commands/bot_commands.md#instantiate).

Giving `procedural` and `poss` tags `name` attributes also allow them to be retained and transferred whenever an
Item is transformed into another Item by any means.

#### Procedural attribute: `chance`

`chance` takes a percent chance for the contents of a given `procedural` tag to appear in instances of a Prefab. This
chance is independent of other `procedural` tags. If the `chance` attribute is omitted from the tag, or its value is not
a number between 0 and 100, it is assigned a `chance` of 100, meaning that it will always appear.

However, if a `procedural` tag is nested inside of another `procedural` tag, then it will not appear in the generated
description if the parent `procedural` tag failed to generate, even if its `chance` is 100.

For example, given the description:

```xml
<desc><s>Sentence.</s> <procedural chance="50" name="A1"><s>A1.</s> <procedural chance="100" name="A2"><s>A2.</s></procedural></procedural></desc>
```

Because `procedural` `A2` is contained inside `procedural` `A1`, which has a `chance` of 50, it will not appear if `A1`
did not generate. If `A1` did generate, then `A2` will always generate, since it has a `chance` of 100. In other words,
the parser module's generated output will be:

- **50%** of the time:
  ```xml
  <desc><s>Sentence.</s></desc>
  ```
- **50%** of the time:
  ```xml
  <desc><s>Sentence.</s> <procedural name="A1"><s>A1.</s> <procedural name="A2"><s>A2.</s></procedural></procedural></desc>
  ```

For another example, given the description:

```xml
<desc><s>Sentence.</s> <procedural name="A1" chance="50"><s>A1.</s> <procedural name="A2" chance="50"><s>A2.</s> <procedural name="A3" chance="50"><s>A3.</s></procedural></procedural></procedural></desc>
```

Because `procedural` `A3` is nested inside `procedural` `A2` — which is itself nested inside `procedural` `A1` — the
probability of `A3` generating will be dependent on `A2` generating, which is dependent on `A1` generating. In other
words, the parser module's generated output will be:

- **50%** of the time: 
  ```xml
  <desc><s>Sentence.</s></desc>
  ```
- **25%** of the time: 
  ```xml
  <desc><s>Sentence.</s> <procedural name="A1"><s>A1.</s></procedural></procedural></desc>
  ```
- **12.5%** of the time: 
  ```xml
  <desc><s>Sentence.</s> <procedural name="A1"><s>A1.</s> <procedural name="A2"><s>A2.</s></procedural></procedural></desc>
  ```
- **12.5%** of the time: 
  ```xml
  <desc><s>Sentence.</s> <procedural name="A1"><s>A1.</s> <procedural name="A2"><s>A2.</s> <procedural name="A3"><s>A3.</s></procedural></procedural></procedural></desc>
  ```

#### Procedural attribute: `stat`

`stat` takes the name of one of the Player's five [stats](../reference/data_structures/player.md#stats): `strength`,
`perception`, `dexterity`, `speed`, `stamina`, or their abbreviations: `str`, `per`, `dex`, `spd`, `sta`. If a Player
is supplied when the output is generated, then the chosen stat will affect the chances of all of the `poss` tags
contained within this `procedural` tag.
- When instantiating a Prefab as an Inventory Item, the Player will always be the
Player who the Inventory Item belongs to.
- When instantiating a Prefab as a Room Item, the Player will be the one who activated the Fixture processing the 
Recipe in which the Prefab is a product, as long as they're still alive and in the same Room as the Fixture. 
Otherwise, it is only possible to supply a Player in the bot version of the instantiate command;
this is the Player who caused the command to be executed.

When a Player's stat is provided, a percent modifier, \\(M\\), is calculated for each `poss` tag within the
`procedural`. The formula for \\(M\\) is as follows:

\\[ M = (f + \frac{c - f}{p - 1}) * i * 10\\]

In this formula there are several variables:

- \\(c\\) is the maximum modifier value, where \\(c = x - 5\\), with \\(x\\) being the stat value.
- \\(f\\) is the minimum modifier value, where \\(f = -1 \* c\\).
- \\(p\\) is the number of `poss` tags inside this `procedural`.
- \\(i\\) is the numbered position of the `poss` tag that \\(M\\) is being calculated for. The first `poss` tag in the
  list has an \\(i\\) value of \\(0\\).

After `M` is calculated for a `poss` tag, it is added to that tag's `chance`, before moving onto the next `poss` tag.

In effect, this means that a higher stat value is more likely to result in `poss` tags near the end of the list being
generated, while a lower stat value is more likely to result in `poss` tags near the beginning of the list being
generated. A Player with a stat value of 10 may have a percent modifier of -50% for the first listed `poss` tag and +50%
for the final listed `poss` tag. Meanwhile, a Player with a stat value of 1 may have a percent modifier of +40% for the
first listed `poss` tag and a -40% for the final listed `poss` tag. This may very well make it impossible for some
`poss` tags in the `procedural` to generate at all, as it is unlikely that all of the `poss` chances will still be
between 0 and 100.

For example, given the description:

```xml
<desc><s>This is a red clay pot.</s> <procedural stat="dexterity"><poss chance="50"><s>Judging by the abysmal craftsmanship, it looks like it was made by a total rookie.</s></poss><poss chance="35"><s>It looks decently made, but there are some noticeable mistakes.</s></poss><poss chance="15"><s>It's very well made, with perfectly smooth edges.</s></poss></procedural></desc>
```

Suppose the provided Player's dexterity stat is 3. Using the formula listed above, the percent modifiers for each `poss`
tag would be +20%, ±0%, and -20%, respectively. On the other hand, if the provided Player's dexterity stat is 9, the
percent modifiers would instead be -40%, ±0%, and +40%, respectively. As a result, the parser module's generated output
would be:

- ```xml
  <desc><s>This is a red clay pot.</s> <procedural><poss><s>Judging by the abysmal craftsmanship, it looks like it was made by a total rookie.</s></poss></procedural></desc>
  ```
    - **70%** of the time if the Player's dexterity stat is 3.
    - **10%** of the time if the Player's dexterity stat is 9.
- ```xml
  <desc><s>This is a red clay pot.</s> <procedural><poss><s>It looks decently made, but there are some noticeable mistakes.</s></poss></procedural></desc>
  ```
    - **30%** of the time if the Player's dexterity stat is 3. This is because 70% + 35% exceeds 100%, so the extra 5%
      doesn't matter.
    - **35%** of the time if the Player's dexterity stat is 9.
- ```xml
  <desc><s>This is a red clay pot.</s> <procedural><poss><s>It's very well made, with perfectly smooth edges.</s></poss></procedural></desc>
  ```
  - **0%** of the time if the Player's dexterity stat is 3. The actual calculated probability is -5%, but because
      70% + 35% exceeds 100%, this makes no difference.
  - **55%** of the time if the Player's dexterity stat is 9.

Note that if the `stat` attribute is set, but there is no Player provided, or the Player's stat value is 5, the chances
of all of the `poss` tags contained within the `procedural` will not be changed.

---

## `<poss>`

Example:

```xml
<desc><s>It's a capsule from your favorite game, Capsulebeasts!</s> <s>This is a <procedural name="color"><poss name="red" chance="25">red</poss><poss name="blue" chance="25">blue</poss><poss name="green" chance="25">green</poss><poss name="black" chance="12.5">black</poss><poss name="white" chance="12.5">white</poss></procedural> <procedural name="species"><poss name="lavazard">Lavazard</poss><poss name="loamander">Loamander</poss><poss name="tortide">Tortide</poss></procedural>.</s> <s><procedural name="finish" chance="25"><poss name="glass" chance="50">This one has a glassy finish.</poss><poss name="metal" chance="50">This one has a metallic finish.</poss><poss name="standard" chance="0"></poss></procedural></s></desc>
```

The `poss` tag, short for **possibility**, is used to add pre-defined variations to the descriptions of Prefabs. It must
go inside a [procedural tag](#procedural). If it is placed outside of a `procedural` tag, it has no functionality. As
with the `procedural` tag, `poss` tags only affect instantiated Prefabs aesthetically. They cannot affect an Item's
functionality. For more information on what properties `poss` tags can affect, see the Prefab article's section on
[procedural options](../reference/data_structures/prefab.md#procedural-options).

When a Prefab is instantiated into a Room Item or Inventory Item, the parser module uses a random number generator to
pick one `poss` tag to keep in the final description. After one is selected, all of the others within the same
`procedural` tag are removed. The `poss` tag itself is retained, but all attributes it contains, with the exception
of `name` will be removed from the description.

### Poss attributes

`poss` tags can have attributes. There are two attributes with defined behavior:

#### Poss attribute: `name`

`name` allows you to give each `poss` tag its own identifier. This allows you to manually select procedurals and the
possibilities contained within them when using the
[instantiate](../reference/commands/moderator_commands.md#instantiate)
[command](../reference/commands/bot_commands.md#instantiate).

In order to make use of the `name` attribute in a `poss` tag, the `procedural` tag that contains it must also have a
`name`. When using the instantiate command, it is possible to provide
[procedural](../reference/data_structures/room_item.md#procedural-selections)
[selections](../reference/data_structures/inventory_item.md#procedural-selections) with the syntax
`(procedural name=poss name)`. For instance, in the above example, if you wanted to manually instantiate an Item with
the `standard` `finish`, which normally has no possibility of generating, your command would start with:
`.instantiate GACHA CAPSULE (finish=standard)`. This syntax is not case-sensitive, and extra spaces are ignored. The
effect of doing this would result in the final `s` tag consisting of
`<s><procedural name="finish"><poss name="standard"/></procedural></s>`, which would be removed when the description
is inspected by a player, because the `poss` that was selected contained no text, and as a result, the `procedural`
and thus `s` tag contained no text. The `poss` tags within the other `procedural` tags in the description would still
be randomly chosen.

It is possible to chain manual procedural selections together with a `+` character. For example, if your command began
with `.instantiate GACHA CAPSULE (color=black + species=tortide + finish=metal)`, then the generated Item would always
have the description:

```xml
<desc><s>It's a capsule from your favorite game, Capsulebeasts!</s> <s>This is a <procedural name="color"><poss name="black">black</poss></procedural> <procedural name="species"><poss name="tortide">Tortide</poss></procedural>.</s> <s><procedural name="finish"><poss name="metal">This one has a metallic finish.</poss></procedural></s></desc>
```

#### Poss attribute: `chance`

`chance` takes a percent chance for the contents of a given `poss` tag to be chosen in instances of a Prefab. This
chance is independent of the `chance` attribute of the `procedural` tag which contains it. The `chance` given for the
`procedural` tag determines how likely it is that _any_ of the `poss` tags contained inside it will be generated. That
is, even if the containing `procedural` tag has a `chance` under 100, all of the chances of the `poss` tags contained
inside it should ideally add up to 100 (and not the `chance` of the `procedural`, as one might assume).

When the parser module has to select a `poss` tag in a given `procedural` tag to keep, it first adds together the
chances assigned to each `poss` tag in the `procedural`. If a `poss` tag does not have a `chance` attribute, or its
value is not a number between 0 and 100, it is considered chanceless, and thus not included in this sum. If there are
any chanceless possibilities, the sum calculated earlier is subtracted from 100, and then divided by the number of
chanceless possibilities. This makes it so that all chanceless possibilities are equally likely to generate, and all of
the chances will add up to 100.

For example, given the description:

```xml
<desc><s><procedural><poss name="A1" chance="50">A1.</poss><poss name="A2">A2.</poss><poss name="A3">A3.</poss></procedural></s></desc>
```

Because `A1` has a chance of 50, and `A2` and `A3` are chanceless, the remainder that it would take for all of the
`poss` chances to add up to 100 — 50 — is divided by the number of chanceless possibilities — 2 — and assigned equally
to them. As a result, `A2` and `A3` have an effective `chance` of 25 each.

If _none_ of the `poss` tags in a `procedural` have assigned chances, then they will all be equally likely to be
selected. If the sum of all of the chances already adds up to 100 and there are also chanceless possibilities, then the
chanceless possibilities will never be selected.

After all of the possibilities have been assigned chances, if the `procedural` has a `stat` attribute and a Player's
stat has been provided, these chances will have [percent modifiers](#procedural-attribute-stat) applied to them.

Then, all of the possibilities are sorted from highest to lowest chance. A random number between 0 and 100 is generated,
and an accumulator value that starts at 0 is created. The possibilities are iterated through, with each one adding to
the accumulator value. If at any point during this iteration, the randomly-generated number is less than the
accumulator's current value, that possibility is selected. Finally, all other possibilities in the current `procedural`
are removed from the description.

### Default possibilities

Before reading this section, please read the section on
[Room Item](../reference/data_structures/room_item.md#procedural-selections)
[Inventory Item](../reference/data_structures/inventory_item.md#procedural-selections) procedural selections.

Because procedural selections are carried over when an Item is transformed, it can be useful to have procedurals and 
possibilities that never have a chance of generating when an Item is instantiated, and can only appear in instances
of that Item that were created by passing procedural selections down through repeated transformations
(for instance, in a chain of Recipes). In this case, it can be useful to create default `procedural` and `poss` tags.
Take this CLEAN TEAPOT Prefab, for example:

```xml
<desc><s>This is <procedural name="base color" chance="100"><poss name="default" chance="100">a plain, white</poss><poss name="obscured" chance="0"></poss><poss name="red" chance="0">a red</poss><poss name="white" chance="0">a white</poss></procedural><procedural name="glaze color" chance="0"><poss name="clear" chance="100"></poss><poss name="red">a red</poss><poss name="orange">an orange</poss><poss name="brown">a brown</poss><poss name="yellow">a yellow</poss><poss name="green">a green</poss><poss name="teal">a teal</poss><poss name="light blue">a light blue</poss><poss name="indigo">an indigo</poss><poss name="violet">a violet</poss><poss name="pink">a pink</poss><poss name="white">a white</poss><poss name="gray">a gray</poss><poss name="black">a black</poss></procedural> teapot.</s> <procedural name="quality"><s><poss name="default" chance="100"></poss><poss name="terrible" chance="0">It appears to have been handmade. It's of *terrible* quality. It's lumpy and misshapen, with a wildly uneven circumference. The handle is thin and flimsy, and feels like it might break off. The angle of the spout is too shallow, and the mouth is almost completely vertical. Also, the lid is shaped and sized all wrong, so it doesn't securely cover the top. Worse yet, the bottom is crooked, which makes it impossible for it to sit level on a flat surface. It should theoretically be safe to use, but you'd be sure to spill whatever you try to pour from this. </poss><poss name="poor" chance="0">It appears to have been handmade. It's of poor quality. The bottom is fairly sturdy, but it's not perfectly flat, preventing it from sitting level on a flat surface. The body of the pot is lumpy and oblong, giving it an uneven circumference. The lid kind of fits in the indentation on top, but it rocks back and forth, and the knob is difficult to grip. The spout is angled well, but the handle is a little small, making it somewhat difficult to hold. You should be able to pour tea out of this, but you'll have to be careful, or you'll make a mess. </poss><poss name="decent" chance="0">It appears to have been handmade. The craftsmanship is fairly decent. It has a sturdy bottom that sits perfectly level on a flat surface. The body is mostly symmetrical, but it has a few small divots and bumps here and there, giving it a slightly uneven circumference. The lid fits in the indentation on top quite well, but the knob is a little shallow, making it somewhat difficult to grip. The handle is firmly attached and has a good thickness, with just enough room for your fingers. The spout has a nice curve, and it's angled well, making it ideal for pouring. </poss><poss name="excellent" chance="0">It appears to have been handmade. The craftsmanship is *excellent*. It has a sturdy bottom that sits level on any surface. The body has perfect radial symmetry, and a very smooth texture. The lid fits securely in the indentation on top, and has a sturdy, round knob that's easy to grip. The handle is attached seamlessly to the body, and has good thickness and stability, with plenty of room for your fingers. The spout also attaches seamlessly, and has an elegant curvature with a mouth at just the right angle for pouring. </poss></s></procedural><s>It has a smooth, glassy finish<procedural name="pattern" chance="0">, and it's patterned with <procedural name="pattern quality" stat="per"><poss name="crude" chance="30">crude</poss><poss name="simple" chance="30">simple</poss><poss name="detailed" chance="30">detailed</poss><poss name="ornate" chance="10">ornate</poss></procedural> <procedural name="pattern color"><poss name="red">red</poss><poss name="orange">orange</poss><poss name="brown">brown</poss><poss name="yellow">yellow</poss><poss name="green">green</poss><poss name="teal">teal</poss><poss name="light blue">light blue</poss><poss name="indigo">indigo</poss><poss name="violet">violet</poss><poss name="pink">pink</poss><poss name="white">white</poss><poss name="gray">gray</poss><poss name="black">black</poss></procedural> <poss name="stripes">stripes</poss><poss name="lines">lines</poss><poss name="rings">rings</poss><poss name="spots">spots</poss><poss name="stars">stars</poss><poss name="zigzagging lines">zigzagging lines</poss><poss name="hearts">hearts</poss><poss name="broken hearts">broken hearts</poss><poss name="flames">flames</poss><poss name="webs">webs</poss><poss name="drip lines">drip lines</poss><poss name="flowers">flowers</poss><poss name="trees">trees</poss><poss name="clouds">clouds</poss><poss name="waves">waves</poss><poss name="bubbles">bubbles</poss><poss name="fish">fish</poss><poss name="turtles">turtles</poss><poss name="sea creatures">sea creatures</poss><poss name="rabbits">rabbits</poss><poss name="horses">horses</poss><poss name="farm animals">farm animals</poss><poss name="cats">cats</poss><poss name="dogs">dogs</poss><poss name="birds">birds</poss><poss name="spiders">spiders</poss><poss name="ants">ants</poss><poss name="beetles">beetles</poss></procedural>.</s> <s>If you want to fill this with tea, scoop one teaspoon of tea leaves in here for every cup you want to make, then fill it with hot water from a kettle.</s> <s>When you take off the lid, you find <il></il> inside.</s></desc>
```

This is quite a complicated description, but it can be broken down into several `procedural` tags, many of which
have a "default" `poss` tag:
- `base color`, which has a 100% chance of generating.
  - `default` is the default possibility, as it has a `chance` of 100. All other possibilities are manually
    assigned a chance of 0.
- `glaze color` has a 0% chance of generating. It will only appear if it is transferred during a transformation.
- `quality` is not explicitly assigned a chance, which means it has a 100% chance of generating.
  - `default` is the default possibility, as it has a `chance` of 100. All other possibilities are manually
    assigned a chance of 0.
  - Since the `default` possibility contains no text, nothing will appear in the
    parsed version of the description, but the `default` `poss` tag will still be carried over in transformations.
- `pattern` has a 0% chance of generating. It will only appear if it is transferred during a transformation.
  - `pattern` has several possibilities, and even contains nested procedurals, but they will never appear
    unless they were transferred during a transformation.

In effect, if you were to instantiate this CLEAN TEAPOT as an Item without manually selecting any possibilities,
the final result would be a much simpler:

```xml
<desc><s>This is <procedural name="base color"><poss name="default">a plain, white</poss></procedural> teapot.</s> <procedural name="quality"><s><poss name="default"></poss></procedural><s>It has a smooth, glassy finish.</s> <s>If you want to fill this with tea, scoop one teaspoon of tea leaves in here for every cup you want to make, then fill it with hot water from a kettle.</s> <s>When you take off the lid, you find <il></il> inside.</s></desc>
```

When a Player inspects it, it would be parsed as:

```
This is a plain, white teapot. It has a smooth, glassy finish. If you want to fill this with tea, scoop one teaspoon of tea leaves in here for every cup you want to make, then fill it with hot water from a kettle.
```

Default possibilities allow you to provide the scaffolding for more complex Prefab descriptions while still
having a simple version that can be instantiated in large numbers without variation, if desired.

As a note, the default possibility does not _need_ to have the name `default`. It can be named anything.

### Nested procedurals

There have been several examples of nested procedurals in this article already, but there exists a vital use
case for them that has not yet been covered.

Consider a Prefab with the ID CLEAN TEACUP, which has all of the same procedural options as the CLEAN TEAPOT
in the section above. One might expect to be able to [craft](../reference/data_structures/recipe.md#crafting)
a FILLED TEAPOT with the CLEAN TEACUP to produce a FILLED TEACUP. However, because the procedural selections
of all ingredients in a Recipe are combined and applied to all products, and a procedural can only be
assigned to possibility, this would cause a collision. When the two Items were crafted together, one of them
would have their procedural selections overwritten, which would most likely be undesirable.

It is possible to avoid this issue by including nested procedurals in a description, and transferring those
over during Recipe chains. For example, suppose the CLEAN TEAPOT and CLEAN TEACUP both inherit their
`base color` procedural selections from a WET CLAY Prefab at the very beginning of the Recipe chain with the
following description:

```xml
<desc><s>This is a lump of wet <procedural name="base color"><poss name="red"><procedural name="secondary base color"><poss name="red">red</poss></procedural></poss><poss name="white"><procedural name="secondary base color"><poss name="white">white</poss></procedural></poss></procedural> clay.</s> <s>You can mold it however you want at one of the WORK STATIONS, or on the POTTERY WHEEL.</s> <s>Once you're happy with your work, you'll have to wait for it to dry, and then fire it in the KILN.</s></desc>
```

Because the `secondary base color` `procedural` is nested inside of both `poss` tags inside of the main
`base color` `procedural`, and the `secondary base color` `procedural` has only one `poss` tag that 
matches the `poss` it's nested in, each `base color` possibility can carry over an additional procedural
selection.

Suppose the WET CLAY Prefab can be processed into either a WET CLAY TEAPOT or WET CLAY TEACUP Prefab.
If it is processed into a WET CLAY TEAPOT with the following description:

```xml
<desc><s>This is a teapot made of <procedural name="base color"><poss name="red" chance="50">red</poss><poss name="white" chance="50">white</poss></procedural> clay.</s> <s>It was made on a pottery wheel.</s> <procedural name="quality" stat="dex"><s><poss name="terrible" chance="40">It's of *terrible* quality. It's lumpy and misshapen, with a wildly uneven circumference. The handle is thin and flimsy, and feels like it might break off. The angle of the spout is too shallow, and the mouth is almost completely vertical. Also, the lid is shaped and sized all wrong, so it doesn't securely cover the top. Worse yet, the bottom is crooked, which makes it impossible for it to sit level on a flat surface. You'd be sure to spill whatever you put in this.</poss><poss name="poor" chance="35">It's of poor quality. The bottom is fairly sturdy, but it's not perfectly flat, preventing it from sitting level on a flat surface. The body of the pot is lumpy and oblong, giving it an uneven circumference. The lid kind of fits in the indentation on top, but it rocks back and forth, and the knob is difficult to grip. The spout is angled well, but the handle is a little small, making it somewhat difficult to hold. You could probably pour tea out of this, but you'd have to be careful, or you'd make a mess.</poss><poss name="decent" chance="20">The craftsmanship is fairly decent. It has a sturdy bottom that sits perfectly level on a flat surface. The body is mostly symmetrical, but it has a few small divots and bumps here and there, giving it a slightly uneven circumference. The lid fits in the indentation on top quite well, but the knob is a little shallow, making it somewhat difficult to grip. The handle is firmly attached and has a good thickness, with just enough room for your fingers. The spout has a nice curve, and it's angled well, making it ideal for pouring.</poss><poss name="excellent" chance="5">The craftsmanship is *excellent*. It has a sturdy bottom that sits level on any surface. The body has perfect radial symmetry, and a very smooth texture. The lid fits securely in the indentation on top, and has a sturdy, round knob that's easy to grip. The handle is attached seamlessly to the body, and has good thickness and stability, with plenty of room for your fingers. The spout also attaches seamlessly, and has an elegant curvature with a mouth at just the right angle for pouring.</poss></s></procedural> <s>The clay is still wet.</s> <s>It needs time to dry before it can be put in the kiln.</s></desc>
```

Then the `secondary base color` procedural selection that the WET CLAY Prefab transferred over will
be discarded, because there is no `procedural` tag in the WET CLAY TEAPOT's description with that name.
The `quality` `procedural` will be evaluated independently, since it was not inherited from the
WET CLAY.

On the other hand, if the WET CLAY is processed into a WET CLAY TEACUP with the following description:

```xml
<desc><s>This is a teacup and saucer set made of <procedural name="secondary base color"><poss name="red" chance="50">red</poss><poss name="white" chance="50">white</poss></procedural> clay.</s> <s>They were made on a pottery wheel.</s> <procedural name="secondary quality" stat="dex"><s><poss name="terrible" chance="30">They're of *terrible* quality. They're both lumpy and misshapen, with wildly uneven circumferences. The cup's handle is thin and flimsy, and feels like it might break off. Worse yet, the bottom of the cup is crooked, which makes it impossible for it to sit level on a flat surface; not that it matters, since the saucer has a rugged, bumpy surface itself. You'd be sure to spill whatever you put in this cup.</poss><poss name="poor" chance="30">They're of poor quality. The bottom of the saucer is decently sturdy, but it's not perfectly flat, preventing it from sitting completely level. It has a fairly flat surface, but the bottom of the cup is also a bit uneven, making it rock back and forth slightly. The saucer has a mostly even circumference at least, but the same cannot be said of the cup, which is lumpy all around. The handle is attached alright, but it's a little small, making it somewhat difficult to hold. You could probably drink out of this, but you'd have to be careful, or you'd make a mess.</poss><poss name="decent" chance="30">The craftsmanship is fairly decent. The cup and saucer both have sturdy bottoms that sit perfectly level on a flat surface. The saucer has a nice, even circumference with a concave rim. The sides and lip of the teacup are *mostly* even, but there are a few small divots and bumps here and there. The handle has a good thickness, with just enough room for your fingers. You could probably drink out of this just fine.</poss><poss name="excellent" chance="10">The craftsmanship is *excellent*. The cup and saucer both have sturdy bottoms that sit level on any surface. The rim of the saucer is perfectly circular, and flares out to give it a concave shape, but its surface still has a completely flat indentation, in which the cup fits snugly. The body of the cup itself has perfect radial symmetry, and a very smooth texture. The handle is attached seamlessly, with the ideal shape to be held with just one finger. The cup's rim flares out to meet your lips, making it easy to sip from.</poss></s></procedural> <s>The clay is still wet.</s> <s>It needs time to dry before it can be put in the kiln.</s></desc>
```

Then the `base color` procedural selection that the WET CLAY Prefab transferred over will be 
discarded instead, since no `procedural` with that tag exists in this description. The
`secondary quality` `procedural` will also be evaluated independently.

If, when creating Prefabs with procedurals, you take care to ensure that collisions will not
occur, then it is possible to create Recipes that use Prefabs with procedurals as ingredients,
without running the risk of procedural selections being overwritten.