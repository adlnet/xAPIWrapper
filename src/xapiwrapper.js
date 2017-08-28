let debug = false;
let onBrowser = true;

if (typeof module !== 'undefined') {
  onBrowser = false;
  var fetch = require('node-fetch');
  Util = require('./Utils.js');
} else {
  window.ADL = window.ADL || {};
  Util = window.ADL.Util;
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
 *
 * Statement Defaults
 * conf["actor"] = {"mbox":"default@example.com"};
 * conf["registration"] =  Util.ruuid();
 * conf["grouping"] = {"id":"ctxact:default/grouping"};
 * conf["activity_platform"] = "default platform";
 */
let Config = (() => {
    let conf = {};
    conf['endpoint'] = "https://lrs.adlnet.gov/xapi/";
    try
    {
        conf['auth'] = `Basic ${Util.toBase64('tom:1234')}`;
    }
    catch (e)
    {
        console.log(`Exception in Config trying to encode auth: ${e}`);
    }

    return conf;
})();

/*
 * Outputs messages to the console (debug mode only)
 */
let log = (message) => {
  if (!debug)
    return;

  console.log(message);
};

class XAPIWrapper {
  /*
   * XAPIWrapper Constructor
   * @param {object} config   with a minimum of an endoint property
   * @param {boolean} verifyxapiversion   indicating whether to verify the version of the LRS is compatible with this wrapper
   */
  constructor(config={}, verifyxapiversion=false)
  {
    this.lrs = this.getLRSObject(config);

    if (this.lrs.user && this.lrs.password)
      this.updateAuth(this.lrs, this.lrs.user, this.lrs.password);

    this.base = this.getbase(this.lrs.endpoint);

    this.withCredentials = config && config.withCredentials;

    this.xapiVersion = "1.0.3";

    // Verify xAPI version
     if (verifyxapiversion && this.testConfig())
     {
         let conf = {
             'method': 'GET',
             'headers': {
                 'Content-Type': 'application/json',
                 'X-Experience-API-Version': this.xapiVersion,
                 'Authorization': this.lrs.auth
             }
         };
         fetch(`${this.lrs.endpoint}about`, conf)
             .then((resp) => {
                 return resp.json().then((data) => {
                     if (resp.ok) {
                         let versions = data.version;
                         let isValid = (versions.indexOf(this.xapiVersion)>=0);

                         if (!isValid) {
                            log(`Invalid xAPI Version: ${this.xapiVersion}`);
                            log(`Available versions are: ${JSON.stringify(versions)}`);
                         }
                     }
                 })
                     .catch((error) => {
                         log(`Error thrown while verifying xAPI Version: ${error}`);
                     });
             });
     }
  }

  getbase(url)
  {
    if (!onBrowser)
    {
      let base = Util.parseURL(url);
      return `${base.protocol}://${base.host}`;
    }

    let l = document.createElement("a");
    l.href = url;

    if (l.protocol && l.host)
      return `${l.protocol}//${l.host}`;
    else
      log(`Couldn't create base url from endpoint: ${url}`);
  }

  updateAuth(obj, username, password)
  {
    obj.auth = `Basic ${Util.toBase64(`${username}:${password}`)}`;
  }

  searchParams()
  {
    return {"format": "exact"};
  }

  hash(tohash)
  {
    try {
      return Util.toSHA1(tohash);
    } catch (e) {
      log(`Error trying to hash -- ${e}`);
      return null;
    }
  }

  changeConfig(config)
  {
    try
    {
      this.lrs = this.mergeRecursive(this.lrs, config);
      if (config.user && config.password)
          this.updateAuth(this.lrs, config.user, config.password);

      this.base = this.getbase(this.lrs.endpoint);
      this.withCredentials = config.withCredentials;
    }
    catch(e)
    {
      log(`Error while changing configuration -- ${e}`);
    }
  }

  /*
   * Adds info from the lrs object to the statement, if available.
   * These values could be initialized from the Config object or from the url query string.
   * @param {object} stmt   the statement object
   */
  prepareStatement(stmt)
  {
    try {
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
    } catch (e) {
      log(`Error while preparing statement: ${e}`);
    }
  };

  /*
  * Build the post body to include the multipart boundries, edit the statement to include the attachment types
  * attachments should be an array of objects of the type
  * {
        type:"signature" || {
          usageType : URI,
          display: Language-map
          description: Language-map
        },
        value : a UTF8 string containing the binary data of the attachment. For string values, this can just be the JS string.
     }
  * extraHeaders should be an object. It will have the multipart boundary value set
  */
  buildMultipart(statement, attachments, extraHeaders)
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
          statement.attachments.push(attachments[i].type);
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
   * Send a single statement to the LRS using a PUT request.
   * @param {object} stmt   statement object to send
   * @param {string} id   id of the statement object to send
   * @param [array] attachments   array of objects to send with statement
   * @param {function} [callback]   function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   *            the function will be passed the XMLHttpRequest object
   *            and an object with an id property assigned the id
   *            of the statement
   * @return {object} object containing xhr object and id of statement
   */
  putStatement(stmt, id, attachments, callback)
  {
      if (this.testConfig() && (stmt && !Array.isArray(stmt) && stmt.isValid()))
      {
        // validate id parameter
        if (!id || id == "") {
          if (callback) {
            callback('Error: invalid id');
            return;
          } else {
            return new Promise((res,rej) => { rej('Error: invalid id'); });
          }
        }

        // validate attachments if specified
        if (attachments) {
          let isValid = true;
          if (!Array.isArray(attachments) || attachments.length == 0) {
            isValid = false;
          } else {
            for (let att in attachments) {
              if (!(attachments[att] && attachments[att].type && attachments[att].value)) {
                isValid = false;
                break;
              }
            }
          }

          if (!isValid) {
            if (callback) {
              callback('Error: invalid attachment(s)');
              return;
            } else {
              return new Promise((res,rej) => { rej('Error: invalid attachment(s)'); });
            }
          }
        }

        stmt.id = id;

        this.prepareStatement(stmt);

        let payload = JSON.stringify(stmt);
        let extraHeaders = null;
        if(attachments && attachments.length > 0)
        {
            extraHeaders = {};
            payload = this.buildMultipart(stmt, attachments, extraHeaders);
        }

        const conf = {
          'url': `${this.lrs.endpoint}statements?statementId=${id}`,
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          },
          'body': payload
        };

        if (extraHeaders)
          Object.assign(conf.headers, extraHeaders);

        if (callback) {
            this.callbackRequest(conf, callback, {id}, false);
            return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * Send a single statement to the LRS using a POST request.
   * Makes a Javascript object with the statement id as 'id' available to the callback function.
   * @param {object} stmt   statement object to send
   * @param [array] attachments   array of objects to send with statement
   * @param {function} [callback]   function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   *            the function will be passed the XMLHttpRequest object
   *            and an object with an id property assigned the id
   *            of the statement
   * @return {object} object containing xhr object and id of statement
   */
  postStatement(stmt, attachments, callback)
  {
      if (this.testConfig() && (stmt && !Array.isArray(stmt) && stmt.isValid()))
      {
        // validate attachments if specified
        if (attachments) {
          let isValid = true;
          if (!Array.isArray(attachments) || attachments.length == 0) {
            isValid = false;
          } else {
            for (let att in attachments) {
              if (!(attachments[att] && attachments[att].type && attachments[att].value)) {
                isValid = false;
                break;
              }
            }
          }

          if (!isValid) {
            if (callback) {
              callback('Error: invalid attachment(s)');
              return;
            } else {
              return new Promise((res,rej) => { rej('Error: invalid attachment(s)'); });
            }
          }
        }

        this.prepareStatement(stmt);

        let payload = JSON.stringify(stmt);
        let extraHeaders = null;
        if(attachments && attachments.length > 0)
        {
          extraHeaders = {}
          payload = this.buildMultipart(stmt,attachments,extraHeaders)
        }

        const conf = {
          'url': `${this.lrs.endpoint}statements`,
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          },
          'body': payload
        };

        if (extraHeaders)
          Object.assign(conf.headers, extraHeaders);

        if (callback) {
            this.callbackRequest(conf, callback, {'id':stmt.id}, false);
            return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

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
      if (this.testConfig() && (stmtArray && Array.isArray(stmtArray) && stmtArray.length > 0))
      {
        for(let i in stmtArray)
        {
            if (stmtArray.hasOwnProperty(i))
              this.prepareStatement(stmtArray[i]);
        }

        let payload = JSON.stringify(stmtArray);

        const conf = {
          'url': `${this.lrs.endpoint}statements`,
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          },
          'body': payload
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { return res('Error: invalid parameters'); });
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
          else if (searchparams)
          {
              let urlparams = new Array();

              for (let s in searchparams)
              {
                urlparams.push(`${s}=${encodeURIComponent(searchparams[s])}`);
              }
              if (urlparams.length > 0)
                  url += `?${urlparams.join("&")}`;
          }

          const conf = {
            url,
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json',
              'X-Experience-API-Version': this.xapiVersion,
              'Authorization': this.lrs.auth
            }
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, false);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * Get more statements based on the more url returned from first call.
   * @param {integer} iterations   number of recursive calls when retrieving statements
   * @param {object} searchparams   an XAPIWrapper.searchParams object of
   *                key(search parameter)-value(parameter value) pairs.
   *                Example:
   *                  let myparams = XAPIWrapper.searchParams();
   *                  myparams['verb'] = verbs.completed.id;
   *                  let completedStmts = XAPIWrapper.getStatements(myparams);
   * @param {function} [callback] - function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   *            the function will be passed the XMLHttpRequest object
   */
  getMoreStatements(iterations, searchparams, callback)
  {
      if (this.testConfig()) {
          let stmts = new Array();
          let wrapper = this;

          if (callback) {
              wrapper.getStatements(searchparams, null, function getMore(error, resp, data) {
                  if (!data) {
                      callback(null, null, stmts);
                      return;
                  }

                  stmts = stmts.concat(data.statements);

                  if (iterations > 0 && data.more && data.more != "") {
                      iterations--;
                      wrapper.getStatements(searchparams, data.more, getMore);
                  } else {
                      callback(null, null, stmts);
                  }
              });
          } else {

              function getMore(more) {
                  function process(res) {
                      if (!res.data) {
                          return {data:stmts};
                      }

                      stmts = stmts.concat(res.data.statements);

                      if (iterations > 0 && res.data.more && res.data.more != "") {
                          iterations--;
                          return getMore(res.data.more);
                      } else
                          return {data:stmts};
                  }

                  return wrapper.getStatements(searchparams, more).then(process);
              }

              return getMore(null);
          }

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * Update activity state in the LRS
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
  putState(activityid, agent, stateid, registration, stateval, callback)
  {
      if (this.testConfig() && (stateval && activityid && agent && stateid))
      {
          let url = `${this.lrs.endpoint}activities/state?activityId=${activityid}&agent=${JSON.stringify(agent)}&stateId=${stateid}`;

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

          headers['X-Experience-API-Version'] = this.xapiVersion;
          headers['Authorization'] = this.lrs.auth;

          const conf = {
            url,
            'method': 'PUT',
            headers,
            'body': stateval
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, false);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && stateval && activityid && agent && stateid)
      {
          let url = `${this.lrs.endpoint}activities/state?activityId=${activityid}&agent=${JSON.stringify(agent)}&stateId=${stateid}`;

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

          headers['X-Experience-API-Version'] = this.xapiVersion;
          headers['Authorization'] = this.lrs.auth;

          const conf = {
            url,
            'method': 'POST',
            headers,
            'body': stateval
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, false);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && activityid && agent)
      {
          let url = `${this.lrs.endpoint}activities/state?activityId=${activityid}&agent=${JSON.stringify(agent)}`;

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
              if (!Util.isDate(since)) {
                if (callback) {
                  callback('Error: invalid timestamp');
                  return;
                } else {
                  return new Promise((res,rej) => { rej('Error: invalid timestamp'); });
                }
              } else
                url += `&since=${encodeURIComponent(since)}`;
          }

          const conf = {
            url,
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json',
              'X-Experience-API-Version': this.xapiVersion,
              'Authorization': this.lrs.auth
            }
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, true);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && activityid && agent)
      {
          let url = `${this.lrs.endpoint}activities/state?activityId=${activityid}&agent=${JSON.stringify(agent)}`;

          if (stateid)
          {
              url += `&stateId=${encodeURIComponent(stateid)}`;
          }

          if (registration)
          {
              url += `&registration=${encodeURIComponent(registration)}`;
          }

          const conf = {
            url,
            'method': 'DELETE',
            'headers': {
              'Content-Type': 'application/json',
              'X-Experience-API-Version': this.xapiVersion,
              'Authorization': this.lrs.auth
            }
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, false);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
   * let res = XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
   * log(res);
   * >> <Activity object>
   */
  getActivities(activityid, callback)
  {
      if (this.testConfig() && (activityid && activityid != ""))
      {
          let url = `${this.lrs.endpoint}activities?activityId=${activityid}`;

          const conf = {
            url,
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json',
              'X-Experience-API-Version': this.xapiVersion,
              'Authorization': this.lrs.auth
            }
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, true);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * Stores or updates activity profile in the LRS
   * @param {string} activityid   the id of the Activity this profile is about
   * @param {string} profileid   the id you want associated with this state
   * @param {string} profileval   the profile
   * @param {string} [eHeader]    the ETag header to specify If-Match or If-None-Match for the profile
   * @param {string} [eHash]    the hash of the profile to replace or * to replace any
   * @param {function} [callback]   function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   *            the function will be passed the XMLHttpRequest object
   * @return {boolean} false if no activity state is included
   */
  putActivityProfile(activityid, profileid, profileval, eHeader, eHash, callback)
  {
      if (this.testConfig() && (activityid && profileid && profileval))
      {
        // validate ETag header
        if (eHeader != "If-Match" && eHeader != "If-None-Match") {
          if (callback) {
            callback('Error: invalid ETag header');
            return;
          } else {
            return new Promise((res,rej) => { rej('Error: invalid ETag header'); });
          }
        }

        // validate ETag hash
        if (!eHash || eHash == "") {
          if (callback) {
            callback('Error: invalid ETag hash');
            return;
          } else {
            return new Promise((res,rej) => { rej('Error: invalid ETag hash'); });
          }
        }

        let url = `${this.lrs.endpoint}activities/profile?activityId=${activityid}&profileId=${profileid}`;

        let headers = {}
        headers[`${eHeader}`] = this.formatHash(eHash);

        if (profileval instanceof Array || profileval instanceof Object)
        {
            profileval = JSON.stringify(profileval);
            headers["Content-Type"] ="application/json";
        }
        else
            headers["Content-Type"] ="application/octet-stream";

        headers['X-Experience-API-Version'] = this.xapiVersion;
        headers['Authorization'] = this.lrs.auth;

        const conf = {
          url,
          'method': 'PUT',
          headers,
          'body': profileval
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * Stores or merges activity profile in the LRS
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
      if (this.testConfig() && (activityid && profileid && profileval))
      {
        let url = `${this.lrs.endpoint}activities/profile?activityId=${activityid}&profileId=${profileid}`;

        let headers = {};
        if (profileval instanceof Array || profileval instanceof Object)
        {
            profileval = JSON.stringify(profileval);
            headers["Content-Type"] ="application/json";
        }
        else
            headers["Content-Type"] ="application/octet-stream";

        headers['X-Experience-API-Version'] = this.xapiVersion;
        headers['Authorization'] = this.lrs.auth;

        const conf = {
          url,
          'method': 'POST',
          headers,
          'body': profileval
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && activityid)
      {
        let url = `${this.lrs.endpoint}activities/profile?activityId=${activityid}`;

        if (profileid)
        {
            url += `&profileId=${encodeURIComponent(profileid)}`;
        }

        if(since)
        {
            if (!Util.isDate(since)) {
              if (callback) {
                callback('Error: invalid timestamp');
                return;
              } else {
                return new Promise((res,rej) => { rej('Error: invalid timestamp'); });
              }
            } else
              url += `&since=${encodeURIComponent(since)}`;
        }

        const conf = {
          url,
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          }
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, true);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && (activityid && profileid))
      {
        let url = `${this.lrs.endpoint}activities/profile?activityId=${activityid}&profileId=${profileid}`;

        const conf = {
          url,
          'method': 'DELETE',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          }
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && agent)
      {
          let url = `${this.lrs.endpoint}agents?agent=${JSON.stringify(agent)}`;

          const conf = {
            url,
            'method': 'GET',
            'headers': {
              'Content-Type': 'application/json',
              'X-Experience-API-Version': this.xapiVersion,
              'Authorization': this.lrs.auth
            }
          };

          if (callback) {
            this.callbackRequest(conf, callback, null, true);
            return;
          }

          return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
  putAgentProfile(agent, profileid, profileval, eHeader, eHash, callback)
  {
      if (this.testConfig() && (agent && profileid && profileval))
      {
        // validate ETag header
        if (eHeader != "If-Match" && eHeader != "If-None-Match") {
          if (callback) {
            callback('Error: invalid ETag header');
            return;
          } else {
            return new Promise((res,rej) => { rej('Error: invalid ETag header'); });
          }
        }

        // validate ETag hash
        if (!eHash || eHash == "") {
          if (callback) {
            callback('Error: invalid ETag hash');
            return;
          } else {
            return new Promise((res,rej) => { rej('Error: invalid ETag hash'); });
          }
        }

        let url = `${this.lrs.endpoint}agents/profile?agent=${JSON.stringify(agent)}&profileId=${profileid}`;

        let headers = {}
        headers[`${eHeader}`] = this.formatHash(eHash);

        if (profileval instanceof Array || profileval instanceof Object)
        {
            profileval = JSON.stringify(profileval);
            headers["Content-Type"] ="application/json";
        }
        else
            headers["Content-Type"] ="application/octet-stream";

        headers['X-Experience-API-Version'] = this.xapiVersion;
        headers['Authorization'] = this.lrs.auth;

        const conf = {
          url,
          'method': 'PUT',
          headers,
          'body': profileval
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && (agent && profileid && profileval))
      {
        let url = `${this.lrs.endpoint}agents/profile?agent=${JSON.stringify(agent)}&profileId=${profileid}`;

        let headers = {};
        if (profileval instanceof Array || profileval instanceof Object)
        {
            profileval = JSON.stringify(profileval);
            headers["Content-Type"] ="application/json";
        }
        else
            headers["Content-Type"] ="application/octet-stream";

        headers['X-Experience-API-Version'] = this.xapiVersion;
        headers['Authorization'] = this.lrs.auth;

        const conf = {
          url,
          'method': 'POST',
          headers,
          'body': profileval
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && agent)
      {
        let url = `${this.lrs.endpoint}agents/profile?agent=${JSON.stringify(agent)}`;

        if (profileid)
        {
            url += `&profileId=${encodeURIComponent(profileid)}`;
        }

        if(since)
        {
            if (!Util.isDate(since)) {
              if (callback) {
                callback('Error: invalid timestamp');
                return;
              } else {
                return new Promise((res,rej) => { rej('Error: invalid timestamp'); });
              }
            } else
              url += `&since=${encodeURIComponent(since)}`;
        }

        const conf = {
          url,
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          }
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, true);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
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
      if (this.testConfig() && (agent && profileid))
      {
        let url = `${this.lrs.endpoint}agents/profile?agent=${JSON.stringify(agent)}&profileId=${profileid}`;

        const conf = {
          url,
          'method': 'DELETE',
          'headers': {
            'Content-Type': 'application/json',
            'X-Experience-API-Version': this.xapiVersion,
            'Authorization': this.lrs.auth
          }
        };

        if (callback) {
          this.callbackRequest(conf, callback, null, false);
          return;
        }

        return this.asyncRequest(conf);

      } else if (callback) {
        callback('Error: invalid parameters');
      } else {
        return new Promise((res,rej) => { rej('Error: invalid parameters'); });
      }
  };

  /*
   * makes a request to a server asynchronously
   * @param {object} conf   the configuration of this request
   * @return {Promise} the resolved or rejected promise of this request
   */
  asyncRequest(conf)
  {
    return new Promise((res, rej) => {
      fetch(conf.url, conf)
        .then((resp) => {
          return resp.json()
                  .then((data) => res({resp, data}))
                  .catch((error) => {
                    if (!resp.ok) {
                      error.status = resp.status;
                      rej(error);
                    }
                    // Failed to parse JSON (NOT AN ERROR)
                    else {
                      res({resp});
                    }
                  });
        });
    });
  };

  /*
   * makes a request to a server (if possible, use functions provided in XAPIWrapper)
   * @param {object} conf   the configuration of this request
   * @param {function} callback   function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   * @param {object} [callbackargs]   additional javascript object to be passed to the callback function
   * @param {boolean} ignore404    allow page not found errors to pass
   */
  callbackRequest(conf, callback, callbackargs, ignore404)
  {
    fetch(conf.url, conf)
      .then((resp) => {
        return resp.json().then((data) => {
          callbackargs ? callback(null, resp, callbackargs) : callback(null, resp, data);
        })
        .catch((error) => {
          if (!resp.ok) {
            log(error);
            this.requestError(resp, error, callback, callbackargs);
          }
          // Failed to parse JSON (NOT AN ERROR)
          else {
            callbackargs ? callback(null, resp, callbackargs) : callback(null, resp, null);
          }
        });
      });
  };

  /*
   * Holder for custom global error callback
   * @param {object} resp   response object
   * @param {object} error   error object from failed fetch
   * @param {function} callback   function to be called after the LRS responds
   *            to this request (makes the call asynchronous)
   * @param {object} [callbackargs]   additional javascript object to be passed to the callback function
   */
  requestError(resp, error, callback, callbackargs)
  {
    if (callback) {
      error.status = resp.status;

      if (callbackargs) {
          callback(error, resp, callbackargs);
      } else {
          var body;

          try {
              body = JSON.parse(resp.responseText);
          } catch(e){
              body = resp.responseText;
          }

          callback(error, resp, body);
      }
    }
  };

  /*
   * Tests the configuration of the lrs object
   */
  testConfig()
  {
    return (this.lrs.endpoint != undefined && this.lrs.endpoint != "");
  };

  /*
   * Initializes an lrs object with settings from a config file and from the url query string
   */
  getLRSObject(config)
  {
      let lrsProps = ["endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform"];
      let lrs = new Object();
      let qslets, prop;

      qslets = Util.parseQueryString();
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

          lrs = this.mergeRecursive(config, lrs);
      }
      else {
          lrs = config;
      }

      return lrs;
  };

  /*
   * Merges two objects
   */
  mergeRecursive(obj1, obj2)
  {
    return Object.assign(obj1, obj1, obj2);
  };

  formatHash(hash)
  {
    return (hash==="*") ? hash : `"${hash}"`;
  }
}


if (!onBrowser) {
  module.exports = new XAPIWrapper(Config, false);
} else {
  window.ADL.XAPIWrapper = new XAPIWrapper(Config, false);
}
