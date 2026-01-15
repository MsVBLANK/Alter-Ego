import {ChannelType, type Guild, type GuildBasedChannel} from 'discord.js';
import {access, constants, readFile, writeFile, mkdir} from "node:fs/promises";

const SERVER_CONFIG_PATH = "./Configs/serverconfig.json";

export interface ServerConfig {
    testerRole: string;
    eligibleRole: string;
    playerRole: string;
    freeMovementRole: string;
    moderatorRole: string;
    deadRole: string;
    spectatorRole: string;
    roomCategories: string;
    whisperCategory: string;
    spectateCategory: string;
    testingChannel: string;
    generalChannel: string;
    announcementChannel: string;
    commandChannel: string;
    logChannel: string;
}

export async function validateServerConfig(guild: Guild, serverConfig: ServerConfig): Promise<boolean> {
    let missingSettings: string[] = [];
    let firstBootMessage = false;
    let save = false;
    if (serverConfig.testerRole === "") {
        let testerRole = guild.roles.cache.find(role => role.name === "Tester");
        if (testerRole) {
            serverConfig.testerRole = testerRole.id;
            save = true;
        } else missingSettings.push("testerRole");
    }
    if (serverConfig.eligibleRole === "") {
        let eligibleRole = guild.roles.cache.find(role => role.name === "Eligible");
        if (eligibleRole) {
            serverConfig.eligibleRole = eligibleRole.id;
            save = true;
        } else missingSettings.push("eligibleRole");
    }
    if (serverConfig.playerRole === "") {
        let playerRole = guild.roles.cache.find(role => role.name === "Player");
        if (playerRole) {
            serverConfig.playerRole = playerRole.id;
            save = true;
        } else missingSettings.push("playerRole");
    }
    if (serverConfig.freeMovementRole === "") {
        let headmasterRole = guild.roles.cache.find(role => role.name === "Headmaster");
        if (headmasterRole) {
            serverConfig.freeMovementRole = headmasterRole.id;
            save = true;
        } else missingSettings.push("headmasterRole");
    }
    if (serverConfig.moderatorRole === "") {
        let moderatorRole = guild.roles.cache.find(role => role.name === "Moderator");
        if (moderatorRole) {
            serverConfig.moderatorRole = moderatorRole.id;
            save = true;
        } else missingSettings.push("moderatorRole");
    }
    if (serverConfig.deadRole === "") {
        let deadRole = guild.roles.cache.find(role => role.name === "Dead");
        if (deadRole) {
            serverConfig.deadRole = deadRole.id;
            save = true;
        } else missingSettings.push("deadRole");
    }
    if (serverConfig.spectatorRole === "") {
        let spectatorRole = guild.roles.cache.find(role => role.name === "Spectator");
        if (spectatorRole) {
            serverConfig.spectatorRole = spectatorRole.id;
            save = true;
        } else missingSettings.push("spectatorRole");
    }
    if (serverConfig.roomCategories === "") {
        let roomCategories = guild.channels.cache.find(channel => channel.name === "Rooms");
        if (roomCategories) {
            serverConfig.roomCategories = roomCategories.id;
            save = true;
        } else missingSettings.push("roomCategories");
    }
    if (serverConfig.whisperCategory === "") {
        let whisperCategory = guild.channels.cache.find(channel => channel.name === "Whispers");
        if (whisperCategory) {
            serverConfig.whisperCategory = whisperCategory.id;
            save = true;
        } else missingSettings.push("whisperCategory");
    }
    if (serverConfig.spectateCategory === "") {
        let spectateCategory = guild.channels.cache.find(channel => channel.name === "Spectate");
        if (spectateCategory) {
            serverConfig.spectateCategory = spectateCategory.id;
            save = true;
        } else missingSettings.push("spectateCategory");
    }
    if (serverConfig.testingChannel === "") {
        let testingChannel = guild.channels.cache.find(channel => channel.name === "testing");
        if (testingChannel) {
            serverConfig.testingChannel = testingChannel.id;
            save = true;
        } else missingSettings.push("testingChannel");
    }
    if (serverConfig.generalChannel === "") {
        let generalChannel = guild.channels.cache.find(channel => channel.name === "general");
        if (generalChannel) {
            serverConfig.generalChannel = generalChannel.id;
            save = true;
        } else missingSettings.push("generalChannel");
    }
    if (serverConfig.announcementChannel === "") {
        let announcementChannel = guild.channels.cache.find(channel => channel.name === "announcements");
        if (announcementChannel) {
            serverConfig.announcementChannel = announcementChannel.id;
            save = true;
        } else missingSettings.push("announcementChannel");
    }
    if (serverConfig.commandChannel === "") {
        let commandChannel = guild.channels.cache.find(channel => channel.name === "bot-commands");
        if (commandChannel) {
            serverConfig.commandChannel = commandChannel.id;
            save = true;
        } else missingSettings.push("commandChannel");
    }
    if (serverConfig.logChannel === "") {
        let logChannel = guild.channels.cache.find(channel => channel.name === "bot-log");
        if (logChannel) {
            serverConfig.logChannel = logChannel.id;
            save = true;
        } else missingSettings.push("logChannel");
    }
    if (save) {
        await writeServerConfig(serverConfig);
        console.log("Populated serverconfig file.");
        firstBootMessage = true;
    }
    if (missingSettings.length > 0) {
        console.log(
            "Warning: Failed to correctly populate the serverconfig file by searching for default role and channel names. "
            + "The following ID(s) must be manually populated:\n"
            + missingSettings.join('\n')
        );
        firstBootMessage = false;
    }
    return firstBootMessage;
}

/**
 * Loads the server configuration from the serverconfig.json file and overrides with environment variables if set.
 *
 * @returns ServerConfig object loaded from serverconfig.json file.
 */
export async function loadServerConfig(): Promise<ServerConfig> {
    let file: string, serverConfigFile: ServerConfig;

    try {
        file = await readFile(SERVER_CONFIG_PATH, 'utf8');
    } catch (err) {
        throw new Error(`Failed to read serverconfig.json file. Please check that the file exists and is readable. Error: ${err}`);
    }

    try {
        serverConfigFile = JSON.parse(file);
    } catch (err) {
        throw new Error(`Cannot parse serverconfig.json file. Please check that the file is valid JSON and has the correct fields. Error: ${err}`);
    }

    return {
        announcementChannel: process.env.ANNOUNCEMENT_CHANNEL ?? serverConfigFile.announcementChannel,
        commandChannel: process.env.COMMAND_CHANNEL ?? serverConfigFile.commandChannel,
        deadRole: process.env.DEAD_ROLE ?? serverConfigFile.deadRole,
        eligibleRole: process.env.ELIGIBLE_ROLE ?? serverConfigFile.eligibleRole,
        generalChannel: process.env.GENERAL_CHANNEL ?? serverConfigFile.generalChannel,
        freeMovementRole: process.env.FREE_MOVEMENT_ROLE ?? serverConfigFile.freeMovementRole,
        logChannel: process.env.LOG_CHANNEL ?? serverConfigFile.logChannel,
        moderatorRole: process.env.MODERATOR_ROLE ?? serverConfigFile.moderatorRole,
        playerRole: process.env.PLAYER_ROLE ?? serverConfigFile.playerRole,
        roomCategories: process.env.ROOM_CATEGORIES ?? serverConfigFile.roomCategories,
        spectateCategory: process.env.SPECTATE_CATEGORY ?? serverConfigFile.spectateCategory,
        spectatorRole: process.env.SPECTATOR_ROLE ?? serverConfigFile.spectatorRole,
        testerRole: process.env.TESTER_ROLE ?? serverConfigFile.testerRole,
        testingChannel: process.env.TESTING_CHANNEL ?? serverConfigFile.testingChannel,
        whisperCategory: process.env.WHISPER_CATEGORY ?? serverConfigFile.whisperCategory
    };
}

export function createCategory(guild: Guild, name: string) {
    return new Promise((resolve, reject) => {
        guild.channels.create({
            name: name,
            type: ChannelType.GuildCategory
        })
            .then(channel => resolve(channel))
            .catch(err => reject(err));
    });
}

export async function registerRoomCategory(category: GuildBasedChannel): Promise<string> {
    let serverConfig = await loadServerConfig();
    if (!serverConfig.roomCategories.includes(category.id)) {
        if (serverConfig.roomCategories !== "")
            serverConfig.roomCategories += ",";
        serverConfig.roomCategories += category.id;

        await writeServerConfig(serverConfig);

        return `Successfully registered room category "${category.name}".`;
    } else return `Room category "${category.name}" is already registered.`;
}

export async function createServerConfigFileIfNotExists() {
    let fileExists: boolean;
    try {
        await access(SERVER_CONFIG_PATH, constants.F_OK | constants.R_OK | constants.W_OK);
        fileExists = true;
    } catch (err) {
        fileExists = false;
    }

    if (!fileExists) {
        console.log("No serverconfigs.json found, creating empty file.");
        let emptyServerConfig: ServerConfig = {
            announcementChannel: "",
            commandChannel: "",
            deadRole: "",
            eligibleRole: "",
            generalChannel: "",
            freeMovementRole: "",
            logChannel: "",
            moderatorRole: "",
            playerRole: "",
            roomCategories: "",
            spectateCategory: "",
            spectatorRole: "",
            testerRole: "",
            testingChannel: "",
            whisperCategory: ""
        }
        // Create directory if it doesn't exist
        try{
            await mkdir("./Configs", {recursive: true});
        } catch (err) {
            throw new Error(`Failed to create Configs directory. Error: ${err}`);
        }
        // Write empty serverconfig.json file
        try {
            await writeServerConfig(emptyServerConfig);
        } catch (err) {
            throw new Error(`Failed to write serverconfig.json file. Error: ${err}`);
        }
    }
}

async function writeServerConfig(serverConfig: ServerConfig): Promise<void> {
    const json = JSON.stringify(serverConfig, undefined, 4);
    await writeFile(SERVER_CONFIG_PATH, json, 'utf8');
}
