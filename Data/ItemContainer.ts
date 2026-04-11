import Description from "./Description.ts";
import type Game from "./Game.ts";
import GameEntity from "./GameEntity.ts";
import type ItemInstance from "./ItemInstance.ts";
import type Player from "./Player.ts";

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
	abstract getContainedItemsForItemList(itemListName: string, player: Player): ItemInstance[];

	/**
	 * Returns true if this entity contains no items.
	 */
	containsNoItems(): boolean {
		return this.getContainedItems().length === 0;
	}

    /**
     * Returns true if this entity contains an item with the given identifier or prefab ID.
     * @param identifier - The identifier or prefab ID to search for.
     */
    abstract containsItem(identifier: string): boolean;

    /**
     * Returns the item contained inside of this container with the given identifier or prefab ID.
     * If no such item exists, returns undefined. 
     * @param identifier - The identifier or prefab ID to search for.
     */
    abstract getContainedItem(identifier: string): ItemInstance;

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
