import discord from "../__mocks__/libs/discord.js";
import * as DialogClass from "../../Data/Dialog.js";
import AnnounceAction from "../../Data/Actions/AnnounceAction.js";
import SayAction from "../../Data/Actions/SayAction.js";
import SolveAction from "../../Data/Actions/SolveAction.js";
import * as messageHandler from "../../Modules/messageHandler.js";
import { instantiateInventoryItem } from "../../Modules/itemManager.js";

/**
 * @import HidingSpot from "../../Data/HidingSpot.js"
 * @import Player from "../../Data/Player.js"
 * @import Room from "../../Data/Room.js"
 * @import Status from "../../Data/Status.js"
 * @import Whisper from "../../Data/Whisper.js"
 * @import { Message, TextChannel } from "discord.js"
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
     * Location: break-room
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
     * Occupants: nero
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
    /** @type {Status} */
    let acuteHearing;
    /** @type {Status} */
    let receiver;

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
        acuteHearing = game.entityFinder.getStatusEffect("hearing");
        receiver = game.entityFinder.getStatusEffect("walkie talkie");
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
                messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                expect(asuka.notificationChannel.messages.cache.first().content).toBe(`You are **${mute.id}**, so you cannot speak.`);
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                expect(deleteMessageSpy).toHaveBeenCalledTimes(1);
                asuka.cure(mute);
            });

            test('mute player cannot send OOC message', async () => {
                asuka.inflict(mute);
                const message = discord.createPlayerMessage(asuka, "( Hi.");
                const deleteMessageSpy = vi.spyOn(message, 'delete');
                messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                expect(asuka.notificationChannel.messages.cache.first().content).toBe(`You are **${mute.id}**, so you cannot speak.`);
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                expect(deleteMessageSpy).toHaveBeenCalledTimes(1);
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
                messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(dialogConstructorSpy).toHaveBeenCalledTimes(1);
                expect(announceActionSpy).toHaveBeenCalledTimes(1);
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(players.length);
                for (const player of players) {
                    expect(player.spectateChannel.messages.cache).toHaveSize(1);
                    const spectateMessage = player.spectateChannel.messages.cache.first();
                    expect(spectateMessage).toBeWebhookMessage();
                    expect(spectateMessage).toBeMessageWith("Kyra", kyra.member.avatarURL(), "Good morning, everyone.");
                }
            });

            test('announcement OOC message by living player is not communicated to spectate channels', async () => {
                const message = discord.createPlayerMessage(kyra, "( Good morning, everyone.", game.guildContext.announcementChannel);
                const announceActionSpy = vi.spyOn(AnnounceAction.prototype, 'performAnnounce');
                messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                expect(dialogConstructorSpy).toHaveBeenCalledTimes(1);
                expect(announceActionSpy).toHaveBeenCalledTimes(1);
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
            });

            test('announcement message by dead player', async () => {
                const evad = game.entityFinder.getDeadPlayer("Evad");
                const message = discord.createPlayerMessage(evad, "Good morning, y'all.", game.guildContext.announcementChannel);
                const announceActionSpy = vi.spyOn(AnnounceAction.prototype, 'performAnnounce');
                messageHandler.processIncomingMessage(game, message);
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
                messageHandler.processIncomingMessage(game, message);
                expect(dialogConstructorSpy).not.toHaveBeenCalled();
                expect(announceActionSpy).not.toHaveBeenCalled();
                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
            });
        });

        describe('say', () => {
            let performSaySpy;
            /** @type {UserMessage} */
            let message;
            /** @type {Message<boolean>} */
            let kyraSpectateMessage;
            /** @type {Message<boolean>} */
            let vivianSpectateMessage;
            /** @type {Message<boolean>} */
            let astridSpectateMessage;
            /** @type {Message<boolean>} */
            let neroSpectateMessage;
            /** @type {Message<boolean>} */
            let asukaSpectateMessage;
            /** @type {Message<boolean>} */
            let lunaSpectateMessage;
            /** @type {Message<boolean>} */
            let kiaraSpectateMessage;
            /** @type {Message<boolean>} */
            let amadeusSpectateMessage;
            /** @type {Message<boolean>} */
            let kyraNotificationMessage;
            /** @type {Message<boolean>} */
            let vivianNotificationMessage;
            /** @type {Message<boolean>} */
            let astridNotificationMessage;
            /** @type {Message<boolean>} */
            let neroNotificationMessage;
            /** @type {Message<boolean>} */
            let asukaNotificationMessage;
            /** @type {Message<boolean>} */
            let lunaNotificationMessage;
            /** @type {Message<boolean>} */
            let kiaraNotificationMessage;
            /** @type {Message<boolean>} */
            let amadeusNotificationMessage;
            const plagueDoctorMaskIconURL = 'https://i.imgur.com/ajqKX5z.png';

            /**
             * @param {Player} player
             * @param {string} messageText
             * @param {TextChannel} [channel]
             */
            const sendPlayerMessage = async (player, messageText, channel) => {
                message = discord.createPlayerMessage(player, messageText, channel);
                messageHandler.processIncomingMessage(game, message);
                await messageHandler.sendQueuedMessages(game);
                kyraSpectateMessage = kyra.spectateChannel.messages.cache.first();
                vivianSpectateMessage = vivian.spectateChannel.messages.cache.first();
                astridSpectateMessage = astrid.spectateChannel.messages.cache.first();
                neroSpectateMessage = nero.spectateChannel.messages.cache.first();
                asukaSpectateMessage = asuka.spectateChannel.messages.cache.first();
                lunaSpectateMessage = luna.spectateChannel.messages.cache.first();
                kiaraSpectateMessage = kiara.spectateChannel.messages.cache.first();
                amadeusSpectateMessage = amadeus.spectateChannel.messages.cache.first();
                kyraNotificationMessage = kyra.notificationChannel.messages.cache.first();
                vivianNotificationMessage = vivian.notificationChannel.messages.cache.first();
                astridNotificationMessage = astrid.notificationChannel.messages.cache.first();
                neroNotificationMessage = nero.notificationChannel.messages.cache.first();
                asukaNotificationMessage = asuka.notificationChannel.messages.cache.first();
                lunaNotificationMessage = luna.notificationChannel.messages.cache.first();
                kiaraNotificationMessage = kiara.notificationChannel.messages.cache.first();
                amadeusNotificationMessage = amadeus.notificationChannel.messages.cache.first();
            };

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
                kyra.inflict(concealed);
                kyra.displayName = "an individual wearing a PLAGUE DOCTOR MASK";
                kyra.voiceString = "a deep modulated voice";
                kyra.displayIcon = plagueDoctorMaskIconURL;
            });

            beforeEach(() => {
                performSaySpy = vi.spyOn(SayAction.prototype, 'performSay');
            });

            afterEach(() => {
                performSaySpy.mockRestore();
            });

            describe('OOC messages are not communicated to other rooms', () => {
                test('OOC message does not solve voice puzzle', async () => {
                    const performSolveSpy = vi.spyOn(SolveAction.prototype, 'performSolve');
                    await sendPlayerMessage(vivian, "( unlock the door");
                    expect(performSolveSpy).not.toHaveBeenCalled();
                    performSolveSpy.mockRestore();
                });

                test('OOC message is not communicated to neighboring rooms', async () => {
                    astrid.inflict(acuteHearing);
                    await sendPlayerMessage(kiara, "( HELLO?");
                    for (const exit of kiara.location.exitCollection.values()) {
                        expect(exit.dest.channel.messages.cache).toHaveSize(0);
                        for (const occupant of exit.dest.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    }
                    astrid.cure(acuteHearing);
                });

                test('OOC message is not communicated to audio monitoring rooms', async () => {
                    const audioMonitoringRooms = [lobby, breakRoom, commandCenter];
                    await sendPlayerMessage(kiara, "( HELLO?");
                    for (const audioMonitoringRoom of audioMonitoringRooms) {
                        expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const occupant of audioMonitoringRoom.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    }
                });

                test('OOC message is not communicated to receivers', async () => {
                    const receivers = [nero, qm];
                    await sendPlayerMessage(nero, "( HELLO?");
                    for (const receiver of receivers) {
                        expect(receiver.location.channel.messages.cache).toHaveSize(0);
                        for (const occupant of receiver.location.occupants) {
                            if (occupant.isNPC) continue;
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    }
                });
            });

            describe('dialog is not communicated to or from neighboring room if conditions are not met', () => {
                beforeAll(() => {
                    nero.cure(receiver);
                    vivian.inflict(acuteHearing);
                });

                afterAll(() => {
                    nero.inflict(receiver);
                    vivian.cure(acuteHearing);
                });

                test('dialog is not communicated to neighboring room with `soundproof` tag', async () => {
                    expect(nero.location.id).toBe(breakRoom.id);
                    await sendPlayerMessage(nero, "HELLO?");
                    expect(gmOffice.channel.messages.cache).toHaveSize(0);
                    for (const occupant of gmOffice.occupants) {
                        if (occupant.isNPC) continue;
                        expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                        expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                    }
                });

                test('dialog is not communicated from room with `soundproof` tag to neighboring rooms', async () => {
                    expect(vivian.location.id).toBe(gmOffice.id);
                    await sendPlayerMessage(vivian, "HELLO?");
                    expect(breakRoom.channel.messages.cache).toHaveSize(0);
                    for (const occupant of breakRoom.occupants) {
                        if (occupant.isNPC) continue;
                        expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                        expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                    }
                });

                test('dialog is not communicated to neighboring room with no occupants', async () => {
                    courtyard.removePlayer(asuka);
                    courtyard.removePlayer(luna);
                    expect(courtyard.occupants).toHaveLength(0);
                    nero.location.removePlayer(nero);
                    lobby.addPlayer(nero);
                    await sendPlayerMessage(nero, "HELLO OUT THERE!");
                    expect(courtyard.channel.messages.cache).toHaveSize(0);
                    nero.location.removePlayer(nero);
                    breakRoom.addPlayer(nero);
                    courtyard.addPlayer(asuka);
                    courtyard.addPlayer(luna);
                });
            });

            describe('dialog is communicated to room occupants', () => {
                describe('two players in room who do not recognize each other', () => {
                    test('standard dialog is communicated to spectate channels', async () => {
                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of luna.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                        expect(asukaSpectateMessage).toBeWebhookMessage();
                        expect(asukaSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "Oh, hello!");

                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(luna);
                        hidingSpot.addPlayer(asuka);
                        luna.inflict(hidden);
                        asuka.inflict(hidden);

                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                        expect(asukaNotificationMessage.content).toBe(`Luna says "Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                        expect(asukaSpectateMessage).toBeWebhookMessage();
                        expect(asukaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

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

                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                        expect(asukaNotificationMessage.content).toBe(`An individual wearing a MASK says "Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                        expect(asukaSpectateMessage).toBeWebhookMessage();
                        expect(asukaSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "Oh, hello!");

                        hidingSpot.removePlayer(luna);
                        hidingSpot.removePlayer(asuka);
                        luna.cure(hidden);
                        asuka.cure(hidden);
                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        asuka.inflict(deaf);

                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        asuka.inflict(asleep);

                        await sendPlayerMessage(luna, "Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('luna is mimicking asuka', async () => {
                            luna.voiceString = "Asuka";

                            await sendPlayerMessage(luna, "Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                            expect(asukaSpectateMessage).not.toBeWebhookMessage();
                            expect(asukaSpectateMessage.content).toBe(`Luna says "Oh, hello!" in your voice!`);

                            luna.voiceString = luna.originalVoiceString;
                        });

                        test('asuka has `no sight` behavior attribute', async () => {
                            asuka.inflict(blind);

                            await sendPlayerMessage(luna, "Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                            expect(asukaSpectateMessage).not.toBeWebhookMessage();
                            expect(asukaSpectateMessage.content).toBe(`Someone in the room with a gentle voice says "Oh, hello!"`);

                            asuka.cure(blind);
                        });

                        test('asuka has `no sight` behavior attribute and luna is mimicking asuka', async () => {
                            asuka.inflict(blind);
                            luna.voiceString = "Asuka";

                            await sendPlayerMessage(luna, "Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                            expect(asukaSpectateMessage).not.toBeWebhookMessage();
                            expect(asukaSpectateMessage.content).toBe(`Someone in the room says "Oh, hello!" in your voice!`);

                            asuka.cure(blind);
                            luna.voiceString = luna.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('asuka has `hear room` behavior attribute', async () => {
                            asuka.inflict(concealed);

                            await sendPlayerMessage(luna, "Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Luna says "Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                            expect(asukaSpectateMessage).toBeWebhookMessage();
                            expect(asukaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            asuka.cure(concealed);
                        });

                        test('asuka has `hear room` behavior attribute and cannot see luna', async () => {
                            luna.inflict(hidden);
                            asuka.inflict(concealed);

                            await sendPlayerMessage(luna, "Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Oh, hello!");

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Someone in the room with a gentle voice says "Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(1);
                            expect(asukaSpectateMessage).toBeWebhookMessage();
                            expect(asukaSpectateMessage).toBeMessageWith("Someone in the room with a gentle voice", game.settings.hiddenIconURL, "Oh, hello!");

                            luna.cure(hidden);
                            asuka.cure(concealed);
                        });
                    });
                });

                describe('OOC message for two players in room who do not recognize each other', () => {
                    test('OOC dialog is not communicated to spectate channels', async () => {
                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                        for (const occupant of luna.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(luna);
                        hidingSpot.addPlayer(asuka);
                        luna.inflict(hidden);
                        asuka.inflict(hidden);

                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                        expect(asukaNotificationMessage.content).toBe(`Luna says "( Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

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

                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                        expect(asukaNotificationMessage.content).toBe(`An individual wearing a MASK says "( Oh, hello!"`);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        hidingSpot.removePlayer(luna);
                        hidingSpot.removePlayer(asuka);
                        luna.cure(hidden);
                        asuka.cure(hidden);
                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        asuka.inflict(deaf);

                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        asuka.inflict(asleep);

                        await sendPlayerMessage(luna, "( Oh, hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('luna is mimicking asuka', async () => {
                            luna.voiceString = "Asuka";

                            await sendPlayerMessage(luna, "( Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                            luna.voiceString = luna.originalVoiceString;
                        });

                        test('asuka has `no sight` behavior attribute', async () => {
                            asuka.inflict(blind);

                            await sendPlayerMessage(luna, "( Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Someone in the room with a gentle voice says "( Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                            asuka.cure(blind);
                        });

                        test('asuka has `no sight` behavior attribute and luna is mimicking asuka', async () => {
                            asuka.inflict(blind);
                            luna.voiceString = "Asuka";

                            await sendPlayerMessage(luna, "( Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Someone in the room says "( Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                            asuka.cure(blind);
                            luna.voiceString = luna.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('asuka has `hear room` behavior attribute', async () => {
                            asuka.inflict(concealed);

                            await sendPlayerMessage(luna, "( Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Luna says "( Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                            asuka.cure(concealed);
                        });

                        test('asuka has `hear room` behavior attribute and cannot see luna', async () => {
                            luna.inflict(hidden);
                            asuka.inflict(concealed);

                            await sendPlayerMessage(luna, "( Oh, hello!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(asuka.notificationChannel.messages.cache).toHaveSize(1);
                            expect(asukaNotificationMessage.content).toBe(`Someone in the room with a gentle voice says "( Oh, hello!"`);
                            expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

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
                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of kiara.location.occupants) {;
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        kiara.displayName = "an individual wearing a MASK";
                        kiara.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).toBeWebhookMessage();
                        expect(kiaraSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "Bonjour!");

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                        expect(astridNotificationMessage.content).toBe(`An individual wearing a MASK, with a pretty voice you recognize as Kiara's, says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                        expect(astridSpectateMessage).toBeWebhookMessage();
                        expect(astridSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "Bonjour!");

                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(kiara);
                        hidingSpot.addPlayer(astrid);
                        kiara.inflict(hidden);
                        astrid.inflict(hidden);

                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).toBeWebhookMessage();
                        expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                        expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                        expect(astridSpectateMessage).toBeWebhookMessage();
                        expect(astridSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

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

                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).toBeWebhookMessage();
                        expect(kiaraSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "Bonjour!");

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                        expect(astridNotificationMessage.content).toBe(`An individual wearing a MASK, with a pretty voice you recognize as Kiara's, says "Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                        expect(astridSpectateMessage).toBeWebhookMessage();
                        expect(astridSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "Bonjour!");

                        hidingSpot.removePlayer(kiara);
                        hidingSpot.removePlayer(astrid);
                        kiara.cure(hidden);
                        astrid.cure(hidden);
                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        astrid.inflict(deaf);

                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).toBeWebhookMessage();
                        expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        astrid.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        astrid.inflict(asleep);

                        await sendPlayerMessage(kiara, "Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).toBeWebhookMessage();
                        expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        astrid.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('kiara is mimicking astrid', async () => {
                            kiara.voiceString = "Astrid";

                            await sendPlayerMessage(kiara, "Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).not.toBeWebhookMessage();
                            expect(astridSpectateMessage.content).toBe(`Kiara says "Bonjour!" in your voice!`);

                            kiara.voiceString = kiara.originalVoiceString;
                        });

                        test('astrid has `no sight` behavior attribute', async () => {
                            astrid.inflict(blind);

                            await sendPlayerMessage(kiara, "Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).not.toBeWebhookMessage();
                            expect(astridSpectateMessage.content).toBe(`Kiara says "Bonjour!"`);

                            astrid.cure(blind);
                        });

                        test('astrid has `no sight` behavior attribute and kiara is mimicking astrid', async () => {
                            astrid.inflict(blind);
                            kiara.voiceString = "Astrid";

                            await sendPlayerMessage(kiara, "Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).not.toBeWebhookMessage();
                            expect(astridSpectateMessage.content).toBe(`Someone in the room says "Bonjour!" in your voice!`);

                            astrid.cure(blind);
                            kiara.voiceString = kiara.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('astrid has `hear room` behavior attribute', async () => {
                            astrid.inflict(concealed);

                            await sendPlayerMessage(kiara, "Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            astrid.cure(concealed);
                        });

                        test('astrid has `hear room` behavior attribute and cannot see kiara', async () => {
                            kiara.inflict(hidden);
                            astrid.inflict(concealed);

                            await sendPlayerMessage(kiara, "Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "Bonjour!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Kiara says "Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", game.settings.hiddenIconURL, "Bonjour!");

                            kiara.cure(hidden);
                            astrid.cure(concealed);
                        });
                    });
                });

                describe('OOC message for two players in room who do recognize each other', () => {
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

                    test('OOC dialog is not communicated to spectate channels', async () => {
                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                        for (const occupant of kiara.location.occupants) {;
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        kiara.displayName = "an individual wearing a MASK";
                        kiara.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                        hidingSpot.addPlayer(kiara);
                        hidingSpot.addPlayer(astrid);
                        kiara.inflict(hidden);
                        astrid.inflict(hidden);

                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                        expect(astridNotificationMessage.content).toBe(`Kiara says "( Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

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

                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                        expect(astridNotificationMessage.content).toBe(`An individual wearing a MASK says "( Bonjour!"`);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        hidingSpot.removePlayer(kiara);
                        hidingSpot.removePlayer(astrid);
                        kiara.cure(hidden);
                        astrid.cure(hidden);
                        kiara.displayName = kiara.name;
                        kiara.displayIcon = null;
                    });

                    test('standard dialog is not communicated to `no hearing` player', async () => {
                        astrid.inflict(deaf);

                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        astrid.cure(deaf);
                    });

                    test('standard dialog is not communicated to `unconscious` player', async () => {
                        astrid.inflict(asleep);

                        await sendPlayerMessage(kiara, "( Bonjour!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                        expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                        expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                        astrid.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        test('kiara is mimicking astrid', async () => {
                            kiara.voiceString = "Astrid";

                            await sendPlayerMessage(kiara, "( Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            kiara.voiceString = kiara.originalVoiceString;
                        });

                        test('astrid has `no sight` behavior attribute', async () => {
                            astrid.inflict(blind);

                            await sendPlayerMessage(kiara, "( Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Kiara says "( Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);                            

                            astrid.cure(blind);
                        });

                        test('astrid has `no sight` behavior attribute and kiara is mimicking astrid', async () => {
                            astrid.inflict(blind);
                            kiara.voiceString = "Astrid";

                            await sendPlayerMessage(kiara, "( Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Someone in the room says "( Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);                            

                            astrid.cure(blind);
                            kiara.voiceString = kiara.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('astrid has `hear room` behavior attribute', async () => {
                            astrid.inflict(concealed);

                            await sendPlayerMessage(kiara, "( Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Kiara says "( Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            astrid.cure(concealed);
                        });

                        test('astrid has `hear room` behavior attribute and cannot see kiara', async () => {
                            kiara.inflict(hidden);
                            astrid.inflict(concealed);

                            await sendPlayerMessage(kiara, "( Bonjour!");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`Kiara says "( Bonjour!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            kiara.cure(hidden);
                            astrid.cure(concealed);
                        });
                    });
                });

                describe('player with `acute hearing` behavior attribute in room with whisper', () => {
                    /** @type {Whisper} */
                    let whisperLunaKiara;

                    beforeAll(async () => {
                        astrid.inflict(acuteHearing);
                        luna.location.removePlayer(luna);
                        astrid.location.removePlayer(astrid);
                        kiara.location.removePlayer(kiara);
                        courtyard.addPlayer(luna);
                        courtyard.addPlayer(astrid);
                        courtyard.addPlayer(kiara);
                        whisperLunaKiara = await game.entityLoader.createWhisper([luna, kiara]);
                    });

                    afterAll(() => {
                        astrid.cure(acuteHearing);
                        astrid.removeFromWhispers('');
                        kiara.removeFromWhispers('');
                        luna.removeFromWhispers('');
                        courtyard.removePlayer(astrid);
                        courtyard.removePlayer(kiara);
                        f1h1.addPlayer(kiara);
                        f1h2.addPlayer(astrid);
                    });

                    describe('player overhears whisper from someone she does not recognize', async () => {
                        test('standard whisper is communicated to spectate channels and notification channel', async () => {
                            await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Luna whisper "Hello!" to Kiara.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");
                        });

                        test('OOC whisper is not communicated to spectate channels or notification channel', async () => {
                            await sendPlayerMessage(luna, "( Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);
                        });

                        test('display name of speaker does not match her name', async () => {
                            luna.displayName = "an individual wearing a MASK";
                            luna.displayIcon = game.settings.defaultConcealedIconURL;

                            await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Kiara):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "-# *(Whispered to Kiara):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear an individual wearing a MASK whisper "Hello!" to Kiara.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "-# *(Whispered to Kiara):*\nHello!");

                            luna.displayName = luna.name;
                            luna.displayIcon = null;
                        });

                        test('acute hearing player cannot see whispering players because they are hidden', async () => {
                            const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                            await hidingSpot.addPlayer(luna);
                            await hidingSpot.addPlayer(kiara);
                            luna.inflict(hidden);
                            kiara.inflict(hidden);

                            await sendPlayerMessage(luna, "Hello!", hidingSpot.whisper.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara in the SHED):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara in the SHED):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear someone in the room with a gentle voice whisper "Hello!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Someone in the room with a gentle voice", game.settings.hiddenIconURL, "-# *(Whispered):*\nHello!");

                            hidingSpot.removePlayer(luna);
                            hidingSpot.removePlayer(kiara);
                            luna.cure(hidden);
                            kiara.cure(hidden);
                            await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                            whisperLunaKiara = await game.entityLoader.createWhisper([luna, kiara]);
                        });

                        test('acute hearing player cannot see whispering player because she is hidden', async () => {
                            const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                            await hidingSpot.addPlayer(luna);
                            luna.inflict(hidden);

                            await sendPlayerMessage(luna, "Hello!", hidingSpot.whisper.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered in the SHED):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(0);

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear someone in the room with a gentle voice whisper "Hello!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Someone in the room with a gentle voice", game.settings.hiddenIconURL, "-# *(Whispered):*\nHello!");

                            hidingSpot.removePlayer(luna);
                            luna.cure(hidden);
                            await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                            whisperLunaKiara = await game.entityLoader.createWhisper([luna, kiara]);
                        });

                        test('`no hearing` behavior attribute overrides `acute hearing`', async () => {
                            astrid.inflict(deaf);

                            await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            astrid.cure(deaf);
                        });

                        test('`unconscious` behavior attribute overrides `acute hearing`', async () => {
                            astrid.inflict(asleep);

                            await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            astrid.cure(asleep);
                        });

                        test('`acute hearing` behavior attribute does not send notification to player when she is included in the whisper', async () => {
                            kiara.inflict(acuteHearing);

                            await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Luna whisper "Hello!" to Kiara.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                            kiara.cure(acuteHearing);
                        });
                        
                        describe('player notification takes priority', async () => {
                            test('luna is mimicking astrid', async () => {
                                luna.voiceString = "Astrid";

                                await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                                expect(kiaraNotificationMessage.content).toBe(`Luna, with a peppy voice you recognize as Astrid's, whispers "Hello!"`);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Luna (Astrid)", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear Luna whisper "Hello!" to Kiara in your voice!`);

                                luna.voiceString = luna.originalVoiceString;
                            });

                            test('astrid has `no sight` behavior attribute', async () => {
                                astrid.inflict(blind);

                                await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear someone in the room with a gentle voice whisper "Hello!"`);

                                astrid.cure(blind);
                            });

                            test('astrid has `no sight` behavior attribute and luna is mimicking astrid', async () => {
                                astrid.inflict(blind);
                                luna.voiceString = "Astrid";

                                await sendPlayerMessage(luna, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                                expect(kiaraNotificationMessage.content).toBe(`Luna, with a peppy voice you recognize as Astrid's, whispers "Hello!"`);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Luna (Astrid)", luna.member.avatarURL(), "-# *(Whispered to Kiara):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear someone in the room whisper "Hello!" in your voice!`);

                                astrid.cure(blind);
                                luna.voiceString = luna.originalVoiceString;
                            });
                        });
                    });

                    describe('player overhears whisper from someone she does recognize', async () => {
                        test('standard whisper is communicated to spectate channels and notification channel', async () => {
                            await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Kiara whisper "Hello!" to Luna.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");
                        });

                        test('display name of speaker does not match her name', async () => {
                            kiara.displayName = "an individual wearing a MASK";
                            kiara.displayIcon = game.settings.defaultConcealedIconURL;

                            await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear an individual wearing a MASK, with a pretty voice you recognize as Kiara's, whisper "Hello!" to Luna.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("An individual wearing a MASK (Kiara)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna):*\nHello!");

                            kiara.displayName = kiara.name;
                            kiara.displayIcon = null;
                        });

                        test('acute hearing player cannot see whispering players because they are hidden', async () => {
                            const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                            await hidingSpot.addPlayer(luna);
                            await hidingSpot.addPlayer(kiara);
                            luna.inflict(hidden);
                            kiara.inflict(hidden);

                            await sendPlayerMessage(kiara, "Hello!", hidingSpot.whisper.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna in the SHED):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna in the SHED):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Kiara whisper "Hello!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", game.settings.hiddenIconURL, "-# *(Whispered):*\nHello!");

                            hidingSpot.removePlayer(luna);
                            hidingSpot.removePlayer(kiara);
                            luna.cure(hidden);
                            kiara.cure(hidden);
                            await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                            whisperLunaKiara = await game.entityLoader.createWhisper([luna, kiara]);
                        });

                        test('acute hearing player cannot see whispering player because she is hidden', async () => {
                            const hidingSpot = game.entityFinder.getFixture("SHED", "courtyard").hidingSpot;
                            await hidingSpot.addPlayer(kiara);
                            kiara.inflict(hidden);

                            await sendPlayerMessage(kiara, "Hello!", hidingSpot.whisper.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered in the SHED):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Kiara whisper "Hello!"`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", game.settings.hiddenIconURL, "-# *(Whispered):*\nHello!");

                            hidingSpot.removePlayer(kiara);
                            kiara.cure(hidden);
                            await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                            whisperLunaKiara = await game.entityLoader.createWhisper([luna, kiara]);
                        });

                        test('`no hearing` behavior attribute overrides `acute hearing`', async () => {
                            astrid.inflict(deaf);

                            await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            astrid.cure(deaf);
                        });

                        test('`unconscious` behavior attribute overrides `acute hearing`', async () => {
                            astrid.inflict(asleep);

                            await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(0);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(0);

                            astrid.cure(asleep);
                        });

                        test('`acute hearing` behavior attribute does not send notification to player when she is included in the whisper', async () => {
                            luna.inflict(acuteHearing);

                            await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                            expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                            expect(lunaSpectateMessage).toBeWebhookMessage();
                            expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                            expect(kiaraSpectateMessage).toBeWebhookMessage();
                            expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                            expect(astridNotificationMessage.content).toBe(`You overhear Kiara whisper "Hello!" to Luna.`);
                            expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                            expect(astridSpectateMessage).toBeWebhookMessage();
                            expect(astridSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                            luna.cure(acuteHearing);
                        });
                        
                        describe('player notification takes priority', async () => {
                            test('kiara is mimicking astrid', async () => {
                                kiara.voiceString = "Astrid";

                                await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear Kiara whisper "Hello!" to Luna in your voice!`);

                                kiara.voiceString = kiara.originalVoiceString;
                            });

                            test('astrid has `no sight` behavior attribute', async () => {
                                astrid.inflict(blind);

                                await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear Kiara whisper "Hello!"`);

                                astrid.cure(blind);
                            });

                            test('astrid has `no sight` behavior attribute and kiara is mimicking astrid', async () => {
                                astrid.inflict(blind);
                                kiara.voiceString = "Astrid";

                                await sendPlayerMessage(kiara, "Hello!", whisperLunaKiara.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                                expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                                expect(kiaraSpectateMessage).toBeWebhookMessage();
                                expect(kiaraSpectateMessage).toBeMessageWith("Kiara", kiara.member.avatarURL(), "-# *(Whispered to Luna):*\nHello!");

                                expect(astrid.notificationChannel.messages.cache).toHaveSize(1);
                                expect(astrid.spectateChannel.messages.cache).toHaveSize(1);
                                expect(astridSpectateMessage).not.toBeWebhookMessage();
                                expect(astridSpectateMessage.content).toBe(`You overhear someone in the room whisper "Hello!" in your voice!`);

                                astrid.cure(blind);
                                kiara.voiceString = kiara.originalVoiceString;
                            });
                        });
                    });
                });
            });

            describe('dialog is communicated to whisper players', () => {
                /** @type {Whisper} */
                let whisperAmadeusLuna;

                beforeAll(async () => {
                    amadeus.location.removePlayer(amadeus);
                    luna.location.removePlayer(luna);
                    lobby.addPlayer(amadeus);
                    lobby.addPlayer(luna);
                    whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                });

                afterAll(() => {
                    amadeus.removeFromWhispers('');
                    luna.removeFromWhispers('');
                    commandCenter.addPlayer(amadeus);
                });

                describe('player in whisper does not recognize the other', () => {
                    test('whispered dialog is communicated to spectate channels', async () => {
                        await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of amadeus.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");
                        }
                    });

                    test('display name of speaker does not match its name', async () => {
                        amadeus.displayName = "an individual wearing a MASK";
                        amadeus.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("An individual wearing a MASK (Amadeus)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna):*\nHello.");

                        amadeus.displayName = amadeus.name;
                        amadeus.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        await hidingSpot.addPlayer(luna);
                        amadeus.inflict(hidden);
                        luna.inflict(hidden);

                        await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                        hidingSpot.removePlayer(amadeus);
                        hidingSpot.removePlayer(luna);
                        amadeus.cure(hidden);
                        luna.cure(hidden);
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('player is hidden alone', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        amadeus.inflict(hidden);

                        await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered in the RECEPTION DESK):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        hidingSpot.removePlayer(amadeus);
                        amadeus.cure(hidden);
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('players are hidden together and display name of speaker does not match its name', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        await hidingSpot.addPlayer(luna);
                        amadeus.inflict(hidden);
                        luna.inflict(hidden);
                        amadeus.displayName = "an individual wearing a MASK";
                        amadeus.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("An individual wearing a MASK (Amadeus)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK", game.settings.defaultConcealedIconURL, "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                        hidingSpot.removePlayer(amadeus);
                        hidingSpot.removePlayer(luna);
                        amadeus.cure(hidden);
                        luna.cure(hidden);
                        amadeus.displayName = amadeus.name;
                        amadeus.displayIcon = null;
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('whispered dialog is not communicated to `no hearing` player', async () => {
                        luna.inflict(deaf);

                        await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        luna.cure(deaf);
                    });

                    test('whispered dialog is not communicated to `unconscious` player', async () => {
                        luna.inflict(asleep);

                        await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        luna.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        describe('players are not hidden', () => {
                            test('amadeus is mimicking luna', async () => {
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Amadeus whispers "Hello." in your voice!`);

                                amadeus.voiceString = amadeus.originalVoiceString;
                            });

                            test('luna has `no sight` behavior attribute', async () => {
                                luna.inflict(blind);

                                await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Someone with a neutral voice whispers "Hello."`);

                                luna.cure(blind);
                            });

                            test('luna has `no sight` behavior attribute and amadeus is mimicking luna', async () => {
                                luna.inflict(blind);
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Someone whispers "Hello." in your voice!`);

                                luna.cure(blind);
                                amadeus.voiceString = amadeus.originalVoiceString;
                            });
                        });

                        describe('players are hidden', () => {
                            /** @type {HidingSpot} */
                            let hidingSpot;

                            beforeAll(async () => {
                                hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                                await hidingSpot.addPlayer(amadeus);
                                await hidingSpot.addPlayer(luna);
                                amadeus.inflict(hidden);
                                luna.inflict(hidden);
                            });

                            afterAll(async () => {
                                hidingSpot.removePlayer(amadeus);
                                hidingSpot.removePlayer(luna);
                                amadeus.cure(hidden);
                                luna.cure(hidden);
                                await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                                whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                            });

                            test('players are hidden together and amadeus is mimicking luna', async () => {
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Amadeus whispers "Hello." in the RECEPTION DESK in your voice!`);

                                amadeus.voiceString = amadeus.originalVoiceString;
                            });

                            test('players are hidden together and luna has `no sight` behavior attribute', async () => {
                                luna.inflict(blind);

                                await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Someone in the RECEPTION DESK with a neutral voice whispers "Hello."`);

                                luna.cure(blind);
                            });

                            test('players are hidden together and luna has `no sight` behavior attribute and amadeus is mimicking luna', async () => {
                                luna.inflict(blind);
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).toBeWebhookMessage();
                                expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "-# *(Whispered to Luna in the RECEPTION DESK):*\nHello.");

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).not.toBeWebhookMessage();
                                expect(lunaSpectateMessage.content).toBe(`Someone in the RECEPTION DESK whispers "Hello." in your voice!`);

                                luna.cure(blind);
                                amadeus.voiceString = amadeus.originalVoiceString;
                            });
                        });
                    });
                });

                describe('OOC message for player in whisper does not recognize the other', () => {
                    test('OOC whispered dialog is not communicated to spectate channels', async () => {
                        await sendPlayerMessage(amadeus, "( Hello.", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                        for (const occupant of amadeus.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });
                    
                    describe('player notification takes priority', async () => {
                        describe('players are not hidden', () => {
                            test('amadeus is mimicking luna', async () => {
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "( Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                amadeus.voiceString = amadeus.originalVoiceString;
                            });

                            test('luna has `no sight` behavior attribute', async () => {
                                luna.inflict(blind);

                                await sendPlayerMessage(amadeus, "( Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(lunaNotificationMessage.content).toBe(`Someone with a neutral voice whispers "( Hello."`);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                luna.cure(blind);
                            });

                            test('luna has `no sight` behavior attribute and amadeus is mimicking luna', async () => {
                                luna.inflict(blind);
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "( Hello.", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(lunaNotificationMessage.content).toBe(`Someone whispers "( Hello."`);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                luna.cure(blind);
                                amadeus.voiceString = amadeus.originalVoiceString;
                            });
                        });

                        describe('players are hidden', () => {
                            /** @type {HidingSpot} */
                            let hidingSpot;

                            beforeAll(async () => {
                                hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                                await hidingSpot.addPlayer(amadeus);
                                await hidingSpot.addPlayer(luna);
                                amadeus.inflict(hidden);
                                luna.inflict(hidden);
                            });

                            afterAll(async () => {
                                hidingSpot.removePlayer(amadeus);
                                hidingSpot.removePlayer(luna);
                                amadeus.cure(hidden);
                                luna.cure(hidden);
                                await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                                whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                            });

                            test('players are hidden together and amadeus is mimicking luna', async () => {
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "( Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                amadeus.voiceString = amadeus.originalVoiceString;
                            });

                            test('players are hidden together and luna has `no sight` behavior attribute', async () => {
                                luna.inflict(blind);

                                await sendPlayerMessage(amadeus, "( Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(lunaNotificationMessage.content).toBe(`Someone in the RECEPTION DESK with a neutral voice whispers "( Hello."`);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                luna.cure(blind);
                            });

                            test('players are hidden together and luna has `no sight` behavior attribute and amadeus is mimicking luna', async () => {
                                luna.inflict(blind);
                                amadeus.voiceString = "Luna";

                                await sendPlayerMessage(amadeus, "( Hello.", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(1);
                                expect(lunaNotificationMessage.content).toBe(`Someone in the RECEPTION DESK whispers "( Hello."`);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                luna.cure(blind);
                                amadeus.voiceString = amadeus.originalVoiceString;
                            });
                        });
                    });
                });

                describe('player in whisper does recognize the other', () => {
                    test('whispered dialog is communicated to spectate channels', async () => {
                        await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);
                        for (const occupant of amadeus.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeusNotificationMessage.content).toBe(`An individual wearing a MASK, with a gentle voice you recognize as Luna's, whispers "Oh, hello!"`);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Amadeus):*\nOh, hello!");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Amadeus):*\nOh, hello!");

                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('players are hidden together', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        await hidingSpot.addPlayer(luna);
                        amadeus.inflict(hidden);
                        luna.inflict(hidden);

                        await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                        hidingSpot.removePlayer(amadeus);
                        hidingSpot.removePlayer(luna);
                        amadeus.cure(hidden);
                        luna.cure(hidden);
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('player is hidden alone', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(luna);
                        luna.inflict(hidden);

                        await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered in the RECEPTION DESK):*\nOh, hello!");

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                        hidingSpot.removePlayer(luna);
                        luna.cure(hidden);
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('players are hidden together and display name of speaker does not match her name', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        await hidingSpot.addPlayer(luna);
                        amadeus.inflict(hidden);
                        luna.inflict(hidden);
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(2);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeusNotificationMessage.content).toBe(`An individual wearing a MASK, with a gentle voice you recognize as Luna's, whispers "Oh, hello!" in the RECEPTION DESK.`);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).toBeWebhookMessage();
                        expect(amadeusSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("An individual wearing a MASK (Luna)", game.settings.defaultConcealedIconURL, "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                        hidingSpot.removePlayer(amadeus);
                        hidingSpot.removePlayer(luna);
                        amadeus.cure(hidden);
                        luna.cure(hidden);
                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });

                    test('whispered dialog is not communicated to `no hearing` player', async () => {
                        amadeus.inflict(deaf);

                        await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                        amadeus.cure(deaf);
                    });

                    test('whispered dialog is not communicated to `unconscious` player', async () => {
                        amadeus.inflict(asleep);

                        await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                        amadeus.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        describe('players are not hidden', () => {
                            test('luna is mimicking amadeus', async () => {
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Luna whispers "Oh, hello!" in your voice!`);

                                luna.voiceString = luna.originalVoiceString;
                            });

                            test('amadeus has `no sight` behavior attribute', async () => {
                                amadeus.inflict(blind);

                                await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Luna whispers "Oh, hello!"`);

                                amadeus.cure(blind);
                            });

                            test('amadeus has `no sight` behavior attribute and luna is mimicking amadeus', async () => {
                                amadeus.inflict(blind);
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Someone whispers "Oh, hello!" in your voice!`);

                                amadeus.cure(blind);
                                luna.voiceString = luna.originalVoiceString;
                            });
                        });

                        describe('players are hidden', () => {
                            /** @type {HidingSpot} */
                            let hidingSpot;

                            beforeAll(async () => {
                                hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                                await hidingSpot.addPlayer(amadeus);
                                await hidingSpot.addPlayer(luna);
                                amadeus.inflict(hidden);
                                luna.inflict(hidden);
                            });

                            afterAll(async () => {
                                hidingSpot.removePlayer(amadeus);
                                hidingSpot.removePlayer(luna);
                                amadeus.cure(hidden);
                                luna.cure(hidden);
                                await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                                whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                            });

                            test('players are hidden together and luna is mimicking amadeus', async () => {
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Luna whispers "Oh, hello!" in the RECEPTION DESK in your voice!`);

                                luna.voiceString = luna.originalVoiceString;
                            });

                            test('players are hidden together and amadeus has `no sight` behavior attribute', async () => {
                                amadeus.inflict(blind);

                                await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Luna whispers "Oh, hello!" in the RECEPTION DESK.`);

                                amadeus.cure(blind);
                            });

                            test('players are hidden together and amadeus has `no sight` behavior attribute and luna is mimicking amadeus', async () => {
                                amadeus.inflict(blind);
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                                expect(lunaSpectateMessage).toBeWebhookMessage();
                                expect(lunaSpectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "-# *(Whispered to Amadeus in the RECEPTION DESK):*\nOh, hello!");

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                                expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                                expect(amadeusSpectateMessage.content).toBe(`Someone in the RECEPTION DESK whispers "Oh, hello!" in your voice!`);

                                amadeus.cure(blind);
                                luna.voiceString = luna.originalVoiceString;
                            });
                        });
                    });
                });

                describe('OOC message for player in whisper does recognize the other', () => {
                    test('OOC whispered dialog is not communicated to spectate channels', async () => {
                        await sendPlayerMessage(luna, "( Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);
                        for (const occupant of amadeus.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "( Oh, hello!", whisperAmadeusLuna.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                    });

                    test('players are hidden together and display name of speaker does not match her name', async () => {
                        const hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                        await hidingSpot.addPlayer(amadeus);
                        await hidingSpot.addPlayer(luna);
                        amadeus.inflict(hidden);
                        luna.inflict(hidden);
                        luna.displayName = "an individual wearing a MASK";
                        luna.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(luna, "( Oh, hello!", hidingSpot.whisper.channel);
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                        hidingSpot.removePlayer(amadeus);
                        hidingSpot.removePlayer(luna);
                        amadeus.cure(hidden);
                        luna.cure(hidden);
                        luna.displayName = luna.name;
                        luna.displayIcon = null;
                        await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                        whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                    });
                    
                    describe('player notification takes priority', async () => {
                        describe('players are not hidden', () => {
                            test('luna is mimicking amadeus', async () => {
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "( Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                luna.voiceString = luna.originalVoiceString;
                            });

                            test('amadeus has `no sight` behavior attribute', async () => {
                                amadeus.inflict(blind);

                                await sendPlayerMessage(luna, "( Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeusNotificationMessage.content).toBe(`Luna whispers "( Oh, hello!"`);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                amadeus.cure(blind);
                            });

                            test('amadeus has `no sight` behavior attribute and luna is mimicking amadeus', async () => {
                                amadeus.inflict(blind);
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "( Oh, hello!", whisperAmadeusLuna.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeusNotificationMessage.content).toBe(`Someone whispers "( Oh, hello!"`);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                amadeus.cure(blind);
                                luna.voiceString = luna.originalVoiceString;
                            });
                        });

                        describe('players are hidden', () => {
                            /** @type {HidingSpot} */
                            let hidingSpot;

                            beforeAll(async () => {
                                hidingSpot = game.entityFinder.getFixture("RECEPTION DESK", "lobby").hidingSpot;
                                await hidingSpot.addPlayer(amadeus);
                                await hidingSpot.addPlayer(luna);
                                amadeus.inflict(hidden);
                                luna.inflict(hidden);
                            });

                            afterAll(async () => {
                                hidingSpot.removePlayer(amadeus);
                                hidingSpot.removePlayer(luna);
                                amadeus.cure(hidden);
                                luna.cure(hidden);
                                await game.entityLoader.deleteWhisper(hidingSpot.whisper);
                                whisperAmadeusLuna = await game.entityLoader.createWhisper([amadeus, luna]);
                            });

                            test('players are hidden together and luna is mimicking amadeus', async () => {
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "( Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                luna.voiceString = luna.originalVoiceString;
                            });

                            test('players are hidden together and amadeus has `no sight` behavior attribute', async () => {
                                amadeus.inflict(blind);

                                await sendPlayerMessage(luna, "( Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeusNotificationMessage.content).toBe(`Luna whispers "( Oh, hello!" in the RECEPTION DESK.`);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);

                                amadeus.cure(blind);
                            });

                            test('players are hidden together and amadeus has `no sight` behavior attribute and luna is mimicking amadeus', async () => {
                                amadeus.inflict(blind);
                                luna.voiceString = "Amadeus";

                                await sendPlayerMessage(luna, "( Oh, hello!", hidingSpot.whisper.channel);
                                expect(performSaySpy).toHaveBeenCalledTimes(1);
                                expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(0);

                                expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                                expect(luna.spectateChannel.messages.cache).toHaveSize(0);

                                expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                                expect(amadeusNotificationMessage.content).toBe(`Someone in the RECEPTION DESK whispers "( Oh, hello!"`);
                                expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);                                

                                amadeus.cure(blind);
                                luna.voiceString = luna.originalVoiceString;
                            });
                        });
                    });
                });
            });

            describe('dialog is communicated to neighboring rooms', () => {
                /** @type {Room[]} */
                let neighboringRooms;
                /** @type {Room[]} */
                let neighboringAudioSurveilledRooms;
                /** @type {Room[]} */
                let excludedAudioMonitoringRooms;
                /** @type {Room[]} */
                let audioMonitoringRooms;
                /** @type {Player[]} */
                let excludedPlayers;

                beforeAll(() => {
                    neighboringRooms = [f1h1, breakRoom];
                    neighboringAudioSurveilledRooms = [f1h1, breakRoom];
                    excludedAudioMonitoringRooms = [lobby, breakRoom]
                    audioMonitoringRooms = [commandCenter];
                    excludedPlayers = [vivian, asuka, luna];
                    lobby.removePlayer(asuka);
                    lobby.removePlayer(luna);
                });

                afterAll(() => {
                    lobby.addPlayer(asuka);
                    lobby.addPlayer(luna);
                });

                describe('shouted dialog is communicated to neighboring rooms', () => {
                    test('standard shouted dialog is narrated to neighboring rooms', async () => {
                        expect(lobby.occupants).toHaveLength(0);
                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid shouts "HELLO?" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Astrid shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kyraSpectateMessage).not.toBeWebhookMessage();
                        expect(kyraSpectateMessage.content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');

                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        astrid.displayName = "an individual wearing a MASK";
                        astrid.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid shouts "HELLO?" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Astrid shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kyraSpectateMessage).not.toBeWebhookMessage();
                        expect(kyraSpectateMessage.content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');

                        astrid.displayName = astrid.name;
                        astrid.displayIcon = null;
                    });

                    test('speaker is hidden', async () => {
                        astrid.inflict(hidden);

                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid shouts "HELLO?" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Astrid shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kyraSpectateMessage).not.toBeWebhookMessage();
                        expect(kyraSpectateMessage.content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');

                        astrid.cure(hidden);
                    });

                    test('shouted dialog is not communicated to `no hearing` player', async () => {
                        nero.inflict(deaf);
                        kyra.inflict(deaf);

                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid shouts "HELLO?" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Astrid shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);

                        nero.cure(deaf);
                        kyra.cure(deaf);
                    });

                    test('shouted dialog is not communicated to `unconscious` player', async () => {
                        nero.inflict(asleep);
                        kyra.inflict(asleep);

                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a peppy voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a peppy voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid shouts "HELLO?" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Astrid shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);

                        nero.cure(asleep);
                        kyra.cure(asleep);
                    });

                    test('player in neighboring room is being mimicked', async () => {
                        astrid.voiceString = "Nero";

                        await sendPlayerMessage(astrid, "HELLO?");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms) {
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(1);
                            expect(neighboringRoom.channel.messages.cache.first().content).toBe(`Someone in a nearby room with a confident voice shouts "HELLO?"`);
                        }
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms) {
                            if (excludedAudioMonitoringRoom.channel.messages.cache.size !== 0) {
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[floor-1-hall-1]` Someone in a nearby room with a confident voice shouts "HELLO?"');
                                expect(excludedAudioMonitoringRoom.channel.messages.cache.first().content).not.toBe('`[break-room]` Someone in a nearby room with a confident voice shouts "HELLO?"');
                            }
                            else expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        }
                        for (const audioMonitoringRoom of audioMonitoringRooms) {
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            expect(audioMonitoringRoom.channel.messages.cache.first().content).toBe('`[floor-1-hall-1]` Someone in a nearby room with a confident voice shouts "HELLO?"');
                        }

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Someone in a nearby room with a confident voice shouts "HELLO?"`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(1);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room shouts "HELLO?" in your voice!`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(1);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(1);
                        expect(amadeusSpectateMessage).not.toBeWebhookMessage();
                        expect(amadeusSpectateMessage.content).toBe('`[floor-1-hall-1]` Nero shouts "HELLO?" in a nearby room.');

                        expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kyraSpectateMessage).not.toBeWebhookMessage();
                        expect(kyraSpectateMessage.content).toBe('`[floor-1-hall-1]` Nero shouts "HELLO?" in a nearby room.');

                        astrid.voiceString = astrid.originalVoiceString;
                    });
                });

                describe('dialog is communicated to `acute hearing` players in neighboring rooms', () => {
                    beforeAll(() => {
                        nero.inflict(acuteHearing);
                        kiara.inflict(acuteHearing);
                    });

                    afterAll(() => {
                        nero.cure(acuteHearing);
                        kiara.cure(acuteHearing);
                    });

                    test('`acute hearing` players in neighboring rooms are notified of dialog', async () => {
                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid says "Hello!" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(1);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice says "Hello!"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        astrid.displayName = "an individual wearing a MASK";
                        astrid.displayIcon = game.settings.defaultConcealedIconURL;

                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid says "Hello!" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(1);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice says "Hello!"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }

                        astrid.displayName = astrid.name;
                        astrid.displayIcon = null;
                    });

                    test('speaker is hidden', async () => {
                        astrid.inflict(hidden);

                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid says "Hello!" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(1);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room with a peppy voice says "Hello!"`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }

                        astrid.cure(hidden);
                    });

                    test('shouted dialog is not communicated to `no hearing` player', async () => {
                        nero.inflict(deaf);

                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid says "Hello!" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }

                        nero.cure(deaf);
                    });

                    test('shouted dialog is not communicated to `unconscious` player', async () => {
                        nero.inflict(asleep);

                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Astrid says "Hello!" in a nearby room.`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(0);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(0);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }

                        nero.cure(asleep);
                    });

                    test('player in neighboring room is being mimicked', async () => {
                        astrid.voiceString = "Nero";

                        await sendPlayerMessage(astrid, "Hello!");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const neighboringRoom of neighboringRooms)
                            expect(neighboringRoom.channel.messages.cache).toHaveSize(0);
                        for (const excludedAudioMonitoringRoom of excludedAudioMonitoringRooms)
                            expect(excludedAudioMonitoringRoom.channel.messages.cache).toHaveSize(0);
                        for (const audioMonitoringRoom of audioMonitoringRooms)
                            expect(audioMonitoringRoom.channel.messages.cache).toHaveSize(0);

                        expect(kiara.notificationChannel.messages.cache).toHaveSize(1);
                        expect(kiara.spectateChannel.messages.cache).toHaveSize(1);
                        expect(kiaraSpectateMessage).not.toBeWebhookMessage();
                        expect(kiaraSpectateMessage.content).toBe(`Someone in a nearby room with a confident voice says "Hello!"`);

                        expect(nero.notificationChannel.messages.cache).toHaveSize(1);
                        expect(nero.spectateChannel.messages.cache).toHaveSize(1);
                        expect(neroSpectateMessage).not.toBeWebhookMessage();
                        expect(neroSpectateMessage.content).toBe(`Someone in a nearby room says "Hello!" in your voice!`);

                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(amadeus.spectateChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.spectateChannel.messages.cache).toHaveSize(0);
                        for (const excludedPlayer of excludedPlayers) {
                            expect(excludedPlayer.notificationChannel.messages.cache).toHaveSize(0);
                            expect(excludedPlayer.spectateChannel.messages.cache).toHaveSize(0);
                        }

                        astrid.voiceString = astrid.originalVoiceString;
                    });
                });
            });

            describe('dialog is communicated to audio monitoring rooms', () => {
                /** @type {Room[]} */
                let audioVideoMonitoringRooms;
                /** @type {Room[]} */
                let onlyAudioMonitoringRooms;

                beforeAll(() => {
                    audioVideoMonitoringRooms = [lobby, commandCenter];
                    onlyAudioMonitoringRooms = [breakRoom];
                    asuka.location.removePlayer(asuka);
                    luna.location.removePlayer(luna);
                    lobby.addPlayer(asuka);
                    lobby.addPlayer(luna);
                });

                describe('dialog is spoken in video surveilled room', () => {
                    test('dialog is narrated in audio monitoring rooms and communicated to spectate channels', async () => {
                        await sendPlayerMessage(amadeus, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(4);
                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                        for (const occupant of amadeus.location.occupants) {
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "Hello.");
                        }
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            if (audioVideoMonitoringRoom.id === amadeus.location.id) {
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                continue;
                            }
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).toBeWebhookMessage();
                            expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                                expect(spectateMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                            }
                        }
                        for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                            expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a neutral voice says "Hello."');
                            for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                expect(spectateMessage).not.toBeWebhookMessage();
                                expect(spectateMessage.content).toBe('`[Intercom]` Someone with a neutral voice says "Hello."');
                            }
                        }
                    });

                    test('display name of speaker does not match her name', async () => {
                        await sendPlayerMessage(kyra, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(4);
                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        for (const occupant of kyra.location.occupants) {
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                        }
                        expect(amadeusSpectateMessage).toBeMessageWith("An individual wearing a PLAGUE DOCTOR MASK", plagueDoctorMaskIconURL, "Hello.");
                        expect(kyraSpectateMessage).toBeMessageWith("An individual wearing a PLAGUE DOCTOR MASK (Kyra)", plagueDoctorMaskIconURL, "Hello.");
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            if (audioVideoMonitoringRoom.id === kyra.location.id) {
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                continue;
                            }
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).toBeWebhookMessage();
                            expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] An individual wearing a PLAGUE DOCTOR MASK', plagueDoctorMaskIconURL, 'Hello.');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                                expect(spectateMessage).toBeMessageWith('[Surveillance feed] An individual wearing a PLAGUE DOCTOR MASK', plagueDoctorMaskIconURL, 'Hello.');
                            }
                        }
                        for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                            expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a deep modulated voice says "Hello."');
                            for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                expect(spectateMessage).not.toBeWebhookMessage();
                                expect(spectateMessage.content).toBe('`[Intercom]` Someone with a deep modulated voice says "Hello."');
                            }
                        }
                    });

                    test('speaker is hidden', async () => {
                        const hidingSpot = game.entityFinder.getFixture("COFFIN", "command-center").hidingSpot;
                        hidingSpot.addPlayer(kyra);
                        kyra.inflict(hidden);

                        await sendPlayerMessage(kyra, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(4);
                        expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                        expect(kyra.notificationChannel.messages.cache).toHaveSize(0);
                        for (const occupant of kyra.location.occupants) {
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                        }
                        expect(amadeusSpectateMessage).toBeMessageWith("Someone in the room with a deep modulated voice", game.settings.hiddenIconURL, "Hello.");
                        expect(kyraSpectateMessage).toBeMessageWith("An individual wearing a PLAGUE DOCTOR MASK (Kyra)", plagueDoctorMaskIconURL, "Hello.");
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            if (audioVideoMonitoringRoom.id === kyra.location.id) {
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                continue;
                            }
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).toBeWebhookMessage();
                            expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] Someone in the room with a deep modulated voice', game.settings.hiddenIconURL, 'Hello.');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                                expect(spectateMessage).toBeMessageWith('[Surveillance feed] Someone in the room with a deep modulated voice', game.settings.hiddenIconURL, 'Hello.');
                            }
                        }
                        for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                            expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a deep modulated voice says "Hello."');
                            for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                expect(spectateMessage).not.toBeWebhookMessage();
                                expect(spectateMessage.content).toBe('`[Intercom]` Someone with a deep modulated voice says "Hello."');
                            }
                        }

                        hidingSpot.removePlayer(kyra);
                        kyra.cure(hidden);
                    });

                    test('audio surveilled dialog is not communicated to `no hearing` player', async () => {
                        asuka.inflict(deaf);

                        await sendPlayerMessage(amadeus, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("[Surveillance feed] Amadeus", amadeus.member.avatarURL(), "Hello.");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(deaf);
                    });

                    test('audio surveilled dialog is not communicated to `unconscious` player', async () => {
                        asuka.inflict(asleep);

                        await sendPlayerMessage(amadeus, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);

                        expect(luna.notificationChannel.messages.cache).toHaveSize(0);
                        expect(luna.spectateChannel.messages.cache).toHaveSize(1);
                        expect(lunaSpectateMessage).toBeWebhookMessage();
                        expect(lunaSpectateMessage).toBeMessageWith("[Surveillance feed] Amadeus", amadeus.member.avatarURL(), "Hello.");

                        expect(asuka.notificationChannel.messages.cache).toHaveSize(0);
                        expect(asuka.spectateChannel.messages.cache).toHaveSize(0);

                        asuka.cure(asleep);
                    });
                    
                    describe('player notification takes priority', async () => {
                        beforeAll(() => {
                            luna.location.removePlayer(luna);
                            vivian.location.removePlayer(vivian);
                            lobby.addPlayer(vivian);
                        });

                        afterAll(() => {
                            lobby.addPlayer(luna);
                            vivian.location.removePlayer(vivian);
                            gmOffice.addPlayer(vivian);
                        });

                        test('amadeus is mimicking vivian', async () => {
                            amadeus.voiceString = "vivian";

                            await sendPlayerMessage(amadeus, "Hello.");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                            for (const occupant of amadeus.location.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                            }
                            expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "Hello.");
                            expect(kyraSpectateMessage).toBeMessageWith("Amadeus (Vivian)", amadeus.member.avatarURL(), "Hello.");
                            for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                                if (audioVideoMonitoringRoom.id === amadeus.location.id) {
                                    expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                    continue;
                                }
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).toBeWebhookMessage();
                                expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                for (const occupant of audioVideoMonitoringRoom.occupants) {
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                    if (occupant.name === "Vivian") {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                        expect(spectateMessage).not.toBeWebhookMessage();
                                        expect(spectateMessage.content).toBe('`[Surveillance feed]` Amadeus says "Hello." in your voice!');
                                        continue;
                                    }
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage).toBeWebhookMessage();
                                    expect(spectateMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                }
                            }
                            for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                                expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).not.toBeWebhookMessage();
                                expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a bitter voice says "Hello."');
                                for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                    expect(spectateMessage).not.toBeWebhookMessage();
                                    expect(spectateMessage.content).toBe('`[Intercom]` Vivian says "Hello."');
                                }
                            }

                            amadeus.voiceString = amadeus.originalVoiceString;
                        });

                        test('vivian has `no sight` behavior attribute', async () => {
                            vivian.inflict(blind);

                            await sendPlayerMessage(amadeus, "Hello.");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                            for (const occupant of amadeus.location.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                            }
                            expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "Hello.");
                            expect(kyraSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "Hello.");
                            for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                                if (audioVideoMonitoringRoom.id === amadeus.location.id) {
                                    expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                    continue;
                                }
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).toBeWebhookMessage();
                                expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                for (const occupant of audioVideoMonitoringRoom.occupants) {
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                    if (occupant.name === "Vivian") {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                        expect(spectateMessage).not.toBeWebhookMessage();
                                        expect(spectateMessage.content).toBe('`[Intercom]` Someone with a neutral voice says "Hello."');
                                        continue;
                                    }
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage).toBeWebhookMessage();
                                    expect(spectateMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                }
                            }
                            for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                                expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).not.toBeWebhookMessage();
                                expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a neutral voice says "Hello."');
                                for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                    expect(spectateMessage).not.toBeWebhookMessage();
                                    expect(spectateMessage.content).toBe('`[Intercom]` Someone with a neutral voice says "Hello."');
                                }
                            }

                            vivian.cure(blind);
                        });

                        test('vivian has `no sight` behavior attribute and amadeus is mimicking vivian', async () => {
                            vivian.inflict(blind);
                            amadeus.voiceString = "vivian";

                            await sendPlayerMessage(amadeus, "Hello.");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(3);
                            expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                            for (const occupant of amadeus.location.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                            }
                            expect(amadeusSpectateMessage).toBeMessageWith("Amadeus", amadeus.member.avatarURL(), "Hello.");
                            expect(kyraSpectateMessage).toBeMessageWith("Amadeus (Vivian)", amadeus.member.avatarURL(), "Hello.");
                            for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                                if (audioVideoMonitoringRoom.id === amadeus.location.id) {
                                    expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                    continue;
                                }
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).toBeWebhookMessage();
                                expect(roomNarrationMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                for (const occupant of audioVideoMonitoringRoom.occupants) {
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                    if (occupant.name === "Vivian") {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                        expect(spectateMessage).not.toBeWebhookMessage();
                                        expect(spectateMessage.content).toBe('`[Intercom]` Someone says "Hello." in your voice!');
                                        continue;
                                    }
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage).toBeWebhookMessage();
                                    expect(spectateMessage).toBeMessageWith('[Surveillance feed] Amadeus', amadeus.member.avatarURL(), 'Hello.');
                                }
                            }
                            for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                                expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).not.toBeWebhookMessage();
                                expect(roomNarrationMessage.content).toBe('`[Intercom]` Someone with a bitter voice says "Hello."');
                                for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                    expect(spectateMessage).not.toBeWebhookMessage();
                                    expect(spectateMessage.content).toBe('`[Intercom]` Vivian says "Hello."');
                                }
                            }

                            vivian.cure(blind);
                            amadeus.voiceString = amadeus.originalVoiceString;
                        });
                    });

                    describe('player receives notification that does not take priority', async () => {
                        test('kyra has `hear room` behavior attribute', async () => {
                            await sendPlayerMessage(luna, "Hello.");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(4);
                            for (const occupant of luna.location.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                                expect(spectateMessage).toBeMessageWith("Luna", luna.member.avatarURL(), "Hello.");
                            }
                            expect(amadeus.notificationChannel.messages.cache).toHaveSize(0);
                            expect(kyra.notificationChannel.messages.cache).toHaveSize(1);
                            expect(kyraNotificationMessage.content).toBe('`[lobby]` Luna says "Hello."');
                            for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                                if (audioVideoMonitoringRoom.id === luna.location.id) {
                                    expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(0);
                                    continue;
                                }
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).toBeWebhookMessage();
                                expect(roomNarrationMessage).toBeMessageWith('[lobby] Luna', luna.member.avatarURL(), 'Hello.');
                                for (const occupant of audioVideoMonitoringRoom.occupants) {
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                    expect(spectateMessage).toBeWebhookMessage();
                                    expect(spectateMessage).toBeMessageWith('[lobby] Luna', luna.member.avatarURL(), 'Hello.');
                                }
                            }
                            for (const onlyAudioMonitoringRoom of onlyAudioMonitoringRooms) {
                                expect(onlyAudioMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = onlyAudioMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).not.toBeWebhookMessage();
                                expect(roomNarrationMessage.content).toBe('`[lobby]` Someone with a gentle voice says "Hello."');
                                for (const occupant of onlyAudioMonitoringRoom.occupants) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();;
                                    expect(spectateMessage).not.toBeWebhookMessage();
                                    expect(spectateMessage.content).toBe('`[lobby]` Someone with a gentle voice says "Hello."');
                                }
                            }
                        });
                    });
                });

                describe('dialog is spoken in audio surveilled room', () => {
                    beforeAll(() => {
                        nero.cure(receiver);
                    });

                    afterAll(() => {
                        nero.inflict(receiver);
                    });

                    test('dialog is narrated in audio monitoring rooms and communicated to spectate channels', async () => {
                        await sendPlayerMessage(nero, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const occupant of nero.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Nero", nero.member.avatarURL(), "Hello.");
                        }
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).not.toBeWebhookMessage();
                                if (occupant.knows("Nero")) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(1);;
                                    expect(occupant.notificationChannel.messages.cache.first().content).toBe('`[break-room]` Nero says "Hello."');
                                    expect(spectateMessage.content).toBe('`[break-room]` Nero says "Hello."')
                                }
                                else {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                                }
                            }
                        }
                    });

                    test('display name of speaker does not match his name', async () => {
                        nero.displayName = 'an individual wearing a GAS MASK';

                        await sendPlayerMessage(nero, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const occupant of nero.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("An individual wearing a GAS MASK (Nero)", nero.member.avatarURL(), "Hello.");
                        }
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).not.toBeWebhookMessage();
                                if (occupant.knows("Nero")) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(1);;
                                    expect(occupant.notificationChannel.messages.cache.first().content).toBe('`[break-room]` Nero says "Hello."');
                                    expect(spectateMessage.content).toBe('`[break-room]` Nero says "Hello."')
                                }
                                else {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                                }
                            }
                        }

                        nero.displayName = 'Nero';
                    });

                    test('speaker is hidden', async () => {
                        const hidingSpot = game.entityFinder.getFixture("LUNCH TABLES", "break-room").hidingSpot;
                        hidingSpot.addPlayer(nero);
                        nero.inflict(hidden);

                        await sendPlayerMessage(nero, "Hello.");
                        expect(performSaySpy).toHaveBeenCalledTimes(1);
                        expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                        for (const occupant of nero.location.occupants) {
                            expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                            expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                            const spectateMessage = occupant.spectateChannel.messages.cache.first();
                            expect(spectateMessage).toBeWebhookMessage();
                            expect(spectateMessage).toBeMessageWith("Nero", nero.member.avatarURL(), "Hello.");
                        }
                        for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                            expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                            const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                            expect(roomNarrationMessage).not.toBeWebhookMessage();
                            expect(roomNarrationMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                            for (const occupant of audioVideoMonitoringRoom.occupants) {
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).not.toBeWebhookMessage();
                                if (occupant.knows("Nero")) {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(1);;
                                    expect(occupant.notificationChannel.messages.cache.first().content).toBe('`[break-room]` Nero says "Hello."');
                                    expect(spectateMessage.content).toBe('`[break-room]` Nero says "Hello."')
                                }
                                else {
                                    expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                    expect(spectateMessage.content).toBe('`[break-room]` Someone with a confident voice says "Hello."');
                                }
                            }
                        }

                        hidingSpot.removePlayer(nero);
                        nero.cure(hidden);
                    });
                    
                    describe('player notification takes priority', async () => {
                        beforeAll(() => {
                            luna.location.removePlayer(luna);
                            vivian.location.removePlayer(vivian);
                            lobby.addPlayer(vivian);
                        });

                        afterAll(() => {
                            lobby.addPlayer(luna);
                            vivian.location.removePlayer(vivian);
                            gmOffice.addPlayer(vivian);
                        });

                        test('nero is mimicking vivian', async () => {
                            nero.voiceString = "vivian";

                            await sendPlayerMessage(nero, "Hello.");
                            expect(performSaySpy).toHaveBeenCalledTimes(1);
                            expect(game.communicationHandler.getDialogSpectateMirrors(message)).toHaveLength(1);
                            for (const occupant of nero.location.occupants) {
                                expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                expect(spectateMessage).toBeWebhookMessage();
                                expect(spectateMessage).toBeMessageWith("Nero", nero.member.avatarURL(), "Hello.");
                            }
                            for (const audioVideoMonitoringRoom of audioVideoMonitoringRooms) {
                                expect(audioVideoMonitoringRoom.channel.messages.cache).toHaveSize(1);
                                const roomNarrationMessage = audioVideoMonitoringRoom.channel.messages.cache.first();
                                expect(roomNarrationMessage).not.toBeWebhookMessage();
                                expect(roomNarrationMessage.content).toBe('`[break-room]` Someone with a bitter voice says "Hello."');
                                for (const occupant of audioVideoMonitoringRoom.occupants) {
                                    expect(occupant.spectateChannel.messages.cache).toHaveSize(1);
                                    const spectateMessage = occupant.spectateChannel.messages.cache.first();
                                    expect(spectateMessage).not.toBeWebhookMessage();
                                    if (occupant.name === "Vivian") {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(1);
                                        expect(spectateMessage).not.toBeWebhookMessage();
                                        expect(spectateMessage.content).toBe('`[break-room]` Someone says "Hello." in your voice!');
                                        continue;
                                    }
                                    if (occupant.knows("Vivian")) {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(1);;
                                        expect(occupant.notificationChannel.messages.cache.first().content).toBe('`[break-room]` Vivian says "Hello."');
                                        expect(spectateMessage.content).toBe('`[break-room]` Vivian says "Hello."')
                                    }
                                    else {
                                        expect(occupant.notificationChannel.messages.cache).toHaveSize(0);
                                        expect(spectateMessage.content).toBe('`[break-room]` Someone with a bitter voice says "Hello."');
                                    }
                                }
                            }

                            nero.voiceString = nero.originalVoiceString;
                        });
                    });
                });
            });
        });
    });
});