/* IE8 Compatible assertion library */
/* global define */
(function (root) {
    'use strict';

    var assert = ok;


    // Assertions as outlined in
    // http://wiki.commonjs.org/wiki/Unit_Testing/1.0#Assert
    // -----------------------------------------------------

    // Assert that a value is truthy
    function ok (val, msg) {
        if (!!!val) {
            fail(val, true, msg, '==');
        }
    }
    assert.ok = ok;

    // Assert that two values are equal
    assert.equal = function (actual, expected, msg) {
        /* jshint eqeqeq: false */
        if (actual != expected) {
            fail(actual, expected, msg, '==');
        }
    };

    // Assert that two values are not equal
    assert.notEqual = function (actual, expected, msg) {
        /* jshint eqeqeq: false */
        if (actual == expected) {
            fail(actual, expected, msg, '!=');
        }
    };

    // Assert that two values are equal with strict comparison
    assert.strictEqual = function (actual, expected, msg) {
        if (actual !== expected) {
            fail(actual, expected, msg, '===');
        }
    };

    // Assert that two values are not equal with strict comparison
    assert.notStrictEqual = function (actual, expected, msg) {
        if (actual === expected) {
            fail(actual, expected, msg, '!==');
        }
    };

    // Assert that two values are deeply equal
    assert.deepEqual = function (actual, expected, msg) {
        if (!isDeepEqual(actual, expected)) {
            fail(actual, expected, msg, 'deepEqual');
        }
    };

    // Assert that two values are not deeply equal
    assert.notDeepEqual = function (actual, expected, msg) {
        if (isDeepEqual(actual, expected)) {
            fail(actual, expected, msg, '!deepEqual');
        }
    };

    // Assert that a function throws an error
    assert.throws = function (fn, expected, msg) {
        if (!functionThrows(fn, expected)) {
            fail(fn, expected, msg, 'throws');
        }
    };


    // Additional assertions
    // ---------------------

    // Assert that a value is falsy
    assert.notOk = function (val, msg) {
        if (!!val) {
            fail(val, true, msg, '!=');
        }
    };

    // Assert that a function does not throw an error
    assert.doesNotThrow = function (fn, expected, msg) {
        if (functionThrows(fn, expected)) {
            fail(fn, expected, msg, '!throws');
        }
    };

    // Assert that a value is a specific type
    assert.isTypeOf = function (val, type, msg) {
        assert.strictEqual(typeof val, type, msg);
    };

    // Assert that a value is not a specific type
    assert.isNotTypeOf = function (val, type, msg) {
        assert.notStrictEqual(typeof val, type, msg);
    };

    // Assert that a value is an instance of a constructor
    assert.isInstanceOf = function (val, constructor, msg) {
        if (!(val instanceof constructor)) {
            fail(val, constructor, msg, 'instanceof');
        }
    };

    // Assert that a value not an instance of a constructor
    assert.isNotInstanceOf = function (val, constructor, msg) {
        if (val instanceof constructor) {
            fail(val, constructor, msg, '!instanceof');
        }
    };

    // Assert that a value is an array
    assert.isArray = function (val, msg) {
        if (!isArray(val)) {
            fail(typeof val, 'array', msg, '===');
        }
    };

    // Assert that a value is not an array
    assert.isNotArray = function (val, msg) {
        if (isArray(val)) {
            fail(typeof val, 'array', msg, '!==');
        }
    };

    // Assert that a value is a boolean
    assert.isBoolean = function (val, msg) {
        assert.isTypeOf(val, 'boolean', msg);
    };

    // Assert that a value is not a boolean
    assert.isNotBoolean = function (val, msg) {
        assert.isNotTypeOf(val, 'boolean', msg);
    };

    // Assert that a value is true
    assert.isTrue = function (val, msg) {
        assert.strictEqual(val, true, msg);
    };

    // Assert that a value is false
    assert.isFalse = function (val, msg) {
        assert.strictEqual(val, false, msg);
    };

    // Assert that a value is a function
    assert.isFunction = function (val, msg) {
        assert.isTypeOf(val, 'function', msg);
    };

    // Assert that a value is not a function
    assert.isNotFunction = function (val, msg) {
        assert.isNotTypeOf(val, 'function', msg);
    };

    // Assert that a value is null
    assert.isNull = function (val, msg) {
        assert.strictEqual(val, null, msg);
    };

    // Assert that a value is not null
    assert.isNotNull = function (val, msg) {
        assert.notStrictEqual(val, null, msg);
    };

    // Assert that a value is a number
    assert.isNumber = function (val, msg) {
        assert.isTypeOf(val, 'number', msg);
    };

    // Assert that a value is not a number
    assert.isNotNumber = function (val, msg) {
        assert.isNotTypeOf(val, 'number', msg);
    };

    // Assert that a value is an object
    assert.isObject = function (val, msg) {
        assert.isTypeOf(val, 'object', msg);
    };

    // Assert that a value is not an object
    assert.isNotObject = function (val, msg) {
        assert.isNotTypeOf(val, 'object', msg);
    };

    // Assert that a value is a string
    assert.isString = function (val, msg) {
        assert.isTypeOf(val, 'string', msg);
    };

    // Assert that a value is not a string
    assert.isNotString = function (val, msg) {
        assert.isNotTypeOf(val, 'string', msg);
    };

    // Assert that a value is undefined
    assert.isUndefined = function (val, msg) {
        assert.isTypeOf(val, 'undefined', msg);
    };

    // Assert that a value is defined
    assert.isDefined = function (val, msg) {
        assert.isNotTypeOf(val, 'undefined', msg);
    };

    // Assert that a value matches a regular expression
    assert.match = function (actual, expected, msg) {
        if (!expected.test(actual)) {
            fail(actual, expected, msg, 'match');
        }
    };

    // Assert that a value does not match a regular expression
    assert.notMatch = function (actual, expected, msg) {
        if (expected.test(actual)) {
            fail(actual, expected, msg, '!match');
        }
    };

    // Assert that an object includes something
    assert.includes = function (haystack, needle, msg) {
        if (!includes(haystack, needle)) {
            fail(haystack, needle, msg, 'include');
        }
    };

    // Assert that an object does not include something
    assert.doesNotInclude = function (haystack, needle, msg) {
        if (includes(haystack, needle)) {
            fail(haystack, needle, msg, '!include');
        }
    };

    // Assert that an object (Array, String, etc.) has the expected length
    assert.lengthEquals = function (obj, expected, msg) {
        if (isUndefinedOrNull(obj)) {
            return fail(void 0, expected, msg, 'length');
        }
        if (obj.length !== expected) {
            fail(obj.length, expected, msg, 'length');
        }
    };

    // Assert that a value is less than another value
    assert.lessThan = function (actual, expected, msg) {
        if (actual >= expected) {
            fail(actual, expected, msg, '<');
        }
    };

    // Assert that a value is less than or equal to another value
    assert.lessThanOrEqual = function (actual, expected, msg) {
        if (actual > expected) {
            fail(actual, expected, msg, '<=');
        }
    };

    // Assert that a value is greater than another value
    assert.greaterThan = function (actual, expected, msg) {
        if (actual <= expected) {
            fail(actual, expected, msg, '>');
        }
    };

    // Assert that a value is greater than another value
    assert.greaterThanOrEqual = function (actual, expected, msg) {
        if (actual < expected) {
            fail(actual, expected, msg, '>=');
        }
    };


    // Error handling
    // --------------

    // Assertion error class
    function AssertionError (opts) {
        opts = opts || {};
        this.name = 'AssertionError';
        this.actual = opts.actual;
        this.expected = opts.expected;
        this.operator = opts.operator || '';
        this.message = opts.message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, opts.stackStartFunction || fail);
        }
    }
    AssertionError.prototype = (Object.create ? Object.create(Error.prototype) : new Error());
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.constructor = AssertionError;

    // Assertion error to string
    AssertionError.prototype.toString = function () {
        if (this.message) {
            return this.name + ': ' +this.message;
        } else {
            return this.name + ': ' +
                this.actual + ' ' +
                this.operator + ' ' +
                this.expected;
        }
    };

    // Fail a test
    function fail (actual, expected, message, operator, stackStartFunction) {
        throw new AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
            stackStartFunction: stackStartFunction
        });
    }

    // Expose error handling tools
    assert.AssertionError = AssertionError;
    assert.fail = fail;


    // Utilities
    // ---------

    // Utility for checking whether a value is undefined or null
    function isUndefinedOrNull (val) {
        return (val === null || typeof val === 'undefined');
    }

    // Utility for checking whether a value is an arguments object
    function isArgumentsObject (val) {
        return (Object.prototype.toString.call(val) === '[object Arguments]');
    }

    // Utility for checking whether a value is plain object
    function isPlainObject (val) {
        return Object.prototype.toString.call(val) === '[object Object]';
    }

    // Utility for checking whether an object contains another object
    function includes (haystack, needle) {
        /* jshint maxdepth: 3*/
        var i;

        // Array#indexOf, but ie...
        if (isArray(haystack)) {
            for (i = haystack.length - 1; i >= 0; i = i - 1) {
                if (haystack[i] === needle) {
                    return true;
                }
            }
        }

        // String#indexOf
        if (typeof haystack === 'string') {
            if (haystack.indexOf(needle) !== -1) {
                return true;
            }
        }

        // Object#hasOwnProperty
        if (isPlainObject(haystack)) {
            if (haystack.hasOwnProperty(needle)) {
                return true;
            }
        }

        return false;
    }

    // Utility for checking whether a value is an array
    var isArray = Array.isArray || function (val) {
        return (Object.prototype.toString.call(val) === '[object Array]');
    };

    // Utility for getting object keys
    function getObjectKeys (obj) {
        var key, keys = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    // Utility for deep equality testing of objects
    function objectsEqual (obj1, obj2) {
        /* jshint eqeqeq: false */

        // Check for undefined or null
        if (isUndefinedOrNull(obj1) || isUndefinedOrNull(obj2)) {
            return false;
        }

        // Object prototypes must be the same
        if (obj1.prototype !== obj2.prototype) {
            return false;
        }

        // Handle argument objects
        if (isArgumentsObject(obj1)) {
            if (!isArgumentsObject(obj2)) {
                return false;
            }
            obj1 = Array.prototype.slice.call(obj1);
            obj2 = Array.prototype.slice.call(obj2);
        }

        // Check number of own properties
        var obj1Keys = getObjectKeys(obj1);
        var obj2Keys = getObjectKeys(obj2);
        if (obj1Keys.length !== obj2Keys.length) {
            return false;
        }

        obj1Keys.sort();
        obj2Keys.sort();

        // Cheap initial key test (see https://github.com/joyent/node/blob/master/lib/assert.js)
        var key, i, len = obj1Keys.length;
        for (i = 0; i < len; i += 1) {
            if (obj1Keys[i] != obj2Keys[i]) {
                return false;
            }
        }

        // Expensive deep test
        for (i = 0; i < len; i += 1) {
            key = obj1Keys[i];
            if (!isDeepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        // If it got this far...
        return true;
    }

    // Utility for deep equality testing
    function isDeepEqual (actual, expected) {
        /* jshint eqeqeq: false */
        if (actual === expected) {
            return true;
        }
        if (expected instanceof Date && actual instanceof Date) {
            return actual.getTime() === expected.getTime();
        }
        if (actual instanceof RegExp && expected instanceof RegExp) {
            return (
                actual.source === expected.source &&
                actual.global === expected.global &&
                actual.multiline === expected.multiline &&
                actual.lastIndex === expected.lastIndex &&
                actual.ignoreCase === expected.ignoreCase
            );
        }
        if (typeof actual !== 'object' && typeof expected !== 'object') {
            return actual == expected;
        }
        return objectsEqual(actual, expected);
    }

    // Utility for testing whether a function throws an error
    function functionThrows (fn, expected) {

        // Try/catch
        var thrown = false;
        var thrownError;
        try {
            fn();
        } catch (err) {
            thrown = true;
            thrownError = err;
        }

        // Check error
        if (thrown && expected) {
            thrown = errorMatches(thrownError, expected);
        }

        return thrown;
    }

    // Utility for checking whether an error matches a given constructor, regexp or string
    function errorMatches (actual, expected) {
        if (typeof expected === 'string') {
            return actual.message === expected;
        }
        if (expected instanceof RegExp) {
            return expected.test(actual.message);
        }
        if (actual instanceof expected) {
            return true;
        }
        return false;
    }


    // Exports
    // -------

    // AMD
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return assert;
        });
    }
    // CommonJS
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = assert;
    }
    // Script tag
    else {
        root.assert = assert;
    }


} (this));
