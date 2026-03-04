import { Collection } from "discord.js";
import type Game from "./Game.ts";
import InventorySlot from "./InventorySlot.ts";
import ItemContainer from "./ItemContainer.ts";
import type Player from "./Player.ts";
import type Prefab from "./Prefab.ts";
import type RecipeItem from "./RecipeItem.ts";

/**
 * Represents an instance of a prefab that actually exists in the game.
 */
export default abstract class ItemInstance extends ItemContainer {
	/**
	 * The ID of the prefab this item is an instance of.
	 */
    readonly prefabId: string;
	/**
	 * The prefab this item is an instance of.
	 */
	prefab: Prefab;
	/**
	 * The unique identifier given to the item if it is capable of containing other items.
	 */
	identifier: string;
	/**
	 * The name of the prefab.
	 */
	name: string;
	/**
	 * The pluralName of the prefab.
	 */
	pluralName: string;
	/**
	 * The singleContainingPhrase of the prefab.
	 */
	singleContainingPhrase: string;
	/**
	 * The pluralContainingPhrase of the prefab.
	 */
	pluralContainingPhrase: string;
	/**
	 * The type of the item's container. Either "Fixture", "RoomItem", "Puzzle", or "InventoryItem".
	 */
	containerType: string;
	/**
	 * The identifier of the container the item can be found in, and the ID of the {@link InventorySlot|inventory slot} it belongs to, separated by a forward slash.
	 */
	containerName: string;
	/**
	 * The item's actual container.
	 */
	container: ItemContainer;
	/**
	 * The ID of the {@link InventorySlot|inventory slot} the item can be found in.
	 */
	slot: string;
	/**
	 * How many identical instances of this item are in the given container.
	 */
	quantity: number;
	/**
	 * The number of times this item can be used.
	 */
	uses: number;
	/**
	 * The total weight in kilograms of this item, including all of the child items it contains.
	 */
	weight: number;
	/**
	 * A collection of {@link InventorySlot|inventory slots} the item has. The key is the inventory slot's ID.
	 */
	inventory: Collection<string, InventorySlot<ItemInstance>>;

	/**
	 * @param game - The game this belongs to.
	 * @param row - The row number of the item in the sheet.
	 * @param description - The description of the item. Can contain multiple item lists named after its inventory slots.
	 * @param prefabId - The ID of the prefab this item is an instance of.
	 * @param identifier - The unique identifier given to the item if it is capable of containing other items.
	 * @param containerType - The type of the item's container. Either "Fixture", "RoomItem", "Puzzle", or "InventoryItem".
	 * @param containerName - The identifier of the container the item can be found in, and the ID of the {@link InventorySlot|inventory slot} it belongs to, separated by a forward slash.
	 * @param quantity - How many identical instances of this item are in the given container.
	 * @param uses - The number of times this item can be used.
	 */
	protected constructor(game: Game, row: number, description: string, prefabId: string, identifier: string, containerType: string, containerName: string, quantity: number, uses: number) {
		super(game, row, description);
		this.prefabId = prefabId;
		this.identifier = identifier;
		this.containerType = containerType;
		this.containerName = containerName;
		this.slot = "";
		this.quantity = quantity;
		this.uses = uses;
		this.inventory = new Collection();
	}

	/**
	 * Gets the item's identifier, or its prefab ID if it doesn't have one.
	 */
	getIdentifier(): string {
		return this.identifier !== "" ? this.identifier : this.prefab ? this.prefab.id : "NULL";
	}
    
    public get size(): number {
        return this.prefab.size;
    }

	/**
	 * Sets the item's prefab and updates all relevant properties based on the prefab's properties. Does not set the item's description.
	 */
	setPrefab(prefab: Prefab): void {
		this.prefab = prefab;
		this.name = prefab.name ? prefab.name : "";
		this.pluralName = prefab.pluralName ? prefab.pluralName : "";
		this.singleContainingPhrase = prefab.singleContainingPhrase ? prefab.singleContainingPhrase : "";
		this.pluralContainingPhrase = prefab.pluralContainingPhrase ? prefab.pluralContainingPhrase : "";
		this.weight = prefab ? prefab.weight : 0;
	}

	/**
	 * Decreases the number of uses this item has left. If it runs out of uses, instantiates its nextStage in its place, if it has one.
     *
	 * @param player - The player who used this item, if applicable.
	 */
	abstract decreaseUses(player?: Player): void;

	/**
	 * Adds the given amount of weight to the item's weight.
	 * Also updates the weights of all items in its container chain.
     *
	 * @param weight - The amount of weight to add.
	 */
	protected addWeight(weight: number): void {
		const containerChain = new Set<number>();
		let container = this as ItemContainer;
		while (container instanceof ItemInstance) {
			if (containerChain.has(container.row)) break;
			container.weight += weight;
			containerChain.add(container.row);
			container = container.container;
		}
	}

	/**
	 * Subtracts the given amount of weight from the item's weight.
	 * Also updates the weights of all items in its container chain.
     *
	 * @param weight - The amount of weight to subtract.
	 */
	protected subtractWeight(weight: number): void {
		const containerChain = new Set<number>();
		let container = this as ItemContainer;
		while (container instanceof ItemInstance) {
			if (containerChain.has(container.row)) break;
			container.weight -= weight;
			containerChain.add(container.row);
			container = container.container;
		}
	}

	/**
	 * Returns true if the item instance's container matches the given recipe item's container.
	 */
	containerMatches(recipeItem: RecipeItem): boolean {
		return recipeItem.container === null || this.container instanceof ItemInstance && this.container.prefab.id === recipeItem.container.prefab.id;
	}

	/**
	 * Gets the item's single containing phrase.
	 */
	getContainingPhrase(): string {
		return this.singleContainingPhrase;
	}

	/**
	 * Gets the preposition of the item's prefab. If no prefab exists, returns "in".
	 */
	getPreposition(): string {
		return this.prefab ? this.prefab.preposition : "in";
	}

	/**
	 * Gets a phrase to refer to the given inventory slot in narrations. If the item has only one inventory slot, returns an empty string.
	 */
	getSlotPhrase(inventorySlot: InventorySlot<ItemInstance>): string {
		return this.inventory.size !== 1 ? `the ${inventorySlot.id} of ` : ``;
	}
}
