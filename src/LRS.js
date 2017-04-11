(function(ADL){

  var LRS = ADL.LRS = function(config) {
    var lrsProps = ["endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform"];
    var lrs = new Object();
    var qsVars, prop;

    qsVars = parseQueryString();
    if (qsVars !== undefined && Object.keys(qsVars).length !== 0) {
        for (var i = 0; i<lrsProps.length; i++){
            prop = lrsProps[i];
            if (qsVars[prop]){
                lrs[prop] = qsVars[prop];
                delete qsVars[prop];
            }
        }
        if (Object.keys(qsVars).length !== 0) {
          lrs.extended = qsVars;
        }

        lrs = mergeRecursive(config, lrs);
    }
    else {
        lrs = config;
    }
  }

  LRS.prototype.changeConfig = function(config)
  {



      // var lrsProps = ["endpoint","auth","actor","registration","activity_id", "grouping", "activity_platform"];
      // var lrs = new Object();
      // var qsVars, prop;
      //
      // qsVars = parseQueryString();
      // if (qsVars !== undefined && Object.keys(qsVars).length !== 0) {
      //     for (var i = 0; i<lrsProps.length; i++){
      //         prop = lrsProps[i];
      //         if (qsVars[prop]){
      //             lrs[prop] = qsVars[prop];
      //             delete qsVars[prop];
      //         }
      //     }
      //     if (Object.keys(qsVars).length !== 0) {
      //       lrs.extended = qsVars;
      //     }
      //
      //     lrs = mergeRecursive(config, lrs);
      // }
      // else {
      //     lrs = config;
      // }
      //
      // return lrs;
  };

  // merges two object
  LRS.prototype.mergeRecursive = function(obj1, obj2)
  {
      for (var p in obj2)
      {
          prop = obj2[p];
		      log(p + " : " + prop);
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

  // parses the params in the url query string
  LRS.prototype.parseQueryString = function()
  {
      var qs, pairs, pair, ii, parsed;

      var p = onBrowser ? window.location.search : urlMod.search;
      qs = p ? p.substr(1) : "";

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

  LRS.prototype.updateAuth = function(obj, username, password){
    obj.auth = "Basic " + ADL.Util.toBase64(username + ":" + password);
  }

  LRS.prototype.changeConfig = function(config) {
      try
      {
          log("updating lrs object with new configuration");
          this.lrs = mergeRecursive(this.lrs, config);
          if (config.user && config.password)
              updateAuth(this.lrs, config.user, config.password);
          this.base = getbase(this.lrs.endpoint);
          this.withCredentials = config.withCredentials;
      }
      catch(e)
      {
          log("error while changing configuration -- " + e);
      }
  };


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LRS;
  }

})(typeof module === 'undefined' ? window.ADL = window.ADL || {} : this);
