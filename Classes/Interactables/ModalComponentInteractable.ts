import Interactable from "./Interactable.ts";
import type { InteractableType } from "../../Modules/enums.js";
import { LabelBuilder } from "discord.js";

export default abstract class ModalComponentInteractable extends Interactable {
    /**
     * The label for the component. Max length is 45 characters.
     */
    readonly label: string;
    /**
     * The description for the component. Optional. Max length is 100 characters.
     */
    readonly description: string;
    /**
	 * The component created from this interactable.
	 */
    readonly component: LabelBuilder;

    /**
     * @param type - The type of interactive message component to create.
     * @param customId - The custom ID of the interactable.
     * @param label - The label for the component. Max length is 45 characters.
     * @param description - The description for the component. Optional. Max length is 100 characters.
     * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components. Defaults to 1 (second-highest priority).
     */
    protected constructor(type: InteractableType, customId: string, label: string, description?: string, priority: number = 1) {
        super(type, customId, priority);
        this.label = label;
        this.description = description;
        this.component = new LabelBuilder().setLabel(this.label);
        if (this.description) this.component.setDescription(this.description);
    }
}