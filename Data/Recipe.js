import CollatedRoomItem from './CollatedRoomItem.js';
import Description from './Description.js';
import GameEntity from './GameEntity.js';

/**
 * @import Game from './Game.js'
 * @import ItemInstance from './ItemInstance.js'
 * @import RecipeItem from './RecipeItem.js'
 */

/**
 * @class Recipe
 * @classdesc Allows players to transform items or inventory items into other items or inventory items.
 * @extends GameEntity
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/recipe.html
 */
export default class Recipe extends GameEntity {
    /**
     * The IDs of the ingredients required to carry out the recipe.
     * @readonly
     * @type {string[]}
     */
    ingredientsStrings;
    /**
     * The ingredients required to carry out the recipe.
     * @type {RecipeItem[]}
     */
    ingredients;
    /**
     * The ingredients required to carry out the recipe, as a flattened array.
     * @type {RecipeItem[]}
     */
    ingredientsFlat;
    /**
     * Whether the product can be transformed back into its ingredients.
     * @readonly
     * @type {boolean}
     */
    uncraftable;
    /**
     * Phrase that allows an object with the matching recipeTag to process this recipe. Deprecated. Use fixtureTag instead.
     * @deprecated
     * @readonly
     * @type {string}
     */
    objectTag;
    /**
     * Phrase that allows a fixture with the matching recipeTag to process this recipe.
     * @readonly
     * @type {string}
     */
    fixtureTag;
    /**
     * How long it takes to process the recipe. Accepted units: s, m, h, d, w, M, y.
     * @readonly
     * @type {string}
     */
    durationString;
    /**
     * How long it takes to process the recipe, as a duration object.
     * @readonly
     * @type {import('luxon').Duration<true>}
     */
    duration;
    /**
     * The IDs of the products produced by the recipe.
     * @readonly
     * @type {string[]}
     */
    productsStrings;
    /**
     * The products produced by the recipe.
     * @type {RecipeItem[]}
     */
    products;
    /**
     * The products produced by the recipe, as a flattened array.
     * @type {RecipeItem[]}
     */
    productsFlat;
    /**
     * The description that indicates when a recipe has begun being processed.
     * @readonly
     * @type {Description}
     */
    initiatedDescription;
    /**
     * The description that indicates when a recipe has finished being processed or crafted.
     * @readonly
     * @type {Description}
     */
    completedDescription;
    /**
     * The description that indicates when a recipe has been uncrafted.
     * @readonly
     * @type {Description}
     */
    uncraftedDescription;

    /**
     * @constructor
     * @param {string[]} ingredientsStrings - The IDs of the ingredients required to carry out the recipe.
     * @param {boolean} uncraftable - Whether the product can be transformed back into its ingredients.
     * @param {string} fixtureTag - Phrase that allows a fixture with the matching recipeTag to process this recipe.
     * @param {string} durationString - How long it takes to process the recipe. Accepted units: s, m, h, d, w, M, y.
     * @param {import('luxon').Duration} duration - How long it takes to process the recipe, as a duration object.
     * @param {string[]} productsStrings - The IDs of the products produced by the recipe.
     * @param {string} initiatedDescription - The description that indicates when a recipe has begun being processed.
     * @param {string} completedDescription - The description that indicates when a recipe has finished being processed or crafted.
     * @param {string} uncraftedDescription - The description that indicates when a recipe has been uncrafted.
     * @param {number} row - The row number of the recipe in the sheet.
     * @param {Game} game - The game this belongs to.
     */
    constructor(ingredientsStrings, uncraftable, fixtureTag, durationString, duration, productsStrings, initiatedDescription, completedDescription, uncraftedDescription, row, game) {
        super(game, row);
        this.ingredientsStrings = ingredientsStrings;
        this.ingredients = new Array(this.ingredientsStrings.length);
        this.ingredientsFlat = [];
        this.uncraftable = uncraftable;
        this.fixtureTag = fixtureTag;
        this.objectTag = fixtureTag;
        this.durationString = durationString;
        this.duration = duration;
        this.productsStrings = productsStrings;
        this.products = new Array(this.productsStrings.length);
        this.productsFlat = [];
        this.initiatedDescription = new Description(initiatedDescription, this, game);
        this.completedDescription = new Description(completedDescription, this, game);
        this.uncraftedDescription = new Description(uncraftedDescription, this, game);
    }

    /**
     * @returns {string}
     */
    initiatedCell() {
        return this.getGame().constants.recipeSheetInitiatedColumn + this.row;
    }

    /**
     * @returns {string}
     */
    completedCell() {
        return this.getGame().constants.recipeSheetCompletedColumn + this.row;
    }

    /**
     * @returns {string}
     */
    uncraftedCell() {
        return this.getGame().constants.recipeSheetUncraftedColumn + this.row;
    }

    /**
     * Returns true if the given list of items matches the ingredients list exactly.
     * To be considered an exact match, all of the ingredient prefabs must match those of the given items,
     * and the given items must have a quantity greater than or equal to the required ingredient quantity.
     * @param {(CollatedRoomItem|ItemInstance)[]} items - A list of items. This must be sorted alphabetically by prefab ID.
     */
    ingredientsMatch(items) {
        if (items.length !== this.ingredientsFlat.length) return false;
        for (let [i, item] of items.entries()) {
            const ingredient = this.ingredientsFlat[i];
            if (item.prefab.id !== ingredient.prefab.id) return false;
            if (item.quantity < ingredient.quantity) return false;
			if (!isNaN(item.uses) && !isNaN(ingredient.uses) && item.uses < ingredient.uses) return false;
			if (!item.containerMatches(ingredient)) return false;
            if (item instanceof CollatedRoomItem) item.setVariable(ingredient.quantityVariableName);
        }
        return true;
    }

    /**
     * Returns a subset of the given items which satisfy the recipe's ingredients list. 
     * If the given items do not satisfy the recipe's ingredients list, returns an empty array.
     * @param {CollatedRoomItem[]} items - A list of items. This must be sorted alphabetically by prefab ID.
     */
    getIngredientItems(items) {
        /** @type {CollatedRoomItem[]} */
        let ingredients = [];
        for (const ingredient of this.ingredientsFlat) {
            for (const item of items) {
                // Check if this item has the same prefab as the current ingredient and has a sufficient quantity.
                if (item.prefab.id === ingredient.prefab.id && item.quantity >= ingredient.quantity && item.uses >= ingredient.uses && item.containerMatches(ingredient)) {
                    ingredients.push(item);
                    item.setVariable(ingredient.quantityVariableName);
                    break;
                }
            }
        }
        if (this.ingredientsFlat.length !== ingredients.length) return [];
        else return ingredients;
    }

    /**
     * Calculates how many times the given list of ingredients satisfies this recipe.
     * @param {CollatedRoomItem[]} items
     */
    getSatisfactoryProcessCount(items) {
        /** @type {number[]} */
        let satisfactoryItemsCounts = [];
        if (this.ingredientsFlat.length !== items.length) return 0;
		const allIngredientQuantitiesAreConstant = this.ingredientsFlat.filter(ingredient => !ingredient.quantityIsConstant).length === 0;
        for (let [i, item] of items.entries()) {
            const ingredient = this.ingredientsFlat[i];
            const ingredientIsAlsoProduct = this.isIngredientAndProduct(item);
            const ingredientUseCount = ingredientIsAlsoProduct ? item.uses : item.quantity;
            const itemSatisfiedQuantityCount = ingredient.getSatisfiedQuantityCount(ingredientUseCount);
            if (item.prefab.id !== ingredient.prefab.id || !item.containerMatches(ingredient) || !ingredient.quantitySatisfiedBy(item) || !ingredient.quantityIsConstant && itemSatisfiedQuantityCount === 0) return 0;
            if(!ingredient.quantityIsConstant) satisfactoryItemsCounts.push(itemSatisfiedQuantityCount);
        }
        if (satisfactoryItemsCounts.length === 1 && isNaN(satisfactoryItemsCounts[0])) return 1;
		if (allIngredientQuantitiesAreConstant) return 1;
        return Math.min(...satisfactoryItemsCounts.filter(satisfactoryItemsCount => !isNaN(satisfactoryItemsCount)));
    }

	/**
	 * Returns true if the given item is both an ingredient and a product.
	 * @param {CollatedRoomItem | RecipeItem} item 
	 */
	isIngredientAndProduct(item) {
		return this.ingredientsFlat.find(ingredient => ingredient.prefab.id === item.prefab.id) !== undefined && this.productsFlat.find(product => product.prefab.id === item.prefab.id) !== undefined;
	}
}
