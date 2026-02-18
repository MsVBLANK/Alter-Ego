import HidingSpot from './HidingSpot.js';
import ItemContainer from './ItemContainer.js';
import DeactivateAction from './Actions/DeactivateAction.js';
import InstantiateAction from './Actions/InstantiateAction.js';
import Timer from '../Classes/Timer.js';
import { getChildItems } from '../Modules/itemManager.js';
import { Duration } from 'luxon';
import { MessageDisplayType } from '../Modules/enums.js';
import CollatedRoomItem from './CollatedRoomItem.js';

/** @import Game from './Game.js' */
/** @import RoomItem from './RoomItem.js' */
/** @import Player from './Player.js' */
/** @import Prefab from './Prefab.js' */
/** @import Puzzle from './Puzzle.js' */
/** @import Recipe from './Recipe.js' */
/** @import Room from './Room.js' */

/**
 * @class Fixture
 * @classdesc Represents a fixed structure in a room that cannot be taken or moved by a player.
 * @extends ItemContainer
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/fixture.html
 */
export default class Fixture extends ItemContainer {
    /**
     * The name of the fixture.
     * @readonly
     * @type {string}
     */
    name;
    /**
     * The display name of the room the fixture is located in.
     * @readonly
     * @type {string}
     */
    locationDisplayName;
    /**
     * The room the fixture is located in.
     * @type {Room}
     */
    location;
    /**
     * Whether the fixture can be interacted with.
     * @type {boolean}
     */
    accessible;
    /**
     * The name of a puzzle that is associated with the fixture.
     * @readonly
     * @type {string}
     */
    childPuzzleName;
    /**
     * The puzzle that is associated with the fixture.
     * @type {Puzzle}
     */
    childPuzzle;
    /**
     * A keyword or phrase assigned to an fixture's recipe that allows it to carry out recipes that require it.
     * @readonly
     * @type {string}
     */
    recipeTag;
    /**
     * Whether the fixture can be activated or deactivated with the use command.
     * @type {boolean}
     */
    activatable;
    /**
     * Whether the fixture is currently checking for and processing recipes.
     * @type {boolean}
     */
    activated;
    /**
     * Whether the fixture should automatically deactivate after processing a recipe.
     * @type {boolean}
     */
    autoDeactivate;
    /**
     * Whole number indicating how many players can hide in this fixture.
     * @type {number}
     */
    hidingSpotCapacity;
    /**
     * The hiding spot associated with this fixture. If this fixture is not a hiding spot, this is null.
     * @type {HidingSpot}
     */
    hidingSpot;
    /**
     * A preposition that will be used when a player drops an item in this fixture. If this blank, players cannot drop items into it.
     * @type {string}
     */
    preposition;
    /**
     * The current recipe being processed, the ingredients being processed, the recipe's duration, and a timer counting down until the recipe finishes.
     * @type {Process}
     */
    process;
    /**
     * A timer that checks for recipes that the fixture can process every second.
     * @type {Timer}
     */
    recipeInterval;

    /**
     * @constructor
     * @param {string} name - The name of the fixture.
     * @param {string} locationDisplayName - The display name of the room the fixture is located in.
     * @param {boolean} accessible - Whether the fixture can be interacted with.
     * @param {string} childPuzzleName - The name of a puzzle that is associated with the fixture.
     * @param {string} recipeTag - A keyword or phrase assigned to an fixture's recipe that allows it to carry out recipes that require it.
     * @param {boolean} activatable - Whether the fixture can be activated or deactivated with the use command.
     * @param {boolean} activated - Whether the fixture is currently checking for and processing recipes.
     * @param {boolean} autoDeactivate - Whether the fixture should automatically deactivate after processing a recipe.
     * @param {number} hidingSpotCapacity - Whole number indicating how many players can hide in this fixture.
     * @param {string} preposition - A preposition that will be used when a player drops an item in this fixture. If this blank, players cannot drop items into it.
     * @param {string} description - A description of the fixture. Can contain an item list.
     * @param {number} row - The row number of the fixture in the sheet.
     * @param {Game} game - The game this belongs to.
     */
    constructor(name, locationDisplayName, accessible, childPuzzleName, recipeTag, activatable, activated, autoDeactivate, hidingSpotCapacity, preposition, description, row, game) {
        super(game, row, description);
        this.name = name;
        this.locationDisplayName = locationDisplayName;
        this.location = null;
        this.accessible = accessible;
        this.childPuzzleName = childPuzzleName;
        this.childPuzzle = null;
        this.recipeTag = recipeTag;
        this.activatable = activatable;
        this.activated = activated;
        this.autoDeactivate = autoDeactivate;
        this.hidingSpotCapacity = hidingSpotCapacity;
        this.hidingSpot = this.hidingSpotCapacity > 0 ? new HidingSpot(this, this.hidingSpotCapacity, this.row, this.getGame()) : null;
        this.preposition = preposition;

        this.process = { recipe: null, ingredients: [], duration: null, timer: null };
        let fixture = this;
        this.recipeInterval = this.recipeTag ? new Timer(1000, { start: true, loop: true }, function () { if (fixture.activated) fixture.processRecipes(); }) : null;
    }

    /**
     * Sets the location.
     * @param {Room} room
     */
    setLocation(room) {
        this.location = room;
    }

    /**
     * Sets the child puzzle.
     * @param {Puzzle} puzzle
     */
    setChildPuzzle(puzzle) {
        this.childPuzzle = puzzle;
    }

    /**
     * Sets the fixture to be accessible.
     */
    setAccessible() {
        this.accessible = true;
    }

    /**
     * Sets the fixture to be inaccessible.
     */
    setInaccessible() {
        this.accessible = false;
    }

    /** Gets the entity's location. */
    getLocation() {
        return this.location;
    }

    /**
     * Returns a custom ID for this fixture.
     */
    getInspectActionDirectiveArgs() {
        return ["F", this.name, this.getLocation().id];
    }

    /**
     * Returns true if the fixture is capable of containing items.
     */
    isItemContainer() {
        return this.preposition !== "";
    }

    /**
     * Returns true if the fixture is currently capable of being taken from/dropped into.
     */
    canCurrentlyContainItems() {
        return !this.isProcessingItems() && (this.childPuzzle === null || this.childPuzzle.canCurrentlyContainItems());
    }

    /**
     * Gets all of the items this entity contains.
     * @override
     */
    getContainedItems() {
        return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, undefined, 'Fixture', this.name);
    }

    /**
	 * Gets all of the items that should appear in the fixture's item list.
	 * @override
	 * @param {string} [itemListName] - The name of the item list. Unused.
	 * @param {Player} [player] - The player the description is being sent to. Unused.
	 */
	getContainedItemsForItemList(itemListName, player) {
		return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, true, 'Fixture', this.name);
	}

    /**
     * Returns true if the fixture is activated and deactivates automatically.
     */
    isProcessingItems() {
        return this.autoDeactivate && this.activated;
    }

    /**
     * Sets the fixture's process with the recipe result's recipe and ingredients.
     * @param {FindRecipeResult} recipeResult - A found recipe result.
     */
    #setProcess(recipeResult) {
        this.process.recipe = recipeResult.recipe;
        this.process.ingredients = recipeResult.ingredients;
    }

    /**
     * Sets the fixture's duration.
     * @param {Duration} [duration] - A duration object. Defaults to the duration of the recipe currently being processed.
     */
    #setProcessDuration(duration = this.process.recipe?.duration ?? null) {
        this.process.duration = duration;
    }

    /**
     * Starts the process timer, and executes the given callback when its timer expires.
     * @param {() => void} callback
     */
    #whenProcessTimerExpires(callback) {
        const fixture = this;
        this.process.timer = new Timer(1000, { start: true, loop: true }, function () {
            if (fixture.process.duration !== null) {
                fixture.process.duration = fixture.process.duration.minus(1000);
                if (fixture.process.duration.as('milliseconds') <= 0) {
                    callback();
                }
            }
        });
    }

    /**
     * Sets the current process's recipe and duration to null, empties the process's list of ingredients, and stops the process timer.
     */
    #clearProcess() {
        this.process.recipe = null;
        this.process.ingredients.length = 0;
        if (this.process.timer !== null)
            this.process.timer.stop();
        this.process.duration = null;
    }

    /**
     * Starts the process timer when no recipe was found and the fixture is set to deactivate automatically.
     */
    #startProcessTimerForAutoDeactivateFixtureWithNoRecipe() {
        this.#setProcessDuration(Duration.fromObject({minutes: 1}));
        this.#whenProcessTimerExpires(() => {
			this.#performDeactivate();
        });
    }

	/**
     * Ends recipe processing. If `this.autoDeactivate` is true, deactivates the fixture. Otherwise, just clears the process.
     */
	#endProcess() {
		if (this.autoDeactivate) this.#performDeactivate();
        else this.#clearProcess();
	}

    /**
     * Makes the fixture start processing recipes.
     * @param {Player} [player] - The player who activated the fixture, if applicable.
     */
    activate(player) {
        this.activated = true;

        const result = this.findRecipe();
        if (result.recipe === null) {
            // If this is supposed to deactivate automatically and no recipe was found, turn it off after 1 minute.
            if (this.autoDeactivate) return this.#startProcessTimerForAutoDeactivateFixtureWithNoRecipe();
        }

        this.#setProcess(result);
        this.#setProcessDuration();
        this.#whenProcessTimerExpires(() => {
            this.#processRecipe(player);
			this.#endProcess();
        });
    }

    /**
     * Stops the fixture from processing recipes.
     */
    deactivate() {
        this.activated = false;
        this.#clearProcess();
    }

    /**
     * Checks if the fixture is activated and processes its recipes if it is.
     */
    processRecipes() {
        const result = this.findRecipe();
        if (this.process.recipe === null && this.process.duration === null && result.recipe === null && this.autoDeactivate)
            return this.#startProcessTimerForAutoDeactivateFixtureWithNoRecipe();
        // If the current recipe being processed is no longer the one it found, cancel it.
        if (this.process.recipe !== null && (result.recipe === null || result.recipe !== null && this.process.recipe.row !== result.recipe.row))
            this.#clearProcess();
        // Start a new process.
        if (this.process.recipe === null && result.recipe !== null) {
            this.#setProcess(result);
            this.#setProcessDuration();
            this.#whenProcessTimerExpires(() => {
                this.#processRecipe();
				this.#endProcess();
            });
        }
    }

    /**
     * Processes a recipe. This destroys the process's ingredients and instantiates the products.
     * @param {Player} [player] - The player who initiated the recipe, if any. If a player is given and they are still in the room, they will be sent the recipe's completedDescription.
     */
    #processRecipe(player) {
        // Calculate how many times the fixture's ingredients satisfy the current recipe.
        const satisfactoryProcessCount = this.process.recipe.getSatisfactoryProcessCount(this.process.ingredients);
		if (satisfactoryProcessCount < 1) return;
        this.destroyIngredients(satisfactoryProcessCount);
		this.instantiateProducts(satisfactoryProcessCount);
		this.#sendRecipeCompletedDescription(player);
    }

	/**
	 * Destroys the ingredients for the current recipe being processed.
	 * @param {number} satisfactoryProcessCount - How many times the fixture's ingredients satisfy the current recipe.
	 */
	destroyIngredients(satisfactoryProcessCount) {
		if (satisfactoryProcessCount < 1) return;
		for (const ingredient of this.process.ingredients) {
            if (this.process.recipe.isIngredientAndProduct(ingredient) && !ingredient.allItemsHaveInfiniteUses())
				ingredient.decreaseUses(satisfactoryProcessCount);
			else if (this.process.recipe.isIngredientAndProduct(ingredient) && ingredient.allItemsHaveInfiniteUses())
				continue;
			else
				ingredient.destroy(satisfactoryProcessCount);
        }
	}

	/**
	 * Instantiate the products for the current recipe being processed.
	 * @param {number} satisfactoryProcessCount - How many times the fixture's ingredients satisfy the current recipe.
	 */
	instantiateProducts(satisfactoryProcessCount) {
		if (satisfactoryProcessCount < 1) return;
		for (const product of this.process.recipe.products) {
			if (this.process.recipe.isIngredientAndProduct(product) && isNaN(product.prefab.uses))
				continue;
			const quantity = product.quantityIsConstant ? product.quantity : product.quantity * satisfactoryProcessCount;
			const uses = !isNaN(product.uses) && !product.usesIsConstant ? product.uses * satisfactoryProcessCount : product.uses;
			if (product.prefab.inventory.size > 0) {
				for (let i = 0; i < quantity; i++) {
					const instantiatedProduct = this.#instantiate(product.prefab, 1, uses, new Map());
					for (const childProduct of product.containedItems) {
						const childQuantity = childProduct.quantityIsConstant ? childProduct.quantity : childProduct.quantity * satisfactoryProcessCount;
						const childUses = !isNaN(childProduct.uses) && !childProduct.usesIsConstant ? childProduct.uses * satisfactoryProcessCount : childProduct.uses;
						this.#instantiate(childProduct.prefab, childQuantity, childUses, new Map(), instantiatedProduct, instantiatedProduct.inventory.firstKey());
					}
				}
			}
			else this.#instantiate(product.prefab, quantity, uses, new Map());
		}
	}

	/**
	 * Instantiates a room item in this fixture.
	 * @param {Prefab} prefab - The prefab to instantiate.
	 * @param {number} quantity - The quantity of the prefab to instantiate.
	 * @param {number} uses - The number of uses to instantiate the prefab with. Defaults to the prefab's number of uses.
	 * @param {Map<string, string>} proceduralSelections - The manually selected procedural possibilities.
	 * @param {Fixture|Puzzle|RoomItem} [container] - The container to instantiate the prefab into. Defaults to the fixture itself.
	 * @param {string} [inventorySlotId] - The ID of the {@link InventorySlot|inventory slot} to instantiate the item in.
	 * @returns The instantiated room item.
	 */
	#instantiate(prefab, quantity, uses = prefab.uses, proceduralSelections = new Map(), container = this, inventorySlotId = "") {
		const instantiateAction = new InstantiateAction(this.getGame(), undefined, undefined, this.location, true);
		return instantiateAction.performInstantiateRoomItem(prefab, container, inventorySlotId, quantity, proceduralSelections, uses);
	}

	/**
	 * If a player is given and they are still alive and in the same room as the fixture, sends them the processed recipe's completed description.
	 * @param {Player} player - The player to send the completed description to.
	 */
	async #sendRecipeCompletedDescription(player) {
		if (player && player.alive && player.location.id === this.location.id) {
			const completedDescription = this.process.recipe.completedDescription.parseFor(player, this);
			const messageDisplayType = this.process.recipe.completedDescription.messageDisplayType ?? MessageDisplayType.STANDARD;
			const interactables = await this.getGame().botContext.interactableManager.createInspectActionInteractable([this], player);
			player.sendDescription(completedDescription, this, messageDisplayType, interactables);
		}
	}

	/**
	 * Creates a DeactivateAction and calls performDeactivate.
	 * @param {Player} [player] - The player who initiated the recipe, if any.
	 */
	#performDeactivate(player) {
		const deactivateAction = new DeactivateAction(this.getGame(), undefined, player, this.location, true);
        deactivateAction.performDeactivate(this, true);
	}

    /**
     * Finds a recipe that can currently be processed by this fixture. The fixture must contain all of the ingredients for this recipe.
     * If multiple recipes can be processed, it will choose the one with the highest number of matched ingredients.
     * @returns {FindRecipeResult}
     */
    findRecipe() {
        // Get all the items contained within this fixture.
        const items = this.getGame().entityFinder.getRoomItems(undefined, this.location.id, undefined, "Fixture", this.name);
        for (let i = 0; i < items.length; i++)
            getChildItems(items, items[i]);
        const collatedItems = CollatedRoomItem.collate(items);

        const recipes = this.getGame().recipes.filter(recipe => recipe.fixtureTag === this.recipeTag);
        /** @type {Recipe} */
        let recipe = null;
        /** @type {CollatedRoomItem[]} */
        let ingredients = [];
        // Check if there's a recipe whose ingredients matches items exactly.
        for (let i = 0; i < recipes.length; i++) {
            if (recipes[i].ingredientsMatch(collatedItems)) {
                recipe = recipes[i];
                ingredients = collatedItems;
                break;
            }
        }
        // If no exact match was found, get all recipes that are satisfied by items.
        if (recipe === null) {
            /** @type {FindRecipeResult[]} */
            let matches = [];
            for (let i = 0; i < recipes.length; i++) {
                const matchedIngredients = recipes[i].getIngredientItems(collatedItems);
                if (matchedIngredients.length > 0) matches.push({ recipe: recipes[i], ingredients: [...matchedIngredients] });
            }
            if (matches.length > 0) {
                // Sort matches by number of matched ingredients in decreasing order.
                matches.sort(function (a, b) {
                    return b.ingredients.length - a.ingredients.length;
                });
                // Recipe will be the first one, which has the highest number of matches.
                recipe = matches[0].recipe;
                ingredients = matches[0].ingredients;
            }
        }

        return { recipe: recipe, ingredients: ingredients };
    }

    /**
     * Gets the fixture's name preceded by "the".
     */
    getContainingPhrase() {
        return `the ${this.name}`;
    }

    /**
     * Gets the fixture's preposition. If no preposition is set, returns "in".
     */
    getPreposition() {
        return this.preposition ? this.preposition : "in";
    }

    /** @returns {string} */
    descriptionCell() {
        return this.getGame().constants.fixtureSheetDescriptionColumn + this.row;
    }
}
