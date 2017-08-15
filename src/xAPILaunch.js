if (typeof module !== 'undefined') {
  var fetch = require('node-fetch');
  inBrowser = false;
} else {
  window.ADL = window.ADL || {};
}

let cb_wrap = (cb) => {
  return function()
  {
    let args = arguments;
    window.setTimeout(function()
    {
        var callerArgs = [];
        for (var i = 0; i < args.length; i++)
        {
            callerArgs.push(args[i]);
        }
        cb.apply(window, callerArgs);
    }, 0)
    }
}

//The library will append the necessary launch info to each new A that is linked to the page.
//NOTE: This cannot work if you programmatically change the window location. If you do, you must
//execute the logic in setupCourseLinks to send the initialization data to the new location (if
//you wish that new location to track as part of this session)
let observeForNewULinks = () => {
    // select the target node
    let target = document.body;
    // create an observer instance
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            for (let i in mutation.addedNodes)
            {
                if (mutation.addedNodes[i].constructor == HTMLAnchorElement)
                {
                    let node = mutation.addedNodes[i];
                    setupCourseLinks([node]);
                }
            }
        });
    });
    // configuration of the observer:
    let config = {
        attributes: true,
        childList: true,
        subtree: true
    };
    // pass in the target node, as well as the observer options
    observer.observe(target, config);
    // later, you can stop observing
    ///  observer.disconnect();
}

//This library will init all links in the DOM that include the attribute "courseLink = true"
//with the information necessary for the document at that link to track as part of this session.
let setupCourseLinks = (_nodes) => {
    let launchToken = ADL.Util.parseQueryString("xAPILaunchKey");
    let launchEndpoint = ADL.Util.parseQueryString("xAPILaunchService");
    let encrypted = ADL.Util.parseQueryString("encrypted");
    let query = `xAPILaunchKey=${launchToken}&xAPILaunchService=${launchEndpoint}`;
    if (encrypted)
    {
        query += "&encrypted=true";
    }
    for(let i = 0; i < _nodes.length; i++)
    {
        let link = _nodes[i];
        let href = link.href;
        let courseLink = link.attributes.getNamedItem('courselink')
        if (courseLink && courseLink.value == "true")
        {
          link.href = (href.indexOf("?") > -1) ? `${href}&${query}` : `${href}?${query}`;
        }
    };
}

let xAPILaunch = (cb, terminate_on_unload, strict_callbacks) => {
    cb = cb_wrap(cb);
    try
    {
        let launchToken = ADL.Util.parseQueryString("xAPILaunchKey");
        let launchEndpoint = ADL.Util.parseQueryString("xAPILaunchService");
        let encrypted = ADL.Util.parseQueryString("encrypted");
        if (encrypted)
        {
            //here, we'd have to implement decryption for the data. This makes little sense in a client side only course
        }

        xAPILaunch.terminate = (message) => {
            let launch = new URL(launchEndpoint);
            launch.pathname += `launch/${launchToken}/terminate`;
            let xhr2 = new XMLHttpRequest();
            xhr2.withCredentials = true;
            xhr2.crossDomain = true;

            xhr2.open('POST', launch.toString(), false);
            xhr2.setRequestHeader("Content-type", "application/json");
            xhr2.send(JSON.stringify({"code":0,"description": message ||"User closed content"}));
        }

        if (!launchToken || !launchEndpoint)
            return cb("invalid launch parameters");

        let launch = new URL(launchEndpoint);
        launch.pathname += `launch/${launchToken}`;

        // let conf = {
        //   'method':'POST',
        //   'credentials':'include',
        //   'mode': 'cors'
        // };
        // // let res = await fetch(launch.toString(), conf);
        // fetch(launch.toString(), conf)
        //   .then((resp) => {
        //     if (resp.status != 200) {
        //       window.setTimeout(() => {
        //         return cb(resp.responseText);
        //       });
        //     }
        //     return resp.json().then((data) => {
        //       let config = {
        //         'endpoint': data.endpoint,
        //         'actor': data.actor,
        //         'withCredentials': true,
        //         'strictCallbacks': strictCallbacks || false
        //       };
        //
        //       window.onunload = () => {
        //         if (terminate_on_unload)
        //           xAPILaunch.terminate("User closed content");
        //       }
        //
        //       let wrapper = new ADL.XAPIWrapper();
        //       wrapper.changeConfig(config);
        //
        //       setupCourseLinks();
        //       observeForNewLinks();
        //       return cb(null, data, wrapper);
        //     })
        //   })
        //   .catch((err) => {
        //     window.setTimeout(() => {
        //       return cb(err);
        //     });
        //   })

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.crossDomain = true;
        xhr.onerror = (err) => {
            //exit the try catch so inner execptions in the callback don't trigger this catch
            window.setTimeout(() => {
                return cb(err);
            })
        }

        xhr.onload = (e) => {
            if (xhr.status !== 200)
            {
                return xhr.onerror(xhr.responseText);
            }

            var body = JSON.parse(xhr.responseText);
            var launchData = body;

            var conf = {};
            conf['endpoint'] = launchData.endpoint;
            conf["actor"] = launchData.actor;
            conf.withCredentials = true;
            conf.strictCallbacks = strict_callbacks || false;

            window.onunload = () => {
                if (!terminate_on_unload)
                    return;
                xAPILaunch.terminate("User closed content")
            }

            let wrapper = new ADL.XAPIWrapper.constructor();
            wrapper.changeConfig(conf);
            //Links that include "courseLink='true'"
            setupCourseLinks(document.body.querySelectorAll('a'));
            //Also, if links are added dynamically, we will do the same logic for those links.
            observeForNewLinks();
            return cb(null, body, wrapper);
        }
        xhr.open('POST', launch.toString(), true);
        xhr.send();
    }
    catch (e)
    {
        cb(e);
    }
};


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = xAPILaunch;
} else {
  window.ADL.launch = xAPILaunch;
}
