import Game from "../Data/Game.ts";
import Gesture from "../Data/Gesture.ts";
import ItemInstance from "../Data/ItemInstance.ts";
import Player from "../Data/Player.ts";
import Room from "../Data/Room.ts";
import Status from "../Data/Status.ts";

import type Event from "../Data/Event.ts";
import type Exit from "../Data/Exit.js";
import type Fixture from "../Data/Fixture.ts";
import type Flag from "../Data/Flag.ts";
import type GameEntity from "../Data/GameEntity.ts";
import type InventoryItem from "../Data/InventoryItem.ts";
import type Prefab from "../Data/Prefab.ts";
import type Puzzle from "../Data/Puzzle.ts";
import type Recipe from "../Data/Recipe.ts";
import type RoomItem from "../Data/RoomItem.ts";

/**
 * Returns true if the entity's row number matches the given row number.
 * @param entity - The game entity to match the row against.
 * @param row - The row number to match.
 */
export const entityRowMatches = (entity: GameEntity, row: number) => {
	return entity.row === row;
};

/**
 * Returns true if the entity's row number is different from the given row number.
 * @param entity - The game entity to match the row against.
 * @param row - The row number to match.
 */
export const entityRowDiffers = (entity: GameEntity, row: number) => {
	return entity.row !== row;
};

/**
 * Returns true if the room's ID matches the given ID.
 * @param room - The room to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const roomIdMatches = (room: Room, id: string, normalize = false) => {
	if (normalize) Room.generateValidId(id);
	return room.id === id;
};

/**
 * Returns true if the room's ID contains the given ID.
 * @param room - The room to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const roomIdContains = (room: Room, id: string, normalize = false) => {
	if (normalize) Room.generateValidId(id);
	return room.id.includes(id);
};

/**
 * Returns true if the room's tags include the given tag.
 * @param room - The room to match the tag against.
 * @param tag - The tag to match.
 * @param [normalize] - Whether or not to normalize the tag before matching. Defaults to false.
 */
export const roomTagMatches = (room: Room, tag: string, normalize = false) => {
	if (normalize) tag = tag.trim();
	return room.tags.has(tag);
};

/**
 * Returns true if the room has at least 1 occupant.
 * @param room - The room for which to check for occupants.
 * @param includeNPCs - Whether or not to count NPCs as occupants.
 */
export const roomOccupiedMatches = (room: Room, includeNPCs: boolean) => {
	if (room.occupants.length === 0) return false;
	if (!includeNPCs) return room.occupants.filter(occupant => !occupant.isNPC).length > 0;
	else return room.occupants.length > 0;
};

/**
 * Returns true if the exit's name matches the given name.
 * @param exit - The exit to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const exitNameMatches = (exit: Exit, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return exit.name === name;
}

/**
 * Returns true if the exit's name contains the given name.
 * @param exit - The exit to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const exitNameContains = (exit: Exit, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return exit.name.includes(name);
}

/**
 * Returns true if the exit's destination's ID contains the given ID.
 * @param exit - The exit to match the destination name against.
 * @param id - The destination ID to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const exitDestMatches = (exit: Exit, id: string, normalize = false) => {
	if (normalize) id = Room.generateValidId(id);
	return exit.dest.id === id;
}

/**
 * Returns true if the exit's locked.
 * @param exit - The exit for which to check the lock status.
 * @param lock - Whether or not the door should be locked.
 */
export const exitLockedMatches = (exit: Exit, lock: boolean) => {
	return lock !== exit.unlocked;
}

/**
 * Returns true if the entity's name matches the given name.
 * @param entity - The entity to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const entityNameMatches = (entity: Fixture | ItemInstance | Player | Puzzle, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return entity.name === name;
};

/**
 * Returns true if the entity's name contains the given name.
 * @param entity - The entity to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const entityNameContains = (entity: Fixture | ItemInstance | Player | Puzzle, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return entity.name.includes(name);
};

/**
 * Returns true if the entity's ID matches the given name.
 * @param entity - The entity to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const entityIdMatches = (entity: Event | Flag | Prefab, id: string, normalize = false) => {
	if (normalize) id = Game.generateValidEntityName(id);
	return entity.id === id;
};

/**
 * Returns true if the entity's ID contains the given name.
 * @param entity - The entity to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const entityIdContains = (entity: Event | Flag | Prefab, id: string, normalize = false) => {
	if (normalize) id = Game.generateValidEntityName(id);
	return entity.id.includes(id);
};

/**
 * Returns true if the entity's location's ID matches the given ID.
 * @param entity - The entity whose location we want to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const entityLocationIdMatches = (entity: RoomItemContainer | Player, id: string, normalize = false) => {
	if (normalize) id = Room.generateValidId(id);
	return entity.location && entity.location.id === id;
};

/**
 * Returns whether or not the entity's accessible property matches the given accessible state.
 * @param entity - The entity to match the accessible state against.
 * @param accessible - The accessible state to match against.
 */
export const entityAccessibleMatches = (entity: RoomItemContainer, accessible: boolean) => {
	return entity.accessible === accessible;
};

/**
 * Returns true if the fixture's recipe tag matches the given recipe tag.
 * @param fixture - The fixture to match the recipe tag against.
 * @param recipeTag - The recipe tag to match.
 * @param [normalize] - Whether or not to normalize the recipe tag before matching. Defaults to false.
 */
export const fixtureRecipeTagMatches = (fixture: Fixture, recipeTag: string, normalize = false) => {
	if (normalize) recipeTag = recipeTag.trim();
	return fixture.recipeTag === recipeTag;
};

/**
 * Returns true if the entity's effects strings include all of the given status effects.
 * @param entity - The entity to match the effects against.
 * @param effectsString - A comma-separated list of status effect IDs to match.
 * @param [normalize] - Whether or not to normalize the effects before matching. Defaults to false.
 */
export const effectsMatches = (entity: Prefab | Event, effectsString: string, normalize = false) => {
	let effects = effectsString.split(',');
	if (normalize) effects.forEach((effect, i) => effects[i] = Status.generateValidId(effect));
	return effects.every(effect => entity.effectsStrings.includes(effect));
};

/**
 * Returns true if the prefab's cures strings include all of the given status effects.
 * @param prefab - The prefab to match the cures against.
 * @param curesString - A comma-separated list of status effect IDs to match.
 * @param [normalize] - Whether or not to normalize the cures before matching. Defaults to false.
 */
export const prefabCuresMatches = (prefab: Prefab, curesString: string, normalize = false) => {
	let cures = curesString.split(',');
	if (normalize) cures.forEach((cure, i) => cures[i] = Status.generateValidId(cure));
	return cures.every(cure => prefab.curesStrings.includes(cure));
};

/**
 * Returns true if the prefab's equipment slot IDs include all of the given equipment slot IDs.
 * @param prefab - The prefab to match the equipment slots against.
 * @param equipmentSlotsString - A comma-separated list of equipment slot IDs to match.
 * @param [normalize] - Whether or not to normalize the effects before matching. Defaults to false.
 */
export const prefabEquipmentSlotsMatches = (prefab: Prefab, equipmentSlotsString: string, normalize = false) => {
	let equipmentSlots = equipmentSlotsString.split(',');
	if (normalize) equipmentSlots.forEach((equipmentSlot, i) => equipmentSlots[i] = Game.generateValidEntityName(equipmentSlot));
	return equipmentSlots.every(equipmentSlot => prefab.equipmentSlots.includes(equipmentSlot));
};

/**
 * Returns true if the recipe's type matches the given type.
 * @param recipe - The recipe to match the type against.
 * @param type - The type of recipe to match. Either `processing`, `crafting`, or `uncraftable`.
 * @param [normalize] - Whether or not to normalize the type before matching. Defaults to false.
 */
export const recipeTypeMatches = (recipe: Recipe, type: string, normalize = false) => {
	if (normalize) type = type.toLowerCase().trim();
	return type === "processing" && recipe.fixtureTag !== "" ? true
        : type === "crafting" && recipe.fixtureTag === "" ? true
        : type === "uncraftable" && recipe.uncraftable ? true
        : false;
};

/**
 * Returns true if the recipe's fixture tag matches the given fixture tag.
 * @param recipe - The recipe to match the fixture tag against.
 * @param fixtureTag - The fixture tag to match.
 * @param [normalize] - Whether or not to normalize the fixture tag before matching. Defaults to false.
 */
export const recipeFixtureTagMatches = (recipe: Recipe, fixtureTag: string, normalize = false) => {
	if (normalize) fixtureTag = fixtureTag.trim();
	return recipe.fixtureTag === fixtureTag;
};

/**
 * Returns true if the recipe's ingredients prefab IDs include all of the given prefab IDs.
 * @param recipe - The recipe to match the ingredients against.
 * @param ingredientsString - A comma-separated list of ingredient prefab IDs to match.
 * @param [normalize] - Whether or not to normalize the ingredients before matching. Defaults to false.
 */
export const recipeIngredientsMatches = (recipe: Recipe, ingredientsString: string, normalize = false) => {
	let ingredients = ingredientsString.split(',');
	if (normalize) ingredients.forEach((ingredient, i) => ingredients[i] = Game.generateValidEntityName(ingredient));
	return ingredients.every(ingredient => recipe.ingredientsFlat.map(recipeIngredient => recipeIngredient.prefab.id).includes(ingredient));
};

/**
 * Returns true if the recipe's products prefab IDs include all of the given prefab IDs.
 * @param recipe - The recipe to match the products against.
 * @param productsString - A comma-separated list of product prefab IDs to match.
 * @param [normalize] - Whether or not to normalize the products before matching. Defaults to false.
 */
export const recipeProductsMatches = (recipe: Recipe, productsString: string, normalize = false) => {
	let products = productsString.split(',');
	if (normalize) products.forEach((product, i) => products[i] = Game.generateValidEntityName(product));
	return products.every(product => recipe.productsFlat.map(recipeProduct => recipeProduct.prefab.id).includes(product));
};

/**
 * Returns true if any of the prefabs possible names matches the given name.
 * @param prefab - The prefab to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const prefabNameMatches = (prefab: Prefab, name: string, normalize = false) => {
    if (normalize) name = Game.generateValidEntityName(name);
    for (let [prefabSingleName, prefabPluralName] of prefab.possibleNames.values()) {
        if (prefabSingleName === name || prefabPluralName && prefabPluralName === name) return true;
    }
    return false;
};

/**
 * Returns true if the prefab's ID or any of its possible names matches the given identifier.
 * @param prefab - The prefab to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const prefabIdOrNameMatches = (prefab: Prefab, identifier: string, normalize = false) => {
    if (normalize) identifier = Game.generateValidEntityName(identifier);
    if (entityIdMatches(prefab, identifier)) return true;
    return prefabNameMatches(prefab, identifier);
};

/**
 * Returns true if any of the prefabs possible names contains the given name.
 * @param prefab - The prefab to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const prefabNameContains = (prefab: Prefab, name: string, normalize = false) => {
    if (normalize) name = Game.generateValidEntityName(name);
    for (let [prefabSingleName, prefabPluralName] of prefab.possibleNames.values()) {
        if (prefabSingleName.includes(name) || prefabPluralName && prefabPluralName.includes(name)) return true;
    }
    return false;
};

/**
 * Returns true if the prefab's ID or any of its possible names contains the given identifier.
 * @param prefab - The prefab to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const prefabIdOrNameContains = (prefab: Prefab, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	if (entityIdContains(prefab, identifier)) return true;
    return prefabNameContains(prefab, identifier);
};

/**
 * Returns true if the item's name matches the given name.
 * @param item - The item instance to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const itemNameMatches = (item: ItemInstance, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return item.name === name || item.pluralName === name;
};

/**
 * Returns true if the item's identifier matches the given identifier.
 * @param item - The item instance to match the identifier against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemIdentifierMatches = (item: ItemInstance, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	return item.identifier !== "" && item.identifier === identifier || item.prefab && item.prefab.id === identifier;
};

/**
 * Returns true if the item's identifier or name matches the given identifier.
 * @param item - The item instance to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemIdentifierOrNameMatches = (item: ItemInstance, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	return itemIdentifierMatches(item, identifier) || itemNameMatches(item, identifier);
};

/**
 * Returns true if the item's identifier or name contains the given identifier.
 * @param item - The item instance to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemIdentifierOrNameContains = (item: ItemInstance, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	return item.identifier !== "" && item.identifier.includes(identifier)
		|| item.prefab && item.prefab.id.includes(identifier)
		|| item.name.includes(identifier)
		|| item.pluralName !== "" && item.pluralName.includes(identifier);
};

/**
 * Returns true if the item's container's type matches the given type.
 * @param item - The item instance whose container we want to match the type against.
 * @param type - The type to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const itemContainerTypeMatches = (item: RoomItem | InventoryItem, type: string, normalize = false) => {
	if (normalize) {
		type = Game.generateValidEntityName(type);
		if (type === "FIXTURE" || type === "OBJECT") type = "Fixture";
		else if (type === "ROOMITEM" || type === "ITEM") type = "RoomItem";
		else if (type === "PUZZLE") type = "Puzzle";
		else if (type === "INVENTORYITEM") type = "InventoryItem";
	}
	return item.containerType === type;
};

/**
 * Returns true if the item's container's name matches the given name.
 * @param item - The item instance whose container we want to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const itemContainerNameMatches = (item: RoomItem | InventoryItem, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	if (!item.container) return false;
	if (item.container instanceof ItemInstance) return item.container.name === name || item.container.pluralName === name;
	return item.container.name === name;
};

/**
 * Returns true if the item's container's identifier matches the given identifier.
 * @param item - The item instance whose container we want to match the identifier against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemContainerIdentifierMatches = (item: RoomItem | InventoryItem, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	if (!item.container) return false;
	if (item.container instanceof ItemInstance) return item.container.identifier !== "" && item.container.identifier === identifier || item.container.prefab && item.container.prefab.id === identifier;
	return itemContainerNameMatches(item, identifier);
};

/**
 * Returns true if the item's container's identifier or name matches the given identifier.
 * @param item - The item instance whose container we want to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemContainerIdentifierOrNameMatches = (item: RoomItem | InventoryItem, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	if (!item.container) return false;
	if (item.container instanceof ItemInstance) return itemContainerIdentifierMatches(item, identifier) || itemContainerNameMatches(item, identifier);
	return itemContainerNameMatches(item, identifier);
};

/**
 * Returns true if the item's container's identifier or name matches the given identifier.
 * @param item - The item instance whose container we want to match the identifier or name against.
 * @param identifier - The identifier to match.
 * @param [normalize] - Whether or not to normalize the identifier before matching. Defaults to false.
 */
export const itemContainerIdentifierOrNameContains = (item: RoomItem | InventoryItem, identifier: string, normalize = false) => {
	if (normalize) identifier = Game.generateValidEntityName(identifier);
	if (!item.container) return false;
	if (item.container instanceof ItemInstance) return itemIdentifierOrNameContains(item.container, identifier);
	return entityNameContains(item.container, identifier);
};

/**
 * Returns true if the item's containerName matches the given container name.
 * @param item - The item instance to match the container name against.
 * @param containerName - The container name to match.
 * @param [normalize] - Whether or not to normalize the container name before matching. Defaults to false.
 */
export const itemContainerNamePropertyMatches = (item: ItemInstance, containerName: string, normalize = false) => {
	if (normalize) containerName = Game.generateValidEntityName(containerName);
	return Game.generateValidEntityName(item.containerName) === containerName;
};

/**
 * Returns true if the inventory slot ID the item instance is contained in matches the given slot ID.
 * @param item - The item instance to match the inventory slot ID against.
 * @param slotId - The inventory slot ID to match.
 * @param [normalize] - Whether or not to normalize the slot ID before matching. Defaults to false.
 */
export const itemSlotMatches = (item: ItemInstance, slotId: string, normalize = false) => {
	if (normalize) slotId = Game.generateValidEntityName(slotId);
	return item.slot === slotId;
};

/**
 * Returns true if the item's procedural selections match the given procedural selections string.
 * @param item - The item instance to match the procedural selections against.
 * @param proceduralSelectionsString - The procedural selections string to match. This should be in the format "(procedural1 = poss1 + procedural2 = poss2 + ...)".
 */
export const itemProceduralSelectionsMatches = (item: ItemInstance, proceduralSelectionsString: string) => {
    return item.proceduralSelectionsString === proceduralSelectionsString;
};

/**
 * Returns true if the puzzle's type matches the given type.
 * @param puzzle - The puzzle to match the type against.
 * @param type - The type to match.
 * @param [normalize] - Whether or not to normalize the slot ID before matching. Defaults to false.
 */
export const puzzleTypeMatches = (puzzle: Puzzle, type: string, normalize = false) => {
	if (normalize) type = type.trim();
	return puzzle.type === type;
};

/**
 * Returns whether or not the event's ongoing property matches the given ongoing state.
 * @param event - The event to match the ongoing state against.
 * @param ongoing - The ongoing state to match against.
 */
export const eventOngoingMatches = (event: Event, ongoing: boolean) => {
	return event.ongoing === ongoing;
};

/**
 * Returns true if the event's refreshes strings include all of the given status effects.
 * @param event - The event to match the effects against.
 * @param refreshesString - A comma-separated list of status effect IDs to match.
 * @param [normalize] - Whether or not to normalize the cures before matching. Defaults to false.
 */
export const eventRefreshesMatches = (event: Event, refreshesString: string, normalize = false) => {
	let refreshes = refreshesString.split(',');
	if (normalize) refreshes.forEach((refresh, i) => refreshes[i] = Status.generateValidId(refresh));
	return refreshes.every(refresh => event.refreshesStrings.includes(refresh));
};

/**
 * Returns true if the event's room tag matches the given room tag.
 * @param event - The event to match the room tag against.
 * @param roomTag - The room tag to match.
 * @param [normalize] - Whether or not to normalize the room tag before matching. Defaults to false.
 */
export const eventRoomTagMatches = (event: Event, roomTag: string, normalize = false) => {
	if (normalize) roomTag = roomTag.trim();
	return event.roomTag === roomTag;
};

/**
 * Returns true if the status's ID matches the given ID.
 * @param status - The status to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const statusIdMatches = (status: Status, id: string, normalize = false) => {
	if (normalize) id = Status.generateValidId(id);
	return status.id === id;
};

/**
 * Returns true if the status's ID contains the given ID.
 * @param status - The status to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const statusIdContains = (status: Status, id: string, normalize = false) => {
	if (normalize) id = Status.generateValidId(id);
	return status.id.includes(id);
};

/**
 * Returns true if the status modifies all of the given stats.
 * @param status - The status to match the stats against.
 * @param statsString - A comma-separated list of stats to match the stat modifiers against.
 * @param [normalize] - Whether or not to normalize the stats before matching. Defaults to false.
 */
export const statusStatModifiersMatches = (status: Status, statsString: string, normalize = false) => {
	let stats = statsString.split(',');
	if (normalize) stats.forEach((stat, i) => stats[i] = Player.abbreviateStatName(stat));
	const statModifiers = status.statModifiers.map(statModifier => statModifier.stat);
	return stats.every(stat => statModifiers.includes(stat));
};

/**
 * Returns true if the status's behavior attributes include all of the given attributes.
 * @param status - The status to match the attributes against.
 * @param attributesString - A comma-separated list of behavior attributes to match the status against.
 * @param [normalize] - Whether or not to normalize the attributes before matching. Defaults to false.
 */
export const statusAttributeMatches = (status: Status, attributesString: string, normalize = false) => {
	let attributes = attributesString.split(',');
	if (normalize) attributes.forEach((attribute, i) => attributes[i] = attribute.trim());
	return attributes.every(attribute => status.behaviorAttributes.has(attribute));
};

/**
 * Returns true if the player's name matches the given name.
 * @param player - The player to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const playerNameMatches = (player: Player, name: string, normalize = false) => {
	if (normalize) name = name.toLowerCase().trim();
	return player.name.toLowerCase() === name;
};

/**
 * Returns true if the player's name or display name matches the given name.
 * @param player - The player to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const playerNameOrDisplayNameMatches = (player: Player, name: string, normalize = false) => {
	if (normalize) name = name.toLowerCase().trim();
	return playerNameMatches(player, name) || player.displayName.toLowerCase() === name;
};

/**
 * Returns true if the player's name contains the given name.
 * @param player - The player to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const playerNameContains = (player: Player, name: string, normalize = false) => {
	if (normalize) name = name.toLowerCase().trim();
	return player.name.toLowerCase().includes(name);
};

/**
 * Returns true if the player's name or display name matches the given name.
 * @param player - The player to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const playerNameOrDisplayNameContains = (player: Player, name: string, normalize = false) => {
	if (normalize) name = name.toLowerCase().trim();
	return playerNameContains(player, name) || player.displayName.toLowerCase().includes(name);
};

/**
 * Returns whether or not the player's NPC state matches the given NPC state.
 * @param player - The player to match the NPC state against.
 * @param isNPC - The NPC state to match.
 */
export const playerNPCMatches = (player: Player, isNPC: boolean) => {
	return player.isNPC === isNPC;
};

/**
 * Returns true if the player's hiding spot matches the given hiding spot.
 * @param player - The player to match the hiding spot against.
 * @param hidingSpot - The hiding spot to match.
 * @param [normalize] - Whether or not to normalize the hiding spot before matching. Defaults to false.
 */
export const playerHidingSpotMatches = (player: Player, hidingSpot: string, normalize = false) => {
	if (normalize) hidingSpot = Game.generateValidEntityName(hidingSpot);
	return player.hidingSpot === hidingSpot;
};

/**
 * Returns true if the players's status strings include all of the given status effects.
 * @param player - The player to match the status effects against.
 * @param statusString - A comma-separated list of status effect IDs to match.
 * @param [normalize] - Whether or not to normalize the status effects before matching. Defaults to false.
 */
export const playerStatusMatches = (player: Player, statusString: string, normalize = false) => {
	let statuses = statusString.split(',');
	if (normalize) statuses.forEach((status, i) => statuses[i] = Status.generateValidId(status));
	const playerStatuses = new Set(player.status.map(status => status.id));
	return statuses.every(status => playerStatuses.has(status));
};

/**
 * Returns true if the inventory item's player's name matches the given name.
 * @param inventoryItem - The inventory item whose player we want to match the name against.
 * @param name - The name to match.
 * @param [normalize] - Whether or not to normalize the name before matching. Defaults to false.
 */
export const inventoryItemPlayerNameMatches = (inventoryItem: InventoryItem, name: string, normalize = false) => {
	if (normalize) name = Game.generateValidEntityName(name);
	return Game.generateValidEntityName(inventoryItem.player.name) === name;
};

/**
 * Returns true if the inventory item's equipment slot ID matches the given equipment slot ID.
 * @param inventoryItem - The inventory item whose equipment slot we want to match the equipment slot ID against.
 * @param equipmentSlotId - The ID of the equipment slot to match.
 * @param [normalize] - Whether or not to normalize the equipment slot ID before matching. Defaults to false.
 */
export const inventoryItemEquipmentSlotMatches = (inventoryItem: InventoryItem, equipmentSlotId: string, normalize = false) => {
	if (normalize) equipmentSlotId = Game.generateValidEntityName(equipmentSlotId);
	return inventoryItem.equipmentSlot === equipmentSlotId;
};

/**
 * Returns true if the gesture's ID matches the given ID.
 * @param gesture - The gesture to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const gestureIdMatches = (gesture: Gesture, id: string, normalize = false) => {
	if (normalize) id = Gesture.generateValidId(id);
	return gesture.id === id;
};

/**
 * Returns true if the gesture's ID contains the given ID.
 * @param gesture - The gesture to match the ID against.
 * @param id - The ID to match.
 * @param [normalize] - Whether or not to normalize the ID before matching. Defaults to false.
 */
export const gestureIdContains = (gesture: Gesture, id: string, normalize = false) => {
	if (normalize) id = Gesture.generateValidId(id);
	return gesture.id.includes(id);
};
