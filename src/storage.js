(function (ADL) {
    'use strict';

    //shim: https://github.com/wojodesign/local-storage-js/blob/master/storage.js
    if (!Date.now) {
        Date.now = function () { return new Date().getTime(); };
    }
    
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
    
    function StorageNotDefined (message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageNotDefined.prototype = Object.create(Error.prototype);
    StorageNotDefined.prototype.name = "StorageNotDefined";
    
    function StorageAtLimit (message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageAtLimit.prototype = Object.create(Error.prototype);
    StorageAtLimit.prototype.name = "StorageAtLimit";
    
    var sizekey = 'size',
        maxsize = 4750000, 
        keyprefix = 'ADL.Storage.',
        queuekey = 'keys';
            
    function Storage () {
        if (! storageExists()) throw new StorageNotDefined("local storage is not available");
        
        localStorage.setItem(sizekey, (JSON.stringify(localStorage).length * 2));
        localStorage.setItem(queuekey, localStorage.getItem(queuekey) || JSON.stringify([]));
    }
    
    //update to use queue for keys
    //, add keys queueu to local storage
    //, save statements - generate key, add to keys, put in localstorage, update size
    //, get statements - look for key [ remove from keys ], update size, serialize and save back to localstor, return val
    //, has statements - check the length of keys
    //, clear - create new keys ququeueur
    //, change Q to load and serialize the internal array
    

    Storage.prototype.saveStatements = function (stmts) {
        if (! hasSpace(localStorage.getItem(sizekey))) throw new StorageAtLimit("local storage is full");
        if (!stmts) return;
        var key = keyprefix + Date.now();
        var val = JSON.stringify(stmts);
        localStorage.setItem(key, val);
        addKey(key);
        updateSize(val.length);
        return key;
    };
    
    Storage.prototype.getStatements = function (reqkey) {
        var key = reqkey || getKey();
        if (!key) return;
        var val = localStorage.getItem(key);
        localStorage.removeItem(key);
        removeKey(key, reqkey);
        updateSize(-1 * val.length);
        return JSON.parse(val);
    };
    
    Storage.prototype.hasStatements = function () {
        return (JSON.parse(localStorage.getItem(queuekey))).length > 0;
    };
    
    Storage.prototype.clear = function () {
        localStorage.clear();
        localStorage.setItem('size', remainingSpace());
        localStorage.setItem(queuekey, JSON.stringify([]));
    };
    
    Storage.prototype.isStorageAvailable = function () {
        return storageExists() && hasSpace(localStorage.getItem(sizekey));
    };
    
    Storage.prototype.getStorageSize = function () {
        return maxsize;
    };
    
    Storage.prototype.getStorageUsed = function () {
        return parseInt(localStorage.getItem(sizekey));
    };
    
    Storage.prototype.getStorageAvailable = function () {
        return maxsize - this.getStorageUsed();
    };
    
    var addKey = function (key) {
        var q = new Queue(JSON.parse(localStorage.getItem(queuekey)));
        q.enqueue(key);
        localStorage.setItem(queuekey, q.serialize());
    };
    
    var removeKey = function (key, splice) {
        var q = new Queue(JSON.parse(localStorage.getItem(queuekey)));
        if (splice) {
            q.removeItem(key);
        } else {
            q.dequeue(key);
        }
        localStorage.setItem(queuekey, q.serialize());
    };
    
    var getKey = function () {
        return (new Queue(JSON.parse(localStorage.getItem(queuekey)))).dequeue();
    };
    
    var updateSize = function (change) {
        localStorage.setItem(sizekey, localStorage.getItem(sizekey) + (change * 2));    
    };
                
    var storageExists = function () {
        try {
            var storage = window.localStorage,
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.key(1);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    };

    var remainingSpace = function () {
        if (localStorage.remainingSpace) return localStorage.remainingSpace;
        return maxsize - parseInt(localStorage.getItem(sizekey));
    };
        
    var hasSpace = function (size) {
        return parseInt(size) < maxsize;
    };
    
    /*

    Queue.js

    A function to represent a queue

    Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
    the terms of the CC0 1.0 Universal legal code:

    http://creativecommons.org/publicdomain/zero/1.0/legalcode

    */

    /* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
     * items are added to the end of the queue and removed from the front.
     */
    function Queue(q){

      // initialise the queue and offset
      var queue  = q || [];
      var offset = 0;

      // Returns the length of the queue.
      this.getLength = function(){
        return (queue.length - offset);
      }

      // Returns true if the queue is empty, and false otherwise.
      this.isEmpty = function(){
        return (queue.length == 0);
      }
      
      this.removeItem = function(item){
        return !! queue.splice(queue.indexOf(item), 1);
      }

      /* Enqueues the specified item. The parameter is:
       *
       * item - the item to enqueue
       */
      this.enqueue = function(item){
        queue.push(item);
      }

      /* Dequeues an item and returns it. If the queue is empty, the value
       * 'undefined' is returned.
       */
      this.dequeue = function(){

        // if the queue is empty, return immediately
        if (queue.length == 0) return undefined;

        // store the item at the front of the queue
        var item = queue[offset];

        // increment the offset and remove the free space if necessary
        if (++ offset * 2 >= queue.length){
          queue  = queue.slice(offset);
          offset = 0;
        }

        // return the dequeued item
        return item;

      }

      /* Returns the item at the front of the queue (without dequeuing it). If the
       * queue is empty then undefined is returned.
       */
      this.peek = function(){
        return (queue.length > 0 ? queue[offset] : undefined);
      }
      
      this.serialize = function() {
          return JSON.stringify(queue);
      }

    }
    
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
