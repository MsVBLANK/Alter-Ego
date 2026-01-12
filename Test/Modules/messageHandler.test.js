import discord from "../__mocks__/libs/discord.js";
import * as DialogClass from "../../Data/Dialog.js";
import AnnounceAction from "../../Data/Actions/AnnounceAction.js";
import SayAction from "../../Data/Actions/SayAction.js";
import * as messageHandler from "../../Modules/messageHandler.js";
import { instantiateInventoryItem } from "../../Modules/itemManager.js";

/**
 * @import Player from "../../Data/Player.js"
 * @import Room from "../../Data/Room.js"
 * @import Status from "../../Data/Status.js"
 */

describe('messageHandler test', () => {
    /** 
     * Location: command-center
     * 
     * Behavior Attributes: concealed, no channel, see room, hear room
     * 
     * Knows: vivian, nero
     * @type {Player}
     */
    let kyra;
    /** 
     * Location: general-managers-office
     * 
     * Behavior Attributes:
     * 
     * Knows: kyra, nero
     * @type {Player}
     */
    let vivian;
    /** 
     * Location: floor-1-hall-2
     * 
     * Behavior Attributes: 
     * 
     * Knows: kiara
     * @type {Player}
     */
    let astrid;
    /** 
     * Location: courtyard
     * 
     * Behavior Attributes: sender, receiver
     * 
     * Knows: vivian, kyra
     * @type {Player}
     */
    let nero;
    /** 
     * Location: subject to change
     * 
     * Behavior Attributes: 
     * 
     * Knows: 
     * @type {Player}
     */
    let asuka;
    /** 
     * Location: subject to change
     * 
     * Behavior Attributes:
     * 
     * Knows: 
     * @type {Player}
     */
    let luna;
    /** 
     * Location: floor-1-hall-1
     * 
     * Behavior Attributes:
     * 
     * Knows: astrid
     * @type {Player}
     */
    let kiara;
    /** 
     * Location: command-center
     * 
     * Behavior Attributes: 
     * 
     * Knows: everyone
     * @type {Player}
     */
    let amadeus;
    /** 
     * Location: general-managers-office 
     * 
     * Behavior Attributes: hidden, sender, receiver
     * 
     * Knows: 
     * @type {Player}
     */
    let qm;
    /**
     * Tags: video surveilled, audio surveilled, audio monitoring
     * 
     * Audio Monitored By: lobby, command-center
     * 
     * Video Monitored By: lobby, command-center
     * 
     * Occupants: 
     * @type {Room}
     */
    let breakRoom;
    /** 
     * Tags: soundproof
     * 
     * Audio Monitored By: 
     * 
     * Video Monitored By: 
     * 
     * Occupants: vivian, qm (hidden in DESK)
     * @type {Room}
     */
    let gmOffice;
    /** 
     * Tags: video surveilled, audio surveilled
     * 
     * Audio Monitored By: lobby, break-room, command-center
     * 
     * Video Monitored By: lobby, command-center
     * 
     * Occupants: kiara
     * @type {Room}
     */
    let f1h1;
    /**
     * Tags: 
     * 
     * Audio Monitored By: 
     * 
     * Video Monitored By: 
     * 
     * Occupants: astrid
     * @type {Room}
     */
    let f1h2;
    /**
     * Tags: video monitoring, video surveilled, audio monitoring, audio surveilled
     * 
     * Audio Monitored By: break-room, command-center
     * 
     * Video Monitored By: command-center
     * 
     * Occupants: subject to change
     * @type {Room}
     */
    let lobby;
    /** 
     * Tags: soundproof, video monitoring, video surveilled, audio monitoring, audio surveilled, secret
     * 
     * Audio Monitored By: lobby, break-room 
     * 
     * Video Monitored By: lobby
     * 
     * Occupants: kyra, amadeus
     * @type {Room}
     */
    let commandCenter;
    /** 
     * Tags: 
     * 
     * Audio Monitored By: 
     * 
     * Video Monitored By: 
     * 
     * Occupants: subject to change
     * @type {Room}
     */
    let courtyard;
    /** @type {Player[]} */
    let players;
    /** @type {Room[]} */
    let rooms;
    /** @type {Status} */
    let asleep;
    /** @type {Status} */
    let blind;
    /** @type {Status} */
    let concealed;
    /** @type {Status} */
    let deaf;
    /** @type {Status} */
    let hidden;
    /** @type {Status} */
    let mute;
    beforeAll(async () => {
        await game.entityLoader.loadAll();
        kyra = game.entityFinder.getLivingPlayer("Kyra");
        vivian = game.entityFinder.getLivingPlayer("Vivian");
        astrid = game.entityFinder.getLivingPlayer("Astrid");
        nero = game.entityFinder.getLivingPlayer("Nero");
        asuka = game.entityFinder.getLivingPlayer("Asuka");
        luna = game.entityFinder.getLivingPlayer("Luna");
        kiara = game.entityFinder.getLivingPlayer("Kiara");
        amadeus = game.entityFinder.getLivingPlayer("Amadeus");
        qm = game.entityFinder.getLivingPlayer("???");
        breakRoom = game.entityFinder.getRoom("break-room");
        gmOffice = game.entityFinder.getRoom("general-managers-office");
        f1h1 = game.entityFinder.getRoom("floor-1-hall-1");
        f1h2 = game.entityFinder.getRoom("floor-1-hall-2");
        lobby = game.entityFinder.getRoom("lobby");
        commandCenter = game.entityFinder.getRoom("command-center");
        courtyard = game.entityFinder.getRoom("courtyard");
        players = [kyra, vivian, astrid, nero, asuka, luna, kiara, amadeus];
        rooms = [breakRoom, gmOffice, f1h1, f1h2, lobby, commandCenter, courtyard];
        asleep = game.entityFinder.getStatusEffect("asleep");
        blind = game.entityFinder.getStatusEffect("blind");
        concealed = game.entityFinder.getStatusEffect("concealed");
        deaf = game.entityFinder.getStatusEffect("deaf");
        hidden = game.entityFinder.getStatusEffect("hidden");
        mute = game.entityFinder.getStatusEffect("mute");
    });

    describe('processIncomingMessage tests', () => {
        afterEach(() => {
            for (const player of players) {
                if (player.isNPC) continue;
                player.spectateChannel.messages.cache.clear();
                player.notificationChannel.messages.cache.clear();
            }
            for (const room of rooms)
                room.channel.messages.cache.clear();
        });

        describe('general tests', () => {
            test('mute player cannot speak', async () => {
                asuka.inflict(mute);
                const message = discord.createPlayerMessage(asuka, "Hi.");
                const deleteMessageSpy = vi.spyOn(message, 'delete');
                await messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                expect(asuka.notificationChannel.messages.cache.first().content).toBe(`You are **${mute.id}**, so you cannot speak.`);
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                expect(deleteMessageSpy).toHaveBeenCalledOnce();
                asuka.cure(mute);
            });
        });

        describe('announcement', () => {
            let dialogConstructorSpy;

            beforeEach(() => {
                dialogConstructorSpy = vi.spyOn(DialogClass, 'default');
            });

            afterEach(() => {
                dialogConstructorSpy.mockRestore();
            });

            test('announcement message by living player', async () => {
                const message = discord.createPlayerMessage(kyra, "Good morning, everyone.", game.guildContext.announcementChannel);
                const announceActionSpy = vi.spyOn(AnnounceAction.prototype, 'performAnnounce');
                await messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(dialogConstructorSpy).toHaveBeenCalledOnce();
                expect(announceActionSpy).toHaveBeenCalledOnce();
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(players.length);
                for (const player of players) {
                    expect(player.spectateChannel.messages.cache.size).toBe(1);
                    const spectateMessage = player.spectateChannel.messages.cache.first();
                    expect(spectateMessage.webhookId).toBeTypeOf("string");
                    expect(spectateMessage.author.username).toBe("Kyra");
                    expect(spectateMessage.author.avatarURL()).toBe(kyra.member.avatarURL());
                    expect(spectateMessage.content).toBe("Good morning, everyone.");
                }
            });

            test('announcement message by dead player', async () => {
                const evad = game.entityFinder.getDeadPlayer("Evad");
                const message = discord.createPlayerMessage(evad, "Good morning, y'all.", game.guildContext.announcementChannel);
                const announceActionSpy = vi.spyOn(AnnounceAction.prototype, 'performAnnounce');
                await messageHandler.processIncomingMessage(game, message);
                expect(dialogConstructorSpy).not.toHaveBeenCalled();
                expect(announceActionSpy).not.toHaveBeenCalled();
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
            });

            test('announcement message by non-player', async () => {
                const member = discord.createMockMember();
                const message = discord.createMockMessage({
                    content: "Good morning, everyone.",
                    member: member,
                    author: member.user,
                    channel: game.guildContext.announcementChannel
                });
                const announceActionSpy = vi.spyOn(AnnounceAction.prototype, 'performAnnounce');
                await messageHandler.processIncomingMessage(game, message);
                expect(dialogConstructorSpy).not.toHaveBeenCalled();
                expect(announceActionSpy).not.toHaveBeenCalled();
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
            });
        });

        describe('say', () => {
            beforeAll(() => {
                kyra.location.removePlayer(kyra);
                commandCenter.addPlayer(kyra);
                amadeus.location.removePlayer(amadeus);
                commandCenter.addPlayer(amadeus);

                vivian.location.removePlayer(vivian);
                gmOffice.addPlayer(vivian);

                nero.location.removePlayer(nero);
                breakRoom.addPlayer(nero);

                astrid.location.removePlayer(astrid);
                f1h2.addPlayer(astrid);

                kiara.location.removePlayer(kiara);
                f1h1.addPlayer(kiara);
                
                luna.location.removePlayer(luna);
                courtyard.addPlayer(luna);
                asuka.location.removePlayer(asuka);
                courtyard.addPlayer(asuka);

                const mask = game.entityFinder.getPrefab("PLAGUE DOCTOR MASK");
                instantiateInventoryItem(mask, kyra, "FACE", null, "", 1, new Map());
            });

            describe('dialog is communicated to room occupants', () => {
                describe('two players in room who do not recognize each other', () => {
                    test('standard dialog is communicated to spectate channels', async () => {
                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of luna.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache.size).toBe(0);
                            expect(occupant.spectateChannel.messages.cache.size).toBe(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage.webhookId).toBeTypeOf("string");
                            expect(spectateMessage.author.username).toBe("Luna");
                            expect(spectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(spectateMessage.content).toBe("Oh, hello!");
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache.size).toBe(0);
                        expect(luna.spectateChannel.messages.cache.size).toBe(1);
                        const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                        expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(lunaSpectateMessage.author.username).toBe("An individual wearing a MASK (Luna)");
                        expect(lunaSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache.size).toBe(0);
                        expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                        const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                        expect(asukaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(asukaSpectateMessage.author.username).toBe("An individual wearing a MASK");
                        expect(asukaSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(asukaSpectateMessage.content).toBe("Oh, hello!");

                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(luna);
                        hidingSpot.addPlayer(asuka);
                        luna.inflict(hidden);
                        asuka.inflict(hidden);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache.size).toBe(0);
                        expect(luna.spectateChannel.messages.cache.size).toBe(1);
                        const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                        expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(lunaSpectateMessage.author.username).toBe("Luna");
                        expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                        expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                        const asukaNotificationMessage = asuka.notificationChannel.messages.cache.first();
                        expect(asukaNotificationMessage.content).toBe(`Luna says "Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                        const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                        expect(asukaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(asukaSpectateMessage.author.username).toBe("Luna");
                        expect(asukaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                        expect(asukaSpectateMessage.content).toBe("Oh, hello!");

                        hidingSpot.removePlayer(luna);
                        hidingSpot.removePlayer(asuka);
                        luna.cure(hidden);
                        asuka.cure(hidden);
                    });

                    test('players are hidden together and display name of speaker does not match her name', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(luna);
                        hidingSpot.addPlayer(asuka);
                        luna.inflict(hidden);
                        asuka.inflict(hidden);
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache.size).toBe(0);
                        expect(luna.spectateChannel.messages.cache.size).toBe(1);
                        const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                        expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(lunaSpectateMessage.author.username).toBe("An individual wearing a MASK (Luna)");
                        expect(lunaSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                        const asukaNotificationMessage = asuka.notificationChannel.messages.cache.first();
                        expect(asukaNotificationMessage.content).toBe(`An individual wearing a MASK says "Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                        const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                        expect(asukaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(asukaSpectateMessage.author.username).toBe("An individual wearing a MASK");
                        expect(asukaSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(asukaSpectateMessage.content).toBe("Oh, hello!");

                        hidingSpot.removePlayer(luna);
                        hidingSpot.removePlayer(asuka);
                        luna.cure(hidden);
                        asuka.cure(hidden);
                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        asuka.inflict(deaf);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache.size).toBe(0);
                        expect(luna.spectateChannel.messages.cache.size).toBe(1);
                        const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                        expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(lunaSpectateMessage.author.username).toBe("Luna");
                        expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                        expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache.size).toBe(0);
                        expect(asuka.spectateChannel.messages.cache.size).toBe(0);

                        asuka.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        asuka.inflict(asleep);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(luna, "Oh, hello!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache.size).toBe(0);
                        expect(luna.spectateChannel.messages.cache.size).toBe(1);
                        const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                        expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(lunaSpectateMessage.author.username).toBe("Luna");
                        expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                        expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache.size).toBe(0);
                        expect(asuka.spectateChannel.messages.cache.size).toBe(0);

                        asuka.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('luna is mimicking asuka', async () => {
                            luna.voiceString = "Asuka";

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(luna, "Oh, hello!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache.size).toBe(0);
                            expect(luna.spectateChannel.messages.cache.size).toBe(1);
                            const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                            expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(lunaSpectateMessage.author.username).toBe("Luna");
                            expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                            expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                            const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                            expect(asukaSpectateMessage.webhookId).toBeUndefined();
                            expect(asukaSpectateMessage.content).toBe(`Luna says "Oh, hello!" in your voice!`);

                            luna.voiceString = luna.originalVoiceString;
                        });

                        test('asuka has `no sight` behavior attribute', async () => {
                            asuka.inflict(blind);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(luna, "Oh, hello!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache.size).toBe(0);
                            expect(luna.spectateChannel.messages.cache.size).toBe(1);
                            const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                            expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(lunaSpectateMessage.author.username).toBe("Luna");
                            expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                            expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                            const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                            expect(asukaSpectateMessage.webhookId).toBeUndefined();
                            expect(asukaSpectateMessage.content).toBe(`Someone in the room with a gentle voice says "Oh, hello!"`);

                            asuka.cure(blind);
                        });

                        test('asuka has `no sight` behavior attribute and luna is mimicking asuka', async () => {
                            asuka.inflict(blind);
                            luna.voiceString = "Asuka";

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(luna, "Oh, hello!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache.size).toBe(0);
                            expect(luna.spectateChannel.messages.cache.size).toBe(1);
                            const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                            expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(lunaSpectateMessage.author.username).toBe("Luna");
                            expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                            expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                            const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                            expect(asukaSpectateMessage.webhookId).toBeUndefined();
                            expect(asukaSpectateMessage.content).toBe(`Someone in the room says "Oh, hello!" in your voice!`);

                            asuka.cure(blind);
                            luna.voiceString = luna.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('asuka has `hear room` behavior attribute', async () => {
                            asuka.inflict(concealed);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(luna, "Oh, hello!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(luna.notificationChannel.messages.cache.size).toBe(0);
                            expect(luna.spectateChannel.messages.cache.size).toBe(1);
                            const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                            expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(lunaSpectateMessage.author.username).toBe("Luna");
                            expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                            const asukaNotificationMessage = asuka.notificationChannel.messages.cache.first();
                            expect(asukaNotificationMessage.content).toBe(`Luna says "Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                            const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                            expect(asukaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(asukaSpectateMessage.author.username).toBe("Luna");
                            expect(asukaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(asukaSpectateMessage.content).toBe("Oh, hello!");

                            asuka.cure(concealed);
                        });

                        test('asuka has `hear room` behavior attribute and cannot see luna', async () => {
                            luna.inflict(hidden);
                            asuka.inflict(concealed);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(luna, "Oh, hello!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(luna.notificationChannel.messages.cache.size).toBe(0);
                            expect(luna.spectateChannel.messages.cache.size).toBe(1);
                            const lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                            expect(lunaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(lunaSpectateMessage.author.username).toBe("Luna");
                            expect(lunaSpectateMessage.author.avatarURL()).toBe(luna.member.avatarURL());
                            expect(lunaSpectateMessage.content).toBe("Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache.size).toBe(1);
                            const asukaNotificationMessage = asuka.notificationChannel.messages.cache.first();
                            expect(asukaNotificationMessage.content).toBe(`Someone in the room with a gentle voice says "Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache.size).toBe(1);
                            const asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                            expect(asukaSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(asukaSpectateMessage.author.username).toBe("Someone in the room with a gentle voice");
                            expect(asukaSpectateMessage.author.avatarURL()).toBe(game.settings.hiddenIconURL);
                            expect(asukaSpectateMessage.content).toBe("Oh, hello!");

                            luna.cure(hidden);
                            asuka.cure(concealed);
                        });
                    });
                });

                describe('two players in room who do recognize each other', () => {
                    beforeAll(() => {
                        luna.location.removePlayer(luna);
                        asuka.location.removePlayer(asuka);
                        kiara.location.removePlayer(kiara);
                        courtyard.addPlayer(kiara);
                        astrid.location.removePlayer(astrid);
                        courtyard.addPlayer(astrid);
                    });

                    afterAll(() => {
                        courtyard.addPlayer(luna);
                        courtyard.addPlayer(asuka);
                        kiara.location.removePlayer(kiara);
                        f1h1.addPlayer(kiara);
                        f1h2.addPlayer(astrid);
                    });

                    test('standard dialog is communicated to spectate channels', async () => {
                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of kiara.location.occupants) {;
                            expect(occupant.notificationChannel.messages.cache.size).toBe(0);
                            expect(occupant.spectateChannel.messages.cache.size).toBe(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage.webhookId).toBeTypeOf("string");
                            expect(spectateMessage.author.username).toBe("Kiara");
                            expect(spectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(spectateMessage.content).toBe("Bonjour!");
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        kiara.displayName = "an individual wearing a MASK";
                        kiara.displayIcon = game.settings.defaultConcealedIconURL;

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                        expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                        const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                        expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(kiaraSpectateMessage.author.username).toBe("An individual wearing a MASK (Kiara)");
                        expect(kiaraSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                        expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                        const astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                        expect(astridNotificationMessage.content).toBe(`An individual wearing a MASK, with a pretty voice you recognize as Kiara's, says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                        const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                        expect(astridSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(astridSpectateMessage.author.username).toBe("An individual wearing a MASK (Kiara)");
                        expect(astridSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(astridSpectateMessage.content).toBe("Bonjour!");

                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(kiara);
                        hidingSpot.addPlayer(astrid);
                        kiara.inflict(hidden);
                        astrid.inflict(hidden);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                        expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                        const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                        expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                        expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                        expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                        expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                        const astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                        expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                        const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                        expect(astridSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(astridSpectateMessage.author.username).toBe("Kiara");
                        expect(astridSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                        expect(astridSpectateMessage.content).toBe("Bonjour!");

                        hidingSpot.removePlayer(kiara);
                        hidingSpot.removePlayer(astrid);
                        kiara.cure(hidden);
                        astrid.cure(hidden);
                    });

                    test('players are hidden together and display name of speaker does not match her name', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(kiara);
                        hidingSpot.addPlayer(astrid);
                        kiara.inflict(hidden);
                        astrid.inflict(hidden);
                        kiara.displayName = "an individual wearing a MASK";
                        kiara.displayIcon = game.settings.defaultConcealedIconURL;

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                        expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                        const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                        expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(kiaraSpectateMessage.author.username).toBe("An individual wearing a MASK (Kiara)");
                        expect(kiaraSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                        expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                        const astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                        expect(astridNotificationMessage.content).toBe(`An individual wearing a MASK, with a pretty voice you recognize as Kiara's, says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                        const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                        expect(astridSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(astridSpectateMessage.author.username).toBe("An individual wearing a MASK (Kiara)");
                        expect(astridSpectateMessage.author.avatarURL()).toBe(game.settings.defaultConcealedIconURL);
                        expect(astridSpectateMessage.content).toBe("Bonjour!");

                        hidingSpot.removePlayer(kiara);
                        hidingSpot.removePlayer(astrid);
                        kiara.cure(hidden);
                        astrid.cure(hidden);
                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        astrid.inflict(deaf);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                        expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                        const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                        expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                        expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                        expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                        expect(astrid.notificationChannel.messages.cache.size).toBe(0);
                        expect(astrid.spectateChannel.messages.cache.size).toBe(0);

                        astrid.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        astrid.inflict(asleep);

                        const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                        const message = discord.createPlayerMessage(kiara, "Bonjour!");
                        await messageHandler.processIncomingMessage(game, message);
                        await messageHandler.sendQueuedMessages(game);
                        expect(performSaySpy).toHaveBeenCalledOnce();
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                        expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                        const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                        expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                        expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                        expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                        expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                        expect(astrid.notificationChannel.messages.cache.size).toBe(0);
                        expect(astrid.spectateChannel.messages.cache.size).toBe(0);

                        astrid.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('kiara is mimicking astrid', async () => {
                            kiara.voiceString = "Astrid";

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(kiara, "Bonjour!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                            expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                            const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                            expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                            expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                            expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                            expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                            const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                            expect(astridSpectateMessage.webhookId).toBeUndefined();
                            expect(astridSpectateMessage.content).toBe(`Kiara says "Bonjour!" in your voice!`);

                            kiara.voiceString = kiara.originalVoiceString;
                        });

                        test('astrid has `no sight` behavior attribute', async () => {
                            astrid.inflict(blind);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(kiara, "Bonjour!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                            expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                            const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                            expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                            expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                            expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                            expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                            const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                            expect(astridSpectateMessage.webhookId).toBeUndefined();
                            expect(astridSpectateMessage.content).toBe(`Kiara says "Bonjour!"`);

                            astrid.cure(blind);
                        });

                        test('astrid has `no sight` behavior attribute and kiara is mimicking astrid', async () => {
                            astrid.inflict(blind);
                            kiara.voiceString = "Astrid";

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(kiara, "Bonjour!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                            expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                            const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                            expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                            expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                            expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                            expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                            const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                            expect(astridSpectateMessage.webhookId).toBeUndefined();
                            expect(astridSpectateMessage.content).toBe(`Someone in the room says "Bonjour!" in your voice!`);

                            astrid.cure(blind);
                            kiara.voiceString = kiara.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('astrid has `hear room` behavior attribute', async () => {
                            astrid.inflict(concealed);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(kiara, "Bonjour!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                            expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                            const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                            expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                            expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                            expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                            const astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                            expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                            const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                            expect(astridSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(astridSpectateMessage.author.username).toBe("Kiara");
                            expect(astridSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(astridSpectateMessage.content).toBe("Bonjour!");

                            astrid.cure(concealed);
                        });

                        test('astrid has `hear room` behavior attribute and cannot see kiara', async () => {
                            kiara.inflict(hidden);
                            astrid.inflict(concealed);

                            const performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
                            const message = discord.createPlayerMessage(kiara, "Bonjour!");
                            await messageHandler.processIncomingMessage(game, message);
                            await messageHandler.sendQueuedMessages(game);
                            expect(performSaySpy).toHaveBeenCalledOnce();
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(kiara.notificationChannel.messages.cache.size).toBe(0);
                            expect(kiara.spectateChannel.messages.cache.size).toBe(1);
                            const kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                            expect(kiaraSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(kiaraSpectateMessage.author.username).toBe("Kiara");
                            expect(kiaraSpectateMessage.author.avatarURL()).toBe(kiara.member.avatarURL());
                            expect(kiaraSpectateMessage.content).toBe("Bonjour!");

                            expect(astrid.notificationChannel.messages.cache.size).toBe(1);
                            const astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                            expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache.size).toBe(1);
                            const astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                            expect(astridSpectateMessage.webhookId).toBeTypeOf("string");
                            expect(astridSpectateMessage.author.username).toBe("Kiara");
                            expect(astridSpectateMessage.author.avatarURL()).toBe(game.settings.hiddenIconURL);
                            expect(astridSpectateMessage.content).toBe("Bonjour!");

                            kiara.cure(hidden);
                            astrid.cure(concealed);
                        });
                    });
                });
            });
        });
    });
});