import type CollatedItem from "./CollatedItem.ts";
import type Game from "./Game.js";
import type InventoryItem from "./InventoryItem.js";
import ItemContainer from "./ItemContainer.js";
import type Prefab from "./Prefab.js";
import type Recipe from "./Recipe.js";
import type RoomItem from "./RoomItem.js";

/**
 * @class RecipeProcessor
 * @classdesc Represents an item container that can process recipes.
 * @extends ItemContainer
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe-processor.html
 */
export default abstract class RecipeProcessor extends ItemContainer {
    /**
     * @constructor
     * @param game - The game this belongs to.
     * @param row  - The row number of the entity in the sheet.
     * @param description - A description which can contain an item list.
     */
    constructor(game: Game, row: number, description: string) {
        super(game, row, description);
    }

    /**
     * Destroys the given ingredients.
     * @param recipe - The recipe being processed.
     * @param ingredients - The ingredients to destroy.
     * @param satisfactoryProcessCount - How many times the given ingredients satisfy the current recipe.
     */
    destroyIngredients(recipe: Recipe, ingredients: CollatedItem<RoomItem>[]|CollatedItem<InventoryItem>[], satisfactoryProcessCount: number) {
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
     * @param recipe - The recipe being processed.
     * @param satisfactoryProcessCount - How many times the given ingredients satisfy the current recipe.
     */
    instantiateProducts(recipe: Recipe, satisfactoryProcessCount: number) {
        if (satisfactoryProcessCount < 1) return;
		for (const product of recipe.products) {
			if (recipe.isIngredientAndProduct(product))
				continue;
			const quantity = product.quantityIsConstant ? product.quantity : product.quantity * satisfactoryProcessCount;
			const uses = !isNaN(product.uses) && !product.usesIsConstant ? product.uses * satisfactoryProcessCount : product.uses;
			if (product.prefab.inventory.size > 0) {
				for (let i = 0; i < quantity; i++) {
					const instantiatedProduct = this.instantiate(product.prefab, 1, uses, new Map());
					for (const childProduct of product.containedItems) {
						const childQuantity = childProduct.quantityIsConstant ? childProduct.quantity : childProduct.quantity * satisfactoryProcessCount;
						const childUses = !isNaN(childProduct.uses) && !childProduct.usesIsConstant ? childProduct.uses * satisfactoryProcessCount : childProduct.uses;
						this.instantiate(childProduct.prefab, childQuantity, childUses, new Map(), instantiatedProduct, instantiatedProduct.inventory.firstKey());
					}
				}
			}
			else this.instantiate(product.prefab, quantity, uses, new Map());
		}
    }

    protected abstract instantiate(prefab: Prefab, quantity: number, uses: number, proceduralSelections: Map<string, string>, container?: RoomItemContainer|InventoryItem, inventorySlotId?: string): RoomItem | InventoryItem;
}