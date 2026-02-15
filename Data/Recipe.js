import Description from './Description.js';
import GameEntity from './GameEntity.js';

/** @import Game from './Game.js' */
/** @import ItemInstance from './ItemInstance.js' */
/** @import RecipeItem from './RecipeItem.js' */
/** @import RoomItem from './RoomItem.js' */

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
     * A regular expression for parsing ingredients and products strings.
     * $1 - Quantity. Any number of digits.
     * $2 - Variable name. Consists of one letter.
     * $3 - Prefab ID.
     * $4 - Contained items string. This should be split by comma and checked against this regex separately.
     * @readonly
     */
    static itemRegex = /^(?:(\d*)([A-Z]) )?([^\n\r\(]+)(?: ?\(([^\n\r\(\)]+)\) ?)?$/i;

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
     * @param {ItemInstance[]} items - A list of items. This must be sorted alphabetically by prefab ID.
     * @param {boolean} [sort] - Whether or not to sort the items by prefab ID. Defaults to false.
     */
    ingredientsMatch(items, sort = false) {
        if (items.length !== this.ingredientsFlat.length) return false;
        if (sort) {
            items = items.toSorted(function (a, b) {
                if (a.prefab.id < b.prefab.id) return -1;
                if (a.prefab.id > b.prefab.id) return 1;
                return 0;
            });
        }
        for (let [i, item] of items.entries()) {
            const ingredient = this.ingredientsFlat[i];
            if (item.prefab.id !== ingredient.prefab.id) return false;
            if (item.quantity < ingredient.quantity) return false;
        }
        return true;
    }

    /**
     * Returns a subset of the given items which satisfy the recipe's ingredients list. 
     * If the given items do not satisfy the recipe's ingredients list, returns an empty array.
     * @param {RoomItem[]} items - A list of items. This must be sorted alphabetically by prefab ID.
     */
    getIngredientItems(items) {
        /** @type {RoomItem[]} */
        let ingredients = [];
        for (const ingredient of this.ingredientsFlat) {
            for (const item of items) {
                // Check if this item has the same prefab as the current ingredient and that it isn't already in the ingredients list.
                if (item.prefab.id === ingredient.prefab.id && item.quantity >= ingredient.quantity && !ingredients.find(ingredient => ingredient.row === item.row)) {
                    ingredients.push(item);
                    break;
                }
            }
        }
        if (this.ingredientsFlat.length !== ingredients.length) return [];
        else return ingredients;
    }
}
