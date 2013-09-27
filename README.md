xAPIWrapper
===========

Wrapper to simplify communication to an LRS. [Read more about the Experience API Spec here.](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md)

## Contributing to the project
We welcome contributions to this project. Fork this repository, 
make changes and submit pull requests. If you're not comfortable 
with editing the code, please submit an issue and we'll be happy 
to address it.  

## xapiwrapper.js

Javascript Experience API wrapper.  
This javascript file can be included to web based xAPI clients to 
simplify the process of connecting and communicating to an LRS. It 
is enclosed in an ADL object like the 
[ADL xAPI Verbs project](https://github.com/adlnet/xAPIVerbs), allowing 
a single object to contain both the ADL verbs and the ADL xapiwrapper.

This wrapper has two version identifiers within the code. One, `xapiVersion`
is the version of the Experience API Specification for which it was built. 
The second, `build` indicates, using an ISO date time, when the 
wrapper was last modified. The `xapiVersion` value can be used to 
determine if the wrapper is compatible with an LRS implementing a specific 
xAPI Specification version. The `build` value may be used to help 
determine if you have the current version of the wrapper.

### Dependencies
The wrapper relies on external dependencies to perform some actions.
* base64.js - https://code.google.com/p/javascriptbase64/downloads/list  
* 2.5.3-crypto-sha1.js - https://code.google.com/p/crypto-js/downloads/detail?name=2.5.3-crypto-sha1.js&can=4&q=  

### Configuration
The wrapper at a minimum needs to know the url of the LRS, though 
most cases will also require the authorization information as well.

This wrapper provides two options for configuration. You may:  
* Edit the configuration object (`Config`) in the xapiwrapper.js file 

```JavaScript
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

    // Statement defaults [optional configuration]
    // conf["actor"] = {"mbox":"default@example.com"};
    // conf["registration"] =  ruuid();
    // conf["grouping"] = {"id":"ctxact:default/grouping"};
    // conf["activity_platform"] = "default platform";
    return conf
}();
```  
* Create your own configuration object and pass it to the xapiwrapper object

```JavaScript
var conf = {
  "endpoint" : "http://lrs.adlnet.gov/xapi/",
  "auth" : "Basic " + Base64.encode('tom:1234'),
};
ADL.XAPIWrapper.changeConfig(conf);
```  
Optionally, auth credentials can be updated by user and password properties on the 
configuration object:  

```JavaScript
var conf = {
  "endpoint" : "http://lrs.adlnet.gov/xapi/",
  "user" : "lou",
  "password" : "5678",
};
ADL.XAPIWrapper.changeConfig(conf);
```  
or  

```JavaScript
var creds = {
  "user" : "lou",
  "password" : "5678",
};
ADL.XAPIWrapper.updateAuth(ADL.XAPIWrapper.lrs, creds.user, creds.password);
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
The wrapper comes with a logging function (`ADL.XAPIWrapper.log(message)`) 
which attempts to write a message to console.log. This can be configured 
to not write messages by setting `log.debug = false;`.

### Use
Include the wrapper file, and optionally the dependencies.

``` html
<script type="text/javascript" src="./base64.js"></script>
<script type="text/javascript" src="./2.5.3-crypto-sha1.js"></script>
<script type="text/javascript" src="./verbs.js"></script>
<script type="text/javascript" src="./xAPIWrapper/xapiwrapper.js"></script>
```
The script automatically runs, creating or adding to an ADL object an 
instantiated xAPI Wrapper object. The object is created using the 
configuration object inside the xapiwrapper.js file. If you modified this 
object with your configuration, then xAPI Wrapper object is ready to use.

``` shell
ADL.XAPIWrappper.testConfig();
>> true
```

#### Statements
##### Send Statement
`function sendStatement(statement, callback)`  
Sends a single Statement to the LRS using a PUT request. This 
method will automatically create the Statement ID. Providing a 
function to call after the send Statement request will make 
the request happen asynchronously, otherwise Send Statement 
will block until it receives the response from the LRS.  
###### Send Statement without Callback

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
ADL.XAPIWrapper.log("[" + resp_obj.id + "]: " + resp_obj.xhr.status + " - " + resp_obj.xhr.statusText);
>> [3e616d1c-5394-42dc-a3aa-29414f8f0dfe]: 204 - NO CONTENT
```
###### Send Statement with Callback

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
ADL.XAPIWrapper.sendStatement(stmt, function(resp, obj){  
    ADL.XAPIWrapper.log("[" + obj.id + "]: " + resp.status + " - " + resp.statusText);});
>> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 204 - NO CONTENT
```

###### Send Statement with URL query string values
The wrapper looks for URL query string values to include in 
its internal configuration. If certain keys 
("endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform") 
are found, the values are included in a Statement.  
_URL_  
` http://localhost:8000/content/example.html?registration=51a6f860-1997-11e3-8ffd-0800200c9a66 `  
_Client Calls_ 

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
ADL.XAPIWrapper.getStatements({"statementId":resp_obj.id});
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

###### Send Statement with ADL xAPI Verbs
ADL also has collected the [ADL xAPI Verbs](https://github.com/adlnet/xAPIVerbs) 
into a Javascript object to easily include. To use...  
_Include verbs.js_  
`<script type="text/javascript" src="./verbs.js"></script>`  
_Client Calls_  

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : ADL.verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
ADL.XAPIWrapper.getStatements({"statementId":resp_obj.id});
>> {"version": "1.0.0", 
    "timestamp": "2013-09-09 22:08:51.440327+00:00", 
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"}, 
    "actor": {"mbox": "mailto:tom@example.com", "name": "tom creighton", "objectType": "Agent"}, 
    "stored": "2013-09-09 22:08:51.440614+00:00", 
>   "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}}, 
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"}, 
    "id": "9c5a910b-83c2-4114-84f5-d41ed790f8cf"}
```

##### Send Statements
`function sendStatements(statementArray, callback)`  
Sends a list of Statements to the LRS in one batch. It 
accepts the list of Statements and a callback function as 
arguments and returns the XHR request object if no callback 
is supplied. The response of the XHR request upon success will 
contain a list of Statement IDs.

###### Send Statements without callback

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : ADL.verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
var stmt2 = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : ADL.verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
var stmts = [stmt, stmt2];
var r = ADL.XAPIWrapper.sendStatements(stmts);
JSON.parse(r.response)
>> ["2d819ea4-1a1e-11e3-a888-08002787eb49", "409c27de-1a1e-11e3-a888-08002787eb49"]
```

###### Send Statements with callback

```JavaScript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : ADL.verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/1"}};
var stmt2 = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : ADL.verbs.answered,
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question/2"}};
var stmts = [stmt, stmt2];
ADL.XAPIWrapper.sendStatements(stmts, function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
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
var ret = ADL.XAPIWrapper.getStatements();
if (ret)
   API.Wrapper.log(ret.statements);

>> <Array of statements>
```

###### Get all Statements with callback

```JavaScript
ADL.XAPIWrapper.getStatements(null, null, 
        function(r){ADL.XAPIWrapper.log(JSON.parse(r.response).statements);});
>> <Array of statements>
```

###### Use the more property to get more Statements

```JavaScript
var res = ADL.XAPIWrapper.getStatements();
ADL.XAPIWrapper.log(res.statements);
>> <Array of statements>

if (res.more && res.more !== ""){
   var more = ADL.XAPIWrapper.getStatements(null, res.more);
   ADL.XAPIWrapper.log(more.statements);
>> <Array of statements>
```

###### Use the more property to get more Statements with callback

```JavaScript
ADL.XAPIWrapper.getStatements(null, null, 
   function getmore(r){
      var res = JSON.parse(r.response);
      ADL.XAPIWrapper.log(res.statements);
      if (res.more && res.more !== ""){
         ADL.XAPIWrapper.getStatements(null, res.more, getmore);
      }
   });
>> <Array of statements>
>> <Array of statements>
...
```

###### Get Statements based on search parameters
The Experience API provides search parameters to narrow down 
the result of a Statement request. See the [Experience API Spec](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#getstatements) 
for more information.

```JavaScript
var search = ADL.XAPIWrapper.searchParams();
search['verb'] = ADL.verbs.answered.id;
var res = ADL.XAPIWrapper.getStatements(search);
ADL.XAPIWrapper.log(res.statements);
>> <Array of statements with verb id of "http://adlnet.gov/expapi/verbs/answered">
```

#### Activities
##### Get Activity
`function getActivities(activityid, callback)`
Get the Activity object from the LRS by providing an Activity ID.

###### Get Activity without callback

```JavaScript
var res = ADL.XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question");
ADL.XAPIWrapper.log(res);
>> <Activity object>
```

###### Get Activity with callback

```JavaScript
ADL.XAPIWrapper.getActivities("http://adlnet.gov/expapi/activities/question", 
                         function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> <Activity object>
```

##### Activity State
`function sendState(activityid, agent, stateid, registration, statevalue, matchHash, noneMatchHash, callback)`  
`function getState(activityid, agent, stateid, registration, since, callback)`  
Save / Retrieve activity state information for a particular agent, and optional registration.

###### Send / Retrieve New Activity State 

```JavaScript
var stateval = {"info":"the state info"};
ADL.XAPIWrapper.sendState("http://adlnet.gov/expapi/activities/question", 
                          {"mbox":"mailto:tom@example.com"}, 
                          "questionstate", null, stateval);
ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question", 
                        {"mbox":"mailto:tom@example.com"}, "questionstate");
>> {info: "the state info"}
```

###### Change Activity State

```JavaScript
var oldstateval = {"info":"the state info"};
var newstateval = {"info":"the new value"};
ADL.XAPIWrapper.sendState("http://adlnet.gov/expapi/activities/question", 
                          {"mbox":"mailto:tom@example.com"}, 
                          "questionstate", null, newstateval, 
                          ADL.XAPIWrapper.hash(JSON.stringify(oldstateval)));
ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question", 
                        {"mbox":"mailto:tom@example.com"}, "questionstate",
                        null, null, function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the new value"}
```

###### Get all states for given Activity and Agent

```JavaScript
var anotherstate = {"more": "info about act and agent"};
ADL.XAPIWrapper.sendState("http://adlnet.gov/expapi/activities/question", 
                          {"mbox":"mailto:tom@example.com"}, 
                          "another_state", null, anotherstate);
var states = ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question", 
                        {"mbox":"mailto:tom@example.com"});
ADL.XAPIWrapper.log(states);
>> ["another_state", "questionstate"]
```

###### Get states for given Activity and Agent since a certain time

```JavaScript
var since = new Date();
since.setMinutes(since.getMinutes() - 15);
var states = ADL.XAPIWrapper.getState("http://adlnet.gov/expapi/activities/question", 
                        {"mbox":"mailto:tom@example.com"}, null, null, since);
ADL.XAPIWrapper.log(states);
>> ["another_state"]
```

##### Activity Profile
`function sendActivityProfile(activityid, profileid, profilevalue, matchHash, noneMatchHash, callback)`  
`function getActivityProfile(activityid, profileid, since, callback)`  
Allows for the storage and retrieval of data about an Activity.

###### Send / Retrieve New Activity Profile

```JavaScript
var profile = {"info":"the profile"};
ADL.XAPIWrapper.sendActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                    "actprofile", profile, null, "*");
ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                  "actprofile", null,
                                  function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the profile"} 
```

###### Update Activity Profile

```JavaScript
var profile = ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                                 "actprofile");
var oldprofhash = ADL.XAPIWrapper.hash(JSON.stringify(profile));
profile['new'] = "changes to profile";
ADL.XAPIWrapper.sendActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                    "actprofile", profile, oldprofhash);
ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                  "actprofile", null,
                                  function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the profile", new: "changes to profile"} 
```

###### Get all profiles about a specific Activity

```JavaScript
var profile = {"info":"the profile"};
ADL.XAPIWrapper.sendActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                    "otheractprofile", profile, null, "*");
ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                  null, null,
                                  function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> ["otheractprofile", "actprofile"] 
```

###### Get profiles about an Activity since a certain time

```JavaScript
var since = new Date();
since.setMinutes(since.getMinutes() - 15);
var profiles = ADL.XAPIWrapper.getActivityProfile("http://adlnet.gov/expapi/activities/question", 
                                                  null, since);
ADL.XAPIWrapper.log(profiles);
>> ["otheractprofile"]
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
var res = ADL.XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"});
ADL.XAPIWrapper.log(res);
>> <Person object>
```

###### Get Agent with callback

```JavaScript
ADL.XAPIWrapper.getAgents({"mbox":"mailto:tom@example.com"}, 
                         function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> <Person object>
```

##### Agent Profile
`function sendAgentProfile(agent, profileid, profilevalue, matchHash, noneMatchHash, callback)`  
`function getAgentProfile(agent, profileid, since, callback)`  
Allows for the storage and retrieval of data about an Agent.

###### Send / Retrieve New Agent Profile

```JavaScript
var profile = {"info":"the agent profile"};
ADL.XAPIWrapper.sendAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                  "agentprofile", profile, null, "*");
ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                 "agentprofile", null,
                                 function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the agent profile"} 
```

###### Update Agent Profile

```JavaScript
var profile = ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                               "agentprofile");
var oldprofhash = ADL.XAPIWrapper.hash(JSON.stringify(profile));
profile['new'] = "changes to the agent profile";
ADL.XAPIWrapper.sendAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                  "agentprofile", profile, oldprofhash);
ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                 "agentprofile", null,
                                 function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> {info: "the agent profile", new: "changes to the agent profile"} 
```

###### Get all profiles about a specific Agent

```JavaScript
var profile = {"info":"the agent profile"};
ADL.XAPIWrapper.sendAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                  "othergentprofile", profile, null, "*");
ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                 null, null,
                                 function(r){ADL.XAPIWrapper.log(JSON.parse(r.response));});
>> ["otheragentprofile", "agentprofile"] 
```

###### Get profiles about an Agent since a certain time

```JavaScript
var since = new Date();
since.setMinutes(since.getMinutes() - 15);
var profiles = ADL.XAPIWrapper.getAgentProfile({"mbox":"mailto:tom@example.com"}, 
                                                  null, since);
ADL.XAPIWrapper.log(profiles);
>> ["otheragentprofile"]
```
