/**
 * @import { Message } from "discord.js"
 */

/**
 * @param {Message} actual
 */
export default (actual) => {
    if (!('webhookId' in actual))
        throw new TypeError('This must be a message!');

    const pass = actual.webhookId !== null && actual.webhookId !== undefined && typeof actual.webhookId === 'string';
    if (pass) {
        return {
            message: () => `expected ${actual} not to be a webhook message`,
            pass: true,
        };
    } else {
        return {
            message: () => `expected ${actual} to be a webhook message`,
            pass: false,
        };
    }
};
