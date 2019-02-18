/*! xAPIWrapper v 1.10.1 | Built on 2019-02-18 15:35:55+0000 */
(function(root, factory){
    // text-encoder uses module.exports which isn't allowed inside
    // the main closure as it breaks the module export in node
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], function (exports) {
            return factory({}, root, root);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = factory({}, root, root);
    } else {
        // Browser roots
        root.ADL = factory({}, root, root);
    }
}(typeof self !== 'undefined' ? self : this, function (module, window, root) {var ADL = {};
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = (CryptoJS = CryptoJS || function(Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {}, C_lib = C.lib = {}, Base = C_lib.Base = function() {
        function F() {}
        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();
                // Augment
                                return overrides && subtype.mixIn(overrides), 
                // Create default initializer
                subtype.hasOwnProperty("init") || (subtype.init = function() {
                    subtype.$super.init.apply(this, arguments);
                }), 
                // Reference supertype
                (
                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype).$super = this, subtype;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
                var instance = this.extend();
                return instance.init.apply(instance, arguments), instance;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {},
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(properties) {
                for (var propertyName in properties) properties.hasOwnProperty(propertyName) && (this[propertyName] = properties[propertyName]);
                // IE won't copy toString using the loop above
                                properties.hasOwnProperty("toString") && (this.toString = properties.toString);
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
                return this.init.prototype.extend(this);
            }
        };
    }(), WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function(words, sigBytes) {
            words = this.words = words || [], this.sigBytes = null != sigBytes ? sigBytes : 4 * words.length;
        },
        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function(encoder) {
            return (encoder || Hex).stringify(this);
        },
        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function(wordArray) {
            // Shortcuts
            var thisWords = this.words, thatWords = wordArray.words, thisSigBytes = this.sigBytes, thatSigBytes = wordArray.sigBytes;
            // Concat
            if (
            // Clamp excess bits
            this.clamp(), thisSigBytes % 4) 
            // Copy one byte at a time
            for (var i = 0; i < thatSigBytes; i++) {
                var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
            } else if (65535 < thatWords.length) 
            // Copy one word at a time
            for (i = 0; i < thatSigBytes; i += 4) thisWords[thisSigBytes + i >>> 2] = thatWords[i >>> 2]; else 
            // Copy all words at once
            thisWords.push.apply(thisWords, thatWords);
            // Chainable
            return this.sigBytes += thatSigBytes, this;
        },
        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function() {
            // Shortcuts
            var words = this.words, sigBytes = this.sigBytes;
            // Clamp
            words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8, words.length = Math.ceil(sigBytes / 4);
        },
        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function() {
            var clone = Base.clone.call(this);
            return clone.words = this.words.slice(0), clone;
        },
        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function(nBytes) {
            for (var words = [], i = 0; i < nBytes; i += 4) words.push(4294967296 * Math.random() | 0);
            return new WordArray.init(words, nBytes);
        }
    }), C_enc = C.enc = {}, Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function(wordArray) {
            for (
            // Shortcuts
            var words = wordArray.words, sigBytes = wordArray.sigBytes, hexChars = [], i = 0; i < sigBytes; i++) {
                var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                hexChars.push((bite >>> 4).toString(16)), hexChars.push((15 & bite).toString(16));
            }
            return hexChars.join("");
        },
        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function(hexStr) {
            for (
            // Shortcut
            var hexStrLength = hexStr.length, words = [], i = 0
            // Convert
            ; i < hexStrLength; i += 2) words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            return new WordArray.init(words, hexStrLength / 2);
        }
    }, Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function(wordArray) {
            for (
            // Shortcuts
            var words = wordArray.words, sigBytes = wordArray.sigBytes, latin1Chars = [], i = 0; i < sigBytes; i++) {
                var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join("");
        },
        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function(latin1Str) {
            for (
            // Shortcut
            var latin1StrLength = latin1Str.length, words = [], i = 0
            // Convert
            ; i < latin1StrLength; i++) words[i >>> 2] |= (255 & latin1Str.charCodeAt(i)) << 24 - i % 4 * 8;
            return new WordArray.init(words, latin1StrLength);
        }
    }, Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function(wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error("Malformed UTF-8 data");
            }
        },
        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function(utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    }, BufferedBlockAlgorithm = (C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function(wordArray) {
            // Shortcuts
            var words = wordArray.words, sigBytes = wordArray.sigBytes, map = this._map;
            // Clamp excess bits
            wordArray.clamp();
            for (
            // Convert
            var base64Chars = [], i = 0; i < sigBytes; i += 3) for (var triplet = (words[i >>> 2] >>> 24 - i % 4 * 8 & 255) << 16 | (words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255) << 8 | words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255, j = 0; j < 4 && i + .75 * j < sigBytes; j++) base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
            // Add padding
                        var paddingChar = map.charAt(64);
            if (paddingChar) for (;base64Chars.length % 4; ) base64Chars.push(paddingChar);
            return base64Chars.join("");
        },
        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function(base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length, map = this._map, paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                -1 != paddingIndex && (base64StrLength = paddingIndex);
            }
            // Convert
                        for (var words = [], nBytes = 0, i = 0; i < base64StrLength; i++) if (i % 4) {
                var bits1 = map.indexOf(base64Str.charAt(i - 1)) << i % 4 * 2, bits2 = map.indexOf(base64Str.charAt(i)) >>> 6 - i % 4 * 2;
                words[nBytes >>> 2] |= (bits1 | bits2) << 24 - nBytes % 4 * 8, nBytes++;
            }
            return WordArray.create(words, nBytes);
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }, C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function() {
            // Initial values
            this._data = new WordArray.init(), this._nDataBytes = 0;
        },
        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function(data) {
            // Convert string to WordArray, else assume WordArray already
            "string" == typeof data && (data = Utf8.parse(data)), 
            // Append
            this._data.concat(data), this._nDataBytes += data.sigBytes;
        },
        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function(doFlush) {
            // Shortcuts
            var data = this._data, dataWords = data.words, dataSigBytes = data.sigBytes, blockSize = this.blockSize, nBlocksReady = dataSigBytes / (4 * blockSize), nWordsReady = (
            // Round up to include partial blocks
            nBlocksReady = doFlush ? Math.ceil(nBlocksReady) : Math.max((0 | nBlocksReady) - this._minBufferSize, 0)) * blockSize, nBytesReady = Math.min(4 * nWordsReady, dataSigBytes);
            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) 
                // Perform concrete-algorithm logic
                this._doProcessBlock(dataWords, offset);
                // Remove processed words
                                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }
            // Return processed words
                        return new WordArray.init(processedWords, nBytesReady);
        },
        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function() {
            var clone = Base.clone.call(this);
            return clone._data = this._data.clone(), clone;
        },
        _minBufferSize: 0
    })), Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),
        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function(cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg), 
            // Set initial values
            this.reset();
        },
        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function() {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this), 
            // Perform concrete-hasher logic
            this._doReset();
        },
        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function(messageUpdate) {
            // Chainable
            // Append
            return this._append(messageUpdate), 
            // Update the hash
            this._process(), this;
        },
        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function(messageUpdate) {
            // Final message update
            return messageUpdate && this._append(messageUpdate), this._doFinalize();
        },
        blockSize: 16,
        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function(hasher) {
            return function(message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },
        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function(hasher) {
            return function(message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    }), C_algo = C.algo = {}, W = [], SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function() {
            this._hash = new WordArray.init([ 1732584193, 4023233417, 2562383102, 271733878, 3285377520 ]);
        },
        _doProcessBlock: function(M, offset) {
            // Computation
            for (
            // Shortcut
            var H = this._hash.words, a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], i = 0
            // Working variables
            ; i < 80; i++) {
                if (i < 16) W[i] = 0 | M[offset + i]; else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = n << 1 | n >>> 31;
                }
                var t = (a << 5 | a >>> 27) + e + W[i];
                t += i < 20 ? 1518500249 + (b & c | ~b & d) : i < 40 ? 1859775393 + (b ^ c ^ d) : i < 60 ? (b & c | b & d | c & d) - 1894007588 : (b ^ c ^ d) - 899497514, 
                e = d, d = c, c = b << 30 | b >>> 2, b = a, a = t;
            }
            // Intermediate hash value
                        H[0] = H[0] + a | 0, H[1] = H[1] + b | 0, H[2] = H[2] + c | 0, H[3] = H[3] + d | 0, 
            H[4] = H[4] + e | 0;
        },
        _doFinalize: function() {
            // Shortcuts
            var data = this._data, dataWords = data.words, nBitsTotal = 8 * this._nDataBytes, nBitsLeft = 8 * data.sigBytes;
            // Return final computed hash
            // Add padding
            return dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32, dataWords[14 + (nBitsLeft + 64 >>> 9 << 4)] = Math.floor(nBitsTotal / 4294967296), 
            dataWords[15 + (nBitsLeft + 64 >>> 9 << 4)] = nBitsTotal, data.sigBytes = 4 * dataWords.length, 
            // Hash final blocks
            this._process(), this._hash;
        },
        clone: function() {
            var clone = Hasher.clone.call(this);
            return clone._hash = this._hash.clone(), clone;
        }
    });
    /**
     * Library namespace.
     */    
    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA1('message');
     *     var hash = CryptoJS.SHA1(wordArray);
     */
    return C.SHA1 = Hasher._createHelper(SHA1), 
    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA1(message, key);
     */
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1), C;
}(Math)) || function(h, s) {
    var f = {}, g = f.lib = {}, q = function() {}, m = g.Base = {
        extend: function(a) {
            q.prototype = this;
            var c = new q();
            return a && c.mixIn(a), c.hasOwnProperty("init") || (c.init = function() {
                c.$super.init.apply(this, arguments);
            }), (c.init.prototype = c).$super = this, c;
        },
        create: function() {
            var a = this.extend();
            return a.init.apply(a, arguments), a;
        },
        init: function() {},
        mixIn: function(a) {
            for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
            a.hasOwnProperty("toString") && (this.toString = a.toString);
        },
        clone: function() {
            return this.init.prototype.extend(this);
        }
    }, r = g.WordArray = m.extend({
        init: function(a, c) {
            a = this.words = a || [], this.sigBytes = null != c ? c : 4 * a.length;
        },
        toString: function(a) {
            return (a || k).stringify(this);
        },
        concat: function(a) {
            var c = this.words, d = a.words, b = this.sigBytes;
            if (a = a.sigBytes, this.clamp(), b % 4) for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - e % 4 * 8 & 255) << 24 - (b + e) % 4 * 8; else if (65535 < d.length) for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2]; else c.push.apply(c, d);
            return this.sigBytes += a, this;
        },
        clamp: function() {
            var a = this.words, c = this.sigBytes;
            a[c >>> 2] &= 4294967295 << 32 - c % 4 * 8, a.length = h.ceil(c / 4);
        },
        clone: function() {
            var a = m.clone.call(this);
            return a.words = this.words.slice(0), a;
        },
        random: function(a) {
            for (var c = [], d = 0; d < a; d += 4) c.push(4294967296 * h.random() | 0);
            return new r.init(c, a);
        }
    }), l = f.enc = {}, k = l.Hex = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var d = [], b = 0; b < a; b++) {
                var e = c[b >>> 2] >>> 24 - b % 4 * 8 & 255;
                d.push((e >>> 4).toString(16)), d.push((15 & e).toString(16));
            }
            return d.join("");
        },
        parse: function(a) {
            for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - b % 8 * 4;
            return new r.init(d, c / 2);
        }
    }, n = l.Latin1 = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - b % 4 * 8 & 255));
            return d.join("");
        },
        parse: function(a) {
            for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (255 & a.charCodeAt(b)) << 24 - b % 4 * 8;
            return new r.init(d, c);
        }
    }, j = l.Utf8 = {
        stringify: function(a) {
            try {
                return decodeURIComponent(escape(n.stringify(a)));
            } catch (c) {
                throw Error("Malformed UTF-8 data");
            }
        },
        parse: function(a) {
            return n.parse(unescape(encodeURIComponent(a)));
        }
    }, u = g.BufferedBlockAlgorithm = m.extend({
        reset: function() {
            this._data = new r.init(), this._nDataBytes = 0;
        },
        _append: function(a) {
            "string" == typeof a && (a = j.parse(a)), this._data.concat(a), this._nDataBytes += a.sigBytes;
        },
        _process: function(a) {
            var c = this._data, d = c.words, b = c.sigBytes, e = this.blockSize, f = b / (4 * e);
            if (a = (f = a ? h.ceil(f) : h.max((0 | f) - this._minBufferSize, 0)) * e, b = h.min(4 * a, b), 
            a) {
                for (var g = 0; g < a; g += e) this._doProcessBlock(d, g);
                g = d.splice(0, a), c.sigBytes -= b;
            }
            return new r.init(g, b);
        },
        clone: function() {
            var a = m.clone.call(this);
            return a._data = this._data.clone(), a;
        },
        _minBufferSize: 0
    });
    g.Hasher = u.extend({
        cfg: m.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a), this.reset();
        },
        reset: function() {
            u.reset.call(this), this._doReset();
        },
        update: function(a) {
            return this._append(a), this._process(), this;
        },
        finalize: function(a) {
            return a && this._append(a), this._doFinalize();
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(c, d) {
                return new a.init(d).finalize(c);
            };
        },
        _createHmacHelper: function(a) {
            return function(c, d) {
                return new t.HMAC.init(a, d).finalize(c);
            };
        }
    });
    var t = f.algo = {};
    return f;
}(Math);

//add the sha256 functions
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
// shim for old-style Base64 lib
function toBase64(text) {
    return CryptoJS && CryptoJS.enc.Base64 ? CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(text)) : Base64.encode(text);
}

// shim for old-style crypto lib
function toSHA1(text) {
    return CryptoJS && CryptoJS.SHA1 ? CryptoJS.SHA1(text).toString() : Crypto.util.bytesToHex(Crypto.SHA1(text, {
        asBytes: !0
    }));
}

function toSHA256(content) {
    if ("[object ArrayBuffer]" !== Object.prototype.toString.call(content)) return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
    // Create a WordArray from the ArrayBuffer.
        for (var i8a = new Uint8Array(content), a = [], i = 0; i < i8a.length; i += 4) a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    return CryptoJS.SHA256(CryptoJS.lib.WordArray.create(a, i8a.length)).toString(CryptoJS.enc.Hex);
}

// check if string or object is date, if it is, return date object
// feburary 31st == march 3rd in this solution
function isDate(date) {
    // check if object is being passed
    if ("[object Date]" === Object.prototype.toString.call(date)) var d = date; else d = new Date(date);
    // deep check on date object
        return "[object Date]" === Object.prototype.toString.call(d) ? 
    // it is a date
    isNaN(d.valueOf()) ? (ADL.XAPIWrapper.log("Invalid date String passed"), null) : d : (
    // not a date
    ADL.XAPIWrapper.log("Invalid date object"), null);
}

function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);
    for (var byteLen = 0, i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : c < 1 << 21 ? 4 : c < 1 << 26 ? 5 : c < 1 << 31 ? 6 : Number.NaN;
    }
    return byteLen;
}

/*
     * Config object used w/ url params to configure the lrs object
     * change these to match your lrs
     * @return {object} config object
     * @example
     * var conf = {
     *    "endpoint" : "https://lrs.adlnet.gov/xapi/",
     *    "auth" : "Basic " + toBase64('tom:1234'),
     * };
     * ADL.XAPIWrapper.changeConfig(conf);
     */ !function(h) {
    for (var s = CryptoJS, g = (f = s.lib).WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function(a) {
        return 4294967296 * (a - (0 | a)) | 0;
    }, k = 2, n = 0; n < 64; ) {
        var j;
        a: {
            j = k;
            for (var u = h.sqrt(j), t = 2; t <= u; t++) if (!(j % t)) {
                j = !1;
                break a;
            }
            j = !0;
        }
        j && (n < 8 && (m[n] = l(h.pow(k, .5))), r[n] = l(h.pow(k, 1 / 3)), n++), k++;
    }
    var a = [];
    f = f.SHA256 = q.extend({
        _doReset: function() {
            this._hash = new g.init(m.slice(0));
        },
        _doProcessBlock: function(c, d) {
            for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; p < 64; p++) {
                if (p < 16) a[p] = 0 | c[d + p]; else {
                    var k = a[p - 15], l = a[p - 2];
                    a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16];
                }
                k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p], 
                l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g), 
                q = n, n = m, m = h, h = j + k | 0, j = g, g = f, f = e, e = k + l | 0;
            }
            b[0] = b[0] + e | 0, b[1] = b[1] + f | 0, b[2] = b[2] + g | 0, b[3] = b[3] + j | 0, 
            b[4] = b[4] + h | 0, b[5] = b[5] + m | 0, b[6] = b[6] + n | 0, b[7] = b[7] + q | 0;
        },
        _doFinalize: function() {
            var a = this._data, d = a.words, b = 8 * this._nDataBytes, e = 8 * a.sigBytes;
            return d[e >>> 5] |= 128 << 24 - e % 32, d[14 + (e + 64 >>> 9 << 4)] = h.floor(b / 4294967296), 
            d[15 + (e + 64 >>> 9 << 4)] = b, a.sigBytes = 4 * d.length, this._process(), this._hash;
        },
        clone: function() {
            var a = q.clone.call(this);
            return a._hash = this._hash.clone(), a;
        }
    });
    s.SHA256 = q._createHelper(f), s.HmacSHA256 = q._createHmacHelper(f);
}(Math), function() {
    var h = CryptoJS, s = h.enc.Utf8;
    h.algo.HMAC = h.lib.Base.extend({
        init: function(f, g) {
            f = this._hasher = new f.init(), "string" == typeof g && (g = s.parse(g));
            var h = f.blockSize, m = 4 * h;
            g.sigBytes > m && (g = f.finalize(g)), g.clamp();
            for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) k[j] ^= 1549556828, 
            n[j] ^= 909522486;
            r.sigBytes = l.sigBytes = m, this.reset();
        },
        reset: function() {
            var f = this._hasher;
            f.reset(), f.update(this._iKey);
        },
        update: function(f) {
            return this._hasher.update(f), this;
        },
        finalize: function(f) {
            var g = this._hasher;
            return f = g.finalize(f), g.reset(), g.finalize(this._oKey.clone().concat(f));
        }
    });
}(), ADL.activityTypes = {
    assessment: "http://adlnet.gov/expapi/activities/assessment",
    attempt: "http://adlnet.gov/expapi/activities/attempt",
    course: "http://adlnet.gov/expapi/activities/course",
    file: "http://adlnet.gov/expapi/activities/file",
    interaction: "http://adlnet.gov/expapi/activities/interaction",
    lesson: "http://adlnet.gov/expapi/activities/lesson",
    link: "http://adlnet.gov/expapi/activities/link",
    media: "http://adlnet.gov/expapi/activities/media",
    meeting: "http://adlnet.gov/expapi/activities/meeting",
    module: "http://adlnet.gov/expapi/activities/module",
    objective: "http://adlnet.gov/expapi/activities/objective",
    performance: "http://adlnet.gov/expapi/activities/performance",
    profile: "http://adlnet.gov/expapi/activities/profile",
    question: "http://adlnet.gov/expapi/activities/question",
    simulation: "http://adlnet.gov/expapi/activities/simulation"
}, ADL.verbs = {
    abandoned: {
        id: "https://w3id.org/xapi/adl/verbs/abandoned",
        display: {
            "en-US": "abandoned"
        }
    },
    answered: {
        id: "http://adlnet.gov/expapi/verbs/answered",
        display: {
            "de-DE": "beantwortete",
            "en-US": "answered",
            "fr-FR": "a répondu",
            "es-ES": "contestó",
            "ar-AR": "أجاب"
        }
    },
    asked: {
        id: "http://adlnet.gov/expapi/verbs/asked",
        display: {
            "de-DE": "fragte",
            "en-US": "asked",
            "fr-FR": "a demandé",
            "es-ES": "preguntó",
            "ar-AR": "طلب"
        }
    },
    attempted: {
        id: "http://adlnet.gov/expapi/verbs/attempted",
        display: {
            "de-DE": "versuchte",
            "en-US": "attempted",
            "fr-FR": "a essayé",
            "es-ES": "intentó",
            "ar-AR": "حاول"
        }
    },
    attended: {
        id: "http://adlnet.gov/expapi/verbs/attended",
        display: {
            "de-DE": "nahm teil an",
            "en-US": "attended",
            "fr-FR": "a suivi",
            "es-ES": "asistió",
            "ar-AR": "حضر"
        }
    },
    commented: {
        id: "http://adlnet.gov/expapi/verbs/commented",
        display: {
            "de-DE": "kommentierte",
            "en-US": "commented",
            "fr-FR": "a commenté",
            "es-ES": "comentó",
            "ar-AR": "علق"
        }
    },
    completed: {
        id: "http://adlnet.gov/expapi/verbs/completed",
        display: {
            "de-DE": "beendete",
            "en-US": "completed",
            "fr-FR": "a terminé",
            "es-ES": "completó",
            "ar-AR": "أكمل"
        }
    },
    exited: {
        id: "http://adlnet.gov/expapi/verbs/exited",
        display: {
            "de-DE": "verließ",
            "en-US": "exited",
            "fr-FR": "a quitté",
            "es-ES": "salió",
            "ar-AR": "خرج"
        }
    },
    experienced: {
        id: "http://adlnet.gov/expapi/verbs/experienced",
        display: {
            "de-DE": "erlebte",
            "en-US": "experienced",
            "fr-FR": "a éprouvé",
            "es-ES": "experimentó",
            "ar-AR": "شاهد"
        }
    },
    failed: {
        id: "http://adlnet.gov/expapi/verbs/failed",
        display: {
            "de-DE": "verfehlte",
            "en-US": "failed",
            "fr-FR": "a échoué",
            "es-ES": "fracasó",
            "ar-AR": "فشل"
        }
    },
    imported: {
        id: "http://adlnet.gov/expapi/verbs/imported",
        display: {
            "de-DE": "importierte",
            "en-US": "imported",
            "fr-FR": "a importé",
            "es-ES": "importó",
            "ar-AR": "مستورد"
        }
    },
    initialized: {
        id: "http://adlnet.gov/expapi/verbs/initialized",
        display: {
            "de-DE": "initialisierte",
            "en-US": "initialized",
            "fr-FR": "a initialisé",
            "es-ES": "inicializó",
            "ar-AR": "بدأ"
        }
    },
    interacted: {
        id: "http://adlnet.gov/expapi/verbs/interacted",
        display: {
            "de-DE": "interagierte",
            "en-US": "interacted",
            "fr-FR": "a interagi",
            "es-ES": "interactuó",
            "ar-AR": "تفاعل"
        }
    },
    launched: {
        id: "http://adlnet.gov/expapi/verbs/launched",
        display: {
            "de-DE": "startete",
            "en-US": "launched",
            "fr-FR": "a lancé",
            "es-ES": "lanzó",
            "ar-AR": "أطلق"
        }
    },
    mastered: {
        id: "http://adlnet.gov/expapi/verbs/mastered",
        display: {
            "de-DE": "meisterte",
            "en-US": "mastered",
            "fr-FR": "a maîtrisé",
            "es-ES": "dominó",
            "ar-AR": "أتقن"
        }
    },
    passed: {
        id: "http://adlnet.gov/expapi/verbs/passed",
        display: {
            "de-DE": "bestand",
            "en-US": "passed",
            "fr-FR": "a réussi",
            "es-ES": "aprobó",
            "ar-AR": "نجح"
        }
    },
    preferred: {
        id: "http://adlnet.gov/expapi/verbs/preferred",
        display: {
            "de-DE": "bevorzugte",
            "en-US": "preferred",
            "fr-FR": "a préféré",
            "es-ES": "prefirió",
            "ar-AR": "فضل"
        }
    },
    progressed: {
        id: "http://adlnet.gov/expapi/verbs/progressed",
        display: {
            "de-DE": "machte Fortschritt mit",
            "en-US": "progressed",
            "fr-FR": "a progressé",
            "es-ES": "progresó",
            "ar-AR": "تقدم"
        }
    },
    registered: {
        id: "http://adlnet.gov/expapi/verbs/registered",
        display: {
            "de-DE": "registrierte",
            "en-US": "registered",
            "fr-FR": "a enregistré",
            "es-ES": "registró",
            "ar-AR": "سجل"
        }
    },
    responded: {
        id: "http://adlnet.gov/expapi/verbs/responded",
        display: {
            "de-DE": "reagierte",
            "en-US": "responded",
            "fr-FR": "a répondu",
            "es-ES": "respondió",
            "ar-AR": "استجاب"
        }
    },
    resumed: {
        id: "http://adlnet.gov/expapi/verbs/resumed",
        display: {
            "de-DE": "setzte fort",
            "en-US": "resumed",
            "fr-FR": "a repris",
            "es-ES": "continuó",
            "ar-AR": "استأنف"
        }
    },
    satisfied: {
        id: "https://w3id.org/xapi/adl/verbs/satisfied",
        display: {
            "de-DE": "befriedigt",
            "en-US": "satisfied",
            "fr-FR": "satisfaite",
            "es-ES": "satisfecho",
            "ar-AR": "راض"
        }
    },
    scored: {
        id: "http://adlnet.gov/expapi/verbs/scored",
        display: {
            "de-DE": "erreichte",
            "en-US": "scored",
            "fr-FR": "a marqué",
            "es-ES": "anotó",
            "ar-AR": "سحل النقاط"
        }
    },
    shared: {
        id: "http://adlnet.gov/expapi/verbs/shared",
        display: {
            "de-DE": "teilte",
            "en-US": "shared",
            "fr-FR": "a partagé",
            "es-ES": "compartió",
            "ar-AR": "شارك"
        }
    },
    suspended: {
        id: "http://adlnet.gov/expapi/verbs/suspended",
        display: {
            "de-DE": "pausierte",
            "en-US": "suspended",
            "fr-FR": "a suspendu",
            "es-ES": "aplazó",
            "ar-AR": "علق"
        }
    },
    terminated: {
        id: "http://adlnet.gov/expapi/verbs/terminated",
        display: {
            "de-DE": "beendete",
            "en-US": "terminated",
            "fr-FR": "a terminé",
            "es-ES": "terminó",
            "ar-AR": "أنهى"
        }
    },
    voided: {
        id: "http://adlnet.gov/expapi/verbs/voided",
        display: {
            "de-DE": "entwertete",
            "en-US": "voided",
            "fr-FR": "a annulé",
            "es-ES": "anuló",
            "ar-AR": "فرغ"
        }
    },
    waived: {
        id: "https://w3id.org/xapi/adl/verbs/waived",
        display: {
            "de-DE": "verzichtet",
            "en-US": "waived",
            "fr-FR": "renoncé",
            "es-ES": "renunciado",
            "ar-AR": "تخلى"
        }
    }
}, // adds toISOString to date objects if not there
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
Date.prototype.toISOString || function() {
    function pad(number) {
        var r = String(number);
        return 1 === r.length && (r = "0" + r), r;
    }
    Date.prototype.toISOString = function() {
        return this.getUTCFullYear() + "-" + pad(this.getUTCMonth() + 1) + "-" + pad(this.getUTCDate()) + "T" + pad(this.getUTCHours()) + ":" + pad(this.getUTCMinutes()) + ":" + pad(this.getUTCSeconds()) + "." + String((this.getUTCMilliseconds() / 1e3).toFixed(3)).slice(2, 5) + "Z";
    };
}(), log.debug = !1;

var Config = function() {
    var conf = {
        endpoint: "http://localhost:8000/xapi/"
    };
    //}
    //catch (e)
    //{
    //    log("Exception in Config trying to encode auth: " + e);
    //}
    // Statement defaults
    // conf["actor"] = {"mbox":"default@example.com"};
    // conf["registration"] =  ruuid();
    // conf["grouping"] = {"id":"ctxact:default/grouping"};
    // conf["activity_platform"] = "default platform";
    // Behavior defaults
    // conf["strictCallbacks"] = false; // Strict error-first callbacks
    //try
    //{
    return conf.auth = "Basic " + toBase64("tom:1234"), conf;
}(), XAPIWrapper = function(config, verifyxapiversion) {
    function getbase(url) {
        var l = parseUrl(url);
        if (l.protocol && l.host) return l.protocol + "//" + l.host;
        if (l.href) {
            // IE 11 fix.
            var parts = l.href.split("//");
            return parts[0] + "//" + parts[1].substr(0, parts[1].indexOf("/"));
        }
        ADL.XAPIWrapper.log("Couldn't create base url from endpoint: " + url);
    }
    function updateAuth(obj, username, password) {
        obj.auth = "Basic " + toBase64(username + ":" + password);
    }
    this.lrs = getLRSObject(config || {}), this.lrs.user && this.lrs.password && updateAuth(this.lrs, this.lrs.user, this.lrs.password), 
    this.base = getbase(this.lrs.endpoint), this.withCredentials = !1, config && void 0 !== config.withCredentials && (this.withCredentials = config.withCredentials), 
    // Ensure that callbacks are always executed, first param is error (null if no error) followed
    // by the result(s)
    this.strictCallbacks = !1, this.strictCallbacks = config && config.strictCallbacks, 
    verifyxapiversion && testConfig.call(this) && ADL.XHR_request(this.lrs, this.lrs.endpoint + "about", "GET", null, null, function(r) {
        if (200 == r.status) try {
            var lrsabout = JSON.parse(r.response), versionOK = !1;
            for (var idx in lrsabout.version) if (lrsabout.version.hasOwnProperty(idx) && lrsabout.version[idx] == ADL.XAPIWrapper.xapiVersion) {
                versionOK = !0;
                break;
            }
            versionOK || ADL.XAPIWrapper.log("The lrs version [" + lrsabout.version + "] does not match this wrapper's XAPI version [" + ADL.XAPIWrapper.xapiVersion + "]");
        } catch (e) {
            ADL.XAPIWrapper.log("The response was not an about object");
        } else ADL.XAPIWrapper.log("The request to get information about the LRS failed: " + r);
    }, null, !1, null, this.withCredentials, !1), this.searchParams = function() {
        return {
            format: "exact"
        };
    }, this.hash = function(tohash) {
        if (!tohash) return null;
        try {
            return toSHA1(tohash);
        } catch (e) {
            return ADL.XAPIWrapper.log("Error trying to hash -- " + e), null;
        }
    }, this.changeConfig = function(config) {
        try {
            ADL.XAPIWrapper.log("updating lrs object with new configuration"), this.lrs = mergeRecursive(this.lrs, config), 
            config.user && config.password && this.updateAuth(this.lrs, config.user, config.password), 
            this.base = getbase(this.lrs.endpoint), this.withCredentials = config.withCredentials, 
            this.strictCallbacks = config.strictCallbacks;
        } catch (e) {
            ADL.XAPIWrapper.log("error while changing configuration -- " + e);
        }
    }, this.updateAuth = updateAuth;
};

/*
     * XAPIWrapper Constructor
     * @param {object} config   with a minimum of an endoint property
     * @param {boolean} verifyxapiversion   indicating whether to verify the version of the LRS is compatible with this wrapper
     */
/*
     * Tests the configuration of the lrs object
     */
function testConfig() {
    try {
        return null != this.lrs.endpoint && "" != this.lrs.endpoint;
    } catch (e) {
        return !1;
    }
}

// outputs the message to the console if available
function log(message) {
    if (!log.debug) return !1;
    try {
        return console.log(message), !0;
    } catch (e) {
        return !1;
    }
}

// merges two object
function mergeRecursive(obj1, obj2) {
    for (var p in obj2) if (0 != obj2.hasOwnProperty(p)) {
        log(p + " : " + obj2[p]);
        try {
            // Property in destination object set; update its value.
            obj2[p].constructor == Object ? obj1[p] = mergeRecursive(obj1[p], obj2[p]) : (null == obj1 && (obj1 = new Object()), 
            obj1[p] = obj2[p]);
        } catch (e) {
            null == obj1 && (obj1 = new Object()), 
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
    return obj1;
}

// iniitializes an lrs object with settings from
// a config file and from the url query string
function getLRSObject(config) {
    var qsVars, prop, lrsProps = [ "endpoint", "auth", "actor", "registration", "activity_id", "grouping", "activity_platform" ], lrs = new Object();
    if (void 0 !== (qsVars = parseQueryString()) && 0 !== Object.keys(qsVars).length) {
        for (var i = 0; i < lrsProps.length; i++) qsVars[prop = lrsProps[i]] && (lrs[prop] = qsVars[prop], 
        delete qsVars[prop]);
        0 !== Object.keys(qsVars).length && (lrs.extended = qsVars), lrs = mergeRecursive(config, lrs);
    } else lrs = config;
    return lrs;
}

// parses the params in the url query string
function parseQueryString() {
    var pairs, pair, ii, parsed;
    for (pairs = location.search.substr(1).split("&"), parsed = {}, ii = 0; ii < pairs.length; ii++) 2 === (pair = pairs[ii].split("=")).length && pair[0] && (parsed[pair[0]] = decodeURIComponent(pair[1]));
    return parsed;
}

function delay() {
    var xhr = new XMLHttpRequest(), url = location + "?forcenocache=" + ADL.ruuid();
    xhr.open("GET", url, !1), xhr.send(null);
}

// This wrapper is based on the Experience API Spec version:
XAPIWrapper.prototype.xapiVersion = "1.0.1", 
/*
     * Adds info from the lrs object to the statement, if available.
     * These values could be initialized from the Config object or from the url query string.
     * @param {object} stmt   the statement object
     */
XAPIWrapper.prototype.prepareStatement = function(stmt) {
    void 0 === stmt.actor ? stmt.actor = JSON.parse(this.lrs.actor) : "string" == typeof stmt.actor && (stmt.actor = JSON.parse(stmt.actor)), 
    (this.lrs.grouping || this.lrs.registration || this.lrs.activity_platform) && (stmt.context || (stmt.context = {})), 
    this.lrs.grouping && (stmt.context.contextActivities || (stmt.context.contextActivities = {}), 
    stmt.context.contextActivities.grouping = [ {
        id: this.lrs.grouping
    } ]), this.lrs.registration && (stmt.context.registration = this.lrs.registration), 
    this.lrs.activity_platform && (stmt.context.platform = this.lrs.activity_platform);
}, 
// tests the configuration of the lrs object
XAPIWrapper.prototype.testConfig = testConfig, 
// writes to the console if available
XAPIWrapper.prototype.log = log, 
// Default encoding
XAPIWrapper.prototype.defaultEncoding = "utf-8", 
/*
     * Send a single statement to the LRS. Makes a Javascript object
     * with the statement id as 'id' available to the callback function.
     * @param {object} stmt   statement object to send
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     *            and an object with an id property assigned the id
     *            of the statement
     * @return {object} object containing xhr object and id of statement
     * @example
     * // Send Statement
     * var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
     *             "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
     *                       "display" : {"en-US" : "answered"}},
     *             "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
     * var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
     * ADL.XAPIWrapper.log("[" + resp_obj.id + "]: " + resp_obj.xhr.status + " - " + resp_obj.xhr.statusText);
     * >> [3e616d1c-5394-42dc-a3aa-29414f8f0dfe]: 204 - NO CONTENT
     *
     * // Send Statement with Callback
     * var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
     *             "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
     *                       "display" : {"en-US" : "answered"}},
     *             "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
     * ADL.XAPIWrapper.sendStatement(stmt, function(resp, obj){
     *     ADL.XAPIWrapper.log("[" + obj.id + "]: " + resp.status + " - " + resp.statusText);});
     * >> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 204 - NO CONTENT
     */
XAPIWrapper.prototype.sendStatement = function(stmt, callback, attachments) {
    if (this.testConfig()) {
        var id;
        this.prepareStatement(stmt), stmt.id ? id = stmt.id : (id = ADL.ruuid(), stmt.id = id);
        var payload = JSON.stringify(stmt), extraHeaders = null;
        attachments && 0 < attachments.length && (extraHeaders = {}, payload = this.buildMultipartPost(stmt, attachments, extraHeaders));
        var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint + "statements", "POST", payload, this.lrs.auth, callback, {
            id: id
        }, null, extraHeaders, this.withCredentials, this.strictCallbacks);
        if (!callback) return {
            xhr: resp,
            id: id
        };
    }
}, XAPIWrapper.prototype.stringToArrayBuffer = function(content, encoding) {
    return encoding = encoding || ADL.XAPIWrapper.defaultEncoding, new TextEncoder(encoding).encode(content).buffer;
}, XAPIWrapper.prototype.stringFromArrayBuffer = function(content, encoding) {
    return encoding = encoding || ADL.XAPIWrapper.defaultEncoding, new TextDecoder(encoding).decode(content);
}, 
/*
    * Build the post body to include the multipart boundries, edit the statement to include the attachment types
    * extraHeaders should be an object. It will have the multipart boundary value set
    * attachments should be an array of objects of the type
    * {
          type:"signature" || {
              usageType : URI,
              display: Language-map
              description: Language-map
          },
          value : a UTF8 string containing the binary data of the attachment. For string values, this can just be the JS string.
       }
    */
XAPIWrapper.prototype.buildMultipartPost = function(statement, attachments, extraHeaders) {
    statement.attachments = [];
    for (var i = 0; i < attachments.length; i++) 
    // Replace the term 'signature' with the hard coded definition for a signature attachment
    "signature" == attachments[i].type && (attachments[i].type = {
        usageType: "http://adlnet.gov/expapi/attachments/signature",
        display: {
            "en-US": "A JWT signature"
        },
        description: {
            "en-US": "A signature proving the statement was not modified"
        },
        contentType: "application/octet-stream"
    }), "string" == typeof attachments[i].value && (
    // Convert the string value to an array buffer.
    attachments[i].value = this.stringToArrayBuffer(attachments[i].value)), 
    // Compute the length and the sha2 of the attachment
    attachments[i].type.length = attachments[i].value.byteLength, attachments[i].type.sha2 = toSHA256(attachments[i].value), 
    // Attach the attachment metadata to the statement.
    statement.attachments.push(attachments[i].type);
    var blobParts = [], boundary = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
    extraHeaders["Content-Type"] = "multipart/mixed; boundary=" + boundary;
    var CRLF = "\r\n", header = [ "--" + boundary, "Content-Type: application/json", 'Content-Disposition: form-data; name="statement"', "", JSON.stringify(statement) ].join(CRLF) + CRLF;
    for (var i in blobParts.push(header), attachments) if (attachments.hasOwnProperty(i)) {
        var attachmentHeader = [ "--" + boundary, "Content-Type: " + attachments[i].type.contentType, "Content-Transfer-Encoding: binary", "X-Experience-API-Hash: " + attachments[i].type.sha2 ].join(CRLF) + CRLF + CRLF;
        blobParts.push(attachmentHeader), blobParts.push(attachments[i].value);
    }
    return blobParts.push("\r\n--" + boundary + "--" + CRLF), new Blob(blobParts);
}
/*
     * Send a list of statements to the LRS.
     * @param {array} stmtArray   the list of statement objects to send
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object
     * @example
     * var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
     *             "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
     *                       "display" : {"en-US" : "answered"}},
     *             "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
     * var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
     * ADL.XAPIWrapper.getStatements({"statementId":resp_obj.id});
     * >> {"version": "1.0.0",
     *     "timestamp": "2013-09-09 21:36:40.185841+00:00",
     *     "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
     *     "actor": {"mbox": "mailto:tom@example.com", "name": "tom creighton", "objectType": "Agent"},
     *     "stored": "2013-09-09 21:36:40.186124+00:00",
     *     "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
     *     "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
     *     "context": {"registration": "51a6f860-1997-11e3-8ffd-0800200c9a66"},
     *     "id": "ea9c1d01-0606-4ec7-8e5d-20f87b1211ed"}
     */ , XAPIWrapper.prototype.sendStatements = function(stmtArray, callback) {
    if (this.testConfig()) {
        for (var i in stmtArray) stmtArray.hasOwnProperty(i) && this.prepareStatement(stmtArray[i]);
        var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint + "statements", "POST", JSON.stringify(stmtArray), this.lrs.auth, callback, null, !1, null, this.withCredentials, this.strictCallbacks);
        if (!callback) return resp;
    }
}, 
/*
     * Get statement(s) based on the searchparams or more url.
     * @param {object} searchparams   an ADL.XAPIWrapper.searchParams object of
     *                key(search parameter)-value(parameter value) pairs.
     *                Example:
     *                  var myparams = ADL.XAPIWrapper.searchParams();
     *                  myparams['verb'] = ADL.verbs.completed.id;
     *                  var completedStmts = ADL.XAPIWrapper.getStatements(myparams);
     * @param {string} more   the more url found in the StatementResults object, if there are more
     *        statements available based on your get statements request. Pass the
     *        more url as this parameter to retrieve those statements.
     * @param {function} [callback] - function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * var ret = ADL.XAPIWrapper.getStatements();
     * if (ret)
     *     ADL.XAPIWrapper.log(ret.statements);
     *
     * >> <Array of statements>
     */
XAPIWrapper.prototype.getStatements = function(searchparams, more, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "statements";
        if (more) url = this.base + more; else {
            var urlparams = new Array();
            for (s in searchparams) if (searchparams.hasOwnProperty(s)) if ("until" == s || "since" == s) {
                var d = new Date(searchparams[s]);
                urlparams.push(s + "=" + encodeURIComponent(d.toISOString()));
            } else urlparams.push(s + "=" + encodeURIComponent(searchparams[s]));
            0 < urlparams.length && (url = url + "?" + urlparams.join("&"));
        }
        var res = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !1, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === res || 404 == res.status) return null;
        try {
            return JSON.parse(res.response);
        } catch (e) {
            return res.response;
        }
    }
}, 
/*
     * Gets the Activity object from the LRS.
     * @param {string} activityid   the id of the Activity to get
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * var res = ADL.XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
     * ADL.XAPIWrapper.log(res);
     * >> <Activity object>
     */
XAPIWrapper.prototype.getActivities = function(activityid, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities?activityId=<activityid>";
        url = url.replace("<activityid>", encodeURIComponent(activityid));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !0, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
}, 
/*
     * Store activity state in the LRS
     * @param {string} activityid   the id of the Activity this state is about
     * @param {object} agent   the agent this Activity state is related to
     * @param {string} stateid   the id you want associated with this state
     * @param {string} [registration]   the registraton id associated with this state
     * @param {string} stateval   the state
     * @param {string} [matchHash]    the hash of the state to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current state or * to indicate no previous state
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {boolean} false if no activity state is included
     * @example
     * var stateval = {"info":"the state info"};
     * ADL.XAPIWrapper.sendState("http://adlnet.gov/expapi/activities/question",
     *                    {"mbox":"mailto:tom@example.com"},
     *                    "questionstate", null, stateval);
     */
XAPIWrapper.prototype.sendState = function(activityid, agent, stateid, registration, stateval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";
        url = (url = (url = url.replace("<activity ID>", encodeURIComponent(activityid))).replace("<agent>", encodeURIComponent(JSON.stringify(agent)))).replace("<stateid>", encodeURIComponent(stateid)), 
        registration && (url += "&registration=" + encodeURIComponent(registration));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var method = "PUT";
        if (!stateval) return this.log("No activity state was included."), !1;
        //(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders)
                stateval instanceof Array ? (stateval = JSON.stringify(stateval), (headers = headers || {})["Content-Type"] = "application/json") : stateval instanceof Object ? (stateval = JSON.stringify(stateval), 
        (headers = headers || {})["Content-Type"] = "application/json", method = "POST") : (headers = headers || {})["Content-Type"] = "application/octet-stream", 
        ADL.XHR_request(this.lrs, url, method, stateval, this.lrs.auth, callback, null, null, headers, this.withCredentials, this.strictCallbacks);
    }
}, 
/*
     * Get activity state from the LRS
     * @param {string} activityid   the id of the Activity this state is about
     * @param {object} agent   the agent this Activity state is related to
     * @param {string} [stateid]    the id of the state, if not included, the response will be a list of stateids
     *            associated with the activity and agent)
     * @param {string} [registration]   the registraton id associated with this state
     * @param {object} [since]    date object or date string telling the LRS to return objects newer than the date supplied
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                  {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> {info: "the state info"}
     */
XAPIWrapper.prototype.getState = function(activityid, agent, stateid, registration, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>";
        url = (url = url.replace("<activity ID>", encodeURIComponent(activityid))).replace("<agent>", encodeURIComponent(JSON.stringify(agent))), 
        stateid && (url += "&stateId=" + encodeURIComponent(stateid)), registration && (url += "&registration=" + encodeURIComponent(registration)), 
        since && null != (since = isDate(since)) && (url += "&since=" + encodeURIComponent(since.toISOString()));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !0, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
}, 
/*
     * Delete activity state in the LRS
     * @param {string} activityid   the id of the Activity this state is about
     * @param {object} agent   the agent this Activity state is related to
     * @param {string} stateid   the id you want associated with this state
     * @param {string} [registration]   the registraton id associated with this state
     * @param {string} [matchHash]    the hash of the state to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current state or * to indicate no previous state
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * var stateval = {"info":"the state info"};
     * ADL.XAPIWrapper.sendState("http://adlnet.gov/expapi/activities/question",
     *                           {"mbox":"mailto:tom@example.com"},
     *                           "questionstate", null, stateval);
     * ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> {info: "the state info"}
     *
     * ADL.XAPIWrapper.deleteState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     *
     * ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> 404
     */
XAPIWrapper.prototype.deleteState = function(activityid, agent, stateid, registration, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";
        url = (url = (url = url.replace("<activity ID>", encodeURIComponent(activityid))).replace("<agent>", encodeURIComponent(JSON.stringify(agent)))).replace("<stateid>", encodeURIComponent(stateid)), 
        registration && (url += "&registration=" + encodeURIComponent(registration));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, !1, headers, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
}, 
/*
     * Store activity profile in the LRS
     * @param {string} activityid   the id of the Activity this profile is about
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} profileval   the profile
     * @param {string} [matchHash]    the hash of the profile to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current profile or * to indicate no previous profile
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {bolean} false if no activity profile is included
     * @example
     * var profile = {"info":"the profile"};
     * ADL.XAPIWrapper.sendActivityProfile("http://adlnet.gov/expapi/activities/question",
     *                                     "actprofile", profile, null, "*");
     */
XAPIWrapper.prototype.sendActivityProfile = function(activityid, profileid, profileval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";
        url = (url = url.replace("<activity ID>", encodeURIComponent(activityid))).replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var method = "PUT";
        if (!profileval) return this.log("No activity profile was included."), !1;
        profileval instanceof Array ? (profileval = JSON.stringify(profileval), (headers = headers || {})["Content-Type"] = "application/json") : profileval instanceof Object ? (profileval = JSON.stringify(profileval), 
        (headers = headers || {})["Content-Type"] = "application/json", method = "POST") : (headers = headers || {})["Content-Type"] = "application/octet-stream", 
        ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, !1, headers, this.withCredentials, this.strictCallbacks);
    }
}, 
/*
     * Get activity profile from the LRS
     * @param {string} activityid   the id of the Activity this profile is about
     * @param {string} [profileid]    the id of the profile, if not included, the response will be a list of profileids
     *              associated with the activity
     * @param {object} [since]    date object or date string telling the LRS to return objects newer than the date supplied
     * @param {function [callback]    function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
     *                                    "actprofile", null,
     *                                    function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
     * >> {info: "the profile"}
     */
XAPIWrapper.prototype.getActivityProfile = function(activityid, profileid, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid)), profileid && (url += "&profileId=" + encodeURIComponent(profileid)), 
        since && null != (since = isDate(since)) && (url += "&since=" + encodeURIComponent(since.toISOString()));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !0, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
}, 
/*
     * Delete activity profile in the LRS
     * @param {string} activityid   the id of the Activity this profile is about
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} [matchHash]    the hash of the profile to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current profile or * to indicate no previous profile
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * ADL.XAPIWrapper.deleteActivityProfile("http://adlnet.gov/expapi/activities/question",
     *                                       "actprofile");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     */
XAPIWrapper.prototype.deleteActivityProfile = function(activityid, profileid, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";
        url = (url = url.replace("<activity ID>", encodeURIComponent(activityid))).replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, !1, headers, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
}, 
/*
     * Gets the Person object from the LRS based on an agent object.
     * The Person object may contain more information about an agent.
     * See the xAPI Spec for details.
     * @param {object} agent   the agent object to get a Person
     * @param {function [callback]    function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * var res = ADL.XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"});
     * ADL.XAPIWrapper.log(res);
     * >> <Person object>
     */
XAPIWrapper.prototype.getAgents = function(agent, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents?agent=<agent>";
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !0, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
}, 
/*
     * Store agent profile in the LRS
     * @param {object} agent   the agent this profile is related to
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} profileval   the profile
     * @param {string} [matchHash]    the hash of the profile to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current profile or * to indicate no previous profile
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} false if no agent profile is included
     * @example
     * var profile = {"info":"the agent profile"};
     * ADL.XAPIWrapper.sendAgentProfile({"mbox":"mailto:tom@example.com"},
     *                                   "agentprofile", profile, null, "*");
     */
XAPIWrapper.prototype.sendAgentProfile = function(agent, profileid, profileval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";
        url = (url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)))).replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var method = "PUT";
        if (!profileval) return this.log("No agent profile was included."), !1;
        profileval instanceof Array ? (profileval = JSON.stringify(profileval), (headers = headers || {})["Content-Type"] = "application/json") : profileval instanceof Object ? (profileval = JSON.stringify(profileval), 
        (headers = headers || {})["Content-Type"] = "application/json", method = "POST") : (headers = headers || {})["Content-Type"] = "application/octet-stream", 
        ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, !1, headers, this.withCredentials, this.strictCallbacks);
    }
}, 
/*
     * Get agnet profile from the LRS
     * @param {object} agent   the agent associated with this profile
     * @param {string} [profileid]    the id of the profile, if not included, the response will be a list of profileids
     *              associated with the agent
     * @param {object} [since]    date object or date string telling the LRS to return objects newer than the date supplied
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
     *                                  "agentprofile", null,
     *                                  function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
     * >> {info: "the agent profile"}
     */
XAPIWrapper.prototype.getAgentProfile = function(agent, profileid, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>";
        url = (url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)))).replace("<profileid>", encodeURIComponent(profileid)), 
        profileid && (url += "&profileId=" + encodeURIComponent(profileid)), since && null != (since = isDate(since)) && (url += "&since=" + encodeURIComponent(since.toISOString()));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, !0, null, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
}, 
/*
     * Delete agent profile in the LRS
     * @param {oject} agent   the id of the Agent this profile is about
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} [matchHash]    the hash of the profile to replace or * to replace any
     * @param {string} [noneMatchHash]    the hash of the current profile or * to indicate no previous profile
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * ADL.XAPIWrapper.deleteAgentProfile({"mbox":"mailto:tom@example.com"},
     *                                     "agentprofile");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     */
XAPIWrapper.prototype.deleteAgentProfile = function(agent, profileid, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";
        url = (url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)))).replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        matchHash && noneMatchHash ? log("Can't have both If-Match and If-None-Match") : matchHash ? headers = {
            "If-Match": ADL.formatHash(matchHash)
        } : noneMatchHash && (headers = {
            "If-None-Match": ADL.formatHash(noneMatchHash)
        });
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, !1, headers, this.withCredentials, this.strictCallbacks);
        if (void 0 === result || 404 == result.status) return null;
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
};

var location = (isNode = Boolean(!root.document)) ? 
// Node
{
    search: "",
    protocol: "https:"
} : 
// Browser
root.location;

// Node shim for browser location
/**
     * Cross environment implementation of a url parser
     * @param  {string} url  Url to parse
     * @return {object}  Parsed url
     */
function parseUrl(url) {
    // Node
    if (isNode) return require("url").parse(url);
    // Brower
        var a = document.createElement("a");
    return a.href = url, a;
}

// If in node, create a loose SHIM for XMLHttpRequest API
var XMLHttpRequest = root.XMLHttpRequest;

/*
     * formats a request in a way that IE will allow
     * @param {string} method   the http request method (ex: "PUT", "GET")
     * @param {string} url   the url to the request (ex: ADL.XAPIWrapper.lrs.endpoint + "statements")
     * @param {array} [headers]   headers to include in the request
     * @param {string} [data]   the body of the request, if there is one
     * @return {object} xhr response object
     */
function ie_request(method, url, headers, data) {
    var newUrl = url, formData = new Array(), qsIndex = newUrl.indexOf("?");
    //Everything that was on query string goes into form vars
        //Headers
    if (0 < qsIndex && (formData.push(newUrl.substr(qsIndex + 1)), newUrl = newUrl.substr(0, qsIndex)), 
    //Method has to go on querystring, and nothing else
    newUrl = newUrl + "?method=" + method, null !== headers) for (var headerName in headers) headers.hasOwnProperty(headerName) && formData.push(headerName + "=" + encodeURIComponent(headers[headerName]));
    //The original data is repackaged as "content" form var
        return null !== data && formData.push("content=" + encodeURIComponent(data)), 
    {
        method: "POST",
        url: newUrl,
        headers: {},
        data: formData.join("&")
    };
}

/*!
    Excerpt from: Math.uuid.js (v1.4)
    http://www.broofa.com
    mailto:robert@broofa.com
    Copyright (c) 2010 Robert Kieffer
    Dual licensed under the MIT and GPL licenses.
    */ function _getobj(obj, path) {
    var parts = path.split("."), part = parts[0];
    return path = parts.slice(1).join("."), obj[part] || (/\[\]$/.test(part) ? obj[part = part.slice(0, -2)] = [] : obj[part] = {}), 
    path ? _getobj(obj[part], path) : obj[part];
}

/*******************************************************************************
   * XAPIStatement - a convenience class to wrap statement objects
   *
   * This sub-API is supposed to make it easier to author valid xAPI statements
   * by adding constructors and encouraging best practices. All objects in this
   * API are fully JSON-compatible, so anything expecting an xAPI statement can
   * take an improved statement and vice versa.
   *
   * A working knowledge of what exactly the LRS expects is still expected,
   * but it's easier to map an 'I did this' statement to xAPI now.
   *
   * Tech note: All constructors also double as shallow clone functions. E.g.
   *
   *   var activity1 = new Activity('A walk in the park');
   *   var activity2 = new Activity(activity1);
   *   var activity3 = new Activity(stmt_from_lrs.object);
   *
   *******************************************************************************/
/*
   * A convenient JSON-compatible xAPI statement wrapper
   * All args are optional, but the statement may not be complete or valid
   * Can also pass an Agent IFI, Verb ID, and an Activity ID in lieu of these args
   * @param {string} [actor]   The Agent or Group committing the action described by the statement
   * @param {string} [verb]   The Verb for the action described by the statement
   * @param {string} [object]   The receiver of the action. An Agent, Group, Activity, SubStatement, or StatementRef
   * @example
   * var stmt = new ADL.XAPIStatement(
   *     'mailto:steve.vergenz.ctr@adlnet.gov',
   *    'http://adlnet.gov/expapi/verbs/launched',
   *    'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
   * );
   * >> {
   * "actor": {
   *     "objectType": "Agent",
   *     "mbox": "mailto:steve.vergenz.ctr@adlnet.gov" },
   * "verb": {
   *     "id": "http://adlnet.gov/expapi/verbs/launched" },
   * "object": {
   *     "objectType": "Activity",
   *     "id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox" },
   * "result": {
   *      "An optional property that represents a measured outcome related to the Statement in which it is included."}}
   */ isNode && ((XMLHttpRequest = function() {
    this.method = "GET", this.url = null, this.async = !0, this.headers = {};
}).prototype = {
    open: function(method, url, async) {
        if (!1 === async) throw "ADL xAPIWrapper does not support synchronous http requests in node";
        this.method = method, this.url = url, this.withCredentials = !0, this.crossDomain = !0, 
        this.responseText = "", this.responseJSON = null, this.readyState = 0, this.status = 0, 
        this.onreadystatechange = function() {}, this.onerror = function(error) {}, this.onload = function() {};
    },
    setRequestHeader: function(name, value) {
        this.headers[name] = value;
    },
    send: function(data) {
        var http = this.url.includes("https:") ? require("https") : require("http"), options = {
            method: this.method,
            headers: this.headers
        }, parsedUrl = parseUrl(this.url);
        for (var k in parsedUrl) options[k] = parsedUrl[k];
        var req = http.request(options, function(res) {
            res.setEncoding("utf8"), this.status = res.statusCode, res.on("data", function(d) {
                this.responseText += d;
            }.bind(this)), res.on("end", function() {
                this.readyState = 4;
                try {
                    this.responseJSON = JSON.parse(this.responseText);
                } catch (error) {
                    this.responseJSON = null;
                }
                this.onload();
            }.bind(this));
        }.bind(this));
        req.on("error", function(e) {
            this.readyState = 4, this.onerror();
        }.bind(this)), req.end(data);
    }
}), ADL.ruuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = 16 * Math.random() | 0;
        return ("x" == c ? r : 3 & r | 8).toString(16);
    });
}, 
/*
     * dateFromISOString
     * parses an ISO string into a date object
     * isostr - the ISO string
     */
ADL.dateFromISOString = function(isostr) {
    var d = isostr.match(new RegExp("([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T| ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?")), offset = 0, date = new Date(d[1], 0, 1);
    d[3] && date.setMonth(d[3] - 1), d[5] && date.setDate(d[5]), d[7] && date.setHours(d[7]), 
    d[8] && date.setMinutes(d[8]), d[10] && date.setSeconds(d[10]), d[12] && date.setMilliseconds(1e3 * Number("0." + d[12])), 
    d[14] && (offset = 60 * Number(d[16]) + Number(d[17]), offset *= "-" == d[15] ? 1 : -1), 
    offset -= date.getTimezoneOffset(), time = Number(date) + 60 * offset * 1e3;
    var dateToReturn = new Date();
    return dateToReturn.setTime(Number(time)), dateToReturn;
}, 
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
     * @param {boolean} withCredentials
     * @param {boolean} strictCallbacks Callback must be executed and first param is error or null if no error
     * @return {object} xhr response object
     */
ADL.XHR_request = function(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders, withCredentials, strictCallbacks) {
    "use strict";
    var xhr, ieModeRequest, result, extended, prop, until, finished = !1, xDomainRequest = !1, ieXDomain = !1, urlparts = url.toLowerCase().match(/^(.+):\/\/([^:\/]*):?(\d+)?(\/.*)?$/), headers = {
        "Content-Type": "application/json"
    };
    //Consolidate headers
        if (headers.Authorization = auth, headers["X-Experience-API-Version"] = ADL.XAPIWrapper.xapiVersion, 
    null !== extraHeaders) for (var headerName in extraHeaders) extraHeaders.hasOwnProperty(headerName) && (headers[headerName] = extraHeaders[headerName]);
    //See if this really is a cross domain
        //Add extended LMS-specified values to the URL
    if ((xDomainRequest = location.protocol.toLowerCase() !== urlparts[1] || location.hostname.toLowerCase() !== urlparts[2]) || (xDomainRequest = (null === urlparts[3] ? "http" === urlparts[1] ? "80" : "443" : urlparts[3]) === location.port), 
    null !== lrs && void 0 !== lrs.extended) {
        for (prop in extended = new Array(), lrs.extended) extended.push(prop + "=" + encodeURIComponent(lrs.extended[prop]));
        0 < extended.length && (url += (-1 < url.indexOf("?") ? "&" : "?") + extended.join("&"));
    }
    //If it's not cross domain or we're not using IE, use the usual XmlHttpRequest
        var windowsVersionCheck = root.XDomainRequest && root.XMLHttpRequest && void 0 === new XMLHttpRequest().responseType;
    if (xDomainRequest && void 0 !== windowsVersionCheck && !1 !== windowsVersionCheck) ieXDomain = !0, 
    ieModeRequest = ie_request(method, url, headers, data), (xhr = new XDomainRequest()).open(ieModeRequest.method, ieModeRequest.url); else for (var headerName in (xhr = new XMLHttpRequest()).withCredentials = withCredentials, 
    //allow cross domain cookie based auth
    xhr.open(method, url, null != callback), headers) xhr.setRequestHeader(headerName, headers[headerName]);
    //Setup request callback
        function requestComplete() {
        if (finished) return result;
        // may be in sync or async mode, using XMLHttpRequest or IE XDomainRequest, onreadystatechange or
        // onload or both might fire depending upon browser, just covering all bases with event hooks and
        // using 'finished' flag to avoid triggering events multiple times
        finished = !0;
        var notFoundOk = ignore404 && 404 === xhr.status;
        if (!(void 0 === xhr.status || 200 <= xhr.status && xhr.status < 400 || notFoundOk)) {
            var warning;
            try {
                warning = "There was a problem communicating with the Learning Record Store. ( " + xhr.status + " | " + xhr.response + " )" + url;
            } catch (ex) {
                warning = ex.toString();
            }
            return ADL.XAPIWrapper.log(warning), ADL.xhrRequestOnError(xhr, method, url, callback, callbackargs, strictCallbacks), 
            result = xhr;
        }
        if (!callback) return result = xhr;
        if (callbackargs) strictCallbacks ? callback(null, xhr, callbackargs) : callback(xhr, callbackargs); else {
            var body;
            try {
                body = JSON.parse(xhr.responseText);
            } catch (e) {
                body = xhr.responseText;
            }
            strictCallbacks ? callback(null, xhr, body) : callback(xhr, body);
        }
    }
    if (xhr.onreadystatechange = function() {
        if (4 === xhr.readyState) return requestComplete();
    }, xhr.onload = requestComplete, xhr.onerror = requestComplete, 
    //xhr.onerror =  ADL.xhrRequestOnError(xhr, method, url);
    xhr.send(ieXDomain ? ieModeRequest.data : data), !callback) {
        // synchronous
        if (ieXDomain) for (
        // synchronous call in IE, with no asynchronous mode available.
        until = 1e3 + new Date(); new Date() < until && 4 !== xhr.readyState && !finished; ) delay();
        return requestComplete();
    }
}, 
/*
     * Holder for custom global error callback
     * @param {object} xhr   xhr object or null
     * @param {string} method   XMLHttpRequest request method
     * @param {string} url   full endpoint url
     * @param {function} callback   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     * @param {object} [callbackargs]   additional javascript object to be passed to the callback function
     * @param {boolean} strictCallbacks Callback must be executed and first param is error or null if no error
     * @example
     * ADL.xhrRequestOnError = function(xhr, method, url, callback, callbackargs) {
     *   console.log(xhr);
     *   alert(xhr.status + " " + xhr.statusText + ": " + xhr.response);
     * };
     */
ADL.xhrRequestOnError = function(xhr, method, url, callback, callbackargs, strictCallbacks) {
    if (callback && strictCallbacks) {
        var error, status = xhr ? xhr.status : void 0;
        if (error = status ? new Error("Request error: " + xhr.status) : 0 === status || null === status ? new Error("Request error: aborted") : new Error("Reqeust error: unknown"), 
        callbackargs) callback(error, xhr, callbackargs); else {
            var body;
            try {
                body = JSON.parse(xhr.responseText);
            } catch (e) {
                body = xhr.responseText;
            }
            callback(error, xhr, body);
        }
    }
}, ADL.formatHash = function(hash) {
    return "*" === hash ? hash : '"' + hash + '"';
}, ADL.XAPIWrapper = new XAPIWrapper(Config, !1);

var XAPIStatement = function(actor, verb, object, result) {
    // initialize
    // if first arg is an xapi statement, parse
    if (actor && actor.actor && actor.verb && actor.object) {
        var stmt = actor;
        for (var i in stmt) "actor" != i && "verb" != i && "object" != i && (this[i] = stmt[i]);
        actor = stmt.actor, verb = stmt.verb, object = stmt.object;
    }
    actor ? actor instanceof Agent ? this.actor = actor : "Agent" !== actor.objectType && actor.objectType ? "Group" === actor.objectType && (this.actor = new Group(actor)) : this.actor = new Agent(actor) : this.actor = null, 
    this.verb = verb ? verb instanceof Verb ? verb : new Verb(verb) : null, 
    // decide what kind of object was passed
    object ? "Activity" !== object.objectType && object.objectType ? "Agent" === object.objectType ? this.object = object instanceof Agent ? object : new Agent(object) : "Group" === object.objectType ? this.object = object instanceof Group ? object : new Group(object) : "StatementRef" === object.objectType ? this.object = object instanceof StatementRef ? object : new StatementRef(object) : "SubStatement" === object.objectType ? this.object = object instanceof SubStatement ? object : new SubStatement(object) : this.object = null : this.object = object instanceof Activity ? object : new Activity(object) : this.object = null, 
    // add support for result object
    result && (this.result = result), this.generateId = function() {
        this.id = ADL.ruuid();
    };
};

XAPIStatement.prototype.toString = function() {
    return this.actor.toString() + " " + this.verb.toString() + " " + this.object.toString() + " " + this.result.toString();
}, XAPIStatement.prototype.isValid = function() {
    return this.actor && this.actor.isValid() && this.verb && this.verb.isValid() && this.object && this.object.isValid() && this.result && this.result.isValid();
}, XAPIStatement.prototype.generateRegistration = function() {
    _getobj(this, "context").registration = ADL.ruuid();
}, XAPIStatement.prototype.addParentActivity = function(activity) {
    _getobj(this, "context.contextActivities.parent[]").push(new Activity(activity));
}, XAPIStatement.prototype.addGroupingActivity = function(activity) {
    _getobj(this, "context.contextActivities.grouping[]").push(new Activity(activity));
}, XAPIStatement.prototype.addOtherContextActivity = function(activity) {
    _getobj(this, "context.contextActivities.other[]").push(new Activity(activity));
};

/*
   * Provides an easy constructor for xAPI agent objects
   * @param {string} identifier   One of the Inverse Functional Identifiers specified in the spec.
   *     That is, an email, a hashed email, an OpenID, or an account object.
   *     See (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#inversefunctional)
   * @param {string} [name]   The natural-language name of the agent
   */
var Agent = function(identifier, name) {
    // figure out what type of identifier was given
    if (this.objectType = "Agent", this.name = name, identifier && (identifier.mbox || identifier.mbox_sha1sum || identifier.openid || identifier.account)) for (var i in identifier) this[i] = identifier[i]; else /^mailto:/.test(identifier) ? this.mbox = identifier : /^[0-9a-f]{40}$/i.test(identifier) ? this.mbox_sha1sum = identifier : /^http[s]?:/.test(identifier) ? this.openid = identifier : identifier && identifier.homePage && identifier.name && (this.account = identifier);
};

Agent.prototype.toString = function() {
    return this.name || this.mbox || this.openid || this.mbox_sha1sum || this.account.name;
}, Agent.prototype.isValid = function() {
    return this.mbox || this.mbox_sha1sum || this.openid || this.account.homePage && this.account.name || "Group" === this.objectType && this.member;
};

/*
   * A type of agent, can contain multiple agents
   * @param {string} [identifier]   (optional if `members` specified) See Agent.
   * @param {string} [members]    An array of Agents describing the membership of the group
   * @param {string} [name]   The natural-language name of the agent
   */
var Group = function(identifier, members, name) {
    Agent.call(this, identifier, name), this.member = members, this.objectType = "Group";
};

Group.prototype = new Agent();

/*
   * Really only provides a convenient language map
   * @param {string} id   The IRI of the action taken
   * @param {string} [description]    An English-language description, or a Language Map
   */
var Verb = function(id, description) {
    // if passed a verb object then copy and return
    if (id && id.id) for (var i in id) this[i] = id[i]; else 
    // save id and build language map
    this.id = id, description && ("string" == typeof description || description instanceof String ? this.display = {
        "en-US": description
    } : this.display = description);
};

Verb.prototype.toString = function() {
    return this.display && (this.display["en-US"] || this.display.en) ? this.display["en-US"] || this.display.en : this.id;
}, Verb.prototype.isValid = function() {
    return this.id;
};

/*
   * Describes an object that an agent interacts with
   * @param {string} id   The unique activity IRI
   * @param {string} name   An English-language identifier for the activity, or a Language Map
   * @param {string} description   An English-language description of the activity, or a Language Map
   */
var Activity = function(id, name, description) {
    // if first arg is activity, copy everything over
    if (id && id.id) {
        var act = id;
        for (var i in act) this[i] = act[i];
    } else this.objectType = "Activity", this.id = id, (name || description) && (this.definition = {}, 
    "string" == typeof name || name instanceof String ? this.definition.name = {
        "en-US": name
    } : name && (this.definition.name = name), "string" == typeof description || description instanceof String ? this.definition.description = {
        "en-US": description
    } : description && (this.definition.description = description));
};

Activity.prototype.toString = function() {
    return this.definition && this.definition.name && (this.definition.name["en-US"] || this.definition.name.en) ? this.definition.name["en-US"] || this.definition.name.en : this.id;
}, Activity.prototype.isValid = function() {
    return this.id && (!this.objectType || "Activity" === this.objectType);
};

/*
   * An object that refers to a separate statement
   * @param {string} id   The UUID of another xAPI statement
   */
var StatementRef = function(id) {
    if (id && id.id) for (var i in id) this[i] = id[i]; else this.objectType = "StatementRef", 
    this.id = id;
};

StatementRef.prototype.toString = function() {
    return "statement(" + this.id + ")";
}, StatementRef.prototype.isValid = function() {
    return this.id && this.objectType && "StatementRef" === this.objectType;
};

/*
   * A self-contained statement as the object of another statement
   * See XAPIStatement for constructor details
   * @param {string} actor   The Agent or Group committing the action described by the statement
   * @param {string} verb   The Verb for the action described by the statement
   * @param {string} object   The receiver of the action. An Agent, Group, Activity, or StatementRef
   */
var SubStatement = function(actor, verb, object) {
    XAPIStatement.call(this, actor, verb, object), this.objectType = "SubStatement", 
    delete this.id, delete this.stored, delete this.version, delete this.authority;
};

SubStatement.prototype = new XAPIStatement(), SubStatement.prototype.toString = function() {
    return '"' + SubStatement.prototype.prototype.toString.call(this) + '"';
}, XAPIStatement.Agent = Agent, XAPIStatement.Group = Group, XAPIStatement.Verb = Verb, 
XAPIStatement.Activity = Activity, XAPIStatement.StatementRef = StatementRef, XAPIStatement.SubStatement = SubStatement, 
ADL.XAPIStatement = XAPIStatement;

var onBrowser = "undefined" != typeof window, getObjDefName = function(o) {
    if (o.definition && o.definition.name) return ADL.xapiutil.getLangVal(o.definition.name);
}, getSubStatementDisplay = function(o) {
    if ("SubStatement" === o.objectType && ("SubStatement" !== o.object.objectType && !(o.id || o.stored || o.version || o.authority))) return ADL.xapiutil.getActorId(o.actor) + ":" + ADL.xapiutil.getVerbDisplay(o.verb) + ":" + ADL.xapiutil.getObjectId(o.object);
};

function getQueryVariable(variable) {
    for (var vars = location.search.substring(1).split("&"), i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (decodeURIComponent(pair[0]) == variable) return decodeURIComponent(pair[1]);
    }
    // console.log('Query variable %s not found', variable);
}

function cb_wrap(cb) {
    return function() {
        var args = arguments;
        setTimeout(function() {
            for (var callerArgs = [], i = 0; i < args.length; i++) callerArgs.push(args[i]);
            cb.apply(window, callerArgs);
        }, 0);
    };
}

//The library will append the necessary launch info to each new A that is linked to the page.
//NOTE: This cannot work if you programmatically change the window location. If you do, you must
//execute the logic in setupCourseLinks to send the initialization data to the new location (if
//you wish that new location to track as part of this session)
function observeForNewLinks() {
    // select the target node
    var target = document.body;
    // create an observer instance
        // pass in the target node, as well as the observer options
    new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for (var i in mutation.addedNodes) {
                if (mutation.addedNodes.hasOwnProperty(i)) if (mutation.addedNodes[i].constructor == HTMLAnchorElement) setupCourseLinks([ mutation.addedNodes[i] ]);
            }
        });
    }).observe(target, {
        attributes: !0,
        childList: !0,
        subtree: !0
    });
}

//This library will init all links in the DOM that include the attribute "courseLink = true"
//with the information necessary for the document at that link to track as part of this session.
function setupCourseLinks(_nodes) {
    var query = "xAPILaunchKey=" + getQueryVariable("xAPILaunchKey") + "&xAPILaunchService=" + getQueryVariable("xAPILaunchService");
    getQueryVariable("encrypted") && (query += "&encrypted=true");
    for (var i = 0; i < _nodes.length; i++) {
        var link = _nodes[i], href = link.href, courseLink = link.attributes.getNamedItem("courselink");
        courseLink && "true" == courseLink.value && (href = -1 < href.indexOf("?") ? href + "&" + query : href + "?" + query, 
        link.href = href);
    }
}

function xAPILaunch(cb, terminate_on_unload, strict_callbacks) {
    if (isNode) throw "ADL.launch not supported in node";
    cb = cb_wrap(cb);
    try {
        var launchToken = getQueryVariable("xAPILaunchKey"), launchEndpoint = getQueryVariable("xAPILaunchService");
        getQueryVariable("encrypted");
        if (xAPILaunch.terminate = function(message) {
            var launch = new URL(launchEndpoint);
            launch.pathname += "launch/" + launchToken + "/terminate";
            var xhr2 = new XMLHttpRequest();
            xhr2.withCredentials = !0, xhr2.crossDomain = !0, xhr2.open("POST", launch.toString(), !1), 
            xhr2.setRequestHeader("Content-type", "application/json"), xhr2.send(JSON.stringify({
                code: 0,
                description: message || "User closed content"
            }));
        }, !launchToken || !launchEndpoint) return cb("invalid launch parameters");
        var launch = new URL(launchEndpoint);
        launch.pathname += "launch/" + launchToken;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = !0, xhr.crossDomain = !0, xhr.onerror = function(err) {
            //exit the try catch so inner execptions in the callback don't trigger this catch
            setTimeout(function() {
                return cb(err);
            });
        }, xhr.onload = function(e) {
            if (200 !== xhr.status) return xhr.onerror(xhr.responseText);
            var body = JSON.parse(xhr.responseText), launchData = body, conf = {};
            conf.endpoint = launchData.endpoint, conf.actor = launchData.actor, conf.withCredentials = !0, 
            conf.strictCallbacks = strict_callbacks || !1, root.onunload = function() {
                terminate_on_unload && xAPILaunch.terminate("User closed content");
            };
            var wrapper = new ADL.XAPIWrapper.constructor();
            return wrapper.changeConfig(conf), 
            //Links that include "courseLink='true'"
            setupCourseLinks(document.body.querySelectorAll("a")), 
            //Also, if links are added dynamically, we will do the same logic for those links.
            observeForNewLinks(), cb(null, body, wrapper);
        }, xhr.open("POST", launch.toString(), !0), xhr.send();
    } catch (e) {
        cb(e);
    }
}

ADL.xapiutil = {}, ADL.xapiutil.getLang = function() {
    var lang;
    if ("undefined" != typeof navigator) lang = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage; else if ("undefined" != typeof process && void 0 !== process.env && void 0 !== process.env.LANG) {
        var str = process.env.LANG;
        lang = (lang = str.slice(0, str.indexOf("."))).replace(/_/, "-");
    }
    return lang || "en-US";
}, ADL.xapiutil.getLangVal = function(langprop) {
    if (langprop && 0 != Object.keys(langprop).length) 
    // test that langprop is a dict (obj)
    // skips if not a dict(obj) and returns
    {
        for (var ret, lang = ADL.xapiutil.getLang(), dispGotten = !1; //test and retest
        langprop[lang] ? (ret = langprop[lang], dispGotten = !0) : lang.indexOf("-") && (lang = lang.substring(0, lang.lastIndexOf("-"))), 
        !dispGotten && "" !== lang; ) ;
        return ret;
    }
}, ADL.xapiutil.getMoreStatements = function(iterations, callback, searchParams) {
    if (!onBrowser) throw new Error("Node not supported.");
    var stmts = [];
    ADL.XAPIWrapper.getStatements(searchParams, null, function getMore(r) {
        if (r && r.response) {
            var res = JSON.parse(r.response);
            res.statements && (stmts = stmts.concat(res.statements), iterations-- <= 0 ? callback(stmts) : res.more && "" !== res.more ? ADL.XAPIWrapper.getStatements(searchParams, res.more, getMore) : "" === res.more && callback(stmts));
        }
    });
}, ADL.xapiutil.getActorId = function(a) {
    return a.mbox || a.openid || a.mbox_sha1sum || a.account;
}, ADL.xapiutil.getActorIdString = function(a) {
    var id = a.mbox || a.openid || a.mbox_sha1sum;
    return id || (id = a.account ? a.account.homePage + ":" + a.account.name : a.member ? "Anon Group " + a.member : "unknown"), 
    id;
}, ADL.xapiutil.getActorDisplay = function(a) {
    return a.name || ADL.xapiutil.getActorIdString(a);
}, ADL.xapiutil.getVerbDisplay = function(v) {
    if (v) return v.display && ADL.xapiutil.getLangVal(v.display) || v.id;
}, ADL.xapiutil.getObjectType = function(o) {
    return o.objectType || (o.id ? "Activity" : "Agent");
}, ADL.xapiutil.getObjectId = function(o) {
    if (o.id) return o.id;
    var type = ADL.xapiutil.getObjectType(o);
    return "Agent" === type || "Group" === type ? ADL.xapiutil.getActorId(o) : void 0;
}, ADL.xapiutil.getObjectIdString = function(o) {
    if (!o) return "unknown";
    if (o.id) return o.id;
    var type = ADL.xapiutil.getObjectType(o);
    return "Agent" === type || "Group" === type ? ADL.xapiutil.getActorIdString(o) : "SubStatement" == type ? getSubStatementDisplay(o) : "unknown";
}, ADL.xapiutil.getObjectDisplay = function(o) {
    if (!o) return "unknown";
    var disp = getObjDefName(o) || o.name || o.id;
    if (!disp) {
        var type = ADL.xapiutil.getObjectType(o);
        "Agent" === type || "Group" == type ? disp = ADL.xapiutil.getActorDisplay(o) : "SubStatement" == type && (disp = getSubStatementDisplay(o));
    }
    return disp;
};

var isNode;

// Node shim for browser location
location = (isNode = Boolean(!root.document)) ? 
// Node
{
    search: "",
    protocol: "https:"
} : 
// Browser
root.location;

ADL.launch = xAPILaunch;
    return ADL;
}));
