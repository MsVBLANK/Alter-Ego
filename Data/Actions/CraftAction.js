import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.js";

/** @import InventoryItem from "../InventoryItem.js" */
/** @import Recipe from "../Recipe.js" */

/**
 * @class CraftAction
 * @classdesc Represents a craft action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/craft-action.html
 */
export default class CraftAction extends Action {
	/**
     * Crafts two ingredients into one or two products according to a recipe.
     * @param {InventoryItem} item1 - The first ingredient.
     * @param {InventoryItem} item2 - The second ingredient.
     * @param {Recipe} recipe - The recipe that describes how these ingredients are crafted.
     */
	performCraft(item1, item2, recipe) {
		if (this.performed) return;
		super.perform();
		const item1Id = item1.getIdentifier();
    	const item2Id = item2.getIdentifier();
		const craftingResult = this.player.craft(item1, item2, recipe);
		const completedDescription = recipe.completedDescription.parseFor(this.player, recipe);
		this.player.sendDescription(completedDescription, recipe, recipe.completedDescription.messageDisplayType ?? MessageDisplayType.STANDARD);
		this.getGame().narrationHandler.narrateCraft(this, craftingResult, this.player);
		this.getGame().logHandler.logCraft(item1Id, item2Id, craftingResult, this.player, this.forced);
	}
}