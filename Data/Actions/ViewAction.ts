import type Interactable from "../../Classes/Interactables/Interactable.ts";
import Action from "../Action.ts";
import Event, { type EventField } from "../Event.ts";
import Fixture, { type FixtureField } from "../Fixture.ts";
import Flag, { type FlagField } from "../Flag.ts";
import Gesture, { type GestureField } from "../Gesture.ts";
import InventoryItem, { type InventoryItemField } from "../InventoryItem.ts";
import Player, { type PlayerField } from "../Player.ts";
import Prefab, { type PrefabField } from "../Prefab.ts";
import Puzzle, { type PuzzleField } from "../Puzzle.ts";
import Recipe, { type RecipeField } from "../Recipe.ts";
import Room, { type RoomField } from "../Room.ts";
import RoomItem, { type RoomItemField } from "../RoomItem.ts";
import Status, { type StatusField } from "../Status.ts";
import type BotInteractableManager from "../../Classes/BotInteractableManager.ts";
export type EntityField = EventField|FixtureField|FlagField|GestureField|InventoryItemField|PlayerField|PrefabField|PuzzleField|RecipeField|RoomField|RoomItemField|StatusField;

/**
 * Represents a view action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/view-action.html
 */
export default class ViewAction extends Action {
    /** Shorthand for the interactable manager, since we'll be using it a lot. */
    #interactableManager: BotInteractableManager;

    /**
     * Performs a view action.
     *
     * @param entity - A persistent game entity to view.
     * @param field - The name of a field belonging to the given entity to view. Optional.
     */
    async performView(entity: PersistentGameEntity, field?: EntityField): Promise<void> {
        if (this.performed) return;
        super.perform();
        let entityType: PersistentGameEntityName;
        let views: ViewField[] = [];
        let interactables: Interactable[] = [];
        this.#interactableManager = this.getGame().botContext.interactableManager;
        if (entity instanceof Room) {
            entityType = "Room";
            views = this.#getRoomView(entity, field as RoomField);
            interactables = await this.#getRoomInteractables(entity);
        }
        if (entity instanceof Fixture) {
            entityType = "Fixture";
            views = this.#getFixtureView(entity, field as FixtureField);
            interactables = await this.#getFixtureInteractables(entity);
        }
        if (entity instanceof Prefab) {
            entityType = "Prefab";
            views = this.#getPrefabView(entity, field as PrefabField);
            interactables = await this.#getPrefabInteractables(entity);
        }
        if (entity instanceof Recipe) {
            entityType = "Recipe";
            views = this.#getRecipeView(entity, field as RecipeField);
            interactables = await this.#getRecipeInteractables(entity);
        }
        if (entity instanceof RoomItem) {
            entityType = "RoomItem";
            views = this.#getRoomItemView(entity, field as RoomItemField);
            interactables = await this.#getRoomItemInteractables(entity);
        }
        if (entity instanceof Puzzle) {
            entityType = "Puzzle";
            views = this.#getPuzzleView(entity, field as PuzzleField);
            interactables = await this.#getPuzzleInteractables(entity);
        }
        if (entity instanceof Event) {
            entityType = "Event";
            views = this.#getEventView(entity, field as EventField);
            interactables = await this.#getEventInteractables(entity);
        }
        if (entity instanceof Status) {
            entityType = "StatusEffect";
            views = this.#getStatusView(entity, field as StatusField);
            interactables = await this.#getStatusInteractables(entity);
        }
        if (entity instanceof Player) {
            entityType = "Player";
            views = this.#getPlayerView(entity, field as PlayerField);
            interactables = await this.#getPlayerInteractables(entity);
        }
        if (entity instanceof InventoryItem) {
            entityType = "InventoryItem";
            views = this.#getInventoryItemView(entity, field as InventoryItemField);
            interactables = await this.#getInventoryItemInteractables(entity);
        }
        if (entity instanceof Gesture) {
            entityType = "Gesture";
            views = this.#getGestureView(entity, field as GestureField);
            interactables = await this.#getGestureInteractables(entity);
        }
        if (entity instanceof Flag) {
            entityType = "Flag";
            views = this.#getFlagView(entity, field as FlagField);
            interactables = await this.#getFlagInteractables(entity);
        }
        this.getGame().communicationHandler.sendEntityView(entityType, entity.row, views, interactables);
    }

    /**
     * Gets an array of view fields for the given room.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRoomView(entity: Room, field?: RoomField): ViewField[] {
        let fields: RoomField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "displayName",
                "tags",
                "iconURL",
                "exits"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given room.
     * @param entity - The entity to generate interactables for.
     */
    async #getRoomInteractables(entity: Room): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given fixture.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getFixtureView(entity: Fixture, field?: FixtureField): ViewField[] {
        let fields: FixtureField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "name",
                "location",
                "accessible",
                "childPuzzle",
                "recipeTag",
                "activatable",
                "activated",
                "autoDeactivate",
                "hidingSpotCapacity",
                "preposition"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given fixture.
     * @param entity - The entity to generate interactables for.
     */
    async #getFixtureInteractables(entity: Fixture): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        interactables = interactables.concat(await this.#interactableManager.getInstantiateRoomItemInteractables([entity], this.user));
        interactables = interactables.concat(await this.#interactableManager.getDestroyRoomItemInteractables([entity], this.user));
        return interactables;
    }

    /**
     * Gets an array of view fields for the given prefab.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getPrefabView(entity: Prefab, field?: PrefabField): ViewField[] {
        let fields: PrefabField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "names",
                "containingPhrases",
                "discreet",
                "containingPhrases",
                "discreet",
                "size",
                "weight",
                "usable",
                "useVerb",
                "uses",
                "inflicts",
                "cures",
                "nextStage",
                "equippable",
                "equipmentSlots",
                "coveredEquipmentSlots",
                "commandsString",
                "inventorySlots",
                "preposition"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given prefab.
     * @param entity - The entity to generate interactables for.
     */
    async #getPrefabInteractables(entity: Prefab): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given recipe.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRecipeView(entity: Recipe, field?: RecipeField): ViewField[] {
        let fields: RecipeField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "ingredientsString",
                "uncraftable",
                "fixtureTag",
                "durationString",
                "productsString"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given recipe.
     * @param entity - The entity to generate interactables for.
     */
    async #getRecipeInteractables(entity: Recipe): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given room item.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRoomItemView(entity: RoomItem, field?: RoomItemField): ViewField[] {
        let fields: RoomItemField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "prefab",
                "identifier",
                "location",
                "accessible",
                "container",
                "quantity",
                "uses"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given room item.
     * @param entity - The entity to generate interactables for.
     */
    async #getRoomItemInteractables(entity: RoomItem): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (entity.quantity !== 0) {
            interactables = interactables.concat(await this.#interactableManager.getInstantiateRoomItemInteractables([entity], this.user));
            interactables = interactables.concat(await this.#interactableManager.getDestroyRoomItemInteractables([entity], this.user));
        }
        return interactables;
    }

    /**
     * Gets an array of view fields for the given puzzle.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getPuzzleView(entity: Puzzle, field?: PuzzleField): ViewField[] {
        let fields: PuzzleField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "name",
                "solved",
                "outcome",
                "requiresMod",
                "location",
                "parentFixture",
                "type",
                "accessible",
                "requirements",
                "solutions",
                "remainingAttempts"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given puzzle.
     * @param entity - The entity to generate interactables for.
     */
    async #getPuzzleInteractables(entity: Puzzle): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        interactables = interactables.concat(await this.#interactableManager.getInstantiateRoomItemInteractables([entity], this.user));
        interactables = interactables.concat(await this.#interactableManager.getDestroyRoomItemInteractables([entity], this.user));
        return interactables;
    }

    /**
     * Gets an array of view fields for the given event.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getEventView(entity: Event, field?: EventField): ViewField[] {
        let fields: EventField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "ongoing",
                "durationString",
                "timeRemaining",
                "triggerTimesString",
                "roomTag",
                "effectsString",
                "refreshesString"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given event.
     * @param entity - The entity to generate interactables for.
     */
    async #getEventInteractables(entity: Event): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given status.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getStatusView(entity: Status, field?: StatusField): ViewField[] {
        let fields: StatusField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "durationString",
                "fatal",
                "visible",
                "overridersString",
                "curesString",
                "nextStage",
                "duplicatedStatus",
                "curedCondition",
                "statModifiers",
                "behaviorAttributes"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given status.
     * @param entity - The entity to generate interactables for.
     */
    async #getStatusInteractables(entity: Status): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given player.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getPlayerView(entity: Player, field?: PlayerField): ViewField[] {
        let fields: PlayerField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "name",
                "title",
                "pronounString",
                "originalVoiceString",
                "defaultStrength",
                "defaultPerception",
                "defaultDexterity",
                "defaultSpeed",
                "defaultStamina",
                "alive",
                "location",
                "hidingSpot",
                "status"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given player.
     * @param entity - The entity to generate interactables for.
     */
    async #getPlayerInteractables(entity: Player): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given inventory item.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getInventoryItemView(entity: InventoryItem, field?: InventoryItemField): ViewField[] {
        let fields: InventoryItemField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "player",
                "prefab",
                "identifier",
                "equipmentSlot",
                "container",
                "quantity",
                "uses"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given inventory item.
     * @param entity - The entity to generate interactables for.
     */
    async #getInventoryItemInteractables(entity: InventoryItem): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        if (entity.quantity !== 0) {
            const isEquipped = entity.container === null && entity.prefab !== null;
            const isEmpty = entity.container === null && entity.prefab === null;
            const equipmentSlot = entity.player.inventory.get(entity.equipmentSlot);
            interactables = interactables.concat(await this.#interactableManager.getInstantiateInventoryItemInteractables(entity.player, this.user, isEmpty ? [equipmentSlot] : [], isEquipped ? [] : [entity]));
            interactables = interactables.concat(await this.#interactableManager.getDestroyInventoryItemInteractables(entity.player, this.user, isEquipped ? [entity] : [], isEmpty ? [] : [entity]));
        }
        return interactables;
    }

    /**
     * Gets an array of view fields for the given gesture.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getGestureView(entity: Gesture, field?: GestureField): ViewField[] {
        let fields: GestureField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "requires",
                "disabledStatusesString",
                "description"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given gesture.
     * @param entity - The entity to generate interactables for.
     */
    async #getGestureInteractables(entity: Gesture): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }

    /**
     * Gets an array of view fields for the given flag.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getFlagView(entity: Flag, field?: FlagField): ViewField[] {
        let fields: FlagField[] = [];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "value",
                "valueScript"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given flag.
     * @param entity - The entity to generate interactables for.
     */
    async #getFlagInteractables(entity: Flag): Promise<Interactable[]> {
        let interactables: Interactable[] = [];
        return interactables;
    }
}
