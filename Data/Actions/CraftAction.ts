import { MessageDisplayType } from "../../Modules/enums.js";
import Action from "../Action.ts";
import InventoryItem from "../InventoryItem.ts";
import Recipe from "../Recipe.ts";

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

    /**
     * Finds the required inventory items and recipe to call performCraft.
     * 
     * @param args - The args as strings.
     */
    parseInteractionArgs(args: string[]): [InventoryItem, InventoryItem, Recipe] {
        const hand1 = this.getGame().entityFinder.getPlayerHandHoldingItem(this.player, args[0]);
        const hand2 = this.getGame().entityFinder.getPlayerHandHoldingItem(this.player, args[1], hand1?.row);
        const recipes = this.getGame().entityFinder.getRecipes(args[2], "", args[3], args[4]);
        return [hand1?.equippedItem, hand2?.equippedItem, recipes[0] ?? undefined];
    }

    /**
	 * Validates the parsed args. The results can be passed directly into performCraft.
     *
	 * @param args - The args after being parsed.
	 */
    validateInteractionArgs(args: [InventoryItem, InventoryItem, Recipe]): [InventoryItem, InventoryItem, Recipe] | [] {
        if (args.length !== 3) return [];
        if (!args[0] || !(args[0] instanceof InventoryItem)) return [];
        if (!args[1] || !(args[1] instanceof InventoryItem)) return [];
        if (!args[2] || !(args[2] instanceof Recipe)) return [];
        if (this.player.hasBehaviorAttribute("disable craft")) return [];
		if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable craft")) return [];
        const item1 = args[0];
        const item2 = args[1];
        const recipe = args[2];
        if (!this.player.canCraft(recipe, [item1, item2])) return [];
        return [item1, item2, recipe];
    }
}
