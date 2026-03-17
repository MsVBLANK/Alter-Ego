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
export type EntityField = EventField|FixtureField|FlagField|GestureField|InventoryItemField|PlayerField|PrefabField|PuzzleField|RecipeField|RoomField|RoomItemField|StatusField;

/**
 * Represents a view action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/view-action.html
 */
export default class ViewAction extends Action {
    /**
     * Performs a view action.
     * 
     * @param entity - A persistent game entity to view.
     * @param field - The name of a field belonging to the given entity to view. Optional.
     */
    performView(entity: PersistentGameEntity, field?: EntityField): void {
        if (this.performed) return;
        super.perform();
        let entityType: PersistentGameEntityName;
        let views: ViewField[] = [];
        if (entity instanceof Room) {
            entityType = "Room";
            views = this.#getRoomView(entity, field as RoomField)
        }
        if (entity instanceof Fixture) {
            entityType = "Fixture";
            views = this.#getFixtureView(entity, field as FixtureField);
        }
        if (entity instanceof Prefab) {
            entityType = "Prefab";
            views = this.#getPrefabView(entity, field as PrefabField);
        }
        if (entity instanceof Recipe) {
            entityType = "Recipe";
            views = this.#getRecipeView(entity, field as RecipeField);
        }
        if (entity instanceof RoomItem) {
            entityType = "RoomItem";
            views = this.#getRoomItemView(entity, field as RoomItemField);
        }
        if (entity instanceof Puzzle) {
            entityType = "Puzzle";
            views = this.#getPuzzleView(entity, field as PuzzleField);
        }
        if (entity instanceof Event) {
            entityType = "Event";
            views = this.#getEventView(entity, field as EventField);
        }
        if (entity instanceof Status) {
            entityType = "StatusEffect";
            views = this.#getStatusView(entity, field as StatusField);
        }
        if (entity instanceof Player) {
            entityType = "Player";
            views = this.#getPlayerView(entity, field as PlayerField);
        }
        if (entity instanceof InventoryItem) {
            entityType = "InventoryItem";
            views = this.#getInventoryItemView(entity, field as InventoryItemField);
        }
        if (entity instanceof Gesture) {
            entityType = "Gesture";
            views = this.#getGestureView(entity, field as GestureField);
        }
        if (entity instanceof Flag) {
            entityType = "Flag";
            views = this.#getFlagView(entity, field as FlagField);
        }
        this.getGame().communicationHandler.sendEntityView(entityType, entity.row, views);
    }

    /**
     * Gets the room results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the fixture results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the prefab results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the recipe results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the room item results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the puzzle results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the event results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the status results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the player results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the inventory item results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the gesture results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
     * Gets the flag results from the given search query. Also sets the appropriate fields.
     * @param query - The search query to narrow down the results.
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
}
