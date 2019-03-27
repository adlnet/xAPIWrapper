(function(global) {

    if (global.console && global.console.log.apply) return;
    // IE8/9 Function.prototype.bind isn't available initially
    var bind = function(func, context) {
        return function() {
            // IE8/9 method of applying apply to native functions with no apply
            return Function.prototype.apply.apply(func, new Array([context], arguments));
        };
    };

    global.console = global.console || {
        log: function() {}
    };

    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;

    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!global.console[method]) {
            global.console[method] = noop;
        }
    }

    // Allow console.log/warn/error.apply for IE8/9
    var overrides = ('log,warn,error').split(',');
    var log = bind(console.log, console);
    while (override = overrides.pop()) {
        global.console[override] = function() {
            return log.apply(console, arguments);
        };
    }

})(typeof window === 'undefined' ? this : window);
