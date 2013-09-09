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

This wrapper has two version identifiers within the code. One, ```xapiVersion```
is the version of the Experience API Specification for which it was built. 
The second, ```build``` indicates, using an ISO date time, when the 
wrapper was last modified. The ```xapiVersion``` value can be used to 
determine if the wrapper is compatible with an LRS implementing a specific 
xAPI Specification version. The ```build``` value may be used to help 
determine if you have the current version of the wrapper.

### Dependencies
The wrapper relies on external dependencies to perform some actions.
* base64.js - https://code.google.com/p/javascriptbase64/downloads/list  
* 2.5.3-crypto-sha1.js - https://code.google.com/p/crypto-js/downloads/detail?name=2.5.3-crypto-sha1.js&can=4&q=  

### Configuration
The wrapper at a minimum needs to know the url of the LRS, though 
most cases will also require the authorization information as well.

This wrapper provides two options for configuration. You may:  
* Edit the configuration object (```Config```) in the xapiwrapper.js file  
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
> ADL.XAPIWrappper.testConfig();
  true
```
