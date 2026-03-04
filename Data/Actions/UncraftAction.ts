import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.ts";
import type Recipe from "../Recipe.ts";

/**
 * Represents an uncraft action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/uncraft-action.html
 */
export default class UncraftAction extends Action {
    /**
     * Crafts two ingredients into one or two products according to a recipe.
     *
     * @param item - The product to uncraft.
     * @param recipe - The recipe that describes how this product is crafted.
     */
    performUncraft(item: InventoryItem, recipe: Recipe): void {
        if (this.performed) return;
        super.perform();
        const originalItemPrefab = item.prefab;
        const itemId = item.getIdentifier();
        const uncraftingResult = this.player.uncraft(item, recipe);
        const uncraftedDescription = recipe.uncraftedDescription.parseFor(this.player, recipe);
        this.player.sendDescription(uncraftedDescription, recipe, recipe.uncraftedDescription.messageDisplayType ?? MessageDisplayType.STANDARD);
        this.getGame().narrationHandler.narrateUncraft(this, recipe, originalItemPrefab, item, uncraftingResult, this.player);
        this.getGame().logHandler.logUncraft(itemId, uncraftingResult, this.player, this.forced);
    }
}
