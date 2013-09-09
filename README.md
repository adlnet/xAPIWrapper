xAPIWrapper
===========

Wrapper to simplify communication to an LRS

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

``` javascript
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

``` javascript
var conf = {
  "endpoint" : "http://lrs.adlnet.gov/xapi/";
  "auth" : "Basic " + Base64.encode('tom:1234');
}
ADL.XAPIWrapper.changeConfig(conf);
```  
_Launch Parameters_
The configuration will also look for url query parameters and use those 
name - value pairs in the XAPIWrapper's internal configuration. That means 
that `http://localhost:8000/content/example.html?actor={"mbox":"mailto:tom@example.com"}`  
(not url encoded for illustrative purposes) would be parsed for an actor, 
which would automatically be included in the wrapper configuration.  
__NOTE:__ endpoint, auth, actor, registration, activity_id, grouping, and activity_platform 
are keywords that if found are used in send statement requests. See below for 
usage examples.

_Logging_  
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
__Send Statement__  
Sends a single Statement to the LRS using a PUT request. This 
method will automatically create the Statement ID. Providing a 
function to call after the send Statement request will make 
the request happen asynchronously, otherwise Send Statement 
will block until it receives the response from the LRS.  
_Send Statement without Callback_

```javascript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
ADL.XAPIWrapper.log("[" + resp_obj.id + "]: " + resp_obj.xhr.status + " - " + resp_obj.xhr.statusText);
>> [3e616d1c-5394-42dc-a3aa-29414f8f0dfe]: 204 - NO CONTENT
```
_Send Statement with Callback_

```javascript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
ADL.XAPIWrapper.sendStatement(stmt, function(resp, obj){  
    ADL.XAPIWrapper.log("[" + obj.id + "]: " + resp.status + " - " + resp.statusText);});
>> [4edfe763-8b84-41f1-a355-78b7601a6fe8]: 204 - NO CONTENT
```

_Send Statement with URL query string values_  
The wrapper looks for URL query string values to include in 
its internal configuration. If certain keys 
("endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform") 
are found, the values are included in a Statement.  
_URL_  
` http://localhost:8000/content/example.html?registration=51a6f860-1997-11e3-8ffd-0800200c9a66 `  
_Client Calls_ 

```javascript
var stmt = {"actor" : {"mbox" : "mailto:tom@example.com"},
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/answered",
                      "display" : {"en-US" : "answered"}},
            "object" : {"id" : "http://adlnet.gov/expapi/activities/question"}};
var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
ADL.XAPIWrapper.log("[" + resp_obj.id + "]: " + resp_obj.xhr.status + " - " + resp_obj.xhr.statusText);
ADL.XAPIWrapper.getStatements({"statementId":resp_obj.id});
>> {"version": "1.0.0", 
    "timestamp": "2013-09-09 21:36:40.185841+00:00", 
    "object": {"id": "http://adlnet.gov/expapi/activities/question", "objectType": "Activity"}, 
    "actor": {"mbox": "mailto:tom@example.com", "name": "tom creighton", "objectType": "Agent"}, 
    "stored": "2013-09-09 21:36:40.186124+00:00", 
    "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}}, 
    "authority": {"mbox": "mailto:tom@adlnet.gov", "name": "tom", "objectType": "Agent"}, 
    "context": {"registration": "51a6f860-1997-11e3-8ffd-0800200c9a66"}, 
    "id": "ea9c1d01-0606-4ec7-8e5d-20f87b1211ed"}
```

