import Action from "../Action.ts";
import Description from "../Description.ts";
import Fixture from "../Fixture.ts";
import InventoryItem from "../InventoryItem.ts";
import RoomItem from "../RoomItem.ts";

/**
 * Represents an inspect action.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/actions/inspect-action.html
 */
export default class InspectAction extends Action {
	/**
	 * Performs an inspect action.
     *
	 * @param target - The entity to inspect.
	 */
	async performInspect(target: Inspectable): Promise<void> {
		if (this.performed) return;
		super.perform();
		this.getGame().narrationHandler.narrateInspect(this, target, this.player);
		let description = target.description;
		// If the player is inspecting an inventory item that belongs to another player, remove the contents of all il tags before parsing it.
		if (target instanceof InventoryItem && target.player.name !== this.player.name)
			description = new Description(description.text.replace(/(<(il)(\s[^>]+?)*>)[\s\S]+?(<\/\2>)/g, "$1$4"), target, this.getGame());

		description.parseAndSendTo(this.player);
		this.getGame().logHandler.logInspect(target, this.player, this.forced);
        if (target instanceof RoomItem || target instanceof InventoryItem && target.container) {
            const slotPhrase = target.container instanceof RoomItem || target.container instanceof InventoryItem ? `${target.slot} of ` : ``;
            const ownerPhrase = target instanceof InventoryItem ? `${target.player.name}'s ` : ``;
            this.successMessage = `Successfully inspected ${ownerPhrase}${target.getEntityID()} ${target.container.getPreposition()} ${slotPhrase}${target.getContainer().getEntityID()} for ${this.player.name}.`;
        }
        else if (target instanceof InventoryItem)
            this.successMessage = `Successfully inspected ${target.player.name}'s ${target.getIdentifier()} for ${this.player.name}.`
        else
            this.successMessage = `Successfully inspected ${target.getEntityID()} for ${this.player.name}.`;
	}

	/**
	 * Finds the required room item to call performInspect.
     *
	 * @param args - The args as strings.
	 */
	parseInteractionArgs(args: string[]): [string, Inspectable] {
		let target: Inspectable;
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
     *
	 * @param args - The args after being parsed.
	 */
	validateInteractionArgs(args: [string, Inspectable]): [Inspectable] | [] {
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
