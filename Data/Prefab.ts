import { Collection } from "discord.js";
import Description from "./Description.ts";
import type Game from "./Game.ts";
import GameEntity from "./GameEntity.ts";
import type InventorySlot from "./InventorySlot.ts";
import type ItemInstance from "./ItemInstance.ts";
import type Status from "./Status.ts";

export type PrefabField = "id"|"names"|"containingPhrases"|"discreet"|"size"|"weight"|"usable"|"useVerb"|"uses"|"inflicts"|"cures"|"nextStage"|"equippable"|"equipmentSlots"|"coveredEquipmentSlots"|"commandsString"|"inventorySlots"|"preposition"|"description";

/**
 * Represents the concept of an item.
 *
 * @see https://molsnoo.github.io/Alter-Ego/reference/data_structures/prefab.html
 */
export default class Prefab extends GameEntity implements PersistentGameEntity {
    /**
     * The unique identifier of the prefab.
     */
    readonly id: string;
    /**
     * The name of the prefab.
     */
    readonly name: string;
    /**
     * The plural name of the prefab.
     */
    readonly pluralName: string;
    /**
     * The phrase that will be inserted in/removed from item tags when an instance of this prefab is added to/removed from an item list.
     */
    readonly singleContainingPhrase: string;
    /**
     * The phrase that will be used in an item list when it contains multiple instances of prefabs with the same single containing phrase.
     */
    readonly pluralContainingPhrase: string;
    /**
     * Whether interactions with instances of this prefab are narrated or not.
     */
    readonly discreet: boolean;
    /**
     * How large the prefab is. Does not correspond with any particular unit of measurement.
     */
    readonly size: number;
    /**
     * How much the prefab weighs in kilograms.
     */
    readonly weight: number;
    /**
     * Whether the instances of the prefab can be used by a player to inflict or cure one or more status effects.
     */
    readonly usable: boolean;
    /**
     * The verb that will be used when a player uses an inventory item instance of this prefab.
     *
     * @deprecated Use `thirdPersonVerb` or `secondPersonVerb` instead.
     */
    readonly verb: string;
    /**
     * The verb that will be used in narrations when a player uses an inventory item instance of this prefab.
     */
    readonly thirdPersonVerb: string;
    /**
     * The verb that will be used in second person notifications when a player uses an inventory item instance of this prefab.
     */
    readonly secondPersonVerb: string;
    /**
     * The number of uses the prefab has.
     */
    readonly uses: number;
    /**
     * A list of status effects that will be inflicted on the player when they use an inventory item instance of this prefab.
     */
    readonly effectsStrings: string[];
    /**
     * Status effects will be inflicted on the player when they use an inventory item instance of this prefab.
     */
    effects: Status[];
    /**
     * A list of status effects that the player will be cured of when they use an inventory item instance of this prefab.
     */
    readonly curesStrings: string[];
    /**
     * Status effects that the player will be cured of when they use an inventory item instance of this prefab.
     */
    cures: Status[];
    /**
     * The ID of the prefab that instances of this prefab will turn into once they have no uses left.
     */
    readonly nextStageId: string;
    /**
     * The prefab that instances of this prefab will turn into once they have no uses left.
     */
    nextStage: Prefab;
    /**
     * Whether inventory item instances of this prefab can be equipped by a player.
     */
    readonly equippable: boolean;
    /**
     * The IDs of equipment slots that inventory item instances of this prefab can be equipped to.
     */
    readonly equipmentSlots: string[];
    /**
     * The IDs of equipment slots that inventory item instances of this prefab will cover when equipped. This prevents any inventory items equipped to those equipment slots from appearing in the player's equipment description.
     */
    readonly coveredEquipmentSlots: string[];
    /**
     * Forward slash separated list of comma-separated bot commands to be executed when the an inventory item instance of this prefab is equipped or unequipped.
     */
    readonly commandsString: string;
    /**
     * The bot commands to be executed when an inventory item instance of this prefab is equipped by a player.
     */
    readonly equippedCommands: string[];
    /**
     * The bot commands to be executed when an inventory item instance of this prefab is unequipped by a player.
     */
    readonly unequippedCommands: string[];
    /**
     * {@link InventorySlot|Inventory slots} that instances of this prefab will have. The key is the inventory slot's ID.
     */
    readonly inventory: Collection<string, InventorySlot<ItemInstance>>;
    /**
     * The preposition that will be used when a player puts an item into an instance of this prefab.
     */
    readonly preposition: string;
    /**
     * The description of the prefab. Can contain multiple item lists named after its inventory slots.
     */
    readonly description: Description;
    /**
     * A map of procedurals in this prefab's description and the set of possibilities contained within them.
     */
    readonly proceduralOptions: Map<string, Set<string>>;

    /**
     * @param id - The unique identifier of the prefab.
     * @param name - The name of the prefab.
     * @param pluralName - The plural name of the prefab.
     * @param singleContainingPhrase - The phrase that will be inserted in/removed from item tags when an instance of this prefab is added to/removed from an item list.
     * @param pluralContainingPhrase - The phrase that will be used in an item list when it contains multiple instances of prefabs with the same single containing phrase.
     * @param discreet - Whether interactions with instances of this prefab are narrated or not.
     * @param size - How large the prefab is. Does not correspond with any particular unit of measurement.
     * @param weight - How much the prefab weighs in kilograms.
     * @param usable - Whether the instances of the prefab can be used by a player to inflict or cure one or more status effects.
     * @param thirdPersonVerb - The verb that will be used in narrations when a player uses an inventory item instance of this prefab.
     * @param secondPersonVerb - TThe verb that will be used in second person notifications when a player uses an inventory item instance of this prefab.
     * @param uses - The number of uses the prefab has.
     * @param effectsStrings - A list of status effects that will be inflicted on the player when they use an inventory item instance of this prefab.
     * @param curesStrings - A list of status effects that the player will be cured of when they use an inventory item instance of this prefab.
     * @param nextStageId - The ID of the prefab that instances of this prefab will turn into once they have no uses left.
     * @param equippable - Whether inventory item instances of this prefab can be equipped by a player.
     * @param equipmentSlots - The IDs of equipment slots that inventory item instances of this prefab can be equipped to.
     * @param coveredEquipmentSlots - The IDs of equipment slots that inventory item instances of this prefab will cover when equipped. This prevents any inventory items equipped to those equipment slots from appearing in the player's equipment description.
     * @param commandsString - Forward slash separated list of comma-separated bot commands to be executed when the an inventory item instance of this prefab is equipped or unequipped.
     * @param equippedCommands - The bot commands to be executed when an inventory item instance of this prefab is equipped by a player.
     * @param unequippedCommands - The bot commands to be executed when an inventory item instance of this prefab is unequipped by a player.
     * @param inventory - {@link InventorySlot|Inventory slots} that instances of this prefab will have.
     * @param preposition - The preposition that will be used when a player puts an item into an instance of this prefab.
     * @param description - The description of the prefab. Can contain multiple item lists named after its inventory slots.
     * @param row - The row number of the prefab in the sheet.
     * @param game - The game this belongs to.
     */
    constructor(id: string, name: string, pluralName: string, singleContainingPhrase: string,
        pluralContainingPhrase: string, discreet: boolean, size: number, weight: number, usable: boolean,
        thirdPersonVerb: string, secondPersonVerb: string, uses: number, effectsStrings: string[],
        curesStrings: string[], nextStageId: string, equippable: boolean, equipmentSlots: string[],
        coveredEquipmentSlots: string[], commandsString: string, equippedCommands: string[],
        unequippedCommands: string[], inventory: Collection<string, InventorySlot<ItemInstance>>, preposition: string,
        description: string, row: number, game: Game) {
        super(game, row);
        this.id = id;
        this.name = name;
        this.pluralName = pluralName;
        this.singleContainingPhrase = singleContainingPhrase;
        this.pluralContainingPhrase = pluralContainingPhrase;
        this.discreet = discreet;
        this.size = size;
        this.weight = weight;
        this.usable = usable;
        this.verb = thirdPersonVerb;
        this.thirdPersonVerb = thirdPersonVerb;
        this.secondPersonVerb = secondPersonVerb;
        this.uses = uses;
        this.effectsStrings = effectsStrings;
        this.effects = new Array(this.effectsStrings.length);
        this.curesStrings = curesStrings;
        this.cures = new Array(this.curesStrings.length);
        this.nextStageId = nextStageId;
        this.nextStage = null;
        this.equippable = equippable;
        this.equipmentSlots = equipmentSlots;
        this.coveredEquipmentSlots = coveredEquipmentSlots;
        this.commandsString = commandsString;
        this.equippedCommands = equippedCommands;
        this.unequippedCommands = unequippedCommands;
        this.inventory = inventory;
        this.preposition = preposition;
        this.description = new Description(description, this, game);
        this.proceduralOptions = this.description.procedurals;
    }

    /**
     * Sets the next stage.
     */
    setNextStage(nextStage: Prefab): void {
        this.nextStage = nextStage;
    }

    /**
	 * Outputs a string to insert into an item list in a description.
	 * If the given quantity is 1, returns the prefab's single containing phrase.
	 * If the quantity is not 1, returns the prefab's quantity followed by its plural containing phrase.
	 * If the quantity is infinite, returns only the prefab's plural containing phrase.
	 */
	toContainingPhrase(quantity: number): string {
		if (isNaN(quantity)) return this.pluralContainingPhrase;
		else if (quantity !== 1) return `${quantity} ${this.pluralContainingPhrase}`;
		else return this.singleContainingPhrase;
	}

    /**
     * Returns true if the prefab contains no items.
     */
    containsNoItems(): boolean {
        return true;
    }

    descriptionCell(): string {
        return this.getGame().constants.prefabSheetDescriptionColumn + this.row;
    }

    getEntityID(): string {
        return this.id;
    }

    getLabel(field: PrefabField): string {
        switch (field) {
            case "id": return "Prefab ID";
            case "names": return "Prefab Name";
            case "containingPhrases": return "Containing Phrases";
            case "discreet": return "Discreet?";
            case "size": return "Size";
            case "weight": return "Weight";
            case "usable": return "Usable?";
            case "useVerb": return "Use Verb";
            case "uses": return "Uses";
            case "inflicts": return "Gives Status Effect(s)";
            case "cures": return "Cures Status Effect(s)";
            case "nextStage": return "Turns Into";
            case "equippable": return "Equippable?";
            case "equipmentSlots": return "Restrict to Equip. Slots";
            case "coveredEquipmentSlots": return "Covers Equip. Slots";
            case "commandsString": return "When Equipped / Unequipped";
            case "inventorySlots": return "Contains Inventory Slots";
            case "preposition": return "Preposition";
            case "description": return "Description";
        }
    }

    getValue(field: PrefabField): string {
        switch (field) {
            case "id": return this.id;
            case "names": return this.pluralName ? [this.name, this.pluralName].join(", ") : this.name;
            case "containingPhrases": return this.pluralContainingPhrase ? [this.singleContainingPhrase, this.pluralContainingPhrase].join(", ") : this.singleContainingPhrase;
            case "discreet": return this.discreet ? "TRUE" : "FALSE";
            case "size": return String(this.size);
            case "weight": return String(this.weight);
            case "usable": return this.usable ? "TRUE" : "FALSE";
            case "useVerb": return this.secondPersonVerb ? [this.thirdPersonVerb, this.secondPersonVerb].join(", ") : this.thirdPersonVerb;
            case "uses": return isNaN(this.uses) && this.usable ? "Infinity" : isNaN(this.uses) ? "" : String(this.uses);
            case "inflicts": return this.effectsStrings.join(", ");
            case "cures": return this.curesStrings.join(", ");
            case "nextStage": return this.nextStageId;
            case "equippable": return this.equippable ? "TRUE" : "FALSE";
            case "equipmentSlots": return this.equipmentSlots.join(", ");
            case "coveredEquipmentSlots": return this.coveredEquipmentSlots.join(", ");
            case "commandsString": return this.commandsString;
            case "inventorySlots": return this.inventory.map(inventorySlot => inventorySlot.toString()).join(", ");
            case "preposition": return this.preposition;
            case "description": return this.description.text;
        }
    }

    getViewField(field: PrefabField): ViewField {
        return { label: this.getLabel(field), value: this.getValue(field) };
    }

    override getEntityType(): string {
        return "Prefab";
    }
}
