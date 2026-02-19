import Game from "./Game.js";
import GameConstruct from "./GameConstruct.js";
/**
 * @import CollatedItem from "./CollatedItem.ts";
 * @import Prefab from "./Prefab.js";
 */

/**
 * @class RecipeItem
 * @classdesc Represents an ingredient or a product in a recipe.
 * @extends GameConstruct
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe-item.html
 */
export default class RecipeItem extends GameConstruct {
	/**
	 * This recipe item, expressed as a user-entered string.
	 * @readonly
	 * @type {string}
	 */
	recipeItemString;
	/**
	 * The prefab ID of this recipe item.
	 * @readonly
	 * @type {string}
	 */
	prefabId;
	/**
	 * The prefab of this recipe item.
	 * @type {Prefab}
	 */
	prefab;
	/**
	 * A list of contained items, as a comma-separated string.
	 * @readonly
	 * @type {string}
	 */
	containedItemsString;
	/**
	 * An array of recipe items that are required to be contained inside of this recipe item if it is an ingredient, 
	 * or will be contained inside of it if it is a product.
	 * @type {RecipeItem[]}
	 */
	containedItems;
	/**
	 * The recipe item that contains this one. If this recipe item is not contained in another one, this is `null`.
	 * @type {RecipeItem}
	 */
	container;
	/**
	 * The quantity of the item to be used or created.
	 * @readonly
	 * @type {number}
	 */
	quantity;
	/**
	 * The variable name to use for the quantity of this item when processing the recipe. Must be one letter in length.
	 * @readonly
	 * @type {string}
	 */
	quantityVariableName;
	/**
	 * The number of uses the item requires or will be produced with.
	 * @readonly
	 * @type {number}
	 */
	uses;
	/**
	 * The variable name to use for the uses of this item when processing the recipe. Must be one letter in length.
	 * @readonly
	 * @type {string}
	 */
	usesVariableName;
	/**
	 * Whether or not the quantity of this recipe item is constant. If a quantity is given, but it is not accompanied by a variable, it is assumed to be constant.
	 * @readonly
	 * @type {boolean}
	 */
	quantityIsConstant;
	/**
	 * Whether or not the uses of this recipe item is constant. If a number of uses is given, but it is not accompanied by a variable, it is assumed to be constant.
	 * @readonly
	 * @type {boolean}
	 */
	usesIsConstant;
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
     * @readonly
     */
    static itemRegex = /^(?:(\d+)([^\d\n\r])? )?([^\n\r\(\[\]]+)(?: ?\[(\d+)([^\d\n\r])?\])?(?: ?\(([^\n\r\(\)]+)\) ?)?$/i;

	/**
	 * @constructor
	 * @param {string} recipeItemString - A string representing a recipe item.
	 * @param {Game} game - The game this belongs to.
	 * @param {"processing" | "crafting"} type - The type of recipe this belongs to.
	 */
	constructor(recipeItemString, game, type) {
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

	/**
	 * @param {Prefab} prefab 
	 */
	setPrefab(prefab) {
		this.prefab = prefab;
	}

	/**
	 * @param {RecipeItem} container 
	 */
	setContainer(container) {
		this.container = container;
	}

	/**
	 * Returns true if the given item satisfies the quantity required of this recipe item.
	 * @param {CollatedItem} item
	 */
	quantitySatisfiedBy(item) {
		if (isNaN(item.quantity)) return true;
		return item.quantity >= this.quantity;
	}

	/**
	 * Calculates how many times the given ingredient use count satisfies the quantity of this recipe item.
	 * @param {number} ingredientUseCount - How many times the ingredient is to be used.
	 */
	getSatisfiedQuantityCount(ingredientUseCount) {
		const satisfiedQuantityCount = ingredientUseCount / this.quantity;
		if (isNaN(satisfiedQuantityCount)) return NaN;
		return Math.floor(satisfiedQuantityCount);
	}

	/**
	 * Returns a string to display this recipe item in a list of recipes list.
	 */
	getDisplayString() {
		let displayString = "";
		if (this.quantityIsConstant || this.quantityVariableName === "") displayString = this.prefab.toContainingPhrase(this.quantity);
		else displayString = `${this.quantity}${this.quantityVariableName} ${this.prefab.pluralContainingPhrase}`;
		const containedItemsString = this.containedItems.map(containedItem => containedItem.getDisplayString()).join(', ');
		if (containedItemsString !== "") displayString += ` (${containedItemsString})`;
		return displayString;
	}
}
