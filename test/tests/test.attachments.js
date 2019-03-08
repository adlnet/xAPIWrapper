describe('testing xAPI attachments', function () {

    var onBrowser, should;

    before(function () {

        onBrowser = typeof window !== 'undefined' ? true : false;
        if (!onBrowser) {
            should = require('should');
        }

    });

    it('should be able to send a simple string attachment', function (done) {

        var conf = {
            "endpoint" : "https://lrs.adlnet.gov/xapi/",
            "user" : "tom",
            "password" : "1234",
        };
        ADL.XAPIWrapper.changeConfig(conf);

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

        ADL.XAPIWrapper.sendStatement(statement, function (xhr) {
            xhr.should.be.type('object');
            xhr.status.should.eql(200);
            done();
        }, [attachment]);
    });
});
