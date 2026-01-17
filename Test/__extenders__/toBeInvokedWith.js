const truncateProperties = new Set(["game", "guild", "member", "channel", "spectateChannel", "timer"]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isBasic(value) {
    return (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "undefined" ||
        typeof value === "symbol" ||
        typeof value === "bigint"
    );
}

/**
 * @param {any} object
 * @param {number} level
 */
function prettyObject(object, level = 0) {
    if (level >= 2) return `<Truncated [Depth]>`;
    else if (isBasic(object)) return object;
    const clone = Object.create(Object.getPrototypeOf(object));
    if (Array.isArray(object)) {
        for (const item of object) {
            clone.push(prettyObject(item, level + 1));
        }
    } else
        for (const key of Object.keys(object)) {
            if (truncateProperties.has(key)) {
                clone[key] = `<Truncated [Filtered]>`;
            } else {
                if (object[key] && typeof object[key] === "object") {
                    if (object[key] instanceof Array) {
                        clone[key] = object[key].map((value) => prettyObject(value, level + 1));
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

/**
 * @param {unknown} obj
 * @returns {obj is import("vitest").Mock}
 */
function isMock(obj) {
    return typeof obj === "function" && "_isMockFunction" in obj && obj._isMockFunction === true;
}

/**
 * @template {any} A
 * @param {unknown} obj
 * @returns {obj is {asymmetricMatch: (A) => boolean}}
 */
function isAsymmetric(obj) {
    // @ts-ignore
    return obj && typeof obj === "object" && typeof obj?.asymmetricMatch === "function";
}

/**
 * @param {unknown} actual
 * @param {unknown} expected
 * @returns {boolean}
 */
function deepEqual(actual, expected) {
    if (isAsymmetric(expected)) {
        try {
            return expected.asymmetricMatch(actual);
        } catch {
            return false;
        }
    } else
        try {
            assert.deepEqual(actual, expected);
        } catch {
            return false;
        }
    return true;
}

/**
 * @param {unknown[]} actual
 * @param {unknown[]} expected
 * @returns {number}
 */
function getFirstMismatchIndex(actual, expected) {
    if (actual.length !== expected.length) {
        return -1;
    }
    for (let i = 0; i < actual.length; i++) {
        if (!deepEqual(actual[i], expected[i])) {
            return i;
        }
    }
    return -2;
}

/**
 * @template {any[]} E
 * @param {unknown} received
 * @param {...E} args
 */
export default function toBeInvokedWith(received, ...args) {
    if (isMock(received)) {
        if (received.mock.calls.length === 0) {
            return { pass: false, message: () => `Mock was never called` };
        }
        let firstMismatchedIndex = -2;
        let firstExpected;
        let firstActual;
        for (const callArgs of received.mock.calls) {
            const mismatchIndex = getFirstMismatchIndex(callArgs, args);
            if (mismatchIndex === -2) {
                return { pass: true, message: () => `Arguments meet expectations` };
            }
            if (firstMismatchedIndex === -2) {
                if (mismatchIndex === -1) {
                    firstExpected = args;
                    firstActual = callArgs;
                } else {
                    firstExpected = args[mismatchIndex];
                    firstActual = callArgs[mismatchIndex];
                }
                firstMismatchedIndex = mismatchIndex;
            }
        }
        return {
            pass: false,
            message: () =>
                firstMismatchedIndex > -1
                    ? `Arguments differ from expected on index ${firstMismatchedIndex}`
                    : `Expected arguments array was of incorrect size`,
            actual: prettyObject(firstActual),
            expected: prettyObject(firstExpected),
        };
    } else {
        return {
            pass: false,
            message: () => `Expected a vi.fn() mock, received ${typeof received}`,
        };
    }
}
