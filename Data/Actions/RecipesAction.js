import Action from "../Action.ts";
import InventoryItem from "../InventoryItem.js";
import { addPages, getSortedItems } from "../../Modules/helpers.ts";
import { createPaginatedEmbed } from "../../Modules/discordUtils.js";
/**
 * @typedef {{ recipe: Recipe, uncrafting: boolean }} DoableRecipe
 * @typedef {{ type: "crafting"|"uncrafting"|"processing", ingredients: string, products: string, fixtures: string, duration: string }} RecipeListEntry
 * @import ItemInstance from "../ItemInstance.ts";
 * @import Recipe from "../Recipe.js";
 * @import { MessageReaction, User } from "discord.js";
 */

/**
 * @class RecipesAction
 * @classdesc Represents a recipes action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/recipes-action.html
 */
export default class RecipesAction extends Action {
	/** @type {string} */
	#craftingRecipesDescription;
	/** @type {string} */
	#uncraftingRecipesDescription;
	/** @type {string} */
	#processingRecipesDescription;
	#syntaxNote = "Note: If an item is preceded by a number and letter, that means the recipe accepts a variable number of that ingredient, and the quantity of its "
			+ "products can be multiplied by that variable. If an item is contained in parentheses, it must be contained in the item preceding it.";
	/** @type {RecipeListEntry[]} */
	#craftingList = [];
	/** @type {RecipeListEntry[]} */
	#uncraftingList = [];
	/** @type {RecipeListEntry[]} */
	#processingList = [];

	/**
	 * Performs a recipes action.
	 * @param {InventoryItem} [item] - An inventory item to use as one of the ingredients. If this is provided, all recipes that use it as an ingredient will be shown.
	 */
	async performRecipes(item) {
		if (this.performed) return;
		super.perform();

		/** @type {DoableRecipe[]} */
		let doableRecipes = [];
		let errorMessage = "";
		if (item) {
			doableRecipes = this.#getDoableRecipesWith(item);
			errorMessage = `There are no recipes that can be carried out with ${item.singleContainingPhrase}.`;
		}
		else {
			doableRecipes = this.#getDoableRecipes();
			errorMessage = `There are no recipes you can carry out with the items currently in your inventory and the items in this room.`;
		}
		if (doableRecipes.length === 0) {
			if (this.message) this.getGame().communicationHandler.reply(this.message, errorMessage);
			return;
		}
		this.#setRecipeLists(doableRecipes);
		this.#sendRecipeListMessage();
	}

	/**
	 * Gets all doable recipes.
	 */
	#getDoableRecipes() {
		/** @type {DoableRecipe[]} */
		const doableRecipes = [];
		/** @type {ItemInstance[]} */
		let items = [];
		const inventoryItems = this.getGame().entityFinder.getInventoryItems(undefined, this.player.name);
		items = items.concat(inventoryItems);
		items = items.concat(this.getGame().entityFinder.getRoomItems(undefined, this.player.location.id));
		items = getSortedItems(items);
		for (const recipe of this.getGame().recipes) {
			if (recipe.uncraftable && recipe.products.length === 1 && inventoryItems.find(item => item.prefab.id === recipe.products[0].prefab.id))
				doableRecipes.push({ recipe: recipe, uncrafting: true });
			/** @type {ItemInstance[]} */
			let ingredients = [];
			for (const ingredient of recipe.ingredientsFlat) {
				const item = items.find(item => item.prefab.id === ingredient.prefab.id);
				if (item) ingredients.push(item);
			}
			if (ingredients.some(ingredient => ingredient instanceof InventoryItem && inventoryItems.includes(ingredient)) && recipe.ingredientsMatch(getSortedItems(ingredients)))
				doableRecipes.push({ recipe: recipe, uncrafting: false });
		}
		this.#craftingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}craft\` command. `
			+ `Note that only recipes whose ingredients include at least one item currently in your inventory are listed.`;
		this.#uncraftingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}uncraft\` command. `
			+ `Note that only recipes whose sole product is an item currently in your inventory are listed.`;
		this.#processingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}use\` command on a fixture after dropping all of the ingredients into it. `
			+ `Note that only recipes whose ingredients include at least one item currently in your inventory are listed.`;
		return doableRecipes;
	}

	/**
	 * Gets a list of all doable recipes with the given inventory item.
	 * @param {InventoryItem} item
	 */
	#getDoableRecipesWith(item) {
		/** @type {DoableRecipe[]} */
		const doableRecipes = [];
		for (const recipe of this.getGame().recipes) {
			if (recipe.uncraftable && recipe.products.map(product => product.prefab.id).includes(item.prefab.id))
				doableRecipes.push({ recipe: recipe, uncrafting: true });
			if (recipe.ingredientsFlat.map(ingredient => ingredient.prefab.id).includes(item.prefab.id))
				doableRecipes.push({ recipe: recipe, uncrafting: false });
		}
		this.#craftingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}craft\` command with your ${item.name} as an ingredient. `
			+ `The other ingredient may not be available in this room, or you may need to create it yourself.`;
		this.#uncraftingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}uncraft\` command with your ${item.name} as an ingredient.`;
		this.#processingRecipesDescription = `These are recipes you can carry out using the \`${this.getGame().settings.commandPrefix}use\` command on a fixture after dropping your ${item.name} `
			+ `and any other required ingredients into it. The other ingredients may not be available in this room, or you may need to create them yourself. `
			+ `If there is no fixture listed in all uppercase, then you cannot carry out this recipe in the room you're currently in and must find a suitable fixture elsewhere.`;
		return doableRecipes;
	}

	/**
	 * Sets the craftingList, uncraftingList, and processingList with the given doable recipes.
	 * @param {DoableRecipe[]} doableRecipes 
	 */
	#setRecipeLists(doableRecipes) {
		// Get a list of all fixtures in the room. We'll filter this later.
		const roomFixtures = this.getGame().entityFinder.getFixtures(undefined, this.player.location.id, true);
		/** @type {Map<string, string>} */
		const recipeTagFixtureNames = new Map();
		for (const doableRecipe of doableRecipes) {
			const recipe = doableRecipe.recipe;
			const ingredientsString = recipe.ingredients.map(ingredient => ingredient.getDisplayString()).join(', ');
			const productsString = recipe.products.map(product => product.getDisplayString()).join(', ');
			if (recipe.fixtureTag !== "") {
				if (!recipeTagFixtureNames.has(recipe.fixtureTag)) {
					const fixtures = roomFixtures.filter(fixture => fixture.recipeTag === recipe.fixtureTag);
					const fixtureString = fixtures.length > 0 ? fixtures.map(fixture => fixture.name).join(', ') : recipe.fixtureTag;
					recipeTagFixtureNames.set(recipe.fixtureTag, fixtureString);
				}
				this.#processingList.push({ type: "processing", ingredients: ingredientsString, products: productsString, fixtures: recipeTagFixtureNames.get(recipe.fixtureTag), duration: recipe.durationString });
			}
			else if (doableRecipe.uncrafting)
				this.#uncraftingList.push({ type: "uncrafting", ingredients: productsString, products: ingredientsString, fixtures: "", duration: "" });
			else
				this.#craftingList.push({ type: "crafting", ingredients: ingredientsString, products: productsString, fixtures: "", duration: "" });
		}
	}

	/**
	 * Divides the recipe lists into pages.
	 */	
	#createRecipeListPages() {
		/** @type {RecipeListEntry[][]} */
		const pages = [];
		addPages(pages, this.#craftingList);
		addPages(pages, this.#uncraftingList);
		addPages(pages, this.#processingList);
		return pages;
	}
	
	/**
	 * Sends the recipe list message and edits it when the user requests the next or previous page.
	 */
	#sendRecipeListMessage() {
		if (!this.message) return;
		const pages = this.#createRecipeListPages();
		let page = 0;
		const embedAuthorName = `Recipes List`;
		const embedAuthorIcon = this.getGame().guildContext.guild.members.me.avatarURL() || this.getGame().guildContext.guild.members.me.user.avatarURL();
		let pageIsProcessingType = pages[page][0].type === "processing";
		let pageIsUncraftingType = pages[page][0].type === "uncrafting";
		let fieldDescription = pageIsProcessingType ? this.#processingRecipesDescription : pageIsUncraftingType ? this.#uncraftingRecipesDescription : this.#craftingRecipesDescription;
		fieldDescription += `\n\n${this.#syntaxNote}`;
		/** @param {number} entryIndex */
		const fieldName = (entryIndex) => `**Recipe ${entryIndex + 1}**`;
		/** @param {number} entryIndex */
		const fieldValue = (entryIndex) => `**Ingredients:** ${pages[page][entryIndex].ingredients}\n` +
			`**Products:** ${pages[page][entryIndex].products}\n` +
			(pageIsProcessingType ? `**Using Fixture(s):** ${pages[page][entryIndex].fixtures}\n` : '') +
			(pageIsProcessingType ? `**Duration:** ${pages[page][entryIndex].duration}` : '');
		let embed = createPaginatedEmbed(this.getGame(), page, pages, embedAuthorName, embedAuthorIcon, fieldDescription, fieldName, fieldValue);
		this.message.author.send({ embeds: [embed] }).then(response => {
			response.react('⏪').then(() => {
				response.react('⏩');

				/** @param {MessageReaction} reaction, @param {User} user */
				const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === this.message.author.id;
				/** @param {MessageReaction} reaction, @param {User} user */
				const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === this.message.author.id;
	
				const backwards = response.createReactionCollector({ filter: backwardsFilter, time: 300000 });
				const forwards = response.createReactionCollector({ filter: forwardsFilter, time: 300000 });
	
				backwards.on("collect", () => {
					if (page === 0) return;
					page--;
					pageIsProcessingType = pages[page][0].type === "processing";
					pageIsUncraftingType = pages[page][0].type === "uncrafting";
					fieldDescription = pageIsProcessingType ? this.#processingRecipesDescription : pageIsUncraftingType ? this.#uncraftingRecipesDescription : this.#craftingRecipesDescription;
					fieldDescription += `\n\n${this.#syntaxNote}`
					embed = createPaginatedEmbed(this.getGame(), page, pages, embedAuthorName, embedAuthorIcon, fieldDescription, fieldName, fieldValue);
					response.edit({ embeds: [embed] });
				});
	
				forwards.on("collect", () => {
					if (page === pages.length - 1) return;
					page++;
					pageIsProcessingType = pages[page][0].type === "processing";
					pageIsUncraftingType = pages[page][0].type === "uncrafting";
					fieldDescription = pageIsProcessingType ? this.#processingRecipesDescription : pageIsUncraftingType ? this.#uncraftingRecipesDescription : this.#craftingRecipesDescription;
					fieldDescription += `\n\n${this.#syntaxNote}`
					embed = createPaginatedEmbed(this.getGame(), page, pages, embedAuthorName, embedAuthorIcon, fieldDescription, fieldName, fieldValue);
					response.edit({ embeds: [embed] });
				});
			});
		});
	}
}