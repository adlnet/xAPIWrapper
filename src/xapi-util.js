(function (obj) {
    var ADL = obj;
    var onBrowser = false;
    if (typeof window !== 'undefined') {
        ADL = window.ADL = obj.ADL || {};
        onBrowser = true;
    }


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

    ADL.xapiutil.getLang = function () {
        var lang;
        if (typeof navigator !== 'undefined')
            lang =  navigator.language || navigator.browserLanguage ||
            navigator.systemLanguage || navigator.userLanguage;
        else if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && typeof process.env.LANG !== 'undefined') {
            var str = process.env.LANG;
            lang =  str.slice(0, str.indexOf('.'));
            lang = lang.replace(/_/, '-')
        }
        return lang || "en-US";
    };

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

    ADL.xapiutil.getMoreStatements = function (iterations, callback, searchParams) {
        if (!onBrowser) throw new Error("Node not supported.");

        var stmts = [];

        ADL.XAPIWrapper.getStatements(searchParams, null, function getMore(r) {
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
        });
    };

    ADL.xapiutil.getActorId = function (a) {
        return a.mbox || a.openid || a.mbox_sha1sum || a.account;
    };

    ADL.xapiutil.getActorIdString = function (a) {
        var id = a.mbox || a.openid || a.mbox_sha1sum;
        if (! id) {
            if (a.account) id = a.account.homePage + ":" + a.account.name;
            else if (a.member) id = "Anon Group " + a.member;
            else id = 'unknown';
        }
        return id;
    };

    ADL.xapiutil.getActorDisplay = function (a) {
        return a.name || ADL.xapiutil.getActorIdString(a);
    };

    ADL.xapiutil.getVerbDisplay = function (v) {
        if (!v) return;
        if (v.display) {
            return ADL.xapiutil.getLangVal(v.display) || v.id;
        }
        return v.id;
    };

    ADL.xapiutil.getObjectType = function (o) {
        return o.objectType || ((o.id) ? "Activity" : "Agent");
    };

    ADL.xapiutil.getObjectId = function (o) {
        if (o.id) return o.id;
        var type = ADL.xapiutil.getObjectType(o);
        if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorId(o);
        return undefined;
    };

    ADL.xapiutil.getObjectIdString = function (o) {
        if (!o) return 'unknown'
        if (o.id) return o.id;
        var type = ADL.xapiutil.getObjectType(o);
        if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorIdString(o);
        else if (type == "SubStatement") {
            return getSubStatementDisplay(o);
        }
        return 'unknown';
    };

    ADL.xapiutil.getObjectDisplay = function (o) {
        if (!o) return "unknown"
        var disp = getObjDefName(o) || o.name || o.id;
        if (! disp) {
            var type = ADL.xapiutil.getObjectType(o);
            if (type === "Agent" || type == "Group") disp = ADL.xapiutil.getActorDisplay(o);
            else if (type == "SubStatement") {
                disp = getSubStatementDisplay(o);
            }
        }

        return disp;
    };

})(this);
