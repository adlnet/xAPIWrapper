/*jshint esversion: 6*/
if (typeof module !== 'undefined') {
    var fetch = require('node-fetch');
} else {
    Util = window.ADL.Util;
}


let cb_wrap = (cb) => {
    return function () {
        let args = arguments;
        window.setTimeout(function () {
            let callerArgs = [];
            for (let i = 0; i < args.length; i++) {
                callerArgs.push(args[i]);
            }
            cb.apply(window, callerArgs);
        }, 0);
    };
}

//The library will append the necessary launch info to each new A that is linked to the page.
//NOTE: This cannot work if you programmatically change the window location. If you do, you must
//execute the logic in setupCourseLinks to send the initialization data to the new location (if
//you wish that new location to track as part of this session)
let observeForNewLinks = () => {
    // select the target node
    let target = document.body;
    // create an observer instance
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            for (let i in mutation.addedNodes) {
                if (mutation.addedNodes[i].constructor == HTMLAnchorElement) {
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
    let launchToken = Util.parseQueryString("xAPILaunchKey");
    let launchEndpoint = Util.parseQueryString("xAPILaunchService");
    let encrypted = Util.parseQueryString("encrypted");
    let query = `xAPILaunchKey=${launchToken}&xAPILaunchService=${launchEndpoint}`;
    if (encrypted) {
        query += "&encrypted=true";
    }
    for (let i = 0; i < _nodes.length; i++) {
        let link = _nodes[i];
        let href = link.href;
        let courseLink = link.attributes.getNamedItem('courselink');
        if (courseLink && courseLink.value == "true") {
            link.href = (href.indexOf("?") > -1) ? `${href}&${query}` : `${href}?${query}`;
        }
    }
}

let xAPILaunch = (cb, terminate_on_unload) => {
    cb = cb_wrap(cb);
    try {
        let launchToken = Util.parseQueryString("xAPILaunchKey");
        let launchEndpoint = Util.parseQueryString("xAPILaunchService");
        let encrypted = Util.parseQueryString("encrypted");

        xAPILaunch.terminate = (message) => {
            let launch = new URL(launchEndpoint);
            launch.pathname += `launch/${launchToken}/terminate`;

            let conf = {
                'method': 'POST',
                'credentials': 'include',
                'headers': { 'Content-type': 'application/json' },
                'body': JSON.stringify({ "code": 0, "description": message || "User closed content" })
            }

            fetch(launch.toString(), conf)
              .then((resp) => {
                  return resp.json();
              });
        };

        if (!launchToken || !launchEndpoint)
            return cb("invalid launch parameters");

        let launch = new URL(launchEndpoint);
        launch.pathname += `launch/${launchToken}`;

        let config = {
            'method': 'POST',
            'credentials': 'include'
        }

        fetch(launch.toString(), config)
          .then((resp) => {
              return resp.json().then((data) => {
                  let conf = {};
                  conf.endpoint = data.endpoint;
                  conf.actor = data.actor;
                  conf.withCredentials = true;

                  window.onunload = () => {
                      if (terminate_on_unload)
                          xAPILaunch.terminate("User closed content");
                  }

                  let wrapper = new ADL.XAPIWrapper.constructor();
                  wrapper.changeConfig(conf);
                  //Links that include "courseLink='true'"
                  setupCourseLinks(document.body.querySelectorAll('a'));
                  //Also, if links are added dynamically, we will do the same logic for those links.
                  observeForNewLinks();
                  cb(null, data, wrapper);
              });
          })
          .catch((error) => {
              window.setTimeout(() => {
                  return cb(err);
              });
          });
    }
    catch (e) {
        cb(e);
    }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = xAPILaunch;
} else {
    window.ADL.launch = xAPILaunch;
}
