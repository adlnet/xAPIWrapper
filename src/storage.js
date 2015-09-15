(function (ADL) {
    function StorageNotDefined
    function Storage () {
        if (! isAvailable()) throw "local storage is not available";
        
        var sizekey = 'size',
            maxsize = 5000000,
            size = localStorage.getItem(sizekey) || 0;
        // tom: fix this stuff... i don't know what i want
        // need to test for localStorage and size
        if (! storageAvailable()) throw StorageNot
    }
    
    Storage.prototype.set = function (stmts) {
        var item = JSON.stringify(stmts);
        try {
            localStorage.setItem(key, item);
            localStorage.setItem('size', localStorage.getItem('size') +
        } catch (e) {
            
        }
    };
    
    Storage.prototype.get = function () {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    };
    
    Storage.prototype.remove = function () {
        localStorage.removeItem(key)
    };
    
    Storage.prototype.clear = function () {
        localStorage.clear();
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
        return (JSON.stringify(localStorage).length * 2) - 5000000;
    }
    
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
