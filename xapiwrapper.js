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

(function(ADL){
    log.debug = true;
    // config object used w/ url params to configure the lrs object
    // change these to match your lrs
    var Config = function()
    {
        var conf = {};
        conf['endpoint'] = "http://localhost:8000/xapi/";
        try
        {
            conf['auth'] = "Basic " + Base64.encode('tom:1234'); 
        }
        catch (e)
        {
            log("Exception in Config trying to encode auth: " + e);
        }

        // Statement defaults
        // conf["actor"] = {"mbox":"default@example.com"};
        // conf["registration"] =  ruuid();
        // conf["grouping"] = {"id":"ctxact:default/grouping"};
        // conf["activity_platform"] = "default platform";
        return conf
    }();

    /*
     * XAPIWrapper Constructor
     * config - object with a minimum of an endoint property
     * verifyxapiversion - boolean indicating whether to verify the 
     *                     version of the LRS is compatible with this
     *                     wrapper
     */
    XAPIWrapper = function(config, verifyxapiversion)
    {
        this.lrs = getLRSObject(config);
        if (this.lrs.user && this.lrs.password)
            updateAuth(this.lrs, this.lrs.user, this.lrs.password);
        this.base = getbase(this.lrs.endpoint);

        function getbase(url)
        {
            var l = document.createElement("a");
            l.href = url;
            if (l.protocol && l.host)
                return l.protocol + "//" + l.host;
            else
                ADL.XAPIWrapper.log("Couldn't create base url from endpoint: " + this.lrs.endpoint);
        }

        function updateAuth(obj, username, password){
            obj.auth = "Basic " + Base64.encode(username + ":" + password);
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
                });
        }

        this.searchParams = function(){
            var sp = {"format" : "exact"};
            return sp;
        };

        this.hash = function(tohash){
            if (!tohash) return null;
            try
            {
                var digestBytes = Crypto.SHA1(tohash, { asBytes: true });
                return Crypto.util.bytesToHex(digestBytes);
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

    // This wrapper was built on:
    XAPIWrapper.prototype.build = "2013-12-09T20:00Z";

    /*
     * prepareStatement
     * Adds info from the lrs object to the statement, if available.
     * These values could be initialized from the Config object or from 
     * the url query string.
     * stmt - the statement object
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
            stmt.context.contextActivities.grouping = [{ id : this.lrs.grouping }];
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

    /*
     * sendStatement
     * Send a single statement to the LRS. Makes a Javascript object 
     * with the statement id as 'id' available to the callback function. 
     * stmt - statement object to send
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
     *            * and an object with an id property assigned the id 
     *            * of the statement
     */
    XAPIWrapper.prototype.sendStatement = function(stmt, callback) 
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
            var resp = ADL.XHR_request(this.lrs, this.lrs.endpoint+"statements", 
                "POST", JSON.stringify(stmt), this.lrs.auth, callback, {"id":id});
            if (!callback)
                return {"xhr":resp,
                        "id" :id};
        }
    };

    /*
     * sendStatements
     * Send a list of statements to the LRS.
     * stmtArray - the list of statement objects to send
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
     */
    XAPIWrapper.prototype.sendStatements = function(stmtArray, callback) 
    {
        if (this.testConfig())
        {
            for(var i in stmtArray)
            {
                this.prepareStatement(stmtArray[i]);
            }
            var resp = ADL.XHR_request(this.lrs,this.lrs.endpoint+"statements", 
                "POST", JSON.stringify(stmtArray), this.lrs.auth, callback);
            if (!callback)
            {
                return resp;
            }
        }
    };

    /*
     * getStatements
     * Get statement(s) based on the searchparams or more url.
     * searchparams - an ADL.XAPIWrapper.searchParams object of 
     *                key(search parameter)-value(parameter value) pairs. 
     *                Example:
     *                  var myparams = ADL.XAPIWrapper.searchParams();
     *                  myparams['verb'] = ADL.verbs.completed.id;
     *                  var completedStmts = ADL.XAPIWrapper.getStatements(myparams);
     * more - the more url found in the StatementResults object, if there are more 
     *        statements available based on your get statements request. Pass the 
     *        more url as this parameter to retrieve those statements.
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                    urlparams.push(s + "=" + encodeURIComponent(searchparams[s]));
                }
                if (urlparams.length > 0)
                    url = url + "?" + urlparams.join("&");
            }

            var res = ADL.XHR_request(this.lrs,url, "GET", null, this.lrs.auth, callback);
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
     * getActivities
     * Gets the Activity object from the LRS.
     * activityid - the id of the Activity to get
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
     */
    XAPIWrapper.prototype.getActivities = function(activityid, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "activities?activityId=<activityid>";
            url = url.replace('<activityid>', encodeURIComponent(activityid));

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true);
            
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
     * sendState
     * Store activity state in the LRS
     * activityid - the id of the Activity this state is about
     * agent - the agent this Activity state is related to 
     * stateid - the id you want associated with this state
     * registration - (optional) the registraton id associated with this state
     * stateval - the state
     * matchHash - the hash of the state to replace or * to replace any
     * noneMatchHash - the hash of the current state or * to indicate no previous state
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                headers = {"If-Match":'"'+matchHash+'"'};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":'"'+noneMatchHash+'"'};
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
                    headers["Content-Type"] ="application/octect-stream";
                }
            }
            else
            {
                this.log("No activity state was included.");
                return false;
            }
            //(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders) 
            ADL.XHR_request(this.lrs, url, method, stateval, this.lrs.auth, callback, null, null, headers);
        }
    };

    /*
     * getState
     * Get activity state from the LRS
     * activityid - the id of the Activity this state is about
     * agent - the agent this Activity state is related to 
     * stateid - (optional - if not included, the response will be a list of stateids 
     *            associated with the activity and agent)
     *            the id of the state
     * registration - (optional) the registraton id associated with this state
     * since - date object telling the LRS to return objects newer than the date supplied
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                url += '&since=' + encodeURIComponent(since.toISOString());
            }
            
            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true);
            
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
     * sendActivityProfile
     * Store activity profile in the LRS
     * activityid - the id of the Activity this profile is about
     * profileid - the id you want associated with this profile
     * profileval - the profile
     * matchHash - the hash of the profile to replace or * to replace any
     * noneMatchHash - the hash of the current profile or * to indicate no previous profile
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                headers = {"If-Match":'"'+matchHash+'"'};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":'"'+noneMatchHash+'"'};
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
                    headers["Content-Type"] ="application/octect-stream";
                }
            }
            else
            {
                this.log("No activity profile was included.");
                return false;
            }

            ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, false, headers);
        }
    };

    /*
     * getActivityProfile
     * Get activity profile from the LRS
     * activityid - the id of the Activity this profile is about
     * profileid - (optional - if not included, the response will be a list of profileids 
     *              associated with the activity)
     *              the id of the profile
     * since - date object telling the LRS to return objects newer than the date supplied
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                url += '&since=' + encodeURIComponent(since.toISOString());
            }
            
            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true);
            
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
     * getAgents
     * Gets the Person object from the LRS based on an agent object.
     * The Person object may contain more information about an agent. 
     * See the xAPI Spec for details.
     * agent - the agent object to get a Person
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
     */
    XAPIWrapper.prototype.getAgents = function(agent, callback)
    {
        if (this.testConfig())
        {
            var url = this.lrs.endpoint + "agents?agent=<agent>";
            url = url.replace('<agent>', encodeURIComponent(JSON.stringify(agent)));

            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true);
            
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
     * sendAgentProfile
     * Store agent profile in the LRS
     * agent - the agent this profile is related to
     * profileid - the id you want associated with this profile
     * profileval - the profile
     * matchHash - the hash of the profile to replace or * to replace any
     * noneMatchHash - the hash of the current profile or * to indicate no previous profile
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                headers = {"If-Match":'"'+matchHash+'"'};
            }
            else if (noneMatchHash)
            {
                headers = {"If-None-Match":'"'+noneMatchHash+'"'};
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
                    headers["Content-Type"] ="application/octect-stream";
                }
            }
            else
            {
                this.log("No agent profile was included.");
                return false;
            }

            ADL.XHR_request(this.lrs, url, method, profileval, this.lrs.auth, callback, null, false, headers);
        }
    };

    /*
     * getAgentProfile
     * Get agnet profile from the LRS
     * agent - the agent associated with this profile
     * profileid - (optional - if not included, the response will be a list of profileids 
     *              associated with the agent)
     *              the id of the profile
     * since - date object telling the LRS to return objects newer than the date supplied
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     *            * the function will be passed the XMLHttpRequest object
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
                url += '&since=' + encodeURIComponent(since.toISOString());
            }
            
            var result = ADL.XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true);
            
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

    // tests the configuration of the lrs object
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
            prop = obj2[p];
            console.log(p + " : " + prop);
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
        if (qsVars !== undefined) {
            for (var i = 0; i<lrsProps.length; i++){
                prop = lrsProps[i];
                if (qsVars[prop]){
                    lrs[prop] = qsVars[prop];
                    delete qsVars[prop];
                }
            }
            
            lrs.extended = qsVars;

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
        var loc, qs, pairs, pair, ii, parsed;
        
        loc = window.location.href.split('?');
        if (loc.length === 2) {
            qs = loc[1];
            pairs = qs.split('&');
            parsed = {};
            for ( ii = 0; ii < pairs.length; ii++) {
                pair = pairs[ii].split('=');
                if (pair.length === 2 && pair[0]) {
                    parsed[pair[0]] = decodeURIComponent(pair[1]);
                }
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
     * ie_request
     * formats a request in a way that IE will allow
     * method - the http request method (ex: "PUT", "GET")
     * url - the url to the request (ex: ADL.XAPIWrapper.lrs.endpoint + "statements")
     * headers - (optional) headers to include in the request
     * data - (optional) the body of the request, if there is one
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
            for(var headerName in headers){
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
     * XHR_request
     * makes a request to a server (if possible, use functions provided in XAPIWrapper)
     * lrs - the lrs connection info, such as endpoint, auth, etc
     * url - the url of this request
     * method - the http request method
     * data - the payload
     * auth - the value for the Authorization header
     * callback - function to be called after the LRS responds 
     *            to this request (makes the call asynchronous)
     * callbackargs - (optional) additional javascript object to be passed to the callback function
     * ignore 404 - allow page not found errors to pass
     * extraHeaders - other header key-values to be added to this request
     */
    ADL.XHR_request = function(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders) 
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
            for(var headerName in extraHeaders){
                headers[headerName] = extraHeaders[headerName];
            }
        }
        
        //See if this really is a cross domain
        xDomainRequest = (location.protocol.toLowerCase() !== urlparts[1] || location.hostname.toLowerCase() !== urlparts[2]);
        if (!xDomainRequest) {
            urlPort = (urlparts[3] === null ? ( urlparts[1] === 'http' ? '80' : '443') : urlparts[3]);
            xDomainRequest = (urlPort === location.port);
        }
        
        //If it's not cross domain or we're not using IE, use the usual XmlHttpRequest
        if (!xDomainRequest || typeof(XDomainRequest) === 'undefined') {
            xhr = new XMLHttpRequest();
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
                            callback(xhr, callbackargs);
                        }
                        else {
                            try {
                                var body = JSON.parse(xhr.responseText);
                                callback(xhr,body);
                            }
                            catch(e){
                                callback(xhr,xhr.responseText);
                            }
                        }
                    } else {
                        result = xhr;
                        return xhr;
                    }
                } else {
                    try {
                        alert("There was a problem communicating with the Learning Record Store. ( " 
                            + xhr.status + " | " + xhr.response+ " )" + xhr.url);
                    } catch (ex) {alert (ex.toString());}
                    //throw new Error("debugger");
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

    ADL.XAPIWrapper = new XAPIWrapper(Config, false);
    
}(window.ADL = window.ADL || {}));
