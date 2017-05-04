// adds toISOString to date objects if not there
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = `0${r}`;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };

  }() );
}


(function (obj) {
    var ADL = obj;
    var onBrowser = false;
    if (typeof window !== 'undefined') {
      ADL = window.ADL = obj.ADL || {};
      onBrowser = true;
    }
    else
      CryptoJS = require('crypto-js');

    var getObjDefName = function (o) {
        if (o.definition && o.definition.name) {
            return Util.getLangVal(o.definition.name);
        }
        return undefined;
    };

    var getSubStatementDisplay = function (o) {
        if(o.objectType !== "SubStatement") return;
        if(o.object.objectType === "SubStatement") return;
        if(o.id || o.stored || o.version || o.authority) return;
        var disp =  `${Util.getActorId(o.actor)}:${Util.getVerbDisplay(o.verb)}:${Util.getObjectId(o.object)}`;
        return disp;
    };


    Util = {};

    Util.getLang = function () {
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

    Util.getLangVal = function (langprop) {

        if (!langprop) return;

        var options = Object.keys(langprop);
        // test that langprop is a dict (obj)
        // skips if not a dict(obj) and returns
        if (options.length == 0) return undefined;

        var lang = Util.getLang(),
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

    Util.getActorId = function (a) {
        return a.mbox || a.openid || a.mbox_sha1sum || a.account;
    };

    Util.getActorIdString = function (a) {
        var id = a.mbox || a.openid || a.mbox_sha1sum;
        if (! id) {
            if (a.account) id = `${a.account.homePage}:${a.account.name}`;
            else if (a.member) id = `Anon Group ${a.member}`;
            else id = 'unknown';
        }
        return id;
    };

    Util.getActorDisplay = function (a) {
        return a.name || Util.getActorIdString(a);
    };

    Util.getVerbDisplay = function (v) {
        if (!v) return;
        if (v.display) {
            return Util.getLangVal(v.display) || v.id;
        }
        return v.id;
    };

    Util.getObjectType = function (o) {
        return o.objectType || ((o.id) ? "Activity" : "Agent");
    };

    Util.getObjectId = function (o) {
        if (o.id) return o.id;
        var type = Util.getObjectType(o);
        if (type === "Agent" || type === "Group") return Util.getActorId(o);
        return undefined;
    };

    Util.getObjectIdString = function (o) {
        if (!o) return 'unknown'
        if (o.id) return o.id;
        var type = Util.getObjectType(o);
        if (type === "Agent" || type === "Group") return Util.getActorIdString(o);
        else if (type == "SubStatement") {
            return getSubStatementDisplay(o);
        }
        return 'unknown';
    };

    Util.getObjectDisplay = function (o) {
        if (!o) return "unknown"
        var disp = getObjDefName(o) || o.name || o.id;
        if (! disp) {
            var type = Util.getObjectType(o);
            if (type === "Agent" || type == "Group") disp = Util.getActorDisplay(o);
            else if (type == "SubStatement") {
                disp = getSubStatementDisplay(o);
            }
        }

        return disp;
    };

    /*!
    Excerpt from: Math.uuid.js (v1.4)
    http://www.broofa.com
    mailto:robert@broofa.com
    Copyright (c) 2010 Robert Kieffer
    Dual licensed under the MIT and GPL licenses.
    */
    Util.ruuid = function()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
        });
    };

    /*
     * dateFromISOString
     * parses an ISO string into a date object
     * isostr - the ISO string
     */
    Util.dateFromISOString = function(isostr)
    {
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "([T| ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        var d = isostr.match(new RegExp(regexp));

        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) { date.setMonth(d[3] - 1); }
        if (d[5]) { date.setDate(d[5]); }
        if (d[7]) { date.setHours(d[7]); }
        if (d[8]) { date.setMinutes(d[8]); }
        if (d[10]) { date.setSeconds(d[10]); }
        if (d[12]) { date.setMilliseconds(Number(`0.${d[12]}`) * 1000); }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        time = (Number(date) + (offset * 60 * 1000));

        var dateToReturn = new Date();
        dateToReturn.setTime(Number(time));
        return dateToReturn;
    }

    Util.getByteLen = function(normal_val) {
        // Force string type
        normal_val = String(normal_val);

        var byteLen = 0;
        for (var i = 0; i < normal_val.length; i++) {
            var c = normal_val.charCodeAt(i);
            byteLen += c < (1 <<  7) ? 1 :
                       c < (1 << 11) ? 2 :
                       c < (1 << 16) ? 3 :
                       c < (1 << 21) ? 4 :
                       c < (1 << 26) ? 5 :
                       c < (1 << 31) ? 6 : Number.NaN;
        }
        return byteLen;
    }

    // shim for old-style Base64 lib
    Util.toBase64 = function(text){
      if(CryptoJS && CryptoJS.enc.Base64)
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(text));
      else
        return Base64.encode(text);
    }

    // shim for old-style crypto lib
    Util.toSHA1 = function(text){
      if(CryptoJS && CryptoJS.SHA1)
        return CryptoJS.SHA1(text).toString();
      else
        return Crypto.util.bytesToHex( Crypto.SHA1(text,{asBytes:true}) );
    }
    Util.toSHA256 = function(text){
      if(CryptoJS && CryptoJS.SHA256)
        return CryptoJS.SHA256(text).toString();

    }

    // check if string or object is date, if it is, return date object
    // feburary 31st == march 3rd in this solution
    Util.isDate = function(date) {
        // check if object is being passed
        if ( Object.prototype.toString.call(date) === "[object Date]" )
            var d = date;
        else
            var d = new Date(date);
        // deep check on date object
        if ( Object.prototype.toString.call(d) === "[object Date]" )
        {
            // it is a date
            if ( isNaN( d.valueOf() ) )
            {
                XAPIWrapper.prototype.log("Invalid date String passed");
                return null;
            } else {
                return d;
            }
        } else {
            // not a date
            XAPIWrapper.prototype.log("Invalid date object");
            return null;
        }
    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      module.exports = Util;
    }

})(this);
