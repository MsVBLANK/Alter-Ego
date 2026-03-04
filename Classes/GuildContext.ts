import type { Guild, Role, TextChannel } from "discord.js";

/**
 * Represents the guild in which a Game is occurring and all of the parts of a Guild needed by the bot.
 */
export default class GuildContext {
	/**
	 * The guild in which the game is taking place.
	 */
	readonly guild: Guild;
	/**
	 * The channel where the bot will accept commands from a moderator.
	 */
	readonly commandChannel: TextChannel;
	/**
	 * The channel where the bot logs all notable occurrences in the game.
	 */
	readonly logChannel: TextChannel;
	/**
	 * The channel where announcements from the player with the freeMovementRole will be mirrored in all players' spectate channels.
	 */
	readonly announcementChannel: TextChannel;
	/**
	 * The channel where startgame and endgame announcements are posted when debug mode is enabled.
	 */
	readonly testingChannel: TextChannel;
	/**
	 * The channel where startgame and endgame announcements are posted when debug mode is disabled.
	 */
	readonly generalChannel: TextChannel;
	/**
	 * An array of IDs for room channel parent categories.
	 */
	readonly roomCategories: string[];
	/**
	 * The ID of the category channel that houses whisper channels.
	 */
	readonly whisperCategoryId: string;
	/**
	 * The ID of the category channel that houses spectate channels.
	 */
	readonly spectateCategoryId: string;
	/**
	 * The tester role. Members with this role can use eligible commands when debug mode is enabled.
	 */
	readonly testerRole: Role;
	/**
	 * The eligible role. Members with this role can use eligible commands when debug mode is disabled.
	 */
	readonly eligibleRole: Role;
	/**
	 * The player role. Members with this role can use player commands.
	 */
	readonly playerRole: Role;
	/**
	 * A role that can be added to someone with the player role to allow them to move to any room, regardless of if it's adjacent to their current room.
	 */
	readonly freeMovementRole: Role;
	/**
	 * The moderator role. Members with this role can use moderator commands.
	 */
	readonly moderatorRole: Role;
	/**
	 * The dead role. This is given to dead players after a moderator uses the reveal command on them.
	 */
	readonly deadRole: Role;
	/**
	 * The spectator role. This is given to all players when the endgame command is used.
	 */
	readonly spectatorRole: Role;

	/**
	 * @param guild - The guild in which the game is taking place.
	 * @param commandChannel - The channel where the bot logs all notable occurrences in the game.
	 * @param logChannel - The channel where announcements from the player with the freeMovementRole will be mirrored in all players' spectate channels.
	 * @param announcementChannel - The channel where announcements from the player with the freeMovementRole will be mirrored in all players' spectate channels.
	 * @param testingChannel - The channel where startgame and endgame announcements are posted when debug mode is enabled.
	 * @param generalChannel - The channel where startgame and endgame announcements are posted when debug mode is disabled.
	 * @param roomCategories - An array of IDs for room channel parent categories.
	 * @param whisperCategoryId - The ID of the category channel that houses whisper channels.
	 * @param spectateCategoryId - The ID of the category channel that houses spectate channels. 
	 * @param testerRole - The tester role. Members with this role can use eligible commands when debug mode is enabled.
	 * @param eligibleRole - The eligible role. Members with this role can use eligible commands when debug mode is disabled.
	 * @param playerRole - The player role. Members with this role can use player commands.
	 * @param freeMovementRole - A role that can be added to someone with the player role to allow them to move to any room, regardless of if it's adjacent to their current room.
	 * @param moderatorRole - The moderator role. Members with this role can use moderator commands.
	 * @param deadRole - The dead role. This is given to dead players after a moderator uses the reveal command on them.
	 * @param spectatorRole - The spectator role. This is given to all players when the endgame command is used.
	 */
	constructor(
			guild: Guild,
			commandChannel: TextChannel,
			logChannel: TextChannel,
			announcementChannel: TextChannel,
			testingChannel: TextChannel,
			generalChannel: TextChannel,
			roomCategories: string[],
			whisperCategoryId: string,
			spectateCategoryId: string,
			testerRole: Role,
			eligibleRole: Role,
			playerRole: Role,
			freeMovementRole: Role,
			moderatorRole: Role,
			deadRole: Role,
			spectatorRole: Role
		) {
		this.guild = guild;
		this.commandChannel = commandChannel;
		this.logChannel = logChannel;
		this.announcementChannel = announcementChannel;
		this.testingChannel = testingChannel;
		this.generalChannel = generalChannel;
		
		for (let i = 0; i < roomCategories.length; i++)
			roomCategories[i] = roomCategories[i].trim();
		this.roomCategories = roomCategories;
		this.whisperCategoryId = whisperCategoryId;
		this.spectateCategoryId = spectateCategoryId;
		
		this.testerRole = testerRole;
		this.eligibleRole = eligibleRole;
  		this.playerRole = playerRole;
		this.freeMovementRole = freeMovementRole;
		this.moderatorRole = moderatorRole;
		this.deadRole = deadRole;
		this.spectatorRole = spectatorRole;
	}
}
