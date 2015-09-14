(function(ADL) {
    function Offline(obj) {
        var conf = getConf(obj);
        
        this._offlineCheckId;
        this._isoffline = true;
        this.lrs = conf.lrs || {endpoint: "http://localhost:8000/xapi/", auth: "Basic dG9tOjEyMzQ="};
        this.offlineCB = (typeof conf.onOffline) ? conf.onOffline : null;
        this.onlineCB = (typeof conf.onOnline === "function") ? conf.onOnline : null;
        this.startCheckingCB = (typeof conf.onStartChecking === "function") ? conf.onStartChecking : null;
        this.stopCheckingCB = (typeof conf.onStopChecking === "function") ? conf.onStopChecking : null;
        this._interval = (typeof conf.checkInterval === "number" && conf.checkInterval >= 0) ? conf.checkInterval : 10000;
        
        offlineCheck(this);
        offlineCheckId = setInterval(offlineCheck, this._interval, this);
        // when constructed see if there's anything in storage
    }
    
    Offline.prototype.setCheckInterval = function (interval) {
        if (interval >= 0) {
            this._interval = interval;
            this.stopChecking();
            this.startChecking();
            return true;
        } 
        return false;
    };
    
    Offline.prototype.startChecking = function() {
        if (this.offlineCheckId) return true;
        
        this.offlineCheckId = setInterval(offlineCheck, this._interval, this);
        if (this.startCheckingCB) this.startCheckingCB();
        return true;
    };
    
    Offline.prototype.stopChecking = function() {
        if (!this.offlineCheckId) return true;
        
        clearInterval(this.offlineCheckId);
        this.offlineCheckId = null;
        if (this.stopCheckingCB) this.stopCheckingCB();
        return true;
    };
    
    Offline.prototype.forceOfflineCheck = function () {
        offlineCheck(this);
        return this.isoffline;
    }
    
    Offline.prototype.isOffline = function () {
        return this.isoffline;
    };
    
    Offline.prototype.on = function (event, cb) {
        if (typeof cb === "function") {
            if (event === "offline") {
                this.offlineCB = cb;
                return true;
            }
            else if (event === "online") {
                this.onlineCB = cb;
                return true;
            }
            else if (event === "startChecking") {
                this.startCheckingCB = cb;
                return true;
            }
            else if (event === "stopChecking") {
                this.stopCheckingCB = cb;
                return true;
            }
        }
        return false;
    }
    
    var getConf = function (obj) {
        var conf = {};
        // get from configuration param
        for (var fld in obj) {
            if (obj.hasOwnProperty(fld)) {
                conf[fld] = obj[fld];
            }
        }
        return conf;
    };
    
    var offlineCheck = function (obj) {
        var check;
        if (navigator && !navigator.onLine) {
            check = true;
        } else {
            var xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
            xhr.open("HEAD", obj.lrs.endpoint + 'about?rand=' + Math.floor((1 + Math.random()) * 0x10000), false);
            try {
                xhr.send();
                check = !(xhr.status >= 200 && xhr.status < 400);
            } catch (err) {
                check = true;
            }
        }
        report.call(obj, check);
    };
    
    var report = function (offline) {
        if (this.isoffline == offline) return;
        this.isoffline = offline;
        if (this.isoffline) {
            this.offlineCB();
        } else {
            this.onlineCB();
        }
    };
    
    ADL.Offline = Offline;
}(window.ADL = window.ADL || {}));