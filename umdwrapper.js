(function(root, factory){
    // text-encoder uses module.exports which isn't allowed inside
    // the main closure as it breaks the module export in node
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], function (exports) {
            return factory({}, root, root);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = factory({}, root, root);
    } else {
        // Browser roots
        root.ADL = factory({}, root, root);
    }
}(typeof self !== 'undefined' ? self : this, function (module, window, root) {var ADL = {};//<%= output =>
    return ADL;
}));
