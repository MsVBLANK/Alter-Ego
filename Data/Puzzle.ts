import { parseAndExecuteBotCommands } from "../Modules/commandHandler.ts";
import Description from "./Description.ts";
import Event from "./Event.ts";
import type Fixture from "./Fixture.ts";
import Flag from "./Flag.ts";
import type Game from "./Game.ts";
import ItemContainer from "./ItemContainer.ts";
import type ItemInstance from "./ItemInstance.ts";
import type Player from "./Player.ts";
import Prefab from "./Prefab.ts";
import type Room from "./Room.ts";
import type RoomItem from "./RoomItem.ts";

/**
 * Represents an interactable entity with correct, incorrect, and limited ways to engage with it.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/puzzle.html
 */
export default class Puzzle extends ItemContainer {
    /**
     * The name of the puzzle.
     */
    readonly name: string;
    /**
     * Whether the puzzle is solved.
     */
    solved: boolean;
    /**
     * String indicating which solution the puzzle has been solved with.
     */
    outcome: string;
    /**
     * Whether the puzzle requires a moderator to solve it.
     */
    readonly requiresMod: boolean;
    /**
     * The display name of the location the puzzle is found in.
     */
    readonly locationDisplayName: string;
    /**
     * The location the puzzle is found in.
     */
    location: Room;
    /**
     * The name of the object associated with the puzzle.
     *
     * @deprecated Use parentFixtureName instead.
     */
    readonly parentObjectName: string;
    /**
     * The name of the fixture associated with the puzzle.
     */
    readonly parentFixtureName: string;
    /**
     * The puzzle's parent object. If there isn't one, this is `null`.
     *
     * @deprecated Use parentFixture instead.
     */
    readonly parentObject: Fixture | null;
    /**
     * The puzzle's parent fixture. If there isn't one, this is `null`.
     */
    parentFixture: Fixture | null;
    /**
     * The type of puzzle.
     *
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/puzzle.html#type
     */
    readonly type: string;
    /**
     * Whether the puzzle can be interacted with.
     */
    accessible: boolean;
    /**
     * Puzzle names, event IDs, prefab IDs or flag IDs that are required for the puzzle to be made accessible.
     */
    readonly requirementsStrings: PuzzleRequirement[];
    /**
     * An array of game entities required for the puzzle to be solved when attempted.
     */
    requirements: Array<Puzzle | Event | Prefab | Flag>;
    /**
     * The solutions to the puzzle.
     */
    readonly solutions: string[];
    /**
     * The number of attempts the player has left to solve the puzzle.
     */
    remainingAttempts: number;
    /**
     * The string representation of the bot commands to be executed when the puzzle is solved or unsolved with specified outcomes.
     */
    readonly commandSetsString: string;
    /**
     * Sets of commands to be executed when the puzzle is solved or unsolved with specified outcomes.
     */
    readonly commandSets: PuzzleCommandSet[];
    /**
     * The description of the puzzle when it is solved by a player.
     */
    readonly correctDescription: Description;
    /**
     * The description of the puzzle when it is already solved. Can contain an item list.
     */
    readonly alreadySolvedDescription: Description;
    /**
     * The description of the puzzle when it is unsolved.
     */
    readonly unsolvedDescription: Description;
    /**
     * The description of the puzzle when the incorrect answer is given.
     */
    readonly incorrectDescription: Description;
    /**
     * The description of the puzzle when the player attempts to solve it when the number of remainingAttempts is 0.
     */
    readonly noMoreAttemptsDescription: Description;
    /**
     * The description of the puzzle when a player attempts to solve it while all of the requirements are not met.
     */
    readonly requirementsNotMetDescription: Description;

    /**
     * @param name - The name of the puzzle.
     * @param solved - Whether the puzzle is solved.
     * @param outcome - String indicating which solution the puzzle has been solved with.
     * @param requiresMod - Whether the puzzle requires a moderator to solve it.
     * @param locationDisplayName - The display name of the location the puzzle is found in.
     * @param parentFixtureName - The name of the fixture associated with the puzzle.
     * @param type - The type of puzzle. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/puzzle.html#type}
     * @param accessible - Whether the puzzle can be interacted with.
     * @param requirementsStrings - Puzzle names, event IDs, prefab IDs or flag IDs that are required for the puzzle to be made accessible.
     * @param solutions - The solutions to the puzzle.
     * @param remainingAttempts - The number of attempts the player has left to solve the puzzle.
     * @param commandSetsString - The string representation of the bot commands to be executed when the puzzle is solved or unsolved with specified outcomes.
     * @param commandSets - Sets of commands to be executed when the puzzle is solved or unsolved with specified outcomes.
     * @param correctDescription - The description of the puzzle when it is solved by a player.
     * @param alreadySolvedDescription - The description of the puzzle when it is already solved. Can contain an item list.
     * @param unsolvedDescription - The description of the puzzle when it is unsolved.
     * @param incorrectDescription - The description of the puzzle when the incorrect answer is given.
     * @param noMoreAttemptsDescription - The description of the puzzle when the player attempts to solve it when the number of remainingAttempts is 0.
     * @param requirementsNotMetDescription - The description of the puzzle when a player attempts to solve it while all of the requirements are not met.
     * @param row - The row number of the puzzle in the sheet.
     * @param game - The game this belongs to.
     */
    constructor(name: string, solved: boolean, outcome: string, requiresMod: boolean, locationDisplayName: string,
        parentFixtureName: string, type: string, accessible: boolean, requirementsStrings: PuzzleRequirement[],
        solutions: string[], remainingAttempts: number, commandSetsString: string, commandSets: PuzzleCommandSet[],
        correctDescription: string, alreadySolvedDescription: string, unsolvedDescription: string,
        incorrectDescription: string, noMoreAttemptsDescription: string, requirementsNotMetDescription: string,
        row: number, game: Game) {
        super(game, row, alreadySolvedDescription);
        this.name = name;
        this.solved = solved;
        this.outcome = outcome;
        this.requiresMod = requiresMod;
        this.locationDisplayName = locationDisplayName;
        this.location = null;
        this.parentFixtureName = parentFixtureName;
        this.parentObjectName = parentFixtureName;
        this.parentFixture = null;
        this.parentObject = null;
        this.type = type;
        this.accessible = accessible;
        this.requirementsStrings = requirementsStrings;
        this.requirements = new Array(this.requirementsStrings.length);
        this.solutions = solutions;
        this.remainingAttempts = remainingAttempts;
        this.commandSetsString = commandSetsString;
        this.commandSets = commandSets;
        this.correctDescription = new Description(correctDescription, this, game);
        this.alreadySolvedDescription = new Description(alreadySolvedDescription, this, game);
        this.unsolvedDescription = new Description(unsolvedDescription, this, game);
        this.incorrectDescription = new Description(incorrectDescription, this, game);
        this.noMoreAttemptsDescription = new Description(noMoreAttemptsDescription, this, game);
        this.requirementsNotMetDescription = new Description(requirementsNotMetDescription, this, game);
    }

    /** Gets the entity's location. */
    getLocation(): Room {
        return this.location;
    }

    /**
     * Sets the location.
     */
    setLocation(room: Room): void {
        this.location = room;
    }

    /**
     * Sets the parent fixture.
     */
    setParentFixture(fixture: Fixture): void {
        this.parentFixture = fixture;
    }

    /**
     * Sets the puzzle as accessible.
     */
    setAccessible(): void {
        this.accessible = true;
    }

    /**
     * Sets the puzzle as inaccessible.
     */
    setInaccessible(): void {
        this.accessible = false;
    }

    /**
     * Returns true if the puzzle is capable of containing items.
     */
    isItemContainer(): boolean {
        return this.parentFixture !== null && this.parentFixture.isItemContainer();
    }

    /**
     * Returns true if the puzzle is currently capable of being taken from/dropped into.
     */
    canCurrentlyContainItems(): boolean {
        return this.type === "weight" || this.type === "container" || this.accessible && this.solved;
    }

    /**
     * Gets all of the items this entity contains.
     */
    override getContainedItems(): RoomItem[] {
        return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, undefined, 'Puzzle', this.name);
    }

    /**
	 * Gets all of the items that should appear in the puzzle's item list.
     *
	 * @param itemListName - The name of the item list. Unused.
	 * @param player - The player the description is being sent to. Unused.
	 */
	override getContainedItemsForItemList(itemListName?: string, player?: Player): RoomItem[] {
		return this.getGame().entityFinder.getRoomItems(undefined, this.location.id, undefined, 'Puzzle', this.name);
	}

    /**
     * Sets the puzzle as solved.
     */
    solve(): void {
        // Mark it as solved.
        this.solved = true;
    }

    /**
     * Sets the puzzle's outcome.
     *
     * @param outcome - The solution the puzzle was solved with.
     */
    setOutcome(outcome: string): void {
        if (this.solutions.length > 1) {
            if (outcome)
                this.outcome = outcome;
            else this.outcome = this.solutions[0];
        }
    }

    /**
     * Decrements the uses of the required items that were used to solve the puzzle.
     *
     * @param player - The player who solved the puzzle.
     * @param requiredItems - The actual item instances that were required for this puzzle to be solved.
     */
    decrementRequiredItemUses(player: Player, requiredItems: ItemInstance[] = []): void {
        for (const requiredItem of requiredItems) {
            if (!isNaN(requiredItem.uses))
                requiredItem.decreaseUses(player);
        }
    }

    /**
     * Executes the puzzle's solved commands.
     *
     * @param targetPlayer - The player who will be treated as the initiating player in subsequent bot command executions called by this puzzle's solved commands, if applicable.
     */
    executeSolvedCommands(targetPlayer: Player = null): void {
        // Find commandSet.
        let commandSet: string[] = [];
        if (this.solutions.length > 1) {
            for (let i = 0; i < this.commandSets.length; i++) {
                let foundCommandSet = false;
                for (let j = 0; j < this.commandSets[i].outcomes.length; j++) {
                    if (this.commandSets[i].outcomes[j] === this.outcome) {
                        commandSet = this.commandSets[i].solvedCommands;
                        foundCommandSet = true;
                        break;
                    }
                }
                if (foundCommandSet) break;
            }
        }
        else commandSet = this.commandSets[0].solvedCommands;
        // Execute the command set's solved commands.
        parseAndExecuteBotCommands(commandSet, this.getGame(), this, targetPlayer);
    }

    /**
     * Sets the puzzle as unsolved.
     */
    unsolve(): void {
        this.solved = false;
    }

    /**
     * Clears the puzzle's outcome.
     */
    clearOutcome(): void {
        if (this.solutions.length > 1 && this.type !== "channels")
            this.outcome = "";
    }

    /**
     * Executes the puzzle's unsolved commands.
     *
     * @param targetPlayer - The player who will be treated as the initiating player in subsequent bot command executions called by this puzzle's unsolved commands, if applicable.
     */
    executeUnsolvedCommands(targetPlayer: Player = null): void {
        // Find commandSet.
        let commandSet: string[] = [];
        if (this.solutions.length > 1) {
            for (let i = 0; i < this.commandSets.length; i++) {
                let foundCommandSet = false;
                for (let j = 0; j < this.commandSets[i].outcomes.length; j++) {
                    if (this.commandSets[i].outcomes[j] === this.outcome) {
                        commandSet = this.commandSets[i].unsolvedCommands;
                        foundCommandSet = true;
                        break;
                    }
                }
                if (foundCommandSet) break;
            }
        }
        else commandSet = this.commandSets[0].unsolvedCommands;
        // Execute the command set's unsolved commands.
        parseAndExecuteBotCommands(commandSet, this.getGame(), this, targetPlayer);
    }

    /**
     * A player fails to solve the puzzle. Decrements the number of remaining attempts, if applicable.
     */
    fail(): void {
        if (!isNaN(this.remainingAttempts))
            this.remainingAttempts--;
    }

    /**
     * Gets the alreadySolvedDescription.
     */
    override getDescription(): Description {
        return this.alreadySolvedDescription;
    }

    /**
     * Gets the name of the parent fixture preceded by "the". If no parent fixture exists, returns the puzzle's name preceded by "the" instead.
     */
    getContainingPhrase(): string {
        return this.parentFixture ? this.parentFixture.getContainingPhrase() : `the ${this.name}`;
    }

    /**
     * Checks if all of the puzzle's requirements are met.
     *
     * @param player - The player attempting the puzzle.
     * @param item - An item the player supplied in their attempt to solve the puzzle.
     * @param requiredItems - An array of required items in the player's inventory. The array will be populated during execution.
     * @returns Whether or not the puzzle's requirements have all been met.
     */
    checkRequirementsMet(player: Player, item: ItemInstance, requiredItems: ItemInstance[]): boolean {
        for (const requirement of this.requirements) {
            if (requirement instanceof Puzzle && !requirement.solved || requirement instanceof Event && !requirement.ongoing)
                return false;
            else if (requirement instanceof Flag) {
                if (requirement.valueScript !== "") {
                    const value = requirement.evaluate(requirement.valueScript, player);
                    requirement.setValue(value, true, player);
                }
                if (requirement.value !== true) return false;
            }
            else if (requirement instanceof Prefab) {
                if (item && item.prefab.id !== requirement.id) return false;
                else if (!item) {
                    const requiredItem = player ? player.findItem(requirement.id) : undefined;
                    if (!requiredItem) return false;
                    else if (!requiredItems.includes(requiredItem))
                        requiredItems.push(requiredItem);
                }
            }
        }
        return true;
    }

    /**
     * Returns the solution that is satisfied by a list of items contained in the puzzle.
     * If the list doesn't satisfy any solutions, returns undefined.
     *
     * @param containedItemsListString - A comma-separated list of items contained inside of the puzzle.
     */
    getSolutionSatisfiedByContainedItems(containedItemsListString: string): string {
        const containedItems = containedItemsListString.split(',');
        const itemsMatch = function (solution: string): boolean {
            let requiredItems = solution.split('+');
            if (requiredItems.length !== containedItems.length) return false;
            for (let i = 0; i < requiredItems.length; i++)
                requiredItems[i] = requiredItems[i].substring(requiredItems[i].indexOf(':') + 1).trim();
            requiredItems.sort(function (a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
            for (let i = 0; i < containedItems.length; i++)
                if (containedItems[i] !== requiredItems[i]) return false;
            return true;
        };
        for (const solution of this.solutions) {
            if (itemsMatch(solution)) return solution;
        }
        return undefined;
    }

    /**
     * Returns the solution that is satisfied by the given item. If the item doesn't satisfy any solutions, returns undefined.
     *
     * @param item - The item being used to attempt the puzzle.
     */
    getSolutionSatisfiedByItem(item: ItemInstance): string {
        for (const solution of this.solutions) {
            if ((solution.startsWith("Item:") || solution.startsWith("InventoryItem:") || solution.startsWith("Prefab:"))
            && item.prefab.id === solution.substring(solution.indexOf(':') + 1).trim()) {
                return solution;
            }
        }
        return undefined;
    }

    /**
     * Gets the preposition of the parent fixture, if applicable. If no parent fixture exists, returns "in".
     */
    getPreposition(): string {
        return this.parentFixture ? this.parentFixture.getPreposition() : "in";
    }

    correctCell(): string {
        return this.getGame().constants.puzzleSheetCorrectColumn + this.row;
    }

    alreadySolvedCell(): string {
        return this.getGame().constants.puzzleSheetAlreadySolvedColumn + this.row;
    }

    unsolvedCell(): string {
        return this.getGame().constants.puzzleSheetUnsolvedColumn + this.row;
    }

    incorrectCell(): string {
        return this.getGame().constants.puzzleSheetIncorrectColumn + this.row;
    }

    noMoreAttemptsCell(): string {
        return this.getGame().constants.puzzleSheetNoMoreAttemptsColumn + this.row;
    }

    requirementsNotMetCell(): string {
        return this.getGame().constants.puzzleSheetRequirementsNotMetColumn + this.row;
    }

    getContainerIdentifier(): string {
        return this.name;
    }

    getContainerType(): string {
        return "Puzzle";
    }
}
