xAPIWrapper
===========

Wrapper to simplify communication to an LRS. [Read more about the Experience API Spec here.](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md)

Check out the [Reference Documentation Here](http://adlnet.github.io/xAPIWrapper/)

### xapiwrapper.js

Javascript Experience API wrapper.  
This javascript file can be included to web based xAPI clients to
simplify the process of connecting and communicating to an LRS.

This wrapper has two version identifiers within the code. One, `xapiVersion`
is the version of the Experience API Specification for which it was built,
and can be used to determine if the wrapper is compatible with an LRS implementing a specific
xAPI Specification version. The second is the build date in the header of the minified file,
which can be used to tell if you're using the latest version.

### Dependencies
The wrapper relies on external dependencies to perform some actions. Make sure you include
our compilation of the necessary [CryptoJS](https://code.google.com/p/crypto-js/) components
in your pages if you're not using `xapiwrapper.min.js`

``` html
<script type="text/javascript" src="./lib/cryptojs_v3.1.2.js"></script>
```

In the past we used the below libraries for the same purpose. You may continue to use them
for current systems, but the CryptoJS compilation is recommended.

* base64.js - https://code.google.com/p/javascriptbase64/downloads/list  
* 2.5.3-crypto-sha1.js - https://code.google.com/p/crypto-js/downloads/detail?name=2.5.3-crypto-sha1.js&can=4&q=

## Installing

Using this wrapper could either be done by downloading the [latest release](https://github.com/adlnet/xAPIWrapper#downloading-the-latest-release-version) or [cloning the project](https://github.com/adlnet/xAPIWrapper#cloning-and-building-the-project).

### Downloading the latest release version

The minified wrapper is self-contained. It includes all required dependencies
in addition to the Verbs and Statement modules. For production sites,
this version of the wrapper is recommended.

Download the latest [release](https://github.com/adlnet/xAPIWrapper/releases)

Follow the [instructions](https://github.com/adlnet/xAPIWrapper#including-in-your-software) for including the wrapper in your source files.

### Cloning and building the project

You can optionally clone and use the `dist/xapiwrapper.min.js`:

```bash
git clone https://github.com/adlnet/xAPIWrapper/
```

#### Building the project

Compiling the minified version is easy. Install Node.js and NPM if you don't already have them
(download them [here](http://nodejs.org/download/)) or

```bash
$ sudo apt-get install nodejs
$ sudo apt-get install npm

$ sudo ln -s /usr/bin/nodejs /usr/bin/node
```

Then install the build system, Grunt. This
may require root/admin privileges on your system.


```bash
$ cd xAPIWrapper
```

```bash
$ sudo npm install -g grunt
```

Install the xAPIWrapper dependencies:

```bash
$ sudo npm install
```

Then execute the build script:

```bash
$ grunt
```

This will overwrite `dist/xapiwrapper.min.js` with the minified versions of the wrapper and all its
dependencies.

#### Including in your Software.

Include the wrapper file, and optionally the dependencies.

``` html
<script type="text/javascript" src="./lib/cryptojs_v3.1.2.js"></script>
<script type="text/javascript" src="./src/verbs.js"></script>
<script type="text/javascript" src="./src/statement.js"></script>
<script type="text/javascript" src="./src/xapiwrapper.js"></script>
```

Alternatively, use the minified version:

``` html
<script type="text/javascript" src="./dist/xapiwrapper.min.js"></script>
```


### Configuration
The wrapper at a minimum needs to know the url of the LRS, though
most cases will also require the authorization information as well.

This wrapper provides two options for configuration. You may:  
* Edit the configuration object (`Config`) in the xapiwrapper.js file

```JavaScript
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

    // Statement defaults [optional configuration]
    // conf["actor"] = {"mbox":"default@example.com"};
    // conf["registration"] =  Util.ruuid();
    // conf["grouping"] = {"id":"ctxact:default/grouping"};
    // conf["activity_platform"] = "default platform";
    return conf
}();
```  
* Create your own configuration object and pass it to the xapiwrapper class

```JavaScript
let conf = {
  "endpoint" : "https://lrs.adlnet.gov/xapi/",
  "auth" : `Basic ${Util.toBase64('tom:1234')}`,
};
XAPIWrapper.changeConfig(conf);
```  
Optionally, auth credentials can be updated by user and password properties on the
configuration object:  

```JavaScript
let conf = {
  "endpoint" : "https://lrs.adlnet.gov/xapi/",
  "user" : "tom",
  "password" : "1234",
};
XAPIWrapper.changeConfig(conf);
```  
or  

```JavaScript
let creds = {
  "user" : "tom",
  "password" : "1234",
};
XAPIWrapper.updateAuth(XAPIWrapper.lrs, creds.user, creds.password);
```  

The script automatically runs, creating a xAPI Wrapper class. The class is created using the
configuration object inside the xapiwrapper.js file. If you modified this
object with your configuration, then the xAPIWrapper class is ready to use.

``` shell
XAPIWrapper.testConfig();
>> true
```

#### Launch Parameters
The configuration will also look for url query parameters and use those
name - value pairs in the XAPIWrapper's internal configuration. That means
that `http://localhost:8000/content/example.html?actor={"mbox":"mailto:tom@example.com"}`  
(not url encoded for illustrative purposes) would be parsed for an actor,
which would automatically be included in the wrapper configuration.  
__NOTE:__ endpoint, auth, actor, registration, activity_id, grouping, and activity_platform
are keywords that if found are used in send statement requests. See below for
usage examples.

#### Logging  
The wrapper comes with a logging function (`XAPIWrapper.log(message)`)
which attempts to write a message to console.log. This can be configured
to not write messages by setting `log.debug = false;`.

#### xAPI Launch support
The xAPI Wrapper supports [ADL's xAPI Launch](https://github.com/adlnet/xapi-launch).
This allows configuration - agent info, lrs endpoint info - to be sent to the wrapper,
instead of using hard-coded configurations. See [Using the xAPI-Launch library](https://github.com/adlnet/xapi-launch#using-the-xapi-launch-library) for
more details.  

If you are using the src files, include xAPILaunch.js.  

``` html
<script type="text/javascript" src="./lib/cryptojs_v3.1.2.js"></script>
<script type="text/javascript" src="./src/Utils.js"></script>
<script type="text/javascript" src="./src/verbs.js"></script>
<script type="text/javascript" src="./src/xapiwrapper.js"></script>
<script type="text/javascript" src="./src/Agent.js"></script>
<script type="text/javascript" src="./src/Verb.js"></script>
<script type="text/javascript" src="./src/statement.js"></script>
<script type="text/javascript" src="./src/Object.js"></script>
<script type="text/javascript" src="./src/xAPILaunch.js"></script>
```

Alternatively, use the minified xapiwrapper version, which includes xapilaunch:

``` html
<script type="text/javascript" src="./dist/xapiwrapper.min.js"></script>
```  

To use, construct and launch object passing in a callback.  

``` javascript
let wrapper;
ADL.launch(function(err, launchdata, xAPIWrapper) {
    if (!err) {
        wrapper = xAPIWrapper;
        console.log("--- content launched via xAPI Launch ---\n", wrapper.lrs, "\n", launchdata);
    } else {
        wrapper = XAPIWrapper;
        wrapper.changeConfig({
            endpoint: "https://lrs.adlnet.gov/xapi/",
            user: 'tom',
            password: '1234'
        });
        console.log("--- content statically configured ---\n", wrapper.lrs);
    }
    $('#endpoint').text(wrapper.lrs.endpoint);
}, true);
```  

### Use

#### Statements

##### Statement class (statement.js)

```JavaScript
new Statement(actor, verb, object)
```

This sub-API makes it easier to author valid statements
by adding constructors and encouraging best practices. All classes and objects in this
API are fully JSON-compatible, so anything expecting a statement can
take an improved statement and vice versa.

In addition to the above forms, each constructor can instead take as an argument
another instance of the class or the equivalent plain object. So you can convert
a plain statement to an improved one by calling `new Statement(plain_obj)`.

##### SubStatement class extends Statement (statement.js)

```JavaScript
new SubStatement(actor, verb, object)
```

##### Agent class (Agent.js)

```JavaScript
new Agent(identifier, name)
```

##### Group class extends Agent (Agent.js)

```JavaScript
new Group(identifier, members, name)
```

##### Verb class (Verb.js)

```JavaScript
new Verb(id, description)
```

##### Activity class (Object.js)

```JavaScript
new Activity(id, name, description)
```

##### StatementRef class (Object.js)

```JavaScript
new StatementRef(uuid)
```

###### Building a Simple "I Did This"

Passing in strings produces a default form: Agent Verb Activity.

```JavaScript
let stmt = new Statement(
	'mailto:steve.vergenz.ctr@adlnet.gov',
	'http://adlnet.gov/expapi/verbs/launched',
	'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
);
>> {
	"actor": {
		"objectType": "Agent",
		"mbox": "mailto:steve.vergenz.ctr@adlnet.gov" },
	"verb": {
		"id": "http://adlnet.gov/expapi/verbs/launched" },
	"object": {
		"objectType": "Activity",
		"id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox" }
}
```

###### Adding Descriptors

```JavaScript
let stmt = new Statement(
	new Agent(XAPIWrapper.hash('mailto:steve.vergenz.ctr@adlnet.gov'), 'Steven Vergenz'),
	new Verb('http://adlnet.gov/expapi/verbs/launched', 'launched'),
	new Activity('http://vwf.adlnet.gov/xapi/virtual_world_sandbox', 'the Virtual World Sandbox')
);
>> {
	"actor": {
		"objectType": "Agent",
		"name": "Steven Vergenz",
		"mbox_sha1sum": "f9fa1a084b2b0825cabb802fcc1bb6024141eee2" },
	"verb": {
		"id": "http://adlnet.gov/expapi/verbs/launched",
		"display": {
			"en-US": "launched" }},
	"object": {
		"objectType": "Activity",
		"id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox",
		"definition": {
			"name": {
				"en-US": "the Virtual World Sandbox" }}}
}
```

###### Adding Additional Fields

You can mix generated and manual fields without any conflicts.

```JavaScript
let stmt = new Statement(
	'mailto:steve.vergenz.ctr@adlnet.gov',
	'http://adlnet.gov/expapi/verbs/launched',
	'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
);
stmt.generateId();
stmt.result = { 'response': 'Everything is a-okay!' };
>> {
	"actor": {
		"objectType": "Agent",
		"mbox": "mailto:steve.vergenz.ctr@adlnet.gov" },
	"verb": {
		"id": "http://adlnet.gov/expapi/verbs/launched" },
	"object": {
		"objectType": "Activity",
		"id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox" },
	"id": "d60ffbaa-52af-44b6-932d-c08865c540ff",
	"result": {
		"response": "Everything is a-okay!" }
}
```

###### Using Multiple Languages

Any of the `name` or `description` fields in the constructors can instead take a language map,
as defined in the xAPI specification.

```JavaScript
let stmt = new Statement();
stmt.actor = new Agent('https://plus.google.com/113407910174370737235');
stmt.verb = new Verb(
	'http://adlnet.gov/expapi/verbs/launched',
	{
		'en-US': 'launched',
		'de-DE': 'startete'
	}
);
stmt.object = new Activity('http://vwf.adlnet.gov/xapi/virtual_world_sandbox');
>> {
	"actor": {
		"objectType": "Agent",
		"openid": "https://plus.google.com/113407910174370737235" },
	"verb": {
		"id": "http://adlnet.gov/expapi/verbs/launched",
		"display": {
			"en-US": "launched",
			"de-DE": "startete" }},
	"object": {
		"objectType": "Activity",
		"id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox" }
}
```

###### Using a Verb

Manually specified verbs have been used until now for illustrative purposes, but you could just
as easily use the verbs.

```JavaScript
let stmt = Statement(myactor, verbs.launched, myactivity);
```

##### Put Statement
`function putStatement(statement, id, callback, [attachments])`  
Sends a single Statement to the LRS using a PUT request. This
method takes in a Statement ID and, optionally, provides a callback
function. The Put Statement request will make
the request happen asynchronously, otherwise Put Statement
will block until it receives the response from the LRS.  

##### Post Statement
`function postStatement(statement, callback, [attachments])`  
Sends a single Statement to the LRS using a POST request. This
method will automatically create the Statement ID. Providing a
function to call after the post Statement request will make
the request happen asynchronously, otherwise Post Statement
will block until it receives the response from the LRS.
###### Post Statement without Callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
let resp_obj = XAPIWrapper.postStatement(stmt);
XAPIWrapper.log("[" + resp_obj.id + "]: " + resp_obj.xhr.status + " - " + resp_obj.xhr.statusText);
>> [3e616d1c-5394-42dc-a3aa-29414f8f0dfe]: 200 - OK
```
###### Post Statement with Callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
XAPIWrapper.postStatement(stmt, function(resp, obj){  
    XAPIWrapper.log("[" + obj.id + "]: " + resp.status + " - " + resp.statusText);});
>> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 200 - OK
```

###### Post Statement with strict error-first callback

Requires the config option `strictCallbacks` to be `true`.

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
XAPIWrapper.postStatement(stmt, function(err, res, body) {
    if (err) {
        // Handle error case
        return;
    }

    XAPIWrapper.log("[" + body.id + "]: " + res.status + " - " + res.statusText);});
>> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 200 - OK
```

###### Post Statement with Attachments
The wrapper can construct a `multipart/mixed` POST for a single statement that includes attachments. Attachments should be
supplied as an array in the 3rd parameter to `postStatement`. Attachments are optional. The attachments array should consist of
objects that have a `type` and a `value` field. `Type` should be the metadata description of the attachment as described by the spec, and `value`
should be a string containing the data to post. The type field does not need to include the SHA2 or the length. These will be computed
for you. The type may optionally be the string 'signature'. In this case, the wrapper will construct the proper metadata block.

```JavaScript
let attachment = {};
attachment.type = {
       "usageType": "http://adlnet.gov/expapi/attachments/signature",
       "display": {
        "en-US": "A JWT signature"
       },
       "description": {
        "en-US": "A signature proving the statement was not modified"
       },
       "contentType": "application/octet-stream"
};
attachment.value = "somehugestring";
XAPIWrapper.postStatement(stmt,callback,[attachment]);
```

###### Post Statement with URL query string values
The wrapper looks for URL query string values to include in
its internal configuration. If certain keys
("endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform")
are found, the values are included in a Statement.  
_URL_  
` http://localhost:8000/content/example.html?registration=51a6f860-1997-11e3-8ffd-0800200c9a66 `  
_Client Calls_

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
let resp_obj = XAPIWrapper.postStatement(stmt);
XAPIWrapper.getStatements({"statementId":resp_obj.id});
>> {"version": "1.0.0",
    "timestamp": "2013-09-09 21:36:40.185841+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:tom@example.com", "name": "tom creighton", "objectType": "Agent"},
    "stored": "2013-09-09 21:36:40.186124+00:00",
    "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
>   "context": {"registration": "51a6f860-1997-11e3-8ffd-0800200c9a66"},
    "id": "ea9c1d01-0606-4ec7-8e5d-20f87b1211ed"}
```

###### Post Statement with xAPI Verbs
ADL also has collected the [xAPI Verbs](https://github.com/adlnet/xAPIVerbs)
into a Javascript object to easily include. To use...  
_Include verbs.js_  
`<script type="text/javascript" src="./src/verbs.js"></script>`  
_Client Calls_  

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
let resp_obj = XAPIWrapper.postStatement(stmt);
XAPIWrapper.getStatements({"statementId":resp_obj.id});
>> {"version": "1.0.0",
    "timestamp": "2013-09-09 22:08:51.440327+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:tom@example.com", "name": "tom creighton", "objectType": "Agent"},
    "stored": "2013-09-09 22:08:51.440614+00:00",
>   "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
    "id": "9c5a910b-83c2-4114-84f5-d41ed790f8cf"}
```

###### Post Statement with Statement class

By including _statement.js_, you gain access to a convenience wrapper to ease the building
of statements without a lot of the formatting fluff.

```JavaScript
let stmt = new Statement("mailto:tom@example.com", null, "http://adlnet.gov/expapi/activities/question");
stmt.verb = new Verb("http://adlnet.gov/expapi/verbs/answered", "answered");
stmt.generateId();
XAPIWrapper.postStatement(stmt);
XAPIWrapper.getStatements({"statementId": stmt.id});
>> {"version": "1.0.0",
    "timestamp": "2013-09-09 22:08:51.440327+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:tom@example.com", "objectType": "Agent"},
    "stored": "2013-09-09 22:08:51.440614+00:00",
>   "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
    "id": "9c5a910b-83c2-4114-84f5-d41ed790f8cf"}
```

##### Post Statements
`function postStatements(statementArray, callback)`  
Sends a list of Statements to the LRS in one batch. It
accepts the list of Statements and a callback function as
arguments and returns the XHR request object if no callback
is supplied. The response of the XHR request upon success will
contain a list of Statement IDs.

###### Post Statements without callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
let stmt2 = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
let stmts = [stmt, stmt2];
let r = XAPIWrapper.postStatements(stmts);
JSON.parse(r.response)
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

###### Post Statements with callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
let stmt2 = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
let stmts = [stmt, stmt2];
XAPIWrapper.postStatements(stmts, function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

###### Post Statements with strict error-first callback

Requires the config option `strictCallbacks` to be `true`.

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
let stmt2 = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
let stmts = [stmt, stmt2];
XAPIWrapper.postStatements(stmts, function(err, res, body) {
    if (err) {
        // Handle error case
        return;
    }

    XAPIWrapper.log(body);
});
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

##### Get Statements
`function getStatements(searchParams, more, callback)`  
Get a single or collection of Statements based on
search parameters or a StatementResult more value.

###### Get all Statements without callback
This could be potentially a very large request. It is preferable to include
a search parameter object to narrow down the StatementResult set. However,
this call is included to support report style pages.

```JavaScript
let ret = XAPIWrapper.getStatements();
if (ret)
   XAPIWrapper.log(ret.statements);

>> <Array of statements>
```

###### Get all Statements with callback
```JavaScript
XAPIWrapper.getStatements(null, null,
        function(r){XAPIWrapper.log(JSON.parse(r.response).statements);});
>> <Array of statements>
```

###### Use the more property to get more Statements

```JavaScript
let res = XAPIWrapper.getStatements();
XAPIWrapper.log(res.statements);
>> <Array of statements>

if (res.more && res.more !== ""){
   let more = XAPIWrapper.getStatements(null, res.more);
   XAPIWrapper.log(more.statements);
}
>> <Array of statements>
```

###### Use the more property to get more Statements with callback

```JavaScript
XAPIWrapper.getStatements(null, null,
   function getmore(r){
      let res = JSON.parse(r.response);
      XAPIWrapper.log(res.statements);
      if (res.more && res.more !== ""){
         XAPIWrapper.getStatements(null, res.more, getmore);
      }
   });
>> <Array of statements>
>> <Array of statements>
...
```

###### Get all Statements with with strict error-first callback

Requires the config option `strictCallbacks` to be `true`.

```JavaScript
XAPIWrapper.getStatements(null, null, function(err, res, body) {
    if (err) {
        // Handle error case
        return;
    }

    XAPIWrapper.log(body.statements);
});
>> <Array of statements>
```

###### Get Statements based on search parameters
The Experience API provides search parameters to narrow down
the result of a Statement request. See the [Experience API Spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements)
for more information.

```JavaScript
let search = XAPIWrapper.searchParams();
search['verb'] = verbs.answered.id;
let res = XAPIWrapper.getStatements(search);
XAPIWrapper.log(res.statements);
>> <Array of statements with verb id of "http://adlnet.gov/expapi/verbs/answered">
```  

```JavaScript
let search = XAPIWrapper.searchParams();
search['verb'] = verbs.terminated.id;
search['activity'] = "http://adlnet.gov/courses/roses/posttest";
search['related_activities'] = "true";
let res = XAPIWrapper.getStatements(search);
XAPIWrapper.log(res.statements);
>> <Array of statements with verb id of "http://adlnet.gov/expapi/verbs/terminated" and an activity id of "http://adlnet.gov/courses/roses/posttest" in the statement>
```

#### Activities
##### Get Activity
`function getActivities(activityid, callback)`
Get the Activity object from the LRS by providing an Activity ID.

###### Get Activity without callback

```JavaScript
let res = XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
XAPIWrapper.log(res);
>> <Activity object>
```

###### Get Activity with callback

```JavaScript
XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question",
                         function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> <Activity object>
```

###### Get Activity with strict error-first callback

Requires the config option `strictCallbacks` to be `true`.

```JavaScript
XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question", function(err, res, body) {
    if (err) {
        // Handle error case
        return;
    }

    XAPIWrapper.log(body);
});
>> <Activity object>
```


##### Activity State
`function putState(activityid, agent, stateid, registration, statevalue, matchHash, callback)`  
`function postState(activityid, agent, stateid, registration, statevalue, callback)`  
`function getState(activityid, agent, stateid, registration, since, callback)`  
`function deleteState(activityid, agent, stateid, registration, callback)`
Save / Retrieve / Delete activity state information for a particular agent, and optional registration.

###### Post / Retrieve New Activity State

```JavaScript
let stateval = {"info":"the state info"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:tom@example.com"},
                          "questionstate", null, stateval);
XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"}, "questionstate");
>> {info: "the state info"}
```

###### Put / Change Activity State

```JavaScript
let oldstateval = {"info":"the state info"};
let newstateval = {"info":"the new value"};
XAPIWrapper.putState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:tom@example.com"},
                          "questionstate", null, newstateval,
                          XAPIWrapper.hash(JSON.stringify(oldstateval)));
XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"}, "questionstate",
                        null, null, function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the new value"}
```

###### Get all states for given Activity and Agent

```JavaScript
let anotherstate = {"more": "info about act and agent"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:tom@example.com"},
                          "another_state", null, anotherstate);
let states = XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"});
XAPIWrapper.log(states);
>> ["another_state", "questionstate"]
```

###### Get states for given Activity and Agent since a certain time

```JavaScript
let actid = "tag:adlnet.gov,2013:expapi:1.0.0:activity:question/1";
let stateval = {"info":"the state info"};
let statehash = XAPIWrapper.hash(JSON.stringify(stateval));
XAPIWrapper.postState(actid, {"mbox":"mailto:tom@example.com"}, "questionstate", null, stateval);
let stateret = XAPIWrapper.getState(actid, {"mbox":"mailto:tom@example.com"}, "questionstate");
XAPIWrapper.log(stateret);
>> {"info":"the state info"}

let sincehere = new Date();
let anotherstate = {"more": "info about act and agent","other":"stuff"};
XAPIWrapper.postState(actid, {"mbox":"mailto:tom@example.com"}, "another_state", null, anotherstate);
let states = XAPIWrapper.getState(actid, {"mbox":"mailto:tom@example.com"});
XAPIWrapper.log(states);
>> ["questionstate", "another_state"]

let states = XAPIWrapper.getState(actid, {"mbox":"mailto:tom@example.com"}, null, null, sincehere);
XAPIWrapper.log(states);
>> ["another_state"]
```

###### Delete Activity State

```javascript
let stateval = {"info":"the state info"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:tom@example.com"},
                          "questionstate", null, stateval);
XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"}, "questionstate");
>> {info: "the state info"}

XAPIWrapper.deleteState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"}, "questionstate");
>> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}

XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                        {"mbox":"mailto:tom@example.com"}, "questionstate");
>> 404
```

##### Activity Profile
`function putActivityProfile(activityid, profileid, profilevalue, matchHash, callback)`  
`function postActivityProfile(activityid, profileid, profilevalue, callback)` 
`function getActivityProfile(activityid, profileid, since, callback)`  
`function deleteActivityProfile(activityid, profileid, callback)`  
Allows for the storage, retrieval and deletion of data about an Activity.

###### Put / Post / Retrieve New Activity Profile

```JavaScript
let putProfile = {"info":"the put profile"};
let postProfile = {"info":"the post profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actputprofile", putProfile, "*");
XAPIWrapper.postActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actpostprofile", postProfile);
XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  "actputprofile", null,
                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  "actpostprofile", null,
                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the put profile"}
>> {info: "the post profile"}
```

###### Update Activity Profile

```JavaScript
let profile = XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                                 "actprofile");
let oldprofhash = XAPIWrapper.hash(JSON.stringify(profile));
profile['new'] = "changes to profile";
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actprofile", profile, oldprofhash);
XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  "actprofile", null,
                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the profile", new: "changes to profile"}
```

###### Get all profiles about a specific Activity

```JavaScript
let profile = {"info":"the profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "otheractprofile", profile, "*");
XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  null, null,
                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> ["otheractprofile", "actprofile"]
```

###### Get profiles about an Activity since a certain time

```JavaScript
let actid = "tag:adlnet.gov,2013:expapi:1.0.0:activity:testing/xapiwrapper/activityprofile";
let profid = "testprofile";
let actprof = {"info":"the activity profile info"};
let actprofhash = XAPIWrapper.hash(JSON.stringify(actprof));

XAPIWrapper.putActivityProfile(actid, profid, actprof, actprofhash);
let actprofret = XAPIWrapper.getActivityProfile(actid, profid);

XAPIWrapper.log(actprofret);
>> {"info": "the activity profile info"}

let since = new Date();

let newprofid = "new-profile";
let profile = {"info":"the profile"};

XAPIWrapper.putActivityProfile(actid, newprofid, profile, "*");
let profiles = XAPIWrapper.getActivityProfile(actid, null, since);

XAPIWrapper.log(profiles);
>> ["new-profile"]
```

###### Delete Activity Profile

```javascript
let profile = {"info":"the profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actprofile", profile, "*");
XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  "actprofile", null,
                                  function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the profile"}

XAPIWrapper.deleteActivityProfile("http://adlnet.gov/expapi/activities/question",
                        "actprofile");
>> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}

XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                  "actprofile");
>> 404
```

#### Agents
##### Get Agent
`function getAgents(agent, callback)`  
Gets a special Person object containing all the values
of an Agent the LRS knows about. The Person object's
identifying properties are arrays and it may have more
than one identifier. [See more about Person in the spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#getagents)
###### Get Agent without callback

```JavaScript
let res = XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"});
XAPIWrapper.log(res);
>> <Person object>
```

###### Get Agent with callback

```JavaScript
XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"},
                         function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> <Person object>
```

###### Get Agent with strict error-first callbacks

Requires the config option `strictCallbacks` to be `true`.

```JavaScript
XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"}, function(err, res, body) {
    if (err) {
        // Handle error case
        return;
    }

    XAPIWrapper.log(body);
});
>> <Person object>
```

##### Agent Profile
`function putAgentProfile(agent, profileid, profilevalue, matchHash, callback)`  
`function postAgentProfile(agent, profileid, profilevalue, callback)`  
`function getAgentProfile(agent, profileid, since, callback)`  
`function deleteAgentProfile(agent, profileid, callback)`  
Allows for the storage, retrieval and deletion of data about an Agent.

###### Put / Post / Retrieve New Agent Profile

```JavaScript
let putProfile = {"info":"the agent put profile"};
let postProfile = {"info":"the agent post profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:tom@example.com"},
                                  "agentputprofile", putProfile, "*");
XAPIWrapper.postAgentProfile({"mbox":"mailto:tom@example.com"},
                                  "agentpostprofile", postProfile);
XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 "agentputprofile", null,
                                 function(r){XAPIWrapper.log(JSON.parse(r.response));});
XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 "agentpostprofile", null,
                                 function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the agent put profile"}
>> {info: "the agent post profile"}
```

###### Update Agent Profile

```JavaScript
let profile = XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                               "agentprofile");
let oldprofhash = XAPIWrapper.hash(JSON.stringify(profile));
profile['new'] = "changes to the agent profile";
XAPIWrapper.putAgentProfile({"mbox":"mailto:tom@example.com"},
                                  "agentprofile", profile, oldprofhash);
XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 "agentprofile", null,
                                 function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the agent profile", new: "changes to the agent profile"}
```

###### Get all profiles about a specific Agent

```JavaScript
let profile = {"info":"the agent profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:tom@example.com"},
                                  "otheragentprofile", profile, "*");
XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 null, null,
                                 function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> ["otheragentprofile", "agentprofile"]
```

###### Get profiles about an Agent since a certain time

```JavaScript
let otheragent = {"mbox":"mailto:tom@example.com"};
let profile = {"info":"the other agent profile"};
let otherprofid = "the-other-profile-id";

XAPIWrapper.putAgentProfile(otheragent, otherprofid, profile, "*");

let since = new Date();
let newprof = {"info":"the new other agent profile"};
let newotherprofid = "the-new-other-profile-id";

XAPIWrapper.putAgentProfile(otheragent, newotherprofid, newprof, "*");
let sinceprofiles = XAPIWrapper.getAgentProfile(otheragent, null, since);

XAPIWrapper.log(sinceprofiles);
>> ["the-new-other-profile-id"]
```

###### Delete Agent Profile

```javascript
let profile = {"info":"the agent profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:tom@example.com"},
                                  "agentprofile", profile, "*");
XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 "agentprofile", null,
                                 function(r){XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the agent profile"}

XAPIWrapper.deleteAgentProfile({"mbox":"mailto:tom@example.com"},
                        "agentprofile");
>> XMLHttpRequest {statusText: "NO CONTENT", status: 204, response: "", responseType: "", responseXML: null…}

XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"},
                                 "agentprofile");
>> 404
```

## Contributing to the project
We welcome contributions to this project. Fork this repository,
make changes, [re-minify](https://github.com/adlnet/xAPIWrapper#building-the-project), and submit pull requests. If you're not comfortable
with editing the code, please [submit an issue](https://github.com/adlnet/xAPIWrapper/issues) and we'll be happy
to address it.

## License
   Copyright &copy;2016 Advanced Distributed Learning

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
