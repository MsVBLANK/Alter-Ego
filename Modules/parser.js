import Description from '../Data/Description.ts';
import ItemContainer from '../Data/ItemContainer.ts';
import Player from '../Data/Player.js';
import { MessageDisplayType } from './enums.js';
import { default as evaluateScript } from './scriptParser.js';

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export * as default from './parser.js';

/** @import GameEntity from '../Data/GameEntity.ts' */
/** @import InventoryItem from '../Data/InventoryItem.js' */
/** @import RoomItem from '../Data/RoomItem.js' */

class Clause {
    /**
     * @param {any} node
     * @param {boolean} [isItem]
     * @param {number} [itemNo]
     * @param {number} [itemQuantity]
     */
    constructor(node, isItem, itemNo, itemQuantity) {
        this.node = node;
        this.text = this.node.data;
        this.isItem = isItem !== null && isItem !== undefined ? isItem : false;
        this.itemNo = itemNo !== null && itemNo !== undefined ? itemNo : NaN;
        this.itemQuantity = itemQuantity !== null && itemQuantity !== undefined ? itemQuantity : 0;
    }

    /** @param {string} word */
    startsWith(word) {
        return this.text.includes(` ${word} `) && this.text.substring(0, this.text.indexOf(` ${word} `)).split(',').length - 1 === 0;
    }

    /** @param {string} word */
    endsWith(word) {
        return this.text.includes(` ${word} `) && this.text.substring(this.text.lastIndexOf(` ${word} `)).split(',').length - 1 === 0;
    }

    /**
     * Replaces the given first word with a new word.
     * @param {string} word
     * @param {string} newWord
     */
    replaceFirstWord(word, newWord) {
        this.set(this.text.substring(0, this.text.indexOf(` ${word} `)) + ` ${newWord} ` + this.text.substring(this.text.indexOf(` ${word} `) + ` ${word} `.length));
    }

    /**
     * Replaces the given ending word with a new word.
     * @param {string} word
     * @param {string} newWord
     */
    replaceLastWord(word, newWord) {
        this.set(this.text.substring(0, this.text.lastIndexOf(` ${word} `)) + ` ${newWord} ` + this.text.substring(this.text.lastIndexOf(` ${word} `) + ` ${word} `.length));
    }

    /** @param {string} string */
    set(string) {
        this.node.data = string;
        this.text = this.node.data;
    }

    delete() {
        if (this.node) {
            let parentNode = this.node.parentNode;
            let grandParentNode = parentNode.parentNode;
            parentNode.removeChild(this.node);
            // If this is an item clause, then the parent node is an item tag. Delete the now empty item tag.
            if (this.isItem) grandParentNode.removeChild(parentNode);
            // If this item is contained in an if tag, remove the if tag.
            if (grandParentNode.nodeName === 'if') grandParentNode.parentNode.removeChild(grandParentNode);
            this.node = null;
        }
        this.text = "";
    }
}

class Sentence {
    /**
     * @param {Array<Clause>} clause
     * @param {number} itemCount
     * @param {Element} itemList
     * @param {string} itemListName
     */
    constructor(clause, itemCount, itemList, itemListName) {
        this.clause = clause;
        this.itemCount = itemCount;
        this.itemList = itemList;
        this.itemListName = itemListName;
    }

    /** @param {number} i */
    deleteClause(i) {
        this.clause.splice(i, 1);
    }
}

/**
 * Converts a description from plain-text to a document, with warnings and errors.
 * @param {string} descriptionText - The text of the description.
 * @param {boolean} [removeItems] - Whether or not to remove item tags from the description. Defaults to true.
 */
export function createDocument(descriptionText, removeItems = true) {
    const description = createDescriptionDocumentFromString(descriptionText);
    if (removeItems && description.warnings.length === 0 && description.errors.length === 0) {
        // Check if there's an item list in the document.
        const itemListSentences = getItemListSentences(description.document);
        for (const sentenceElement of itemListSentences) {
            const sentence = createSentence(sentenceElement);
            description.document = removeAllItemsFromItemList(description.document, sentence);
        }
    }
    return description;
}

/**
 * Parses the XML of a description and evaluates it into a result object with no XML tags. Includes warnings and errors.
 * @param {Description} description - The description to parse.
 * @param {GameEntity} container - The in-game entity this description belongs to.
 * @param {Player} player - The Player currently reading the description.
 * @returns {{text: string, warnings: string[], errors: string[]}}
 */
export function parseDescriptionWithErrors(description, container, player) {
    const descriptionCopy = new Description(description.text, container, description.getGame());
    let documentElement = descriptionCopy.document;

    // Find any conditionals.
    let conditionals = documentElement.getElementsByTagName('if');
    /** @type {Array<Element>} */
    let conditionalsToRemove = [];
    for (let i = 0; i < conditionals.length; i++) {
        let conditional = conditionals[i].getAttribute('cond');
        if (conditional !== null && conditional !== undefined) {
            try {
                if (evaluateScript(conditional, container, player) === false)
                    conditionalsToRemove.push(conditionals[i]);
            }
            catch (err) {
                description.getErrors().push(err.toString());
            }
        }
    }
    for (let conditionalToRemove of conditionalsToRemove) {
        if (conditionalToRemove.parentNode) conditionalToRemove.parentNode.removeChild(conditionalToRemove);
        else documentElement.removeChild(conditionalToRemove);
    }

    // Check if there's an item list in the document.
    const itemListSentences = getItemListSentences(documentElement);
    for (const sentenceElement of itemListSentences) {
        const itemList = sentenceElement.getElementsByTagName('il').item(0);
        if (container instanceof ItemContainer) {
            const sentence = createSentence(sentenceElement);
            documentElement = addItemsToItemList(documentElement, sentence, container, player);
        }
        // If the item list is empty, remove the sentence from the documentElement.
        const childNode = itemList.childNodes.item(0);
        if (itemList.childNodes.length === 0 || itemList.childNodes.length === 1 && 'tagName' in childNode && childNode.tagName === 'null') {
            if (sentenceElement.parentNode) sentenceElement.parentNode.removeChild(sentenceElement);
            else documentElement.removeChild(sentenceElement);
        }
    }

    // Replace any var tags.
    const variables = documentElement.getElementsByTagName('var');
    let variableStrings = [];
    for (let i = 0; i < variables.length; i++) {
        const varAttribute = variables[i].getAttribute('v');
        if (varAttribute !== null && varAttribute !== undefined) {
            try {
                const variableText = evaluateScript(varAttribute, container, player);
                if (variableText === undefined || variableText === "undefined")
                    description.getErrors().push('"' + varAttribute.replace(/container/g, "this") + '" is undefined.');
                variableStrings.push({ element: variables[i], attribute: String(variableText) });
            } catch (err) {
                description.getErrors().push(err.toString());
            }
        }
    }
    for (let i = 0; i < variableStrings.length; i++) {
        const newNode = documentElement.createTextNode(variableStrings[i].attribute);
        variableStrings[i].element.parentNode.replaceChild(newNode, variableStrings[i].element);
    }

    // Replace any br tags.
    const breakTags = documentElement.getElementsByTagName('br');
    let breaks = [];
    for (let i = 0; i < breakTags.length; i++)
        breaks.push(breakTags[i]);
    for (let i = 0; i < breaks.length; i++) {
        let newNode = documentElement.createTextNode('\n');
        breaks[i].parentNode.replaceChild(newNode, breaks[i]);
    }

    // Convert the document to a string.
    let newDescription = stringify(documentElement);
    // Strip XML tags from the string, as well as all duplicate spaces.
    newDescription = newDescription.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    return { text: newDescription, warnings: description.getWarnings(), errors: description.getErrors() };
}

/**
 * Parses the XML of a description and evaluates it into a result with no XML tags. Returns only the resulting text.
 * @param {Description} description - The description to parse.
 * @param {GameEntity} container - The in-game entity this description belongs to.
 * @param {Player} player - The Player currently reading the description.
 * @returns {string}
 */
export function parseDescription(description, container, player) {
    const parsedDescription = parseDescriptionWithErrors(description, container, player);
    return parsedDescription.text;
}

/**
 * Adds items to an item list.
 * @param {Document} document - The document containing sentences with item lists.
 * @param {Sentence} sentence - The sentence containing an item list.
 * @param {ItemContainer} container - The item container entity this item list belongs to.
 * @param {Player} player - The Player currently reading the description.
 */
function addItemsToItemList(document, sentence, container, player) {
    const items = container.getCollatedContainedItemsInItemList(sentence.itemListName, player);
    for (const [prefab, quantity] of items) {
        const singleContainingPhrase = prefab.singleContainingPhrase.toLocaleUpperCase();
        const pluralContainingPhrase = prefab.pluralContainingPhrase?.toLocaleUpperCase();
        let itemAlreadyExists = false;
        for (const clause of sentence.clause) {
            const clauseText = clause.node.data.toLocaleUpperCase();
            if (isNaN(quantity) && (pluralContainingPhrase && clauseText.includes(pluralContainingPhrase) || clauseText.includes(prefab.pluralName) || clauseText.includes(prefab.name))) {
                itemAlreadyExists = true;
                break;
            }
            else if (!isNaN(quantity) && clause.isItem && (clauseText === singleContainingPhrase || pluralContainingPhrase && clauseText.includes(pluralContainingPhrase))) {
                itemAlreadyExists = true;
                if (clauseText === singleContainingPhrase)
                    clause.set(`${1 + quantity} ${prefab.pluralContainingPhrase}`);
                else if (pluralContainingPhrase && clauseText.includes(pluralContainingPhrase)) {
                    const quantityMatch = clauseText.match(/\d+/);
                    if (quantityMatch) {
                        const oldQuantity = parseInt(quantityMatch[0]);
                        clause.set(clause.text.replace(oldQuantity, oldQuantity + quantity));
                    }
                }
                break;
            }
        }
        if (itemAlreadyExists) continue;
        addClause(sentence, prefab.toContainingPhrase(quantity), quantity);
        sentence.itemCount++;
    }
    return document;
}

/**
 * Removes all items from an item list.
 * @param {Document} document - The document containing sentences with item lists.
 * @param {Sentence} sentence - The sentence containing an item list.
 */
function removeAllItemsFromItemList(document, sentence) {
    const childNode = sentence.itemList.childNodes.item(0);
    if (sentence.itemList.childNodes.length === 0 || sentence.itemList.childNodes.length === 1 && 'tagName' in childNode && childNode.tagName === 'null') return document;
    for (let i = sentence.clause.length - 1; i >= 0; i--) {
        if (!sentence.clause[i].isItem) continue;
        removeClause(sentence, i);
        // Remove any deleted nodes from the sentence and adjust the current index if needed.
        for (let j = sentence.clause.length - 1; j >= i; j--) {
            if (sentence.clause[j].node === null)
                sentence.deleteClause(j);
        }
        for (let j = i - 1; j >= 0; j--) {
            if (sentence.clause[j].node === null) {
                sentence.deleteClause(j);
                i--;
            }
        }
        sentence.itemCount--;
    }
    return document;
}

/**
 * Evaluates all of the procedural and poss tags in a description and randomly selects which ones to keep.
 * @param {Description} description - The description with procedurals.
 * @param {Map<string, string>} proceduralSelections - A Map of manually selected names of poss tags to keep.
 * @param {Player|PseudoPlayer} [player] - The player who caused these procedurals to be evaluated, if applicable.
 * @returns {string}
 */
export function generateProceduralOutput(description, proceduralSelections, player) {
    const descriptionCopy = new Description(description.text, description.getContainer(), description.getGame());
    let document = descriptionCopy.document;
    // Find all procedurals.
    let procedurals = document.getElementsByTagName('procedural');
    /** @type {Array<Node>} */
    let proceduralsToRemove = [];
    for (let i = 0; i < procedurals.length; i++) {
        const proceduralName = procedurals[i].getAttribute('name').toLowerCase().trim();
        let proceduralAssigned = false;
        if (proceduralName !== '' && proceduralSelections.has(proceduralName))
            proceduralAssigned = true;
        else {
            let parentProcedural = procedurals[i].parentNode;
            // If this procedural is nested, find its parent procedural.
            while (!parentProcedural.hasOwnProperty("documentElement") && 'tagName' in parentProcedural && parentProcedural.tagName !== "procedural")
                parentProcedural = parentProcedural.parentNode;
            let proceduralChance = parseFloat(procedurals[i].getAttribute('chance'));
            // If a procedural chance was not provided or it is invalid, assume the chance is 100%.
            if (isNaN(proceduralChance) || proceduralChance < 0 || proceduralChance > 100)
                proceduralChance = 100;
            // Roll to determine if this procedural will be kept. If the probability check fails, remove the tag entirely and skip to the next one.
            if (!keepProcedural(proceduralChance) || proceduralsToRemove.includes(parentProcedural)) {
                proceduralsToRemove.push(procedurals[i]);
                continue;
            }
        }

        // Determine which poss tag within this procedural to keep.
        let possibilities = procedurals[i].getElementsByTagName('poss');
        /** @type {Array<Possibility>} */
        let possibilityArr = [];
        /** @type {Array<Element>} */
        let possibilitiesToRemove = [];
        /** @type {number} */
        let winningPossibilityIndex;
        for (let j = 0; j < possibilities.length; j++) {
            // Skip possibilities that belong to nested procedurals.
            if (possibilities[j].parentNode !== procedurals[i]) continue;
            const possibilityName = possibilities[j].getAttribute('name').toLowerCase();
            if (proceduralAssigned && proceduralSelections.get(proceduralName) === possibilityName)
                winningPossibilityIndex = j;
            let possibilityChance = parseFloat(possibilities[j].getAttribute('chance'));
            // This will be handled in the rolling function, if a possibility chance was not provided or invalid, set it to null.
            if (isNaN(possibilityChance) || possibilityChance < 0 || possibilityChance > 100)
                possibilityChance = null;
            possibilityArr.push({ index: j, chance: possibilityChance });
        }
        if (!winningPossibilityIndex) {
            /** @type {number} */
            let statValue;
            const proceduralStat = Player.abbreviateStatName(procedurals[i].getAttribute('stat'));
            if (proceduralStat !== '' && player) {
                if (proceduralStat === "str") statValue = player.strength;
                else if (proceduralStat === "per") statValue = player.perception;
                else if (proceduralStat === "dex") statValue = player.dexterity;
                else if (proceduralStat === "spd") statValue = player.speed;
                else if (proceduralStat === "sta") statValue = player.stamina;
            }
            possibilityArr = calculateModifiedPossibilityArr(possibilityArr, statValue);
            winningPossibilityIndex = choosePossibilityIndex(possibilityArr);
        }
        for (let possibility of possibilityArr) {
            if (possibility.index !== winningPossibilityIndex)
                possibilitiesToRemove.push(possibilities[possibility.index]);
        }
        // Remove poss tags that failed the roll.
        for (let j = 0; j < possibilitiesToRemove.length; j++)
            procedurals[i].removeChild(possibilitiesToRemove[j]);
    }
    // Remove procedurals that failed the roll.
    for (let i = 0; i < proceduralsToRemove.length; i++) {
        if (proceduralsToRemove[i].parentNode) proceduralsToRemove[i].parentNode.removeChild(proceduralsToRemove[i]);
        else document.removeChild(proceduralsToRemove[i]);
    }

    return stringify(document).replace(/<\/?procedural\s?[^>]*>/g, '').replace(/<\/?poss\s?[^>]*>/g, '').replace(/<s>\s*<\/s>/g, '').replace(/<\/([^>]+?)> +<\/desc>/g, "</$1></desc>").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

/** @param {number} chance */
function keepProcedural(chance) {
    return Math.random() * 100 < chance;
}

/**
 * @param {Array<Possibility>} possibilityArr
 * @param {number} statValue
 * @returns {Array<Possibility>}
 */
function calculateModifiedPossibilityArr(possibilityArr, statValue) {
    // If any of the given possibilities are null, assign their chances equally so that all chances add up to 100.
    // Clamp the sum of non-null possibilities between 0 and 100.
    /** @type {number} */
    let possibilitySum = Math.min(Math.max(possibilityArr.reduce((accumulator, possibility) => accumulator + (possibility.chance === null ? 0 : possibility.chance), 0), 0), 100);
    /** @type {number} */
    let nullCount = possibilityArr.reduce((accumulator, possibility) => accumulator + (possibility.chance === null ? 1 : 0), 0);
    if (nullCount > 0) {
        let dividedRemainder = (100.0 - possibilitySum) / nullCount;
        for (let possibility of possibilityArr) {
            if (possibility.chance === null)
                possibility.chance = dividedRemainder;
        }
    }

    // Generate modified percentages based on the supplied stat value.
    if (statValue !== null && possibilityArr.length > 1) {
        const modifierMax = statValue - 5;
        const modifierMin = -1 * modifierMax;
        for (let i = 0; i < possibilityArr.length; i++) {
            const percentageModifier = (modifierMin + (modifierMax - modifierMin) / (possibilityArr.length - 1) * i) * 10;
            possibilityArr[i].chance = possibilityArr[i].chance + percentageModifier;
        }
    }

    // Sort by highest to lowest chance.
    possibilityArr = possibilityArr.sort((a, b) => b.chance - a.chance);

    return possibilityArr;
}

/**
 * @param {Array<Possibility>} possibilityArr
 * @returns {number}
 */
function choosePossibilityIndex(possibilityArr) {
    // Roll a random number and find the winner.
    const rand = Math.random() * 100;
    let gachaValue = 0;
    for (let possibility of possibilityArr) {
        gachaValue += possibility.chance;
        if (rand < gachaValue) {
            return possibility.index;
        }
    }
}

/**
 * @param {string} description
 * @returns {{document: Document, warnings: string[], errors: string[], messageDisplayType: MessageDisplayType}}
 */
function createDescriptionDocumentFromString(description) {
    description = description.replace(/<il><\/il>/g, "<il><null /></il>");

    let warnings = [];
    let errors = [];
    /** @type {Document} */
    let document = new DOMParser({
        // locator is always need for error position info
        locator: {},
        // you can override the errorHandler for xml parser
        errorHandler: {
            warning: function (w) { warnings.push(w); },
            error: function (err) { errors.push(err); }
        }
    }).parseFromString(description, 'text/xml');

    // Get message display type.
    const messageDisplayTypeString = document?.getElementsByTagName('desc').item(0)?.getAttribute('type')?.toUpperCase();
    const messageDisplayType = getMessageDisplayType(messageDisplayTypeString);

    return { document: document, warnings: warnings, errors: errors, messageDisplayType: messageDisplayType };
}

/**
 * Returns a message display type based on the given string.
 * @param {string} messageDisplayTypeString
 */
function getMessageDisplayType(messageDisplayTypeString) {
    switch (messageDisplayTypeString) {
        case 'STANDARD':
            return MessageDisplayType.STANDARD;
        case 'WARNING':
            return MessageDisplayType.WARNING;
        case 'ALERT':
            return MessageDisplayType.ALERT;
        case 'MINOR':
            return MessageDisplayType.MINOR;
        case 'PLAIN_TEXT':
            return MessageDisplayType.PLAIN_TEXT;
    }
}

/**
 * @param {Element} sentenceNode
 * @returns {Sentence}
 */
function createSentence(sentenceNode) {
    /** @type {Array<Clause>} */
    let clauses = [];
    parseNodes(clauses, sentenceNode);
    let itemCount = 0;
    for (const clause of clauses) {
        if (clause.node.parentNode.tagName === 'item') {
            clause.isItem = true;
            itemCount++;
            clause.itemNo = itemCount;
            // Get item quantity.
            let text = clause.node.data;
            let start = text.search(/\d/);
            if (start === 0) {
                let end;
                for (end = start; end < text.length; end++) {
                    if (isNaN(text.charAt(end + 1)))
                        break;
                }
                const quantity = parseInt(text.substring(start, end));
                clause.itemQuantity = quantity;
            }
            else clause.itemQuantity = 1;
        }
    }
    let itemList = null;
    let itemListName = "";
    let itemLists = sentenceNode.getElementsByTagName('il');
    if (itemLists.length > 0) {
        itemList = itemLists[0];
        itemListName = itemList.getAttribute('name');
    }

    let sentence = new Sentence(clauses, itemCount, itemList, itemListName);
    return sentence;
}

/**
 * @param {Array<Clause>} clauses
 * @param {Node} node
 * @returns {Array<Clause>}
 */
function parseNodes(clauses, node) {
    for (let i = 0; i < node.childNodes.length; i++) {
        if ('data' in node.childNodes[i])
            clauses.push(new Clause(node.childNodes[i]));
        else if ('tagName' in node.childNodes[i])
            parseNodes(clauses, node.childNodes[i]);
    }
    return clauses;
}

/**
 * Gets all s tag elements containing an il tag element.
 * @param {Document} document
 * @returns {Array<Element>}
 */
function getItemListSentences(document) {
    // Get a list of sentences in the document.
    const sentences = document.getElementsByTagName('s');
    // Find the sentence containing an item list, if there is one.
    let itemListSentences = [];
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].getElementsByTagName('il').length > 0)
            itemListSentences.push(sentences[i]);
    }

    return itemListSentences;
}

/**
 * @param {Node} document
 * @returns {string}
 */
export function stringify(document) {
    let description = new XMLSerializer().serializeToString(document);
    description = description.replace(/<il\/>/g, "<il></il>").replace(/(<(il)\s[^>]+?)\/>/g, "$1></$2>").replace(/<s\/>/g, "").replace(/<null\/>/g, "").replace(/<\/([^>]+?)> +<\/desc>/g, "</$1></desc>").replace(/ {2,}/g, " ").trim();
    return description;
}

/**
 * @param {Sentence} sentence
 * @param {string} phrase
 * @param {number} itemQuantity
 * @returns {number} i - The index of the new Clause within the Sentence.
 */
function initializeNewClause(sentence, phrase, itemQuantity) {
    let document = sentence.itemList.ownerDocument;
    let firstChild = sentence.itemList.firstChild;
    let tempNode;
    if (firstChild === null || firstChild === undefined) {
        if (sentence.itemList.nextSibling !== null && sentence.itemList.nextSibling !== undefined)
            firstChild = sentence.itemList.nextSibling;
        else {
            tempNode = document.createTextNode("");
            sentence.itemList.appendChild(tempNode);
            firstChild = sentence.itemList.firstChild;
        }
    }
    else if ('tagName' in firstChild && firstChild.tagName === 'null') {
        firstChild.parentNode.removeChild(firstChild);
        firstChild = sentence.itemList.nextSibling;
    }
    while (!firstChild.hasOwnProperty("data"))
        firstChild = firstChild.firstChild;
    let i;
    for (i = 0; i < sentence.clause.length; i++) {
        if ('data' in firstChild && sentence.clause[i].text === firstChild.data)
            break;
    }

    let textNode = document.createTextNode(phrase);
    let itemNode = document.createElement('item');
    itemNode.appendChild(textNode);
    sentence.itemList.insertBefore(itemNode, sentence.itemList.firstChild);

    let separatorNode = document.createTextNode(" ");
    sentence.itemList.insertBefore(separatorNode, itemNode.nextSibling);

    const itemClause = new Clause(textNode, true, 0, itemQuantity);
    sentence.clause.splice(i, 0, itemClause);

    const separatorClause = new Clause(separatorNode);
    sentence.clause.splice(i + 1, 0, separatorClause);

    if (tempNode !== undefined)
        tempNode.parentNode.removeChild(tempNode);

    return i;
}

/**
 * @param {Sentence} sentence
 * @param {string} phrase
 * @param {number} [itemQuantity]
 * @returns {number} case - A number to indicate which condition was met for debugging purposes.
 */
function addClause(sentence, phrase, itemQuantity = 1) {
    // This function properly edits a sentence after an Item clause has been added.
    // In this function, sentence is the sentence containing an Item list.
    const clause = sentence.clause;

    // First, create the new Item clause and get its index in the sentence.
    // Note: clause[i + 1] is the separator clause where a comma, space, "and", etc. will go.
    const i = initializeNewClause(sentence, phrase, itemQuantity);

    // If this is the beginning of the sentence, capitalize the first letter of the new clause.
    // Then, fix the capitalization of the next clause, if applicable.
    if (i === 0) {
        clause[i].set(clause[i].text.charAt(0).toUpperCase() + clause[i].text.substring(1));
        const capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (capitals.includes(clause[i + 2].text.charAt(0)) && !capitals.includes(clause[i + 2].text.charAt(1)))
            clause[i + 2].set(clause[i + 2].text.charAt(0).toLowerCase() + clause[i + 2].text.substring(1));
    }

    // BEFORE: "<desc><s>On these shelves are <il><item>3 bottles of ZZZQUIL</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
    // INSERT: "PAINKILLERS"
    // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
    if (sentence.itemCount >= 3) {
        clause[i + 1].set(", ");
        return 1;
    }
    else if (sentence.itemCount === 2) {
        // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of LAXATIVES</item> and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        // INSERT: "PAINKILLERS"
        // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        if (clause[i + 2].isItem && !clause[i + 3].text.includes(", and ") && clause[i + 3].text.includes(" and ")) {
            clause[i + 1].set(", ");
            clause[i + 3].set(clause[i + 3].text.replace(" and ", ", and "));
            return 2;
        }
        // BEFORE: "<desc><s>However, you do find <il><item>a MOUSE</item>, a wooden ruler, and <item>a KEYBOARD</item></il>.</s></desc>"
        // INSERT: "FLASH DRIVE"
        // AFTER:  "<desc><s>However, you do find <il><item>a FLASH DRIVE</item>, <item>a MOUSE</item>, a wooden ruler, and <item>a KEYBOARD</item></il>.</s></desc>"
        else {
            clause[i + 1].set(", ");
            return 3;
        }
    }
    else if (sentence.itemCount === 1) {
        // BEFORE: "<desc><s>On these shelves is <il><item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        // INSERT: "PAINKILLERS"
        // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item> and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        if (clause[i + 2].isItem && clause[i + 2].node.parentNode === sentence.itemList.lastChild) {
            // If the clause before/after the item list has "is" and there are no commas after "is", change "is" to "are".
            if (clause[i - 1] && clause[i - 1].endsWith("is"))
                clause[i - 1].replaceLastWord("is", "are");
            else if (clause[i + 3] && clause[i + 3].startsWith("is"))
                clause[i + 3].replaceFirstWord("is", "are");
            clause[i + 1].set(" and ");
            return 4;
        }
        // BEFORE: "<desc><s>There are <il><item>3 CLARINETS</item>, a PIANO, and some SNARE DRUMS</il>.</s></desc>"
        // INSERT: "DRUM STICKS"
        // AFTER:  "<desc><s>There are <il><item>a set of DRUM STICKS</item>, <item>3 CLARINETS</item>, a PIANO, and some SNARE DRUMS</il>.</s></desc>"
        else if (clause[i + 2].isItem
            && (!clause[i + 3].isItem && clause[i + 3].text.startsWith(", ") && clause[i + 3].text.includes(", and")
            || (clause[i + 3].text === ", " && clause[i + 4] && !clause[i + 4].isItem && clause[i + 4].text.includes(", and")))) {
            clause[i + 1].set(", ");
            return 5;
        }
        // BEFORE: "<desc><s>There are <il><item>3 CLARINETS</item> and a PIANO</il>.</s></desc>"
        // INSERT: "DRUM STICKS"
        // AFTER:  "<desc><s>There are <il><item>a set of DRUM STICKS</item>, <item>3 CLARINETS</item>, and a PIANO</il>.</s></desc>"
        else if (clause[i + 2].isItem && clause[i + 3] && !clause[i + 3].isItem && clause[i + 3].text.startsWith(" and ")) {
            clause[i + 1].set(", ");
            clause[i + 3].set(`,${clause[i + 3].text}`);
            return 6;
        }
        // BEFORE: "<desc><s>However, you do find <il>a wooden ruler and <item>a KEYBOARD</item></il>.</s></desc>"
        // INSERT: "MOUSE"
        // AFTER:  "<desc><s>However, you do find <il><item>a MOUSE</item>, a wooden ruler, and <item>a KEYBOARD</item></il>.</s></desc>"
        else if (!clause[i + 2].isItem && clause[i + 2].text.endsWith(" and ") && clause[i + 3].isItem) {
            clause[i + 1].set(", ");
            clause[i + 2].set(clause[i + 2].text.substring(0, clause[i + 2].text.lastIndexOf(" and ")) + ", and ");
            return 7;
        }
    }
    else {
        // BEFORE: "<desc><s>There are <il>BASKETBALLS, SOCCER BALLS, and BASEBALLS</il>.</s></desc>"
        // INSERT: "TENNIS BALL"
        // AFTER:  "<desc><s>There are <il><item>a TENNIS BALL</item>, BASKETBALLS, SOCCER BALLS, and BASEBALLS</il>.</s></desc>"
        if (clause[i + 2] && clause[i + 2].text.includes(", and ") && clause[i + 2].node === sentence.itemList.lastChild) {
            clause[i + 1].set(", ");
            return 8;
        }
        // BEFORE: "<desc><s>There are <il>SOCCER BALLS and BASEBALLS</il>.</s></desc>"
        // INSERT: "TENNIS BALL"
        // AFTER:  "<desc><s>There are <il><item>a TENNIS BALL</item>, SOCCER BALLS, and BASEBALLS</il>.</s></desc>"
        else if (clause[i + 2] && clause[i + 2].text.includes(" and ") && clause[i + 2].node === sentence.itemList.lastChild) {
            clause[i + 1].set(", ");
            clause[i + 2].set(clause[i + 2].text.replace(" and ", ", and "));
            return 9;
        }
        // BEFORE: "<desc><s>However, you do find <il>a wooden ruler</il>.</s></desc>"
        // INSERT: "KEYBOARD"
        // AFTER:  "<desc><s>However, you do find <il><item>a KEYBOARD</item> and a wooden ruler</il>.</s></desc>"
        else if (clause[i + 2] && !clause[i + 2].isItem && clause[i + 2].node === sentence.itemList.lastChild) {
            clause[i + 1].set(" and ");
            return 10;
        }
        // BEFORE: "<desc><s>Looking under the beds, you find <il></il>.</s></desc>"
        // INSERT: "BASKETBALL"
        // AFTER:  "<desc><s>Looking under the beds, you find <il><item>a BASKETBALL</item></il>.</s></desc>"
        else if (clause[i + 1].node === sentence.itemList.lastChild) {
            clause[i + 1].delete();
            sentence.deleteClause(i + 1);
            // If the clause before or after the item list has "are" or "is" and that wouldn't be grammatically correct with the given item quantity, replace it.
            if (clause[i - 1] && clause[i - 1].endsWith("are") && clause[i].itemQuantity === 1)
                clause[i - 1].replaceLastWord("are", "is");
            else if (clause[i - 1] && clause[i - 1].endsWith("is") && clause[i].itemQuantity !== 1)
                clause[i - 1].replaceLastWord("is", "are");
            else if (clause[i + 1] && clause[i + 1].startsWith("are") && clause[i].itemQuantity === 1)
                clause[i + 1].replaceFirstWord("are", "is");
            else if (clause[i + 1] && clause[i + 1].startsWith("is") && clause[i].itemQuantity !== 1)
                clause[i + 1].replaceFirstWord("is", "are");
            return 11;
        }
        else return 12;
    }
}

/**
 * @param {Sentence} sentence
 * @param {number} i
 * @returns {number} case - A number to indicate which condition was met for debugging purposes.
 */
function removeClause(sentence, i) {
    // This function removes an Item clause from a sentence.
    // In this function, sentence is the sentence containing mention of the item.
    // i is the index of the clause mentioning that item.
    const clause = sentence.clause;

    if (sentence.itemCount > 1) {
        // Handle removing the last item from a list of items. The if/else if conditionals go by decreasing number of items in the list.
        if (clause[i - 1] && (clause[i - 1].text === ", and " || clause[i - 1].text === " and ") && clause[i].itemNo === sentence.itemCount) {
            clause[i].delete();

            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
            // REMOVE: "ISOPROPYL ALCOHOL"
            // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
            if (sentence.itemCount > 3) {
                // clause[i - 3] will be the comma preceding the second-to-last item. Change it to the string preceding the last item.
                clause[i - 3].set(clause[i - 1].text);
                clause[i - 1].delete();
                return 0;
            }
            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
            // REMOVE: "LAXATIVES"
            // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item> and <item>3 bottles of ZZZQUIL</item></il>.</s></desc>"
            else if (sentence.itemCount === 3) {
                clause[i - 3].set(clause[i - 1].text.replace(/, */, " "));
                clause[i - 1].delete();
                return 1;
            }
            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item> and <item>3 bottles of ZZZQUIL</item></il>.</s></desc>"
            // REMOVE: "ZZZQUIL"
            // AFTER:  "<desc><s>On these shelves is <il><item>a bottle of PAINKILLERS</item></il>.</s></desc>"
            else {
                // If the clause before or after the item list has "are" and there's only going to be 1 item left with a quantity of 1 and there are no commas after "are", change "are" to "is".
                if (i >= 3 && clause[i - 3].text.includes(" are ") && clause[i - 2].itemQuantity === 1 && clause[i - 3].text.substring(clause[i - 3].text.lastIndexOf(" are ")).split(',').length - 1 === 0)
                    clause[i - 3].set(clause[i - 3].text.substring(0, clause[i - 3].text.lastIndexOf(" are ")) + " is " + clause[i - 3].text.substring(clause[i - 3].text.lastIndexOf(" are ") + 5));
                else if (clause[i + 1] && clause[i + 1].text.startsWith(" are ") && clause[i].itemQuantity === 1)
                    clause[i + 1].set(" is " + clause[i + 1].text.substring(clause[i + 1].text.indexOf(" are ") + 5));
                clause[i - 1].delete();
                return 2;
            }
        }
        // Handle removing the first item from a list of items when the first item is the beginning of the sentence. The if/else if conditionals go by increasing number of items in the list.
        else if (clause[i].itemNo === 1 && !clause[i - 1]) {
            clause[i].delete();
            // BEFORE: "<desc><s><il><item>A bottle of PAINKILLERS</item> and <item>a bottle of LAXATIVES</item></il> are on these shelves.</s></desc>"
            // REMOVE: "PAINKILLERS"
            // AFTER:  "<desc><s><il><item>A bottle of LAXATIVES</item></il> is on these shelves.</s></desc>"
            if (clause[i + 1].text.includes(" and ")) {
                clause[i + 1].delete();
                clause[i + 2].set(clause[i + 2].text.charAt(0).toUpperCase() + clause[i + 2].text.substring(1));
                if (clause[i + 3].text.startsWith(" are") && clause[i + 2].itemQuantity === 1)
                    clause[i + 3].set(clause[i + 3].text.replace(" are", " is"));
                return 3;
            }
            // BEFORE: "<desc><s><il><item>A bottle of PAINKILLERS</item>, <item>a bottle of ZZZQUIL</item>, and <item>a bottle of LAXATIVES</item></il> are on these shelves.</s></desc>"
            // REMOVE: "PAINKILLERS"
            // AFTER:  "<desc><s><il><item>A bottle of ZZZQUIL</item> and <item>a bottle of LAXATIVES</item></il> are on these shelves.</s></desc>"
            else if (clause[i + 1].text.startsWith(", ") && clause[i + 3].text.startsWith(", and ")) {
                clause[i + 1].delete();
                clause[i + 2].set(clause[i + 2].text.charAt(0).toUpperCase() + clause[i + 2].text.substring(1));
                clause[i + 3].set(clause[i + 3].text.replace(", and ", " and "));
                return 4;
            }
        }
        // Handle removing the second to last item from a list of items. The if/else if conditionals go by increasing number of items in the list.
        else if ((clause[i + 1].text === ", and " || clause[i + 1].text === " and ") && clause[i].itemNo === sentence.itemCount - 1) {
            clause[i].delete();
            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item> and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
            // REMOVE: "PAINKILLERS"
            // AFTER:  "<desc><s>On these shelves is <il><item>a bottle of LAXATIVES</item></il>.</s></desc>"
            if (sentence.itemCount === 2) {
                clause[i + 1].delete();
                // If the clause before the item list has "are" and there's only going to be 1 item left with a quantity of 1 and there are no commas after "are", change "are" to "is".
                if (clause[i - 1].text.includes(" are ") && clause[i + 2].itemQuantity === 1 && clause[i - 1].text.substring(clause[i - 1].text.lastIndexOf(" are ")).split(',').length - 1 === 0)
                    clause[i - 1].set(clause[i - 1].text.substring(0, clause[i - 1].text.lastIndexOf(" are ")) + " is " + clause[i - 1].text.substring(clause[i - 1].text.lastIndexOf(" are ") + 5));
                return 5;
            }
            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
            // REMOVE: "ZZZQUIL"
            // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item> and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
            else if (sentence.itemCount === 3) {
                clause[i + 1].delete();
                clause[i - 1].set(" and ");
                return 6;
            }
            // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
            // REMOVE: "LAXATIVES":
            // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
            else if (sentence.itemCount > 3) {
                clause[i - 1].delete();
                return 7;
            }
        }
        // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>a bottle of ZZZQUIL</item>, and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
        // REMOVE: "PAINKILLERS"
        // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of ZZZQUIL</item> and <item>a bottle of LAXATIVES</item></il>.</s></desc>"
        else if (sentence.itemCount === 3 && clause[i].itemNo === 1
            && clause[i + 1].text === ", " && clause[i + 3].text.startsWith(", and ")) {
            clause[i].delete();
            clause[i + 1].delete();
            clause[i + 3].set(clause[i + 3].text.replace(", and ", " and "));
            return 8;
        }
        // BEFORE: "<desc><s>On the counters, you can see <il><item>a few KNIVES</item>, <item>a BUTCHERS KNIFE</item>, and <item>a RACK of skewers</item></il>.</s></desc>"
        // REMOVE: "KNIFE"
        // AFTER:  "<desc><s>On the counters, you can see <il><item>a BUTCHERS KNIFE</item> and <item>a RACK of skewers</item></il>.</s></desc>"
        else if (sentence.itemCount === 2
            && clause[i + 1] && clause[i + 1].text === ", "
            && clause[i + 2] && clause[i + 2].isItem
            && clause[i + 3] && clause[i + 3].text.startsWith(", and ") && !clause[i + 3].isItem) {
            clause[i].delete();
            clause[i + 1].delete();
            clause[i + 3].set(clause[i + 3].text.replace(", and ", " and "));
            return 9;
        }
        // BEFORE: "<desc><s>On the counters, you can see <il><item>a few KNIVES</item>, <item>a BUTCHERS KNIFE</item>, and <item>a RACK of skewers</item></il>.</s></desc>"
        // REMOVE: "BUTCHERS KNIFE"
        // AFTER:  "<desc><s>On the counters, you can see <il><item>a few KNIVES</item> and a RACK of skewers</il>.</s></desc>"
        else if (sentence.itemCount === 2 && clause[i].itemNo === 2
            && clause[i - 1].text === ", "
            && clause[i + 1] && clause[i + 1].text.startsWith(", and") && !clause[i + 1].isItem) {
            clause[i - 1].delete();
            clause[i].delete();
            clause[i + 1].set(clause[i + 1].text.replace(", and ", " and "));
            return 10;
        }
        // BEFORE: "<desc><s>However, you do find <il><item>a MOUSE</item>, a wooden ruler, and <item>a KEYBOARD</item></il>.</s></desc>"
        // REMOVE: "MOUSE"
        // AFTER:  "<desc><s>However, you do find <il>a wooden ruler and <item>a KEYBOARD</item></il>.</s></desc>"
        else if (sentence.itemCount === 2
            && clause[i + 1] && !clause[i + 1].isItem && clause[i + 1].text.startsWith(", ") && clause[i + 1].text.endsWith(", and ")
            && clause[i + 2] && clause[i + 2].isItem) {
            clause[i].delete();
            clause[i + 1].set(clause[i + 1].text.replace(", ", "").replace(", and ", " and "));
            return 11;
        }
        // BEFORE: "<desc><s>However, you do find <il><item>a MOUSE</item>, a wooden ruler, and <item>a KEYBOARD</item></il>.</s></desc>"
        // REMOVE: "KEYBOARD"
        // AFTER:  "<desc><s>However, you do find <il><item>a MOUSE</item> and a wooden ruler</il>.</s></desc>"
        else if (clause[i - 1] && !clause[i - 1].isItem && clause[i - 1].text.startsWith(", ") && clause[i - 1].text.endsWith(", and ")
            && clause[i - 2] && clause[i - 2].isItem) {
            clause[i].delete();
            clause[i - 1].set(clause[i - 1].text.replace(", ", " and ").replace(", and ", ""));
            return 12;
        }
        // BEFORE: "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, <item>a bottle of LAXATIVES</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        // REMOVE: "LAXATIVES":
        // AFTER:  "<desc><s>On these shelves are <il><item>a bottle of PAINKILLERS</item>, <item>3 bottles of ZZZQUIL</item>, and <item>a bottle of ISOPROPYL ALCOHOL</item></il>.</s></desc>"
        else if (sentence.itemCount >= 3 && clause[i].itemNo === sentence.itemCount && clause[i + 1] && clause[i + 1].text.startsWith(", and ")) {
            clause[i].delete();
            clause[i - 1].delete();
            return 13;
        }
        // BEFORE: "<desc><s>The shelves are lined with <il><item>2 bags of POTATOES</item>, <item>2 bags of RICE</item>, different ingredients for baking, and dough mixes</il>.</s></desc>"
        // REMOVE: RICE
        // AFTER: "<desc><s>The shelves are lined with <il><item>2 bags of POTATOES</item>, different ingredients for baking, and dough mixes</il>.</s></desc>"
        else if (sentence.itemCount >= 2 && clause[i].itemNo === sentence.itemCount
            && clause[i + 1] && clause[i + 1].text.includes(", and ") && !clause[i + 1].text.startsWith(", and ") && clause[i + 1].text.startsWith(", ")) {
            clause[i].delete();
            clause[i + 1].set(clause[i + 1].text.substring(2));
            return 14;
        }
        else {
            clause[i].delete();
            if (clause[i + 1] && clause[i + 1].text === ", ") clause[i + 1].delete();
            return 15;
        }
    }
    // BEFORE: "<desc><s>A few grab your attention though: <il>ROSE OF SHARON, PINK LACEFLOWER, and <item>a MIRACLE FLOWER</item></il>.</s></desc>"
    // REMOVE: "MIRACLE FLOWER"
    // AFTER:
    else if (clause[i - 1] && !clause[i - 1].isItem && clause[i - 1].text.endsWith(", and ") && clause[i - 1].text.split(',').length - 1 === 2) {
        clause[i].delete();
        clause[i - 1].set(clause[i - 1].text.replace(", and ", "").replace(", ", " and "));
        return 16;
    }
    // BEFORE: "<desc><s>However, you do find <il>a wooden ruler and <item>a KEYBOARD</item></il>.</s></desc>"
    // REMOVE: "KEYBOARD"
    // AFTER:  "<desc><s>However, you do find <il>a wooden ruler</il>.</s></desc>"
    else if (clause[i - 1] && !clause[i - 1].isItem && clause[i - 1].text.endsWith(" and ")) {
        clause[i].delete();
        clause[i - 1].set(clause[i - 1].text.replace(" and ", ""));
        return 17;
    }
    // BEFORE: "<desc><s>However, you do find <il><item>a KEYBOARD</item> and a wooden ruler</il>.</s></desc>"
    // REMOVE: "KEYBOARD"
    // AFTER:  "<desc><s>However, you do find <il>a wooden ruler</il>.</s></desc>"
    else if (clause[i + 1] && clause[i + 1].text.startsWith(" and ")) {
        clause[i].delete();
        clause[i + 1].set(clause[i + 1].text.replace(" and ", ""));
        return 18;
    }
    // BEFORE: "<desc><s>In and around the bushes, you find <il><item>an EASTER EGG</item>, RED BERRIES, PURPLE BERRIES, and MUSHROOMS</il>.</s></desc>"
    // REMOVE: "EASTER EGG"
    // AFTER:  "<desc><s>In and around the bushes, you find <il>RED BERRIES, PURPLE BERRIES, and MUSHROOMS</il>.</s></desc>"
    else if (clause[i + 1] && clause[i + 1].text.includes(", and ") && clause[i + 1].text.split(',').length - 1 > 2) {
        clause[i].delete();
        clause[i + 1].set(clause[i + 1].text.replace(", ", ""));
        return 19;
    }
    // BEFORE: "<desc><s>There are <il><item>CLARINETS</item>, a PIANO, and some SNARE DRUMS</il>.</s></desc>"
    // REMOVE: "CLARINETS"
    // AFTER:  "<desc><s>There are <il>a PIANO and some SNARE DRUMS</il>.</s></desc>"
    else if (clause[i + 1] && clause[i + 1].text.includes(", and ") && clause[i + 1].text.split(',').length - 1 === 2) {
        clause[i].delete();
        clause[i + 1].set(clause[i + 1].text.replace(", ", "").replace(", and ", " and "));
        return 20;
    }
    else if (!clause[i - 1] && clause[i + 1] && clause[i + 1].text === ".") {
        clause[i].delete();
        clause[i + 1].delete();
        return 21;
    }

    // If all else fails, just remove the item clause.
    clause[i].delete();
    return 22;
}
