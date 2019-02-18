/*! xAPIWrapper v 1.10.1 | Built on 2019-02-18 16:58:53+0000 */
(function(root, factory){
    // text-encoder uses module.exports which isn't allowed inside
    // the main closure as it breaks the module export in node
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
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
var CryptoJS = CryptoJS || function(Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};
    /**
     * Library namespace.
     */    var C_lib = C.lib = {};
    /**
     * Base object for prototypal inheritance.
     */    var Base = C_lib.Base = function() {
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
                                if (overrides) {
                    subtype.mixIn(overrides);
                }
                // Create default initializer
                                if (!subtype.hasOwnProperty("init")) {
                    subtype.init = function() {
                        subtype.$super.init.apply(this, arguments);
                    };
                }
                // Initializer's prototype is the subtype object
                                subtype.init.prototype = subtype;
                // Reference supertype
                                subtype.$super = this;
                return subtype;
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
                instance.init.apply(instance, arguments);
                return instance;
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
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }
                // IE won't copy toString using the loop above
                                if (properties.hasOwnProperty("toString")) {
                    this.toString = properties.toString;
                }
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
    }();
    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */    var WordArray = C_lib.WordArray = Base.extend({
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
            words = this.words = words || [];
            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
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
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;
            // Clamp excess bits
                        this.clamp();
            // Concat
                        if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                    thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
                }
            } else if (thatWords.length > 65535) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[thisSigBytes + i >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;
            // Chainable
                        return this;
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
            var words = this.words;
            var sigBytes = this.sigBytes;
            // Clamp
                        words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
            words.length = Math.ceil(sigBytes / 4);
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
            clone.words = this.words.slice(0);
            return clone;
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
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push(Math.random() * 4294967296 | 0);
            }
            return new WordArray.init(words, nBytes);
        }
    });
    /**
     * Encoder namespace.
     */    var C_enc = C.enc = {};
    /**
     * Hex encoding strategy.
     */    var Hex = C_enc.Hex = {
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
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            // Convert
                        var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 15).toString(16));
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
            // Shortcut
            var hexStrLength = hexStr.length;
            // Convert
                        var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }
            return new WordArray.init(words, hexStrLength / 2);
        }
    };
    /**
     * Latin1 encoding strategy.
     */    var Latin1 = C_enc.Latin1 = {
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
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            // Convert
                        var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
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
            // Shortcut
            var latin1StrLength = latin1Str.length;
            // Convert
                        var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
            }
            return new WordArray.init(words, latin1StrLength);
        }
    };
    /**
     * UTF-8 encoding strategy.
     */    var Utf8 = C_enc.Utf8 = {
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
    };
    /**
     * Base64 encoding strategy.
     */    var Base64 = C_enc.Base64 = {
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
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;
            // Clamp excess bits
                        wordArray.clamp();
            // Convert
                        var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
                var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
                var triplet = byte1 << 16 | byte2 << 8 | byte3;
                for (var j = 0; j < 4 && i + j * .75 < sigBytes; j++) {
                    base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
                }
            }
            // Add padding
                        var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }
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
            var base64StrLength = base64Str.length;
            var map = this._map;
            // Ignore padding
                        var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }
            // Convert
                        var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << i % 4 * 2;
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> 6 - i % 4 * 2;
                    words[nBytes >>> 2] |= (bits1 | bits2) << 24 - nBytes % 4 * 8;
                    nBytes++;
                }
            }
            return WordArray.create(words, nBytes);
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    };
    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function() {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
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
            if (typeof data == "string") {
                data = Utf8.parse(data);
            }
            // Append
                        this._data.concat(data);
            this._nDataBytes += data.sigBytes;
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
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            // Count blocks ready
                        var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }
            // Count words ready
                        var nWordsReady = nBlocksReady * blockSize;
            // Count bytes ready
                        var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
            // Process blocks
                        if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }
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
            clone._data = this._data.clone();
            return clone;
        },
        _minBufferSize: 0
    });
    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
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
            this.cfg = this.cfg.extend(cfg);
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
            BufferedBlockAlgorithm.reset.call(this);
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
            // Append
            this._append(messageUpdate);
            // Update the hash
                        this._process();
            // Chainable
                        return this;
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
            if (messageUpdate) {
                this._append(messageUpdate);
            }
            // Perform concrete-hasher logic
                        var hash = this._doFinalize();
            return hash;
        },
        blockSize: 512 / 32,
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
    });
    /**
     * Algorithm namespace.
     */    var C_algo = C.algo = {};
    // Reusable object
        var W = [];
    /**
     * SHA-1 hash algorithm.
     */    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function() {
            this._hash = new WordArray.init([ 1732584193, 4023233417, 2562383102, 271733878, 3285377520 ]);
        },
        _doProcessBlock: function(M, offset) {
            // Shortcut
            var H = this._hash.words;
            // Working variables
                        var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            // Computation
                        for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = n << 1 | n >>> 31;
                }
                var t = (a << 5 | a >>> 27) + e + W[i];
                if (i < 20) {
                    t += (b & c | ~b & d) + 1518500249;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 1859775393;
                } else if (i < 60) {
                    t += (b & c | b & d | c & d) - 1894007588;
                } else /* if (i < 80) */ {
                    t += (b ^ c ^ d) - 899497514;
                }
                e = d;
                d = c;
                c = b << 30 | b >>> 2;
                b = a;
                a = t;
            }
            // Intermediate hash value
                        H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
            H[4] = H[4] + e | 0;
        },
        _doFinalize: function() {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            // Add padding
                        dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            // Hash final blocks
                        this._process();
            // Return final computed hash
                        return this._hash;
        },
        clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
        }
    });
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
     */    C.SHA1 = Hasher._createHelper(SHA1);
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
     */    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
    return C;
}(Math);

//add the sha256 functions
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/ var CryptoJS = CryptoJS || function(h, s) {
    var f = {}, g = f.lib = {}, q = function() {}, m = g.Base = {
        extend: function(a) {
            q.prototype = this;
            var c = new q();
            a && c.mixIn(a);
            c.hasOwnProperty("init") || (c.init = function() {
                c.$super.init.apply(this, arguments);
            });
            c.init.prototype = c;
            c.$super = this;
            return c;
        },
        create: function() {
            var a = this.extend();
            a.init.apply(a, arguments);
            return a;
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
            a = this.words = a || [];
            this.sigBytes = c != s ? c : 4 * a.length;
        },
        toString: function(a) {
            return (a || k).stringify(this);
        },
        concat: function(a) {
            var c = this.words, d = a.words, b = this.sigBytes;
            a = a.sigBytes;
            this.clamp();
            if (b % 4) for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4); else if (65535 < d.length) for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2]; else c.push.apply(c, d);
            this.sigBytes += a;
            return this;
        },
        clamp: function() {
            var a = this.words, c = this.sigBytes;
            a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
            a.length = h.ceil(c / 4);
        },
        clone: function() {
            var a = m.clone.call(this);
            a.words = this.words.slice(0);
            return a;
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
                var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                d.push((e >>> 4).toString(16));
                d.push((e & 15).toString(16));
            }
            return d.join("");
        },
        parse: function(a) {
            for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
            return new r.init(d, c / 2);
        }
    }, n = l.Latin1 = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
            return d.join("");
        },
        parse: function(a) {
            for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
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
            this._data = new r.init();
            this._nDataBytes = 0;
        },
        _append: function(a) {
            "string" == typeof a && (a = j.parse(a));
            this._data.concat(a);
            this._nDataBytes += a.sigBytes;
        },
        _process: function(a) {
            var c = this._data, d = c.words, b = c.sigBytes, e = this.blockSize, f = b / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
            a = f * e;
            b = h.min(4 * a, b);
            if (a) {
                for (var g = 0; g < a; g += e) this._doProcessBlock(d, g);
                g = d.splice(0, a);
                c.sigBytes -= b;
            }
            return new r.init(g, b);
        },
        clone: function() {
            var a = m.clone.call(this);
            a._data = this._data.clone();
            return a;
        },
        _minBufferSize: 0
    });
    g.Hasher = u.extend({
        cfg: m.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a);
            this.reset();
        },
        reset: function() {
            u.reset.call(this);
            this._doReset();
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this;
        },
        finalize: function(a) {
            a && this._append(a);
            return this._doFinalize();
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

(function(h) {
    for (var s = CryptoJS, f = s.lib, g = f.WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function(a) {
        return 4294967296 * (a - (a | 0)) | 0;
    }, k = 2, n = 0; 64 > n; ) {
        var j;
        a: {
            j = k;
            for (var u = h.sqrt(j), t = 2; t <= u; t++) if (!(j % t)) {
                j = !1;
                break a;
            }
            j = !0;
        }
        j && (8 > n && (m[n] = l(h.pow(k, .5))), r[n] = l(h.pow(k, 1 / 3)), n++);
        k++;
    }
    var a = [], f = f.SHA256 = q.extend({
        _doReset: function() {
            this._hash = new g.init(m.slice(0));
        },
        _doProcessBlock: function(c, d) {
            for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
                if (16 > p) a[p] = c[d + p] | 0; else {
                    var k = a[p - 15], l = a[p - 2];
                    a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16];
                }
                k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p];
                l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g);
                q = n;
                n = m;
                m = h;
                h = j + k | 0;
                j = g;
                g = f;
                f = e;
                e = k + l | 0;
            }
            b[0] = b[0] + e | 0;
            b[1] = b[1] + f | 0;
            b[2] = b[2] + g | 0;
            b[3] = b[3] + j | 0;
            b[4] = b[4] + h | 0;
            b[5] = b[5] + m | 0;
            b[6] = b[6] + n | 0;
            b[7] = b[7] + q | 0;
        },
        _doFinalize: function() {
            var a = this._data, d = a.words, b = 8 * this._nDataBytes, e = 8 * a.sigBytes;
            d[e >>> 5] |= 128 << 24 - e % 32;
            d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
            d[(e + 64 >>> 9 << 4) + 15] = b;
            a.sigBytes = 4 * d.length;
            this._process();
            return this._hash;
        },
        clone: function() {
            var a = q.clone.call(this);
            a._hash = this._hash.clone();
            return a;
        }
    });
    s.SHA256 = q._createHelper(f);
    s.HmacSHA256 = q._createHmacHelper(f);
})(Math);

(function() {
    var h = CryptoJS, s = h.enc.Utf8;
    h.algo.HMAC = h.lib.Base.extend({
        init: function(f, g) {
            f = this._hasher = new f.init();
            "string" == typeof g && (g = s.parse(g));
            var h = f.blockSize, m = 4 * h;
            g.sigBytes > m && (g = f.finalize(g));
            g.clamp();
            for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) k[j] ^= 1549556828, 
            n[j] ^= 909522486;
            r.sigBytes = l.sigBytes = m;
            this.reset();
        },
        reset: function() {
            var f = this._hasher;
            f.reset();
            f.update(this._iKey);
        },
        update: function(f) {
            this._hasher.update(f);
            return this;
        },
        finalize: function(f) {
            var g = this._hasher;
            f = g.finalize(f);
            g.reset();
            return g.finalize(this._oKey.clone().concat(f));
        }
    });
})();

(function(root) {
    if (typeof TextDecoder === "undefined") {
        function TextEncoder(encoding) {
            if (encoding !== "utf8") throw "TextDecoder only supports utf8";
        }
        TextEncoder.prototype.encode = function(string) {
            var octets = [];
            var length = string.length;
            var i = 0;
            while (i < length) {
                var codePoint = string.codePointAt(i);
                var c = 0;
                var bits = 0;
                if (codePoint <= 127) {
                    c = 0;
                    bits = 0;
                } else if (codePoint <= 2047) {
                    c = 6;
                    bits = 192;
                } else if (codePoint <= 65535) {
                    c = 12;
                    bits = 224;
                } else if (codePoint <= 2097151) {
                    c = 18;
                    bits = 240;
                }
                octets.push(bits | codePoint >> c);
                c -= 6;
                while (c >= 0) {
                    octets.push(128 | codePoint >> c & 63);
                    c -= 6;
                }
                i += codePoint >= 65536 ? 2 : 1;
            }
            return octets;
        };
        root.TextEncoder = TextEncoder;
    }
    if (typeof TextDecoder === "undefined") {
        function TextDecoder(encoding) {
            if (encoding !== "utf8") throw "TextDecoder only supports utf8";
        }
        TextDecoder.prototype.decode = function(octets) {
            var string = "";
            var i = 0;
            while (i < octets.length) {
                var octet = octets[i];
                var bytesNeeded = 0;
                var codePoint = 0;
                if (octet <= 127) {
                    bytesNeeded = 0;
                    codePoint = octet & 255;
                } else if (octet <= 223) {
                    bytesNeeded = 1;
                    codePoint = octet & 31;
                } else if (octet <= 239) {
                    bytesNeeded = 2;
                    codePoint = octet & 15;
                } else if (octet <= 244) {
                    bytesNeeded = 3;
                    codePoint = octet & 7;
                }
                if (octets.length - i - bytesNeeded > 0) {
                    var k = 0;
                    while (k < bytesNeeded) {
                        octet = octets[i + k + 1];
                        codePoint = codePoint << 6 | octet & 63;
                        k += 1;
                    }
                } else {
                    codePoint = 65533;
                    bytesNeeded = octets.length - i;
                }
                string += String.fromCodePoint(codePoint);
                i += bytesNeeded + 1;
            }
            return string;
        };
        root.TextDecoder = TextDecoder;
    }
})(this);

ADL.activityTypes = {
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
};

ADL.verbs = {
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
};

// adds toISOString to date objects if not there
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
if (!Date.prototype.toISOString) {
    (function() {
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = "0" + r;
            }
            return r;
        }
        Date.prototype.toISOString = function() {
            return this.getUTCFullYear() + "-" + pad(this.getUTCMonth() + 1) + "-" + pad(this.getUTCDate()) + "T" + pad(this.getUTCHours()) + ":" + pad(this.getUTCMinutes()) + ":" + pad(this.getUTCSeconds()) + "." + String((this.getUTCMilliseconds() / 1e3).toFixed(3)).slice(2, 5) + "Z";
        };
    })();
}

// shim for old-style Base64 lib
function toBase64(text) {
    if (CryptoJS && CryptoJS.enc.Base64) return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(text)); else return Base64.encode(text);
}

// shim for old-style crypto lib
function toSHA1(text) {
    if (CryptoJS && CryptoJS.SHA1) return CryptoJS.SHA1(text).toString(); else return Crypto.util.bytesToHex(Crypto.SHA1(text, {
        asBytes: true
    }));
}

function toSHA256(content) {
    if (Object.prototype.toString.call(content) !== "[object ArrayBuffer]") {
        return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
    }
    // Create a WordArray from the ArrayBuffer.
        var i8a = new Uint8Array(content);
    var a = [];
    for (var i = 0; i < i8a.length; i += 4) {
        a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }
    return CryptoJS.SHA256(CryptoJS.lib.WordArray.create(a, i8a.length)).toString(CryptoJS.enc.Hex);
}

// check if string or object is date, if it is, return date object
// feburary 31st == march 3rd in this solution
function isDate(date) {
    // check if object is being passed
    if (Object.prototype.toString.call(date) === "[object Date]") var d = date; else var d = new Date(date);
    // deep check on date object
        if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d.valueOf())) {
            ADL.XAPIWrapper.log("Invalid date String passed");
            return null;
        } else {
            return d;
        }
    } else {
        // not a date
        ADL.XAPIWrapper.log("Invalid date object");
        return null;
    }
}

log.debug = false;

function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);
    var byteLen = 0;
    for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < 1 << 7 ? 1 : c < 1 << 11 ? 2 : c < 1 << 16 ? 3 : c < 1 << 21 ? 4 : c < 1 << 26 ? 5 : c < 1 << 31 ? 6 : Number.NaN;
    }
    return byteLen;
}

/**
     * Config object used w/ url params to configure the lrs object
     * change these to match your lrs
     * @return {object} config object
     * @example
     * var conf = {
     *    "endpoint" : "https://lrs.adlnet.gov/xapi/",
     *    "auth" : "Basic " + toBase64('tom:1234'),
     * };
     * ADL.XAPIWrapper.changeConfig(conf);
     */ var Config = function() {
    var conf = {};
    conf["endpoint"] = "http://localhost:8000/xapi/";
    //try
    //{
        conf["auth"] = "Basic " + toBase64("tom:1234");
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
        return conf;
}();

/**
     * XAPIWrapper Constructor
     * @param {object} config   with a minimum of an endoint property
     * @param {boolean} verifyxapiversion   indicating whether to verify the version of the LRS is compatible with this wrapper
     */ var XAPIWrapper = function(config, verifyxapiversion) {
    this.lrs = getLRSObject(config || {});
    if (this.lrs.user && this.lrs.password) updateAuth(this.lrs, this.lrs.user, this.lrs.password);
    this.base = getbase(this.lrs.endpoint);
    this.withCredentials = false;
    if (config && typeof config.withCredentials != "undefined") {
        this.withCredentials = config.withCredentials;
    }
    // Ensure that callbacks are always executed, first param is error (null if no error) followed
    // by the result(s)
        this.strictCallbacks = false;
    this.strictCallbacks = config && config.strictCallbacks;
    function getbase(url) {
        var l = parseUrl(url);
        if (l.protocol && l.host) {
            return l.protocol + "//" + l.host;
        } else if (l.href) {
            // IE 11 fix.
            var parts = l.href.split("//");
            return parts[0] + "//" + parts[1].substr(0, parts[1].indexOf("/"));
        } else ADL.XAPIWrapper.log("Couldn't create base url from endpoint: " + url);
    }
    function updateAuth(obj, username, password) {
        obj.auth = "Basic " + toBase64(username + ":" + password);
    }
    if (verifyxapiversion && testConfig.call(this)) {
        ADL.XHR_request(this.lrs, this.lrs.endpoint + "about", "GET", null, null, function(r) {
            if (r.status == 200) {
                try {
                    var lrsabout = JSON.parse(r.response);
                    var versionOK = false;
                    for (var idx in lrsabout.version) {
                        if (lrsabout.version.hasOwnProperty(idx)) if (lrsabout.version[idx] == ADL.XAPIWrapper.xapiVersion) {
                            versionOK = true;
                            break;
                        }
                    }
                    if (!versionOK) {
                        ADL.XAPIWrapper.log("The lrs version [" + lrsabout.version + "]" + " does not match this wrapper's XAPI version [" + ADL.XAPIWrapper.xapiVersion + "]");
                    }
                } catch (e) {
                    ADL.XAPIWrapper.log("The response was not an about object");
                }
            } else {
                ADL.XAPIWrapper.log("The request to get information about the LRS failed: " + r);
            }
        }, null, false, null, this.withCredentials, false);
    }
    this.searchParams = function() {
        var sp = {
            format: "exact"
        };
        return sp;
    };
    this.hash = function(tohash) {
        if (!tohash) return null;
        try {
            return toSHA1(tohash);
        } catch (e) {
            ADL.XAPIWrapper.log("Error trying to hash -- " + e);
            return null;
        }
    };
    this.changeConfig = function(config) {
        try {
            ADL.XAPIWrapper.log("updating lrs object with new configuration");
            this.lrs = mergeRecursive(this.lrs, config);
            if (config.user && config.password) this.updateAuth(this.lrs, config.user, config.password);
            this.base = getbase(this.lrs.endpoint);
            this.withCredentials = config.withCredentials;
            this.strictCallbacks = config.strictCallbacks;
        } catch (e) {
            ADL.XAPIWrapper.log("error while changing configuration -- " + e);
        }
    };
    this.updateAuth = updateAuth;
};

// This wrapper is based on the Experience API Spec version:
XAPIWrapper.prototype.xapiVersion = "1.0.1";

/**
     * Adds info from the lrs object to the statement, if available.
     * These values could be initialized from the Config object or from the url query string.
     * @param {object} stmt   the statement object
     */ XAPIWrapper.prototype.prepareStatement = function(stmt) {
    if (stmt.actor === undefined) {
        stmt.actor = JSON.parse(this.lrs.actor);
    } else if (typeof stmt.actor === "string") {
        stmt.actor = JSON.parse(stmt.actor);
    }
    if (this.lrs.grouping || this.lrs.registration || this.lrs.activity_platform) {
        if (!stmt.context) {
            stmt.context = {};
        }
    }
    if (this.lrs.grouping) {
        if (!stmt.context.contextActivities) {
            stmt.context.contextActivities = {};
        }
        stmt.context.contextActivities.grouping = [ {
            id: this.lrs.grouping
        } ];
    }
    if (this.lrs.registration) {
        stmt.context.registration = this.lrs.registration;
    }
    if (this.lrs.activity_platform) {
        stmt.context.platform = this.lrs.activity_platform;
    }
};

// tests the configuration of the lrs object
XAPIWrapper.prototype.testConfig = testConfig;

// writes to the console if available
XAPIWrapper.prototype.log = log;

// Default encoding
XAPIWrapper.prototype.defaultEncoding = "utf-8";

/**
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
     */ XAPIWrapper.prototype.sendStatement = function(stmt, callback, attachments) {
    if (this.testConfig()) {
        this.prepareStatement(stmt);
        var id;
        if (stmt["id"]) {
            id = stmt["id"];
        } else {
            id = ADL.ruuid();
            stmt["id"] = id;
        }
        var payload = JSON.stringify(stmt);
        var extraHeaders = null;
        if (attachments && attachments.length > 0) {
            extraHeaders = {};
            payload = this.buildMultipartPost(stmt, attachments, extraHeaders);
        }
        var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint + "statements", "POST", payload, this.lrs.auth, callback, {
            id: id
        }, null, extraHeaders, this.withCredentials, this.strictCallbacks);
        if (!callback) return {
            xhr: resp,
            id: id
        };
    }
};

XAPIWrapper.prototype.stringToArrayBuffer = function(content, encoding) {
    encoding = encoding || ADL.XAPIWrapper.defaultEncoding;
    return new TextEncoder(encoding).encode(content).buffer;
};

XAPIWrapper.prototype.stringFromArrayBuffer = function(content, encoding) {
    encoding = encoding || ADL.XAPIWrapper.defaultEncoding;
    return new TextDecoder(encoding).decode(content);
};

/**
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
    */ XAPIWrapper.prototype.buildMultipartPost = function(statement, attachments, extraHeaders) {
    statement.attachments = [];
    for (var i = 0; i < attachments.length; i++) {
        // Replace the term 'signature' with the hard coded definition for a signature attachment
        if (attachments[i].type == "signature") {
            attachments[i].type = {
                usageType: "http://adlnet.gov/expapi/attachments/signature",
                display: {
                    "en-US": "A JWT signature"
                },
                description: {
                    "en-US": "A signature proving the statement was not modified"
                },
                contentType: "application/octet-stream"
            };
        }
        if (typeof attachments[i].value === "string") {
            // Convert the string value to an array buffer.
            attachments[i].value = this.stringToArrayBuffer(attachments[i].value);
        }
        // Compute the length and the sha2 of the attachment
                attachments[i].type.length = attachments[i].value.byteLength;
        attachments[i].type.sha2 = toSHA256(attachments[i].value);
        // Attach the attachment metadata to the statement.
                statement.attachments.push(attachments[i].type);
    }
    var blobParts = [];
    var boundary = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
    extraHeaders["Content-Type"] = "multipart/mixed; boundary=" + boundary;
    var CRLF = "\r\n";
    var header = [ "--" + boundary, "Content-Type: application/json", 'Content-Disposition: form-data; name="statement"', "", JSON.stringify(statement) ].join(CRLF) + CRLF;
    blobParts.push(header);
    for (var i in attachments) {
        if (attachments.hasOwnProperty(i)) {
            var attachmentHeader = [ "--" + boundary, "Content-Type: " + attachments[i].type.contentType, "Content-Transfer-Encoding: binary", "X-Experience-API-Hash: " + attachments[i].type.sha2 ].join(CRLF) + CRLF + CRLF;
            blobParts.push(attachmentHeader);
            blobParts.push(attachments[i].value);
        }
    }
    blobParts.push(CRLF + "--" + boundary + "--" + CRLF);
    return new Blob(blobParts);
}
/**
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
     */;

XAPIWrapper.prototype.sendStatements = function(stmtArray, callback) {
    if (this.testConfig()) {
        for (var i in stmtArray) {
            if (stmtArray.hasOwnProperty(i)) this.prepareStatement(stmtArray[i]);
        }
        var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint + "statements", "POST", JSON.stringify(stmtArray), this.lrs.auth, callback, null, false, null, this.withCredentials, this.strictCallbacks);
        if (!callback) {
            return resp;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.getStatements = function(searchparams, more, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "statements";
        if (more) {
            url = this.base + more;
        } else {
            var urlparams = new Array();
            for (s in searchparams) {
                if (searchparams.hasOwnProperty(s)) {
                    if (s == "until" || s == "since") {
                        var d = new Date(searchparams[s]);
                        urlparams.push(s + "=" + encodeURIComponent(d.toISOString()));
                    } else {
                        urlparams.push(s + "=" + encodeURIComponent(searchparams[s]));
                    }
                }
            }
            if (urlparams.length > 0) url = url + "?" + urlparams.join("&");
        }
        var res = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, false, null, this.withCredentials, this.strictCallbacks);
        if (res === undefined || res.status == 404) {
            return null;
        }
        try {
            return JSON.parse(res.response);
        } catch (e) {
            return res.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.getActivities = function(activityid, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities?activityId=<activityid>";
        url = url.replace("<activityid>", encodeURIComponent(activityid));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.sendState = function(activityid, agent, stateid, registration, stateval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        url = url.replace("<stateid>", encodeURIComponent(stateid));
        if (registration) {
            url += "&registration=" + encodeURIComponent(registration);
        }
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var method = "PUT";
        if (stateval) {
            if (stateval instanceof Array) {
                stateval = JSON.stringify(stateval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
            } else if (stateval instanceof Object) {
                stateval = JSON.stringify(stateval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
                method = "POST";
            } else {
                headers = headers || {};
                headers["Content-Type"] = "application/octet-stream";
            }
        } else {
            this.log("No activity state was included.");
            return false;
        }
        //(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders)
                ADL.XHR_request(this.lrs, url, method, stateval, this.lrs.auth, callback, null, null, headers, this.withCredentials, this.strictCallbacks);
    }
};

/**
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
     */ XAPIWrapper.prototype.getState = function(activityid, agent, stateid, registration, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        if (stateid) {
            url += "&stateId=" + encodeURIComponent(stateid);
        }
        if (registration) {
            url += "&registration=" + encodeURIComponent(registration);
        }
        if (since) {
            since = isDate(since);
            if (since != null) {
                url += "&since=" + encodeURIComponent(since.toISOString());
            }
        }
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.deleteState = function(activityid, agent, stateid, registration, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        url = url.replace("<stateid>", encodeURIComponent(stateid));
        if (registration) {
            url += "&registration=" + encodeURIComponent(registration);
        }
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.sendActivityProfile = function(activityid, profileid, profileval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        url = url.replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var method = "PUT";
        if (profileval) {
            if (profileval instanceof Array) {
                profileval = JSON.stringify(profileval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
            } else if (profileval instanceof Object) {
                profileval = JSON.stringify(profileval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
                method = "POST";
            } else {
                headers = headers || {};
                headers["Content-Type"] = "application/octet-stream";
            }
        } else {
            this.log("No activity profile was included.");
            return false;
        }
        ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
    }
};

/**
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
     */ XAPIWrapper.prototype.getActivityProfile = function(activityid, profileid, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        if (profileid) {
            url += "&profileId=" + encodeURIComponent(profileid);
        }
        if (since) {
            since = isDate(since);
            if (since != null) {
                url += "&since=" + encodeURIComponent(since.toISOString());
            }
        }
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.deleteActivityProfile = function(activityid, profileid, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";
        url = url.replace("<activity ID>", encodeURIComponent(activityid));
        url = url.replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.getAgents = function(agent, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents?agent=<agent>";
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.sendAgentProfile = function(agent, profileid, profileval, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        url = url.replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var method = "PUT";
        if (profileval) {
            if (profileval instanceof Array) {
                profileval = JSON.stringify(profileval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
            } else if (profileval instanceof Object) {
                profileval = JSON.stringify(profileval);
                headers = headers || {};
                headers["Content-Type"] = "application/json";
                method = "POST";
            } else {
                headers = headers || {};
                headers["Content-Type"] = "application/octet-stream";
            }
        } else {
            this.log("No agent profile was included.");
            return false;
        }
        ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
    }
};

/**
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
     */ XAPIWrapper.prototype.getAgentProfile = function(agent, profileid, since, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>";
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        url = url.replace("<profileid>", encodeURIComponent(profileid));
        if (profileid) {
            url += "&profileId=" + encodeURIComponent(profileid);
        }
        if (since) {
            since = isDate(since);
            if (since != null) {
                url += "&since=" + encodeURIComponent(since.toISOString());
            }
        }
        var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result.response;
        }
    }
};

/**
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
     */ XAPIWrapper.prototype.deleteAgentProfile = function(agent, profileid, matchHash, noneMatchHash, callback) {
    if (this.testConfig()) {
        var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";
        url = url.replace("<agent>", encodeURIComponent(JSON.stringify(agent)));
        url = url.replace("<profileid>", encodeURIComponent(profileid));
        var headers = null;
        if (matchHash && noneMatchHash) {
            log("Can't have both If-Match and If-None-Match");
        } else if (matchHash) {
            headers = {
                "If-Match": ADL.formatHash(matchHash)
            };
        } else if (noneMatchHash) {
            headers = {
                "If-None-Match": ADL.formatHash(noneMatchHash)
            };
        }
        var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
        if (result === undefined || result.status == 404) {
            return null;
        }
        try {
            return JSON.parse(result.response);
        } catch (e) {
            return result;
        }
    }
};

/**
     * Tests the configuration of the lrs object
     */ function testConfig() {
    try {
        return this.lrs.endpoint != undefined && this.lrs.endpoint != "";
    } catch (e) {
        return false;
    }
}

// outputs the message to the console if available
function log(message) {
    if (!log.debug) return false;
    try {
        console.log(message);
        return true;
    } catch (e) {
        return false;
    }
}

// merges two object
function mergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        if (obj2.hasOwnProperty(p) == false) continue;
        var prop = obj2[p];
        log(p + " : " + prop);
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = mergeRecursive(obj1[p], obj2[p]);
            } else {
                if (obj1 == undefined) {
                    obj1 = new Object();
                }
                obj1[p] = obj2[p];
            }
        } catch (e) {
            if (obj1 == undefined) {
                obj1 = new Object();
            }
            // Property in destination object not set; create it and set its value.
                        obj1[p] = obj2[p];
        }
    }
    return obj1;
}

// iniitializes an lrs object with settings from
// a config file and from the url query string
function getLRSObject(config) {
    var lrsProps = [ "endpoint", "auth", "actor", "registration", "activity_id", "grouping", "activity_platform" ];
    var lrs = new Object();
    var qsVars, prop;
    qsVars = parseQueryString();
    if (qsVars !== undefined && Object.keys(qsVars).length !== 0) {
        for (var i = 0; i < lrsProps.length; i++) {
            prop = lrsProps[i];
            if (qsVars[prop]) {
                lrs[prop] = qsVars[prop];
                delete qsVars[prop];
            }
        }
        if (Object.keys(qsVars).length !== 0) {
            lrs.extended = qsVars;
        }
        lrs = mergeRecursive(config, lrs);
    } else {
        lrs = config;
    }
    return lrs;
}

// parses the params in the url query string
function parseQueryString() {
    var qs, pairs, pair, ii, parsed;
    qs = location.search.substr(1);
    pairs = qs.split("&");
    parsed = {};
    for (ii = 0; ii < pairs.length; ii++) {
        pair = pairs[ii].split("=");
        if (pair.length === 2 && pair[0]) {
            parsed[pair[0]] = decodeURIComponent(pair[1]);
        }
    }
    return parsed;
}

function delay() {
    var xhr = new XMLHttpRequest();
    var url = location + "?forcenocache=" + ADL.ruuid();
    xhr.open("GET", url, false);
    xhr.send(null);
}

var isNode = Boolean(!root.document);

// Node shim for browser location
var location = isNode ? 
// Node
{
    search: "",
    protocol: "https:"
} : 
// Browser
root.location;

/**
     * Cross environment implementation of a url parser
     * @param  {string} url  Url to parse
     * @return {object}  Parsed url
     */ function parseUrl(url) {
    // Node
    if (isNode) return require("url").parse(url);
    // Brower
        var a = document.createElement("a");
    a.href = url;
    return a;
}

// If in node, create a loose SHIM for XMLHttpRequest API
var XMLHttpRequest = root.XMLHttpRequest;

isNode && function() {
    XMLHttpRequest = function XMLHttpRequest() {
        this.method = "GET";
        this.url = null;
        this.async = true;
        this.headers = {};
    };
    XMLHttpRequest.prototype = {
        open: function(method, url, async) {
            if (async === false) {
                throw "ADL xAPIWrapper does not support synchronous http requests in node";
            }
            this.method = method;
            this.url = url;
            this.withCredentials = true;
            this.crossDomain = true;
            this.responseText = "";
            this.responseJSON = null;
            this.readyState = 0;
            this.status = 0;
            this.onreadystatechange = function() {};
            this.onerror = function(error) {};
            this.onload = function() {};
        },
        setRequestHeader: function(name, value) {
            this.headers[name] = value;
        },
        send: function(data) {
            var http = this.url.includes("https:") ? require("https") : require("http");
            var options = {
                method: this.method,
                headers: this.headers
            };
            var parsedUrl = parseUrl(this.url);
            for (var k in parsedUrl) {
                options[k] = parsedUrl[k];
            }
            var req = http.request(options, function(res) {
                res.setEncoding("utf8");
                this.status = res.statusCode;
                res.on("data", function(d) {
                    this.responseText += d;
                }.bind(this));
                res.on("end", function() {
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
                this.readyState = 4;
                this.onerror();
            }.bind(this));
            req.end(data);
        }
    };
}();

/**
     * formats a request in a way that IE will allow
     * @param {string} method   the http request method (ex: "PUT", "GET")
     * @param {string} url   the url to the request (ex: ADL.XAPIWrapper.lrs.endpoint + "statements")
     * @param {array} [headers]   headers to include in the request
     * @param {string} [data]   the body of the request, if there is one
     * @return {object} xhr response object
     */ function ie_request(method, url, headers, data) {
    var newUrl = url;
    //Everything that was on query string goes into form vars
        var formData = new Array();
    var qsIndex = newUrl.indexOf("?");
    if (qsIndex > 0) {
        formData.push(newUrl.substr(qsIndex + 1));
        newUrl = newUrl.substr(0, qsIndex);
    }
    //Method has to go on querystring, and nothing else
        newUrl = newUrl + "?method=" + method;
    //Headers
        if (headers !== null) {
        for (var headerName in headers) {
            if (headers.hasOwnProperty(headerName)) formData.push(headerName + "=" + encodeURIComponent(headers[headerName]));
        }
    }
    //The original data is repackaged as "content" form var
        if (data !== null) {
        formData.push("content=" + encodeURIComponent(data));
    }
    return {
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
    */ ADL.ruuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
    });
};

/**
     * dateFromISOString
     * parses an ISO string into a date object
     * isostr - the ISO string
     */ ADL.dateFromISOString = function(isostr) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "([T| ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = isostr.match(new RegExp(regexp));
    var offset = 0;
    var date = new Date(d[1], 0, 1);
    if (d[3]) {
        date.setMonth(d[3] - 1);
    }
    if (d[5]) {
        date.setDate(d[5]);
    }
    if (d[7]) {
        date.setHours(d[7]);
    }
    if (d[8]) {
        date.setMinutes(d[8]);
    }
    if (d[10]) {
        date.setSeconds(d[10]);
    }
    if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1e3);
    }
    if (d[14]) {
        offset = Number(d[16]) * 60 + Number(d[17]);
        offset *= d[15] == "-" ? 1 : -1;
    }
    offset -= date.getTimezoneOffset();
    time = Number(date) + offset * 60 * 1e3;
    var dateToReturn = new Date();
    dateToReturn.setTime(Number(time));
    return dateToReturn;
};

// Synchronous if callback is not provided (not recommended)
/**
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
     */ ADL.XHR_request = function(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders, withCredentials, strictCallbacks) {
    "use strict";
    var xhr, finished = false, xDomainRequest = false, ieXDomain = false, ieModeRequest, urlparts = url.toLowerCase().match(/^(.+):\/\/([^:\/]*):?(\d+)?(\/.*)?$/), urlPort, result, extended, prop, until;
    //Consolidate headers
        var headers = {};
    headers["Content-Type"] = "application/json";
    headers["Authorization"] = auth;
    headers["X-Experience-API-Version"] = ADL.XAPIWrapper.xapiVersion;
    if (extraHeaders !== null) {
        for (var headerName in extraHeaders) {
            if (extraHeaders.hasOwnProperty(headerName)) headers[headerName] = extraHeaders[headerName];
        }
    }
    //See if this really is a cross domain
        xDomainRequest = location.protocol.toLowerCase() !== urlparts[1] || location.hostname.toLowerCase() !== urlparts[2];
    if (!xDomainRequest) {
        urlPort = urlparts[3] === null ? urlparts[1] === "http" ? "80" : "443" : urlparts[3];
        xDomainRequest = urlPort === location.port;
    }
    //Add extended LMS-specified values to the URL
        if (lrs !== null && lrs.extended !== undefined) {
        extended = new Array();
        for (prop in lrs.extended) {
            extended.push(prop + "=" + encodeURIComponent(lrs.extended[prop]));
        }
        if (extended.length > 0) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + extended.join("&");
        }
    }
    //If it's not cross domain or we're not using IE, use the usual XmlHttpRequest
        var windowsVersionCheck = root.XDomainRequest && (root.XMLHttpRequest && new XMLHttpRequest().responseType === undefined);
    if (!xDomainRequest || windowsVersionCheck === undefined || windowsVersionCheck === false) {
        xhr = new XMLHttpRequest();
        xhr.withCredentials = withCredentials;
 //allow cross domain cookie based auth
                xhr.open(method, url, callback != null);
        for (var headerName in headers) {
            xhr.setRequestHeader(headerName, headers[headerName]);
        }
    }
    //Otherwise, use IE's XDomainRequest object
     else {
        ieXDomain = true;
        ieModeRequest = ie_request(method, url, headers, data);
        xhr = new XDomainRequest();
        xhr.open(ieModeRequest.method, ieModeRequest.url);
    }
    //Setup request callback
        function requestComplete() {
        if (!finished) {
            // may be in sync or async mode, using XMLHttpRequest or IE XDomainRequest, onreadystatechange or
            // onload or both might fire depending upon browser, just covering all bases with event hooks and
            // using 'finished' flag to avoid triggering events multiple times
            finished = true;
            var notFoundOk = ignore404 && xhr.status === 404;
            if (xhr.status === undefined || xhr.status >= 200 && xhr.status < 400 || notFoundOk) {
                if (callback) {
                    if (callbackargs) {
                        strictCallbacks ? callback(null, xhr, callbackargs) : callback(xhr, callbackargs);
                    } else {
                        var body;
                        try {
                            body = JSON.parse(xhr.responseText);
                        } catch (e) {
                            body = xhr.responseText;
                        }
                        strictCallbacks ? callback(null, xhr, body) : callback(xhr, body);
                    }
                } else {
                    result = xhr;
                    return xhr;
                }
            } else {
                var warning;
                try {
                    warning = "There was a problem communicating with the Learning Record Store. ( " + xhr.status + " | " + xhr.response + " )" + url;
                } catch (ex) {
                    warning = ex.toString();
                }
                ADL.XAPIWrapper.log(warning);
                ADL.xhrRequestOnError(xhr, method, url, callback, callbackargs, strictCallbacks);
                result = xhr;
                return xhr;
            }
        } else {
            return result;
        }
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            return requestComplete();
        }
    };
    xhr.onload = requestComplete;
    xhr.onerror = requestComplete;
    //xhr.onerror =  ADL.xhrRequestOnError(xhr, method, url);
        xhr.send(ieXDomain ? ieModeRequest.data : data);
    if (!callback) {
        // synchronous
        if (ieXDomain) {
            // synchronous call in IE, with no asynchronous mode available.
            until = 1e3 + new Date();
            while (new Date() < until && xhr.readyState !== 4 && !finished) {
                delay();
            }
        }
        return requestComplete();
    }
};

/**
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
     */ ADL.xhrRequestOnError = function(xhr, method, url, callback, callbackargs, strictCallbacks) {
    if (callback && strictCallbacks) {
        var status = xhr ? xhr.status : undefined;
        var error;
        if (status) {
            error = new Error("Request error: " + xhr.status);
        } else if (status === 0 || status === null) {
            // 0 and null = aborted
            error = new Error("Request error: aborted");
        } else {
            error = new Error("Reqeust error: unknown");
        }
        if (callbackargs) {
            callback(error, xhr, callbackargs);
        } else {
            var body;
            try {
                body = JSON.parse(xhr.responseText);
            } catch (e) {
                body = xhr.responseText;
            }
            callback(error, xhr, body);
        }
    }
};

ADL.formatHash = function(hash) {
    return hash === "*" ? hash : '"' + hash + '"';
};

ADL.XAPIWrapper = new XAPIWrapper(Config, false);

function _getobj(obj, path) {
    var parts = path.split(".");
    var part = parts[0];
    path = parts.slice(1).join(".");
    if (!obj[part]) {
        if (/\[\]$/.test(part)) {
            part = part.slice(0, -2);
            obj[part] = [];
        } else obj[part] = {};
    }
    if (!path) return obj[part]; else return _getobj(obj[part], path);
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
/**
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
   */ var XAPIStatement = function(actor, verb, object, result) {
    // initialize
    // if first arg is an xapi statement, parse
    if (actor && actor.actor && actor.verb && actor.object) {
        var stmt = actor;
        for (var i in stmt) {
            if (i != "actor" && i != "verb" && i != "object") this[i] = stmt[i];
        }
        actor = stmt.actor;
        verb = stmt.verb;
        object = stmt.object;
    }
    if (actor) {
        if (actor instanceof Agent) this.actor = actor; else if (actor.objectType === "Agent" || !actor.objectType) this.actor = new Agent(actor); else if (actor.objectType === "Group") this.actor = new Group(actor);
    } else this.actor = null;
    if (verb) {
        if (verb instanceof Verb) this.verb = verb; else this.verb = new Verb(verb);
    } else this.verb = null;
    // decide what kind of object was passed
        if (object) {
        if (object.objectType === "Activity" || !object.objectType) {
            if (object instanceof Activity) this.object = object; else this.object = new Activity(object);
        } else if (object.objectType === "Agent") {
            if (object instanceof Agent) this.object = object; else this.object = new Agent(object);
        } else if (object.objectType === "Group") {
            if (object instanceof Group) this.object = object; else this.object = new Group(object);
        } else if (object.objectType === "StatementRef") {
            if (object instanceof StatementRef) this.object = object; else this.object = new StatementRef(object);
        } else if (object.objectType === "SubStatement") {
            if (object instanceof SubStatement) this.object = object; else this.object = new SubStatement(object);
        } else this.object = null;
    } else this.object = null;
    // add support for result object
        if (result) {
        this.result = result;
    }
    this.generateId = function() {
        this.id = ADL.ruuid();
    };
};

XAPIStatement.prototype.toString = function() {
    return this.actor.toString() + " " + this.verb.toString() + " " + this.object.toString() + " " + this.result.toString();
};

XAPIStatement.prototype.isValid = function() {
    return this.actor && this.actor.isValid() && this.verb && this.verb.isValid() && this.object && this.object.isValid() && this.result && this.result.isValid();
};

XAPIStatement.prototype.generateRegistration = function() {
    _getobj(this, "context").registration = ADL.ruuid();
};

XAPIStatement.prototype.addParentActivity = function(activity) {
    _getobj(this, "context.contextActivities.parent[]").push(new Activity(activity));
};

XAPIStatement.prototype.addGroupingActivity = function(activity) {
    _getobj(this, "context.contextActivities.grouping[]").push(new Activity(activity));
};

XAPIStatement.prototype.addOtherContextActivity = function(activity) {
    _getobj(this, "context.contextActivities.other[]").push(new Activity(activity));
};

/**
   * Provides an easy constructor for xAPI agent objects
   * @param {string} identifier   One of the Inverse Functional Identifiers specified in the spec.
   *     That is, an email, a hashed email, an OpenID, or an account object.
   *     See (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#inversefunctional)
   * @param {string} [name]   The natural-language name of the agent
   */ var Agent = function(identifier, name) {
    this.objectType = "Agent";
    this.name = name;
    // figure out what type of identifier was given
        if (identifier && (identifier.mbox || identifier.mbox_sha1sum || identifier.openid || identifier.account)) {
        for (var i in identifier) {
            this[i] = identifier[i];
        }
    } else if (/^mailto:/.test(identifier)) {
        this.mbox = identifier;
    } else if (/^[0-9a-f]{40}$/i.test(identifier)) {
        this.mbox_sha1sum = identifier;
    } else if (/^http[s]?:/.test(identifier)) {
        this.openid = identifier;
    } else if (identifier && identifier.homePage && identifier.name) {
        this.account = identifier;
    }
};

Agent.prototype.toString = function() {
    return this.name || this.mbox || this.openid || this.mbox_sha1sum || this.account.name;
};

Agent.prototype.isValid = function() {
    return this.mbox || this.mbox_sha1sum || this.openid || this.account.homePage && this.account.name || this.objectType === "Group" && this.member;
};

/**
   * A type of agent, can contain multiple agents
   * @param {string} [identifier]   (optional if `members` specified) See Agent.
   * @param {string} [members]    An array of Agents describing the membership of the group
   * @param {string} [name]   The natural-language name of the agent
   */ var Group = function(identifier, members, name) {
    Agent.call(this, identifier, name);
    this.member = members;
    this.objectType = "Group";
};

Group.prototype = new Agent();

/**
   * Really only provides a convenient language map
   * @param {string} id   The IRI of the action taken
   * @param {string} [description]    An English-language description, or a Language Map
   */ var Verb = function(id, description) {
    // if passed a verb object then copy and return
    if (id && id.id) {
        for (var i in id) {
            this[i] = id[i];
        }
        return;
    }
    // save id and build language map
        this.id = id;
    if (description) {
        if (typeof description === "string" || description instanceof String) {
            this.display = {
                "en-US": description
            };
        } else {
            this.display = description;
        }
    }
};

Verb.prototype.toString = function() {
    if (this.display && (this.display["en-US"] || this.display["en"])) return this.display["en-US"] || this.display["en"]; else return this.id;
};

Verb.prototype.isValid = function() {
    return this.id;
};

/**
   * Describes an object that an agent interacts with
   * @param {string} id   The unique activity IRI
   * @param {string} name   An English-language identifier for the activity, or a Language Map
   * @param {string} description   An English-language description of the activity, or a Language Map
   */ var Activity = function(id, name, description) {
    // if first arg is activity, copy everything over
    if (id && id.id) {
        var act = id;
        for (var i in act) {
            this[i] = act[i];
        }
        return;
    }
    this.objectType = "Activity";
    this.id = id;
    if (name || description) {
        this.definition = {};
        if (typeof name === "string" || name instanceof String) this.definition.name = {
            "en-US": name
        }; else if (name) this.definition.name = name;
        if (typeof description === "string" || description instanceof String) this.definition.description = {
            "en-US": description
        }; else if (description) this.definition.description = description;
    }
};

Activity.prototype.toString = function() {
    if (this.definition && this.definition.name && (this.definition.name["en-US"] || this.definition.name["en"])) return this.definition.name["en-US"] || this.definition.name["en"]; else return this.id;
};

Activity.prototype.isValid = function() {
    return this.id && (!this.objectType || this.objectType === "Activity");
};

/**
   * An object that refers to a separate statement
   * @param {string} id   The UUID of another xAPI statement
   */ var StatementRef = function(id) {
    if (id && id.id) {
        for (var i in id) {
            this[i] = id[i];
        }
    } else {
        this.objectType = "StatementRef";
        this.id = id;
    }
};

StatementRef.prototype.toString = function() {
    return "statement(" + this.id + ")";
};

StatementRef.prototype.isValid = function() {
    return this.id && this.objectType && this.objectType === "StatementRef";
};

/**
   * A self-contained statement as the object of another statement
   * See XAPIStatement for constructor details
   * @param {string} actor   The Agent or Group committing the action described by the statement
   * @param {string} verb   The Verb for the action described by the statement
   * @param {string} object   The receiver of the action. An Agent, Group, Activity, or StatementRef
   */ var SubStatement = function(actor, verb, object) {
    XAPIStatement.call(this, actor, verb, object);
    this.objectType = "SubStatement";
    delete this.id;
    delete this.stored;
    delete this.version;
    delete this.authority;
};

SubStatement.prototype = new XAPIStatement();

SubStatement.prototype.toString = function() {
    return '"' + SubStatement.prototype.prototype.toString.call(this) + '"';
};

XAPIStatement.Agent = Agent;

XAPIStatement.Group = Group;

XAPIStatement.Verb = Verb;

XAPIStatement.Activity = Activity;

XAPIStatement.StatementRef = StatementRef;

XAPIStatement.SubStatement = SubStatement;

ADL.XAPIStatement = XAPIStatement;

var onBrowser = typeof window !== "undefined";

var getObjDefName = function(o) {
    if (o.definition && o.definition.name) {
        return ADL.xapiutil.getLangVal(o.definition.name);
    }
    return undefined;
};

var getSubStatementDisplay = function(o) {
    if (o.objectType !== "SubStatement") return;
    if (o.object.objectType === "SubStatement") return;
    if (o.id || o.stored || o.version || o.authority) return;
    var disp = ADL.xapiutil.getActorId(o.actor) + ":" + ADL.xapiutil.getVerbDisplay(o.verb) + ":" + ADL.xapiutil.getObjectId(o.object);
    return disp;
};

ADL.xapiutil = {};

ADL.xapiutil.getLang = function() {
    var lang;
    if (typeof navigator !== "undefined") lang = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage; else if (typeof process !== "undefined" && typeof process.env !== "undefined" && typeof process.env.LANG !== "undefined") {
        var str = process.env.LANG;
        lang = str.slice(0, str.indexOf("."));
        lang = lang.replace(/_/, "-");
    }
    return lang || "en-US";
};

ADL.xapiutil.getLangVal = function(langprop) {
    if (!langprop) return;
    var options = Object.keys(langprop);
    // test that langprop is a dict (obj)
    // skips if not a dict(obj) and returns
        if (options.length == 0) return undefined;
    var lang = ADL.xapiutil.getLang(), ret, dispGotten = false;
    do {
        //test and retest
        if (langprop[lang]) {
            ret = langprop[lang];
            dispGotten = true;
        } else if (lang.indexOf("-")) {
            lang = lang.substring(0, lang.lastIndexOf("-"));
        }
    } while (!dispGotten && lang !== "");
    return ret;
};

ADL.xapiutil.getMoreStatements = function(iterations, callback, searchParams) {
    if (!onBrowser) throw new Error("Node not supported.");
    var stmts = [];
    ADL.XAPIWrapper.getStatements(searchParams, null, function getMore(r) {
        if (!(r && r.response)) return;
        var res = JSON.parse(r.response);
        if (!res.statements) return;
        stmts = stmts.concat(res.statements);
        if (iterations-- <= 0) {
            callback(stmts);
        } else {
            if (res.more && res.more !== "") {
                ADL.XAPIWrapper.getStatements(searchParams, res.more, getMore);
            } else if (res.more === "") {
                callback(stmts);
            }
        }
    });
};

ADL.xapiutil.getActorId = function(a) {
    return a.mbox || a.openid || a.mbox_sha1sum || a.account;
};

ADL.xapiutil.getActorIdString = function(a) {
    var id = a.mbox || a.openid || a.mbox_sha1sum;
    if (!id) {
        if (a.account) id = a.account.homePage + ":" + a.account.name; else if (a.member) id = "Anon Group " + a.member; else id = "unknown";
    }
    return id;
};

ADL.xapiutil.getActorDisplay = function(a) {
    return a.name || ADL.xapiutil.getActorIdString(a);
};

ADL.xapiutil.getVerbDisplay = function(v) {
    if (!v) return;
    if (v.display) {
        return ADL.xapiutil.getLangVal(v.display) || v.id;
    }
    return v.id;
};

ADL.xapiutil.getObjectType = function(o) {
    return o.objectType || (o.id ? "Activity" : "Agent");
};

ADL.xapiutil.getObjectId = function(o) {
    if (o.id) return o.id;
    var type = ADL.xapiutil.getObjectType(o);
    if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorId(o);
    return undefined;
};

ADL.xapiutil.getObjectIdString = function(o) {
    if (!o) return "unknown";
    if (o.id) return o.id;
    var type = ADL.xapiutil.getObjectType(o);
    if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorIdString(o); else if (type == "SubStatement") {
        return getSubStatementDisplay(o);
    }
    return "unknown";
};

ADL.xapiutil.getObjectDisplay = function(o) {
    if (!o) return "unknown";
    var disp = getObjDefName(o) || o.name || o.id;
    if (!disp) {
        var type = ADL.xapiutil.getObjectType(o);
        if (type === "Agent" || type == "Group") disp = ADL.xapiutil.getActorDisplay(o); else if (type == "SubStatement") {
            disp = getSubStatementDisplay(o);
        }
    }
    return disp;
};

function getQueryVariable(variable) {
    var query = location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    // console.log('Query variable %s not found', variable);
}

function cb_wrap(cb) {
    return function() {
        var args = arguments;
        setTimeout(function() {
            var callerArgs = [];
            for (var i = 0; i < args.length; i++) {
                callerArgs.push(args[i]);
            }
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
        var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for (var i in mutation.addedNodes) {
                if (mutation.addedNodes.hasOwnProperty(i)) {
                    if (mutation.addedNodes[i].constructor == HTMLAnchorElement) {
                        var node = mutation.addedNodes[i];
                        setupCourseLinks([ node ]);
                    }
                }
            }
        });
    });
    // configuration of the observer:
        var config = {
        attributes: true,
        childList: true,
        subtree: true
    };
    // pass in the target node, as well as the observer options
        observer.observe(target, config);
    // later, you can stop observing
    ///  observer.disconnect();
}

//This library will init all links in the DOM that include the attribute "courseLink = true"
//with the information necessary for the document at that link to track as part of this session.
function setupCourseLinks(_nodes) {
    var launchToken = getQueryVariable("xAPILaunchKey");
    var launchEndpoint = getQueryVariable("xAPILaunchService");
    var encrypted = getQueryVariable("encrypted");
    var query = "xAPILaunchKey=" + launchToken + "&xAPILaunchService=" + launchEndpoint;
    if (encrypted) {
        query += "&encrypted=true";
    }
    for (var i = 0; i < _nodes.length; i++) {
        var link = _nodes[i];
        var href = link.href;
        var courseLink = link.attributes.getNamedItem("courselink");
        if (courseLink && courseLink.value == "true") {
            if (href.indexOf("?") > -1) {
                href = href + "&" + query;
            } else href = href + "?" + query;
            link.href = href;
        }
    }
}

function xAPILaunch(cb, terminate_on_unload, strict_callbacks) {
    if (isNode) throw "ADL.launch not supported in node";
    cb = cb_wrap(cb);
    try {
        var launchToken = getQueryVariable("xAPILaunchKey");
        var launchEndpoint = getQueryVariable("xAPILaunchService");
        var encrypted = getQueryVariable("encrypted");
        if (encrypted) {
            //here, we'd have to implement decryption for the data. This makes little sense in a client side only course
        }
        xAPILaunch.terminate = function(message) {
            var launch = new URL(launchEndpoint);
            launch.pathname += "launch/" + launchToken + "/terminate";
            var xhr2 = new XMLHttpRequest();
            xhr2.withCredentials = true;
            xhr2.crossDomain = true;
            xhr2.open("POST", launch.toString(), false);
            xhr2.setRequestHeader("Content-type", "application/json");
            xhr2.send(JSON.stringify({
                code: 0,
                description: message || "User closed content"
            }));
        };
        if (!launchToken || !launchEndpoint) return cb("invalid launch parameters");
        var launch = new URL(launchEndpoint);
        launch.pathname += "launch/" + launchToken;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.crossDomain = true;
        xhr.onerror = function(err) {
            //exit the try catch so inner execptions in the callback don't trigger this catch
            setTimeout(function() {
                return cb(err);
            });
        };
        xhr.onload = function(e) {
            if (xhr.status !== 200) {
                return xhr.onerror(xhr.responseText);
            }
            var body = JSON.parse(xhr.responseText);
            var launchData = body;
            var conf = {};
            conf["endpoint"] = launchData.endpoint;
            conf["actor"] = launchData.actor;
            conf.withCredentials = true;
            conf.strictCallbacks = strict_callbacks || false;
            root.onunload = function() {
                if (!terminate_on_unload) return;
                xAPILaunch.terminate("User closed content");
            };
            var wrapper = new ADL.XAPIWrapper.constructor();
            wrapper.changeConfig(conf);
            //Links that include "courseLink='true'"
                        setupCourseLinks(document.body.querySelectorAll("a"));
            //Also, if links are added dynamically, we will do the same logic for those links.
                        observeForNewLinks();
            return cb(null, body, wrapper);
        };
        xhr.open("POST", launch.toString(), true);
        xhr.send();
    } catch (e) {
        cb(e);
    }
}

var isNode = Boolean(!root.document);

// Node shim for browser location
var location = isNode ? 
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
