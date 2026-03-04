import type CollatedItem from "./CollatedItem.ts";
import type Game from "./Game.ts";
import type InventoryItem from "./InventoryItem.ts";
import ItemContainer from "./ItemContainer.ts";
import type Prefab from "./Prefab.ts";
import type Recipe from "./Recipe.ts";
import type RoomItem from "./RoomItem.ts";

/**
 * Represents an item container that can process recipes.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe-processor.html
 */
export default abstract class RecipeProcessor extends ItemContainer {
    /**
     * @param game - The game this belongs to.
     * @param row  - The row number of the entity in the sheet.
     * @param description - A description which can contain an item list.
     */
    protected constructor(game: Game, row: number, description: string) {
        super(game, row, description);
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
     */
    instantiateProducts(recipe: Recipe, satisfactoryProcessCount: number, variableValues: Map<string, number> = new Map()): void {
        if (satisfactoryProcessCount < 1) return;
        for (const product of recipe.products) {
            if (recipe.isIngredientAndProduct(product))
                continue;
            const quantity = product.quantityIsConstant ? product.quantity : product.quantity * satisfactoryProcessCount;
            const uses = product.calculateUses(satisfactoryProcessCount, variableValues);
            if (product.prefab.inventory.size > 0) {
                for (let i = 0; i < quantity; i++) {
                    const instantiatedProduct = this.instantiate(product.prefab, 1, uses, new Map());
                    for (const childProduct of product.containedItems) {
                        const childQuantity = childProduct.quantityIsConstant ? childProduct.quantity : childProduct.quantity * satisfactoryProcessCount;
                        const childUses = childProduct.calculateUses(satisfactoryProcessCount, variableValues);
                        this.instantiate(childProduct.prefab, childQuantity, childUses, new Map(), instantiatedProduct, instantiatedProduct.inventory.firstKey());
                    }
                }
            }
            else this.instantiate(product.prefab, quantity, uses, new Map());
        }
    }

    protected abstract instantiate(prefab: Prefab, quantity: number, uses: number, proceduralSelections: Map<string, string>, container?: RoomItemContainer|InventoryItem, inventorySlotId?: string): RoomItem | InventoryItem;
}
