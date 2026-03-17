import { ButtonStyle, Collection } from "discord.js";
import ButtonInteractable from "./Interactables/ButtonInteractable.ts";
import PageNextInteractable from "./Interactables/PageNextInteractable.ts";
import PagePrevInteractable from "./Interactables/PagePrevInteractable.ts";
import StringSelectMenuInteractable from "./Interactables/StringSelectMenuInteractable.ts";
import StringSelectMenuOptionInteractable from "./Interactables/StringSelectMenuOptionInteractable.ts";
import TextInputInteractable from "./Interactables/TextInputInteractable.ts";
import ModalInteractable from "./Interactables/ModalInteractable.ts";
import type Action from "../Data/Action.ts";
import type EquipmentSlot from "../Data/EquipmentSlot.ts";
import Fixture from "../Data/Fixture.ts";
import type Game from "../Data/Game.ts";
import type Interactable from "./Interactables/Interactable.ts";
import type InventoryItem from "../Data/InventoryItem.ts";
import type Exit from "../Data/Exit.ts";
import Moderator from "../Data/Moderator.ts";
import type Recipe from "../Data/Recipe.ts";
import Player from "../Data/Player.ts";
import RoomItem from "../Data/RoomItem.ts";
import ActionDirective from "./ActionDirective.ts";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.ts";
import InspectAction from "../Data/Actions/InspectAction.ts";
import TakeAction from "../Data/Actions/TakeAction.ts";
import DropAction from "../Data/Actions/DropAction.ts";
import StashAction from "../Data/Actions/StashAction.ts";
import UnstashAction from "../Data/Actions/UnstashAction.ts";
import EquipAction from "../Data/Actions/EquipAction.ts";
import UnequipAction from "../Data/Actions/UnequipAction.ts";
import CraftAction from "../Data/Actions/CraftAction.ts";
import UseAction from "../Data/Actions/UseAction.ts";
import InstantiateInventoryItemAction from "../Data/Actions/InstantiateInventoryItemAction.ts";
import InstantiateRoomItemAction from "../Data/Actions/InstantiateRoomItemAction.ts";
import DestroyInventoryItemAction from "../Data/Actions/DestroyInventoryItemAction.ts";
import DestroyRoomItemAction from "../Data/Actions/DestroyRoomItemAction.ts";
import { removeInteractablesFromMessage } from "../Modules/messageHandler.js";
import { capitalizeFirstLetter, getSortedItems } from "../Modules/helpers.ts";

/**
 * @class BotInteractableManager
 * @classdesc A set of functions for creating and managing Interactables.
 */
export default class BotInteractableManager {
	/**
	 * The game this belongs to.
	 */
    readonly #game: Game;
	/**
	 * A cache of recently-created Interactables, indexed by their custom IDs.
	 * This is used to look up Interactables when an interaction is received.
	 */
	readonly #interactableCache: Collection<string, Interactable>;
	/**
	 * The maximum number of Interactables to keep in the cache at once. If the cache exceeds this size, the oldest Interactable will be removed.
	 */
	readonly #interactableCacheSizeLimit = 500;
	/**
	 * A cache of messages with Interactables, indexed by message ID. This is used to keep track of which messages have interactables on them, so that we can disable those interactables when they're no longer valid.
	 */
    readonly #interactableMessageCache: Collection<InteractableMessage, string[]>;
	/**
	 * The maximum number of Interactable messages to keep in the cache at once. If the cache exceeds this size, the oldest message will be removed.
	 */
    readonly #interactableMessageCacheSizeLimit = 50;
    /**
     * The maximum amount of time that interactables are valid for.
     */
    readonly interactableValidTime = 5 * 60 * 1000;

	/**
	 * @constructor
	 * @param game - The game this belongs to.
	 */
	constructor(game: Game) {
		this.#game = game;
		this.#interactableCache = new Collection();
		this.#interactableMessageCache = new Collection();
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
	}

	/**
	 * Disables an interactable and removes it from the cache by its custom ID.
	 * @param customId
	 */
	disableInteractable(customId: string) {
		const interactable = this.#interactableCache.get(customId);
		if (interactable) {
			this.#interactableCache.delete(customId);
		}
	}

	/**
	 * Adds an interactable message to the cache, removing the oldest one if the cache size limit is exceeded.
	 * @param channelId - The ID of the channel the message is in.
	 * @param messageId - The ID of the message with interactables on it.
	 * @param interactableCustomIds - The custom IDs of the interactables on the message.
	 */
	addInteractableMessage(channelId: string, messageId: string, interactableCustomIds: string[]) {
		const key = { channelId: channelId, messageId: messageId };
		if (this.#interactableMessageCache.size >= this.#interactableMessageCacheSizeLimit)
			this.disableInteractableMessage(this.#interactableMessageCache.firstKey());
		this.#interactableMessageCache.set(key, interactableCustomIds);
		setTimeout(() => this.disableInteractableMessage(key), this.interactableValidTime);
	}

	/**
	 * Disables all interactables associated with a message and removes the message from the cache.
	 * @param interactableMessage - The message with interactables on it to disable.
	 */
	async disableInteractableMessage(interactableMessage: InteractableMessage) {
		const message = await this.#getInteractableMessage(interactableMessage);
		if (message) removeInteractablesFromMessage(message);
		const interactableCustomIds = this.#interactableMessageCache.get(interactableMessage);
		if (interactableCustomIds) {
			for (const customId of interactableCustomIds) {
				this.disableInteractable(customId);
			}
			this.#interactableMessageCache.delete(interactableMessage);
		}
	}

	/**
	 * Fetches a message from Discord by its channel ID and message ID, and returns it if it exists.
	 * @param interactableMessage - The message to fetch, represented by its channel ID and message ID.
	 */
	async #getInteractableMessage(interactableMessage: InteractableMessage) {
		const channel = await this.#game.botContext.client.channels.fetch(interactableMessage.channelId);
		if (!channel.isTextBased()) return;
		return await channel.messages.fetch(interactableMessage.messageId);
	}

    /**
     * Creates an action directive for the given action class and arguments, and generates a custom ID for it based on the player it's being created for.
     * @param actionClass - The action class to create an action directive for.
     * @param args - The arguments to create the action directive with. These will be passed to the action when it's performed.
     * @param player - The player this action directive is being created for.
     * @param user - The user this action directive is being created for. This is used to generate a unique custom ID for the directive, preventing conflicts with directives created for other users with the same action and arguments.
     */
    async #createActionDirective<T extends Action>(actionClass: { new(...args: any[]): T }, args: any[], player: Player, user: User): Promise<ActionDirective<T>> {
        const actionDirective = new ActionDirective(actionClass.prototype, player, args);
        const customId = await actionDirective.generateCustomId(user);
        actionDirective.setCustomId(customId);
        return actionDirective;
    }

    /**
     * Creates Pagination interactables for a given action.
     * @param action - The action these interactables are associated with.
     * @param prevPageCallback - The function to execute when the prev button is pressed.
     * @param nextPageCallback - The function to execute when the next button is pressed.
     */
    createPaginationInteractables(action: Action, prevPageCallback: (interaction: BotInteraction) => void, nextPageCallback: (interaction: BotInteraction) => void) {
        const pagePrevButton = new PagePrevInteractable(`${action.id} Prev Page`, prevPageCallback);
        this.addInteractable(pagePrevButton);
        const pageNextButton = new PageNextInteractable(`${action.id} Next Page`, nextPageCallback);
        this.addInteractable(pageNextButton);
        return [pagePrevButton, pageNextButton];
    }

	/**
	 * Creates QueueMoveAction interactables for a list of exits and adds them to the cache.
	 * @param exits - A list of exits to create interactables for.
	 * @param player - The player these interactables are being created for. This is used to determine which exits the player can use.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createQueueMoveActionInteractables(exits: Exit[], player: Player, user: User = player): Promise<ButtonInteractable[]> {
		const moveButtons: ButtonInteractable[] = [];
		const runButtons: ButtonInteractable[] = [];
		for (const exit of exits) {
			if (!player.hasBehaviorAttribute("disable move")) {
                const actionDirective = await this.#createActionDirective(QueueMoveAction, exit.getQueueMoveActionDirectiveArgs(player.location, false), player, user);
				const moveButton = new ButtonInteractable(actionDirective, `Move ${exit.name}`, ButtonStyle.Primary);
				this.addInteractable(moveButton);
				moveButtons.push(moveButton);
			}
			if (!player.hasBehaviorAttribute("disable run")) {
                const actionDirective = await this.#createActionDirective(QueueMoveAction, exit.getQueueMoveActionDirectiveArgs(player.location, true), player, user);
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
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createInspectActionInteractable(entities: Inspectable[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
		if (player.hasBehaviorAttribute("disable inspect") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable inspect")) return [];
		const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
		for (const entity of entities) {
            const actionDirective = await this.#createActionDirective(InspectAction, entity.getInspectActionDirectiveArgs(), player, user);
            if (menuOptions.has(actionDirective.customId)) continue;
			const label = entity instanceof Player ? entity.displayName : entity.name;
			const containerString = entity instanceof RoomItem ?
				entity.container instanceof RoomItem && entity.container.inventory.size > 1 ?
					` ${entity.container.getPreposition()} ${entity.slot} of ${entity.container.name}`
					: ` ${entity.container.getPreposition()} ${entity.container.name}`
				: "";
			const option = new StringSelectMenuOptionInteractable(actionDirective, label, actionDirective.customId, `Inspect ${label}${containerString}`);
			this.addInteractable(option);
			menuOptions.set(actionDirective.customId, option);
			if (menuOptions.size >= 25) break;
		}
		if (menuOptions.size === 0) return [];
        const actionDirective = await this.#createActionDirective(InspectAction, ["InspectAction Menu"], player, user);
		const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Inspect", 1);
		this.addInteractable(menu);
		return [menu];
	}

	/**
	 * Creates Interactables for a list of takeable room items and adds them to the cache.
	 * @param entities - A list of takeable room items to create StringSelectMenuOptionInteractables for.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createTakeActionInteractable(entities: RoomItem[], player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable take") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable take")) return [];
		if (entities.length > 2) {
			const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
			for (const entity of entities) {
                const actionDirective = await this.#createActionDirective(TakeAction, entity.getTakeActionDirectiveArgs(), player, user);
                if (menuOptions.has(actionDirective.customId)) continue;
				const containerString = entity.container instanceof RoomItem && entity.container.inventory.size > 1 ?
					` from ${entity.slot} of ${entity.container.name}`
						: ` from ${entity.container.name}`;
				const option = new StringSelectMenuOptionInteractable(actionDirective, entity.name, actionDirective.customId, `Take ${entity.name}${containerString}`);
				this.addInteractable(option);
				menuOptions.set(actionDirective.customId, option);
				if (menuOptions.size >= 25) break;
			}
			if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(TakeAction, ["TakeAction Menu"], player, user);
			const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Take", 2);
			this.addInteractable(menu);
			return [menu];
		}
		else {
			const takeButtons: ButtonInteractable[] = [];
			for (const entity of entities) {
                const actionDirective = await this.#createActionDirective(TakeAction, entity.getTakeActionDirectiveArgs(), player, user);
				const takeButton = new ButtonInteractable(actionDirective, `Take ${entity.name}`, ButtonStyle.Primary, 2);
				this.addInteractable(takeButton);
				takeButtons.push(takeButton);
			}
			return takeButtons;
		}
	}

	/**
	 * Creates Interactables for a list of droppable inventory items and adds them to the cache.
	 * @param entities - A list of takeable room items to create Interactables for.
	 * @param player - The player these interactables are being created for.
	 * @param container - The fixture or room item the player is dropping the items into.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createDropActionInteractables(entities: InventoryItem[], player: Player, container: RoomItemContainer, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable drop") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable drop")) return [];
		if (container instanceof RoomItem && container.inventory.size > 1) {
			const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
			for (const entity of entities) {
				for (const inventorySlot of container.inventory.values()) {
					if (inventorySlot.willBeOverFilledBy(entity)) continue;
                    const actionDirective = await this.#createActionDirective(DropAction, entity.getDropActionDirectiveArgs('RoomItem', container, inventorySlot), player, user);
                    if (menuOptions.has(actionDirective.customId)) continue;
					const option = new StringSelectMenuOptionInteractable(actionDirective, `${entity.name} ${container.getPreposition()} ${inventorySlot.id}`, actionDirective.customId, `Drop ${entity.name} ${container.getPreposition()} ${inventorySlot.id} of ${container.name}`);
					this.addInteractable(option);
					menuOptions.set(actionDirective.customId, option);
					if (menuOptions.size >= 25) break;
				}
			}
			if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(DropAction, ["DropAction Menu"], player, user);
			const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Drop");
			this.addInteractable(menu);
			return [menu];
		}
		else {
			const dropButtons: ButtonInteractable[] = [];
			for (const entity of entities) {
				const containerType = container instanceof RoomItem ? 'RoomItem' : container instanceof Fixture ? 'Fixture' : 'Puzzle';
				const inventorySlot = container instanceof RoomItem ? container.inventory.first() : undefined;
				if (inventorySlot && inventorySlot.willBeOverFilledBy(entity)) continue;
                const actionDirective = await this.#createActionDirective(DropAction, entity.getDropActionDirectiveArgs(containerType, container, inventorySlot), player, user);
				const dropButton = new ButtonInteractable(actionDirective, `Drop ${entity.name}`, ButtonStyle.Primary, 4);
				this.addInteractable(dropButton);
				dropButtons.push(dropButton);
			}
			return dropButtons;
		}
	}

	/**
	 * Creates Interactables for a list of stashable inventory items and adds them to the cache.
	 * @param entities - A list of stashable inventory items to create Interactables for.
	 * @param player - The player these interactables are being created for.
	 * @param viableContainers - A map of viable stash containers to the inventory slots the item can be stashed into. This is used to determine which stash options to create for each item.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createStashActionInteractables(entities: InventoryItem[], player: Player, viableContainers: Map<InventoryItem, string[]>, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable stash") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable stash")) return [];
		if (viableContainers.values().reduce((sum, inventorySlots) => sum + inventorySlots.length, 0) > 2) {
			const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
			for (const entity of entities) {
				for (const [container, inventorySlots] of viableContainers.entries()) {
					if (container.identifier === entity.identifier) continue;
					for (const inventorySlotId of inventorySlots) {
						const inventorySlot = container.inventory.get(inventorySlotId);
						if (!inventorySlot || inventorySlot.willBeOverFilledBy(entity)) continue;
                        const actionDirective = await this.#createActionDirective(StashAction, entity.getStashActionDirectiveArgs(container, inventorySlot), player, user);
                        if (menuOptions.has(actionDirective.customId)) continue;
						const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.name}` : container.name;
						const option = new StringSelectMenuOptionInteractable(actionDirective, `${entity.name} ${container.getPreposition()} ${containerName}`, actionDirective.customId, `Stash ${entity.name} ${container.getPreposition()} ${inventorySlot.id} of ${container.name}`);
						this.addInteractable(option);
						menuOptions.set(actionDirective.customId, option);
						if (menuOptions.size >= 25) break;
					}
				}
			}
			if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(StashAction, ["StashAction Menu"], player, user);
			const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Stash", 0);
			this.addInteractable(menu);
			return [menu];
		}
		else {
			const stashButtons: ButtonInteractable[] = [];
			for (const entity of entities) {
				for (const [container, inventorySlots] of viableContainers.entries()) {
					if (container.identifier === entity.identifier) continue;
					for (const inventorySlotId of inventorySlots) {
						const inventorySlot = container.inventory.get(inventorySlotId);
						if (!inventorySlot || inventorySlot.willBeOverFilledBy(entity)) continue;
                        const actionDirective = await this.#createActionDirective(StashAction, entity.getStashActionDirectiveArgs(container, inventorySlot), player, user);
						const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.name}` : container.name;
						const stashButton = new ButtonInteractable(actionDirective, `Stash ${entity.name} ${container.getPreposition()} ${containerName}`, ButtonStyle.Primary, 0);
						this.addInteractable(stashButton);
						stashButtons.push(stashButton);
					}
				}
			}
			return stashButtons;
		}
	}

	/**
	 * Creates Interactables for a list of unstashable inventory items and adds them to the cache.
	 * @param entities - A list of unstashable inventory items to create Interactables for.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createUnstashActionInteractables(entities: InventoryItem[], player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable unstash") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable unstash")) return [];
		const uniqueEntityNames = new Set(entities.map(entity => entity.name));
		if (entities.length > 4 || uniqueEntityNames.size !== entities.length) {
			const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
			for (const entity of entities) {
                const actionDirective = await this.#createActionDirective(UnstashAction, entity.getUnstashActionDirectiveArgs(), player, user);
                if (menuOptions.has(actionDirective.customId)) continue;
				const containerString = entity.container !== null && entity.container.inventory.size > 1 ?
					` from ${entity.slot} of ${entity.container.name}`
						: ` from ${entity.container.name}`;
				const option = new StringSelectMenuOptionInteractable(actionDirective, entity.name, actionDirective.customId, `Unstash ${entity.name}${containerString}`);
				this.addInteractable(option);
				menuOptions.set(actionDirective.customId, option);
				if (menuOptions.size >= 25) break;
			}
			if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(UnstashAction, ["UnstashAction Menu"], player, user);
			const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Unstash", 1);
			this.addInteractable(menu);
			return [menu];
		}
		else {
			const unstashButtons: ButtonInteractable[] = [];
			for (const entity of entities) {
                const actionDirective = await this.#createActionDirective(UnstashAction, entity.getUnstashActionDirectiveArgs(), player, user);
				const unstashButton = new ButtonInteractable(actionDirective, `Unstash ${entity.name}`, ButtonStyle.Primary, 2);
				this.addInteractable(unstashButton);
				unstashButtons.push(unstashButton);
			}
			return unstashButtons;
		}
	}

    /**
	 * Creates Interactables for a list of equippable inventory items and adds them to the cache.
     * @param equippableItems - A map of equippable items and the IDs of equipment slots they can be equipped to.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
    async createEquipActionInteractables(equippableItems: Map<InventoryItem, string[]>, player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        if (player.hasBehaviorAttribute("disable equip") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable equip")) return [];
        if (equippableItems.values().reduce((sum, equipmentSlots) => sum + equipmentSlots.length, 0) > 1) {
			const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
            for (const [heldItem, equipmentSlots] of equippableItems.entries()) {
                for (const equipmentSlotId of equipmentSlots) {
                    const equipmentSlot = player.inventory.get(equipmentSlotId);
                    if (!equipmentSlot || equipmentSlot.equippedItem !== null) continue;
                    const actionDirective = await this.#createActionDirective(EquipAction, heldItem.getEquipActionDirectiveArgs(equipmentSlot), player, user);
                    if (menuOptions.has(actionDirective.customId)) continue;
                    const option = new StringSelectMenuOptionInteractable(actionDirective, `${heldItem.name} to ${equipmentSlot.id}`, actionDirective.customId, `Equip ${heldItem.name} to ${equipmentSlot.id}`);
                    this.addInteractable(option);
                    menuOptions.set(actionDirective.customId, option);
                    if (menuOptions.size >= 25) break;
                }
            }
			if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(EquipAction, ["EquipAction Menu"], player, user);
			const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Equip", 2);
			this.addInteractable(menu);
			return [menu];
		}
		else {
			const equipButtons: ButtonInteractable[] = [];
            for (const [heldItem, equipmentSlots] of equippableItems.entries()) {
                for (const equipmentSlotId of equipmentSlots) {
                    const equipmentSlot = player.inventory.get(equipmentSlotId);
                    if (!equipmentSlot || equipmentSlot.equippedItem !== null) continue;
                    const actionDirective = await this.#createActionDirective(EquipAction, heldItem.getEquipActionDirectiveArgs(equipmentSlot), player, user);
                    const equipButton = new ButtonInteractable(actionDirective, `Equip ${heldItem.name}`, ButtonStyle.Secondary, 2);
                    this.addInteractable(equipButton);
                    equipButtons.push(equipButton);
                }
            }
			return equipButtons;
		}
    }

    /**
     * Creates StringSelectMenuInteractable for a list of unequippable inventory items and adds it to the cache.
     * @param unequippableItems - A list of unequippable inventory items to create StringSelectMenuOptionInteractables for.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async createUnequipActionInteractables(unequippableItems: InventoryItem[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
        if (player.hasBehaviorAttribute("disable unequip") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable unequip")) return [];
        const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
        for (const item of unequippableItems) {
            const actionDirective = await this.#createActionDirective(UnequipAction, item.getUnequipActionDirectiveArgs(), player, user);
            if (menuOptions.has(actionDirective.customId)) continue;
            const option = new StringSelectMenuOptionInteractable(actionDirective, item.name, actionDirective.customId, `Unequip ${item.name} from ${item.equipmentSlot}`);
            this.addInteractable(option);
            menuOptions.set(actionDirective.customId, option);
            if (menuOptions.size >= 25) break;
        }
        if (menuOptions.size === 0) return [];
        const actionDirective = await this.#createActionDirective(UnequipAction, ["UnequipAction Menu"], player, user);
        const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Unequip", 3);
        this.addInteractable(menu);
        return [menu];
    }

    /**
     * Creates Interactables for a crafting recipe and adds them to the cache.
     * @param recipe - The recipe that can be crafted.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async createCraftActionInteractables(recipe: Recipe, player: Player, user: User = player): Promise<ButtonInteractable[]> {
        if (player.hasBehaviorAttribute("disable craft") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable craft")) return [];
        const heldItems = getSortedItems(this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem));
        const actionDirective = await this.#createActionDirective(CraftAction, player.getCraftActionDirectiveArgs(heldItems[0], heldItems[1], recipe), player, user);
        const craftButton = new ButtonInteractable(actionDirective, `Craft ${heldItems[0].name} and ${heldItems[1].name}`, ButtonStyle.Success, 2);
        this.addInteractable(craftButton);
        return [craftButton];
    }

    /**
	 * Creates Interactables for a list of usable inventory items and adds them to the cache.
     * @param usableItems - An array of usable inventory items in the player's hands.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
    async createUseActionInteractables(usableItems: InventoryItem[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
        if (player.hasBehaviorAttribute("disable use") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable use")) return [];
        const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
        for (const item of usableItems) {
            const actionDirective = await this.#createActionDirective(UseAction, item.getUseActionDirectiveArgs(player), player, user);
            if (menuOptions.has(actionDirective.customId)) continue;
            const verb = item.prefab.secondPersonVerb ? capitalizeFirstLetter(item.prefab.secondPersonVerb) : "Use";
            const option = new StringSelectMenuOptionInteractable(actionDirective, item.name, actionDirective.customId, `${verb} ${item.name}`);
            this.addInteractable(option);
            menuOptions.set(actionDirective.customId, option);
            if (menuOptions.size >= 25) break;
        }
        if (menuOptions.size === 0) return [];
        const actionDirective = await this.#createActionDirective(UseAction, ["UseAction Menu"], player, user);
        const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Use", 3);
        this.addInteractable(menu);
        return [menu];
    }

    /**
     * Creates Interactables for a list of equipment slots and player inventory slots that can be instantiated to and adds them to the cache.
     * @param freeEquipmentSlots - An array of equipment slots with nothing equipped.
     * @param viableContainers - A map of viable inventory items with inventory slots an item can be instantiated into.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateInventoryItemActionInteractables(freeEquipmentSlots: EquipmentSlot[], viableContainers: Map<InventoryItem, string[]>, player: Player, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: { actionDirective: ActionDirective<InstantiateInventoryItemAction>, verb: string, label: string, description: string }[] = [];
        for (const equipmentSlot of freeEquipmentSlots) {
            if (equipmentSlot.equippedItem !== null) continue;
            const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, equipmentSlot.getPartialInstantiateActionDirectiveArgs(), player, user);
            const verb = `Instantiate to`;
            const label = `${equipmentSlot.id}`;
            const description = `${verb} ${equipmentSlot.id}`;
            interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
        }
        for (const [container, inventorySlots] of viableContainers.entries()) {
            for (const inventorySlotId of inventorySlots) {
                const inventorySlot = container.inventory.get(inventorySlotId);
                if (!inventorySlot || inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, container.getPartialInstantiateActionDirectiveArgs(inventorySlot), player ?? container.player, user);
                const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.getIdentifier()}` : container.getIdentifier();
                const verb = `Instantiate ${container.getPreposition()}`;
                const label = `${containerName}`;
                const description = `${verb} ${inventorySlot.id} of ${container.getIdentifier()}`;
                interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.verb} ${option.label}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                if (menuOptions.size >= 25) break;
                if (menuOptions.has(actionDirective.customId)) continue;
                const option = new StringSelectMenuOptionInteractable(actionDirective, interactableOption.label, actionDirective.customId, interactableOption.description, 1, true);
                this.addInteractable(option);
                menuOptions.set(actionDirective.customId, option);
            }
            if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, ["InstantiateInventoryItemAction Menu"], player, user);
            const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Instantiate", 0, true);
            this.addInteractable(menu);
            return [menu];
        }
        else {
            const instantiateButtons: ButtonInteractable[] = [];
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                const instantiateButton = new ButtonInteractable(actionDirective, `${interactableOption.verb} ${interactableOption.label}`, ButtonStyle.Success, 0, true);
                this.addInteractable(instantiateButton);
                instantiateButtons.push(instantiateButton);
            }
            return instantiateButtons;
        }
    }

    /**
     * Creates a modal interactable for a list of args and adds it to the cache.
     * This should only be called as a followup to createInstantiateInventoryItemActionInteractables to get the remaining required information.
     * @param args - An array of partial instantiate inventory item action directive args. ["II", equipmentSlotId, containerIdentifier, inventorySlotId]
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateInventoryItemActionModalInteractable(args: [string, string, string, string], player: Player, user: User): Promise<ModalInteractable> {
        const equipmentSlotId = args[1];
        const containerIdentifier = args[2];
        const inventorySlotId = args[3];
        const inputs: TextInputInteractable[] = [];
        inputs.push(new TextInputInteractable("Instantiate Inventory Item Prefab ID", "Prefab ID"));
        if (containerIdentifier)
            inputs.push(new TextInputInteractable("Instantiate Inventory Item Quantity", "Quantity", "Number.", true, "1"));
        inputs.push(new TextInputInteractable("Instantiate Inventory Item Uses", "Uses", "Number. If not provided, item will be instantiated with its default uses.", false));
        inputs.push(new TextInputInteractable("Instantiate Inventory Item Procedural Selections", "Procedural Selections", "Example: (color=metal + character=upa)", false, undefined, undefined, 5));
        const modalActionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, args.concat(["Modal"]), player, user);
        const description = containerIdentifier ? `Instantiate to ${inventorySlotId} of ${player.name}'s ${containerIdentifier}` : `Instantiate to ${player.name}'s ${equipmentSlotId}`;
        const modal = new ModalInteractable(modalActionDirective, "Instantiate Inventory Item", inputs, 0, description);
        this.addInteractable(modal);
        return modal;
    }

    /**
     * Creates Interactables for a list of room item containers that can be instantiated to and adds them to the cache.
     * @param viableContainers - A map of viable room item containers and (optionally) inventory slots an item can be instantiated into.
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateRoomItemActionInteractables(viableContainers: Map<RoomItemContainer, string[]>, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: { actionDirective: ActionDirective<InstantiateRoomItemAction>, verb: string, label: string, description: string }[] = [];
        for (const [container, inventorySlots] of viableContainers.entries()) {
            if (container instanceof RoomItem) {
                for (const inventorySlotId of inventorySlots) {
                    const inventorySlot = container.inventory.get(inventorySlotId);
                    if (!inventorySlot || inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                    const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, container.getPartialInstantiateActionDirectiveArgs(inventorySlot), undefined, user);
                    const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.getIdentifier()}` : container.getIdentifier();
                    const verb = `Instantiate ${container.getPreposition()}`;
                    const label = `${containerName}`;
                    const description = `${verb} ${inventorySlot.id} of ${container.getIdentifier()} at ${container.getLocation().displayName}`;
                    interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
                }
            }
            else {
                if (!container.canCurrentlyContainItems(true, true)) continue;
                const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, container.getPartialInstantiateActionDirectiveArgs(), undefined, user);
                const containerName = container.getContainerIdentifier();
                const verb = `Instantiate ${container.getPreposition()}`;
                const label = `${containerName}`;
                const description = `${verb} ${containerName} at ${container.getLocation().displayName}`;
                interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.verb} ${option.label}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                if (menuOptions.size >= 25) break;
                if (menuOptions.has(actionDirective.customId)) continue;
                const option = new StringSelectMenuOptionInteractable(actionDirective, interactableOption.label, actionDirective.customId, interactableOption.description, 1, true);
                this.addInteractable(option);
                menuOptions.set(actionDirective.customId, option);
            }
            if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, ["InstantiateRoomItemAction Menu"], undefined, user);
            const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Instantiate", 0, true);
            this.addInteractable(menu);
            return [menu];
        }
        else {
            const instantiateButtons: ButtonInteractable[] = [];
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                const instantiateButton = new ButtonInteractable(actionDirective, `${interactableOption.verb} ${interactableOption.label}`, ButtonStyle.Success, 0, true);
                this.addInteractable(instantiateButton);
                instantiateButtons.push(instantiateButton);
            }
            return instantiateButtons;
        }
    }

    /**
     * Creates a modal interactable for a list of args and adds it to the cache.
     * This should only be called as a followup to createInstantiateRoomItemActionInteractables to get the remaining required information.
     * @param args - An array of partial instantiate room item action directive args. ["??", identifier, location, preposition, .?, .?, destinationInventorySlot]
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateRoomItemActionModalInteractable(args: string[], user: User): Promise<ModalInteractable> {
        const containerIdentifier = args[1];
        const locationDisplayName = args[2];
        const preposition = args[3];
        const inventorySlotId = args.length === 7 && args[0] === "RI" ? args[6] : undefined;
        const containerPhrase = inventorySlotId ? `${inventorySlotId} of ${containerIdentifier}` : containerIdentifier;
        const inputs: TextInputInteractable[] = [];
        inputs.push(new TextInputInteractable("Instantiate Room Item Prefab ID", "Prefab ID"));
        inputs.push(new TextInputInteractable("Instantiate Room Item Quantity", "Quantity", "Number.", true, "1"));
        inputs.push(new TextInputInteractable("Instantiate Room Item Uses", "Uses", "Number. If not provided, item will be instantiated with its default uses.", false));
        inputs.push(new TextInputInteractable("Instantiate Room Item Procedural Selections", "Procedural Selections", "Example: (color=metal + character=upa)", false, undefined, undefined, 5));
        const modalActionDirective = await this.#createActionDirective(InstantiateRoomItemAction, args.concat(["Modal"]), undefined, user);
        const description = `Instantiate ${preposition} ${containerPhrase} at ${locationDisplayName}`;
        const modal = new ModalInteractable(modalActionDirective, "Instantiate Room Item", inputs, 0, description);
        this.addInteractable(modal);
        return modal;
    }

    /**
     * Creates Interactables for a list of destroyable inventory items and adds them to the cache.
     * @param destroyableItems - A list of destroyable inventory items to create Interactables for.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for.
     */
    async createDestroyInventoryItemActionInteractables(destroyableItems: InventoryItem[], player: Player, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: { actionDirective: ActionDirective<DestroyInventoryItemAction>, verb: string, label: string, description: string }[] = [];
        for (const item of destroyableItems) {
            const actionDirective = await this.#createActionDirective(DestroyInventoryItemAction, item.getDestroyActionDirectiveArgs(), player ?? item.player, user);
            let containerString: string;
            if (item.container !== null) {
                containerString = `${item.container.getPreposition()} `;
                if (item.container.inventory.size > 1) containerString += `${item.slot} of `;
                containerString += `${item.container.getIdentifier()}`;
            }
            else containerString = `equipped to ${item.equipmentSlot}`;
            const verb = `Destroy`;
            const label = `${item.getIdentifier()}`;
            const description = `${verb} ${item.getIdentifier()} ${containerString}`;
            interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.verb} ${option.label}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                if (menuOptions.size >= 25) break;
                if (menuOptions.has(actionDirective.customId)) continue;
                const option = new StringSelectMenuOptionInteractable(actionDirective, interactableOption.label, actionDirective.customId, interactableOption.description, 1);
                this.addInteractable(option);
                menuOptions.set(actionDirective.customId, option);
            }
            if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(DestroyInventoryItemAction, ["DestroyInventoryItemAction Menu"], player, user);
            const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Destroy", 0, false);
            this.addInteractable(menu);
            return [menu];
        }
        else {
            const destroyButtons: ButtonInteractable[] = [];
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                const destroyButton = new ButtonInteractable(actionDirective, `${interactableOption.verb} ${interactableOption.label}`, ButtonStyle.Danger, 0);
                this.addInteractable(destroyButton);
                destroyButtons.push(destroyButton);
            }
            return destroyButtons;
        }
    }

    /**
     * Creates Interactables for a list of destroyable room items and adds them to the cache.
     * @param itemContainers - A list of item containers to create Interactables for.
     * @param user - The user these interactables are being created for.
     */
    async createDestroyRoomItemActionInteractables(itemContainers: RoomItemContainer[], user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: { actionDirective: ActionDirective<DestroyRoomItemAction>, verb: string, label: string, description: string }[] = [];
        for (const container of itemContainers) {
            if (container instanceof RoomItem) {
                const actionDirective = await this.#createActionDirective(DestroyRoomItemAction, container.getDestroyRoomItemActionDirectiveArgs(), undefined, user);
                let containerString = `${container.container.getPreposition()} `;
                if (container.container instanceof RoomItem) {
                    if (container.container.inventory.size > 1) containerString += `${container.slot} of `;
                    containerString += `${container.container.getIdentifier()}`;
                }
                else containerString += `${container.container.getContainerIdentifier()}`
                containerString += ` at ${container.getLocation().displayName}`;
                const verb = `Destroy`;
                const label = `${container.getIdentifier()}`;
                const description = `${verb} ${container.getIdentifier()} ${containerString}`;
                interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
            }
            if (container.isItemContainer() && container.canCurrentlyContainItems(false, true) && !container.containsNoItems()) {
                const actionDirective = await this.#createActionDirective(DestroyRoomItemAction, container.getDestroyAllRoomItemActionDirectiveArgs(), undefined, user);
                const containerString = `${container.getPreposition()} ${container.getContainerIdentifier()}`;
                const verb = `Destroy`;
                const label = `All ${containerString}`;
                const description = `${verb} all ${containerString} at ${container.getLocation().displayName}`;
                interactableOptions.push({ actionDirective: actionDirective, verb: verb, label: label, description: description });
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.verb} ${option.label}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                if (menuOptions.size >= 25) break;
                if (menuOptions.has(actionDirective.customId)) continue;
                const option = new StringSelectMenuOptionInteractable(actionDirective, interactableOption.label, actionDirective.customId, interactableOption.description, 1);
                this.addInteractable(option);
                menuOptions.set(actionDirective.customId, option);
            }
            if (menuOptions.size === 0) return [];
            const actionDirective = await this.#createActionDirective(DestroyRoomItemAction, ["DestroyRoomItemAction Menu"], undefined, user);
            const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), "Destroy", 0, false);
            this.addInteractable(menu);
            return [menu];
        }
        else {
            const destroyButtons: ButtonInteractable[] = [];
            for (const interactableOption of interactableOptions) {
                const actionDirective = interactableOption.actionDirective;
                const destroyButton = new ButtonInteractable(actionDirective, `${interactableOption.verb} ${interactableOption.label}`, ButtonStyle.Danger, 0);
                this.addInteractable(destroyButton);
                destroyButtons.push(destroyButton);
            }
            return destroyButtons;
        }
    }

    /**
     * Generates an array of take interactables based on what the player is currently able to take.
     * @param container - The container the player can take items from.
     * @param containedItems - The items in the container that the player is able to take.
     * @param player - The player who can perform a take action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getTakeInteractables(container: RoomItemContainer, containedItems: RoomItem[], player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        let dropContainer = container;
        if (dropContainer instanceof Fixture && dropContainer.childPuzzle !== null && dropContainer.childPuzzle.isItemContainer()) dropContainer = container;
        if (dropContainer.canCurrentlyContainItems(false, user instanceof Moderator))
            interactables = interactables.concat(await this.createTakeActionInteractable(containedItems, player, user));
        return interactables;
    }

    /**
     * Generates an array of drop interactables based on what the player is currently able to drop.
     * @param container - The container the player can drop items into.
     * @param player - The player who can perform a drop action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getDropInteractables(container: RoomItemContainer, player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        let dropContainer = container;
        if (dropContainer instanceof Fixture && dropContainer.childPuzzle !== null && dropContainer.childPuzzle.isItemContainer())
            dropContainer = dropContainer.childPuzzle;
        if (dropContainer.canCurrentlyContainItems(true, user instanceof Moderator)) {
            if (dropContainer.isItemContainer()) {
                const droppableEntities = this.#game.entityFinder.getPlayerHands(player).filter(equipmentSlot => equipmentSlot.equippedItem !== null).map(equipmentSlot => equipmentSlot.equippedItem);
                if (droppableEntities.length !== 0) interactables = interactables.concat(await this.createDropActionInteractables(droppableEntities, player, dropContainer, user));
            }
        }
        return interactables;
    }

    /**
     * Generates an array of stash interactables based on what the player is currently able to stash.
     * @param player - The player who can perform a stash action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getStashInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const playerItems = this.#game.entityFinder.getInventoryItems(undefined, player.name);
        const heldItems = this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
        const playerContainerItems = playerItems.filter(item => item.inventory.size > 0);
        if (heldItems.length > 0 && playerContainerItems.length > 0) {
            const viableStashDestinations = new Map<InventoryItem, string[]>();
            // Get stash interactables.
            for (const heldItem of heldItems) {
                for (const containerItem of playerContainerItems) {
                    const viableInventorySlots: string[] = [];
                    for (const inventorySlot of containerItem.inventory.values()) {
                        if (inventorySlot.willBeOverFilledBy(heldItem)) continue;
                        viableInventorySlots.push(inventorySlot.id);
                    }
                    if (viableInventorySlots.length > 0) viableStashDestinations.set(containerItem, viableInventorySlots);
                }
            }
            interactables = interactables.concat(await this.createStashActionInteractables(heldItems, player, viableStashDestinations, user));
        }
        return interactables;
    }

    /**
     * Generates an array of unstash interactables based on what the player is currently able to unstash.
     * @param player - The player who can perform an unstash action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getUnstashInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const playerItems = this.#game.entityFinder.getInventoryItems(undefined, player.name);
        const playerFreeHand = this.#game.entityFinder.getPlayerFreeHand(player);
        const playerContainerItems = playerItems.filter(item => item.inventory.size > 0);
        if (playerFreeHand && playerContainerItems.length > 0) {
            const stashedItems = playerItems.filter(item => item.container !== null);
            if (stashedItems.length > 0) {
                interactables = interactables.concat(await this.createUnstashActionInteractables(stashedItems, player, user));
            }
        }
        return interactables;
    }

    /**
     * Generates an array of equip interactables based on what the player is currently able to equip.
     * @param player - The player who can perform an equip action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getEquipInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const hands = this.#game.entityFinder.getPlayerHands(player);
        const heldItems = hands.filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
        const handSlotIDs = hands.map(hand => hand.id);
        const freeEquipmentSlots = player.inventory.filter(equipmentSlot => !handSlotIDs.includes(equipmentSlot.id) && equipmentSlot.equippedItem === null);
        if (heldItems.length > 0 && freeEquipmentSlots.size > 0) {
            const equippableItems = new Map<InventoryItem, string[]>();
            for (const heldItem of heldItems) {
                if (!heldItem.prefab.equippable) continue;
                const viableEquipmentSlots: string[] = [];
                for (const equipmentSlotId of heldItem.prefab.equipmentSlots) {
                    if (freeEquipmentSlots.has(equipmentSlotId)) {
                        viableEquipmentSlots.push(equipmentSlotId);
                    }
                }
                if (viableEquipmentSlots.length > 0) equippableItems.set(heldItem, viableEquipmentSlots);
            }
            interactables = interactables.concat(await this.createEquipActionInteractables(equippableItems, player, user));
        }
        return interactables;
    }

    /**
     * Generates an array of unequip interactables based on what the player is currently able to unequip.
     * @param player - The player who can perform an unequip action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getUnequipInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const playerFreeHand = this.#game.entityFinder.getPlayerFreeHand(player);
        const handSlotIDs = this.#game.entityFinder.getPlayerHands(player).map(hand => hand.id);
        let unequippableItems = player.inventory.filter(equipmentSlot => !handSlotIDs.includes(equipmentSlot.id) && equipmentSlot.equippedItem !== null).map(equipmentSlot => equipmentSlot.equippedItem!);
        unequippableItems = unequippableItems.filter(item => item.prefab.equippable);
        if (playerFreeHand && unequippableItems.length > 0) {
            interactables = interactables.concat(await this.createUnequipActionInteractables(unequippableItems, player, user));
        }
        return interactables;
    }

    /**
     * Generates an array of craft interactables based on what the player is currently able to craft. Usually this is just one craft interactable.
     * @param player - The player who can perform a craft action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getCraftInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const heldItems = this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
        if (heldItems.length >= 2) {
            const items = getSortedItems(heldItems);
            const recipes = this.#game.entityFinder.getRecipes("crafting", undefined, items.map(item => item.prefab.id).join(", "));
            if (recipes.length === 0) return [];
            for (const recipe of recipes) {
                if (player.canCraft(recipe, [items[0], items[1]])) {
                    interactables = interactables.concat(await this.createCraftActionInteractables(recipe, player, user));
                    break;
                }
            }
        }
        return interactables;
    }

    /**
     * Generates an array of use interactables based on what the player is currently able to use.
     * @param player - The player who can perform a use action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getUseInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const heldItems = this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
        const usableItems = heldItems.filter(item => item.uses !== 0 && item.prefab.usable && item.usableOn(player));
        if (usableItems.length > 0) {
            interactables = interactables.concat(await this.createUseActionInteractables(usableItems, player, user));
        }
        return interactables;
    }

    /**
     * Generates an array of instantiate inventory item interactables based on the player's current inventory.
     * @param player - The player to instantiate an inventory item to.
     * @param user - The user these interactables are being created for.
     * @param freeEquipmentSlots - An array of equipment slots with nothing equipped. Optional.
     * @param containerItems - An array of inventory items that can contain items. Optional.
     */
    async getInstantiateInventoryItemInteractables(player: Player, user: User, freeEquipmentSlots?: EquipmentSlot[], containerItems?: InventoryItem[]): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (freeEquipmentSlots === undefined) freeEquipmentSlots = player.inventory.filter(equipmentSlot => equipmentSlot.equippedItem === null).map(equipmentSlot => equipmentSlot);
        if (containerItems === undefined) containerItems = this.#game.entityFinder.getInventoryItems(undefined, player.name).filter(item => item.inventory.size > 0);
        if (freeEquipmentSlots.length > 0 || containerItems.length > 0) {
            const viableStashDestinations = new Map<InventoryItem, string[]>();
            for (const containerItem of containerItems) {
                const viableInventorySlots: string[] = [];
                for (const inventorySlot of containerItem.inventory.values()) {
                    if (inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                    viableInventorySlots.push(inventorySlot.id);
                }
                if (viableInventorySlots.length > 0) viableStashDestinations.set(containerItem, viableInventorySlots);
            }
            interactables = interactables.concat(await this.createInstantiateInventoryItemActionInteractables(freeEquipmentSlots, viableStashDestinations, player, user));
        }
        return interactables;
    }

    /**
     * Generates an array of instantiate room item interactables based on the given item containers.
     * @param itemContainers - An array of room item containers that can potentially be instantiated into.
     * @param user - The user these interactables are being created for.
     */
    async getInstantiateRoomItemInteractables(itemContainers: RoomItemContainer[], user: User): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (itemContainers.length > 0) {
            const viableInstantiateDestinations = new Map<RoomItemContainer, string[]>();
            for (const itemContainer of itemContainers) {
                if (itemContainer instanceof RoomItem) {
                    const viableInventorySlots: string[] = [];
                    for (const inventorySlot of itemContainer.inventory.values()) {
                        if (inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                        viableInventorySlots.push(inventorySlot.id);
                    }
                    if (viableInventorySlots.length > 0) viableInstantiateDestinations.set(itemContainer, viableInventorySlots);
                }
                else if (itemContainer.isItemContainer() && itemContainer.canCurrentlyContainItems(true, true))
                    viableInstantiateDestinations.set(itemContainer, []);
            }
            interactables = interactables.concat(await this.createInstantiateRoomItemActionInteractables(viableInstantiateDestinations, user));
        }
        return interactables;
    }

    /**
     * Generates an array of destroy inventory item interactables based on the player's current inventory.
     * @param player - The player to destroy inventory items for.
     * @param user - The user these interactables are being created for.
     * @param equippedItems - An array of inventory items the player has equipped. Optional.
     * @param stashedItems - An array of inventory items the player has stashed. Optional.
     */
    async getDestroyInventoryItemInteractables(player: Player, user: User, equippedItems?: InventoryItem[], stashedItems?: InventoryItem[]): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (equippedItems === undefined) equippedItems = player.inventory.filter(equipmentSlot => equipmentSlot.equippedItem !== null).map(equipmentSlot => equipmentSlot.equippedItem);
        if (stashedItems === undefined) stashedItems = this.#game.entityFinder.getInventoryItems(undefined, player.name).filter(item => item.container !== null);
        if (equippedItems.length > 0 || stashedItems.length > 0) {
            interactables = interactables.concat(await this.createDestroyInventoryItemActionInteractables(equippedItems.concat(stashedItems), player, user));
        }
        return interactables;
    }

    /**
     * Generates an array of destroy room item interactables based on the given item containers.
     * @param itemContainers - The item containers to destroy inventory items for.
     * @param user - The user these interactables are being created for.
     */
    async getDestroyRoomItemInteractables(itemContainers: RoomItemContainer[], user: User): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (itemContainers.length > 0) {
            interactables = interactables.concat(await this.createDestroyRoomItemActionInteractables(itemContainers, user));
        }
        return interactables;
    }
}
