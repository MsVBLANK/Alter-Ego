import Action from "../Action.ts";
import Description from "../Description.js";
import Fixture from "../Fixture.js";
import InventoryItem from "../InventoryItem.js";
import Room from "../Room.js";
import RoomItem from "../RoomItem.js";

/** @import Player from "../Player.js" */

/**
 * @class InspectAction
 * @classdesc Represents an inspect action.
 * @extends Action
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/inspect-action.html
 */
export default class InspectAction extends Action {
	/**
	 * Performs an inspect action.
	 * @param {Inspectable} target - The entity to inspect.
	 */
	async performInspect(target) {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateInspect(this, target, this.player);
		let description = target.description;
		// If the player is inspecting an inventory item that belongs to another player, remove the contents of all il tags before parsing it.
		if (target instanceof InventoryItem && target.player.name !== this.player.name)
			description = new Description(description.text.replace(/(<(il)(\s[^>]+?)*>)[\s\S]+?(<\/\2>)/g, "$1$4"), target, this.getGame());

		description.parseAndSendTo(this.player);
		this.getGame().logHandler.logInspect(target, this.player, this.forced);
	}

	/**
	 * Finds the required room item to call performInspect.
	 * @param {string[]} args - The args as strings.
	 * @returns {[string, Inspectable]}
	 */
	parseInteractionArgs(args) {
		/** @type {Inspectable} */
		let target;
		switch (args[0]) {
			case 'F':
				target = this.getGame().entityFinder.getFixture(args[1], args[2]);
				break;
			case 'II':
				target = this.getGame().entityFinder.getInventoryItem(args[1], args[2], args[3], args[4]);
				break;
			case 'P':
				target = this.getGame().entityFinder.getLivingPlayer(args[1]);
				break;
			case 'R':
				target = this.getGame().entityFinder.getRoom(args[1]);
				break;
			case 'RI':
				target = this.getGame().entityFinder.getRoomItem(args[1], args[2], args[3], args[4]);
				break;
		}
		return [args[0], target];
	}

	/**
	 * Validates the parsed args. The results can be passed directly into performInspect.
	 * @param {[string, Inspectable]} args - The args after being parsed.
	 * @returns {[Inspectable]|[]}
	 */
	validateInteractionArgs(args) {
		if (args.length !== 2) return [];
		if (this.player.hasBehaviorAttribute("disable inspect")) return [];
		if (this.player.hasBehaviorAttribute("disable all") && !this.player.hasBehaviorAttribute("enable inspect")) return [];
		if (!args[1]) return [];
		if (!args[1].getLocation()) return [];
		if (args[1].getLocation().id !== this.player.location.id) return [];
		if (args[0] === 'F' && args[1] instanceof Fixture && !args[1]?.accessible) return [];
		if (args[0] === 'RI' && args[1] instanceof RoomItem && (!args[1]?.accessible || args[1].quantity === 0)) return [];
		return [args[1]];
	}
}