import { Collection, Guild, GuildMember, TextChannel, DMChannel } from "discord.js";
import { format } from "pretty-format";
import { Duration } from "luxon";
import Timer from "./Timer.js";
import Status from "../Data/Status.js";
import Gesture from "../Data/Gesture.js";
import Player from "../Data/Player.js";
import Room from "../Data/Room.js";
import BotContext from "./BotContext.js";
import Puzzle from "../Data/Puzzle.js";
import Description from "../Data/Description.js";
import Prefab from "../Data/Prefab.js";
import Fixture from "../Data/Fixture.js";
import InventorySlot from "../Data/InventorySlot.ts";
import ItemInstance from "../Data/ItemInstance.ts";
import RoomItem from "../Data/RoomItem.js";
import InventoryItem from "../Data/InventoryItem.js";

/** @import { NewPlugin } from 'pretty-format' */

/** @type {NewPlugin} */
export class GuildPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Guild;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {GuildMember} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<GuildMember "${value.displayName || "unknown"}">`;
    }
}

/** @type {NewPlugin} */
export class GuildMemberPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof GuildMember;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {GuildMember} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<GuildMember "${value.displayName || "unknown"}">`;
    }
}

/** @type {NewPlugin} */
export class TextChannelPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof TextChannel;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {TextChannel} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<TextChannel "${value.name || "unknown"}">`;
    }
}

/** @type {NewPlugin} */
export class DMChannelPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof DMChannel;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {DMChannel} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<DMChannel "${value.recipient.username || "unknown"}">`;
    }
}

/** @type {NewPlugin} */
export class DurationPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return Duration.isDuration(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Duration} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        const format = Math.floor(value.as('days')) !== 0 ? 'd hh:mm:ss' : 'hh:mm:ss';
        const timeString = value.toFormat(format);
        return `<Duration ${timeString}>`;
    }
}

/** @type {NewPlugin} */
export class TimeoutPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value?.constructor?.name === "Timeout";
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {NodeJS.Timeout} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        // @ts-ignore
        return `<Timeout ${value._idleTimeout}ms>`;
    }
}

/** @type {NewPlugin} */
export class TimerPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Timer;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Timer} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<Timer ${value.timerDuration}ms>`;
    }
}

/** @type {NewPlugin} */
export class GesturePlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Gesture;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Gesture} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<Gesture "${value.id}">`;
    }
}

/** @type {NewPlugin} */
export class BotContextPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof BotContext;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {BotContext} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return `<BotContext>`;
    }
}

/** @type {NewPlugin} */
export class DescriptionPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Description;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Description} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        return value.text.length !== 0 ? `<Description>${value.text}</Description>` : "<Description empty/>";
    }
}

/** @type {NewPlugin} */
export class StatusPlugin {
    /**
     * Set of objects currently being processed by the StatusPlugin to prevent recursion errors.
     * @type {Set<Status>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Status && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Status} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            if (value.remaining !== null) {
                const format = Math.floor(value.remaining.as('days')) !== 0 ? 'd hh:mm:ss' : 'hh:mm:ss';
                const timeString = value.remaining.toFormat(format);
                return `<Status "${value.id}" inflicted with ${timeString} remaining>`;
            } else if (value.duration !== null) {
                const format = Math.floor(value.duration.as('days')) !== 0 ? 'd hh:mm:ss' : 'hh:mm:ss';
                const timeString = value.duration.toFormat(format);
                return `<Status "${value.id}" lasting for ${timeString}>`;
            }  else return `<Status "${value.id}">`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class PuzzlePlugin {
    /**
     * Set of objects currently being processed by the PuzzlePlugin to prevent recursion errors.
     * @type {Set<Puzzle>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Puzzle && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Puzzle} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            return `<Puzzle "${value.name}" in ${value.location.id}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class PrefabPlugin {
    /**
     * Set of objects currently being processed by the PrefabPlugin to prevent recursion errors.
     * @type {Set<Prefab>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Prefab && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Prefab} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            return `<Prefab "${value.id}">`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class FixturePlugin {
    /**
     * Set of objects currently being processed by the FixturePlugin to prevent recursion errors.
     * @type {Set<Fixture>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Fixture && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Fixture} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            return `<Fixture "${value.name}" in room ${value.location.id}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class InventorySlotPlugin {
    /**
     * Set of objects currently being processed by the InventorySlotPlugin to prevent recursion errors.
     * @type {Set<InventorySlot>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 4) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof InventorySlot && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {InventorySlot<ItemInstance>} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            let containing = value.items.length !== 0 ? ` containing ${value.items.map((item) => item.prefab.id).join(", ")}` : "";
            return `<InventorySlot "${value.id}${containing}">`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class RoomItemPlugin {
    /**
     * Set of objects currently being processed by the RoomItemPlugin to prevent recursion errors.
     * @type {Set<RoomItem>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof RoomItem && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {RoomItem} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            let container = "";
            if (value.container) {
                if (value.container instanceof RoomItem) {
                    container = ` inside RoomItem ${value.container.getIdentifier()}`;
                } else if (value.container instanceof Fixture) {
                    container = ` inside Fixture ${value.container.name}`;
                } else if (value.container instanceof Puzzle) {
                    container = ` inside Puzzle ${value.container.name}`;
                } else {
                    container = " inside ???";
                }
            }
            return `<RoomItem of prefab "${value.getIdentifier()}"${container} in room ${value.location.id}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class InventoryItemPlugin {
    /**
     * Set of objects currently being processed by the InventoryItemPlugin to prevent recursion errors.
     * @type {Set<InventoryItem>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof InventoryItem && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {InventoryItem} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            let container = "";
            if (value.container) {
                if (value.container instanceof InventoryItem) {
                    container = ` inside InventoryItem ${value.container.getIdentifier()}`;
                } else {
                    container = " inside ???";
                }
            }
            return `<InventoryItem of prefab "${value.getIdentifier()}"${container} on player ${value.player.name}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class RoomPlugin {
    /**
     * Set of objects currently being processed by the RoomPlugin to prevent recursion errors.
     * @type {Set<Room>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Room && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Room} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            let occupants = value.occupants.length
                ? ` occupied by ${value.occupants.map((player) => player.name).join(", ")}`
                : "";
            return `<Room ${value.id}${occupants}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class PlayerPlugin {
    /**
     * Set of objects currently being processed by the PlayerPlugin to prevent recursion errors.
     * @type {Set<Player>}
     */
    processing;

    /**
     * Depth after which to truncate objects.
     * @type {number}
     */
    level;

    /**
     * @constructor
     * @param {number} [level] Depth after which to truncate objects
     */
    constructor(level = 2) {
        this.processing = new Set();
        this.level = level;
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Player && !this.processing.has(value);
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Player} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (depth > this.level || this.processing.size > 1) {
            return `<Player ${value.name}>`;
        } else {
            this.processing.add(value);
            let serialized = printer(value, config, indentation, depth, refs);
            this.processing.delete(value);
            return serialized;
        }
    }
}

/** @type {NewPlugin} */
export class CollectionPlugin {
    /**
     * Set of objects currently being processed by the CollectionPlugin to prevent recursion errors.
     * @type {Set<Collection>}
     */
    processing;

    /** @constructor */
    constructor() {
        this.processing = new Set();
    }

    /** @type {NewPlugin["test"]} */
    test(value) {
        return value instanceof Collection;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Collection} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        if (this.processing.has(value)) return `[Circular]`;
        this.processing.add(value);
        let map = new Map();
        for (const [key, val] of value) {
            map.set(key, val);
        }
        let serialized = printer(map, config, indentation, depth, refs);
        this.processing.delete(value);
        return serialized;
    }
}

const plugins = [
    new GuildPlugin(),
    new GuildMemberPlugin(),
    new TextChannelPlugin(),
    new DMChannelPlugin(),
    new DurationPlugin(),
    new TimeoutPlugin(),
    new TimerPlugin(),
    new GesturePlugin(),
    new BotContextPlugin(),
    new DescriptionPlugin(),
    new StatusPlugin(),
    new PuzzlePlugin(),
    new PrefabPlugin(),
    new FixturePlugin(),
    new InventorySlotPlugin(),
    new RoomItemPlugin(),
    new InventoryItemPlugin(),
    new RoomPlugin(),
    new PlayerPlugin(),
    new CollectionPlugin(),
];

const truncate = new Set(["game", "guild", "member", "channel", "spectateChannel", "timer"])

/**
 * Returns a copy of the object to display in console.log with certain properties excluded.
 * @param {any} object - The object to display.
 * @param {number} level - Level of recursion, for internal use only.
 */
const prettyObject = (object, level = 0) => {
    if (level >= 3) return object;
    if (object === null || object === undefined) return object;
    const clone = Object.create(Object.getPrototypeOf(object));
    for (const key of Object.keys(object)) {
        if (truncate.has(key)) {
            clone[key] = `<Truncated>`;
        } else {
            if (object[key] && typeof object[key] === "object") {
                if (object[key] instanceof Array) {
                    clone[key] = object[key].map((value) => prettyObject(value, level + 1));
                } else if (object[key] instanceof Collection) {
                    clone[key] = new Collection();
                    for (const [k, v] of object[key]) {
                        clone[key].set(k, prettyObject(v, level + 1));
                    }
                } else if (object[key] instanceof Map) {
                    clone[key] = new Map();
                    for (const [k, v] of object[key]) {
                        clone[key].set(k, prettyObject(v, level + 1));
                    }
                } else clone[key] = prettyObject(object[key], level + 1);
            } else clone[key] = object[key];
        }
    }
    return clone;
}

export class PolyPlugin {
    /** @type {NewPlugin["test"]} */
    test(value) {
        const processed = prettyObject(value);
        for (const plugin of plugins) {
            if (plugin.test(processed)) return true;
        }
        return false;
    }

    /**
     * @type {NewPlugin["serialize"]}
     * @param {Collection} value
     */
    serialize(value, config, indentation, depth, refs, printer) {
        const processed = prettyObject(value);
        for (const plugin of plugins) {
            if (plugin.test(processed)) {
                return plugin.serialize(processed, config, indentation, depth, refs, printer);
            }
        }
        return "";
    }
}

export default class PrettyPrinter {
    /**
     * Game filtering plugins for prettyString
     * @type {NewPlugin[]}
     */
    gameFilterPlugins;

    /**
     * Properties truncated by prettyObject
     * @type {Set<string>}
     */
    truncateProperties;

    constructor() {
        this.gameFilterPlugins = plugins;
        this.truncateProperties = truncate;
        this.prettyObject = prettyObject;
    }

    /**
     * Returns a pretty string representation of the given object with unneeded data filtered out.
     * @param {any} object - The object to display.
     */
    prettyString(object) {
        return format(object, {
            plugins: [...this.gameFilterPlugins],
            indent: 4,
        });
    }
}
