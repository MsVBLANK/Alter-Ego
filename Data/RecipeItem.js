import Game from "./Game.js";
import GameConstruct from "./GameConstruct.js";
/**
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
	 * The quantity of the item to be used or created.
	 * @readonly
	 * @type {number}
	 */
	quantity;
	/**
	 * The variable name to use for this item when processing the recipe. Must be one letter in length.
	 * @readonly
	 * @type {string}
	 */
	variableName;
	/**
     * A regular expression for parsing ingredients and products strings.
	 * 
     * $1 - Quantity. Any number of digits.
	 * 
     * $2 - Variable name. Consists of one letter.
	 * 
     * $3 - Prefab ID.
	 * 
     * $4 - Contained items string. This should be split by comma and checked against this regex separately.
     * @readonly
     */
    static itemRegex = /^(?:(\d+)([^\d\n\r])? )?([^\n\r\(]+)(?: ?\(([^\n\r\(\)]+)\) ?)?$/i;

	/**
	 * @constructor
	 * @param {string} recipeItemString - A string representing a recipe item.
	 * @param {Game} game - The game this belongs to.
	 */
	constructor(recipeItemString, game) {
		super(game);
		this.recipeItemString = recipeItemString.trim();
		const matches = this.recipeItemString.match(RecipeItem.itemRegex);
		this.quantity = matches && matches[1] ? parseInt(matches[1]) : 1;
		this.variableName = matches && matches[2] && matches[2] ? matches[2].trim().toUpperCase() : '';
		this.prefabId = matches && matches[3] ? Game.generateValidEntityName(matches[3]) : '';
		this.containedItemsString = matches && matches[4] ? matches[4].trim() : null;
		this.containedItems = [];
	}

	/**
	 * @param {Prefab} prefab 
	 */
	setPrefab(prefab) {
		this.prefab = prefab;
	}
}
