import { Collection } from "discord.js";
import DestroyRoomItemAction from "./Actions/DestroyRoomItemAction.ts";
import InstantiateRoomItemAction from "./Actions/InstantiateRoomItemAction.ts";
import type Game from "./Game.ts";
import InventorySlot from "./InventorySlot.ts";
import ItemInstance from "./ItemInstance.ts";
import type Player from "./Player.ts";
import type Room from "./Room.ts";

/**
 * Represents an item in a room that a player can take with them.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/room_item.html
 */
export default class RoomItem extends ItemInstance {
    /**
     * The display name of the room the item can be found in.
     */
    locationDisplayName: string;
    /**
     * The room the item can be found in.
     */
    location: Room;
    /**
     * Whether the item can be interacted with.
     */
    accessible: boolean;
    /**
     * The item's actual container.
     */
    override container: RoomItemContainer = null;
    /**
     * A collection of {@link InventorySlot|inventory slots} the item has. The key is the inventory slot's ID.
     */
    override inventory: Collection<string, InventorySlot<RoomItem>> = new Collection();

    /**
     * @param prefabId - The ID of the prefab this item is an instance of.
     * @param identifier - The unique identifier given to the item if it is capable of containing other items.
     * @param locationDisplayName - The display name of the room the item can be found in.
     * @param accessible - Whether the item can be interacted with.
     * @param containerType - The type of the item's container. Either "Fixture", "RoomItem", or "Puzzle".
     * @param containerName - The type and identifier/name of the container the item can be found in, and the ID of the {@link InventorySlot|inventory slot} it belongs to, separated by a forward slash.
     * @param quantity - How many identical instances of this item are in the given container.
     * @param uses - The number of times this item can be used.
     * @param description - The description of the item. Can contain multiple item lists named after its inventory slots.
     * @param row - The row number of the item in the sheet.
     * @param game - The game this belongs to.
     */
    constructor(prefabId: string, identifier: string, locationDisplayName: string, accessible: boolean, containerType: string, containerName: string, quantity: number, uses: number, description: string, row: number, game: Game) {
        super(game, row, description, prefabId, identifier, containerType, containerName, quantity, uses);
        this.locationDisplayName = locationDisplayName;
        this.location = null;
        this.accessible = accessible;
        this.inventory = new Collection();
    }

    /**
     * Sets the location.
     */
    setLocation(room: Room): void {
        this.location = room;
    }

    /**
     * Sets the container.
     */
    setContainer(container: RoomItemContainer): void {
        this.container = container;
    }

    /**
     * Creates instances of all of the prefab's {@link InventorySlot|inventory slots} and inserts them into this instance's inventory.
     */
    initializeInventory(): void {
        this.prefab.inventory.forEach(prefabInventorySlot => {
            const items: RoomItem[] = [];
            const inventorySlot = new InventorySlot(
                prefabInventorySlot.id,
                prefabInventorySlot.capacity,
                prefabInventorySlot.takenSpace,
                prefabInventorySlot.weight,
                items
            );
            this.inventory.set(inventorySlot.id, inventorySlot);
        });
    }

    /**
     * Decreases the number of uses this item has left. If it runs out of uses, instantiates its nextStage in its place, if it has one.
     *
     * @param player - The player who used this item, if applicable.
     */
    override decreaseUses(player?: Player): void {
        this.uses--;
        if (this.uses === 0) {
            const nextStage = this.prefab.nextStage;
            const container = this.container;
            const slot = this.slot;
            const quantity = this.quantity;
            const destroyAction = new DestroyRoomItemAction(this.getGame(), undefined, player, this.location, true);
            destroyAction.performDestroyRoomItem(this, this.quantity, true);
            const instantiateAction = new InstantiateRoomItemAction(this.getGame(), undefined, player, this.location, true);
            instantiateAction.performInstantiateRoomItem(nextStage, container, slot, quantity, new Map());
        }
    }

    /**
     * Inserts an item into the specified slot.
     *
     * @param item - The item to insert.
     * @param slotId - The ID of the inventory slot to insert it in.
     */
    insertItem(item: RoomItem, slotId: string): void {
        if (item.quantity !== 0) {
            const inventorySlot = this.inventory.get(slotId);
            if (inventorySlot) inventorySlot.insertItem(item);
            if (!isNaN(item.quantity)) this.addWeight(item.weight * item.quantity);
        }
    }

    /**
     * Removes an item from the specified slot.
     *
     * @param item - The item to remove.
     * @param slotId - The ID of the inventory slot to remove it from.
     * @param removedQuantity - The quantity of this item to remove.
     */
    removeItem(item: RoomItem, slotId: string, removedQuantity: number): void {
        const inventorySlot = this.inventory.get(slotId);
        if (inventorySlot) inventorySlot.removeItem(item, removedQuantity);
        if (!isNaN(item.quantity)) this.subtractWeight(item.weight * removedQuantity);
    }

    /**
     * Gets a phrase to refer to the container in narrations.
     */
    getContainerPhrase(): string {
        let containerPhrase = "";
        if (this.container) containerPhrase = this.container.getContainingPhrase();
        return containerPhrase;
    }

    /**
     * Gets the preposition of the container.
     */
    getContainerPreposition(): string {
        let preposition = "in";
        if (this.container) preposition = this.container.getPreposition();
        return preposition;
    }

    /**
     * Gets the highest-level container of this item.
     */
    getTopContainer(): RoomItemContainer {
        let topContainer = this.container;
        while (topContainer !== null && topContainer instanceof RoomItem)
            topContainer = topContainer.container;
        if (!(topContainer instanceof RoomItem)) return topContainer;
    }

    /**
     * Sets the item as accessible.
     */
    setAccessible(): void {
        this.accessible = true;
    }

    /**
     * Sets the item as inaccessible.
     */
    setInaccessible(): void {
        this.accessible = false;
    }

    /** Gets the entity's location. */
    getLocation(): Room {
        return this.location;
    }

    /** Gets the item's container. */
    getContainer(): RoomItemContainer {
        return this.container;
    }

    /**
     * Returns the args for the Inspect ActionDirective for this room item.
     */
    getInspectActionDirectiveArgs(): string[] {
        return ["RI", this.getIdentifier(), this.location.id, this.containerType, this.containerName];
    }

    /**
     * Returns the args for the Take ActionDirective for this room item.
     */
    getTakeActionDirectiveArgs(): string[] {
        return [this.getIdentifier(), this.location.id, this.containerType, this.containerName];
    }

    /**
     * Returns the args for the DestroyRoomItem ActionDirective for this room item.
     * @returns ["RI", identifier, location, accessible, containerType, containerName, slotId]
     */
    getDestroyRoomItemActionDirectiveArgs(): [string, string, string, string, string, string, string] {
        return ["RI", this.getIdentifier(), this.location.id, undefined, this.containerType, this.container.getContainerIdentifier(), this.slot];
    }

    /**
     * Returns the args for the DestroyRoomItem ActionDirective for this room item.
     * @returns ["ALL", identifier, location, accessible, containerType, containerName, slotId]
     */
    getDestroyAllRoomItemActionDirectiveArgs(): [string, string, string, string, string, string, string] {
        return ["ALL", undefined, this.location.id, undefined, 'RoomItem', this.getIdentifier(), undefined];
    }

    /**
     * Returns true if the room item is capable of containing items.
     */
    isItemContainer(): boolean {
        return this.inventory.size > 0;
    }

    /**
     * Returns true if the room item is currently capable of being taken from/dropped into.
     * @param requireEmptySpace - Whether the container needs to be below max capacity. Defaults to true.
     */
    canCurrentlyContainItems(requireEmptySpace = true): boolean {
        let allInventorySlotsFilled = true;
        for (const inventorySlot of this.inventory.values()) {
            if (inventorySlot.takenSpace < inventorySlot.capacity) {
                allInventorySlotsFilled = false;
                break;
            }
        }
        return this.isItemContainer() && !requireEmptySpace || !allInventorySlotsFilled;
    }

    /**
     * Gets all of the items this entity contains.
     */
    override getContainedItems(): RoomItem[] {
        return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, undefined, 'RoomItem', this.identifier);
    }

    /**
	 * Gets all of the items that should appear in the given item list.
     *
	 * @param itemListName - The name of the item list. Only required if there is more than one item list.
	 * @param player - The player the description is being sent to. Unused.
	 */
	override getContainedItemsForItemList(itemListName?: string, player?: Player): RoomItem[] {
        return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, true, 'RoomItem', this.identifier, itemListName);
	}

    descriptionCell(): string {
        return this.getGame().constants.roomItemSheetDescriptionColumn + this.row;
    }

    getContainerIdentifier(): string {
        return this.getIdentifier();
    }

    getContainerType(): string {
        return "RoomItem";
    }
}
