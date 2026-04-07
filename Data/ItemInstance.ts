import { Collection } from "discord.js";
import type Game from "./Game.ts";
import InventorySlot from "./InventorySlot.ts";
import ItemContainer from "./ItemContainer.ts";
import type Player from "./Player.ts";
import type Prefab from "./Prefab.ts";
import type RecipeItem from "./RecipeItem.ts";
import type Room from "./Room.ts";

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
	 * The name of the item.
	 */
	name: string;
	/**
	 * The pluralName of the item.
	 */
	pluralName: string;
	/**
	 * The phrase that will be inserted in/removed from item tags when this item is added to/removed from an item list.
	 */
	singleContainingPhrase: string;
	/**
	 * The phrase that will be used in an item list when it contains multiple instances this item.
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
     * A map of procedurals in this item's description and the possibilities assigned to them.
     */
    proceduralSelections: Map<string, string>;

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
        this.setProceduralSelections();
	}

	/**
	 * Gets the item's identifier, or its prefab ID if it doesn't have one.
	 */
	getIdentifier(): string {
		return this.identifier !== "" ? this.identifier : this.prefab ? this.prefab.id : "NULL";
	}
    
    public get size(): number {
        return this.prefab?.size ?? 0;
    }

	/**
	 * Sets the item's prefab and updates all relevant properties based on the prefab's properties. Does not set the item's description.
	 */
	setPrefab(prefab: Prefab): void {
		this.prefab = prefab;
		this.weight = prefab ? prefab.weight : 0;
	}

    /**
     * The item's procedural selections represented as a string.
     */
    get proceduralSelectionsString(): string {
        const selectionsStrings: string[] = [];
        this.proceduralSelections.forEach((value, key) => selectionsStrings.push(`${key} = ${value}`));
        return `(${selectionsStrings.join(" + ")})`;
    }

    /**
     * Sets the item's procedural selections based off of the procedurals in its current description.
     * @protected
     */
    protected setProceduralSelections(): void {
        this.proceduralSelections = new Map();
        for (const procedural of this.description.procedurals) {
            if (procedural[1].size === 1)
                this.proceduralSelections.set(procedural[0], procedural[1].values().next().value);
        }
    }

    /**
     * Returns true if the item has the given procedural selection.
     * @param proceduralOption - A procedural name and possibility name.
     */
    private hasProceduralSelection(proceduralOption: [string, string]): boolean {
        if (!this.proceduralSelections.has(proceduralOption[0])) return false;
        return this.proceduralSelections.get(proceduralOption[0]) === proceduralOption[1];
    }

    /**
     * Sets the item's name, plural name, single containing phrase, and plural containing phrase, based off its procedural selections.
     */
    setNames(): void {
        // Initialize the names as empty strings in case there's already something there.
        this.name = "";
        this.pluralName = "";
        this.singleContainingPhrase = "";
        this.pluralContainingPhrase = "";
        
        for (const [[...proceduralOption], names] of this.prefab.possibleNames.entries()) {
            if (this.hasProceduralSelection(proceduralOption[0])) {
                this.name = names[0];
                this.pluralName = names[1];
                break;
            }
        }
        for (const [[...proceduralOption], containingPhrases] of this.prefab.possibleContainingPhrases.entries()) {
            if (this.hasProceduralSelection(proceduralOption[0])) {
                this.singleContainingPhrase = containingPhrases[0];
                this.pluralContainingPhrase = containingPhrases[1];
                break;
            }
        }
        // Fall back and set the prefab's first one, if any are empty.
        if (!this.name) this.name = !this.name && this.prefab.name ? this.prefab.name : "";
        if (!this.pluralName) this.pluralName = !this.pluralName && this.prefab.pluralName ? this.prefab.pluralName : "";
        if (!this.singleContainingPhrase) this.singleContainingPhrase = !this.singleContainingPhrase && this.prefab.singleContainingPhrase ? this.prefab.singleContainingPhrase : "";
        if (!this.pluralContainingPhrase) this.pluralContainingPhrase = !this.pluralContainingPhrase && this.prefab.pluralContainingPhrase ? this.prefab.pluralContainingPhrase : "";
    }

    /** Gets the entity's location. */
    abstract getLocation(): Room;

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
	 * Gets the item's single containing phrase. This is for use in narrations, notifications, and descriptions.
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
