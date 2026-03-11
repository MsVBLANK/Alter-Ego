import type { Duration } from "luxon";
import type Timer from "../Classes/Timer.ts";
import Description from "./Description.ts";
import type Game from "./Game.ts";
import GameEntity from "./GameEntity.ts";

/**
 * Also referred to as a StatusEffect. Represents a condition that can be applied to a player.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/status.html
 */
export default class Status extends GameEntity {
    /**
     * The unique ID of the status.
     */
    readonly id: string;
    /**
     * The name of the status.
     *
     * @deprecated Use `id` instead.
     */
    readonly name: string;
    /**
     * The duration representing how long it takes for the status to expire after it is inflicted. Accepted units: s, m, h, d, w, M, y. If there is none, this is `null`.
     */
    readonly duration: Duration<true>;
    /**
     * The amount of time remaining until the status expires. If the status has no duration, this is `null`.
     */
    remaining: Duration<true>;
    /**
     * Whether the status kills an inflicted player when it expires. If the status has a nextStage, this is never checked.
     */
    readonly fatal: boolean;
    /**
     * Whether the status is visible to the player.
     */
    readonly visible: boolean;
    /**
     * The IDs of statuses that prevent this status from being inflicted.
     */
    readonly overridersStrings: string[];
    /**
     * Statuses that prevent this status from being inflicted.
     */
    readonly overriders: Status[];
    /**
     * The IDs of statuses that cure this status when they are inflicted.
     */
    readonly curesStrings: string[];
    /**
     * Statuses that cure this status when they are inflicted.
     */
    cures: Status[];
    /**
     * The ID of the status that will be inflicted on the player when this one expires.
     */
    readonly nextStageId: string;
    /**
     * The status that will be inflicted on the player when this one expires.
     */
    nextStage: Status;
    /**
     * The ID of the status that this Status will turn into if it is inflicted on a player who already has it.
     */
    readonly duplicatedStatusId: string;
    /**
     * The status that this Status will turn into if it is inflicted on a player who already has it.
     */
    duplicatedStatus: Status;
    /**
     * The ID of the status that will be inflicted on the player if this one is cured.
     */
    readonly curedConditionId: string;
    /**
     * The status that will be inflicted on the player if this one is cured.
     */
    curedCondition: Status;
    /**
     * Stat modifiers to apply to the player.
     *
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/status.html#stat-modifiers
     */
    readonly statModifiers: StatModifier[];
    /**
     * The behavior attributes this status applies to the player.
     *
     * @deprecated Use behaviorAttributes instead.
     */
    readonly attributes: string[];
    /**
     * The behavior attributes this status applies to the player.
     *
     * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/status.html#behavior-attributes
     */
    readonly behaviorAttributes: Set<string>;
    /**
     * The description of the status when a player is inflicted with it.
     */
    readonly inflictedDescription: Description;
    /**
     * The description of the status when a player is cured of it.
     */
    readonly curedDescription: Description;
    /**
     * A timer counting down every second until the status expires.
     */
    timer: Timer;

    /**
     * @param id - The unique ID of the status.
     * @param duration - The duration representing how long it takes for the status to expire after it is inflicted. Accepted units: s, m, h, d, w, M, y.
     * @param fatal - Whether the status kills an inflicted player when it expires. If the status has a nextStage, this is never checked.
     * @param visible - Whether the status is visible to the player.
     * @param overridersStrings - The IDs of statuses that prevent this status from being inflicted.
     * @param curesStrings - The IDs of statuses that cure this status when they are inflicted.
     * @param nextStageId - The ID of the status that will be inflicted on the player when this one expires.
     * @param duplicatedStatusId - The ID of the status that this Status will turn into if it is inflicted on a player who already has it.
     * @param curedConditionId - The ID of the status that will be inflicted on the player if this one is cured.
     * @param statModifiers - Stat modifiers to apply to the player. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/status.html#stat-modifiers}
     * @param behaviorAttributes - The behavior attributes this status applies to the player. {@link https://molsnoo.github.io/Alter-Ego/reference/data_structures/status.html#behavior-attributes}
     * @param inflictedDescription - The description of the status when a player is inflicted with it.
     * @param curedDescription - The description of the status when a player is cured of it.
     * @param row - The row number of the status in the sheet.
     * @param game - The game this belongs to.
     */
    constructor(id: string, duration: Duration, fatal: boolean, visible: boolean,
        overridersStrings: string[], curesStrings: string[], nextStageId: string, duplicatedStatusId: string,
        curedConditionId: string, statModifiers: StatModifier[], behaviorAttributes: Set<string>,
        inflictedDescription: string, curedDescription: string, row: number, game: Game) {
        super(game, row);
        this.id = id;
        this.name = id;
        this.duration = duration;
        this.remaining = null;
        this.fatal = fatal;
        this.visible = visible;
        this.overridersStrings = overridersStrings;
        this.overriders = new Array(this.overridersStrings.length);
        this.curesStrings = curesStrings;
        this.cures = new Array(this.curesStrings.length);
        this.nextStageId = nextStageId;
        this.nextStage = null;
        this.duplicatedStatusId = duplicatedStatusId;
        this.duplicatedStatus = null;
        this.curedConditionId = curedConditionId;
        this.curedCondition = null;
        this.statModifiers = statModifiers;
        this.behaviorAttributes = behaviorAttributes;
        this.attributes = Array.from(behaviorAttributes);
        this.inflictedDescription = new Description(inflictedDescription, this, game);
        this.curedDescription = new Description(curedDescription, this, game);

        this.timer = null;
    }

    /**
     * Sets the next stage.
     */
    setNextStage(nextStage: Status): void {
        this.nextStage = nextStage;
    }

    /**
     * Sets the duplicated status.
     */
    setDuplicatedStatus(duplicatedStatus: Status): void {
        this.duplicatedStatus = duplicatedStatus;
    }

    /**
     * Sets the cured condition.
     */
    setCuredCondition(curedCondition: Status): void {
        this.curedCondition = curedCondition;
    }

    inflictedCell(): string {
        return this.getGame().constants.statusSheetInflictedColumn + this.row;
    }

    curedCell(): string {
        return this.getGame().constants.statusSheetCuredColumn + this.row;
    }

    /**
     * Generate an ID in all lowercase.
     */
    static generateValidId(id: string): string {
        return id?.toLowerCase().trim();
    }

    /**
     * Perform post-initialization processing on a status effect.
     */
    static postProcess(status: Status): void {
        status.overridersStrings.forEach((overriderString, i) => {
            const overrider = status.getGame().entityFinder.getStatusEffect(overriderString);
            if (overrider) status.overriders[i] = overrider;
        });
        status.curesStrings.forEach((curesString, i) => {
            const cure = status.getGame().entityFinder.getStatusEffect(curesString);
            if (cure) status.cures[i] = cure;
        });
        const nextStage = status.getGame().entityFinder.getStatusEffect(status.nextStageId);
        if (nextStage) status.setNextStage(nextStage);
        const duplicatedStatus = status.getGame().entityFinder.getStatusEffect(status.duplicatedStatusId);
        if (duplicatedStatus) status.setDuplicatedStatus(duplicatedStatus);
        const curedCondition = status.getGame().entityFinder.getStatusEffect(status.curedConditionId);
        if (curedCondition) status.setCuredCondition(curedCondition);
    }
}
