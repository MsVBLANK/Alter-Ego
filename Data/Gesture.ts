import Description from "./Description.ts"
import GameEntity from "./GameEntity.ts"
import type Status from "./Status.js"
import type Game from "./Game.ts"

/**
 * Represents a form of body language that a player can use to communicate non-verbally.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/gesture.html
 */
export default class Gesture extends GameEntity {
    /**
     * The unique ID of the gesture.
     */
    readonly id: string;
    /**
     * The name of the gesture. Deprecated. Use `id` instead.
     * @deprecated
     */
    readonly name: string;
    /**
     * Data types the gesture can take as a target.
     */
    readonly requires: string[];
    /**
     * The string representation of status effects that prevent the gesture from being used.
     */
    readonly disabledStatusesStrings: string[];
    /**
     * Status effects that prevent the gesture from being used.
     */
    disabledStatuses: Status[];
    /**
     * The description of the gesture shown in the list of gestures.
     */
    readonly description: string;
    /**
     * Narration that will be parsed and sent to the player's room when the gesture is performed.
     */
    readonly narration: Description;
    /**
     * A string indicating the data type of the gesture's target.
     * This allows the gesture’s narration to contain conditional formatting based on the data type of the target.
     */
    targetType: string;
    /**
     * The game entity the player chose to target.
     */
    target: GestureTarget | null;

    /**
     * @param id - The unique ID of the gesture.
     * @param requires - Data types the gesture can take as a target.
     * @param disabledStatusesStrings - The string representation of status effects that prevent the gesture from being used.
     * @param description - The description of the gesture shown in the list of gestures.
     * @param narration - Narration that will be parsed and sent to the player's room when the gesture is performed.
     * @param row - The row number of the gesture on the sheet.
     * @param game - The game this belongs to.
     */
    constructor(id: string, requires: string[], disabledStatusesStrings: string[], description: string,
        narration: string, row: number, game: Game) {
        super(game, row);
        this.id = id;
        this.name = id;
        this.requires = requires;
        this.disabledStatusesStrings = disabledStatusesStrings;
        this.disabledStatuses = new Array(this.disabledStatusesStrings.length);
        this.description = description;
        this.narration = new Description(narration, this, game);

        this.targetType = "";
        this.target = null;
    }

    /**
     * Generate an ID in all lowercase.
     */
    static generateValidId(id: string): string {
        return id?.toLowerCase().trim();
    }
}
