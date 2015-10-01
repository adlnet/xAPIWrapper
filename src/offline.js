(function(ADL) {
    function Offline(obj) {
        var conf = getConf(obj),
            interval = parseInt(conf.checkInterval),
            timeout = parseInt(conf.requestTimeout);
        
        this._isoffline;
        this.endpoint = conf.endpoint || "http://localhost:8000/xapi/";
        this.offlineCB = (typeof conf.onOffline) ? conf.onOffline : null;
        this.onlineCB = (typeof conf.onOnline === "function") ? conf.onOnline : null;
        this.startCheckingCB = (typeof conf.onStartChecking === "function") ? conf.onStartChecking : null;
        this.stopCheckingCB = (typeof conf.onStopChecking === "function") ? conf.onStopChecking : null;
        this._interval = (! isNaN(interval) && interval >= 0) ? interval : 10000;
        this._reqtimeout = (! isNaN(timeout) && timeout >= 0) ? timeout : 2000;
        
        offlineCheck(this); 
        this._offlineCheckId = setInterval(offlineCheck, this._interval, this);
        // when constructed see if there's anything in storage
    }
    
    Offline.prototype.setCheckInterval = function (interval) {
        if (interval >= 0) {
            this._interval = interval;
            this.stopChecking();
            this.startChecking();
        } 
        return this;
    };
    
    Offline.prototype.startChecking = function() {
        if (this._offlineCheckId) return this;
        if (this.startCheckingCB) this.startCheckingCB();
        
        offlineCheck(this);
        this._offlineCheckId = setInterval(offlineCheck, this._interval, this);
        return this;
    };
    
    Offline.prototype.stopChecking = function() {
        if (!this._offlineCheckId) return this;
        if (this.stopCheckingCB) this.stopCheckingCB();
        
        clearInterval(this._offlineCheckId);
        this._offlineCheckId = null;
        this._isoffline = null;
        return this;
    };
    
    Offline.prototype.forceOfflineCheck = function () {
        offlineCheck(this);
        return this;
    };
    
    Offline.prototype.isOffline = function () {
        return this._isoffline;
    };
    
    Offline.prototype.on = function (event, cb) {
        if (typeof cb === "function") {
            if (event === "offline") {
                this.offlineCB = cb;
                if (this.isOffline()) this.offlineCB();
            }
            else if (event === "online") {
                this.onlineCB = cb;
                if (!this.isOffline()) this.onlineCB();
            }
            else if (event === "startChecking") {
                this.startCheckingCB = cb;
            }
            else if (event === "stopChecking") {
                this.stopCheckingCB = cb;
            }
        }
        return this;
    };
    
    var getConf = function (obj) {
        var conf = {};
        
        for (var fld in obj) {
            if (obj.hasOwnProperty(fld)) {
                conf[fld] = obj[fld];
            }
        }
        
        return conf;
    };
    
    var offlineCheck = function (obj) {
        var isoffline = true;
        
        if (navigator && !navigator.onLine) {
            update.call(obj, isoffline);
        } else {
            var xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
            
            xhr.open("HEAD", obj.endpoint + 'about?rand=' + Math.floor((1 + Math.random()) * 0x10000), true);
            
            xhr.onload = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        update.call(obj, !isoffline);
                    } else {
                        update.call(obj, isoffline);
                    }
                }
            };
            
            xhr.onerror = function () {
                update.call(obj, isoffline);
            };
            
            xhr.ontimeout = function () {
                update.call(obj, isoffline);
            };
            
            xhr.timeout = obj._reqtimeout;
            xhr.send();
        }
    };
    
    var update = function (offline) {
        if (this._isoffline == offline) return;
        
        this._isoffline = offline;
        
        if (this._isoffline) {
            this.offlineCB();
        } else {
            this.onlineCB();
        }
    };
    
    ADL.Offline = Offline;
}(window.ADL = window.ADL || {}));