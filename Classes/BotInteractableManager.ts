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
import InventoryItem from "../Data/InventoryItem.ts";
import type Exit from "../Data/Exit.ts";
import Moderator from "../Data/Moderator.ts";
import Recipe from "../Data/Recipe.ts";
import Player from "../Data/Player.ts";
import RoomItem from "../Data/RoomItem.ts";
import ActionDirective from "./ActionDirective.ts";
import QueueMoveAction from "../Data/Actions/QueueMoveAction.ts";
import StopAction from "../Data/Actions/StopAction.ts";
import InspectAction from "../Data/Actions/InspectAction.ts";
import TakeAction from "../Data/Actions/TakeAction.ts";
import DropAction from "../Data/Actions/DropAction.ts";
import StashAction from "../Data/Actions/StashAction.ts";
import UnstashAction from "../Data/Actions/UnstashAction.ts";
import EquipAction from "../Data/Actions/EquipAction.ts";
import UnequipAction from "../Data/Actions/UnequipAction.ts";
import CraftAction from "../Data/Actions/CraftAction.ts";
import UncraftAction from "../Data/Actions/UncraftAction.ts";
import UseAction from "../Data/Actions/UseAction.ts";
import InstantiateInventoryItemAction from "../Data/Actions/InstantiateInventoryItemAction.ts";
import InstantiateRoomItemAction from "../Data/Actions/InstantiateRoomItemAction.ts";
import DestroyInventoryItemAction from "../Data/Actions/DestroyInventoryItemAction.ts";
import DestroyRoomItemAction from "../Data/Actions/DestroyRoomItemAction.ts";
import FindAction from "../Data/Actions/FindAction.ts";
import ViewAction, { type EntityField } from "../Data/Actions/ViewAction.ts";
import { removeInteractablesFromMessage } from "../Modules/messageHandler.js";
import { ActionPriority} from "../Modules/enums.js";
import { capitalizeFirstLetter, getSortedItems } from "../Modules/helpers.ts";
import ItemInstance from "../Data/ItemInstance.ts";

class InteractableOptions<T extends Action> {
    actionDirective: ActionDirective<T>;
    stringSelectLabel: string;
    buttonLabel: string;
    description: string;
    respondWithModal: boolean;
    constructor(actionDirective: ActionDirective<T>, buttonLabel?: string, stringSelectLabel?: string, description?: string, respondWithModal: boolean = false) {
        this.actionDirective = actionDirective;
        this.buttonLabel = buttonLabel;
        this.stringSelectLabel = stringSelectLabel;
        this.description = description;
        this.respondWithModal = respondWithModal;
    }
}

/**
 * A set of functions for creating and managing Interactables.
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
     * Creates a new button interactable and adds it to the cache.
     * @param buttonOptions - The options to create the interactable with.
     * @param style - The style to apply to the button.
     * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
     */
    #createButtonInteractable<T extends Action>(buttonOptions: InteractableOptions<T>, style: ButtonStyle, priority: number): ButtonInteractable {
        const button = new ButtonInteractable(buttonOptions.actionDirective, buttonOptions.buttonLabel, style, priority, buttonOptions.respondWithModal);
        this.addInteractable(button);
        return button;
    }

    /**
     * Creates an array of button interactables and adds them to the cache.
     * @param buttonOptions - An array of interactable options to create the buttons with.
     * @param style - The style to apply to the buttons.
     * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
     */
    #createButtonInteractables<T extends Action>(buttonOptions: InteractableOptions<T>[], style: ButtonStyle, priority: number): ButtonInteractable[] {
        const buttons: ButtonInteractable[] = [];
        for (const buttonOption of buttonOptions)
            buttons.push(this.#createButtonInteractable(buttonOption, style, priority));
        return buttons;
    }

    /**
     * Creates a new string select menu interactable with the given options and adds it to the cache.
     * @param actionDirective - The action directive to apply to the menu itself.
     * @param selectMenuOptions - The options to add to the menu.
     * @param placeholder - The placeholder text to display for the menu.
     * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
     */
    #createStringSelectMenuInteractable<T extends Action>(actionDirective: ActionDirective<T>, selectMenuOptions: InteractableOptions<T>[], placeholder: string, priority: number): StringSelectMenuInteractable[] {
        const menuOptions: Collection<string, StringSelectMenuOptionInteractable> = new Collection();
        for (const selectMenuOption of selectMenuOptions) {
            if (menuOptions.size >= 25) break;
            const actionDirective = selectMenuOption.actionDirective;
            if (menuOptions.has(actionDirective.customId)) continue;
            const option = new StringSelectMenuOptionInteractable(actionDirective, selectMenuOption.stringSelectLabel, actionDirective.customId, selectMenuOption.description, 0, selectMenuOption.respondWithModal);
            this.addInteractable(option);
            menuOptions.set(actionDirective.customId, option);
        }
        if (menuOptions.size === 0) return [];
        const menu = new StringSelectMenuInteractable(actionDirective, menuOptions.map(menuOption => menuOption), placeholder, priority);
        this.addInteractable(menu);
        return [menu];
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
				const buttonOptions = new InteractableOptions(actionDirective, `Move ${exit.name}`);
                moveButtons.push(this.#createButtonInteractable(buttonOptions, ButtonStyle.Primary, ActionPriority.QUEUE_MOVE));
			}
			if (!player.hasBehaviorAttribute("disable run")) {
                const actionDirective = await this.#createActionDirective(QueueMoveAction, exit.getQueueMoveActionDirectiveArgs(player.location, true), player, user);
                const buttonOptions = new InteractableOptions(actionDirective, `Run ${exit.name}`);
                runButtons.push(this.#createButtonInteractable(buttonOptions, ButtonStyle.Danger, ActionPriority.QUEUE_RUN));
			}
		}
		return moveButtons.concat(runButtons);
	}

    /**
     * Creates a StopAction interactable and adds it to the cache.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async createStopActionInteractable(player: Player, user: User = player): Promise<ButtonInteractable[]> {
        if (player.hasBehaviorAttribute("disable stop") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable stop")) return [];
        const actionDirective = await this.#createActionDirective(StopAction, [], player, user);
        const interactableOptions = new InteractableOptions(actionDirective, `Stop`);
        return [this.#createButtonInteractable(interactableOptions, ButtonStyle.Danger, ActionPriority.STOP)];
    }

	/**
	 * Creates StringSelectMenuInteractable for a list of inspectable game entities and adds it to the cache.
	 * @param entities - A list of inspectable game entities to create StringSelectMenuOptionInteractables for.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createInspectActionInteractable(entities: Inspectable[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
		if (player.hasBehaviorAttribute("disable inspect") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable inspect")) return [];
        const interactableOptions: InteractableOptions<InspectAction>[] = [];
		for (const entity of entities) {
            const actionDirective = await this.#createActionDirective(InspectAction, entity.getInspectActionDirectiveArgs(), player, user);
			const label = entity instanceof Player ? entity.displayName : entity.name;
			const containerString = entity instanceof ItemInstance  && entity.container ?
				entity.container instanceof ItemInstance && entity.container.inventory.size > 1 ?
					` ${entity.container.getPreposition()} ${entity.slot} of ${entity.container.name}`
					: ` ${entity.container.getPreposition()} ${entity.container.name}`
				: "";
            const description = `Inspect ${label}${containerString}`;
            interactableOptions.push(new InteractableOptions(actionDirective, label, label, description));
		}
        const actionDirective = await this.#createActionDirective(InspectAction, ["InspectAction Menu"], player, user);
        return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Inspect", ActionPriority.INSPECT);
	}

	/**
	 * Creates Interactables for a list of takeable room items and adds them to the cache.
	 * @param entities - A list of takeable room items to create StringSelectMenuOptionInteractables for.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createTakeActionInteractable(entities: RoomItem[], player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable take") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable take")) return [];
		const interactableOptions: InteractableOptions<TakeAction>[] = [];
        for (const entity of entities) {
            const actionDirective = await this.#createActionDirective(TakeAction, entity.getTakeActionDirectiveArgs(), player, user);
            const containerString = entity.container instanceof RoomItem && entity.container.inventory.size > 1 ?
                ` from ${entity.slot} of ${entity.container.name}`
                : ` from ${entity.container.name}`;
            const buttonLabel = `Take ${entity.name}`;
            const stringSelectLabel = entity.name;
            const description = `Take ${entity.name}${containerString}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
        }
        if (interactableOptions.length > 2) {
            const actionDirective = await this.#createActionDirective(TakeAction, ["TakeAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Take", ActionPriority.TAKE);
		}
		else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Primary, ActionPriority.TAKE);
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
		const interactableOptions: InteractableOptions<DropAction>[] = [];
        for (const entity of entities) {
            const containerType = container instanceof RoomItem ? 'RoomItem' : container instanceof Fixture ? 'Fixture' : 'Puzzle';
            const buttonLabel = `Drop ${entity.name}`;
            if (container instanceof RoomItem && container.inventory.size > 1) {
                for (const inventorySlot of container.inventory.values()) {
                    if (inventorySlot.willBeOverFilledBy(entity)) continue;
                    const actionDirective = await this.#createActionDirective(DropAction, entity.getDropActionDirectiveArgs(containerType, container, inventorySlot), player, user);
                    const stringSelectLabel = `${entity.name} ${container.getPreposition()} ${inventorySlot.id}`;
                    const description = `Drop ${entity.name} ${container.getPreposition()} ${inventorySlot.id} of ${container.name}`;
                    interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
                }
            }
            else {
                const inventorySlot = container instanceof RoomItem ? container.inventory.first() : undefined;
                if (inventorySlot && inventorySlot.willBeOverFilledBy(entity)) continue;
                const actionDirective = await this.#createActionDirective(DropAction, entity.getDropActionDirectiveArgs(containerType, container, inventorySlot), player, user);
                const stringSelectLabel = `${entity.name} ${container.getPreposition()} ${container.name}`;
                const description = `Drop ${entity.name} ${container.getPreposition()} ${container.name}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
            }
        }
        if (interactableOptions.length > 2) {
            const actionDirective = await this.#createActionDirective(DropAction, ["DropAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Drop", ActionPriority.DROP);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Primary, ActionPriority.DROP);
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
        const interactableOptions: InteractableOptions<StashAction>[] = [];
        for (const entity of entities) {
            for (const [container, inventorySlots] of viableContainers.entries()) {
                if (container.identifier === entity.identifier) continue;
                for (const inventorySlotId of inventorySlots) {
                    const inventorySlot = container.inventory.get(inventorySlotId);
                    if (!inventorySlot || inventorySlot.willBeOverFilledBy(entity)) continue;
                    const actionDirective = await this.#createActionDirective(StashAction, entity.getStashActionDirectiveArgs(container, inventorySlot), player, user);
                    const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.name}` : container.name;
                    const stringSelectLabel = `${entity.name} ${container.getPreposition()} ${containerName}`;
                    const buttonLabel = `Stash ${stringSelectLabel}`;
                    const description = `Stash ${entity.name} ${container.getPreposition()} ${inventorySlot.id} of ${container.name}`;
                    interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
                }
            }
        }
        if (viableContainers.values().reduce((sum, inventorySlots) => sum + inventorySlots.length, 0) > 2) {
            const actionDirective = await this.#createActionDirective(StashAction, ["StashAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Stash", ActionPriority.STASH);
		}
		else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Primary, ActionPriority.STASH);
	}

	/**
	 * Creates Interactables for a list of unstashable inventory items and adds them to the cache.
	 * @param entities - A list of unstashable inventory items to create Interactables for.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
	async createUnstashActionInteractables(entities: InventoryItem[], player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
		if (player.hasBehaviorAttribute("disable unstash") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable unstash")) return [];
		const interactableOptions: InteractableOptions<UnstashAction>[] = [];
        for (const entity of entities) {
            const actionDirective = await this.#createActionDirective(UnstashAction, entity.getUnstashActionDirectiveArgs(), player, user);
            const stringSelectLabel = `${entity.name}`;
            const buttonLabel = `Unstash ${stringSelectLabel}`;
            const containerString = entity.container !== null && entity.container.inventory.size > 1 ?
                ` from ${entity.slot} of ${entity.container.name}`
                : ` from ${entity.container.name}`;
            const description = `Unstash ${entity.name}${containerString}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
        }
        const uniqueEntityNames = new Set(entities.map(entity => entity.name));
		if (entities.length > 4 || uniqueEntityNames.size !== entities.length) {
            const actionDirective = await this.#createActionDirective(UnstashAction, ["UnstashAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Unstash", ActionPriority.UNSTASH);
		}
		else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Primary, ActionPriority.UNSTASH);
	}

    /**
	 * Creates Interactables for a list of equippable inventory items and adds them to the cache.
     * @param equippableItems - A map of equippable items and the IDs of equipment slots they can be equipped to.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
    async createEquipActionInteractables(equippableItems: Map<InventoryItem, string[]>, player: Player, user: User = player): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        if (player.hasBehaviorAttribute("disable equip") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable equip")) return [];
        const interactableOptions: InteractableOptions<EquipAction>[] = [];
        for (const [heldItem, equipmentSlots] of equippableItems.entries()) {
            for (const equipmentSlotId of equipmentSlots) {
                const equipmentSlot = player.inventory.get(equipmentSlotId);
                if (!equipmentSlot || equipmentSlot.equippedItem !== null) continue;
                const actionDirective = await this.#createActionDirective(EquipAction, heldItem.getEquipActionDirectiveArgs(equipmentSlot), player, user);
                const stringSelectLabel = `${heldItem.name} to ${equipmentSlot.id}`;
                const buttonLabel = `Equip ${heldItem.name}`;
                const description = `Equip ${heldItem.name} to ${equipmentSlot.id}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
            }
        }
        if (equippableItems.values().reduce((sum, equipmentSlots) => sum + equipmentSlots.length, 0) > 1) {
            const actionDirective = await this.#createActionDirective(EquipAction, ["EquipAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Equip", ActionPriority.EQUIP);
		}
		else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Secondary, ActionPriority.EQUIP);
    }

    /**
     * Creates StringSelectMenuInteractable for a list of unequippable inventory items and adds it to the cache.
     * @param unequippableItems - A list of unequippable inventory items to create StringSelectMenuOptionInteractables for.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async createUnequipActionInteractables(unequippableItems: InventoryItem[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
        if (player.hasBehaviorAttribute("disable unequip") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable unequip")) return [];
        const interactableOptions: InteractableOptions<UnequipAction>[] = [];
        for (const item of unequippableItems) {
            const actionDirective = await this.#createActionDirective(UnequipAction, item.getUnequipActionDirectiveArgs(), player, user);
            interactableOptions.push(new InteractableOptions(actionDirective, `Unequip ${item.name}`, `${item.name}`, `Unequip ${item.name} from ${item.equipmentSlot}`));
        }
        const actionDirective = await this.#createActionDirective(UnequipAction, ["UnequipAction Menu"], player, user);
        return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Unequip", ActionPriority.UNEQUIP);
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
        const interactableOptions = new InteractableOptions(actionDirective, `Craft ${heldItems[0].name} and ${heldItems[1].name}`);
        return [this.#createButtonInteractable(interactableOptions, ButtonStyle.Success, ActionPriority.CRAFT)];
    }

    /**
     * Creates Interactables for an uncraftable recipe and adds them to the cache.
     * @param recipe - The recipe that can be uncrafted.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async createUncraftActionInteractables(recipe: Recipe, player: Player, user: User = player): Promise<ButtonInteractable[]> {
        if (player.hasBehaviorAttribute("disable uncraft") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable uncraft")) return [];
        const heldItems = getSortedItems(this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem));
        const actionDirective = await this.#createActionDirective(UncraftAction, player.getUncraftActionDirectiveArgs(heldItems[0], recipe), player, user);
        const interactableOptions = new InteractableOptions(actionDirective, `Uncraft ${heldItems[0].name}`);
        return [this.#createButtonInteractable(interactableOptions, ButtonStyle.Secondary, ActionPriority.UNCRAFT)];
    }

    /**
	 * Creates Interactables for a list of usable inventory items and adds them to the cache.
     * @param usableItems - An array of usable inventory items in the player's hands.
	 * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for. Defaults to the given player.
	 */
    async createUseActionInteractables(usableItems: InventoryItem[], player: Player, user: User = player): Promise<StringSelectMenuInteractable[]> {
        if (player.hasBehaviorAttribute("disable use") || player.hasBehaviorAttribute("disable all") && !player.hasBehaviorAttribute("enable use")) return [];
        const interactableOptions: InteractableOptions<UseAction>[] = [];
        for (const item of usableItems) {
            const actionDirective = await this.#createActionDirective(UseAction, item.getUseActionDirectiveArgs(player), player, user);
            const verb = item.prefab.secondPersonVerb ? capitalizeFirstLetter(item.prefab.secondPersonVerb) : "Use";
            const stringSelectLabel = `${item.name}`;
            const description = `${verb} ${stringSelectLabel}`;
            interactableOptions.push(new InteractableOptions(actionDirective, description, stringSelectLabel, description));
        }
        const actionDirective = await this.#createActionDirective(UseAction, ["UseAction Menu"], player, user);
        return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Use", ActionPriority.USE);
    }

    /**
     * Creates Interactables for a list of equipment slots and player inventory slots that can be instantiated to and adds them to the cache.
     * @param freeEquipmentSlots - An array of equipment slots with nothing equipped.
     * @param viableContainers - A map of viable inventory items with inventory slots an item can be instantiated into.
     * @param player - The player these interactables are being created for.
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateInventoryItemActionInteractables(freeEquipmentSlots: EquipmentSlot[], viableContainers: Map<InventoryItem, string[]>, player: Player, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: InteractableOptions<InstantiateInventoryItemAction>[] = [];
        for (const equipmentSlot of freeEquipmentSlots) {
            if (equipmentSlot.equippedItem !== null) continue;
            const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, equipmentSlot.getPartialInstantiateActionDirectiveArgs(), player, user);
            const stringSelectLabel = `${equipmentSlot.id}`;
            const buttonLabel = `Instantiate to ${stringSelectLabel}`;
            const description = `Instantiate to ${equipmentSlot.id}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description, true));
        }
        for (const [container, inventorySlots] of viableContainers.entries()) {
            for (const inventorySlotId of inventorySlots) {
                const inventorySlot = container.inventory.get(inventorySlotId);
                if (!inventorySlot || inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, container.getPartialInstantiateActionDirectiveArgs(inventorySlot), player ?? container.player, user);
                const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.getIdentifier()}` : container.getIdentifier();
                const stringSelectLabel = `${containerName}`;
                const buttonLabel = `Instantiate ${container.getPreposition()} ${stringSelectLabel}`;
                const description = `Instantiate ${container.getPreposition()} ${inventorySlot.id} of ${container.getIdentifier()}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description, true));
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.buttonLabel}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const actionDirective = await this.#createActionDirective(InstantiateInventoryItemAction, ["InstantiateInventoryItemAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Instantiate", ActionPriority.INSTANTIATE);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Success, ActionPriority.INSTANTIATE);
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
        const modal = new ModalInteractable(modalActionDirective, "Instantiate Inventory Item", inputs, ActionPriority.INSTANTIATE, description);
        this.addInteractable(modal);
        return modal;
    }

    /**
     * Creates Interactables for a list of room item containers that can be instantiated to and adds them to the cache.
     * @param viableContainers - A map of viable room item containers and (optionally) inventory slots an item can be instantiated into.
     * @param user - The user these interactables are being created for.
     */
    async createInstantiateRoomItemActionInteractables(viableContainers: Map<RoomItemContainer, string[]>, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: InteractableOptions<InstantiateRoomItemAction>[] = [];
        for (const [container, inventorySlots] of viableContainers.entries()) {
            if (container instanceof RoomItem) {
                for (const inventorySlotId of inventorySlots) {
                    const inventorySlot = container.inventory.get(inventorySlotId);
                    if (!inventorySlot || inventorySlot.takenSpace >= inventorySlot.capacity) continue;
                    const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, container.getPartialInstantiateActionDirectiveArgs(inventorySlot), undefined, user);
                    const containerName = container.inventory.size > 1 ? `${inventorySlot.id} of ${container.getIdentifier()}` : container.getIdentifier();
                    const stringSelectLabel = `${containerName}`;
                    const buttonLabel = `Instantiate ${container.getPreposition()} ${stringSelectLabel}`;
                    const description = `Instantiate ${container.getPreposition()} ${inventorySlot.id} of ${container.getIdentifier()} at ${container.getLocation().displayName}`;
                    interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description, true));
                }
            }
            else {
                if (!container.canCurrentlyContainItems(true, true)) continue;
                const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, container.getPartialInstantiateActionDirectiveArgs(), undefined, user);
                const containerName = container.getContainerIdentifier();
                const stringSelectLabel = `${containerName}`;
                const buttonLabel = `Instantiate ${container.getPreposition()} ${stringSelectLabel}`;
                const description = `Instantiate ${container.getPreposition()} ${containerName} at ${container.getLocation().displayName}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description, true));
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => `${option.buttonLabel}`));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const actionDirective = await this.#createActionDirective(InstantiateRoomItemAction, ["InstantiateRoomItemAction Menu"], undefined, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Instantiate", ActionPriority.INSTANTIATE);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Success, ActionPriority.INSTANTIATE);
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
        const modal = new ModalInteractable(modalActionDirective, "Instantiate Room Item", inputs, ActionPriority.INSTANTIATE, description);
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
        const interactableOptions: InteractableOptions<DestroyInventoryItemAction>[] = [];
        for (const item of destroyableItems) {
            const actionDirective = await this.#createActionDirective(DestroyInventoryItemAction, item.getDestroyActionDirectiveArgs(), player ?? item.player, user);
            let containerString: string;
            if (item.container !== null) {
                containerString = `${item.container.getPreposition()} `;
                if (item.container.inventory.size > 1) containerString += `${item.slot} of `;
                containerString += `${item.container.getIdentifier()}`;
            }
            else containerString = `equipped to ${item.equipmentSlot}`;
            const stringSelectLabel = `${item.getIdentifier()}`;
            const buttonLabel = `Destroy ${stringSelectLabel}`;
            const description = `${buttonLabel} ${containerString}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => option.buttonLabel));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const actionDirective = await this.#createActionDirective(DestroyInventoryItemAction, ["DestroyInventoryItemAction Menu"], player, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Destroy", ActionPriority.DESTROY);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Danger, ActionPriority.DESTROY);
    }

    /**
     * Creates Interactables for a list of destroyable room items and adds them to the cache.
     * @param itemContainers - A list of item containers to create Interactables for.
     * @param user - The user these interactables are being created for.
     */
    async createDestroyRoomItemActionInteractables(itemContainers: RoomItemContainer[], user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: InteractableOptions<DestroyRoomItemAction>[] = [];
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
                const stringSelectLabel = `${container.getIdentifier()}`;
                const buttonLabel = `Destroy ${stringSelectLabel}`;
                const description = `${buttonLabel} ${containerString}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
            }
            if (container.isItemContainer() && container.canCurrentlyContainItems(false, true) && !container.containsNoItems()) {
                const actionDirective = await this.#createActionDirective(DestroyRoomItemAction, container.getDestroyAllRoomItemActionDirectiveArgs(), undefined, user);
                const containerString = `${container.getPreposition()} ${container.getContainerIdentifier()}`;
                const stringSelectLabel = `All ${containerString}`;
                const buttonLabel = `Destroy all ${containerString}`;
                const description = `${buttonLabel} at ${container.getLocation().displayName}`;
                interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
            }
        }
        const uniqueButtonLabels = new Set(interactableOptions.map(option => option.buttonLabel));
        if (interactableOptions.length > 2 || uniqueButtonLabels.size !== interactableOptions.length) {
            const actionDirective = await this.#createActionDirective(DestroyRoomItemAction, ["DestroyRoomItemAction Menu"], undefined, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Destroy", ActionPriority.DESTROY);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Danger, ActionPriority.DESTROY);
    }

    /**
     * Creates Interactables to find entities using the given args generator function and adds them to the cache.
     * @param argsSets - Sets of args to be passed into performFind as search queries.
     * @param user - The user these interactables are being created for.
     */
    async createFindActionInteractables(argsSets: [string][], user: User): Promise<StringSelectMenuInteractable[]> {
        const interactableOptions: InteractableOptions<FindAction>[] = [];
        for (const args of argsSets) {
            const actionDirective = await this.#createActionDirective(FindAction, args, undefined, user);
            const stringSelectLabel = `${args[0]}`;
            const buttonLabel = `Find ${stringSelectLabel}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, buttonLabel));
        }
        const actionDirective = await this.#createActionDirective(FindAction, ["FindAction Menu"], undefined, user);
        return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Find", ActionPriority.FIND);
    }

    /**
     * Creates Interactables for an item container's list of items and adds them to the cache.
     * @param container - The container to search in.
     * @param user - The user these interactables are being created for.
     */
    async createFindContainedItemsActionInteractables(container: RoomItemContainer|InventoryItem, user: User): Promise<(ButtonInteractable | StringSelectMenuInteractable)[]> {
        const interactableOptions: InteractableOptions<FindAction>[] = [];
        let inventorySlotIDs: string[] = [undefined];
        if ((container instanceof RoomItem || container instanceof InventoryItem) && container.inventory.size > 1) {
            for (const inventorySlot of container.inventory.values()) {
                if (!inventorySlot.containsNoItems()) inventorySlotIDs.push(inventorySlot.id);
            }
        }
        for (const inventorySlotID of inventorySlotIDs) {
            const actionDirective = await this.#createActionDirective(FindAction, container.getFindChildItemsActionDirectiveArgs(inventorySlotID), undefined, user);
            let containerString = `${container.getPreposition()} `;
            const slotPhrase = inventorySlotID ? `${inventorySlotID} of ` : ``;
            const stringSelectLabel = `${slotPhrase}${container.getContainerIdentifier()}`;
            containerString += `${stringSelectLabel}`;
            const buttonLabel = `Find Contained Items`;
            const description = `Find items ${containerString}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
        }
        if (interactableOptions.length > 1) {
            const actionDirective = await this.#createActionDirective(FindAction, ["FindContainedItemsAction Menu"], undefined, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "Find Contained Items", ActionPriority.FIND);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Secondary, ActionPriority.FIND);
    }

    /**
     * Creates Interactables for a list of fields of the given game entity and adds them to the cache.
     * @param entity - The entity to view.
     * @param fields - The fields of the given entity to create view interactables for.
     * @param user - The user these interactables are being created for.
     * @returns An array of button interactables, if the number of fields is less than or equal to 5. Otherwise, returns an array containing one string select menu interactable.
     */
    async createViewFieldActionInteractables<T extends PersistentGameEntity>(entity: T, fields: EntityField<T>[], user: User): Promise<(ButtonInteractable|StringSelectMenuInteractable)[]> {
        const interactableOptions: InteractableOptions<ViewAction>[] = [];
        for (const field of fields) {
            const actionDirective = await this.#createActionDirective(ViewAction, [entity.getEntityType(), entity.row, field], undefined, user);
            const stringSelectLabel = entity.getLabel(field);
            const buttonLabel = `View ${stringSelectLabel}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, buttonLabel));
        }
        if (fields.length > 5) {
            const actionDirective = await this.#createActionDirective(ViewAction, ["ViewFieldAction Menu"], undefined, user);
            return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, `View Field of ${entity.getEntityID()}`, ActionPriority.VIEW_FIELD);
        }
        else return this.#createButtonInteractables(interactableOptions, ButtonStyle.Primary, ActionPriority.VIEW_FIELD);
    }

    /**
     * Creates Interactables for a list of persistent game entities and adds them to the cache.
     * @param entities - A list of entities to view.
     * @param user - The user these interactables are being created for.
     */
    async createViewActionInteractables(entities: PersistentGameEntity[], user: User): Promise<StringSelectMenuInteractable[]> {
        const interactableOptions: InteractableOptions<ViewAction>[] = [];
        for (const entity of entities) {
            const actionDirective = await this.#createActionDirective(ViewAction, [entity.getEntityType(), entity.row], undefined, user);
            const stringSelectLabel = `${entity.getEntityID()}`;
            const buttonLabel = `View ${stringSelectLabel}`;
            let description: string;
            if (entity instanceof Recipe) description = `View ${entity.getEntityType()} on row ${entity.row}`;
            else description = `View ${entity.getEntityType()} ${entity.getEntityID()} on row ${entity.row}`;
            interactableOptions.push(new InteractableOptions(actionDirective, buttonLabel, stringSelectLabel, description));
        }
        const actionDirective = await this.#createActionDirective(ViewAction, ["ViewAction Menu"], undefined, user);
        return this.#createStringSelectMenuInteractable(actionDirective, interactableOptions, "View Entity", ActionPriority.VIEW);
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
        const playerFreeHand = this.#game.entityFinder.getPlayerFreeHand(player);
        let dropContainer = container;
        if (dropContainer instanceof Fixture && dropContainer.childPuzzle !== null && dropContainer.childPuzzle.isItemContainer()) dropContainer = container;
        if (playerFreeHand && dropContainer.canCurrentlyContainItems(false, user instanceof Moderator))
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
     * Generates an array of uncraft interactables based on what the player is currently able to uncraft. This is always just one uncraft interactable.
     * @param player - The player who can perform an uncraft action.
     * @param user - The user these interactables are being created for. Defaults to the given player.
     */
    async getUncraftInteractables(player: Player, user: User = player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        const heldItems = this.#game.entityFinder.getPlayerHands(player).filter(hand => hand.equippedItem !== null).map(hand => hand.equippedItem);
        const playerFreeHand = this.#game.entityFinder.getPlayerFreeHand(player);
        if (heldItems.length === 1 && playerFreeHand) {
            const item = heldItems[0];
            const recipe = this.#game.entityFinder.getRecipes("uncraftable", undefined, undefined, item.prefab.id)[0];
            if (recipe)
                interactables = interactables.concat(await this.createUncraftActionInteractables(recipe, player, user));
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

    /**
     * Generates an array of find interactables that find all of the items contained inside the given container.
     * @param container - The container to search in.
     * @param user - The user these interactables are being created for.
     */
    async getFindContainedItemsInteractables(container: RoomItemContainer|InventoryItem, user: User): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (container && !container.containsNoItems())
            interactables = interactables.concat(await this.createFindContainedItemsActionInteractables(container, user));
        return interactables;
    }

    /**
     * Generates an array of view interactables based on the given entity, fields, and related entities.
     * @param entity - The entity to view.
     * @param fields - The fields of the given entity to create view interactables for. These will usually result in the creation of button interactables.
     * @param relatedEntities - Related entities to view. These will always be collated into a string select menu interactable.
     * @param user - The user these interactables are being created for.
     */
    async getViewInteractables<T extends PersistentGameEntity>(entity: T, fields: EntityField<T>[], relatedEntities: PersistentGameEntity[], user: User): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (entity && fields.length > 0)
            interactables = interactables.concat(await this.createViewFieldActionInteractables(entity, fields, user));
        if (relatedEntities.length > 0)
            interactables = interactables.concat(await this.createViewActionInteractables(relatedEntities, user));
        return interactables;
    }
}
