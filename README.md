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
<script type="text/javascript" src="./src/Verbs.js"></script>
<script type="text/javascript" src="./src/Statement.js"></script>
<script type="text/javascript" src="./src/xAPIWrapper.js"></script>
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
let Config = (() => {
    let conf = {};
    conf.endpoint = "https://lrs.adlnet.gov/xapi/";
    try
    {
        conf.auth = `Basic ${Util.toBase64('tom:1234')}`;
    }
    catch (e)
    {
        log(`Exception in Config trying to encode auth: ${e}`);
    }

    return conf;
})();
```  
* Create your own configuration object and pass it to the xapiwrapper class

```JavaScript
let conf = {
  "endpoint" : "https://lrs.adlnet.gov/xapi/",
  "auth" : `Basic ${Util.toBase64('tom:1234')}`
};
XAPIWrapper.changeConfig(conf);
```  
Optionally, auth credentials can be updated by user and password properties on the
configuration object:  

```JavaScript
let conf = {
  "endpoint" : "https://lrs.adlnet.gov/xapi/",
  "user" : "tom",
  "password" : "1234"
};
XAPIWrapper.changeConfig(conf);
```  
or  

```JavaScript
let creds = {
  "user" : "tom",
  "password" : "1234"
};
XAPIWrapper.updateAuth(XAPIWrapper.lrs, creds.user, creds.password);
```  

The script automatically runs, creating a xAPIWrapper class. The class is created using the
configuration object inside the xAPIWrapper.js file. If you modified this
object with your configuration, then the xAPIWrapper class is ready to use.

``` shell
XAPIWrapper.testConfig();
>> true
```

#### Launch Parameters
The configuration will also look for url query parameters and use those
name - value pairs in the XAPIWrapper's internal configuration. That means
that `http://localhost:8000/content/example.html?actor={"mbox":"mailto:user@example.com"}`  
(not url encoded for illustrative purposes) would be parsed for an actor,
which would automatically be included in the wrapper configuration.  
__NOTE:__ endpoint, auth, actor, registration, activity_id, grouping, and activity_platform
are keywords that if found are used in send statement requests. See below for
usage examples.

#### Logging  
The wrapper comes with a logging function (`log(message)`)
which attempts to write a message to console.log. This can be configured
to not write messages by setting `debug = false;`.

#### xAPI Launch support
The xAPIWrapper supports [ADL's xAPI Launch](https://github.com/adlnet/xapi-launch).
This allows configuration - agent info, lrs endpoint info - to be sent to the wrapper,
instead of using hard-coded configurations. See [Using the xAPI-Launch library](https://github.com/adlnet/xapi-launch#using-the-xapi-launch-library) for
more details.  

If you are using the src files, include xAPILaunch.js.  

``` html
<script type="text/javascript" src="./lib/cryptojs_v3.1.2.js"></script>
<script type="text/javascript" src="./src/Utils.js"></script>
<script type="text/javascript" src="./src/xAPIWrapper.js"></script>
<script type="text/javascript" src="./src/xAPILaunch.js"></script>
<script type="text/javascript" src="./src/ActivityTypes.js"></script>
<script type="text/javascript" src="./src/Verbs.js"></script>
<script type="text/javascript" src="./src/Agent.js"></script>
<script type="text/javascript" src="./src/Verb.js"></script>
<script type="text/javascript" src="./src/Object.js"></script>
<script type="text/javascript" src="./src/Statement.js"></script>
```

Alternatively, use the minified xAPIWrapper version, which includes xAPILaunch:

``` html
<script type="text/javascript" src="./dist/xapiwrapper.min.js"></script>
```  

To use, construct and launch object passing in a callback.  

``` javascript
let wrapper;
ADL.launch(function(err, launchdata, xAPIWrapper) {
    if (!err) {
        wrapper = ADL.XAPIWrapper = xAPIWrapper;
        console.log("--- content launched via xAPI Launch ---\n", wrapper.lrs, "\n", launchdata);
    } else {
        wrapper = ADL.XAPIWrapper;
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

##### Statement class (Statement.js)

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

##### SubStatement class (Statement.js)

```JavaScript
new SubStatement(actor, verb, object)
```

##### Agent class (Agent.js)

```JavaScript
new Agent(identifier, name)
```

##### Group class (Agent.js)

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
	'mailto:user@example.com',
	'http://adlnet.gov/expapi/verbs/launched',
	'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
);
>> {
	"actor": {
		"objectType": "Agent",
		"mbox": "mailto:user@example.com" },
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
	new Agent(XAPIWrapper.hash('mailto:user@example.com'), 'user'),
	new Verb('http://adlnet.gov/expapi/verbs/launched', 'launched'),
	new Activity('http://vwf.adlnet.gov/xapi/virtual_world_sandbox', 'the Virtual World Sandbox')
);
>> {
	"actor": {
		"objectType": "Agent",
		"name": "user",
		"mbox_sha1sum": "220322e6f00c8c88ae97398ed7e9150228859d9c" },
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
	'mailto:user@example.com',
	'http://adlnet.gov/expapi/verbs/launched',
	'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
);
stmt.id = Util.ruuid();
stmt.result = { 'response': 'Everything is a-okay!' };
>> {
	"actor": {
		"objectType": "Agent",
		"mbox": "mailto:user@example.com" },
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
let stmt = new Statement(myactor, verbs.launched, myactivity);
```

##### Put Statement
`putStatement(statement, id, [attachments], callback)`  
Sends a single Statement to the LRS using a PUT request. This
method will automatically create the Statement ID. It
takes in a Statement, Statement ID, Attachments, and optionally,
provides a callback function. The putStatement request will make
the request happen asynchronously, otherwise putStatement
will return a Promise object.  

##### Post Statement
`postStatement(statement, [attachments], callback)`  
Sends a single Statement to the LRS using a POST request. It
takes in a Statement, Attachments, and optionally, provides a callback
function. Providing a function to call after the postStatement
request will make the request happen asynchronously, otherwise
postStatement will return a Promise object.

###### Post Statement without Callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
let resp_obj = await XAPIWrapper.postStatement(stmt);
console.log("[" + resp_obj.data.id + "]: " + resp_obj.resp.status + " - " + resp_obj.resp.statusText);
>> [3e616d1c-5394-42dc-a3aa-29414f8f0dfe]: 200 - OK
```

###### Post Statement with Callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
XAPIWrapper.postStatement(stmt, null, (err, resp, data) => {  
    console.log("[" + data.id + "]: " + resp.status + " - " + resp.statusText);});
>> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 200 - OK
```

###### Post Statement with Attachments
The wrapper can construct a `multipart/mixed` POST for a single statement that includes attachments. Attachments should be
supplied as an array in the 2nd parameter to `postStatement`. Attachments are optional. The attachments array should consist of
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
XAPIWrapper.postStatement(stmt, [attachment], callback);
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
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"},
            "id": Util.ruuid()};
XAPIWrapper.postStatement(stmt)
  .then((res) => {
    return XAPIWrapper.getStatements({"statementId":stmt.id});
  });
>> {"version": "1.0.0",
    "timestamp": "2017-10-02 21:36:40.185841+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:user@example.com", "name": "user", "objectType": "Agent"},
    "stored": "2017-10-02 21:36:40.186124+00:00",
    "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
>   "context": {"registration": "51a6f860-1997-11e3-8ffd-0800200c9a66"},
    "id": "ea9c1d01-0606-4ec7-8e5d-20f87b1211ed"}
```

###### Post Statement with xAPI Verbs
ADL also has collected the [xAPI Verbs](https://github.com/adlnet/xAPIVerbs)
into a Javascript object to easily include. To use...  
_Include verbs.js_  
`<script type="text/javascript" src="./src/Verbs.js"></script>`  
_Client Calls_  

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"},
            "id": Util.ruuid()};
XAPIWrapper.postStatement(stmt)
  .then((res) => {
    return XAPIWrapper.getStatements({"statementId":stmt.id});
  });
>> {"version": "1.0.0",
    "timestamp": "2017-10-02 22:08:51.440327+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:user@example.com", "name": "user", "objectType": "Agent"},
    "stored": "2017-10-02 22:08:51.440614+00:00",
>   "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
    "id": "9c5a910b-83c2-4114-84f5-d41ed790f8cf"}
```

###### Post Statement with Statement class

By including _Statement.js_, you gain access to a convenience wrapper to ease the building
of statements without a lot of the formatting fluff.

```JavaScript
let stmt = new Statement("mailto:user@example.com", null, "http://adlnet.gov/expapi/activities/question");
stmt.verb = new Verb("http://adlnet.gov/expapi/verbs/answered", "answered");
stmt.id = Util.ruuid();
XAPIWrapper.postStatement(stmt)
  .then((res) => {
    return XAPIWrapper.getStatements({"statementId": stmt.id});
  });
>> {"version": "1.0.0",
    "timestamp": "2017-10-02 22:08:51.440327+00:00",
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"},
    "actor": {"mbox": "mailto:user@example.com", "objectType": "Agent"},
    "stored": "2017-10-02 22:08:51.440614+00:00",
>   "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"},
    "id": "9c5a910b-83c2-4114-84f5-d41ed790f8cf"}
```

##### Post Statements
`function postStatements(stmtArray, callback)`  
Sends a list of Statements to the LRS in one batch. It
accepts the list of Statements and a callback function as
arguments and returns a Promise object if no callback
is supplied. The response's data object of the request upon success will
contain a list of Statement IDs.

###### Post Statements without callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
let stmt2 = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
let stmts = [stmt, stmt2];
XAPIWrapper.postStatements(stmts)
  .then((res) => {
    console.log(res.data);
  });
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

###### Post Statements with callback

```JavaScript
let stmt = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
let stmt2 = {"actor" : {"mbox" : "mailto:user@example.com"},
            "verb" : verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
let stmts = [stmt, stmt2];
XAPIWrapper.postStatements(stmts, (err, resp, data) => {
  console.log(data);
});
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

##### Get Statements
`getStatements(searchParams, more, callback)`  
Get a single or collection of Statements based on
search parameters or a StatementResult more value.

###### Get all Statements without callback
This could be potentially a very large request. It is preferable to include
a search parameter object to narrow down the StatementResult set. However,
this call is included to support report style pages.

```JavaScript
let ret = await XAPIWrapper.getStatements();
if (ret)
   console.log(ret.data);

>> <Array of statements>
```

###### Get all Statements with callback
```JavaScript
XAPIWrapper.getStatements(null, null, (err, resp, data) => {
  console.log(data);
});
>> <Array of statements>
```

###### Use the more property to get more Statements

```JavaScript
let res = await XAPIWrapper.getMoreStatements(0, null);
console.log(res.data);
>> <Array of statements>
```

###### Use the more property to get more Statements with callback

```JavaScript
XAPIWrapper.getMoreStatements(0, null, (error, resp, data) => {
    console.log(data);
});
>> <Array of statements>
...
```

###### Get Statements based on search parameters
The Experience API provides search parameters to narrow down
the result of a Statement request. See the [Experience API Spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements)
for more information.

```JavaScript
let search = XAPIWrapper.searchParams();
search['verb'] = verbs.answered.id;
let res = await XAPIWrapper.getStatements(search);
console.log(res.data);
>> <Array of statements with verb id of "http://adlnet.gov/expapi/verbs/answered">
```  

```JavaScript
let search = XAPIWrapper.searchParams();
search['verb'] = verbs.terminated.id;
search['activity'] = "http://adlnet.gov/courses/roses/posttest";
search['related_activities'] = "true";
let res = await XAPIWrapper.getStatements(search);
console.log(res.data);
>> <Array of statements with verb id of "http://adlnet.gov/expapi/verbs/terminated" and an activity id of "http://adlnet.gov/courses/roses/posttest" in the statement>
```

#### Activities
##### Get Activity
`getActivities(activityid, callback)`
Get the Activity object from the LRS by providing an Activity ID.

###### Get Activity without callback

```JavaScript
let res = await XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
console.log(res.data);
>> <Activity object>
```

###### Get Activity with callback

```JavaScript
XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question", (err, resp, data) => {
  console.log(data);
});
>> <Activity object>
```

##### Activity State
`putState(activityid, agent, stateid, registration, statevalue, callback)`  
`postState(activityid, agent, stateid, registration, statevalue, callback)`  
`getState(activityid, agent, stateid, registration, since, callback)`  
`deleteState(activityid, agent, stateid, registration, callback)`
Save / Retrieve / Delete activity state information for a particular agent, and optional registration.

###### Post / Retrieve New Activity State

```JavaScript
let stateval = {"info":"the state info"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:user@example.com"},
                          "questionstate", null, stateval)
  .then((r) => {
    return XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                                {"mbox":"mailto:user@example.com"}, "questionstate")
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the state info"}
```

###### Put / Change Activity State

```JavaScript
let oldstateval = {"info":"the state info"};
let newstateval = {"info":"the new value"};
XAPIWrapper.putState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:user@example.com"},
                          "questionstate", null, newstateval,
                          XAPIWrapper.hash(JSON.stringify(oldstateval)))
  .then((r) => {
    return XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                                {"mbox":"mailto:user@example.com"},
                                "questionstate", null, null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the new value"}
```

###### Get all states for given Activity and Agent

```JavaScript
let anotherstate = {"more": "info about act and agent"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:user@example.com"},
                          "another_state", null, anotherstate)
  .then((r) => {
    return XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                                {"mbox":"mailto:user@example.com"})
      .then((res) => {
        console.log(res.data);
      });
  });
>> ["another_state", "questionstate"]
```

###### Get states for given Activity and Agent since a certain time

```JavaScript
let actid = "tag:adlnet.gov,2013:expapi:1.0.0:activity:question/1";
let statehash = XAPIWrapper.hash(JSON.stringify(stateval));
XAPIWrapper.postState(actid, {"mbox":"mailto:user@example.com"}, "questionstate", null, stateval)
  .then((r) => {
    return XAPIWrapper.getState(actid, {"mbox":"mailto:user@example.com"}, "questionstate")
      .then((res) => {
        console.log(res.data);
      });
  });
>> {"info":"the state info"}

let sincehere = new Date();
let anotherstate = {"more": "info about act and agent","other":"stuff"};
XAPIWrapper.postState(actid, {"mbox":"mailto:user@example.com"}, "another_state", null, anotherstate)
  .then((r) => {
    return XAPIWrapper.getState(actid, {"mbox":"mailto:user@example.com"})
      .then((res) => {
        console.log(res.data);
      });
  });
>> ["questionstate", "another_state"]

let res = await XAPIWrapper.getState(actid, {"mbox":"mailto:user@example.com"}, null, null, sincehere);
console.log(res.data);
>> ["another_state"]
```

###### Delete Activity State

```javascript
let stateval = {"info":"the state info"};
XAPIWrapper.postState("http://adlnet.gov/expapi/activities/question",
                          {"mbox":"mailto:user@example.com"},
                          "questionstate", null, stateval)
  .then((r) => {
    return XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                                {"mbox":"mailto:user@example.com"}, "questionstate")
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the state info"}

let res = await XAPIWrapper.deleteState("http://adlnet.gov/expapi/activities/question",
                                        {"mbox":"mailto:user@example.com"}, "questionstate");
console.log(res.data);
>> {statusText: "NO CONTENT", status: 204}

let res = await XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question",
                                    {"mbox":"mailto:user@example.com"}, "questionstate");
console.log(res.resp.status);
>> 404
```

##### Activity Profile
`putActivityProfile(activityid, profileid, profileval, eHeader, eHash, callback)`  
`postActivityProfile(activityid, profileid, profileval, callback)`
`getActivityProfile(activityid, profileid, since, callback)`  
`deleteActivityProfile(activityid, profileid, callback)`  
Allows for the storage, retrieval and deletion of data about an Activity.

###### Post / Retrieve New Activity Profile

```JavaScript
let postProfile = {"info":"the post profile"};
XAPIWrapper.postActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actpostprofile", postProfile)
  .then((r) => {
    return XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                          "actpostprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the post profile"}
```

###### Put / Retrieve New Activity Profile

```JavaScript
let putProfile = {"info":"the put profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actputprofile", putProfile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                          "actputprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the put profile"}
```

###### Update Activity Profile

```JavaScript
let profile = await XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                                 "actprofile");
let oldprofhash = XAPIWrapper.hash(JSON.stringify(profile.data));
profile['new'] = "changes to profile";
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actprofile", profile, "If-Match", oldprofhash)
  .then((r) => {
    return XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                          "actprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the profile", new: "changes to profile"}
```

###### Get all profiles about a specific Activity

```JavaScript
let profile = {"info":"the profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "otheractprofile", profile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                          null, null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> ["otheractprofile", "actprofile"]
```

###### Get profiles about an Activity since a certain time

```JavaScript
let actid = "tag:adlnet.gov,2013:expapi:1.0.0:activity:testing/xapiwrapper/activityprofile";
let profid = "testprofile";
let actprof = {"info":"the activity profile info"};
let actprofhash = XAPIWrapper.hash(JSON.stringify(actprof));

XAPIWrapper.putActivityProfile(actid, profid, actprof, "If-None-Match", actprofhash)
  .then((r) => {
    return XAPIWrapper.getActivityProfile(actid, profid)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {"info": "the activity profile info"}

let since = new Date();

let newprofid = "new-profile";
let profile = {"info":"the profile"};

XAPIWrapper.putActivityProfile(actid, newprofid, profile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getActivityProfile(actid, null, since)
      .then((res) => {
        console.log(res.data);
      });
  });
>> ["new-profile"]
```

###### Delete Activity Profile

```javascript
let profile = {"info":"the profile"};
XAPIWrapper.putActivityProfile("http://adlnet.gov/expapi/activities/question",
                                    "actprofile", profile, "*")
  .then((r) => {
    return XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                          "actprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the profile"}

let res = await XAPIWrapper.deleteActivityProfile("http://adlnet.gov/expapi/activities/question",
                                                  "actprofile");
console.log(res.resp);
>> {statusText: "NO CONTENT", status: 204}

let res = await XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question",
                                               "actprofile");
console.log(res.resp.status);
>> 404
```

#### Agents
##### Get Agent
`getAgents(agent, callback)`  
Gets a special Person object containing all the values
of an Agent the LRS knows about. The Person object's
identifying properties are arrays and it may have more
than one identifier. [See more about Person in the spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#getagents)
###### Get Agent without callback

```JavaScript
let res = await XAPIWrapper.getAgents({"mbox":"mailto:user@example.com"});
console.log(res.data);
>> <Person object>
```

###### Get Agent with callback

```JavaScript
XAPIWrapper.getAgents({"mbox":"mailto:user@example.com"}, (err, resp, data) => {
  console.log(data);
});
>> <Person object>
```

##### Agent Profile
`putAgentProfile(agent, profileid, profileval, eHeader, eHash, callback)`  
`postAgentProfile(agent, profileid, profileval, callback)`  
`getAgentProfile(agent, profileid, since, callback)`  
`deleteAgentProfile(agent, profileid, callback)`  
Allows for the storage, retrieval and deletion of data about an Agent.

###### Post / Retrieve New Agent Profile

```JavaScript
let postProfile = {"info":"the agent post profile"};
XAPIWrapper.postAgentProfile({"mbox":"mailto:user@example.com"},
                                  "agentpostprofile", postProfile)
  .then((r) => {
    return XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                        "agentpostprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the agent post profile"}
```

###### Put / Retrieve New Agent Profile

```JavaScript
let putProfile = {"info":"the agent put profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:user@example.com"},
                                  "agentputprofile", putProfile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                        "agentputprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });                                
>> {info: "the agent put profile"}
```

###### Update Agent Profile

```JavaScript
let profile = await XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                               "agentprofile");
let oldprofhash = XAPIWrapper.hash(JSON.stringify(profile.data));
profile['new'] = "changes to the agent profile";
XAPIWrapper.putAgentProfile({"mbox":"mailto:user@example.com"},
                                  "agentprofile", profile, "If-Match", oldprofhash)
  .then((r) => {
    return XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                        "agentprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });                                
>> {info: "the agent profile", new: "changes to the agent profile"}
```

###### Get all profiles about a specific Agent

```JavaScript
let profile = {"info":"the agent profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:user@example.com"},
                                  "otheragentprofile", profile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                        null, null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> ["otheragentprofile", "agentprofile"]
```

###### Get profiles about an Agent since a certain time

```JavaScript
let otheragent = {"mbox":"mailto:user@example.com"};
let profile = {"info":"the other agent profile"};
let otherprofid = "the-other-profile-id";
XAPIWrapper.putAgentProfile(otheragent, otherprofid, profile, "If-None-Match", "*")
  .then((r) => {
    let since = new Date();
    let newprof = {"info":"the new other agent profile"};
    let newotherprofid = "the-new-other-profile-id";
    return XAPIWrapper.putAgentProfile(otheragent, newotherprofid, newprof, "If-Match", "*")
      .then((r) => {
        return XAPIWrapper.getAgentProfile(otheragent, null, since)
          .then((res) => {
            console.log(res.data);
          })
      });
  });
>> ["the-new-other-profile-id"]
```

###### Delete Agent Profile

```javascript
let profile = {"info":"the agent profile"};
XAPIWrapper.putAgentProfile({"mbox":"mailto:user@example.com"},
                                  "agentprofile", profile, "If-None-Match", "*")
  .then((r) => {
    return XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                        "agentprofile", null)
      .then((res) => {
        console.log(res.data);
      });
  });
>> {info: "the agent profile"}

XAPIWrapper.deleteAgentProfile({"mbox":"mailto:user@example.com"},
                                "agentprofile")
  .then((res) => {
    console.log(res.resp);
  });
>> {statusText: "NO CONTENT", status: 204}

XAPIWrapper.getAgentProfile({"mbox":"mailto:user@example.com"},
                                 "agentprofile")
  .then((res) => {
    console.log(res.resp.status);
  });
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
