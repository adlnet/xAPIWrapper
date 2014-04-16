To minify the library and all its dependencies, follow these steps:

1. Download and install [Uglify.js](https://github.com/mishoo/UglifyJS2)
2. Download and unpack the latest version of [CryptoJS](https://code.google.com/p/crypto-js/downloads/list) (I used 3.1.2)
3. Copy `components/core.js`, `components/enc-base64.js`, and `components/sha1.js` from CryptoJS to your working directory.
4. Download the latest version of the [ADL Verbs](https://github.com/adlnet/xAPIVerbs/blob/master/verbs.js) project and
	copy it to your working directory.
5. Run all the JS files through Uglify:
	* `$ uglifyjs core.js enc-base64.js sha1.js verbs.js xapiwrapper.js xapistatement.js -o xapiwrapper.min.js -m -c`
