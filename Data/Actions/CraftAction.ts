import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import type InventoryItem from "../InventoryItem.js";
import type Recipe from "../Recipe.js";

/**
 * Represents a craft action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/craft-action.html
 */
export default class CraftAction extends Action {
	/**
	 * Crafts two ingredients into one or two products according to a recipe.
     *
	 * @param item1 - The first ingredient.
	 * @param item2 - The second ingredient.
	 * @param recipe - The recipe that describes how these ingredients are crafted.
	 */
	performCraft(item1: InventoryItem, item2: InventoryItem, recipe: Recipe): void {
		if (this.performed) return;
		super.perform();
		const item1Id = item1.getIdentifier();
		const item2Id = item2.getIdentifier();
		const craftingResult = this.player.craft(recipe);
		const completedDescription = recipe.completedDescription.parseFor(this.player, recipe);
		this.player.sendDescription(completedDescription, recipe, recipe.completedDescription.messageDisplayType ?? MessageDisplayType.STANDARD);
		this.getGame().narrationHandler.narrateCraft(this, craftingResult, this.player);
		this.getGame().logHandler.logCraft(item1Id, item2Id, craftingResult, this.player, this.forced);
	}
}
