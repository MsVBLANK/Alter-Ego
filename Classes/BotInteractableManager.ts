import { ButtonStyle, Collection } from "discord.js";
import ButtonInteractable from "./Interactables/ButtonInteractable.js";
import StringSelectMenuInteractable from "./Interactables/StringSelectMenuInteractable.js";
import StringSelectMenuOptionInteractable from "./Interactables/StringSelectMenuOptionInteractable.js";
import type Game from "../Data/Game.js";
import type Interactable from "./Interactables/Interactable.js";
import type Exit from "../Data/Exit.js";
import Player from "../Data/Player.js";
import ActionDirective from "./ActionDirective.ts";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.js";
import InspectAction from "../Data/Actions/InspectAction.js";

/**
 * @class BotInteractableManager
 * @classdesc A set of functions for creating and managing Interactables.
 */
export default class BotInteractableManager {
	/**
	 * The game this belongs to.
	 * @readonly
	 */
	#game: Game;
	/**
	 * A cache of recently-created Interactables, indexed by their custom IDs.
	 * This is used to look up Interactables when an interaction is received.
	 */
	#interactableCache: Collection<string, Interactable>;
	/**
	 * The maximum number of Interactables to keep in the cache at once. If the cache exceeds this size, the oldest Interactable will be removed.
	 * @readonly
	 */
	#interactableCacheSizeLimit = 500;

	/**
	 * @constructor
	 * @param game - The game this belongs to.
	 */
	constructor(game: Game) {
		this.#game = game;
		this.#interactableCache = new Collection();
	}

	/**
	 * Gets an interactable from the cache by its custom ID.
	 * @param customId 
	 */
	getInteractableByCustomId(customId: string) {
		return this.#interactableCache.get(customId);
	}

	/**
	 * Adds an interactable to the cache, removing the oldest one if the cache size limit is exceeded.
	 * Interactables are valid for 5 minutes after being added. They are automatically removed from the cache after this time.
	 * @param interactable 
	 */
	addInteractable(interactable: Interactable) {
		if (this.#interactableCache.size >= this.#interactableCacheSizeLimit)
			this.disableInteractable(this.#interactableCache.firstKey());
		if (this.#interactableCache.has(interactable.customId))
			this.disableInteractable(interactable.customId);
		this.#interactableCache.set(interactable.customId, interactable);
		setTimeout(() => this.disableInteractable(interactable.customId), 5 * 60 * 1000);
	}

	/**
	 * Disables an interactable and removes it from the cache by its custom ID.
	 * @param customId 
	 */
	disableInteractable(customId: string) {
		const interactable = this.#interactableCache.get(customId);
		if (interactable) {
			interactable.disable();
			this.#interactableCache.delete(customId);
		}
	}
	
	/**
	 * Creates QueueMoveAction interactables for a list of exits and adds them to the cache.
	 * @param exits - A list of exits to create interactables for.
	 * @param player - The player these interactables are being created for. This is used to determine which exits the player can use.
	 */
	async createQueueMoveActionInteractables(exits: Exit[], player: Player): Promise<ButtonInteractable[]> {
		const moveButtons: ButtonInteractable[] = [];
		const runButtons: ButtonInteractable[] = [];
		for (const exit of exits) {
			if (!player.hasBehaviorAttribute("disable move")) {
				const actionDirective = new ActionDirective(QueueMoveAction.prototype, exit.getQueueMoveActionDirectiveArgs(player.location, false));
				const customId = await actionDirective.generateCustomId(player);
				actionDirective.setCustomId(customId);
				const moveButton = new ButtonInteractable(actionDirective, `Move ${exit.name}`, ButtonStyle.Primary);
				this.addInteractable(moveButton);
				moveButtons.push(moveButton);
			}
			if (!player.hasBehaviorAttribute("disable run")) {
				const actionDirective = new ActionDirective(QueueMoveAction.prototype, exit.getQueueMoveActionDirectiveArgs(player.location, true));
				const customId = await actionDirective.generateCustomId(player);
				actionDirective.setCustomId(customId);
				const moveButton = new ButtonInteractable(actionDirective, `Run ${exit.name}`, ButtonStyle.Danger);
				this.addInteractable(moveButton);
				runButtons.push(moveButton);
			}
		}
		return moveButtons.concat(runButtons);
	}

	/**
	 * Creates StringSelectMenuInteractable for a list of inspectable game entities and adds it to the cache.
	 * @param entities - A list of inspectable game entities to create StringSelectMenuOptionInteractables for.
	 * @param player - The player these interactables are being created for.
	 */
	async createInspectActionInteractable(entities: Inspectable[], player: Player): Promise<StringSelectMenuInteractable[]> {
		const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
		for (const entity of entities) {
			const actionDirective = new ActionDirective(InspectAction.prototype, entity.getInspectActionDirectiveArgs());
			const customId = await actionDirective.generateCustomId(player);
			if (menuOptions.has(customId)) continue;
			actionDirective.setCustomId(customId);
			const label = entity instanceof Player ? entity.displayName : entity.name;
			const option = new StringSelectMenuOptionInteractable(actionDirective, label, customId);
			this.addInteractable(option);
			menuOptions.set(customId, option);
		}
		if (menuOptions.size === 0) return [];
		const actionDirective = new ActionDirective(InspectAction.prototype, ["InspectAction Menu"]);
		const customId = await actionDirective.generateCustomId(player);
		actionDirective.setCustomId(customId);
		const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Inspect");
		this.addInteractable(menu);
		return [menu];
	}
}