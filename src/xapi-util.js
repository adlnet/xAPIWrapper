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
//test for undefined first
        if (!langprop) return;
//let's get wordy for a bit and think things out
//is this really the best way to do this?  don't know but let's do it
//and then look at how to make it better
    //so we've tested and there is something passed in at this point
    //next we grab the keys in an array so we can easily get to what we want
        var options = Object.keys(langprop);
        // test that langprop is a dict (obj)
        // skips if not a dict(obj) and returns
    //is undefined what we want to return -
    //so maybe the calling function will have to test and then get id or something
        if (options.length == 0) return undefined;

    //at this point something was passed in and that something has some kind of properties that we have the keys for in an array
    //so let's get the language and see if we can find a match
    //note we only go from what we are given and whittle down until we find a match or had back the first option if we find nothing
    //should we have looked harder to make sure this is a dictionary, or worked to find a more complex match, i'm kind of hoping not because i'm happy to not do work that won't really make it better, but on the other hand if this really would make this better at what it it doing, then I want to do it
        var lang = ADL.xapiutil.getLang(),
            ret,    //make undefined
            dispGotten = false;
        do {    //test and retest
    //if the key works, unlock the door
            if (langprop[lang])
            {
                ret = langprop[lang];
                dispGotten = true;
            }
    //if not, adjust the key and set up to try again
            else if (lang.indexOf('-'))
            {
                lang = lang.substring(0, lang.lastIndexOf('-'));
//    console.log('lang is now', lang);
            }
    //there was another else option, but the while test takes care of stopping if there is nothing left of our string
        } while (!dispGotten && lang !=="");

    //and here we return what we've found or haven't
    //let's go see if this will all run, and let's make some tests to try it out
        return ret;
    };

    ADL.xapiutil.getMoreStatements = function (iterations, callback, searchParams) {
        if (!onBrowser) throw new Error("Node not supported.");

        var stmts = [];
// debugger;
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
        if (o.id) return o.id;
        var type = ADL.xapiutil.getObjectType(o);
        if (type === "Agent" || type === "Group") return ADL.xapiutil.getActorIdString(o);
        else if (type == "SubStatement") {
            return getSubStatementDisplay(o);
        }
        return 'unknown';
    };

    ADL.xapiutil.getObjectDisplay = function (o) {
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
