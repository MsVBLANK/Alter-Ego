import { getSortedItemsString } from "../../Modules/helpers.ts";
import Action from "../Action.ts";
import type EquipmentSlot from "../EquipmentSlot.ts";
import Fixture from "../Fixture.ts";
import InventorySlot from "../InventorySlot.ts";
import Puzzle from "../Puzzle.ts";
import RoomItem from "../RoomItem.ts";
import AttemptAction from "./AttemptAction.ts";

/**
 * Represents a take action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/take-action.html
 */
export default class TakeAction extends Action {
	/**
	 * Performs a take action.
     *
	 * @param item - The room item to take.
	 * @param handEquipmentSlot - The hand equipment slot to put the item in.
     * @param container - The item's current container.
     * @param inventorySlot - The {@link InventorySlot|inventory slot} the item is currently in.
     * @param notify - Whether or not to notify the player that they took the item. Defaults to true.
	 */
	performTake(item: RoomItem, handEquipmentSlot: EquipmentSlot, container: RoomItemContainer,
        inventorySlot: InventorySlot<RoomItem>, notify: boolean = true): void {
		if (this.performed) return;
		super.perform();
		const successful = this.forced || this.player.carryWeight + item.weight <= this.player.maxCarryWeight;
		this.getGame().narrationHandler.narrateTake(this, item, this.player, notify);
		this.getGame().logHandler.logTake(item, this.player, container, inventorySlot, successful, this.forced);
		if (!successful) return;
		this.player.take(item, handEquipmentSlot, container, inventorySlot);
		// Container is a weight puzzle.
		if (container instanceof Puzzle && container.type === "weight") {
			const weight = container.getContainedItemsWeight();
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, String(weight), "take", "");
		}
		// Container is a container puzzle.
		else if (container instanceof Puzzle && container.type === "container") {
			const containerItems = container.getContainedItems().filter(item => !isNaN(item.quantity));
			const containerItemsString = getSortedItemsString(containerItems);
			const attemptAction = new AttemptAction(this.getGame(), undefined, this.player, this.location, this.forced);
			attemptAction.performAttempt(container, undefined, containerItemsString, "take", "");
		}
	}

	/**
	 * Finds the required room item to call performTake.
     *
	 * @param args - The args as strings.
	 */
	parseInteractionArgs(args: string[]): [RoomItem] {
		const item = this.getGame().entityFinder.getRoomItem(args[0], args[1], args[2], args[3]);
		return [item];
	}

	/**
	 * Validates the parsed args. The results can be passed directly into performTake.
     *
	 * @param args - The args after being parsed.
	 */
	validateInteractionArgs(args: [RoomItem]): [RoomItem, EquipmentSlot, Puzzle | Fixture | RoomItem, InventorySlot<RoomItem>] | [] {
		if (args.length !== 1) return [];
		if (!args[0] || !(args[0] instanceof RoomItem)) return [];
		const item = args[0];
		if (this.player.hasBehaviorAttribute("disable take")) return [];
		if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable take")) return [];
		if (item.getLocation().id !== this.player.location.id) return [];
		if (!item.accessible || item.quantity === 0) return [];
		const freeHand = this.getGame().entityFinder.getPlayerFreeHand(this.player);
		if (!freeHand) return [];
		const container = item.container;
		if (!container) return [];
		const topContainer = item.getTopContainer();
		if (topContainer !== null) {
			if (topContainer instanceof Fixture && topContainer.isProcessingItems()) return [];
			if (topContainer instanceof Puzzle && (topContainer.parentFixture === null || this.player.isHidden() && topContainer.name !== this.player.hidingSpot)) return [];
		}
		const inventorySlot = container instanceof RoomItem ? container.inventory.get(item.slot) : undefined;
		return [item, freeHand, container, inventorySlot];
	}
}
