import { generateListString, getSortedItemsString } from "../../Modules/helpers.ts";
import Action from "../Action.ts";
import type Fixture from "../Fixture.ts";
import type InventoryItem from "../InventoryItem.ts";
import InventorySlot from "../InventorySlot.ts";
import Puzzle from "../Puzzle.ts";
import type RoomItem from "../RoomItem.ts";
import AttemptAction from "./AttemptAction.ts";
import DropAction from "./DropAction.ts";

/**
 * Represents an undress action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/undress-action.html
 */
export default class UndressAction extends Action {
	/**
	 * Performs an undress action.
     *
	 * @param container - The container to put the items in.
	 * @param inventorySlot - The inventory slot to put the items in, if applicable.
	 */
	performUndress(container: Puzzle | Fixture | RoomItem, inventorySlot: InventorySlot<RoomItem>): void {
		if (this.performed) return;
		super.perform();
		// First, drop the items in the player's hands.
		const rightHand = this.player.inventory.get("RIGHT HAND");
		const leftHand = this.player.inventory.get("LEFT HAND");
		if (rightHand && rightHand.equippedItem !== null) {
			const rightHandDropAction = new DropAction(this.getGame(), undefined, this.player, this.location, this.forced);
			rightHandDropAction.performDrop(rightHand.equippedItem, rightHand, container, inventorySlot, true);
		}
		if (leftHand && leftHand.equippedItem !== null) {
			const leftHandDropAction = new DropAction(this.getGame(), undefined, this.player, this.location, this.forced);
			leftHandDropAction.performDrop(leftHand.equippedItem, leftHand, container, inventorySlot, true);
		}
		const droppedItems: InventoryItem[] = [];
		for (const equipmentSlot of this.player.inventory.values()) {
			if (equipmentSlot.equippedItem !== null && equipmentSlot.equippedItem.prefab.equippable) {
                const droppedItem = equipmentSlot.equippedItem;
				droppedItems.push(droppedItem);
				this.player.unequip(equipmentSlot.equippedItem, equipmentSlot, rightHand);
				this.player.drop(rightHand.equippedItem, rightHand, container, inventorySlot);
                // Container is a drop puzzle.
                if (container instanceof Puzzle && container.type === "drop") {
                    const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
                    attemptAction.performAttempt(container, droppedItem, droppedItem.getIdentifier(), "drop", "");
                }
			}
		}
		this.getGame().narrationHandler.narrateUndress(this, droppedItems, container, this.player);
		this.getGame().logHandler.logUndress(droppedItems, this.player, container, inventorySlot, this.forced);
		// Execute unequipped commands.
		for (const droppedItem of droppedItems)
			droppedItem.executeUnequippedCommands();
		// Container is a weight puzzle.
		if (container instanceof Puzzle && container.type === "weight") {
			const weight = container.getContainedItemsWeight();
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, String(weight), "drop", "");
		}
		// Container is a container puzzle.
		else if (container instanceof Puzzle && container.type === "container") {
			const containerItems = container.getContainedItems().filter(item => !isNaN(item.quantity));
			const containerItemsString = getSortedItemsString(containerItems);
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, containerItemsString, "drop", "");
		}
        const slotPhrase = inventorySlot ? `${inventorySlot.id} of ` : ``;
        this.successMessage = `Successfully undressed ${this.player.name}, putting ${generateListString(droppedItems.map(item => item.getIdentifier()))} in ${slotPhrase}${container.getEntityID()}.`;
	}
}
