// adds toISOString to date objects if not there
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
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

// shim for old-style Base64 lib
function toBase64(text){
  if(CryptoJS && CryptoJS.enc.Base64)
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(text));
  else
    return Base64.encode(text);
}

// shim for old-style crypto lib
function toSHA1(text){
  if(CryptoJS && CryptoJS.SHA1)
    return CryptoJS.SHA1(text).toString();
  else
    return Crypto.util.bytesToHex( Crypto.SHA1(text,{asBytes:true}) );
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

(function (ADL) {

    log.debug = false;

    function getByteLen(normal_val) {
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
     */
    var Config = function()
    {
        var conf = {};
        conf['endpoint'] = "http://localhost:8000/xapi/";
        //try
        //{
            conf['auth'] = "Basic " + toBase64('tom:1234');
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
        return conf
    }();

    /*
     * XAPIWrapper Constructor
     * @param {object} config   with a minimum of an endoint property
     * @param {boolean} verifyxapiversion   indicating whether to verify the version of the LRS is compatible with this wrapper
     */
    var XAPIWrapper = function(config, verifyxapiversion)
    {



        this.lrs = getLRSObject(config || {});
        if (this.lrs.user && this.lrs.password)
            updateAuth(this.lrs, this.lrs.user, this.lrs.password);
        this.base = getbase(this.lrs.endpoint);

        this.withCredentials = false;
        if (config && typeof(config.withCredentials) != 'undefined') {
            this.withCredentials = config.withCredentials;
        }

        // Ensure that callbacks are always executed, first param is error (null if no error) followed
        // by the result(s)
        this.strictCallbacks = false;
        this.strictCallbacks = config && config.strictCallbacks;

        function getbase(url)
        {
            var l = document.createElement("a");
            l.href = url;
            if (l.protocol && l.host) {
                return l.protocol + "//" + l.host;
            } else if (l.href) {
                // IE 11 fix.
                var parts = l.href.split("//");
                return parts[0] + "//" + parts[1].substr(0, parts[1].indexOf("/"));
            }
            else
                ADL.XAPIWrapper.log("Couldn't create base url from endpoint: " + url);
        }

        function updateAuth(obj, username, password){
            obj.auth = "Basic " + toBase64(username + ":" + password);
        }

        if (verifyxapiversion && testConfig.call(this))
        {
            window.ADL.XHR_request(this.lrs, this.lrs.endpoint+"about", "GET", null, null,
                function(r){
                    if(r.status == 200)
                    {
                        try
                        {
                            var lrsabout = JSON.parse(r.response);
                            var versionOK = false;
                            for (var idx in lrsabout.version)
                            {
                                if (lrsabout.version.hasOwnProperty(idx))
                                    if(lrsabout.version[idx] == ADL.XAPIWrapper.xapiVersion)
                                    {
                                        versionOK = true;
                                        break;
                                    }
                            }
                            if (!versionOK)
                            {
                                ADL.XAPIWrapper.log("The lrs version [" + lrsabout.version +"]"+
                                    " does not match this wrapper's XAPI version [" + ADL.XAPIWrapper.xapiVersion + "]");
                            }
                        }
                        catch(e)
                        {
                            ADL.XAPIWrapper.log("The response was not an about object")
                        }
                    }
                    else
                    {
                        ADL.XAPIWrapper.log("The request to get information about the LRS failed: " + r);
                    }
                }, null, false, null, this.withCredentials, false);


        }

        this.searchParams = function(){
            var sp = {"format" : "exact"};
            return sp;
        };

        this.hash = function(tohash){
            if (!tohash) return null;
            try
            {
                return toSHA1(tohash);
            }
            catch(e)
            {
                ADL.XAPIWrapper.log("Error trying to hash -- " + e);
                return null;
            }
        };

        this.changeConfig = function(config){
            try
            {
                ADL.XAPIWrapper.log("updating lrs object with new configuration");
                this.lrs = mergeRecursive(this.lrs, config);
                if (config.user && config.password)
                    this.updateAuth(this.lrs, config.user, config.password);
                this.base = getbase(this.lrs.endpoint);
                this.withCredentials = config.withCredentials;
                this.strictCallbacks = config.strictCallbacks;
            }
            catch(e)
            {
                ADL.XAPIWrapper.log("error while changing configuration -- " + e);
            }
        };

        this.updateAuth = updateAuth;
    };

    // This wrapper is based on the Experience API Spec version:
    XAPIWrapper.prototype.xapiVersion = "1.0.1";

    /*
     * Adds info from the lrs object to the statement, if available.
     * These values could be initialized from the Config object or from the url query string.
     * @param {object} stmt   the statement object
     */
    XAPIWrapper.prototype.prepareStatement = function(stmt)
    {
        if(stmt.actor === undefined){
            stmt.actor = JSON.parse(this.lrs.actor);
        }
        else if(typeof stmt.actor === "string") {
            stmt.actor = JSON.parse(stmt.actor);
        }
        if (this.lrs.grouping ||
            this.lrs.registration ||
            this.lrs.activity_platform) {
            if (!stmt.context) {
                stmt.context = {};
            }
        }

        if (this.lrs.grouping) {
            if (!stmt.context.contextActivities) {
                stmt.context.contextActivities = {};
            }
            
            // PR from brian-learningpool to resolve context overwriting
            if (!Array.isArray(stmt.context.contextActivities.grouping)) {
                stmt.context.contextActivities.grouping = [{ id : this.lrs.grouping }];
            } else {
                stmt.context.contextActivities.grouping.splice(0, 0, { id : this.lrs.grouping });
            }
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
    XAPIWrapper.prototype.defaultEncoding = 'utf-8';

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
    XAPIWrapper.prototype.sendStatement = function(stmt, callback, attachments)
    {
        if (this.testConfig())
        {
            this.prepareStatement(stmt);
            var id;
            if (stmt['id'])
            {
                id = stmt['id'];
            }
            else
            {
                id = ADL.ruuid();
                stmt['id'] = id;
            }

            var payload = JSON.stringify(stmt);
            var extraHeaders = null;
            if(attachments && attachments.length > 0)
            {
                extraHeaders = {}
                payload = this.buildMultipartPost(stmt,attachments,extraHeaders);
            }
            var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint+"statements",
                "POST", payload, this.lrs.auth, callback, {"id":id}, null, extraHeaders,
                this.withCredentials, this.strictCallbacks);
            if (!callback)
                return {"xhr":resp,
                        "id" :id};
        }
    };

    XAPIWrapper.prototype.stringToArrayBuffer = function(content, encoding)
    {
        encoding = encoding || ADL.XAPIWrapper.defaultEncoding;

        return new TextEncoder(encoding).encode(content).buffer;
    };

    XAPIWrapper.prototype.stringFromArrayBuffer = function(content, encoding) {
        encoding = encoding || ADL.XAPIWrapper.defaultEncoding;

        return new TextDecoder(encoding).decode(content);
    };

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
    XAPIWrapper.prototype.buildMultipartPost = function(statement, attachments, extraHeaders)
    {
        statement.attachments = [];
        for (var i = 0; i < attachments.length; i++) {
            // Replace the term 'signature' with the hard coded definition for a signature attachment
            if (attachments[i].type == "signature") {
                attachments[i].type = {
                   "usageType": "http://adlnet.gov/expapi/attachments/signature",
                   "display": {
                    "en-US": "A JWT signature"
                   },
                   "description": {
                    "en-US": "A signature proving the statement was not modified"
                   },
                   "contentType": "application/octet-stream"
                }
            }

            if (typeof attachments[i].value === 'string') {
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
        var boundary = (Math.random() + ' ').substring(2,10) + (Math.random() + ' ').substring(2,10);

        extraHeaders["Content-Type"] = "multipart/mixed; boundary=" + boundary;

        var CRLF = "\r\n";
        var header = [
            "--" + boundary,
            "Content-Type: application/json",
            "Content-Disposition: form-data; name=\"statement\"",
            "",
            JSON.stringify(statement)
        ].join(CRLF) + CRLF;

        blobParts.push(header);

        for (var i in attachments) {
            if (attachments.hasOwnProperty(i)) {
                var attachmentHeader = [
                    "--" + boundary,
                    "Content-Type: " + attachments[i].type.contentType,
                    "Content-Transfer-Encoding: binary",
                    "X-Experience-API-Hash: " + attachments[i].type.sha2
                ].join(CRLF) + CRLF + CRLF;

                blobParts.push(attachmentHeader);
                blobParts.push(attachments[i].value);
            }
        }

        blobParts.push(CRLF + "--" + boundary + "--" + CRLF);

        return new Blob(blobParts);
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
     */
    XAPIWrapper.prototype.sendStatements = function(stmtArray, callback)
    {
        if (this.testConfig())
        {
            for(var i in stmtArray)
            {
                if (stmtArray.hasOwnProperty(i))
                    this.prepareStatement(stmtArray[i]);
            }
            var resp = ADL.XHR_request(this.lrs,this.lrs.endpoint+"statements",
                "POST", JSON.stringify(stmtArray), this.lrs.auth, callback, null,
                false, null, this.withCredentials, this.strictCallbacks);


            if (!callback)
            {
                return resp;
            }
        }
    };

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
    XAPIWrapper.prototype.getStatements = function(searchparams, more, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "statements";
            if (more)
            {
                url = this.base + more;
            }
            else
            {
                var urlparams = new Array();

                for (s in searchparams)
                {
                    if (searchparams.hasOwnProperty(s))
                    {
                        if (s == "until" || s == "since") {
                            var d = new Date(searchparams[s]);
                            urlparams.push(s + "=" + encodeURIComponent(d.toISOString()));
                        } else {
                            urlparams.push(s + "=" + encodeURIComponent(searchparams[s]));
                        }
                    }
                }
                if (urlparams.length > 0)
                    url = url + "?" + urlparams.join("&");
            }

            var res = ADL.XHR_request(this.lrs,url, "GET", null, this.lrs.auth,
                callback, null, false, null, this.withCredentials, this.strictCallbacks);

            if(res === undefined || res.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(res.response);
            }
            catch(e)
            {
                return res.response;
            }
        }
    };

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
    XAPIWrapper.prototype.getActivities = function(activityid, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities?activityId=<activityid>";
            url = url.replace('<activityid>', encodeURIComponent(activityid));

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth,
                callback, null, true, null, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result.response;
            }
        }
    };

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
    XAPIWrapper.prototype.sendState = function(activityid, agent, stateid, registration, stateval, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<stateid>',encodeURIComponent(stateid));

            if (registration)
            {
                url += "&registration=" + encodeURIComponent(registration);
            }

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var method = "PUT";
            if (stateval)
            {
                if (stateval instanceof Array)
                {
                    stateval = JSON.stringify(stateval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                }
                else if (stateval instanceof Object)
                {
                    stateval = JSON.stringify(stateval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                    method = "POST";
                }
                else
                {
                    headers = headers || {};
                    headers["Content-Type"] ="application/octet-stream";
                }
            }
            else
            {
                this.log("No activity state was included.");
                return false;
            }
            //(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders)

            ADL.XHR_request(this.lrs, url, method, stateval, this.lrs.auth, callback,
                null, null, headers, this.withCredentials, this.strictCallbacks);
        }
    };

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
    XAPIWrapper.prototype.getState = function(activityid, agent, stateid, registration, since, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));

            if (stateid)
            {
                url += "&stateId=" + encodeURIComponent(stateid);
            }

            if (registration)
            {
                url += "&registration=" + encodeURIComponent(registration);
            }

            if(since)
            {
                since = isDate(since);
                if (since != null) {
                    url += '&since=' + encodeURIComponent(since.toISOString());
                }
            }

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth,
                callback, null, true, null, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result.response;
            }
        }
    };

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
    XAPIWrapper.prototype.deleteState = function(activityid, agent, stateid, registration, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<stateid>',encodeURIComponent(stateid));

            if (registration)
            {
                url += "&registration=" + encodeURIComponent(registration);
            }

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth,
                callback, null, false, headers, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result;
            }
        }
    };

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
    XAPIWrapper.prototype.sendActivityProfile = function(activityid, profileid, profileval, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var method = "PUT";
            if (profileval)
            {
                if (profileval instanceof Array)
                {
                    profileval = JSON.stringify(profileval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                }
                else if (profileval instanceof Object)
                {
                    profileval = JSON.stringify(profileval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                    method = "POST";
                }
                else
                {
                    headers = headers || {};
                    headers["Content-Type"] ="application/octet-stream";
                }
            }
            else
            {
                this.log("No activity profile was included.");
                return false;
            }

            ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback,
                null, false, headers, this.withCredentials, this.strictCallbacks);
        }
    };

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
    XAPIWrapper.prototype.getActivityProfile = function(activityid, profileid, since, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));

            if (profileid)
            {
                url += "&profileId=" + encodeURIComponent(profileid);
            }

            if(since)
            {
                since = isDate(since);
                if (since != null) {
                    url += '&since=' + encodeURIComponent(since.toISOString());
                }
            }

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth,
                callback, null, true, null, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result.response;
            }
        }
    };

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
    XAPIWrapper.prototype.deleteActivityProfile = function(activityid, profileid, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities/profile?activityId=<activity ID>&profileId=<profileid>";

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth,
                callback, null, false, headers,this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result;
            }
        }
    };

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
    XAPIWrapper.prototype.getAgents = function(agent, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "agents?agent=<agent>";
            url = url.replace('<agent>', encodeURIComponent(JSON.stringify(agent)));

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth,
                callback, null, true, null, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result.response;
            }
        }
    };

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
    XAPIWrapper.prototype.sendAgentProfile = function(agent, profileid, profileval, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var method = "PUT";
            if (profileval)
            {
                if (profileval instanceof Array)
                {
                    profileval = JSON.stringify(profileval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                }
                else if (profileval instanceof Object)
                {
                    profileval = JSON.stringify(profileval);
                    headers = headers || {};
                    headers["Content-Type"] ="application/json";
                    method = "POST";
                }
                else
                {
                    headers = headers || {};
                    headers["Content-Type"] ="application/octet-stream";
                }
            }
            else
            {
                this.log("No agent profile was included.");
                return false;
            }

            ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback,
                null, false, headers, this.withCredentials, this.strictCallbacks);
        }
    };

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
    XAPIWrapper.prototype.getAgentProfile = function(agent, profileid, since, callback)
    {
        if (this.testConfig()){
            var url = this.lrs.endpoint + "agents/profile?agent=<agent>";

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            if (profileid)
            {
                url += "&profileId=" + encodeURIComponent(profileid);
            }

            if(since)
            {
                since = isDate(since);
                if (since != null) {
                    url += '&since=' + encodeURIComponent(since.toISOString());
                }
            }

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth,
                callback, null, true, null, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result.response;
            }
        }
    };

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
    XAPIWrapper.prototype.deleteAgentProfile = function(agent, profileid, matchHash, noneMatchHash, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "agents/profile?agent=<agent>&profileId=<profileid>";

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            var headers = null;
            if(matchHash && noneMatchHash)
            {
                log("Can't have both If-Match and If-None-Match");
            }
            else if (matchHash)
            {
                headers = {"If-Match":ADL.formatHash(matchHash)};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":ADL.formatHash(noneMatchHash)};
            }

            var result = ADL.XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth,
                callback, null, false, headers, this.withCredentials, this.strictCallbacks);

            if(result === undefined || result.status == 404)
            {
                return null
            }

            try
            {
                return JSON.parse(result.response);
            }
            catch(e)
            {
                return result;
            }
        }
    };

    /*
     * Tests the configuration of the lrs object
     */
    function testConfig()
    {
        try
        {
            return this.lrs.endpoint != undefined && this.lrs.endpoint != "";
        }
        catch(e)
        {
            return false
        }
    }

    // outputs the message to the console if available
    function log(message)
    {
        if (!log.debug) return false;
        try
        {
            console.log(message);
            return true;
        }
        catch(e){return false;}
    }

    // merges two object
    function mergeRecursive(obj1, obj2)
    {
        for (var p in obj2)
        {
            if (obj2.hasOwnProperty(p) == false)
                continue;

            var prop = obj2[p];
            log(p + " : " + prop);
            try
            {
                // Property in destination object set; update its value.
                if ( obj2[p].constructor==Object )
                {
                    obj1[p] = mergeRecursive(obj1[p], obj2[p]);

                }
                else
                {
                  if (obj1 == undefined)
                  {
                    obj1 = new Object();
                  }
                    obj1[p] = obj2[p];
                }
            }
            catch(e)
            {
              if (obj1 == undefined)
              {
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
    function getLRSObject(config)
    {
        var lrsProps = ["endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform"];
        var lrs = new Object();
        var qsVars, prop;

        qsVars = parseQueryString();
        if (qsVars !== undefined && Object.keys(qsVars).length !== 0) {
            for (var i = 0; i<lrsProps.length; i++){
                prop = lrsProps[i];
                if (qsVars[prop]){
                    lrs[prop] = qsVars[prop];
                    delete qsVars[prop];
                }
            }
            // if (Object.keys(qsVars).length !== 0) {
            //     lrs.extended = qsVars;
            // }

            lrs = mergeRecursive(config, lrs);
        }
        else {
            lrs = config;
        }

        return lrs;
    }

    // parses the params in the url query string
    function parseQueryString()
    {
        var qs, pairs, pair, ii, parsed;

        qs = window.location.search.substr(1);

        pairs = qs.split('&');
        parsed = {};
        for ( ii = 0; ii < pairs.length; ii++) {
            pair = pairs[ii].split('=');
            if (pair.length === 2 && pair[0]) {
                parsed[pair[0]] = decodeURIComponent(pair[1]);
            }
        }

        return parsed;
    }


    function delay()
    {
        var xhr = new XMLHttpRequest();
        var url = window.location + '?forcenocache='+ADL.ruuid();
        xhr.open('GET', url, false);
        xhr.send(null);
    }

    /*
     * formats a request in a way that IE will allow
     * @param {string} method   the http request method (ex: "PUT", "GET")
     * @param {string} url   the url to the request (ex: ADL.XAPIWrapper.lrs.endpoint + "statements")
     * @param {array} [headers]   headers to include in the request
     * @param {string} [data]   the body of the request, if there is one
     * @return {object} xhr response object
     */
    function ie_request(method, url, headers, data)
    {
        var newUrl = url;

        //Everything that was on query string goes into form vars
        var formData = new Array();
        var qsIndex = newUrl.indexOf('?');
        if(qsIndex > 0){
            formData.push(newUrl.substr(qsIndex+1));
            newUrl = newUrl.substr(0, qsIndex);
        }

        //Method has to go on querystring, and nothing else
        newUrl = newUrl + '?method=' + method;

        //Headers
        if(headers !== null){
            for (var headerName in headers) {
                if (headers.hasOwnProperty(headerName))
                    formData.push(headerName + "=" + encodeURIComponent(headers[headerName]));
            }
        }

        //The original data is repackaged as "content" form var
        if(data !== null){
            formData.push('content=' + encodeURIComponent(data));
        }

        return {
            "method":"POST",
            "url":newUrl,
            "headers":{},
            "data":formData.join("&")
        };
    }

    /*!
    Excerpt from: Math.uuid.js (v1.4)
    http://www.broofa.com
    mailto:robert@broofa.com
    Copyright (c) 2010 Robert Kieffer
    Dual licensed under the MIT and GPL licenses.
    */
    ADL.ruuid = function()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
        });
    };

    /*
     * dateFromISOString
     * parses an ISO string into a date object
     * isostr - the ISO string
     */
    ADL.dateFromISOString = function(isostr)
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
        if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        time = (Number(date) + (offset * 60 * 1000));

        var dateToReturn = new Date();
        dateToReturn.setTime(Number(time));
        return dateToReturn;
    };

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
    ADL.XHR_request = function(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders, withCredentials, strictCallbacks)
    {
        "use strict";

        var xhr,
            finished = false,
            xDomainRequest = false,
            ieXDomain = false,
            ieModeRequest,
            urlparts = url.toLowerCase().match(/^(.+):\/\/([^:\/]*):?(\d+)?(\/.*)?$/),
            location = window.location,
            urlPort,
            result,
            extended,
            prop,
            until;

        //Consolidate headers
        var headers = {};
        headers["Content-Type"] = "application/json";
        headers["Authorization"] = auth;
        headers['X-Experience-API-Version'] = ADL.XAPIWrapper.xapiVersion;
        if(extraHeaders !== null){
            for (var headerName in extraHeaders) {
                if (extraHeaders.hasOwnProperty(headerName))
                    headers[headerName] = extraHeaders[headerName];
            }
        }

        //See if this really is a cross domain
        xDomainRequest = (location.protocol.toLowerCase() !== urlparts[1] || location.hostname.toLowerCase() !== urlparts[2]);
        if (!xDomainRequest) {
            urlPort = (urlparts[3] === null ? ( urlparts[1] === 'http' ? '80' : '443') : urlparts[3]);
            xDomainRequest = (urlPort === location.port);
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
        var windowsVersionCheck = window.XDomainRequest && (window.XMLHttpRequest && new XMLHttpRequest().responseType === undefined);
        if (!xDomainRequest || windowsVersionCheck === undefined || windowsVersionCheck===false) {
            xhr = new XMLHttpRequest();
            xhr.withCredentials = withCredentials; //allow cross domain cookie based auth
            xhr.open(method, url, callback != null);
            for(var headerName in headers){
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
            if(!finished){
                // may be in sync or async mode, using XMLHttpRequest or IE XDomainRequest, onreadystatechange or
                // onload or both might fire depending upon browser, just covering all bases with event hooks and
                // using 'finished' flag to avoid triggering events multiple times
                finished = true;
                var notFoundOk = (ignore404 && xhr.status === 404);
                if (xhr.status === undefined || (xhr.status >= 200 && xhr.status < 400) || notFoundOk) {
                    if (callback) {
                        if(callbackargs){
                            strictCallbacks ? callback(null, xhr, callbackargs) : callback(xhr, callbackargs);
                        }
                        else {
                          var body;

                            try {
                                body = JSON.parse(xhr.responseText);
                            }
                            catch(e){
                                body = xhr.responseText;
                            }

                          strictCallbacks ? callback(null, xhr, body) : callback(xhr,body);
                        }
                    } else {
                        result = xhr;
                        return xhr;
                    }
                } else {
                    var warning;
                    try {
                        warning = "There was a problem communicating with the Learning Record Store. ( "
                            + xhr.status + " | " + xhr.response+ " )" + url
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
        };

        xhr.onreadystatechange = function () {
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
                until = 1000 + new Date();
                while (new Date() < until && xhr.readyState !== 4 && !finished) {
                    delay();
                }
            }
            return requestComplete();
        }
    };

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
    ADL.xhrRequestOnError = function(xhr, method, url, callback, callbackargs, strictCallbacks){
        if (callback && strictCallbacks) {
            var status = xhr ? xhr.status : undefined;
            var error;
            if (status) {
                error = new Error('Request error: ' + xhr.status);
            } else if (status === 0 || status === null) { // 0 and null = aborted
                error = new Error('Request error: aborted');
            } else {
                error = new Error('Reqeust error: unknown');
            }

            if (callbackargs) {
                callback(error, xhr, callbackargs);
            } else {
              var body;

                try {
                    body = JSON.parse(xhr.responseText);
                } catch(e){
                    body = xhr.responseText;
                }

              callback(error, xhr, body);
            }
        }
    };

    ADL.formatHash = function(hash)
    {
      return (hash==="*") ? hash : '"'+hash+'"';
    }

    ADL.XAPIWrapper = new XAPIWrapper(Config, false);

}(window.ADL = window.ADL || {}));
