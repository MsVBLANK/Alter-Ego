import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";

/** @import InventoryItem from "../InventoryItem.js" */
/** @import Recipe from "../Recipe.js" */

/**
 * @class UncraftAction
 * @classdesc Represents an uncraft action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/uncraft-action.html
 */
export default class UncraftAction extends Action {
	/**
	 * Crafts two ingredients into one or two products according to a recipe.
	 * @param {InventoryItem} item - The product to uncraft.
     * @param {Recipe} recipe - The recipe that describes how this product is crafted.
	 */
	performUncraft(item, recipe) {
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