import { parseDescription } from "../../Modules/parser.js";
/** @import GameEntity from "../../Data/GameEntity.js"; */
/** @import Event from "../../Data/Event.js"; */
/** @import RoomItem from "../../Data/RoomItem.js"; */
/** @import Player from "../../Data/Player.js"; */

describe('test parseDescription', () => {
	/** @type {Player} */
	let kyra;
	/** @type {Player} */
	let vivian;
	/** @type {Player} */
	let astrid;
	/** @type {Player} */
	let nero;
	/** @type {Player} */
	let evad;
	/** @type {Player} */
	let asuka;
	/** @type {Player} */
	let luna;
	/** @type {Player} */
	let kiara;
	/** @type {Player} */
	let amadeus;
	/** @type {Player} */
	let qm;

	beforeAll(async () => {
		await game.entityLoader.loadAll();
		kyra = game.entityFinder.getLivingPlayer("Kyra");
        vivian = game.entityFinder.getLivingPlayer("Vivian");
        astrid = game.entityFinder.getLivingPlayer("Astrid");
        nero = game.entityFinder.getLivingPlayer("Nero");
		evad = game.entityFinder.getPlayer("Evad");
        asuka = game.entityFinder.getLivingPlayer("Asuka");
        luna = game.entityFinder.getLivingPlayer("Luna");
        kiara = game.entityFinder.getLivingPlayer("Kiara");
        amadeus = game.entityFinder.getLivingPlayer("Amadeus");
        qm = game.entityFinder.getLivingPlayer("???");
	});

	describe('test item lists', () => {
		test('', () => {
			expect(true).toBe(true);
		});

		test('empty item list 0', () => {
			const text = `<desc><s>The floor beneath you is soft and earthy.</s> <s>You find <il></il> haphazardly placed on it.</s></desc>`;
			const expected = `The floor beneath you is soft and earthy.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});

		test('empty item list 1', () => {
			const text = `<desc><s>You look at the sink.</s> <s>It looks to be very clean.</s> <s>On the wall above it is a mirror.</s> <s>Under the sink, you find <il></il>.</s></desc>`;
			const expected = `You look at the sink. It looks to be very clean. On the wall above it is a mirror.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});
		
		test('single item list single item 0', () => {
			const text = `<desc><s>You open the locker.</s> <s>Inside, you find <il><item>a pair of SWIM TRUNKS</item></il>.</s></desc>`;
			const expected = `You open the locker. Inside, you find a pair of SWIM TRUNKS.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});

		test('single item list multiple items 0', () => {
			const text = `<desc><desc><s>You open the locker.</s> <s>Inside, you find <il><item>a FIRST AID KIT</item>, <item>a bottle of PAINKILLERS</item>, <item>a PILL BOTTLE</item>, and <item>an OLD KEY</item></il>.</s></desc></desc>`;
			const expected = `You open the locker. Inside, you find a FIRST AID KIT, a bottle of PAINKILLERS, a PILL BOTTLE, and an OLD KEY.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});

		test('multiple empty item lists 0', () => {
			const text = `<desc><s>It's a pair of long, purple pants with a checker pattern.</s> <s>There are four pockets altogether.</s> <s>In the left pocket, you find <il name="LEFT POCKET"></il>.</s> <s>In the right pocket, you find <il name="RIGHT POCKET"></il>.</s> <s>In the left back pocket, you find <il name="LEFT BACK POCKET"></il>.</s> <s>In the right back pocket, you find <il name="RIGHT BACK POCKET"></il>.</s></desc>`;
			const expected = `It's a pair of long, purple pants with a checker pattern. There are four pockets altogether.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});
		
		test('multiple item lists single items 0', () => {
			const text = `<desc><s>It's a pair of long, purple pants with a checker pattern.</s> <s>There are four pockets altogether.</s> <s>In the left pocket, you find <il name="LEFT POCKET"><item>a GUN</item></il>.</s> <s>In the right pocket, you find <il name="RIGHT POCKET"></il>.</s> <s>In the left back pocket, you find <il name="LEFT BACK POCKET"></il>.</s> <s>In the right back pocket, you find <il name="RIGHT BACK POCKET"><item>3 pairs of DICE</item></il>.</s></desc>`;
			const expected = `It's a pair of long, purple pants with a checker pattern. There are four pockets altogether. In the left pocket, you find a GUN. In the right back pocket, you find 3 pairs of DICE.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});
	});

	describe('test player perception', () => {
		describe('joshua body', () => {
			const text = `<desc><s>You inspect Joshua's body.</s> <if cond="player.perception >= 5"><s>He looks pretty emaciated, like he hasn't eaten or drank in days.</s> <s>You don't find any injuries except for a gash in his **NECK**.</s></if> <if cond="player.perception < 5"><s>Nothing seems out of the ordinary except for a gash in his **NECK**.</s></if></desc>`;

			test('joshua body perception 5', () => {
				const expected = `You inspect Joshua's body. He looks pretty emaciated, like he hasn't eaten or drank in days. You don't find any injuries except for a gash in his **NECK**.`;
				const result = parseDescription(text, null, nero);
				expect(result).toBe(expected);
			});
			
			test('joshua body perception 4', () => {
				const expected = `You inspect Joshua's body. Nothing seems out of the ordinary except for a gash in his **NECK**.`;
				const result = parseDescription(text, null, luna);
				expect(result).toBe(expected);
			});
		});

		describe('veronica with items', () => {
			const text = `<desc><s>You find Veronica's body lying face up.</s> <s>Her arms are extended straight out with her palms facing up.</s> <s>There's a bloody WOUND on her chest, and the blood has soaked her shirt.</s> <if cond="player.perception >= 5"><s>In her pockets, you find <il><item>a CIGARETTE</item>, <item>a KNIFE</item>, and <item>a pair of NEEDLES</item></il>.</s></if></desc>`;

			test('veronica with items perception 5', () => {
				const expected = `You find Veronica's body lying face up. Her arms are extended straight out with her palms facing up. There's a bloody WOUND on her chest, and the blood has soaked her shirt. In her pockets, you find a CIGARETTE, a KNIFE, and a pair of NEEDLES.`;
				const result = parseDescription(text, null, nero);
				expect(result).toBe(expected);
			});

			test('veronica with items perception 4', () => {
				const expected = `You find Veronica's body lying face up. Her arms are extended straight out with her palms facing up. There's a bloody WOUND on her chest, and the blood has soaked her shirt.`;
				const result = parseDescription(text, null, luna);
				expect(result).toBe(expected);
			});
		});

		describe('veronica with conditional items', () => {
			const text = `<desc><s>You find Veronica's body lying face up.</s> <s>Her arms are extended straight out with her palms facing up.</s> <s>There's a bloody WOUND on her chest, and the blood has soaked her shirt.</s> <s>In her pockets, you find <il><item>a CIGARETTE</item><if cond="player.perception >= 5">, <item>a KNIFE</item>,</if> and <item>a pair of NEEDLES</item></il>.</s></desc>`;

			test('veronica perception 5 with conditional item', () => {
				const expected = `You find Veronica's body lying face up. Her arms are extended straight out with her palms facing up. There's a bloody WOUND on her chest, and the blood has soaked her shirt. In her pockets, you find a CIGARETTE, a KNIFE, and a pair of NEEDLES.`;
				const result = parseDescription(text, null, nero);
				expect(result).toBe(expected);
			});
			
			test('veronica perception 4 with conditional item', () => {
				const expected = `You find Veronica's body lying face up. Her arms are extended straight out with her palms facing up. There's a bloody WOUND on her chest, and the blood has soaked her shirt. In her pockets, you find a CIGARETTE and a pair of NEEDLES.`;
				const result = parseDescription(text, null, luna);
				expect(result).toBe(expected);
			});
		});

		test('veronica perception 5 with empty item list', () => {
			const text = `<desc><s>You find Veronica's body lying face up.</s> <s>Her arms are extended straight out with her palms facing up.</s> <s>There's a bloody WOUND on her chest, and the blood has soaked her shirt.</s> <if cond="player.perception >= 5"><s>In her pockets, you find <il></il>.</s></if></desc>`;
			const expected = `You find Veronica's body lying face up. Her arms are extended straight out with her palms facing up. There's a bloody WOUND on her chest, and the blood has soaked her shirt.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});
	});

	describe('test player title', () => {
		describe('nemu tree', () => {
			const text = `<desc><s>You take a look at the nemu tree.</s> <s>It's unlike anything you've ever seen before.</s> <s>It has purple wood and blue leaves.</s> <s><if cond="player.title === 'Ultimate Farmer'">Supposedly if you boil a piece of bark from this it creates some kind of sleep medicine.</if></s></desc>`;

			test('nemu tree ultimate farmer', () => {
				const expected = `You take a look at the nemu tree. It's unlike anything you've ever seen before. It has purple wood and blue leaves. Supposedly if you boil a piece of bark from this it creates some kind of sleep medicine.`;
				const result = parseDescription(text, null, evad);
				expect(result).toBe(expected);
			});
			
			test('nemu tree ultimate gamer', () => {
				const expected = `You take a look at the nemu tree. It's unlike anything you've ever seen before. It has purple wood and blue leaves.`;
				const result = parseDescription(text, null, asuka);
				expect(result).toBe(expected);
			});
		});
		
		describe('pool table', () => {
			const text = `<desc><s>You examine the pool table.</s> <s>It seems to have everything you need to play a game of pool: <il><item>2 POOL STICKS</item>, <if cond="player.title === 'Ultimate Gamer'"><item>CHALK</item>,</if> <item>a TRIANGLE</item>, and <item>BALLS</item></il>.</s></desc>`;

			test('pool table not ultimate neuroscientist', () => {
				const expected = `You examine the pool table. It seems to have everything you need to play a game of pool: 2 POOL STICKS, a TRIANGLE, and BALLS.`;
				const result = parseDescription(text, null, kyra);
				expect(result).toBe(expected);
			});
			
			test('pool table ultimate gamer', () => {
				const expected = `You examine the pool table. It seems to have everything you need to play a game of pool: 2 POOL STICKS, CHALK, a TRIANGLE, and BALLS.`;
				const result = parseDescription(text, null, asuka);
				expect(result).toBe(expected);
			});
		});

		describe('tool shelves', () => {
			const text = `<desc><s>You examine the shelves.</s> <s>There are a number of tools on them.</s> <s>In particular, you find <il><item>a SAW</item>, <if cond="player.title === 'Ultimate Farmer'"><item>an AX</item></if>, and <item>a pair of HEDGE TRIMMERS</item></il>.</s></desc>`;

			test('tool shelves ultimate farmer', () => {
				const expected = `You examine the shelves. There are a number of tools on them. In particular, you find a SAW, an AX, and a pair of HEDGE TRIMMERS.`;
				const result = parseDescription(text, null, evad);
				expect(result).toBe(expected);
			});
			
			test('tool shelves ultimate gamer', () => {
				const expected = `You examine the shelves. There are a number of tools on them. In particular, you find a SAW and a pair of HEDGE TRIMMERS.`;
				const result = parseDescription(text, null, asuka);
				expect(result).toBe(expected);
			});
		});

		describe('photo album', () => {
			const text = `<desc><s>You flip through the photo album.</s> <if cond="player.name === 'Kiara'"><s>It's full of pictures of your parents and all of the places they've gone.</s> <s>There are no pictures of you.</s></if><if cond="player.name === 'Astrid'"><s>It's full of pictures of Kiara's parents in various places, but there are no pictures of Kiara in here.</s></if><if cond="player.name !== 'Kiara' && player.name !== 'Astrid'"><s>It's full of pictures of a married couple in various places around the world.</s> <s>You've never seen these people before.</s></if></desc>`;

			test('photo album asuka', () => {
				const expected = `You flip through the photo album. It's full of pictures of a married couple in various places around the world. You've never seen these people before.`;
				const result = parseDescription(text, null, asuka);
				expect(result).toBe(expected);
			});
			
			test('photo album kiara', () => {
				const expected = `You flip through the photo album. It's full of pictures of your parents and all of the places they've gone. There are no pictures of you.`;
				const result = parseDescription(text, null, kiara);
				expect(result).toBe(expected);
			});
			
			test('photo album astrid', () => {
				const expected = `You flip through the photo album. It's full of pictures of Kiara's parents in various places, but there are no pictures of Kiara in here.`;
				const result = parseDescription(text, null, astrid);
				expect(result).toBe(expected);
			});
		});

		describe('locker conditional title', () => {
			const text = `<desc><s>You open the locker.</s> <s>Inside, you find <il><if cond="player.title === 'Ultimate Nurse'"><item>a SWIMSUIT</item></if></il>.</s></desc>`;

			test('locker conditional title ultimate farmer', () => {
				const expected = `You open the locker.`;
				const result = parseDescription(text, null, evad);
				expect(result).toBe(expected);
			});

			test('locker conditional title ultimate nurse', () => {
				const expected = `You open the locker. Inside, you find a SWIMSUIT.`;
				const result = parseDescription(text, null, luna);
				expect(result).toBe(expected);
			});
		});
	});

	describe('test inventory items', () => {
		describe('mountain dew', () => {
			const text = `<desc><s>It's a bottle of Code Red Mountain Dew, which has a cherry flavor.</s> <if cond="player.name === 'Asuka'"><s>This is your favorite flavor, naturally.</s></if><if cond="player.name !== 'Asuka'"><s>For some reason, when you hold it, you get the urge to play video games.</s></if> <s>The drink and label are both red.</s> <if cond="this.uses > 0"><s>It's nice and cold.</s></if><if cond="this.uses === 0"><s>It's empty.</s></if></desc>`;
			/** @type {RoomItem} */
			let item;

			beforeAll(() => {
				item = game.entityFinder.getRoomItem('CODE RED MOUNTAIN DEW');
			});

			afterAll(() => {
				item.uses = 1;
			});

			test('mountain dew uses 1', () => {
				const expected = `It's a bottle of Code Red Mountain Dew, which has a cherry flavor. For some reason, when you hold it, you get the urge to play video games. The drink and label are both red. It's nice and cold.`;
				const result = parseDescription(text, item, nero);
				expect(result).toBe(expected);
			});
			
			test('mountain dew uses 0', () => {
				item.uses = 0;
				const expected = `It's a bottle of Code Red Mountain Dew, which has a cherry flavor. For some reason, when you hold it, you get the urge to play video games. The drink and label are both red. It's empty.`;
				const result = parseDescription(text, item, nero);
				expect(result).toBe(expected);
			});
		});

		describe('sniper rifle', () => {
			const text = `<desc><s>It's a long, black sniper rifle with an attached scope.</s> <s>It's the kind that you have to lodge into your shoulder to hold steadily.</s> <s>It's loaded with a 10-round box magazine.</s> <if cond="this.uses > 0"><s><var v="this.uses" /> shot<if cond="this.uses !== 1">s are</if><if cond="this.uses === 1"> is</if> left.</s></if><if cond="this.uses === 0"><s>Unfortunately, all the ammo has been depleted.</s></if></desc>`;
			/** @type {RoomItem} */
			let item;

			beforeAll(() => {
				item = game.entityFinder.getRoomItem('SNIPER RIFLE');
			});

			afterAll(() => {
				item.uses = 10;
			})

			test('sniper rifle uses 10', () => {
				const expected = `It's a long, black sniper rifle with an attached scope. It's the kind that you have to lodge into your shoulder to hold steadily. It's loaded with a 10-round box magazine. 10 shots are left.`;
				const result = parseDescription(text, item, nero);
				expect(result).toBe(expected);
			});
			
			test('sniper rifle uses 1', () => {
				item.uses = 1;
				const expected = `It's a long, black sniper rifle with an attached scope. It's the kind that you have to lodge into your shoulder to hold steadily. It's loaded with a 10-round box magazine. 1 shot is left.`;
				const result = parseDescription(text, item, nero);
				expect(result).toBe(expected);
			});
			
			test('sniper rifle uses 0', () => {
				item.uses = 0;
				const expected = `It's a long, black sniper rifle with an attached scope. It's the kind that you have to lodge into your shoulder to hold steadily. It's loaded with a 10-round box magazine. Unfortunately, all the ammo has been depleted.`;
				const result = parseDescription(text, item, nero);
				expect(result).toBe(expected);
			});
		});

	});

	describe('test events', () => {
		describe('single event blizzard', () => {
			const text = `<desc><s>The ground beneath your feet is made of black tarmac.</s> <s>It's fairly smooth, with only a few cracks.</s> <if cond="findEvent('BLIZZARD').ongoing === false"><s>It's surprisingly quite clear of snow.</s></if><if cond="findEvent('BLIZZARD').ongoing === true"><s>Snow is quickly piling up in this blizzard.</s></if> <s>You find <il></il> haphazardly placed on it.</s></desc>`;
			/** @type {GameEntity} */
			let container;
			/** @type {Event} */
			let event;

			beforeAll(() => {
				container = game.entityFinder.getFixture('FLOOR', 'runway');
				event = game.entityFinder.getEvent('BLIZZARD');
			});

			afterAll(() => {
				event.ongoing = false;
			});

			test('blizzard ongoing', () => {
				event.ongoing = true;
				const expected = `The ground beneath your feet is made of black tarmac. It's fairly smooth, with only a few cracks. Snow is quickly piling up in this blizzard.`;
				const result = parseDescription(text, container, nero);
				expect(result).toBe(expected);
			});

			test('blizzard not ongoing', () => {
				event.ongoing = false;
				const expected = `The ground beneath your feet is made of black tarmac. It's fairly smooth, with only a few cracks. It's surprisingly quite clear of snow.`;
				const result = parseDescription(text, container, nero);
				expect(result).toBe(expected);
			});
		});

		describe('multiple events winter checkpoint', () => {
			const text = `<desc><s>You exit the CHECKPOINT.</s> <if cond="findEvent('SNOW').ongoing === true"><s>Snowflakes gently fall from the cloudy sky above.</s></if><if cond="findEvent('BLIZZARD').ongoing === true"><s>You're immediately greeted by a blizzard blowing snow at you at a high speed.</s></if><if cond="findEvent('SNOW').ongoing === false && findEvent('BLIZZARD').ongoing === false"><if cond="findEvent('OVERCAST').ongoing === false && findEvent('NIGHT').ongoing === false"><s>Your eyes take a minute to adjust to the sunlight.</s></if><if cond="findEvent('OVERCAST').ongoing === true && findEvent('NIGHT').ongoing === false"><s>The sky above is covered by thick, light gray clouds.</s></if><if cond="findEvent('NIGHT').ongoing === true"><s>You breathe in the crisp, chilly nighttime air.</s></if></if> <s>The path ahead of you is short and thin, leading to the SOUTH PATH.</s></desc>`;
			/** @type {GameEntity} */
			let container;
			/** @type {Event} */
			let snowEvent;
			/** @type {Event} */
			let blizzardEvent;
			/** @type {Event} */
			let overcastEvent;
			/** @type {Event} */
			let nightEvent;

			beforeAll(() => {
				container = game.entityFinder.getRoom('path-2');
				snowEvent = game.entityFinder.getEvent('SNOW');
				blizzardEvent = game.entityFinder.getEvent('BLIZZARD');
				overcastEvent = game.entityFinder.getEvent('OVERCAST');
				nightEvent = game.entityFinder.getEvent('NIGHT');
			});

			afterAll(() => {
				snowEvent.ongoing = false;
				blizzardEvent.ongoing = false;
				overcastEvent.ongoing = false;
				nightEvent.ongoing = false;
			});

			describe('no snow no blizzard', () => {
				describe('overcast ongoing', () => {
					beforeEach(() => {
						overcastEvent.ongoing = true;
					});

					test('overcast ongoing daytime', () => {
						nightEvent.ongoing = false;
						const expected = `You exit the CHECKPOINT. The sky above is covered by thick, light gray clouds. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
						const result = parseDescription(text, container, nero);
						expect(result).toBe(expected);
					});

					test('overcast ongoing night ongoing', () => {
						nightEvent.ongoing = true;
						const expected = `You exit the CHECKPOINT. You breathe in the crisp, chilly nighttime air. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
						const result = parseDescription(text, container, nero);
						expect(result).toBe(expected);
					});
				});

				describe('not overcast', () => {
					beforeEach(() => {
						overcastEvent.ongoing = false;
					});

					test('not overcast daytime', () => {
						nightEvent.ongoing = false;
						const expected = `You exit the CHECKPOINT. Your eyes take a minute to adjust to the sunlight. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
						const result = parseDescription(text, container, nero);
						expect(result).toBe(expected);
					});

					test('not overcast night ongoing', () => {
						nightEvent.ongoing = true;
						const expected = `You exit the CHECKPOINT. You breathe in the crisp, chilly nighttime air. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
						const result = parseDescription(text, container, nero);
						expect(result).toBe(expected);
					});
				});
			});

			test('snow ongoing', () => {
				snowEvent.ongoing = true;
				blizzardEvent.ongoing = false;
				const expected = `You exit the CHECKPOINT. Snowflakes gently fall from the cloudy sky above. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
				const result = parseDescription(text, container, nero);
				expect(result).toBe(expected);
			});

			test('blizzard ongoing', () => {
				snowEvent.ongoing = false;
				blizzardEvent.ongoing = true;
				const expected = `You exit the CHECKPOINT. You're immediately greeted by a blizzard blowing snow at you at a high speed. The path ahead of you is short and thin, leading to the SOUTH PATH.`;
				const result = parseDescription(text, container, nero);
				expect(result).toBe(expected);
			});
		});
	});
		
	describe('test formatting', () => {
		test('greater than less than', () => {
			const text = `<desc><s>It's a graph of an algebraic expression.</s> <s>In the corner, "x > -2 && x < 3" is written.</s></desc>`;
			const expected = `It's a graph of an algebraic expression. In the corner, "x > -2 && x < 3" is written.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});
		
		test('less than greater than', () => {
			const text = `<desc><s>It's a graph of an algebraic expression.</s> <s>In the corner, "x < 3 && x > -2" is written.</s></desc>`;
			const expected = `It's a graph of an algebraic expression. In the corner, "x < 3 && x > -2" is written.`;
			const result = parseDescription(text, null, nero);
			expect(result).toBe(expected);
		});

		test('broken opening desc tag', () => {
			const text = `desc><s>It’s a raspberry blue blanket filled with plastic pellets that weigh it down.</s> <s>It weighs 10 pounds and is very comforting.</s></desc>`;
			const expected = `It’s a raspberry blue blanket filled with plastic pellets that weigh it down. It weighs 10 pounds and is very comforting.`;
			const result = parseDescription(text, null, nero);
			expect(result).not.toBe(expected);
		});

		test('duplicate closing desc tag', () => {
			const text = `</desc><s>It's a wide, boxy typewriter set into a wooden base.</s> <s>There is a *QWERTZ* keyboard set into the front that makes heavy, noisy clicks whenever the keys are pressed down.</s> <s>A cylinder at the back of the typewriter has a roll of paper clipped in.</s> <s>When a key is typed, ink stamps down onto the paper, producing letters onto the paper.</s> <s>There are visible signs of aging on this typewriter, as if it’s accompanied its owner for many years.</s> <s>Despite the small placard below the keyboard reading “NEO-TYPEWRITER”, nothing about it seems particularly futuristic.</s></desc>`;
			const expected = `It's a wide, boxy typewriter set into a wooden base. There is a *QWERTZ* keyboard set into the front that makes heavy, noisy clicks whenever the keys are pressed down. A cylinder at the back of the typewriter has a roll of paper clipped in. When a key is typed, ink stamps down onto the paper, producing letters onto the paper. There are visible signs of aging on this typewriter, as if it’s accompanied its owner for many years. Despite the small placard below the keyboard reading “NEO-TYPEWRITER”, nothing about it seems particularly futuristic.`;
			const result = parseDescription(text, null, nero);
			expect(result).not.toBe(expected);
		});

		test('missing opening desc tag', () => {
			const text = `<s>It’s a black, early-2000s CD player.</s> <s>Plugged into the audio port is a similarly black pair of earbuds.</s> <s>The player itself is round and its lid flips up with the help of a tiny button, granting access to the CD inside.</s> <s>The CD currently in the player has no design on it, but it has music nonetheless.</s></desc>`;
			const expected = `It’s a black, early-2000s CD player. Plugged into the audio port is a similarly black pair of earbuds. The player itself is round and its lid flips up with the help of a tiny button, granting access to the CD inside. The CD currently in the player has no design on it, but it has music nonetheless.`;
			const result = parseDescription(text, null, nero);
			expect(result).not.toBe(expected);
		});
	});
});