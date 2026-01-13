import { EmbedBuilder } from "discord.js";
import { Duration } from 'luxon';

/** @typedef {import("../Data/Game.js").default} Game */
/** @typedef {import("../Data/Player.js").default} Player */
/** @typedef {import("../Data/RoomItem.js").default} RoomItem */
/** @typedef {import("luxon").DurationObjectUnits} DurationObjectUnits */

/**
 * Gets a random string out of an array of possibilities.
 * @param {string[]} possibilities - A list of strings to choose from.
 * @returns A randomly chosen entry from possibilities.
 */
export function getRandomString(possibilities = []) {
	return possibilities[Math.floor(Math.random() * possibilities.length)];
}

/**
 * Sorts a list of players alphabetically by their display names.
 * @param {Player[]} players - A list of players.
 */
export function sortPlayersByDisplayName(players) {
	players.sort((a, b) => {
		const nameA = a.displayName.toLowerCase();
		const nameB = b.displayName.toLowerCase();
		if (nameA < nameB) return -1;
		if (nameA > nameB) return 1;
		return 0;
	});
}

/**
 * Generates a grammatically correct list of players, sorted alphabetically by display name.
 * @param {Player[]} players - A list of players.
 */
export function generatePlayerListString(players) {
	sortPlayersByDisplayName(players);
	const playerList = players.map(player => player.displayName);
	return generateListString(playerList);
}

/**
 * Generates a grammatically correct list.
 * @param {string[]} list 
 */
export function generateListString(list) {
	let listString = "";
	if (list.length === 1) listString = list[0];
	else if (list.length === 2)
		listString += `${list[0]} and ${list[1]}`;
	else if (list.length >= 3) {
		for (let i = 0; i < list.length - 1; i++)
			listString += `${list[i]}, `;
		listString += `and ${list[list.length - 1]}`;
	}
	return listString;
}

/**
 * Generates a comma-separated list of items, sorted alphabetically by prefab ID.
 * @param {RoomItem[]} items - A list of room items.
 */
export function getSortedItemsString(items) {
	return items.sort(function (a, b) {
		if (a.prefab.id < b.prefab.id) return -1;
		if (a.prefab.id > b.prefab.id) return 1;
		return 0;
	}).map(item => item.prefab.id).join(',');
}

/**
 * Returns the given string with the first letter capitalized.
 * @param {string} string
 */
export function capitalizeFirstLetter(string) {
	if (string.length === 0) return string;
	const uppercaseFirstLetter = string.charAt(0).toLocaleUpperCase();
	const remainingString = string.length > 1 ? string.substring(1) : '';
	return `${uppercaseFirstLetter}${remainingString}`;
}

/**
 * Returns true if the given string ends with a punctuation mark.
 * @param {string} string 
 */
export function endsWithPunctuation(string) {
	return !!string.match(/[.!?]$/);
}

/**
 * Parses a duration string and returns a duration object.
 * @param {string} durationString - An integer and a unit. Acceptable units: y, M, w, d, h, m, s.
 * @returns A duration object, or null.
 */
export function parseDuration(durationString) {
	let durationInt = parseInt(durationString.substring(0, durationString.length - 1));
	let durationUnit = durationString.charAt(durationString.length - 1);
	/** @type {import("luxon").DurationLikeObject} */
	let durationInput = {}
	if (durationString) {
		switch (durationUnit) {
			case 'y':
				durationInput.years = durationInt;
			case 'M':
				durationInput.months = durationInt;
			case 'w':
				durationInput.weeks = durationInt;
			case 'd':
				durationInput.days = durationInt;
			case 'h':
				durationInput.hours = durationInt;
			case 'm':
				durationInput.minutes = durationInt;
			case 's':
				durationInput.seconds = durationInt;
		}
	}
	return Duration.fromObject(durationInput);
}

/**
 * Converts a time string to a luxon duration input object.
 * @param {string} timeString - The string to convert. The format is `D? HH:mm:ss`, e.g. `1 23:59:59`.
 * @returns {DurationObjectUnits} The input object to pass into the duration constructor.
 */
export function convertTimeStringToDurationUnits(timeString) {
	const timeRegex = /^(?<days>\d+)? ?(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})$/;
	const timeMatch = timeString.match(timeRegex);
	if (timeMatch?.groups) {
		const daysValue = timeMatch.groups.days ? parseInt(timeMatch.groups.days) : 0;
		const hoursValue = timeMatch.groups.hours ? parseInt(timeMatch.groups.hours) : 0;
		const minutesValue = timeMatch.groups.minutes ? parseInt(timeMatch.groups.minutes) : 0;
		const secondsValue = timeMatch.groups.seconds ? parseInt(timeMatch.groups.seconds) : 0;
		return {
			days: daysValue,
			hours: hoursValue,
			minutes: minutesValue,
			seconds: secondsValue
		};
	}
}
