/*
 * ADL.Storage is a Javascript object that enables a client 
 * to save xAPI statements to localStorage and get those 
 * statements back at a later time. 
 *
 * As stated this implementation relies on the browser's 
 * localStorage. Also this implementation does not organize 
 * by user, and groups all statements under an ADL.Storage key.
 *
 * One final note about this implementation, it adds timestamps 
 * to statements, if not already present, during the save process. 
 */
(function (ADL) {
    'use strict';
    
    if ( !Date.prototype.toISOString ) {
      ( function() {

        function pad(number) {
          var r = String(number);
          if ( r.length === 1 ) {
            r = '0' + r;
          }
          return r;
        }

        Date.prototype.toISOString = function() {
          return this.getUTCFullYear()
            + '-' + pad( this.getUTCMonth() + 1 )
            + '-' + pad( this.getUTCDate() )
            + 'T' + pad( this.getUTCHours() )
            + ':' + pad( this.getUTCMinutes() )
            + ':' + pad( this.getUTCSeconds() )
            + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
            + 'Z';
        };

      }() );
    }
    
    if (typeof Array.isArray === 'undefined') {
        Array.isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };
    
    // http://codepen.io/gabrieleromanato/pen/Jgoab/
    function IDGenerator () {
        this.length = 8;
        this.timestamp = +new Date;
    }
    
    IDGenerator.prototype._getRandomInt = function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    };

    IDGenerator.prototype.generate = function() {
        var ts = this.timestamp.toString();
        var parts = ts.split( "" ).reverse();
        var id = "";

        for( var i = 0; i < this.length; ++i ) {
            var index = this._getRandomInt( 0, parts.length - 1 );
            id += parts[index];	 
        }

        return id;
    };

    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {

            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    function StorageNotDefined(message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageNotDefined.prototype = Object.create(Error.prototype);
    StorageNotDefined.prototype.name = "StorageNotDefined";

    function StorageAtLimit(message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageAtLimit.prototype = Object.create(Error.prototype);
    StorageAtLimit.prototype.name = "StorageAtLimit";

    var sizekey = 'size',
        maxsize = 4750000,
        storagens = 'ADL.Storage',
        queuekey = 'keys',
        offsetkey = 'offset',
        stmtkey = 'stmts',
        metakey = 'meta';

    /*
     * Constructor Storage
     * @throws {ADL.StorageNotDefined} if localstorage cannot be accessed
     */
    function Storage() {
        if (!storageExists()) throw new StorageNotDefined("local storage is not available");
        
        if (!getADLStorage()) {
            initStorage();
        }
    }

    /*
     * Stores the statements.
     * @
     */
    Storage.prototype.saveStatements = function (stmts) {
        if (!hasSpace()) throw new StorageAtLimit("local storage is full");
        if (!stmts) return;
        var key = (new IDGenerator()).generate();
        
        stmts = addTimestamp(stmts);
        
        var val = JSON.stringify(stmts);
        var ls = getADLStorage();
        setItem(ls, key, val);
        addKey(ls, key);
        updateSize(ls, val.length);
        setADLStorage(ls);
        return key;
    };

    Storage.prototype.getStatements = function (reqkey) {
        var key = reqkey || getKey();
        if (!key) return;
        var ls = getADLStorage();
        var val = getItem(ls, key);
        removeItem(ls, key);
        removeKey(ls, reqkey);
        updateSize(ls, -1 * val.length);
        setADLStorage(ls);
        return JSON.parse(val);
    };

    Storage.prototype.hasStatements = function () {
        var ls = getADLStorage();
        return (new Queue(JSON.parse(ls[metakey][queuekey]),
                         JSON.parse(ls[metakey][offsetkey]))).getLength() > 0;
    };

    Storage.prototype.clear = function () {
        initStorage();
    };

    Storage.prototype.isStorageAvailable = function () {
        return storageExists() && hasSpace();
    };

    Storage.prototype.getStorageSize = function () {
        return maxsize;
    };

    Storage.prototype.getStorageUsed = function () {
        return parseInt(getADLStorage()[metakey][sizekey]);
    };

    Storage.prototype.getStorageAvailable = function () {
        return maxsize - this.getStorageUsed();
    };
    
    var addTimestamp = function(stmts) {
        var wasstring = (typeof stmts === "string");
        if (wasstring) {
            // make obj
            stmts = JSON.parse(stmts);
        }
        
        if (Array.isArray(stmts)) {
            for (var idx in stmts) {
                if (! stmts[idx].hasOwnProperty('timestamp')){
                    stmts[idx].timestamp = (new Date()).toISOString();
                }
            }
        } else if (typeof stmts === "object") {
            if (! stmts.hasOwnProperty('timestamp')) {
                stmts.timestamp = (new Date()).toISOString();
            }
        }
        
        if (wasstring) {
            stmts = JSON.stringify(stmts);
        }
            
        return stmts;
    };
    
    var initStorage = function () {
        var sto = {};
        sto[stmtkey] = {};
        sto[metakey] = {};
        sto[metakey][queuekey] = JSON.stringify([]);
        sto[metakey][offsetkey] = 0;
        sto[metakey][sizekey] = JSON.stringify(localStorage).length * 2;
        setADLStorage(sto);
    };
    
    var getADLStorage = function () {
        var ls = localStorage.getItem(storagens);
        return ls && JSON.parse(ls);
    };
    
    var setADLStorage = function (ls) {
        localStorage.setItem(storagens, JSON.stringify(ls));
    };
    
    var setItem = function (ls, key, obj) {
        ls[stmtkey][key] = obj;
        return ls;
    };
    
    var getItem = function (ls, key) {
        return ls[stmtkey][key];
    };
    
    var removeItem = function (ls, key) {
        delete ls[stmtkey][key];
        return ls;
    };

    var addKey = function (ls, key) {
        var q = new Queue(JSON.parse(ls[metakey][queuekey]),
                         JSON.parse(ls[metakey][offsetkey]));
        q.enqueue(key);
        ls[metakey][queuekey] = q.serialize();
        return ls;
    };

    var removeKey = function (ls, splice) {
        var q = new Queue(JSON.parse(ls[metakey][queuekey]),
                         JSON.parse(ls[metakey][offsetkey]));
        
        if (splice) {
            q.removeItem(splice);
        } else {
            q.dequeue();
        }
        ls[metakey][queuekey] = q.serialize();
        ls[metakey][offsetkey] = q.offset;
        return ls;
    };

    var getKey = function () {
        var ls = getADLStorage();
        return (new Queue(JSON.parse(ls[metakey][queuekey]),
                         JSON.parse(ls[metakey][offsetkey]))).peek();
    };

    var updateSize = function (ls, change) {
        ls[metakey][sizekey] = parseInt(ls[metakey][sizekey]) + (change * 2);
        return ls;
    };

    var storageExists = function () {
        try {
            var storage = window.localStorage,
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.key(1);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return false;
        }
    };

    var remainingSpace = function () {
        if (localStorage.remainingSpace) return localStorage.remainingSpace;
        return maxsize - parseInt(getADLStorage()[metakey][sizekey]);
    };

    var hasSpace = function (size) {
        return parseInt(getADLStorage()[metakey][sizekey]) < maxsize;
    };

    /*

    Queue.js

    A function to represent a queue

    Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
    the terms of the CC0 1.0 Universal legal code:

    http://creativecommons.org/publicdomain/zero/1.0/legalcode
    
    modified by ADL for use in the xAPIWrapper project
    */

    /* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
     * items are added to the end of the queue and removed from the front.
     */
    function Queue(q, offset) {

        // initialise the queue and offset
        this.queue = q || [];
        this.offset = offset || 0;
    }

    // Returns the length of the queue.
    Queue.prototype.getLength = function () {
        return (this.queue.length - this.offset);
    };

    // Returns true if the queue is empty, and false otherwise.
    Queue.prototype.isEmpty = function () {
        return (this.queue.length == 0);
    };

    Queue.prototype.removeItem = function (item) {
        return !!this.queue.splice(this.queue.indexOf(item), 1);
    };

    /* Enqueues the specified item. The parameter is:
     *
     * item - the item to enqueue
     */
    Queue.prototype.enqueue = function (item) {
        this.queue.push(item);
    };

    /* Dequeues an item and returns it. If the queue is empty, the value
     * 'undefined' is returned.
     */
    Queue.prototype.dequeue = function () {

        // if the queue is empty, return immediately
        if (this.queue.length == 0) return undefined;

        // store the item at the front of the queue
        var item = this.queue[this.offset];

        // increment the offset and remove the free space if necessary
        if (++this.offset * 2 >= this.queue.length) {
            this.queue = this.queue.slice(this.offset);
            this.offset = 0;
        }

        // return the dequeued item
        return item;

    };

    /* Returns the item at the front of the queue (without dequeuing it). If the
     * queue is empty then undefined is returned.
     */
    Queue.prototype.peek = function () {
        return (this.queue.length > 0 ? this.queue[this.offset] : undefined);
    };

    Queue.prototype.serialize = function () {
        return JSON.stringify(this.queue);
    };

    ADL.Storage = Storage;
    ADL.Storage.StorageNotDefined = StorageNotDefined;
    ADL.Storage.StorageAtLimit = StorageAtLimit;
}(window.ADL = window.ADL || {}));

//
//
//Storage.prototype.setObject = function(key, value) {
//    this.setItem(key, JSON.stringify(value));
//}
//
//Storage.prototype.getObject = function(key) {
//    var value = this.getItem(key);
//    return value && JSON.parse(value);
//}