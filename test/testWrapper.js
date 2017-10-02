describe("xAPIWrapper Test:", () => {
    const fs = require('fs');

    // Response Types
    const OK = 200;
    const NO_CONTENT = 204;
    const BAD_REQUEST = 400;
    const PRE_COND_FAILED = 412;

    // Error messages
    const INVALID_PARAMETERS = 'Error: invalid parameters';
    const INVALID_TIMESTAMP = 'Error: invalid timestamp';
    const INVALID_ETAG_HEADER = 'Error: invalid ETag header';
    const INVALID_ETAG_HASH = 'Error: invalid ETag hash';
    const INVALID_ID = 'Error: invalid id';

    // ETag headers
    const IF_NONE_MATCH = "If-None-Match";
    const IF_MATCH = "If-Match";

    // Testing module functionality
    let should, XAPIWrapper, Util, Statement;

    before(() => {
        // Require necessary modules
        should = require('should');
        XAPIWrapper = require('./../src/xAPIWrapper');
        Util = require('./../src/Utils');
        Statement = require('./../src/Statement').Statement;

        XAPIWrapper.changeConfig({
            "endpoint": "https://lrs.adlnet.gov/xapi/",
            "user": "aaron",
            "password": "1234"
        });
    });

    describe("Statements", () => {
        let s1, s2;

        beforeEach(() => {
            s1 = new Statement({
                'actor': { 'mbox': 'mailto:userone@example.com' },
                'verb': { 'id': 'http://adlnet.gov/expapi/verbs/attempted' },
                'object': { 'id': 'http://activity.com/id' }
            });
            s2 = new Statement({
                'actor': { 'mbox': 'mailto:usertwo@example.com' },
                'verb': { 'id': 'http://adlnet.gov/expapi/verbs/attempted' },
                'object': { 'id': 'http://activity.com/id' }
            });
        });

        describe("PUT", () => {
            it("should pass sending statement asynchronously", () => {
                s1['id'] = Util.ruuid();
                return XAPIWrapper.putStatement(s1, s1['id'])
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should pass sending statement with callback", (done) => {
                s2['id'] = Util.ruuid();
                XAPIWrapper.putStatement(s2, s2['id'], null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should fail sending null statement asynchronously", () => {
                return XAPIWrapper.putStatement(null, Util.ruuid())
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending invalid id asynchronously", () => {
                return XAPIWrapper.putStatement(s1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_ID);
                    });
            });
            it("should fail sending invalid id with callback", (done) => {
                XAPIWrapper.putStatement(s2, "", null, (error, resp, data) => {
                    error.should.eql(INVALID_ID);

                    done();
                });
            });
            it("should fail sending array with callback", (done) => {
                let stmt = [new Statement(s1)];
                XAPIWrapper.putStatement(stmt, stmt['id'], null, (error, resp, data) => {
                    error.should.not.eql(null);

                    done();
                });
            });
            describe("With Attachments", () => {
                let stmt;
                let att;

                beforeEach(() => {
                    // Get attachment data
                    content = fs.readFileSync('test/templates/attachments/test.txt').toString();

                    att = [
                        {
                            value: content,
                            type: {
                                "usageType": "http://adlnet.gov/expapi/attachments/test",
                                "display": { "en-US": "Test Attachment" },
                                "description": { "en-US": "a test attachment for statement requests" },
                                "contentType": "application/octet-stream"
                            }
                        }
                    ]

                    stmt = new Statement({
                        'actor': { 'mbox': 'mailto:a@example.com' },
                        'verb': { 'id': 'http://adlnet.gov/expapi/verbs/attempted' },
                        'object': { 'id': 'http://activity.com/id' }
                    });
                    stmt['id'] = Util.ruuid();
                });

                it("should pass using valid attachment data asynchronously", () => {
                    return XAPIWrapper.putStatement(stmt, stmt.id, att, null)
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);
                        });
                });
                it("should pass using valid attachment data with callback", (done) => {
                    XAPIWrapper.putStatement(stmt, stmt.id, att, (error, resp, data) => {
                        resp.status.should.eql(NO_CONTENT);
                        data.id.should.eql(stmt.id);

                        done();
                    });
                });
            });
        });
        describe("POST", () => {
            it("should pass sending statement asynchronously", () => {
                return XAPIWrapper.postStatement(s1)
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should pass sending statement with callback", (done) => {
                XAPIWrapper.postStatement(s2, null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(OK);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should fail sending null statement asynchronously", () => {
                return XAPIWrapper.postStatement(null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending array with callback", (done) => {
                XAPIWrapper.postStatement([new Statement(s1)], null, (error, resp, data) => {
                    error.should.not.eql(null);

                    done();
                });
            });
            describe("Multiple Statements", () => {
                it("should pass sending statements asynchronously", () => {
                    let stmts = [new Statement(s1), new Statement(s2)];
                    return XAPIWrapper.postStatements(stmts)
                        .then((res) => {
                            res.resp.status.should.eql(OK);
                            res.resp.ok.should.eql(true);
                        });
                });
                it("should pass sending statements with callback", (done) => {
                    let stmts = [new Statement(s1)];
                    XAPIWrapper.postStatements(stmts, (error, resp, data) => {
                        (!error).should.eql(true);
                        resp.status.should.eql(OK);
                        resp.ok.should.eql(true);

                        done();
                    });
                });
                it("should fail sending single object with callback", (done) => {
                    XAPIWrapper.postStatements(new Statement(s1), (error, resp, data) => {
                        error.should.not.eql(null);
                        done();
                    });
                });
                it("should fail sending empty array with callback", (done) => {
                    XAPIWrapper.postStatements([], (error, resp, data) => {
                        error.should.not.eql(null);
                        done();
                    });
                });
            });
            describe("With Attachments", () => {
                let stmt;
                let att;

                beforeEach(() => {
                    // Get attachment data
                    content = fs.readFileSync('test/templates/attachments/test.txt').toString();

                    att = [
                        {
                            value: content,
                            type: {
                                "usageType": "http://adlnet.gov/expapi/attachments/test",
                                "display": { "en-US": "Test Attachment" },
                                "description": { "en-US": "a test attachment for statement requests" },
                                "contentType": "application/octet-stream"
                            }
                        }
                    ]

                    stmt = new Statement({
                        'actor': { 'mbox': 'mailto:a@example.com' },
                        'verb': { 'id': 'http://adlnet.gov/expapi/verbs/attempted' },
                        'object': { 'id': 'http://activity.com/id' }
                    });
                });

                it("should pass using valid attachment data asynchronously", () => {
                    return XAPIWrapper.postStatement(stmt, att, null)
                        .then((res) => {
                            res.resp.status.should.eql(OK);
                        });
                });
                it("should pass using valid attachment data with callback", (done) => {
                    XAPIWrapper.postStatement(stmt, att, (error, resp, data) => {
                        resp.status.should.eql(OK);

                        done();
                    });
                });
            });
        });
        describe("GET", () => {
            it("should return list of statements asynchronously", () => {
                return XAPIWrapper.getStatements()
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return list of statements with callback", (done) => {
                XAPIWrapper.getStatements(null, null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(OK);
                    data.should.not.eql(null);

                    done();
                });
            });
            it("should return single statement asynchronously", () => {
                return XAPIWrapper.getStatements({ "limit": 1 })
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return single statement using id asynchronously", () => {
                let stmt = new Statement(s1);
                stmt['id'] = Util.ruuid();
                let id = stmt['id'];
                return XAPIWrapper.postStatement(stmt)
                    .then((res) => {
                        return XAPIWrapper.getStatements({ "statementId": id })
                            .then((res) => {
                                res.data.id.should.eql(id);
                            });
                    });
            });
            describe("More Statements", () => {
                it("should return list of statements with no additional call asynchronously", () => {
                    return XAPIWrapper.getMoreStatements(0, null)
                        .then((res) => {
                            (Array.isArray(res.data)).should.eql(true);
                            res.data.length.should.not.eql(0);
                        });
                });
                it("should return list of statements with no additional call", (done) => {
                    XAPIWrapper.getMoreStatements(0, null, (error, resp, data) => {
                        (Array.isArray(data)).should.eql(true);
                        data.length.should.not.eql(0);

                        done();
                    });
                });
                it("should return single statement with no additional call asynchronously", () => {
                    return XAPIWrapper.getMoreStatements(0, { "limit": 1 })
                        .then((res) => {
                            (Array.isArray(res.data)).should.eql(true);
                            res.data.length.should.eql(1);
                        });
                });
                it("should return single statement with no additional call", (done) => {
                    XAPIWrapper.getMoreStatements(0, { "limit": 1 }, (error, resp, data) => {
                        (Array.isArray(data)).should.eql(true);
                        data.length.should.eql(1);

                        done();
                    });
                });
                it("should return list of statements with single additional call asynchronously", () => {
                    return XAPIWrapper.getMoreStatements(1, null)
                        .then((res) => {
                            (Array.isArray(res.data)).should.eql(true);
                            res.data.length.should.eql(200);
                        });
                });
                it("should return list of statements with single additional call", (done) => {
                    XAPIWrapper.getMoreStatements(1, null, (error, resp, data) => {
                        (Array.isArray(data)).should.eql(true);
                        data.length.should.eql(200);

                        done();
                    });
                });
                it("should return list of statements with single additional call & limit of 1 asynchronously", () => {
                    return XAPIWrapper.getMoreStatements(1, { "limit": 1 })
                        .then((res) => {
                            (Array.isArray(res.data)).should.eql(true);
                            res.data.length.should.eql(2);
                        });
                });
                it("should return list of statements with single additional call & limit of 1", (done) => {
                    XAPIWrapper.getMoreStatements(1, { "limit": 1 }, (error, resp, data) => {
                        (Array.isArray(data)).should.eql(true);
                        data.length.should.eql(2);

                        done();
                    });
                });
            });
        });
    });

    describe("State", () => {
        let actId, agent, stateId, stateVal;

        before(() => {
            actId = 'http://adlnet.gov/expapi/activities/attempted';
            agent = { 'mbox': 'mailto:a@example.com' };
            stateId = 'attemptedstate';
            stateVal = { 'info': 'the state info' };
        });

        describe("PUT", () => {
            it("should pass sending default state asynchronously", () => {
                return XAPIWrapper.putState(actId, agent, stateId, null, stateVal)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should pass sending default state with callback", (done) => {
                XAPIWrapper.putState(actId, agent, stateId, null, stateVal, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should pass sending state using registrationId with callback", (done) => {
                let newState = 'registeredstate';
                let id = Util.ruuid();
                XAPIWrapper.putState(actId, agent, newState, id, stateVal, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should pass updating state asynchronously", () => {
                let newState = { 'info': 'the new updated state info' };
                return XAPIWrapper.putState(actId, agent, stateId, null, newState)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should fail sending null stateval parameter asynchronously", () => {
                return XAPIWrapper.putState(actId, agent, stateId, null, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
        });
        describe("POST", () => {
            it("should pass sending state asynchronously", () => {
                return XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, stateId, null, stateVal)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should pass sending state with callback", (done) => {
                XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, stateId, null, stateVal, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should pass sending state using registration id with callback", (done) => {
                let newState = 'registeredstate';
                let id = Util.ruuid();
                XAPIWrapper.postState(actId, agent, newState, id, stateVal, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should fail sending null stateval parameter asynchronously", () => {
                return XAPIWrapper.postState(actId, agent, stateId, null, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
        });
        describe("GET", () => {
            it("should return list of state id's using activity/agent asynchronously", () => {
                return XAPIWrapper.getState(actId, agent)
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return list of state id's using activity/agent with callback", (done) => {
                XAPIWrapper.getState(actId, agent, null, null, null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(OK);
                    data.should.not.eql(null);

                    done();
                });
            });
            it("should return list of state id's using different agent asynchronously", () => {
                return XAPIWrapper.getState(actId, { 'mbox': 'mailto:a@example.com' })
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return list of state id's using since parameter asynchronously", () => {
                let date = "2017-06-26T11:45:28.297971+00:00";
                return XAPIWrapper.getState(actId, agent, null, null, date)
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return empty list using present since parameter asynchronously", () => {
                let date = (new Date()).toISOString();
                return XAPIWrapper.getState(actId, agent, null, null, date)
                    .then((res) => {
                        res.resp.status.should.eql(OK);
                        res.data.should.not.eql(null);
                    });
            });
            it("should return list of state id's using since parameter with callback", (done) => {
                let date = "2017-06-26T11:45:28.297971+00:00";
                XAPIWrapper.getState(actId, agent, null, null, date, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(OK);
                    data.should.not.eql(null);

                    done();
                });
            });
            it("should return single state using state id parameter asynchronously", () => {
                return XAPIWrapper.postState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate", null, stateVal)
                    .then((res) => {
                        return XAPIWrapper.getState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate")
                            .then((res) => {
                                res.resp.status.should.eql(OK);
                                res.data.should.not.eql(null);
                            });
                    });
            });
            it("should fail using invalid agent asynchronously", () => {
                return XAPIWrapper.getState(actId)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
        });
        describe("DELETE", () => {
            it("should delete specified state using activityId/agent parameters asynchronously", () => {
                return XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);
                        res.resp.ok.should.eql(true);
                    });
            });
            it("should delete specified state using activityId/agent parameters with callback", (done) => {
                XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/completed', agent, 'completedstate', null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should delete specified state using activityId/agent parameters with callback", (done) => {
                XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/launched', agent, null, null, (error, resp, data) => {
                    (!error).should.eql(true);
                    resp.status.should.eql(NO_CONTENT);
                    resp.ok.should.eql(true);

                    done();
                });
            });
            it("should delete specified state using state id parameter asynchronously", () => {
                return XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', null, stateVal)
                    .then((res) => {
                        return XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate')
                            .then((res) => {
                                res.resp.status.should.eql(NO_CONTENT);
                                res.resp.ok.should.eql(true);
                            });
                    });
            });
            it("should delete specified state using registration id parameter asynchronously", () => {
                let id = Util.ruuid();
                return XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', id, stateVal)
                    .then((res) => {
                        return XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, null, id)
                            .then((res) => {
                                res.resp.status.should.eql(NO_CONTENT);
                                res.resp.ok.should.eql(true);
                            });
                    });
            });
            it("should fail using invalid activity id asynchronously", () => {
                return XAPIWrapper.deleteState(null, agent)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    })
            });
        });
    });

    describe("Activities", () => {
        it("should return activity object asynchronously", () => {
            return XAPIWrapper.getActivities('http://activity.com/id')
                .then((res) => {
                    res.resp.status.should.eql(OK);
                    res.data.should.not.eql(null);
                });
        });
        it("should return activity object with callback", (done) => {
            XAPIWrapper.getActivities('http://activity.com/id', (error, resp, data) => {
                (!error).should.eql(true);
                resp.status.should.eql(OK);
                resp.ok.should.eql(true);

                done();
            });
        });
        it("should fail using invalid activity object asynchronously", () => {
            return XAPIWrapper.getActivities('bad id')
                .catch((error) => {
                    error.should.not.eql(null);
                });
        });
        it("should fail using null activity object with callback", (done) => {
            XAPIWrapper.getActivities(null, (error, resp, data) => {
                error.should.not.eql(null);

                done();
            });
        });
    });

    describe("Activity Profile", () => {
        let activityId1, profileId1, profileVal1;
        let activityId2, profileId2, profileVal2;
        let etag;

        before(() => {
            activityId1 = 'http://www.example.com/activityId/hashset1';
            profileId1 = Util.ruuid();
            profileVal1 = { "activityId": activityId1, "profileId": profileId1 };

            activityId2 = 'http://www.example.com/activityId/hashset2';
            profileId2 = Util.ruuid();
            profileVal2 = { "activityId": activityId2, "profileId": profileId2 };
        });

        describe("PUT", () => {
            describe("If-None-Match", () => {
                it("should pass storing new profile if none exist", () => {
                    return XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "*")
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getActivityProfile(activityId1, profileId1)
                                .then((res) => {
                                    res.data['activityId'].should.eql(activityId1);
                                    res.data['profileId'].should.eql(profileId1);
                                    res.resp.headers._headers['etag'].should.not.eql(null);
                                });
                        });
                });
                it("should pass storing new profile with etag if none exist", () => {
                    etag = XAPIWrapper.hash(JSON.stringify(profileVal2));
                    return XAPIWrapper.putActivityProfile(activityId2, profileId2, profileVal2, IF_NONE_MATCH, etag)
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getActivityProfile(activityId2, profileId2)
                                .then((res) => {
                                    res.data['activityId'].should.eql(activityId2);
                                    res.data['profileId'].should.eql(profileId2);
                                    res.resp.headers._headers['etag'][0].should.eql(`"${etag}"`);
                                });
                        });
                });
                it("should fail storing existing profile", () => {
                    return XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "*")
                        .catch((error) => {
                            error.status.should.eql(PRE_COND_FAILED);
                        });
                });
            });
            describe("If-Match", () => {
                it("should pass updating existing profile", () => {
                    let profile = profileVal1;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putActivityProfile(activityId1, profileId1, profile, IF_MATCH, "*")
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getActivityProfile(activityId1, profileId1)
                                .then((res) => {
                                    res.data.should.eql({
                                        activityId: activityId1,
                                        profileId: profile.profileId
                                    });
                                });
                        });
                });
                it("should pass updating existing profile with ETag", () => {
                    let profile = profileVal2;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putActivityProfile(activityId2, profileId2, profile, IF_MATCH, etag)
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getActivityProfile(activityId2, profileId2)
                                .then((res) => {
                                    res.data.should.eql({
                                        activityId: activityId2,
                                        profileId: profile.profileId
                                    });
                                });
                        });
                });
                it("should fail updating existing profile with invalid etag", () => {
                    let profile = profileVal1;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putActivityProfile(activityId1, profileId1, profile, IF_MATCH, "1234567891234567891212345678912345678912")
                        .catch((error) => {
                            error.status.should.eql(PRE_COND_FAILED);
                        });
                });
            });
            it("should fail sending profile using invalid activityId", () => {
                return XAPIWrapper.putActivityProfile(null, profileId1, profileVal1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using invalid profileId", () => {
                return XAPIWrapper.putActivityProfile(activityId1, null, profileVal1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending invalid profile object", () => {
                return XAPIWrapper.putActivityProfile(activityId1, profileId1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using both ETag headers", () => {
                return XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, `${IF_NONE_MATCH}${IF_MATCH}`, "*")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HEADER);
                    });
            });
            it("should fail sending profile using invalid ETag hash", () => {
                return XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HASH);
                    });
            });
            it("should fail sending profile using invalid ETag header", () => {
                return XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, "", "*")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HEADER);
                    });
            });

            after(() => {
                XAPIWrapper.deleteActivityProfile(activityId1, profileId1);
                XAPIWrapper.deleteActivityProfile(activityId2, profileId2);
            });
        });
        describe("POST", () => {
            it("should pass storing profile if none exist", () => {
                return XAPIWrapper.postActivityProfile(activityId1, profileId1, profileVal1)
                    .then((res) => {
                        return XAPIWrapper.getActivityProfile(activityId1, profileId1)
                            .then((res) => {
                                res.data.should.eql(profileVal1);
                                res.resp.headers._headers['etag'].should.not.eql(null);
                            });
                    });
            });
            it("should pass merging profiles", () => {
                let profile = { newProp: "New property" };
                return XAPIWrapper.postActivityProfile(activityId1, profileId1, profile)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);

                        return XAPIWrapper.getActivityProfile(activityId1, profileId1)
                            .then((res) => {
                                res.data.should.eql({
                                    activityId: profileVal1.activityId,
                                    profileId: profileVal1.profileId,
                                    newProp: profile.newProp
                                });
                            });
                    });
            });
            it("should fail sending profile using invalid activityId", () => {
                return XAPIWrapper.postActivityProfile(null, profileId1, profileVal1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using invalid profileId", () => {
                return XAPIWrapper.postActivityProfile(activityId1, null, profileVal1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending invalid profile object", () => {
                return XAPIWrapper.postActivityProfile(activityId1, profileId1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });

            after(() => {
                XAPIWrapper.deleteActivityProfile(activityId1, profileId1);
                XAPIWrapper.deleteActivityProfile(activityId2, profileId2);
            });
        });
        describe("GET", () => {
            let prof, date;
            before(() => {
                prof = [
                    { "activityId": 'http://www.example.com/activityId/1', "profileId": Util.ruuid() },
                    { "activityId": 'http://www.example.com/activityId/1', "profileId": Util.ruuid() },
                    { "activityId": 'http://www.example.com/activityId/1', "profileId": Util.ruuid() }
                ];
                date = Date().now;
                XAPIWrapper.postActivityProfile(prof[0].activityId, prof[0].profileId, prof[0]);
                XAPIWrapper.postActivityProfile(prof[1].activityId, prof[1].profileId, prof[1]);
                XAPIWrapper.postActivityProfile(prof[2].activityId, prof[2].profileId, prof[2]);
            });

            it("should return list of profile IDs using valid activityId & no profileId", () => {
                return XAPIWrapper.getActivityProfile(prof[0].activityId)
                    .then((res) => {
                        (Array.isArray(res.data)).should.eql(true);
                        (res.data.length).should.not.eql(0);
                    });
            });
            it("should return single activity profile using valid activity/profile IDs & timestamp", () => {
                return XAPIWrapper.getActivityProfile(prof[0].activityId, prof[0].profileId, date)
                    .then((res) => {
                        res.data['activityId'].should.eql(prof[0].activityId);
                        res.data['profileId'].should.eql(prof[0].profileId);
                    });
            });
            it("should return list of profile IDs using valid activityId & timestamp", () => {
                return XAPIWrapper.getActivityProfile(prof[0].activityId, null, date)
                    .then((res) => {
                        (Array.isArray(res.data)).should.eql(true);
                        (res.data.length).should.not.eql(0);
                    });
            });
            it("should fail using invalid activityId", () => {
                return XAPIWrapper.getActivityProfile(null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail using invalid 'since' timestamp", () => {
                return XAPIWrapper.getActivityProfile(activityId1, profileId1, {})
                    .catch((error) => {
                        error.should.eql(INVALID_TIMESTAMP);
                    });
            });

            after(() => {
                XAPIWrapper.deleteActivityProfile(prof[0].activityId, prof[0].profileId);
                XAPIWrapper.deleteActivityProfile(prof[1].activityId, prof[1].profileId);
                XAPIWrapper.deleteActivityProfile(prof[2].activityId, prof[2].profileId);
            });
        });
        describe("DELETE", () => {
            it("should pass deleting the profile using valid activity/profile IDs", () => {
                return XAPIWrapper.deleteActivityProfile(activityId1, profileId1)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);

                        return XAPIWrapper.getActivityProfile(activityId1, profileId1)
                            .catch((error) => {
                                error.name.should.eql('FetchError');
                            });
                    });
            });
            it("should fail deleting the profile using invalid activityId", () => {
                return XAPIWrapper.deleteActivityProfile(null, profileId1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail deleting the profile using invalid profileId", () => {
                return XAPIWrapper.deleteActivityProfile(activityId1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
        });
    });

    describe("Agents", () => {
        it("should return person object asynchronously", () => {
            return XAPIWrapper.getAgents({ 'mbox': 'mailto:a@example.com' })
                .then((res) => {
                    res.resp.status.should.eql(OK);
                    res.data.should.not.eql(null);
                });
        });
        it("should return person object with callback", (done) => {
            XAPIWrapper.getAgents({ 'mbox': 'mailto:a@example.com' }, (error, resp, data) => {
                if (error) {
                    console.log(error);
                } else {
                    (resp.status).should.eql(OK);
                }

                done();
            });
        });
        it("should fail using invalid agent asynchronously", () => {
            return XAPIWrapper.getAgents({ 'mbox': 'mailto:wrong@example.com' })
                .catch((error) => {
                    error.should.not.eql(null);
                });
        });
        it("should fail using null agent parameter asynchronously", () => {
            return XAPIWrapper.getAgents(null)
                .catch((error) => {
                    error.should.eql(INVALID_PARAMETERS);
                })
        });
    });

    describe("Agent Profile", () => {
        let agent1, profileId1, profile1;
        let agent2, profileId2, profile2;
        let etag;

        before(() => {
            agent1 = { "mbox": "mailto:user@example.com" };
            profileId1 = Util.ruuid();
            profile1 = { "agent": agent1, "profileId": profileId1 };

            agent2 = {
                "account": {
                    "homePage": "http://www.example.com/agentId2",
                    "name": "Agent2"
                }
            };
            profileId2 = Util.ruuid();
            profile2 = { "agent": agent2, "profileId": profileId2 };
        });

        describe("PUT", () => {
            describe("If-None-Match", () => {
                it("should pass storing new profile if none exist", () => {
                    return XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "*")
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getAgentProfile(agent1, profileId1)
                                .then((res) => {
                                    res.data.should.eql(profile1);
                                    res.resp.headers._headers['etag'].should.not.eql(null);
                                });
                        });
                });
                it("should pass storing new profile with etag if none exist", () => {
                    etag = XAPIWrapper.hash(JSON.stringify(profile2));
                    return XAPIWrapper.putAgentProfile(agent2, profileId2, profile2, IF_NONE_MATCH, etag)
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getAgentProfile(agent2, profileId2)
                                .then((res) => {
                                    res.data.should.eql(profile2);
                                    res.resp.headers._headers['etag'][0].should.eql(`"${etag}"`);
                                });
                        });
                });
                it("should fail storing existing profile", () => {
                    return XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "*")
                        .catch((error) => {
                            error.status.should.eql(PRE_COND_FAILED);
                        });
                });
            });
            describe("If-Match", () => {
                it("should pass updating existing profile", () => {
                    let profile = profile1;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putAgentProfile(agent1, profileId1, profile, IF_MATCH, "*")
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getAgentProfile(agent1, profileId1)
                                .then((res) => {
                                    res.data.should.eql({
                                        agent: agent1,
                                        profileId: profile.profileId
                                    });
                                });
                        });
                });
                it("should pass updating existing profile with ETag", () => {
                    let profile = profile2;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putAgentProfile(agent2, profileId2, profile, IF_MATCH, etag)
                        .then((res) => {
                            res.resp.status.should.eql(NO_CONTENT);

                            return XAPIWrapper.getAgentProfile(agent2, profileId2)
                                .then((res) => {
                                    res.data.should.eql({
                                        agent: agent2,
                                        profileId: profile.profileId
                                    });
                                });
                        });
                });
                it("should fail updating existing profile with invalid etag", () => {
                    let profile = profile1;
                    profile.profileId = Util.ruuid();
                    return XAPIWrapper.putAgentProfile(agent1, profileId1, profile, IF_MATCH, "1234567891234567891212345678912345678912")
                        .catch((error) => {
                            error.status.should.eql(PRE_COND_FAILED);
                        });
                });
            });
            it("should fail sending profile using invalid agent", () => {
                return XAPIWrapper.putAgentProfile(null, profileId1, profile1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using invalid profileId", () => {
                return XAPIWrapper.putAgentProfile(agent1, null, profile1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending invalid profile object", () => {
                return XAPIWrapper.putAgentProfile(agent1, profileId1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using both ETag headers", () => {
                return XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, `${IF_NONE_MATCH}${IF_MATCH}`, "*")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HEADER);
                    });
            });
            it("should fail sending profile using invalid ETag hash", () => {
                return XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HASH);
                    });
            });
            it("should fail sending profile using invalid ETag header", () => {
                return XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, "", "*")
                    .catch((error) => {
                        error.should.eql(INVALID_ETAG_HEADER);
                    });
            });

            after(() => {
                XAPIWrapper.deleteAgentProfile(agent1, profileId1);
                XAPIWrapper.deleteAgentProfile(agent2, profileId2);
            });
        });
        describe("POST", () => {
            it("should pass storing profile if none exist", () => {
                return XAPIWrapper.postAgentProfile(agent1, profileId1, profile1)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);

                        return XAPIWrapper.getAgentProfile(agent1, profileId1)
                            .then((res) => {
                                res.data.should.eql(profile1);
                                res.resp.headers._headers['etag'].should.not.eql(null);
                            });
                    });
            });
            it("should pass merging profiles", () => {
                let profile = { newProp: "New property" };
                return XAPIWrapper.postAgentProfile(agent1, profileId1, profile)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);

                        return XAPIWrapper.getAgentProfile(agent1, profileId1)
                            .then((res) => {
                                res.data.should.eql({
                                    agent: profile1.agent,
                                    profileId: profile1.profileId,
                                    newProp: profile.newProp
                                });
                            });
                    });
            });
            it("should fail sending profile using invalid agent", () => {
                return XAPIWrapper.postAgentProfile(null, profileId1, profile1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending profile using invalid profileId", () => {
                return XAPIWrapper.postAgentProfile(agent1, null, profile1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail sending invalid profile object", () => {
                return XAPIWrapper.postAgentProfile(agent1, profileId1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });

            after(() => {
                XAPIWrapper.deleteAgentProfile(agent1, profileId1);
                XAPIWrapper.deleteAgentProfile(agent2, profileId2);
            });
        });
        describe("GET", () => {
            let prof, date;
            let agentId;
            before(() => {
                agentId = XAPIWrapper.hash(agent1);

                prof = [
                    { "agent": { "mbox_sha1sum": agentId }, "profileId": Util.ruuid() },
                    { "agent": { "mbox_sha1sum": agentId }, "profileId": Util.ruuid() },
                    { "agent": { "mbox_sha1sum": agentId }, "profileId": Util.ruuid() }
                ];
                date = Date().now;
                XAPIWrapper.postAgentProfile(prof[0].agent, prof[0].profileId, prof[0]);
                XAPIWrapper.postAgentProfile(prof[1].agent, prof[1].profileId, prof[1]);
                XAPIWrapper.postAgentProfile(prof[2].agent, prof[2].profileId, prof[2]);
            });

            it("should return single activity profile using valid agent & profileId", () => {
                return XAPIWrapper.getAgentProfile(prof[0].agent, prof[0].profileId)
                    .then((res) => {
                        res.data.should.eql(prof[0]);
                    });
            });
            it("should return list of profile IDs using valid agent & no profileId", () => {
                return XAPIWrapper.getAgentProfile(prof[0].agent)
                    .then((res) => {
                        (Array.isArray(res.data)).should.eql(true);
                        (res.data.length).should.not.eql(0);
                    });
            });
            it("should return single activity profile using valid agent, profileId & timestamp", () => {
                return XAPIWrapper.getAgentProfile(prof[0].agent, prof[0].profileId, date)
                    .then((res) => {
                        res.data.should.eql(prof[0]);
                    });
            });
            it("should return list of profile IDs using valid agent & timestamp", () => {
                return XAPIWrapper.getAgentProfile(prof[0].agent, null, date)
                    .then((res) => {
                        (Array.isArray(res.data)).should.eql(true);
                        (res.data.length).should.not.eql(0);
                    });
            });
            it("should fail using invalid agent", () => {
                return XAPIWrapper.getAgentProfile(null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail using invalid 'since' timestamp", () => {
                return XAPIWrapper.getAgentProfile(agent1, profileId1, {})
                    .catch((error) => {
                        error.should.eql(INVALID_TIMESTAMP);
                    });
            });

            after(() => {
                XAPIWrapper.deleteAgentProfile(prof[0].agent, prof[0].profileId);
                XAPIWrapper.deleteAgentProfile(prof[1].agent, prof[1].profileId);
                XAPIWrapper.deleteAgentProfile(prof[2].agent, prof[2].profileId);
            });
        });
        describe("DELETE", () => {
            it("should pass deleting the profile using valid agent & profileId", () => {
                return XAPIWrapper.deleteAgentProfile(agent1, profileId1)
                    .then((res) => {
                        res.resp.status.should.eql(NO_CONTENT);

                        return XAPIWrapper.getAgentProfile(agent1, profileId1)
                            .catch((error) => {
                                error.name.should.eql('FetchError');
                            });
                    });
            });
            it("should fail deleting the profile using invalid agent", () => {
                return XAPIWrapper.deleteAgentProfile(null, profileId1)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
            it("should fail deleting the profile using invalid profileId", () => {
                return XAPIWrapper.deleteAgentProfile(agent1, null)
                    .catch((error) => {
                        error.should.eql(INVALID_PARAMETERS);
                    });
            });
        });
    });

});
