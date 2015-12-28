(function (obj) {
    var ADL = obj;
    if (typeof window !== 'undefined') {
        ADL = window.ADL = obj.ADL || {};
    }

    var getObjDefName = function (o) {
        if (o.definition && o.definition.name) {
            return o.definition.name[ADL.xapiutil.getLang()];
        }
        return undefined;
    };

    var getSubStatementDisplay = function (o) {

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

    ADL.xapiutil.getMoreStatements = function (iterations, callback) {
        var stmts = [];
        ADL.XAPIWrapper.getStatements(null,null, function getMore(r) {
            if (! (r && r.response) ) return;
            var res = JSON.parse(r.response);
            if (! res.statements) return;
            stmts = stmts.concat(res.statements);

            if (iterations-- <= 0) {
                callback(stmts);
            }
            else {
                if (res.more && res.more !== "") {
                    ADL.XAPIWrapper.getStatements(null, res.more, getMore);
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
        if (v.display) return v.display[ADL.xapiutil.getLang()] || v.id;
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
        else if (type == "SubStatement") return ADL.xapiutil.getActorId(o.actor) + ":" + o.verb.id + ":" + ADL.xapiutil.getObjectId(o.object);
        return undefined;
    };

    ADL.xapiutil.getObjectDisplay = function (o) {
        var disp = getObjDefName(o) || o.name || o.id;
        if (! disp) {
            var type = ADL.xapiutil.getObjectType(o);
            if (type === "Agent" || type == "Group") disp = ADL.xapiutil.getActorDisplay(o);
            else if (type == "SubStatement") disp = ADL.xapiutil.getActorId(o.actor) + ":" + o.verb.id + ":" + ADL.xapiutil.getObjectId(o.object);
        }

        return disp;
    };

})(this);
