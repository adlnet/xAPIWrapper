(function (ADL) {
    var getObjDefName = function (o) {
        if (o.definition && o.definition.name) {
            return o.definition.name[ADL.xapiutil.getLang()];
        }
        return undefined;
    };
    
    var getObjType = function (o) {
        return o.objectType || "Activity";
    };
    
    ADL.xapiutil = {};
    
    ADL.xapiutil.getLang = function () {
        return navigator.language || navigator.browserLanguage 
            || navigator.systemLanguage || navigator.userLanguage || "en-US";
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
        return a.mbox || a.openid || a.mbox_sha1sum || a.account.homePage + ":" + a.account.name;
    };
    
    ADL.xapiutil.getActorDisplay = function (a) {
        return a.name || ADL.xapiutil.getActorIdString(a);
    };
    
    ADL.xapiutil.getVerbDisplay = function (v) { 
        if (!v) return;
        if (v.display) return v.display[ADL.xapiutil.getLang()] || v.id;
        return v.id;
    };
    
    ADL.xapiutil.getObjectId = function (o) {
        
    };
    
    ADL.xapiutil.getObjectIdString = function (o) {
        
    };
    
    ADL.xapiutil.getObjectDisplay = function (o) {
        return getObjDefName(o) || o.name || o.id || getActorId(o);
    };
        
})(window.ADL = window.ADL || {});