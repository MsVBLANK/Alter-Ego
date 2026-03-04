import type CollatedItem from "./CollatedItem.ts";
import Game from "./Game.ts";
import GameConstruct from "./GameConstruct.ts";
import type InventoryItem from "./InventoryItem.ts";
import type Prefab from "./Prefab.ts";
import type RoomItem from "./RoomItem.ts";

/**
 * Represents an ingredient or a product in a recipe.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe-item.html
 */
export default class RecipeItem extends GameConstruct {
    /**
     * This recipe item, expressed as a user-entered string.
     */
    readonly recipeItemString: string;
    /**
     * The prefab ID of this recipe item.
     */
    readonly prefabId: string;
    /**
     * The prefab of this recipe item.
     */
    prefab: Prefab;
    /**
     * A list of contained items, as a comma-separated string.
     */
    readonly containedItemsString: string;
    /**
     * An array of recipe items that are required to be contained inside of this recipe item if it is an ingredient,
     * or will be contained inside of it if it is a product.
     */
    containedItems: RecipeItem[];
    /**
     * The recipe item that contains this one. If this recipe item is not contained in another one, this is `null`.
     */
    container: RecipeItem | null;
    /**
     * The quantity of the item to be used or created.
     */
    readonly quantity: number;
    /**
     * The variable name to use for the quantity of this item when processing the recipe. Must be one letter in length.
     */
    readonly quantityVariableName: string;
    /**
     * The number of uses the item requires or will be produced with.
     */
    readonly uses: number;
    /**
     * The variable name to use for the uses of this item when processing the recipe. Must be one letter in length.
     */
    readonly usesVariableName: string;
    /**
     * Whether or not the quantity of this recipe item is constant. If a quantity is given, but it is not accompanied by a variable, it is assumed to be constant.
     */
    readonly quantityIsConstant: boolean;
    /**
     * Whether or not the uses of this recipe item is constant. If a number of uses is given, but it is not accompanied by a variable, it is assumed to be constant.
     */
    readonly usesIsConstant: boolean;
    /**
     * A regular expression for parsing ingredients and products strings.
     *
     * $1 - Quantity. Any number of digits.
     *
     * $2 - Variable name for quantity. Consists of one letter.
     *
     * $3 - Prefab ID.
     *
     * $4 - Number of uses. Any number of digits.
     *
     * $5 - Variable name for uses. Consists of one letter.
     *
     * $6 - Contained items string. This should be split by plus-sign (+) and checked against this regex separately.
     */
    static readonly itemRegex = /^(?:(\d+)([^\d\n\r])? )?([^\n\r\(\[\]]+)(?: ?\[(\d+)([^\d\n\r])?\])?(?: ?\(([^\n\r\(\)]+)\) ?)?$/i;

    /**
     * @param recipeItemString - A string representing a recipe item.
     * @param game - The game this belongs to.
     * @param type - The type of recipe this belongs to.
     */
    constructor(recipeItemString: string, game: Game, type: "processing" | "crafting") {
        super(game);
        this.recipeItemString = recipeItemString.trim();
        const matches = this.recipeItemString.match(RecipeItem.itemRegex);
        const quantityGiven = matches && matches[1];
        this.quantity = quantityGiven ? parseInt(matches[1]) : 1;
        this.quantityVariableName = matches && matches[2] ? matches[2].trim().toUpperCase() : '';
        this.prefabId = matches && matches[3] ? Game.generateValidEntityName(matches[3]) : '';
        const usesGiven = matches && matches[4];
        this.uses = usesGiven ? parseInt(matches[4]) : undefined;
        this.usesVariableName = matches && matches[5] ? matches[5].trim().toUpperCase() : '';
        this.containedItemsString = matches && matches[6] ? matches[6].trim() : null;
        this.containedItems = [];
        this.container = null;
        this.quantityIsConstant = (type === "crafting" ? true : quantityGiven) && this.quantityVariableName === '';
        this.usesIsConstant = (type === "crafting" ? true : usesGiven) && this.usesVariableName === '';
    }

    setPrefab(prefab: Prefab): void {
        this.prefab = prefab;
    }

    setContainer(container: RecipeItem): void {
        this.container = container;
    }

    /**
     * Returns true if the given item satisfies the quantity required of this recipe item.
     */
    quantitySatisfiedBy<T extends RoomItem | InventoryItem>(item: CollatedItem<T>): boolean {
        if (isNaN(item.quantity)) return true;
        return item.quantity >= this.quantity;
    }

    /**
     * Returns true if the given item satisfies the uses required of this recipe item.
     */
    usesSatisfiedBy<T extends RoomItem | InventoryItem>(item: CollatedItem<T>): boolean {
        if (isNaN(item.uses) || this.uses === undefined) return true;
        return item.uses >= this.uses;
    }

    /**
     * Calculates how many times the given ingredient use count satisfies the quantity of this recipe item.
     *
     * @param ingredientUseCount - How many times the ingredient is to be used.
     */
    getSatisfiedQuantityCount(ingredientUseCount: number): number {
        const satisfiedQuantityCount = ingredientUseCount / this.quantity;
        if (isNaN(satisfiedQuantityCount)) return NaN;
        return Math.floor(satisfiedQuantityCount);
    }

    /**
     * Calculates the number of uses to instantiate this recipe as a product with.
     *
     * @param satisfactoryProcessCount - How many times the given ingredients satisfy the current recipe.
     * @param variableValues - The variable values captured from the actual ingredients.
     */
    calculateUses(satisfactoryProcessCount: number, variableValues: Map<string, number>): number {
        if (!isNaN(this.uses) && !this.usesIsConstant) {
            if (this.usesVariableName !== "" && variableValues.has(this.usesVariableName)) return this.uses * variableValues.get(this.usesVariableName);
            else return this.uses * satisfactoryProcessCount;
        }
        else return this.uses;
    }

    /**
     * Returns a string to display this recipe item in a list of recipes list.
     */
    getDisplayString(): string {
        let displayString = "";
        if (this.quantityIsConstant || this.quantityVariableName === "") displayString = this.prefab.toContainingPhrase(this.quantity);
        else displayString = `${this.quantity}${this.quantityVariableName} ${this.prefab.pluralContainingPhrase}`;
        const containedItemsString = this.containedItems.map(containedItem => containedItem.getDisplayString()).join(', ');
        if (containedItemsString !== "") displayString += ` (${containedItemsString})`;
        return displayString;
    }
}
