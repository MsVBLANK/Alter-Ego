import PaginationInteractable from "./PaginationInteractable.ts";
import { ButtonStyle } from "discord.js";

/**
 * Represents a button message component to advance to the next page of a menu.
 */
export default class PageNextInteractable extends PaginationInteractable {
    /**
     * @param customId - The custom ID of the interactable.
     * @param callback - The callback function to execute when this button is pressed.
     * @param label - The label of the component.
     * @param emoji - The emoji to apply to the button, if applicable. Defaults to ⏩.
     * @param style - The style to apply to the button, if applicable. Defaults to Secondary.
     * @param priority - The priority level of the interactable. This determines how high up it will appear in a list of interactable components. Defaults to 0 (highest priority).
     * @param respondWithModal - Whether to respond to an interaction with a modal. Defaults to false.
     */
    constructor(customId: string, callback: (interaction: BotInteraction) => void, label: string = "Next", emoji = '⏩', style = ButtonStyle.Secondary, priority = 0, respondWithModal = false) {
        super(customId, callback, label, style, emoji, priority, respondWithModal);
    }
}
