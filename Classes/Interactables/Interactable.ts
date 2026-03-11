import type { ComponentBuilder, ModalBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import type { InteractableType } from "../../Modules/enums.js";

/**
 * @class Interactable
 * @classdesc Represents an interactive message component.
 */
export default abstract class Interactable {
	/**
	 * The type of interactive message component to create.
     */
    readonly type: InteractableType;
	/**
	 * The customId of the component.
	 */
    readonly customId: string;
	/**
	 * The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
	 */
    readonly priority: number;
    /**
     * Whether to respond to an interaction with a modal.
     * A reply to an interaction cannot be deferred if a modal is to be sent, so this will be checked by the interaction handler.
     */
    readonly respondWithModal: boolean;
    /**
     * The modal component created from this interactable.
     */
    abstract readonly component: ComponentBuilder|StringSelectMenuOptionBuilder|ModalBuilder;

	/**
	 * @constructor
	 * @param type - The type of interactive message component to create.
	 * @param customId - The custom ID for this interactable.
	 * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components.
     * @param respondWithModal - Whether to respond to an interaction with a modal. Defaults to false.
	 */
    protected constructor(type: InteractableType, customId: string, priority: number, respondWithModal = false) {
		this.type = type;
		this.customId = customId;
		this.priority = priority;
        this.respondWithModal = respondWithModal;
	}

	/**
	 * Sets the interactable as disabled.
	 */
	abstract disable(): void;
}
