import type BotInteractableManager from "../../Classes/BotInteractableManager.ts";
import type Interactable from "../../Classes/Interactables/Interactable.ts";
import Action from "../Action.ts";
import Event, { type EventField } from "../Event.ts";
import Exit, { type ExitField } from "../Exit.ts";
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

export type EntityField<T extends PersistentGameEntity> =
    T extends Event ? EventField :
    T extends Exit ? ExitField :
    T extends Fixture ? FixtureField :
    T extends Flag ? FlagField :
    T extends Gesture ? GestureField :
    T extends InventoryItem ? InventoryItemField :
    T extends Player ? PlayerField :
    T extends Prefab ? PrefabField :
    T extends Puzzle ? PuzzleField :
    T extends Recipe ? RecipeField :
    T extends Room ? RoomField :
    T extends RoomItem ? RoomItemField :
    T extends Status ? StatusField :
    never;

/**
 * Represents a view action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/view-action.html
 */
export default class ViewAction extends Action {
    static readonly dataTypeRegex = /^((?<Room>room(?! ?item)s?)|(?<Exit>exits?)|(?<Fixture>objects?|fixtures?)|(?<Prefab>prefabs?)|(?<Recipe>recipes?)|(?<RoomItem>(room ?)?items?)|(?<Puzzle>puzzles?)|(?<Event>events?)|(?<Status>status(?:es)? ?(?:effects?)?)|(?<Player>players?)|(?<InventoryItem>inventory(?: ?items?)?)|(?<Gesture>gestures?)|(?<Flag>flags?))(?<search>.*)/i;
    /** Shorthand for the interactable manager, since we'll be using it a lot. */
    #interactableManager: BotInteractableManager;

    /**
     * Performs a view action.
     *
     * @param entity - A persistent game entity to view.
     * @param row
     * @param field - The name of a field belonging to the given entity to view. Optional.
     */
    async performView<T extends PersistentGameEntity>(entity: T, field?: EntityField<T>): Promise<void> {
        if (this.performed) return;
        super.perform();
        let entityType: PersistentGameEntityName;
        let views: ViewField[] = [];
        let interactables: Interactable[] = [];
        this.#interactableManager = this.getGame().botContext.interactableManager;
        if (entity instanceof Room) {
            entityType = "Room";
            views = this.#getRoomView(entity, field as RoomField);
            if (!field) interactables = await this.#getRoomInteractables(entity);
        }
        if (entity instanceof Exit) {
            entityType = "Exit";
            views = this.#getExitView(entity, field as ExitField);
            if (!field) interactables = await this.#getExitInteractables(entity);
        }
        if (entity instanceof Fixture) {
            entityType = "Fixture";
            views = this.#getFixtureView(entity, field as FixtureField);
            if (!field) interactables = await this.#getFixtureInteractables(entity);
        }
        if (entity instanceof Prefab) {
            entityType = "Prefab";
            views = this.#getPrefabView(entity, field as PrefabField);
            if (!field) interactables = await this.#getPrefabInteractables(entity);
        }
        if (entity instanceof Recipe) {
            entityType = "Recipe";
            views = this.#getRecipeView(entity, field as RecipeField);
            if (!field) interactables = await this.#getRecipeInteractables(entity);
        }
        if (entity instanceof RoomItem) {
            entityType = "RoomItem";
            views = this.#getRoomItemView(entity, field as RoomItemField);
            if (!field) interactables = await this.#getRoomItemInteractables(entity);
        }
        if (entity instanceof Puzzle) {
            entityType = "Puzzle";
            views = this.#getPuzzleView(entity, field as PuzzleField);
            if (!field) interactables = await this.#getPuzzleInteractables(entity);
        }
        if (entity instanceof Event) {
            entityType = "Event";
            views = this.#getEventView(entity, field as EventField);
            if (!field) interactables = await this.#getEventInteractables(entity);
        }
        if (entity instanceof Status) {
            entityType = "StatusEffect";
            views = this.#getStatusView(entity, field as StatusField);
            if (!field) interactables = await this.#getStatusInteractables(entity);
        }
        if (entity instanceof Player) {
            entityType = "Player";
            views = this.#getPlayerView(entity, field as PlayerField);
            if (!field) interactables = await this.#getPlayerInteractables(entity);
        }
        if (entity instanceof InventoryItem) {
            entityType = "InventoryItem";
            views = this.#getInventoryItemView(entity, field as InventoryItemField);
            if (!field) interactables = await this.#getInventoryItemInteractables(entity);
        }
        if (entity instanceof Gesture) {
            entityType = "Gesture";
            views = this.#getGestureView(entity, field as GestureField);
            if (!field) interactables = await this.#getGestureInteractables(entity);
        }
        if (entity instanceof Flag) {
            entityType = "Flag";
            views = this.#getFlagView(entity, field as FlagField);
            if (!field) interactables = await this.#getFlagInteractables(entity);
        }
        this.getGame().communicationHandler.sendEntityView(entityType, entity.row, views, interactables);
    }

    /**
     * Finds the required game entity and field to call performView.
     *
     * @param args - The args as strings.
     */
    parseInteractionArgs<T extends PersistentGameEntity>(args: string[]): [T, EntityField<T>] {
        let entity: PersistentGameEntity;
        const row = args[1] && !isNaN(parseInt(args[1])) ? parseInt(args[1]) : -1;
        if (row > 0) {
            switch (args[0]) {
                case "Event":
                    entity = this.getGame().entityFinder.getEventByRow(row);
                    break;
                case "Exit":
                    entity = this.getGame().entityFinder.getExitByRow(row);
                    break;
                case "Fixture":
                    entity = this.getGame().entityFinder.getFixtureByRow(row);
                    break;
                case "Flag":
                    entity = this.getGame().entityFinder.getFlagByRow(row);
                    break;
                case "Gesture":
                    entity = this.getGame().entityFinder.getGestureByRow(row);
                    break;
                case "InventoryItem":
                    entity = this.getGame().entityFinder.getInventoryItemByRow(row);
                    break;
                case "Player":
                    entity = this.getGame().entityFinder.getPlayerByRow(row);
                    break;
                case "Prefab":
                    entity = this.getGame().entityFinder.getPrefabByRow(row);
                    break;
                case "Puzzle":
                    entity = this.getGame().entityFinder.getPuzzleByRow(row);
                    break;
                case "Recipe":
                    entity = this.getGame().entityFinder.getRecipeByRow(row);
                    break;
                case "Room":
                    entity = this.getGame().entityFinder.getRoomByRow(row);
                    break;
                case "RoomItem":
                    entity = this.getGame().entityFinder.getRoomItemByRow(row);
                    break;
                case "Status":
                    entity = this.getGame().entityFinder.getStatusEffectByRow(row);
                    break;
            }
        }
        const field = args[2] ?? undefined;
        return [entity as T, field as EntityField<T>];
    }

    /**
     * Validates the parsed args. The results can be passed directly into performView.
     *
     * @param args - The args after being parsed.
     */
    validateInteractionArgs<T extends PersistentGameEntity>(args: [T, EntityField<T>]): [T, EntityField<T>] {
        if (args.length !== 2) throw new Error("Insufficient arguments.");
        if (!args[0]) throw new Error("Invalid entity.");
        if (!(args[0] instanceof Event) && !(args[0] instanceof Exit) && !(args[0] instanceof Fixture) && !(args[0] instanceof Flag) && !(args[0] instanceof Gesture)
            && !(args[0] instanceof InventoryItem) && !(args[0] instanceof Player) && !(args[0] instanceof Prefab) && !(args[0] instanceof Puzzle)
            && !(args[0] instanceof Recipe) && !(args[0] instanceof Room) && !(args[0] instanceof RoomItem) && !(args[0] instanceof Status))
            throw new Error("Entity is not viewable.");
        const entity = args[0];
        if (args[1] && !(args[1] in entity)) throw new Error(`Field ${args[1]} does not exist on entity ${entity.getEntityID()}.`);
        const field = args[1] as EntityField<T>;
        return [entity, field];
    }

    /**
     * Gets an array of view fields for the given room.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRoomView(entity: Room, field?: RoomField): ViewField[] {
        let fields: RoomField[];
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
        let interactables: Interactable[];
        const fields: RoomField[] = ["description"];
        let relatedEntities: PersistentGameEntity[] = [];
        entity.exits.forEach(exit => relatedEntities.push(exit));
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        const containedEntityQueries = [
            entity.getFindActionDirectiveArgs("Fixtures"),
            entity.getFindActionDirectiveArgs("RoomItems"),
            entity.getFindActionDirectiveArgs("Puzzles")
        ];
        interactables = interactables.concat(await this.#interactableManager.createFindActionInteractables(containedEntityQueries, this.user));
        return interactables;
    }

    /**
     * Gets an array of view fields for the given exit.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getExitView(entity: Exit, field?: ExitField): ViewField[] {
        let fields: ExitField[];
        if (field) fields = [field];
        else {
            fields = [
                "name",
                "phrase",
                "tags",
                "x",
                "y",
                "z",
                "unlocked",
                "dest",
                "link"
            ];
        }
        return fields.map(field => entity.getViewField(field));
    }

    /**
     * Gets interactables for the given exit.
     * @param entity - The entity to generate interactables for.
     */
    async #getExitInteractables(entity: Exit): Promise<Interactable[]> {
        let interactables: Interactable[];
        const fields: ExitField[] = ["description"];
        let relatedEntities: PersistentGameEntity[] = [];
        relatedEntities.push(entity.dest);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given fixture.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getFixtureView(entity: Fixture, field?: FixtureField): ViewField[] {
        let fields: FixtureField[];
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
        let interactables: Interactable[];
        const fields: FixtureField[] = ["description"];
        let relatedEntities: PersistentGameEntity[] = [];
        relatedEntities.push(entity.location);
        if (entity.childPuzzle) relatedEntities.push(entity.childPuzzle);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        interactables = interactables.concat(await this.#interactableManager.getFindContainedItemsInteractables(entity, this.user));
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
        let fields: PrefabField[];
        if (field) fields = [field];
        else {
            fields = [
                "id",
                "names",
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
        let interactables: Interactable[];
        const fields: PrefabField[] = ["description", "commandsString", "proceduralOptions"];
        if (entity.possibleNames.size > 1) fields.push("possibleNames");
        if (entity.possibleContainingPhrases.size > 1) fields.push("possibleContainingPhrases");
        let relatedEntities: PersistentGameEntity[] = [];
        entity.effects.forEach(status => relatedEntities.push(status));
        entity.cures.forEach(status => relatedEntities.push(status));
        if (entity.nextStage) relatedEntities.push(entity.nextStage);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given recipe.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRecipeView(entity: Recipe, field?: RecipeField): ViewField[] {
        let fields: RecipeField[];
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
        let interactables: Interactable[];
        const fields: RecipeField[] = ["initiatedDescription", "completedDescription", "uncraftedDescription"];
        let relatedEntities: PersistentGameEntity[] = [];
        entity.ingredientsFlat.forEach(ingredient => relatedEntities.push(ingredient.prefab));
        entity.productsFlat.forEach(product => relatedEntities.push(product.prefab));
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given room item.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getRoomItemView(entity: RoomItem, field?: RoomItemField): ViewField[] {
        let fields: RoomItemField[];
        if (field) fields = [field];
        else {
            fields = [
                "prefab",
                "identifier",
                "names",
                "containingPhrases",
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
        let interactables: Interactable[];
        const fields: RoomItemField[] = ["description", "proceduralSelections"];
        let relatedEntities: PersistentGameEntity[] = [];
        relatedEntities.push(entity.prefab);
        relatedEntities.push(entity.location);
        if (entity.container) relatedEntities.push(entity.container);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        if (entity.quantity !== 0) {
            interactables = interactables.concat(await this.#interactableManager.getFindContainedItemsInteractables(entity, this.user));
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
        let fields: PuzzleField[];
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
        let interactables: Interactable[];
        const fields: PuzzleField[] = ["correctDescription", "alreadySolvedDescription", "unsolvedDescription", "incorrectDescription", "noMoreAttemptsDescription", "requirementsNotMetDescription", "commandSetsString"];
        let relatedEntities: PersistentGameEntity[] = [];
        relatedEntities.push(entity.location);
        if (entity.parentFixture) relatedEntities.push(entity.parentFixture);
        entity.requirements.forEach(requirement => relatedEntities.push(requirement));
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        interactables = interactables.concat(await this.#interactableManager.getFindContainedItemsInteractables(entity, this.user));
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
        let fields: EventField[];
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
        let interactables: Interactable[];
        const fields: EventField[] = ["triggeredNarration", "endedNarration", "commandsString"];
        let relatedEntities: PersistentGameEntity[] = [];
        entity.effects.forEach(effect => relatedEntities.push(effect));
        entity.refreshes.forEach(effect => relatedEntities.push(effect));
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given status.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getStatusView(entity: Status, field?: StatusField): ViewField[] {
        let fields: StatusField[];
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
        let interactables: Interactable[];
        const fields: StatusField[] = ["inflictedDescription", "curedDescription"];
        let relatedEntities: PersistentGameEntity[] = [];
        entity.overriders.forEach(effect => relatedEntities.push(effect));
        entity.cures.forEach(effect => relatedEntities.push(effect));
        if (entity.nextStage) relatedEntities.push(entity.nextStage);
        if (entity.duplicatedStatus) relatedEntities.push(entity.duplicatedStatus);
        if (entity.curedCondition) relatedEntities.push(entity.curedCondition);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given player.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getPlayerView(entity: Player, field?: PlayerField): ViewField[] {
        let fields: PlayerField[];
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
        let interactables: Interactable[];
        const fields: PlayerField[] = ["description"];
        let relatedEntities: PersistentGameEntity[] = [];
        if (entity.alive) {
            relatedEntities.push(entity.location);
            entity.status.forEach(status => relatedEntities.push(status));
        }
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given inventory item.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getInventoryItemView(entity: InventoryItem, field?: InventoryItemField): ViewField[] {
        let fields: InventoryItemField[];
        if (field) fields = [field];
        else {
            fields = [
                "player",
                "prefab",
                "identifier",
                "names",
                "containingPhrases",
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
        let interactables: Interactable[];
        const fields: InventoryItemField[] = ["description", "proceduralSelections"];
        let relatedEntities: PersistentGameEntity[] = [];
        relatedEntities.push(entity.player);
        if (entity.prefab) relatedEntities.push(entity.prefab);
        if (entity.container) relatedEntities.push(entity.container);
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        if (entity.quantity !== 0) {
            interactables = interactables.concat(await this.#interactableManager.getFindContainedItemsInteractables(entity, this.user));
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
        let fields: GestureField[];
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
        let interactables: Interactable[];
        const fields: GestureField[] = ["narration"];
        let relatedEntities: PersistentGameEntity[] = [];
        entity.disabledStatuses.forEach(status => relatedEntities.push(status));
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }

    /**
     * Gets an array of view fields for the given flag.
     * @param entity - The entity to view.
     * @param field - The specific field to view. Optional.
     */
    #getFlagView(entity: Flag, field?: FlagField): ViewField[] {
        let fields: FlagField[];
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
        let interactables: Interactable[];
        const fields: FlagField[] = ["commandSetsString"];
        let relatedEntities: PersistentGameEntity[] = [];
        interactables = await this.#interactableManager.getViewInteractables(entity, fields, relatedEntities, this.user);
        return interactables;
    }
}
