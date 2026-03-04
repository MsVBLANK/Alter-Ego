export default (actual, size) => {
    if (!('size' in actual))
        throw new TypeError('This must have size attribute!');
    if (typeof actual.size !== 'number' || typeof size !== 'number')
        throw new TypeError('These must be of type number!');

    const pass = actual.size === size;
    if (pass) {
        return {
            message: () => `expected object not to have size ${size}, but received ${actual.size}`,
            pass: true,
        };
    } else {
        return {
            message: () => `expected object to have size ${size}, but received ${actual.size}`,
            pass: false,
        };
    }
};
