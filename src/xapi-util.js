(function (obj) {
    var ADL = obj;
    var onBrowser = false;
    if (typeof window !== 'undefined') {
        ADL = window.ADL = obj.ADL || {};
        onBrowser = true;
    }

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
        else if (process && process.env) {
            var str = process.env.LANG;
            lang =  str.slice(0, str.indexOf('.'));
            lang = lang.replace(/_/, '-')
        }
        return lang || "en-US";
    };

    ADL.xapiutil.getLangVal = function (langprop) {

        if (!langprop) return;

        var options = Object.keys(langprop);
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
