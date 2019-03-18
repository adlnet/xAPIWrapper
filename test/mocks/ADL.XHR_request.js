(function(ADL){

    /*
     * Object.keys polyfill for IE8
     * From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
     * @private
     */
    var ObjectKeys = Object.keys || (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
            throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
            }

            if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
                }
            }
            }
            return result;
        };
    }());

    // Synchronous if callback is not provided (not recommended)
    /*
     * makes a request to a server (if possible, use functions provided in XAPIWrapper)
     * @param {string} lrs   the lrs connection info, such as endpoint, auth, etc
     * @param {string} url   the url of this request
     * @param {string} method   the http request method
     * @param {string} data   the payload
     * @param {string} auth   the value for the Authorization header
     * @param {function} callback   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     * @param {object} [callbackargs]   additional javascript object to be passed to the callback function
     * @param {boolean} ignore404    allow page not found errors to pass
     * @param {object} extraHeaders   other header key-values to be added to this request
     * @return {object} xhr response object
     */
    ADL.XHR_request = function(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders)
    {
        var arrstmts = [];

        var urlparts = url.split('/');
        var index = urlparts[urlparts.length - 1];

        var keys = ObjectKeys(ADL.stmts);
        var numstmts = keys.length;
        var cutoff = 4; //only send 4 statements at a time
        //index will either be zero or where to start with more statements
        if (index == "statements")
        {
            index = 0;
        }
        else
        {
            index = parseInt(index);
        }
        //if doling out our ususal size block of statments would exceed the //amount of statements that we have, then adjust the cutoff
        //and send out what's left
        if (cutoff > (numstmts - index))
        {
            cutoff = numstmts - index;
        }
        //make a mini array of the keys we want to return
        var thesekeys = keys.slice(index, index + cutoff);

        for (var k in thesekeys)
        {
            if (thesekeys.hasOwnProperty(k))
                arrstmts.push(ADL.stmts[thesekeys[k]]);
        }
        //assume there's no more statements, if there are more,
        //then return the next index number
        var morestmts = "";
        if ((index + cutoff) < numstmts)
        {
            morestmts = "/" + (index + cutoff);
        }
        //make a response object, and make that a string
        var response = {
            statements: arrstmts,
            more: morestmts};
        response = JSON.stringify(response);

        callback({response:response});
    };

})(typeof window !== "undefined" ? window.ADL = window.ADL || {} : typeof global !== "undefined" ? global.ADL = global.ADL || {} : this);
