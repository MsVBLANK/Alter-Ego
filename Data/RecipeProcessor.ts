import type { Duration } from "luxon";
import type Timer from "../Classes/Timer.ts";
import type CollatedItem from "./CollatedItem.ts";
import type Game from "./Game.ts";
import type InventoryItem from "./InventoryItem.ts";
import ItemContainer from "./ItemContainer.ts";
import type Player from "./Player.ts";
import type Prefab from "./Prefab.ts";
import type Recipe from "./Recipe.ts";
import type RoomItem from "./RoomItem.ts";

export interface Process<T extends RoomItem | InventoryItem> {
    /** The recipe being processed. */
    recipe?: Recipe;
    /** The ingredients used in the recipe. */
    ingredients?: CollatedItem<T>[];
    /** The products created during recipe processing. */
    products?: T[];
    /** How many times the given ingredients satisfy the recipe. Only set right before products are instantiated. */
    satisfactoryProcessCount?: number;
    /** The duration of the recipe. */
    duration?: Duration;
    /** The timer used to track the duration of the recipe. */
    timer?: Timer | null;
}

/**
 * Represents an item container that can process recipes.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe-processor.html
 */
export default abstract class RecipeProcessor extends ItemContainer {
    /**
     * The current recipe being processed, the ingredients being processed, the recipe's duration, and a timer counting down until the recipe finishes.
     */
    abstract process: Process<RoomItem | InventoryItem>;

    /**
     * @param game - The game this belongs to.
     * @param row  - The row number of the entity in the sheet.
     * @param description - A description which can contain an item list.
     */
    protected constructor(game: Game, row: number, description: string) {
        super(game, row, description);
    }

    /**
     * Sets the current process's recipe and duration to null, empties the process's lists of ingredients and products, and stops the process timer.
     */
    protected _clearProcess(): void {
        this.process.recipe = null;
        this.process.ingredients.length = 0;
        this.process.products.length = 0;
        this.process.satisfactoryProcessCount = 0;
        if (this.process.timer !== null)
            this.process.timer.stop();
        this.process.duration = null;
    }

    /**
     * Destroys the given ingredients.
     *
     * @param recipe - The recipe being processed.
     * @param ingredients - The ingredients to destroy.
     * @param satisfactoryProcessCount - How many times the given ingredients satisfy the current recipe.
     */
    destroyIngredients<T extends RoomItem | InventoryItem>(recipe: Recipe, ingredients: CollatedItem<T>[], satisfactoryProcessCount: number): void {
        if (satisfactoryProcessCount < 1) return;
		for (const ingredient of ingredients) {
            if (recipe.isIngredientAndProduct(ingredient) && !ingredient.allItemsHaveInfiniteUses())
				ingredient.decreaseUses(satisfactoryProcessCount);
			else if (recipe.isIngredientAndProduct(ingredient) && ingredient.allItemsHaveInfiniteUses())
				continue;
			else
				ingredient.destroy(satisfactoryProcessCount);
        }
    }

    /**
     * Instantiate the products for the current recipe.
     *
     * @param recipe - The recipe being processed.
     * @param satisfactoryProcessCount - How many times the given ingredients satisfy the current recipe.
     * @param variableValues - The variable values to use when instantiating the products.
     * @param proceduralSelections - The procedural selections to instantiate the the products with.
     * @param player - The player who caused this instantiation, if applicable.
     */
    instantiateProducts<T extends RoomItem | InventoryItem>(recipe: Recipe, satisfactoryProcessCount: number, variableValues: Map<string, number> = new Map(), proceduralSelections: Map<string, string> = new Map(), player?: Player): T[] {
        if (satisfactoryProcessCount < 1) return;
        let instantiatedProducts: T[] = [];
		for (const product of recipe.products) {
			if (recipe.isIngredientAndProduct(product))
				continue;
			const quantity = product.calculateQuantity(satisfactoryProcessCount);
			const uses = product.calculateUses(satisfactoryProcessCount, variableValues);
			const parentProducts = this.instantiate(product.prefab, quantity, uses, proceduralSelections, undefined, undefined, player);
            instantiatedProducts = instantiatedProducts.concat(parentProducts as T[]);
            let childProducts: T[] = [];
            if (product.prefab.inventory.size > 0) {
                for (const parentProduct of parentProducts) {
                    for (const childProduct of product.containedItems) {
                        const childQuantity = childProduct.calculateQuantity(satisfactoryProcessCount);
						const childUses = childProduct.calculateUses(satisfactoryProcessCount, variableValues);
                        childProducts = childProducts.concat(this.instantiate(childProduct.prefab, childQuantity, childUses, proceduralSelections, parentProduct, parentProduct.inventory.firstKey(), player) as T[]);
					}
                }
			}
            instantiatedProducts = instantiatedProducts.concat(childProducts);
		}
        return instantiatedProducts;
    }

    protected abstract instantiate(prefab: Prefab, quantity: number, uses: number, proceduralSelections: Map<string, string>, container?: RoomItemContainer|InventoryItem, inventorySlotId?: string, player?: Player): RoomItem[] | InventoryItem[];

    public abstract getIngredientItem(prefabId: string): Prefab | RoomItem | InventoryItem;
    public abstract getProductItem(prefabId: string): Prefab | RoomItem | InventoryItem;
}
