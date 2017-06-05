{

  log.debug = true;
  let onBrowser = true;

  if (typeof module !== 'undefined') {
    onBrowser = false;
    var XmlHttpRequest = require('xhr2');
    var Util = require('./Utils.js');
  } else {
    window.ADL = window.ADL || {};
    var Util = window.ADL.Util;
  }

  /*
   * Config object used w/ url params to configure the lrs object
   * change these to match your lrs
   * @return {object} config object
   * @example
   * let conf = {
   *    "endpoint" : "https://lrs.adlnet.gov/xapi/",
   *    "auth" : `Basic ${Util.toBase64('tom:1234')}`,
   * };
   * XAPIWrapper.changeConfig(conf);
   */
  let Config = function() {
      let conf = {};
      conf['endpoint'] = "https://lrs.adlnet.gov/xapi/";
      try
      {
          conf['auth'] = `Basic ${Util.toBase64('tom:1234')}`;
      }
      catch (e)
      {
          log(`Exception in Config trying to encode auth: ${e}`);
      }

      // Statement defaults
      // conf["actor"] = {"mbox":"default@example.com"};
      // conf["registration"] =  Util.ruuid();
      // conf["grouping"] = {"id":"ctxact:default/grouping"};
      // conf["activity_platform"] = "default platform";
      return conf;
  }();

  class XAPIWrapper {
    /*
     * XAPIWrapper Constructor
     * @param {object} config   with a minimum of an endoint property
     * @param {boolean} verifyxapiversion   indicating whether to verify the version of the LRS is compatible with this wrapper
     */
    constructor(config, verifyxapiversion) {
      this.lrs = getLRSObject(config || {});

      if (this.lrs.user && this.lrs.password)
        updateAuth(this.lrs, this.lrs.user, this.lrs.password);
      this.base = getbase(this.lrs.endpoint);

      this.withCredentials = false;
      this.withCredentials = config && config.withCredentials;

      // Ensure that callbacks are always executed, first param is error (null if no error) followed
      // by the result(s)
      this.strictCallbacks = false;
      this.strictCallbacks = config && config.strictCallbacks;

      function getbase(url)
      {
        if (!onBrowser)
          return;

        let l = document.createElement("a");
        l.href = url;

        if (l.protocol && l.host)
          return `${l.protocol}//${l.host}`;
        else
          log(`Couldn't create base url from endpoint: ${url}`);
      }

      function updateAuth(obj, username, password){
        obj.auth = `Basic ${Util.toBase64(`${username}:${password}`)}`;
      }

      if (verifyxapiversion && testConfig.call(this))
      {
          XHR_request(this.lrs, `${this.lrs.endpoint}about`, "GET", null, null,
              r => {
                  if(r.status == 200)
                  {
                      try
                      {
                          let lrsabout = JSON.parse(r.response);
                          let versionOK = false;
                          for (let idx in lrsabout.version)
                          {
                              if(lrsabout.version[idx] == this.xapiVersion)
                              {
                                  versionOK = true;
                                  break;
                              }
                          }
                          if (!versionOK)
                          {
                              log(`The lrs version [${lrsabout.version}] does not match this wrapper's XAPI version [${this.xapiVersion}]`);
                          }
                      }
                      catch(e)
                      {
                          this.log("The response was not an about object")
                      }
                  }
                  else
                  {
                      this.log(`The request to get information about the LRS failed: ${r}`);
                  }
              },null,false,null,this.withCredentials, false);
      }

      this.searchParams = () => {
          return {"format": "exact"};
      };

      this.hash = (tohash) => {
          if (!tohash) return null;
          try
          {
              return Util.toSHA1(tohash);
          }
          catch(e)
          {
              log(`Error trying to hash -- ${e}`);
              return null;
          }
      };

      this.changeConfig = (config) => {
        try
        {
            log("updating lrs object with new configuration");
            this.lrs = mergeRecursive(this.lrs, config);
            if (config.user && config.password)
                updateAuth(this.lrs, config.user, config.password);
            this.base = getbase(this.lrs.endpoint);
            this.withCredentials = config.withCredentials;
            this.strictCallbacks = config.strictCallbacks;
        }
        catch(e)
        {
            log(`error while changing configuration -- ${e}`);
        }
      };

      this.updateAuth = updateAuth;
      this.xapiVersion = "1.0.3";
    }

    /*
     * Adds info from the lrs object to the statement, if available.
     * These values could be initialized from the Config object or from the url query string.
     * @param {object} stmt   the statement object
     */
    prepareStatement(stmt)
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

    /*
     * Send a single statement to the LRS using a PUT request.
     * @param {object} stmt   statement object to send
     * @param {string} id   id of the statement object to send
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     *            and an object with an id property assigned the id
     *            of the statement
     * @return {object} object containing xhr object and id of statement
     */
    putStatement(stmt, id, callback, attachments)
    {
        if (this.testConfig())
        {
            this.prepareStatement(stmt);
            stmt['id'] = (id == null || id == "") ? Util.ruuid() : id;

            let payload = JSON.stringify(stmt);
            let extraHeaders = null;
            if(attachments && attachments.length > 0)
            {
                extraHeaders = {};
                payload = this.buildMultipart(stmt, attachments, extraHeaders);
            }

            let resp = XHR_request(this.lrs, `${this.lrs.endpoint}statements`,
                "PUT", payload, this.lrs.auth, callback, stmt['id'], null, extraHeaders, this.withCredentials, this.strictCallbacks);
            if (!callback)
                return {"xhr":resp,
                        "id" :stmt['id']};
        }
    };

    /*
     * Send a single statement to the LRS using a POST request.
     * Makes a Javascript object with the statement id as 'id' available to the callback function.
     * @param {object} stmt   statement object to send
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     *            and an object with an id property assigned the id
     *            of the statement
     * @return {object} object containing xhr object and id of statement
     */
    postStatement(stmt, callback, attachments)
    {
        if (this.testConfig())
        {
            this.prepareStatement(stmt);
            let id;
            if (stmt['id'])
            {
                id = stmt['id'];
            }
            else
            {
                id = Util.ruuid();
                stmt['id'] = id;
            }

            let payload = JSON.stringify(stmt);
            let extraHeaders = null;
            if(attachments && attachments.length > 0)
            {
                extraHeaders = {}
                payload = this.buildMultipart(stmt,attachments,extraHeaders)
            }
            let resp = XHR_request(this.lrs, `${this.lrs.endpoint}statements`,
                "POST", payload, this.lrs.auth, callback, null, null, extraHeaders, this.withCredentials, this.strictCallbacks);
            if (!callback)
                return {"xhr":resp, id};
        }
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
    buildMultipart(statement,attachments,extraHeaders)
    {
        statement.attachments = [];
        for(let i =0; i < attachments.length; i++)
        {
            //replace the term 'signature' with the hard coded definition for a signature attachment
            if(attachments[i].type == "signature")
            {
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

            //compute the length and the sha2 of the attachment
            attachments[i].type.length = attachments[i].value.length;
            attachments[i].type.sha2 = Util.toSHA256(attachments[i].value);

            //attach the attachment metadata to the statement
            statement.attachments.push(attachments[i].type)
        }

        let body = "";
        let CRLF = "\r\n";
        let boundary = (`${Math.random()} `).substring(2,10)+(`${Math.random()} `).substring(2,10);

        extraHeaders["Content-Type"] = `multipart/mixed; boundary=${boundary}`;

        body += `${CRLF}--${boundary}${CRLF}Content-Type:application/json${CRLF}Content-Disposition: form-data; name=\"statement\"${CRLF}${CRLF}`;
        body += JSON.stringify(statement);

        for(let i in attachments)
        {
            body += `${CRLF}--${boundary}${CRLF}X-Experience-API-Hash:${attachments[i].type.sha2}${CRLF}Content-Type:application/octet-stream${CRLF}Content-Transfer-Encoding: binary${CRLF}${CRLF}`;
            body += attachments[i].value;
        }
        body += `${CRLF}--${boundary}--${CRLF}`;




        return body;
    }

    /*
     * Send a list of statements to the LRS.
     * @param {array} stmtArray   the list of statement objects to send
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object
     * @example
     * let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
     *             "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
     *                       "display" : {"en-US" : "answered"}},
     *             "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
     * let resp_obj = XAPIWrapper.postStatement(stmt);
     * XAPIWrapper.getStatements({"statementId":resp_obj.id});
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
    postStatements(stmtArray, callback)
    {
        if (this.testConfig())
        {
            for(let i in stmtArray)
            {
                this.prepareStatement(stmtArray[i]);
            }
            let resp = XHR_request(this.lrs,`${this.lrs.endpoint}statements`,
                "POST", JSON.stringify(stmtArray), this.lrs.auth, callback,null,false,null,this.withCredentials, this.strictCallbacks);


            if (!callback)
            {
                return resp;
            }
        }
    };

    /*
     * Get statement(s) based on the searchparams or more url.
     * @param {object} searchparams   an XAPIWrapper.searchParams object of
     *                key(search parameter)-value(parameter value) pairs.
     *                Example:
     *                  let myparams = XAPIWrapper.searchParams();
     *                  myparams['verb'] = verbs.completed.id;
     *                  let completedStmts = XAPIWrapper.getStatements(myparams);
     * @param {string} more   the more url found in the StatementResults object, if there are more
     *        statements available based on your get statements request. Pass the
     *        more url as this parameter to retrieve those statements.
     * @param {function} [callback] - function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * let ret = XAPIWrapper.getStatements();
     * if (ret)
     *     XAPIWrapper.log(ret.statements);
     *
     * >> <Array of statements>
     */
    getStatements(searchparams, more, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}statements`;
            if (more)
            {
                url = this.base + more;
            }
            else
            {
                let urlparams = new Array();

                for (s in searchparams)
                {
                    if (s == "until" || s == "since") {
                        let d = new Date(searchparams[s]);
                        urlparams.push(`${s}=${encodeURIComponent(d.toISOString())}`);
                    } else {
                        urlparams.push(`${s}=${encodeURIComponent(searchparams[s])}`);
                    }
                }
                if (urlparams.length > 0)
                    url = `${url}?${urlparams.join("&")}`;
            }

            let res = XHR_request(this.lrs,url, "GET", null, this.lrs.auth, callback,null,false,null,this.withCredentials, this.strictCallbacks);

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

    getMoreStatements(iterations, callback, searchParams) {
        if (!onBrowser) throw new Error("Node not supported.");

        let stmts = [];

        this.getStatements(searchParams, null, getMore = (r) => {
            if (! (r && r.response) ) return;
            let res = JSON.parse(r.response);
            if (! res.statements) return;
            stmts = stmts.concat(res.statements);

            if (iterations-- <= 0) {
                callback(stmts);
            }
            else {
                if (res.more && res.more !== "")
                {
                    this.getStatements(searchParams, res.more, getMore);
                }
                else if (res.more === "")
                {
                    callback(stmts);
                }
            }
        });
    };

    /*
     * Gets the Activity object from the LRS.
     * @param {string} activityid   the id of the Activity to get
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * let res = XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
     * XAPIWrapper.log(res);
     * >> <Activity object>
     */
    getActivities(activityid, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}activities?activityId=<activityid>`;
            url = url.replace('<activityid>', encodeURIComponent(activityid));

            let result = XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true,null,this.withCredentials, this.strictCallbacks);

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
     * Update activity state in the LRS
     * @param {string} activityid   the id of the Activity this state is about
     * @param {object} agent   the agent this Activity state is related to
     * @param {string} stateid   the id you want associated with this state
     * @param {string} [registration]   the registraton id associated with this state
     * @param {string} stateval   the state
     * @param {string} [matchHash]    the hash of the state to replace or * to replace any
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {boolean} false if no activity state is included
     */
    putState(activityid, agent, stateid, registration, stateval, matchHash, callback)
    {
        if (this.testConfig())
        {
            if (!stateval)
              return false;

            if (!matchHash || matchHash == "")
              matchHash = '*';

            let url = `${this.lrs.endpoint}activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<stateid>',encodeURIComponent(stateid));

            if (registration)
                url += `&registration=${encodeURIComponent(registration)}`;

            let headers = {"If-Match":`"${matchHash}"`};
            if (stateval instanceof Array || stateval instanceof Object)
            {
                stateval = JSON.stringify(stateval);
                headers["Content-Type"] ="application/json";
            }
            else
                headers["Content-Type"] ="application/octet-stream";


            XHR_request(this.lrs, url, "PUT", stateval, this.lrs.auth, callback, null, null, headers,this.withCredentials, this.strictCallbacks);
        }
    };

    /*
     * Store activity state in the LRS
     * @param {string} activityid   the id of the Activity this state is about
     * @param {object} agent   the agent this Activity state is related to
     * @param {string} stateid   the id you want associated with this state
     * @param {string} [registration]   the registraton id associated with this state
     * @param {string} stateval   the state
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {boolean} false if no activity state is included
     */
    postState(activityid, agent, stateid, registration, stateval, callback)
    {
        if (this.testConfig())
        {
            if (!stateval)
              return false;

            let url = `${this.lrs.endpoint}activities/state?activityId=<activity ID>&agent=<agent>&stateId=<stateid>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<stateid>',encodeURIComponent(stateid));

            if (registration)
                url += `&registration=${encodeURIComponent(registration)}`;

            let headers = {};
            if (stateval instanceof Array || stateval instanceof Object)
            {
                stateval = JSON.stringify(stateval);
                headers["Content-Type"] ="application/json";
            }
            else
                headers["Content-Type"] ="application/octet-stream";


            XHR_request(this.lrs, url, "POST", stateval, this.lrs.auth, callback, null, null, headers, this.withCredentials, this.strictCallbacks);
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
     * XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                  {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> {info: "the state info"}
     */
    getState(activityid, agent, stateid, registration, since, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}activities/state?activityId=<activity ID>&agent=<agent>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));

            if (stateid)
            {
                url += `&stateId=${encodeURIComponent(stateid)}`;
            }

            if (registration)
            {
                url += `&registration=${encodeURIComponent(registration)}`;
            }

            if(since)
            {
                since = Util.isDate(since);
                if (since != null) {
                    url += `&since=${encodeURIComponent(since.toISOString())}`;
                }
            }

            let result = XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);

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
     * @param {string} [stateid]   the id you want associated with this state
     * @param {string} [registration]   the registraton id associated with this state
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * let stateval = {"info":"the state info"};
     * XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
     *                           {"mbox":"mailto:tom@example.com"},
     *                           "questionstate", null, stateval);
     * XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> {info: "the state info"}
     *
     * XAPIWrapper.deleteState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     *
     * XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
     *                         {"mbox":"mailto:tom@example.com"}, "questionstate");
     * >> 404
     */
    deleteState(activityid, agent, stateid, registration, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}activities/state?activityId=<activity ID>&agent=<agent>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));

            if (stateid)
            {
                url += `&stateId=${encodeURIComponent(stateid)}`;
            }

            if (registration)
            {
                url += `&registration=${encodeURIComponent(registration)}`;
            }

            let headers = null;
            let result = XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);

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
     * Update activity profile in the LRS
     * @param {string} activityid   the id of the Activity this profile is about
     * @param {string} profileid   the id you want associated with this state
     * @param {string} profileval   the profile
     * @param {string} [matchHash]    the hash of the state to replace or * to replace any
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {boolean} false if no activity state is included
     */
    putActivityProfile(activityid, profileid, profileval, matchHash, callback)
    {
        if (this.testConfig())
        {
            if (!profileval)
              return false;

            if (!matchHash || matchHash == "")
              matchHash = '*';

            let url = `${this.lrs.endpoint}activities/profile?activityId=<activity ID>&profileId=<profileid>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            let headers = {"If-Match":`"${matchHash}"`};
            if (profileval instanceof Array || profileval instanceof Object)
            {
                profileval = JSON.stringify(profileval);
                headers["Content-Type"] ="application/json";
            }
            else
                headers["Content-Type"] ="application/octet-stream";


            XHR_request(this.lrs, url, "PUT", profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
        }
    };

    /*
     * Store activity profile in the LRS
     * @param {string} activityid   the id of the Activity this profile is about
     * @param {string} profileid   the id you want associated with this state
     * @param {string} profileval   the profile
     * @param {function} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {boolean} false if no activity state is included
     */
    postActivityProfile(activityid, profileid, profileval, callback)
    {
        if (this.testConfig())
        {
          if (!profileval)
            return false;

          let url = `${this.lrs.endpoint}activities/profile?activityId=<activity ID>&profileId=<profileid>`;

          url = url.replace('<activity ID>',encodeURIComponent(activityid));
          url = url.replace('<profileid>',encodeURIComponent(profileid));

          let headers = {};
          if (profileval instanceof Array || profileval instanceof Object)
          {
              profileval = JSON.stringify(profileval);
              headers["Content-Type"] ="application/json";
          }
          else
              headers["Content-Type"] ="application/octet-stream";


          XHR_request(this.lrs, url, "POST", profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
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
     * XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
     *                                    "actprofile", null,
     *                                    function(r){XAPIWrapper.log(JSON.parse(r.response));});
     * >> {info: "the profile"}
     */
    getActivityProfile(activityid, profileid, since, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}activities/profile?activityId=<activity ID>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));

            if (profileid)
            {
                url += `&profileId=${encodeURIComponent(profileid)}`;
            }

            if(since)
            {
                since = Util.isDate(since);
                if (since != null) {
                    url += `&since=${encodeURIComponent(since.toISOString())}`;
                }
            }

            let result = XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);

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
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * XAPIWrapper.deleteActivityProfile("http://adlnet.gov/expapi/activities/question",
     *                                       "actprofile");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     */
    deleteActivityProfile(activityid, profileid, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}activities/profile?activityId=<activity ID>&profileId=<profileid>`;

            url = url.replace('<activity ID>',encodeURIComponent(activityid));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            let headers = null;
            let result = XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false, headers,this.withCredentials, this.strictCallbacks);

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
     * let res = XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"});
     * XAPIWrapper.log(res);
     * >> <Person object>
     */
    getAgents(agent, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}agents?agent=<agent>`;
            url = url.replace('<agent>', encodeURIComponent(JSON.stringify(agent)));

            let result = XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null, this.withCredentials, this.strictCallbacks);

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
     * Update agent profile in the LRS
     * @param {object} agent   the agent this profile is related to
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} profileval   the profile
     * @param {string} [matchHash]    the hash of the profile to replace or * to replace any
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} false if no agent profile is included
     */
    putAgentProfile(agent, profileid, profileval, matchHash, callback)
    {
        if (this.testConfig())
        {
            if (!profileval)
              return false;

            if (!matchHash || matchHash == "")
              matchHash = '*';

            let url = `${this.lrs.endpoint}agents/profile?agent=<agent>&profileId=<profileid>`;

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            let headers = {"If-Match":`"${matchHash}"`};
            if (profileval instanceof Array || profileval instanceof Object)
            {
                profileval = JSON.stringify(profileval);
                headers["Content-Type"] ="application/json";
            }
            else
                headers["Content-Type"] ="application/octet-stream";


            XHR_request(this.lrs, url, "PUT", profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
        }
    };

    /*
     * Store agent profile in the LRS
     * @param {object} agent   the agent this profile is related to
     * @param {string} profileid   the id you want associated with this profile
     * @param {string} profileval   the profile
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} false if no agent profile is included
     */
    postAgentProfile(agent, profileid, profileval, callback)
    {
        if (this.testConfig())
        {
          if (!profileval)
            return false;

          let url = `${this.lrs.endpoint}agents/profile?agent=<agent>&profileId=<profileid>`;

          url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
          url = url.replace('<profileid>',encodeURIComponent(profileid));

          let headers = {};
          if (profileval instanceof Array || profileval instanceof Object)
          {
              profileval = JSON.stringify(profileval);
              headers["Content-Type"] ="application/json";
          }
          else
              headers["Content-Type"] ="application/octet-stream";


          XHR_request(this.lrs, url, "POST", profileval, this.lrs.auth, callback, null, false, headers, this.withCredentials, this.strictCallbacks);
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
     * XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
     *                                  "agentprofile", null,
     *                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
     * >> {info: "the agent profile"}
     */
    getAgentProfile(agent, profileid, since, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}agents/profile?agent=<agent>`;

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            if (profileid)
            {
                url += `&profileId=${encodeURIComponent(profileid)}`;
            }

            if(since)
            {
                since = Util.isDate(since);
                if (since != null) {
                    url += `&since=${encodeURIComponent(since.toISOString())}`;
                }
            }

            let result = XHR_request(this.lrs, url, "GET", null, this.lrs.auth, callback, null, true, null,this.withCredentials, this.strictCallbacks);

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
     * @param {string} [callback]   function to be called after the LRS responds
     *            to this request (makes the call asynchronous)
     *            the function will be passed the XMLHttpRequest object
     * @return {object} xhr response object or null if 404
     * @example
     * XAPIWrapper.deleteAgentProfile({"mbox":"mailto:tom@example.com"},
     *                                     "agentprofile");
     * >> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}
     */
    deleteAgentProfile(agent, profileid, callback)
    {
        if (this.testConfig())
        {
            let url = `${this.lrs.endpoint}agents/profile?agent=<agent>&profileId=<profileid>`;

            url = url.replace('<agent>',encodeURIComponent(JSON.stringify(agent)));
            url = url.replace('<profileid>',encodeURIComponent(profileid));

            let headers = null;
            let result = XHR_request(this.lrs, url, "DELETE", null, this.lrs.auth, callback, null, false,headers,this.withCredentials, this.strictCallbacks);

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
    testConfig()
    {
      return (this.lrs.endpoint != undefined && this.lrs.endpoint != "");
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
      for (let p in obj2)
      {
          let prop = obj2[p];
		      log(`${p}:${prop}`);
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
  };

  // iniitializes an lrs object with settings from
  // a config file and from the url query string
  function getLRSObject(config)
  {
      let lrsProps = ["endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform"];
      let lrs = new Object();
      let qslets, prop;

      qslets = parseQueryString();
      if (qslets !== undefined && Object.keys(qslets).length !== 0) {
          for (let i = 0; i<lrsProps.length; i++){
              prop = lrsProps[i];
              if (qslets[prop]){
                  lrs[prop] = qslets[prop];
                  delete qslets[prop];
              }
          }
          if (Object.keys(qslets).length !== 0) {
            lrs.extended = qslets;
          }

          lrs = mergeRecursive(config, lrs);
      }
      else {
          lrs = config;
      }

      return lrs;
  };

  // parses the params in the url query string
  function parseQueryString()
  {
      if (!onBrowser)
        return {};

      let qs, pairs, pair, ii, parsed;

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
  };

  function delay()
  {
      let xhr;
      let url;

      if (onBrowser) {
        xhr = new XMLHttpRequest();
        url = window.location;
      }
      else
        xhr = new XmlHttpRequest();

      url += `?forcenocache=${Util.ruuid()}`;
      xhr.open('GET', url, false);
      xhr.send(null);
  };

  /*
   * formats a request in a way that IE will allow
   * @param {string} method   the http request method (ex: "PUT", "GET")
   * @param {string} url   the url to the request (ex: XAPIWrapper.lrs.endpoint + "statements")
   * @param {array} [headers]   headers to include in the request
   * @param {string} [data]   the body of the request, if there is one
   * @return {object} xhr response object
   */
  function ie_request(method, url, headers, data)
  {
      let newUrl = url;

      //Everything that was on query string goes into form lets
      let formData = new Array();
      let qsIndex = newUrl.indexOf('?');
      if(qsIndex > 0){
          formData.push(newUrl.substr(qsIndex+1));
          newUrl = newUrl.substr(0, qsIndex);
      }

      //Method has to go on querystring, and nothing else
      newUrl = `${newUrl}?method=${method}`;

      //Headers
      if(headers !== null){
          for(let headerName in headers){
              formData.push(`${headerName}=${encodeURIComponent(headers[headerName])}`);
          }
      }

      //The original data is repackaged as "content" form let
      if(data !== null){
          formData.push(`content=${encodeURIComponent(data)}`);
      }

      return {
          "method":"POST",
          "url":newUrl,
          "headers":{},
          "data":formData.join("&")
      };
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
  function XHR_request(lrs, url, method, data, auth, callback, callbackargs, ignore404, extraHeaders, withCredentials, strictCallbacks)
  {
    "use strict";

      let xhr,
          finished = false,
          xDomainRequest = false,
          ieXDomain = false,
          ieModeRequest,
          urlparts = url.toLowerCase().match(/^(.+):\/\/([^:\/]*):?(\d+)?(\/.*)?$/),
          location = onBrowser ? window.location : "",
          urlPort,
          result,
          extended,
          prop,
          until;

      //Consolidate headers
      let headers = {};
      headers["Content-Type"] = "application/json";
      headers["Authorization"] = auth;
      headers['X-Experience-API-Version'] = "1.0.3";
      if(extraHeaders !== null){
          for(let headerName in extraHeaders){
              headers[headerName] = extraHeaders[headerName];
          }
      }

      //See if this really is a cross domain
      xDomainRequest = (location.protocol !== urlparts[1] || location.hostname !== urlparts[2]);
      if (!xDomainRequest) {
          urlPort = (urlparts[3] === null ? ( urlparts[1] === 'http' ? '80' : '443') : urlparts[3]);
          xDomainRequest = (urlPort === location.port);
      }

      //If it's not cross domain or we're not using IE, use the usual XmlHttpRequest
      let windowsVersionCheck = false;
      if (onBrowser)
        windowsVersionCheck = window.XDomainRequest && (window.XMLHttpRequest && new XMLHttpRequest().responseType === undefined);
      if (!xDomainRequest || windowsVersionCheck === undefined || windowsVersionCheck===false) {
          xhr = onBrowser ? new XMLHttpRequest()  // browser environment
                          : new XmlHttpRequest(); // nodeJS environment
          xhr.withCredentials = withCredentials; //allow cross domain cookie based auth
          xhr.open(method, url, callback != null);

          for(let headerName in headers){
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
              let notFoundOk = (ignore404 && xhr.status === 404);
              if (xhr.status === undefined || (xhr.status >= 200 && xhr.status < 400) || notFoundOk) {
                  if (callback) {
                      if(callbackargs){
                          strictCallbacks ? callback(null, xhr, callbackargs) : callback(xhr, callbackargs);
                      }
                      else {
                          try {
                              let body = JSON.parse(xhr.responseText);
                              strictCallbacks ? callback(null, xhr, body) : callback(xhr, body);
                          }
                          catch(e){
                              callback(xhr,xhr.responseText);
                              strictCallbacks ? callback(null, xhr, body) : callback(xhr, xhr.responseText);
                          }
                      }
                  } else {
                      result = xhr;
                      return xhr;
                  }
              } else {
                  let warning;
                  try {
                      warning = `There was a problem communicating with the Learning Record Store. ( ${xhr.status} | ${xhr.response} )${url}`;
                  } catch (ex) {
                      warning = ex.toString();
                  }
                  log(warning);
                  xhrRequestOnError(xhr, method, url, callback, callbackargs, strictCallbacks);
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
   * xhrRequestOnError = function(xhr, method, url, callback, callbackargs) {
   *   console.log(xhr);
   *   alert(xhr.status + " " + xhr.statusText + ": " + xhr.response);
   * };
   */
  function xhrRequestOnError(xhr, method, url, callback, callbackargs, strictCallbacks){
    if (callback && strictCallbacks) {
      let status = xhr ? xhr.status : undefined;
      let error;
      if (status) {
          error = new Error(`Request error: ${xhr.status}`);
      } else if (status === 0 || status === null) {
          error = new Error('Request error: aborted');
      } else {
          error = new Error('Request error: unknown');
      }

      if (callbackargs) {
          callback(error, xhr, callbackargs);
      } else {
          try {
              let body = JSON.parse(xhr.responseText);
              callback(error, xhr, body);
          } catch (e){
              callback(error, xhr, xhr.responseText);
          }
      }
    }
  };

  if (!onBrowser) {
    module.exports = new XAPIWrapper(Config, false);
  } else {
    window.ADL.XAPIWrapper = new XAPIWrapper(Config, false);
  }

}
