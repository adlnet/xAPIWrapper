describe('testing xAPIWrapper attachments', function () {

    var assert, ADL;
    before(function () {

        if (typeof window !== 'undefined') {
            assert = window.assert;
            ADL = window.ADL;
        } else {
            assert = require('./libs/assert');
            require('../lib/cryptojs_v3.1.2');
            require('../src/xapiwrapper');
            require('../src/xapi-util');
            // Test in node with mock XHR_request and ADL.stmts as XMLHttpRequest
            // isn't supported in node so the usual wrapper won't run tests.
            require('../examples/stmtBank.js');
            require('./mocks/ADL.XHR_request');
            ADL = global.ADL;
        }

        var conf = {
            "endpoint" : "https://lrs.adlnet.gov/xapi/",
            "user" : "tom",
            "password" : "1234"
        };
        ADL.XAPIWrapper.changeConfig(conf);

    });

    it('should send a simple string attachment', function(done) {
        var statement =  {"actor":{"mbox":"mailto:tom@tom.com"}, "verb":{"id":"http://verb.com/do1"}, "object":{"id":"http://from.tom/act1", "objectType":"Activity", "definition":{"name":{"en-US": "soccer", "fr": "football", "de": "foossball"}}}};
        var attachmentMetadata = {
            "usageType": "http://adlnet.gov/expapi/attachments/asdf",
            "display":
            {
                "en-US": "asdfasdf"
            },
            "description":
            {
                "en-US": "asdfasdfasd"
            },
            "contentType": "application/octet-stream"
        }
        var attachment = {
            value: "this is a simple string attachment",
            type:attachmentMetadata
        }
        ADL.XAPIWrapper.sendStatement(statement, function() {
            done();
        }, [attachment]);
    });


});
