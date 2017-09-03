if (typeof module !== 'undefined') {
    var fetch = require('node-fetch');
} else {
    Util = window.ADL.Util;
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function cb_wrap(cb) {
    return function () {
        let args = arguments;
        window.setTimeout(function () {
            var callerArgs = [];
            for (var i = 0; i < args.length; i++) {
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
function observeForNewLinks() {
    // select the target node
    let target = document.body;
    // create an observer instance
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
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
function setupCourseLinks(_nodes) {
    let launchToken = getQueryVariable("xAPILaunchKey");
    let launchEndpoint = getQueryVariable("xAPILaunchService");
    let encrypted = getQueryVariable("encrypted");
    let query = `xAPILaunchKey=${launchToken}&xAPILaunchService=${launchEndpoint}`;
    if (encrypted) {
        query += "&encrypted=true";
    }
    for (let i = 0; i < _nodes.length; i++) {
        let link = _nodes[i];
        let href = link.href;
        let courseLink = link.attributes.getNamedItem('courselink')
        if (courseLink && courseLink.value == "true") {
            link.href = (href.indexOf("?") > -1) ? `${href}&${query}` : `${href}?${query}`;
        }
    };
}

function xAPILaunch(cb, terminate_on_unload) {
    cb = cb_wrap(cb);
    try {
        let launchToken = getQueryVariable("xAPILaunchKey");
        let launchEndpoint = getQueryVariable("xAPILaunchService");
        let encrypted = getQueryVariable("encrypted");
        if (encrypted) {
            //here, we'd have to implement decryption for the data. This makes little sense in a client side only course
        }

        xAPILaunch.terminate = function (message) {
            let launch2 = new URL(launchEndpoint);
            launch2.pathname += `launch/${launchToken}/terminate`;
            let xhr2 = new XMLHttpRequest();
            xhr2.withCredentials = true;
            xhr2.crossDomain = true;

            xhr2.open('POST', launch2.toString(), false);
            xhr2.setRequestHeader("Content-type", "application/json");
            xhr2.send(JSON.stringify({ "code": 0, "description": message || "User closed content" }));
        }

        if (!launchToken || !launchEndpoint)
            return cb("invalid launch parameters");

        let launch = new URL(launchEndpoint);
        launch.pathname += `launch/${launchToken}`;

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.crossDomain = true;
        xhr.onerror = function (err) {
            //exit the try catch so inner execptions in the callback don't trigger this catch
            window.setTimeout(function () {
                return cb(err);
            })
        }

        xhr.onload = function (e) {
            console.log(xhr);
            if (xhr.status !== 200) {
                return xhr.onerror(xhr.responseText);
            }
            var body = JSON.parse(xhr.responseText);
            var launchData = body;

            var conf = {};
            conf['endpoint'] = launchData.endpoint;
            conf["actor"] = launchData.actor;
            conf.withCredentials = true;

            window.onunload = function () {
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
    catch (e) {
        cb(e);
    }
};


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = xAPILaunch;
} else {
    window.ADL.launch = xAPILaunch;
}
