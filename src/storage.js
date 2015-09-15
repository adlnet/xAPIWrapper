(function (ADL) {
    //shim: https://github.com/wojodesign/local-storage-js/blob/master/storage.js
    function StorageNotDefined (message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageNotDefined.prototype = Object.create(Error.prototype);
    StorageNotDefined.prototype.name = "StorageNotDefined";
    
    function StorageAtLimit (message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    StorageAtLimit.prototype = Object.create(Error.prototype);
    StorageAtLimit.prototype.name = "StorageAtLimit";
    
    var sizekey = 'size',
        maxsize = 5000000;
            
    function Storage () {
        if (! storageExists()) throw new StorageNotDefined("local storage is not available");
        
        var size = localStorage.getItem(sizekey) || 
                    (JSON.stringify(localStorage).length * 2);
        
        if (! hasSpace(size)) throw new StorageAtLimit("local storage is full");
    }
    
    Storage.prototype.set = function (stmts) {
        var item = JSON.stringify(stmts);
        localStorage.setItem(key, item);
        localStorage.setItem('size', localStorage.getItem('size') + item.length);
    };
    
    Storage.prototype.get = function () {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    };
    
    Storage.prototype.remove = function (key) {
        var item = localStorage.getItem(key);
        if (item) {
            localStorage.setItem('size', localStorage.getItem('size') - item.length);
            localStorage.removeItem(key);
        }
    };
    
    Storage.prototype.clear = function () {
        localStorage.clear();
        localStorage.setItem('size', remainingSpace());
    };
    
    Storage.prototype.storageAvailable = function () {
        return storageExists() && hasSpace();
    };
                
    var storageExists = function () {
        try {
            var storage = window.localStorage,
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    };

    var remainingSpace = function () {
        if (localStorage.remainingSpace) return localStorage.remainingSpace;
        return maxsize - (JSON.stringify(localStorage).length * 2);
    };
        
    var hasSpace = function (size) {
        return size > maxsize;
    };
    
    ADL.Storage = Storage;
}(window.ADL = window.ADL || {}));

//
//
//Storage.prototype.setObject = function(key, value) {
//    this.setItem(key, JSON.stringify(value));
//}
//
//Storage.prototype.getObject = function(key) {
//    var value = this.getItem(key);
//    return value && JSON.parse(value);
//}
