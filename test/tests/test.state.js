describe('testing xAPI attachments', function () {

    var onBrowser, should;
    before(function () {

        onBrowser = typeof window !== 'undefined' ? true : false;
        if (!onBrowser) {
            should = require('should');
        }
    });

    it('should be able to send and retrieve an activity state', function (done) {

        var conf = {
            "endpoint": "https://lrs.adlnet.gov/xapi/",
            "user": "tom",
            "password": "1234",
        };
        ADL.XAPIWrapper.changeConfig(conf);

        var activityId = "http://adlnet.gov/expapi/activities/question"
        var activityState = "some-state";

        var agent = {"mbox":"mailto:tom@example.com"};
        var stateval = {"info":"the state info"};

        ADL.XAPIWrapper.sendState(activityId, agent, activityState, null, stateval, null, null, function(xhr, body){ 

                xhr.should.be.type('object');
                xhr.status.should.eql(204);

                ADL.XAPIWrapper.getState(activityId, agent, activityState, null, null, function(xhr, body){ 

                        xhr.should.be.type('object');
                        xhr.status.should.eql(200);
                        body.info.should.eql(stateval.info);
                        done();
                    }
                );
            }
        );
    });
});