import Description from "./Description.ts";
import type Game from "./Game.ts";
import GameEntity from "./GameEntity.ts";
import type ItemInstance from "./ItemInstance.ts";
import type Player from "./Player.ts";
import type Prefab from "./Prefab.ts";

/**
 * Represents a game entity that can contain items.
 */
export default abstract class ItemContainer extends GameEntity {
    /**
     * A description which can contain at least one item list.
     */
    description: Description;

    /**
     * @param game - The game this entity belongs to.
     * @param row - The row number of this entity on the spreadsheet.
     * @param description - A description which can contain at least one item list.
     */
    protected constructor(game: Game, row: number, description: string) {
        super(game, row);
        this.description = new Description(description, this, game);
    }

    /**
     * Gets this entity's description which can contain an item list.
     */
    getDescription(): Description {
        return this.description;
    }

    /**
     * Adds an item to the specified item list in the container's description.
     *
     * @deprecated
     * @param item - The item to add.
     * @param list - The item list to add the item to.
     * @param quantity - The quantity of the item to add. If none is provided, defaults to 1.
     */
    addItemToDescription(item: ItemInstance, list?: string, quantity?: number): void {
        //this.#setDescription(addItemToList(this.getDescription(), item, list, quantity));
    }

    /**
     * Removes an item from the specified item list in the container's description.
     *
     * @deprecated
     * @param item - The item to remove.
     * @param list - The item list to remove the item from.
     * @param quantity - The quantity of the item to remove. If none is provided, defaults to 1.
     */
    removeItemFromDescription(item: ItemInstance, list?: string, quantity?: number): void {
        //this.#setDescription(removeItemFromList(this.getDescription(), item, list, quantity));
    }

    /**
     * Gets all of the items this entity contains.
     *
     * @remarks
     * Implementation differs for each type of ItemContainer.
     */
    abstract getContainedItems(): ItemInstance[];

    /**
     * Gets all of the items that should appear in the given item list.
     *
     * @remarks
     * Implementation differs for each type of ItemContainer.
     *
     * @param itemListName - The name of the item list. Only required for ItemContainers which can have multiple item lists.
     * @param player - The player the description is being sent to. Optional.
     */
    protected abstract getContainedItemsForItemList(itemListName: string, player: Player): ItemInstance[];

    /**
     * Gets all of the items that should appear in the given item list and collates them. Items with the same prefab ID will be considered the same and have their quantities combined.
     *
     * @param itemListName - The name of the item list. Only required for ItemContainers which can have multiple item lists.
     * @param player - The player the description is being sent to. Optional.
     * @returns A map of unique prefabs in the item list, and their collated quantities.
     */
    getCollatedContainedItemsInItemList(itemListName?: string, player?: Player): Map<Prefab, number> {
        const containedItems = this.getContainedItemsForItemList(itemListName, player).reverse();
        const containedPrefabCounts: Map<Prefab, number> = new Map();
        for (const item of containedItems) {
            if (containedPrefabCounts.has(item.prefab)) {
                if (isNaN(item.quantity)) containedPrefabCounts.set(item.prefab, NaN);
                else containedPrefabCounts.set(item.prefab, containedPrefabCounts.get(item.prefab) + item.quantity);
            }
            else containedPrefabCounts.set(item.prefab, item.quantity);
        }
        return containedPrefabCounts;
    }

    /**
     * Returns true if this entity contains no items.
     */
    containsNoItems(): boolean {
        return this.getContainedItems().length === 0;
    }

    /**
     * Gets the combined weight of all the items this entity contains.
     */
    getContainedItemsWeight(): number {
        const containedItems = this.getContainedItems();
        return containedItems.reduce((total, item) => total + (!isNaN(item.quantity) ? item.quantity * item.weight : 0), 0);
    }

    abstract getContainerIdentifier(): string;
    abstract getContainerType(): string;
}
