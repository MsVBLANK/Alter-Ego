import { Duration } from 'luxon';

/** @import Player from "../Data/Player.js" */
/** @import RoomItem from "../Data/RoomItem.js" */
/** @import { DurationObjectUnits } from "luxon" */

/**
 * Gets a random number between min and max, inclusive.
 * @param {number} min - The minimum possible number.
 * @param {number} max - The maximum possible number.
 * @returns {number} A random number between min and max, inclusive.
 */
export function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a random string out of an array of possibilities.
 * @param {string[]} possibilities - A list of strings to choose from.
 * @returns A randomly chosen entry from possibilities.
 */
export function getRandomString(possibilities = []) {
	return possibilities[Math.floor(Math.random() * possibilities.length)];
}

/**
 * Returns true only 1/x of the time.
 * @param {number} chance - The denominator of the probability. Defaults to 100. If this is 100, returns true 1/100th of the time.
 */
export function doWithChance(chance = 100) {
	if (typeof chance !== 'number' || chance <= 0) return false;
	if (chance <= 1) return true;
	return Math.floor(Math.random() * chance) === 0;
}

/**
 * Returns true the given percent of the time, but the percent is multiplied by a given number if the given player has the given status effect.
 * @param {number} baseChance - The denominator of the probability. Defaults to 100. If this is 100, returns true 1/100th of the time.
 * @param {Player} player - The player whose status we want to check.
 * @param {string} statusId - The ID of the status to look for on the player.
 * @param {number} statusDivisor - The number that the base chance will be divided by if the player has the given status effect. For example, if the base chance is 100, and this is 5, the new chance will be 1/20.
 */
export function doWithChanceModifiedByPlayerStatus(baseChance = 100, player, statusId, statusDivisor) {
	if (typeof baseChance !== 'number' || baseChance <= 0) return false;
	if (!player || !statusId || typeof statusDivisor !== 'number') return false;
	let chance = baseChance;
	if (player.hasStatus(statusId)) chance /= statusDivisor;
	return doWithChance(chance);
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
 * @returns A duration object.
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
				break;
			case 'M':
				durationInput.months = durationInt;
				break;
			case 'w':
				durationInput.weeks = durationInt;
				break;
			case 'd':
				durationInput.days = durationInt;
				break;
			case 'h':
				durationInput.hours = durationInt;
				break;
			case 'm':
				durationInput.minutes = durationInt;
				break;
			case 's':
				durationInput.seconds = durationInt;
				break;
			default:
				return Duration.invalid("created with duration string using invalid unit", `"${durationUnit}" is an invalid unit`);
		}
	} else return Duration.invalid("created with duration string using invalid duration string", `"${durationString}" is not a valid duration string`);
	if (!isFinite(durationInt)) return Duration.invalid("created with duration string using invalid period", `"${durationInt}" is not a valid duration period`);
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

/**
 * Determines if a given object is a valid luxon duration object or not.
 * @param {unknown} input - The object to test.
 * @returns {input is Duration<true>} Whether or not the input object is a valid luxon duration object.
 */
export function validateDuration(input) {
	return Duration.isDuration(input) && input.isValid
}