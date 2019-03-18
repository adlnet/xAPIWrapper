(function (ADL) {
    var onBrowser = false;
    if (typeof window !== 'undefined') {
        onBrowser = true;
    }

    /**
     * Setup language default on ADL global object. `'es-pa'`,`'pa-pk'`,`'en'` etc.
     * A falsey will force these functions to take the environment language
     * or default to `'en-US'`.
     * @return {string}
     */
    ADL.language = ADL.language || null;

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

    var getObjDefName = function (o) {
        if (o.definition && o.definition.name) {
            return ADL.xapiutil.getLangVal(o.definition.name);
        }
        return undefined;
    };

    var getSubStatementDisplay = function (o) {
        if(o.objectType !== "SubStatement") return;
        if(o.object.objectType === "SubStatement") return;
        if(o.id || o.stored || o.version || o.authority) return;
        var disp =  ADL.xapiutil.getActorId(o.actor) + ":" + ADL.xapiutil.getVerbDisplay(o.verb) + ":" + ADL.xapiutil.getObjectId(o.object);
        return disp;
    };

    ADL.xapiutil = {};

    /**
     * Returns environment language code. Use `ADL.language` to override.
     * @return {string}
     */
    ADL.xapiutil.getLang = function () {
        var lang;
        if (typeof navigator !== 'undefined')
            lang =  ADL.language || navigator.language || navigator.browserLanguage ||
            navigator.systemLanguage || navigator.userLanguage;
        else if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && typeof process.env.LANG !== 'undefined') {
            lang = ADL.language || process.env.LANG;
            var periodPos = lang.indexOf('.');
            if (periodPos > 0) lang =  lang.slice(0, periodPos);
            lang = lang.replace(/_/, '-')
        }
        return lang || "en-US";
    };

    /**
     * Return the value for the environment language on the object provided.
     * @param {Object.<getLang, string>} langprop
     * @return {String|undefined}
     */
    ADL.xapiutil.getLangVal = function (langprop) {

        if (!langprop) return;

        var options = ObjectKeys(langprop);
        // test that langprop is a dict (obj)
        // skips if not a dict(obj) and returns
        if (options.length == 0) return undefined;

        var lang = ADL.xapiutil.getLang(),
            ret,
            dispGotten = false;

        do {    //test and retest
            if (langprop[lang])
            {
                ret = langprop[lang];
                dispGotten = true;
            }
            else if (lang.indexOf('-'))
            {
                lang = lang.substring(0, lang.lastIndexOf('-'));
            }
        } while (!dispGotten && lang !=="");

        return ret;
    };

    /**
     * @param {number} iterations
     * @param {function} callback
     * @param {Object} searchParams
     */
    ADL.xapiutil.getMoreStatements = function (iterations, callback, searchParams) {
        if (!onBrowser) throw new Error("Node not supported.");

        var stmts = [];
        function getMore(r) {
            if (! (r && r.response) ) return;
            var res = JSON.parse(r.response);
            if (! res.statements) return;
            stmts = stmts.concat(res.statements);

            if (iterations-- <= 0) {
                callback(stmts);
            }
            else {
                if (res.more && res.more !== "")
                {
                    ADL.XAPIWrapper.getStatements(searchParams, res.more, getMore);
                }
                else if (res.more === "")
                {
                    callback(stmts);
                }
            }
        }
        ADL.XAPIWrapper.getStatements(searchParams, null, getMore);
    };

    /**
     * @param {Object} actor
     * @param {string} [actor.mbox]
     * @param {string} [actor.openid]
     * @param {string} [actor.mbox_sha1sum]
     * @param {Object} [actor.account]
     * @param {string} [actor.account.homePage]
     * @param {string} [actor.account.name]
     * @return {string|Object|undefined}
     */
    ADL.xapiutil.getActorId = function (actor) {
        return actor.mbox || actor.openid || actor.mbox_sha1sum || actor.account;
    };

    /**
     * Renders the actor object into an identifying string or returns `'unknown'`.
     * @param {Object} actor
     * @param {string} [actor.mbox]
     * @param {string} [actor.openid]
     * @param {string} [actor.mbox_sha1sum]
     * @param {string} [actor.member]
     * @param {Object} [actor.account]
     * @param {string} [actor.account.homePage]
     * @param {string} [actor.account.name]
     * @return {string}
     */
    ADL.xapiutil.getActorIdString = function (actor) {
        var id = actor.mbox || actor.openid || actor.mbox_sha1sum;
        if (!id) {
            if (actor.account) id = actor.account.homePage + ":" + actor.account.name;
            else if (actor.member) id = "Anon Group " + actor.member;
            else id = 'unknown';
        }
        return id;
    };

    /**
     * Returns the `actor.name` or `getActorIdString`
     * @param {Object} actor
     * @param {string} [actor.name]
     * @param {string} [actor.mbox]
     * @param {string} [actor.openid]
     * @param {string} [actor.mbox_sha1sum]
     * @param {string} [actor.member]
     * @param {Object} [actor.account]
     * @param {string} [actor.account.homePage]
     * @param {string} [actor.account.name]
     * @return {string}
     */
    ADL.xapiutil.getActorDisplay = function (actor) {
        return actor.name || ADL.xapiutil.getActorIdString(actor);
    };

    /**
     * Returns `verb.display` for the environment language or the `verb.id`.
     * @param {Object} [verb]
     * @param {Object.<getLang, string>} [verb.display]
     * @param {string} [verb.id]
     * @return {string|undefined}
     */
    ADL.xapiutil.getVerbDisplay = function (verb) {
        if (!verb) return;
        if (verb.display) {
            return ADL.xapiutil.getLangVal(verb.display) || verb.id;
        }
        return verb.id;
    };

    /**
     * Returns `object.objectType` property or, if the object has an `id`
     * then it returns `'Activity'` otherwise it returns `'Agent'`
     * @param {Object} object
     * @param {string} [object.objectType]
     * @param {string} [object.id]
     * @return {string}
     */
    ADL.xapiutil.getObjectType = function (object) {
        return object.objectType || ((object.id) ? "Activity" : "Agent");
    };

    /**
     * Returns `object.id`, or if `getObjectType` is `'Agent'` or `'Group'` then
     * return `getActorId` otherwise it returns `undefined`.
     * @param {Object} object
     * @param {string} [object.id]
     * @param {string} [object.type]
     * @param {string} [object.mbox]
     * @param {string} [object.openid]
     * @param {string} [object.mbox_sha1sum]
     * @param {string} [object.member]
     * @param {Object} [object.account]
     * @param {string} [object.account.homePage]
     * @param {string} [object.account.name]
     * @return {string|undefined}
     */
    ADL.xapiutil.getObjectId = function (object) {
        if (object.id) return object.id;
        var type = ADL.xapiutil.getObjectType(object);
        if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorId(object);
        return undefined;
    };

    /**
     * Returns `object.id`, or if `getObjectType` is `'Agent'` or `'Group'` then
     * return `getActorIdString`, if type is `'SubStatement'` then return a SubStatement
     * representation of the object or return `'unknown'`.
     * @param {Object} [object]
     * @param {string} [object.id]
     * @param {string} [object.type]
     * @param {string} [object.mbox]
     * @param {string} [object.openid]
     * @param {string} [object.mbox_sha1sum]
     * @param {string} [object.member]
     * @param {Object} [object.account]
     * @param {string} [object.account.homePage]
     * @param {string} [object.account.name]
     * @param {string} [object.stored]
     * @param {string} [object.version]
     * @param {string} [object.authority]
     * @param {Object} [object.actor]
     * @param {Object} [object.verb]
     * @param {Object} [object.object]
     * @return {string}
     */
    ADL.xapiutil.getObjectIdString = function (object) {
        if (!object) return 'unknown'
        if (object.id) return object.id;
        var type = ADL.xapiutil.getObjectType(object);
        if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorIdString(object);
        else if (type == "SubStatement") {
            return getSubStatementDisplay(object);
        }
        return 'unknown';
    };

    /**
     * Returns `object.definition.name` by the environment language code,
     * the `object.name`, `object.id`, or if type is `'Agent'` or `'Group'` then
     * retursn `getActorDisplay`, if type is `'SubStatement`' then returns a
     * SubStatement representation of the object or return `'unknown'`.
     * @param {Object} [object]
     * @param {Object} [object.definition]
     * @param {Object.<getLang, string>} [object.definition.name]
     * @param {string} [object.name]
     * @param {string} [object.id]
     * @param {string} [object.type]
     * @param {string} [object.mbox]
     * @param {string} [object.openid]
     * @param {string} [object.mbox_sha1sum]
     * @param {string} [object.member]
     * @param {Object} [object.account]
     * @param {string} [object.account.homePage]
     * @param {string} [object.account.name]
     * @param {string} [object.stored]
     * @param {string} [object.version]
     * @param {string} [object.authority]
     * @param {Object} [object.actor]
     * @param {Object} [object.verb]
     * @param {Object} [object.object]
     * @return {string}
     */
    ADL.xapiutil.getObjectDisplay = function (object) {
        if (!object) return "unknown"
        var disp = getObjDefName(object) || object.name || object.id;
        if (! disp) {
            var type = ADL.xapiutil.getObjectType(object);
            if (type === "Agent" || type == "Group") disp = ADL.xapiutil.getActorDisplay(object);
            else if (type == "SubStatement") {
                disp = getSubStatementDisplay(object);
            }
        }

        return disp;
    };

})(typeof window !== "undefined" ? window.ADL = window.ADL || {} : typeof global !== "undefined" ? global.ADL = global.ADL || {} : this);
