(function(root, factory){
    // text-encoder uses module.exports which isn't allowed inside
    // the main closure as it breaks the module export in node
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], function (exports) {
            factory({}, { ADL: exports }, root);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory({}, { ADL: exports }, root);
    } else {
        // Browser roots
        factory({}, root, root);
    }
}(typeof self !== 'undefined' ? self : this, function (module, window, root) {//<%= output =>
}));
