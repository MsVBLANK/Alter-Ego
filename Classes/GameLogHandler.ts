import Exit from "../Data/Exit.ts";
import Fixture from "../Data/Fixture.ts";
import InventoryItem from "../Data/InventoryItem.ts";
import ItemInstance from "../Data/ItemInstance.ts";
import Player from "../Data/Player.ts";
import Puzzle from "../Data/Puzzle.ts";
import Room from "../Data/Room.ts";
import RoomItem from "../Data/RoomItem.ts";
import { generateListString } from "../Modules/helpers.ts";
import type EquipmentSlot from "../Data/EquipmentSlot.ts";
import type Flag from "../Data/Flag.ts";
import type Game from "../Data/Game.ts";
import type Gesture from "../Data/Gesture.ts";
import type Event from "../Data/Event.ts";
import type HidingSpot from "../Data/HidingSpot.ts";
import type InventorySlot from "../Data/InventorySlot.ts";
import type Status from "../Data/Status.ts";
import type Whisper from "../Data/Whisper.ts";

/**
 * A set of functions to send messages to the game's log channel.
 */
export default class GameLogHandler {
	/**
	 * The game this belongs to.
	 */
	readonly #game: Game;

	/**
	 * @param game - The game this belongs to.
	 */
	constructor(game: Game) {
		this.#game = game;
	}

	#getTime(): string {
		return new Date().toLocaleTimeString();
	}

	#getForcedString(forced: boolean): string {
		return forced ? `forcibly ` : ``;
	}

	/**
	 * Sends the log message.
	 * @param logText - The text of the log message.
	 */
	#sendLogMessage(logText: string): void {
		this.#game.communicationHandler.sendLogMessage(logText);
	}

	/**
	 * Logs a whisper action.
	 * @param whisper - The whisper that was created.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logWhisper(whisper: Whisper, player: Player, forced: boolean) {
		const playerListString = generateListString(whisper.players.filter(whisperPlayer => whisperPlayer.name !== player.name).map(player => player.name));
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}began whispering to ${playerListString} in ${player.location.channel}`);
	}

	/**
	 * Logs a gesture action.
	 * @param gesture - The gesture that was performed.
	 * @param target - The target of the gesture action.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logGesture(gesture: Gesture, target: GestureTarget | null, player: Player, forced: boolean) {
		let targetString = "";
		if (target instanceof ItemInstance) targetString = `to ${target.getIdentifier()} `;
		else if (target instanceof Exit || target instanceof Fixture || target instanceof Player) targetString = `to ${target.name} `;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}did gesture ${gesture.id} ${targetString}in ${player.location.channel}`)
	}

	/**
	 * Logs a move action.
	 * @param isRunning - Whether the player is running.
	 * @param destination - The room the player moved to.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logMove(isRunning: boolean, destination: Room, player: Player, forced: boolean) {
		const verb = isRunning ? `ran` : `moved`;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}${verb} to ${destination.channel}`);
	}

	/**
	 * Logs an inspect action.
	 * @param target - The target of the inspect action.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logInspect(target: Room | Fixture | RoomItem | InventoryItem | Player, player: Player, forced: boolean) {
		let targetString = "";
		if (target instanceof Room) targetString = `the room`;
		else if (target instanceof Fixture || target instanceof Player) targetString = `${target.name}`;
		else if (target instanceof RoomItem) {
			const preposition = target.getContainerPreposition();
			const containerPhrase = target.container instanceof RoomItem ? target.container.getIdentifier() : target.getContainerPhrase();
			targetString = `${target.getIdentifier()} ${preposition} ${containerPhrase}`;
		}
		else if (target instanceof InventoryItem) {
			const ownerString = target.player.name === player.name ? player.originalPronouns.dpos : `${target.player.name}'s`;
			targetString = `${target.getIdentifier()} from ${ownerString} inventory`;
		}
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}inspected ${targetString} in ${player.location.channel}`);
	}

	/**
	 * Logs a knock action.
	 * @param exit - The exit that was knocked on.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logKnock(exit: Exit, player: Player, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}knocked on ${exit.name} in ${player.location.channel}`);
	}

	/**
	 * Logs a hide action.
	 * @param hidingSpot - The hiding spot the player hid in.
	 * @param player - The player who performed the action.
	 * @param successful - Whether or not the player was successful in hiding.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logHide(hidingSpot: HidingSpot, player: Player, successful: boolean, forced: boolean) {
		const actionVerb = successful ? `hid` : `attempted and failed to hide`;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}${actionVerb} in ${hidingSpot.name} in ${player.location.channel}`);
	}

	/**
	 * Logs an unhide action.
	 * @param hidingSpot - The hiding spot the player came out of.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUnhide(hidingSpot: HidingSpot, player: Player, forced: boolean) {
		const hidingSpotName = hidingSpot ? hidingSpot.name : "hiding";
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}came out of ${hidingSpotName} in ${player.location.channel}`);
	}

	/**
	 * Logs an inflict action.
	 * @param status - The status that was inflicted.
	 * @param player - The player who performed the action.
	 */
	logInflict(status: Status, player: Player) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} became ${status.id} in ${player.location.channel}`);
	}

	/**
	 * Logs a cure action.
	 * @param status - The status that was cured.
	 * @param player - The player who performed the action.
	 */
	logCure(status: Status, player: Player) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} has been cured of ${status.id} in ${player.location.channel}`);
	}

	/**
	 * Logs a use action.
	 * @param item - The item that was used.
	 * @param player - The player who performed the action.
	 * @param target - The player the item was used on.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUse(item: InventoryItem, player: Player, target: Player, forced: boolean) {
		const forcedString = this.#getForcedString(forced);
		const itemName = item.getIdentifier();
		const targetString = player.name === target.name ? `on ${target.name} ` : ``;
		const logText = `${this.#getTime()} - ${player.name} ${forcedString}used ${itemName} from ${player.originalPronouns.dpos} inventory ${targetString}in ${player.location.channel}`;
		this.#sendLogMessage(logText);
	}

	/**
	 * Logs a take action.
	 * @param item - The item that was taken.
	 * @param player - The player who performed the action.
	 * @param container - The container the item was taken from.
	 * @param inventorySlot - The inventory slot the item was taken from.
	 * @param successful - Whether or not the player was successful in taking the item.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logTake(item: RoomItem, player: Player, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>, successful: boolean, forced: boolean) {
		const containerPhrase = container instanceof RoomItem ? `${inventorySlot.id} of ${container.identifier}` : container.name;
		const actionVerb = successful ? `took` : `attempted and failed to take`;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}${actionVerb} ${item.getIdentifier()} from ${containerPhrase} in ${player.location.channel}`);
	}

	/**
	 * Logs a steal action.
	 * @param item - The item that was stolen.
	 * @param player - The player who performed the action.
	 * @param victim - The player who was stolen from.
	 * @param container - The container the item was stolen from.
	 * @param inventorySlot - The inventory slot the item was stolen from.
	 * @param successful - Whether or not the player was successful in stealing.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logSteal(item: InventoryItem, player: Player, victim: Player, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>, successful: boolean, forced: boolean) {
		const forcedString = this.#getForcedString(forced);
		const actionVerb = successful ? `stole` : `attempted and failed to steal`;
		const logText = `${this.#getTime()} - ${player.name} ${forcedString}${actionVerb} ${item.getIdentifier()} from ${inventorySlot.id} of ${victim.name}'s ${container.getIdentifier()} in ${player.location.channel}`;
		this.#sendLogMessage(logText);
	}

	/**
	 * Logs a drop action.
	 * @param item - The item that was dropped.
	 * @param player - The player who performed the action.
	 * @param container - The container the item was dropped into.
	 * @param inventorySlot - The inventory slot the item was dropped into.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logDrop(item: InventoryItem, player: Player, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>, forced: boolean) {
		const preposition = container.getPreposition() ? container.getPreposition() : "in";
		const containerPhrase = container instanceof RoomItem ? `${inventorySlot.id} of ${container.identifier}` : container.name;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}dropped ${item.getIdentifier()} ${preposition} ${containerPhrase} in ${player.location.channel}`);
	}

	/**
	 * Logs a give action.
	 * @param item - The item that was given.
	 * @param player - The player who performed the action.
	 * @param recipient - The player who received the item.
	 * @param successful - Whether or not the player was successful in giving the item.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logGive(item: InventoryItem, player: Player, recipient: Player, successful: boolean, forced: boolean) {
		const actionVerb = successful ? `gave` : `attempted and failed to give`;
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}${actionVerb} ${item.getIdentifier()} to ${recipient.name} in ${player.location.channel}`);
	}

	/**
	 * Logs a stash action.
	 * @param item - The item that was stashed.
	 * @param player - The player who performed the action.
	 * @param container - The container the item was stashed in.
	 * @param inventorySlot - The inventory slot the item was stashed in.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logStash(item: InventoryItem, player: Player, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>, forced: boolean) {
		const forcedString = this.#getForcedString(forced);
		const itemIdentifier = item.getIdentifier();
		const preposition = container.getPreposition() ? container.getPreposition() : "in";
		const containerIdentifier = container.getIdentifier();
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${forcedString}stashed ${itemIdentifier} ${preposition} ${inventorySlot.id} of ${player.originalPronouns.dpos} ${containerIdentifier} in ${player.location.channel}`);
	}

	/**
	 * Logs an unstash action.
	 * @param item - The item that was unstashed.
	 * @param player - The player who performed the action.
	 * @param container - The container the item was unstashed from.
	 * @param inventorySlot - The inventory slot the item was unstashed from.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUnstash(item: InventoryItem, player: Player, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>, forced: boolean) {
		const forcedString = this.#getForcedString(forced);
		const itemIdentifier = item.getIdentifier();
		const containerIdentifier = container.getIdentifier();
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${forcedString}unstashed ${itemIdentifier} from ${inventorySlot.id} of ${player.originalPronouns.dpos} ${containerIdentifier} in ${player.location.channel}`);
	}

	/**
	 * Logs an equip action.
	 * @param item - The item that was equipped.
	 * @param player - The player who performed the action.
	 * @param equipmentSlot - The equipment slot the item was equipped to.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logEquip(item: InventoryItem, player: Player, equipmentSlot: EquipmentSlot, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}equipped ${item.getIdentifier()} to ${equipmentSlot.id} in ${player.location.channel}`);
	}

	/**
	 * Logs an unequip action.
	 * @param item - The item that was unequipped.
	 * @param player - The player who performed the action.
	 * @param equipmentSlot - The equipment slot the item was unequipped from.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUnequip(item: InventoryItem, player: Player, equipmentSlot: EquipmentSlot, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}unequipped ${item.getIdentifier()} from ${equipmentSlot.id} in ${player.location.channel}`);
	}

	/**
	 * Logs a dress action.
	 * @param items - The items the player put on.
	 * @param player - The player who performed the action.
	 * @param container - The container the player dressed from.
	 * @param inventorySlot - The inventory slot the player dressed from, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logDress(items: InventoryItem[], player: Player, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>, forced: boolean) {
		const containerPhrase = container instanceof RoomItem ? `${inventorySlot.id} of ${container.identifier}` : container.name;
		const itemList = generateListString(items.map(item => item.getIdentifier()));
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}dressed from ${containerPhrase}, putting on ${itemList} in ${player.location.channel}`);
	}

	/**
	 * Logs an undress action.
	 * @param items - The items the player took off.
	 * @param player - The player who performed the action.
	 * @param container - The container the player undressed into.
	 * @param inventorySlot - The inventory slot the player undressed into, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUndress(items: InventoryItem[], player: Player, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>, forced: boolean) {
		const preposition = container.getPreposition();
		const containerPhrase = container instanceof RoomItem ? `${inventorySlot.id} of ${container.identifier}` : container.name;
		const itemList = generateListString(items.map(item => item.getIdentifier()));
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}undressed, putting ${itemList} ${preposition} ${containerPhrase} in ${player.location.channel}`);
	}

	/**
	 * Logs an instantiate action for a room item.
	 * @param item - The instantiated item.
	 * @param quantity - The quantity of the item that was instantiated.
	 * @param container - The item's container.
	 * @param inventorySlot - The inventory slot the item belongs to.
	 */
	logInstantiateRoomItem(item: RoomItem, quantity: number, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>) {
		const itemIdentifier = item.getIdentifier();
		const preposition = item.getContainerPreposition();
		let containerDisplay = "";
		if (container instanceof Puzzle)
			containerDisplay = container.parentFixture ? container.parentFixture.name : container.name;
		else if (container instanceof Fixture)
			containerDisplay = container.name;
		else if (container instanceof RoomItem)
			containerDisplay = `${inventorySlot.id} of ${container.getIdentifier()}`;
		this.#sendLogMessage(`${this.#getTime()} - Instantiated ${quantity} ${itemIdentifier} ${preposition} ${containerDisplay} in ${item.location.channel}`);
	}

	/**
	 * Logs an instantiate action for an equipped inventory item.
	 * @param item - The instantiated inventory item.
	 * @param player - The player the item belongs to.
	 * @param equipmentSlot - The equipment slot the inventory item was equipped to.
	 */
	logInstantiateEquippedInventoryItem(item: InventoryItem, player: Player, equipmentSlot: EquipmentSlot) {
		this.#sendLogMessage(`${this.#getTime()} - Instantiated ${item.getIdentifier()} and equipped it to ${player.name}'s ${equipmentSlot.id} in ${player.location.channel}`);
	}

	/**
	 * Logs an instantiate action for a stashed inventory item.
	 * @param item - The instantiated inventory item.
	 * @param quantity - The quantity of the item that was instantiated.
	 * @param player - The player the item belongs to.
	 * @param container - The item's container.
	 * @param inventorySlot - The inventory slot the item belongs to.
	 */
	logInstantiateStashedInventoryItem(item: InventoryItem, quantity: number, player: Player, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>) {
		const itemIdentifier = item.getIdentifier();
		const preposition = container.prefab ? container.prefab.preposition : "in";
		const containerDisplay = `${inventorySlot.id} of ${container.identifier} in ${player.name}'s inventory`;
		this.#sendLogMessage(`${this.#getTime()} - Instantiated ${quantity} ${itemIdentifier} ${preposition} ${containerDisplay} in ${player.location.channel}`);
	}

	/**
	 * Logs a destroy action for a room item.
	 * @param item - The destroyed item.
	 * @param quantity - The quantity of the item that was destroyed.
	 * @param container - The item's container.
	 * @param inventorySlot - The inventory slot the item belongs to.
	 */
	logDestroyRoomItem(item: RoomItem, quantity: number, container: RoomItemContainer, inventorySlot: InventorySlot<RoomItem>) {
		const itemIdentifier = item.getIdentifier();
		const preposition = item.getContainerPreposition();
		let containerDisplay = "";
		if (container instanceof Puzzle)
			containerDisplay = container.parentFixture ? container.parentFixture.name : container.name;
		else if (container instanceof Fixture)
			containerDisplay = container.name;
		else if (container instanceof RoomItem)
			containerDisplay = `${inventorySlot.id} of ${container.getIdentifier()}`;
		this.#sendLogMessage(`${this.#getTime()} - Destroyed ${quantity} ${itemIdentifier} ${preposition} ${containerDisplay} in ${item.location.channel}`);
	}

	/**
	 * Logs a destroy action for an equipped inventory item.
	 * @param item - The destroyed inventory item.
	 * @param player - The player the item belongs to.
	 * @param equipmentSlot - The equipment slot the inventory item was equipped to.
	 */
	logDestroyEquippedInventoryItem(item: InventoryItem, player: Player, equipmentSlot: EquipmentSlot) {
		this.#sendLogMessage(`${this.#getTime()} - Destroyed ${item.getIdentifier()} equipped to ${player.name}'s ${equipmentSlot.id} in ${player.location.channel}`);
	}

	/**
	 * Logs a destroy action for a stashed inventory item.
	 * @param item - The destroyed inventory item.
	 * @param quantity - The quantity of the item that was destroyed.
	 * @param player - The player the item belongs to.
	 * @param container - The item's container.
	 * @param inventorySlot - The inventory slot the item belongs to.
	 */
	logDestroyStashedInventoryItem(item: InventoryItem, quantity: number, player: Player, container: InventoryItem, inventorySlot: InventorySlot<InventoryItem>) {
		const itemIdentifier = item.getIdentifier();
		const preposition = container.prefab ? container.prefab.preposition : "in";
		const containerDisplay = `${inventorySlot.id} of ${container.identifier} in ${player.name}'s inventory`;
		this.#sendLogMessage(`${this.#getTime()} - Destroyed ${quantity} ${itemIdentifier} ${preposition} ${containerDisplay} in ${player.location.channel}`);
	}

	/**
	 * Logs a craft action.
	 * @param item1Id - The identifier of the first ingredient.
	 * @param item2Id - The identifier of the second ingredient.
	 * @param craftingResult - The result of the craft action.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logCraft(item1Id: string, item2Id: string, craftingResult: CraftingResult, player: Player, forced: boolean) {
		let productPhrase = "";
		let product1Phrase = "";
		let product2Phrase = "";
		if (craftingResult.product1) product1Phrase = craftingResult.product1.getIdentifier();
		if (craftingResult.product2) product2Phrase = craftingResult.product2.getIdentifier();
		if (product1Phrase !== "" && product2Phrase !== "") productPhrase = `${product1Phrase} and ${product2Phrase}`;
		else if (product1Phrase !== "") productPhrase = product1Phrase;
		else if (product2Phrase !== "") productPhrase = product2Phrase;
		else productPhrase = "nothing";
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}crafted ${productPhrase} from ${item1Id} and ${item2Id} in ${player.location.channel}`);
	}

	/**
	 * Logs an uncraft action.
	 * @param itemId - The identifier of the product.
	 * @param uncraftingResult - The result of the uncraft action.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUncraft(itemId: string, uncraftingResult: UncraftingResult, player: Player, forced: boolean) {
		let ingredientPhrase = "";
		let ingredient1Phrase = "";
		let ingredient2Phrase = "";
		if (uncraftingResult.ingredient1) ingredient1Phrase = uncraftingResult.ingredient1.getIdentifier();
		if (uncraftingResult.ingredient2) ingredient2Phrase = uncraftingResult.ingredient2.getIdentifier();
		if (ingredient1Phrase !== "" && ingredient2Phrase !== "") ingredientPhrase = `${ingredient1Phrase} and ${ingredient2Phrase}`;
		else if (ingredient1Phrase !== "") ingredientPhrase = ingredient1Phrase;
		else if (ingredient2Phrase !== "") ingredientPhrase = ingredient2Phrase;
		else ingredientPhrase = "nothing";
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}uncrafted ${itemId} into ${ingredientPhrase} in ${player.location.channel}`);
	}

	/**
	 * Logs an activate action.
	 * @param fixture - The fixture that was activated.
	 * @param player - The player who performed the action, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logActivate(fixture: Fixture, player?: Player, forced?: boolean) {
		const actionDescription = player ? `${player.name} ${this.#getForcedString(forced)}activated ${fixture.name}` : `${fixture.name} was activated`;
		this.#sendLogMessage(`${this.#getTime()} - ${actionDescription} in ${fixture.location.channel}`);
	}

	/**
	 * Logs a deactivate action.
	 * @param fixture - The fixture that was deactivated.
	 * @param player - The player who performed the action, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logDeactivate(fixture: Fixture, player?: Player, forced?: boolean) {
		const actionDescription = player ? `${player.name} ${this.#getForcedString(forced)}deactivated ${fixture.name}` : `${fixture.name} was deactivated`;
		this.#sendLogMessage(`${this.#getTime()} - ${actionDescription} in ${fixture.location.channel}`);
	}

	/**
	 * Logs a solve action or an attempt action that solves the puzzle.
	 * @param puzzle - The puzzle being solved.
	 * @param player - The player who performed the action, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logSolve(puzzle: Puzzle, player?: Player, forced?: boolean) {
		const actionDescription = player ? `${player.name} ${this.#getForcedString(forced)}solved ${puzzle.name}` : `${puzzle.name} was solved`;
		this.#sendLogMessage(`${this.#getTime()} - ${actionDescription} in ${puzzle.location.channel}`);
	}

	/**
	 * Logs an unsolve action or an attempt action that unsolves the puzzle.
	 * @param puzzle - The puzzle being unsolved.
	 * @param player - The player who performed the action, if applicable.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logUnsolve(puzzle: Puzzle, player?: Player, forced?: boolean) {
		const actionDescription = player ? `${player.name} ${this.#getForcedString(forced)}unsolved ${puzzle.name}` : `${puzzle.name} was unsolved`;
		this.#sendLogMessage(`${this.#getTime()} - ${actionDescription} in ${puzzle.location.channel}`);
	}

	/**
	 * Logs an attempt action where the puzzle was already solved.
	 * @param puzzle - The puzzle that was attempted.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logAttemptAlreadySolvedPuzzle(puzzle: Puzzle, player: Player, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}attempted ${puzzle.name} while it was already solved in ${player.location.channel}`);
	}

	/**
	 * Logs an attempt action where the player failed to solve the puzzle.
	 * @param puzzle - The puzzle that was attempted.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logAttemptAndFailPuzzle(puzzle: Puzzle, player: Player, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}attempted and failed to solve ${puzzle.name} in ${player.location.channel}`)
	}

	/**
	 * Logs an attempt action where the puzzle has no remaining attempts.
	 * @param puzzle - The puzzle that was attempted.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logAttemptPuzzleWithNoRemainingAttempts(puzzle: Puzzle, player: Player, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}attempted ${puzzle.name} with no remaining attempts in ${player.location.channel}`);
	}

	/**
	 * Logs an attempt action where the puzzle is inaccessible.
	 * @param puzzle - The puzzle that was attempted.
	 * @param player - The player who performed the action.
	 * @param forced - Whether or not the player was forced to perform the action.
	 */
	logAttemptInaccessiblePuzzle(puzzle: Puzzle, player: Player, forced: boolean) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} ${this.#getForcedString(forced)}attempted ${puzzle.name} without meeting all of the requirements in ${player.location.channel}`);
	}

	/**
	 * Logs a die action.
	 * @param player - The player who died.
	 */
	logDie(player: Player) {
		this.#sendLogMessage(`${this.#getTime()} - ${player.name} died in ${player.location.channel}`);
	}

	/**
	 * Logs an exit being unlocked.
	 * @param room - The room the exit is in.
	 * @param exit - The exit that was unlocked.
	 */
	logUnlock(room: Room, exit: Exit) {
		this.#sendLogMessage(`${this.#getTime()} - ${exit.name} was unlocked in ${room.channel}`);
	}

	/**
	 * Logs an exit being locked.
	 * @param room - The room the exit is in.
	 * @param exit - The exit that was locked.
	 */
	logLock(room: Room, exit: Exit) {
		this.#sendLogMessage(`${this.#getTime()} - ${exit.name} was locked in ${room.channel}`);
	}

	/**
	 * Logs an event being triggered.
	 * @param event - The event that was triggered.
	 */
	logTrigger(event: Event) {
		this.#sendLogMessage(`${this.#getTime()} - ${event.id} was triggered`);
	}

	/**
	 * Logs an event being ended.
	 * @param event - The event that was ended.
	 */
	logEnd(event: Event) {
		this.#sendLogMessage(`${this.#getTime()} - ${event.id} was ended`);
	}

	/**
	 * Logs a flag being set.
	 * @param flag - The flag that was set.
	 */
	logSetFlag(flag: Flag) {
		const valueDisplay =
			typeof flag.value === "string" ? `"${flag.value}"` :
				typeof flag.value === "boolean" ? `\`${flag.value}\`` :
					flag.value;
		this.#sendLogMessage(`${this.#getTime()} - ${flag.id} was set with value ${valueDisplay}`);
	}

	/**
	 * Logs a flag being cleared.
	 * @param flag - The flag that was cleared.
	 */
	logClearFlag(flag: Flag) {
		this.#sendLogMessage(`${this.#getTime()} - ${flag.id} was cleared`);
	}
}
