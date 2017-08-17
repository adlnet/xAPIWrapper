describe("Asynchronous Testing:", () => {
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
    Util = require('./../src/Utils.js');
    Statement = require('./../src/statement').Statement;

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });
  });

  describe("Statement(s)", () => {
    let s1, s2;

    beforeEach(() => {
      s1 = new Statement({
        'actor': {'mbox':'mailto:userone@example.com'},
        'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
        'object': {'id': 'http://activity.com/id'}
      });
      s2 = new Statement({
        'actor': {'mbox':'mailto:usertwo@example.com'},
        'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
        'object': {'id': 'http://activity.com/id'}
      });
    });

    describe("PUT", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.putStatement(s1, s1['id']);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.putStatement(s2, s2['id'], (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(NO_CONTENT);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        XAPIWrapper.putStatement(null, Util.ruuid())
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending invalid id asynchronously", async () => {
        XAPIWrapper.putStatement(s1, null)
          .catch((error) => {
            error.should.eql(INVALID_ID);
          });
      });
      it("should fail sending invalid id with callback", (done) => {
        XAPIWrapper.putStatement(s2, "", (error, resp, data) => {
          error.should.eql(INVALID_ID);

          done();
        });
      });
      it("should fail sending array with callback", (done) => {
        let stmt = [new Statement(s1)];
        XAPIWrapper.putStatement(stmt, stmt['id'], (error, resp, data) => {
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
                "usageType":"http://adlnet.gov/expapi/attachments/test",
                "display":{"en-US": "Test Attachment"},
                "description":{"en-US":"a test attachment for statement requests"},
                "contentType":"application/octet-stream"
              }
            }
          ]

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          await XAPIWrapper.putStatement(stmt, stmt.id, null, att)
            .then((res) => {
              res.resp.status.should.eql(NO_CONTENT);
            });
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.putStatement(stmt, stmt.id, (error, resp, data) => {
            resp.status.should.eql(NO_CONTENT);
            data.id.should.eql(stmt.id);

            done();
          }, att);
        });
      });
    });
    describe("POST", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.postStatement(s1);
        res.resp.status.should.eql(OK);
        res.resp.ok.should.eql(true);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        try {
          let res = await XAPIWrapper.postStatement(null);
        } catch (e) {
          e.should.not.eql(null);
        }
      });
      it("should fail sending array with callback", (done) => {
        XAPIWrapper.postStatement([new Statement(s1)], (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      describe("Multiple Statements", () => {
        it("should pass sending statements asynchronously", async () => {
          let stmts=[new Statement(s1), new Statement(s2)];
          let res = await XAPIWrapper.postStatements(stmts);
          res.resp.status.should.eql(OK);
          res.resp.ok.should.eql(true);
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
                "usageType":"http://adlnet.gov/expapi/attachments/test",
                "display":{"en-US": "Test Attachment"},
                "description":{"en-US":"a test attachment for statement requests"},
                "contentType":"application/octet-stream"
              }
            }
          ]

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          await XAPIWrapper.postStatement(stmt, null, att)
            .then((res) => {
              res.resp.status.should.eql(OK);
            });
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.postStatement(stmt, (error, resp, data) => {
            resp.status.should.eql(OK);

            done();
          }, att);
        });
      });
    });
    describe("GET", () => {
      it("should return list of statements asynchronously", async () => {
        let res = await XAPIWrapper.getStatements();
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
      });
      it("should return list of statements with callback", (done) => {
        XAPIWrapper.getStatements(null, null, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          data.should.not.eql(null);

          done();
        });
      });
      it("should return single statement asynchronously", async () => {
        let res = await XAPIWrapper.getStatements({"limit":1});
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
      });
      it("should return single statement using id asynchronously", async () => {
        let stmt = new Statement(s1);
        let id = stmt['id'];
        await XAPIWrapper.postStatement(stmt)
          .then((res) => {
            return XAPIWrapper.getStatements({"statementId":id})
              .then((res) => {
                res.data.id.should.eql(id);
              });
          });
      });
      describe("More Statements", () => {
        it("should return list of statements with no additional call", (done) => {
          XAPIWrapper.getMoreStatements(0, (error, resp, data) => {
            (Array.isArray(data)).should.eql(true);
            data.length.should.not.eql(0);

            done();
          });
        });
        it("should return single statement with no additional call", (done) => {
          XAPIWrapper.getMoreStatements(0, (error, resp, data) => {
            (Array.isArray(data)).should.eql(true);
            data.length.should.eql(1);

            done();
          }, {"limit":1});
        });
      });
    });
  });

  describe("State", () => {
    let actId, agent, stateId, stateVal;

    before(() => {
      actId = 'http://adlnet.gov/expapi/activities/attempted';
      agent = {'mbox':'mailto:a@example.com'};
      stateId = 'attemptedstate';
      stateVal = {'info': 'the state info'};
    });

    describe("PUT", () => {
      it("should pass sending default state asynchronously", async () => {
        let res = await XAPIWrapper.putState(actId, agent, stateId, null, stateVal);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
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
      it("should pass updating state asynchronously", async () => {
        let newState = {'info': 'the new updated state info'};
        let res = await XAPIWrapper.putState(actId, agent, stateId, null, newState);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
      });
      it("should fail sending null stateval parameter asynchronously", async () => {
        XAPIWrapper.putState(actId, agent, stateId, null, null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          })
      });
    });
    describe("POST", () => {
      it("should pass sending state asynchronously", async () => {
        let res = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, stateId, null, stateVal);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
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
      it("should fail sending null stateval parameter asynchronously", async () => {
        try {
          let res = await XAPIWrapper.postState(actId, agent, stateId, null, null);
        } catch (e) {
          e.should.not.eql(null);
        }
      });
    });
    describe("GET", () => {
      it("should return list of state id's using activity/agent asynchronously", async () => {
        let res = await XAPIWrapper.getState(actId, agent);
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
      });
      it("should return list of state id's using activity/agent with callback", (done) => {
        XAPIWrapper.getState(actId, agent, null, null, null, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          data.should.not.eql(null);

          done();
        });
      });
      it("should return list of state id's using different agent asynchronously", async () => {
        let res = await XAPIWrapper.getState(actId, {'mbox':'mailto:aaron@example.com'});
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
      });
      it("should return list of state id's using since parameter asynchronously", async () => {
        let date = "2017-06-26T11:45:28.297971+00:00";
        let res = await XAPIWrapper.getState(actId, agent, null, null, date);
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
      });
      it("should return empty list using present since parameter asynchronously", async () => {
        let date = (new Date()).toISOString();
        let res = await XAPIWrapper.getState(actId, agent, null, null, date);
        res.resp.status.should.eql(OK);
        res.data.should.not.eql(null);
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
      it("should return single state using state id parameter asynchronously", async () => {
        await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate", null, stateVal)
          .then((res) => {
            return XAPIWrapper.getState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate")
              .then((res) => {
                res.resp.status.should.eql(OK);
                res.data.should.not.eql(null);
              });
          });
      });
      it("should fail using invalid activity id or agent asynchronously", async () => {
        try {
          let res = await XAPIWrapper.getState(actId);
        } catch (e) {
          e.should.not.eql(null);
        }
      });
    });
    describe("DELETE", () => {
      it("should delete specified state using activityId/agent parameters asynchronously", async () => {
        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
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
      it("should delete specified state using state id parameter asynchronously", async () => {
        let post = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', null, stateVal);

        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate');
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
      });
      it("should delete specified state using registration id parameter asynchronously", async () => {
        let id = Util.ruuid();
        let post = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', id, stateVal);

        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, null, id);
        res.resp.status.should.eql(NO_CONTENT);
        res.resp.ok.should.eql(true);
      });
      it("should fail using invalid activity id or agent parameters asynchronously", async () => {
        try {
          let res = await XAPIWrapper.deleteState(null, agent);
        } catch (e) {
          e.should.not.eql(null);
        }
      });
    });
  });

  describe("Activities", () => {
    it("should return activity object asynchronously", async () => {
      await XAPIWrapper.getActivities('http://activity.com/id')
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
    it("should fail using invalid activity object asynchronously", async () => {
      try {
        let res = await XAPIWrapper.getActivities('adlnet.gov/expapi/activities/question');
      } catch (e) {
        e.should.not.eql(null);
      }
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
      profileVal1 = {"activityId":activityId1, "profileId":profileId1};

      activityId2 = 'http://www.example.com/activityId/hashset2';
      profileId2 = Util.ruuid();
      profileVal2 = {"activityId":activityId2, "profileId":profileId2};
    });

    describe("PUT", () => {
      describe("If-None-Match", () => {
        it("should pass storing new profile if none exist", async () => {
          await XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "*")
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
        it("should pass storing new profile with etag if none exist", async () => {
          etag = XAPIWrapper.hash(JSON.stringify(profileVal2));
          await XAPIWrapper.putActivityProfile(activityId2, profileId2, profileVal2, IF_NONE_MATCH, etag)
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
        it("should fail storing existing profile", async () => {
          await XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "*")
            .catch((error) => {
              error.should.eql(PRE_COND_FAILED);
            });
        });
      });
      describe("If-Match", () => {
        it("should pass updating existing profile", async () => {
          let profile = profileVal1;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putActivityProfile(activityId1, profileId1, profile, IF_MATCH, "*")
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
        it("should pass updating existing profile with ETag", async () => {
          let profile = profileVal2;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putActivityProfile(activityId2, profileId2, profile, IF_MATCH, etag)
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
        it("should fail updating existing profile with invalid etag", async () => {
          let profile = profileVal1;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putActivityProfile(activityId1, profileId1, profile, IF_MATCH, "1234567891234567891212345678912345678912")
            .catch((error) => {
              error.should.eql(PRE_COND_FAILED);
            });
        });
      });
      it("should fail sending profile using invalid activityId", async () => {
        XAPIWrapper.putActivityProfile(null, profileId1, profileVal1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using invalid profileId", async () => {
        XAPIWrapper.putActivityProfile(activityId1, null, profileVal1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending invalid profile object", async () => {
        XAPIWrapper.putActivityProfile(activityId1, profileId1, null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using both ETag headers", async () => {
        XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, `${IF_NONE_MATCH}${IF_MATCH}`, "*")
          .catch((error) => {
            error.should.eql(INVALID_ETAG_HEADER);
          });
      });
      it("should fail sending profile using invalid ETag hash", async () => {
        XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, IF_NONE_MATCH, "")
          .catch((error) => {
            error.should.eql(INVALID_ETAG_HASH);
          });
      });
      it("should fail sending profile using invalid ETag header", async () => {
        XAPIWrapper.putActivityProfile(activityId1, profileId1, profileVal1, "", "*")
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
      it("should pass storing profile if none exist", async () => {
        await XAPIWrapper.postActivityProfile(activityId1, profileId1, profileVal1)
          .then((res) => {
            res.resp.status.should.eql(NO_CONTENT);

            return XAPIWrapper.getActivityProfile(activityId1, profileId1)
              .then((res) => {
                res.data.should.eql(profileVal1);
                res.resp.headers._headers['etag'].should.not.eql(null);
              });
          });
      });
      it("should pass merging profiles", async () => {
        let profile = {newProp: "New property"};
        await XAPIWrapper.postActivityProfile(activityId1, profileId1, profile)
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
      it("should fail sending profile using invalid activityId", async () => {
        XAPIWrapper.postActivityProfile(null, profileId1, profileVal1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using invalid profileId", async () => {
        XAPIWrapper.postActivityProfile(activityId1, null, profileVal1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending invalid profile object", async () => {
        XAPIWrapper.postActivityProfile(activityId1, profileId1, null)
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
          {"activityId":'http://www.example.com/activityId/1', "profileId":Util.ruuid()},
          {"activityId":'http://www.example.com/activityId/1', "profileId":Util.ruuid()},
          {"activityId":'http://www.example.com/activityId/1', "profileId":Util.ruuid()}
        ];
        date = new Date().toISOString();
        XAPIWrapper.postActivityProfile(prof[0].activityId, prof[0].profileId, prof[0]);
        XAPIWrapper.postActivityProfile(prof[1].activityId, prof[1].profileId, prof[1]);
        XAPIWrapper.postActivityProfile(prof[2].activityId, prof[2].profileId, prof[2]);
      });

      it("should return single activity profile using valid activity/profile IDs", async () => {
        await XAPIWrapper.getActivityProfile(prof[0].activityId, prof[0].profileId)
          .then((res) => {
            res.data['activityId'].should.eql(prof[0].activityId);
            res.data['profileId'].should.eql(prof[0].profileId);
          });
      });
      it("should return list of profile IDs using valid activityId & no profileId", async () => {
        await XAPIWrapper.getActivityProfile(prof[0].activityId)
          .then((res) => {
            (Array.isArray(res.data)).should.eql(true);
            (res.data.length).should.not.eql(0);
          });
      });
      it("should return single activity profile using valid activity/profile IDs & timestamp", async () => {
        await XAPIWrapper.getActivityProfile(prof[0].activityId, prof[0].profileId, date)
          .then((res) => {
            res.data['activityId'].should.eql(prof[0].activityId);
            res.data['profileId'].should.eql(prof[0].profileId);
          });
      });
      it("should return list of profile IDs using valid activityId & timestamp", async () => {
        await XAPIWrapper.getActivityProfile(prof[0].activityId, null, date)
          .then((res) => {
            (Array.isArray(res.data)).should.eql(true);
            (res.data.length).should.not.eql(0);
          });
      });
      it("should fail using invalid activityId", async () => {
        await XAPIWrapper.getActivityProfile(null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail using invalid 'since' timestamp", async () => {
        await XAPIWrapper.getActivityProfile(activityId1, profileId1, {})
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
      it("should pass deleting the profile using valid activity/profile IDs", async () => {
        await XAPIWrapper.deleteActivityProfile(activityId1, profileId1)
          .then((res) => {
            res.resp.status.should.eql(NO_CONTENT);

            return XAPIWrapper.getActivityProfile(activityId1, profileId1)
              .catch((error) => {
                error.name.should.eql('FetchError');
              });
          });
      });
      it("should fail deleting the profile using invalid activityId", async () => {
        await XAPIWrapper.deleteActivityProfile(null, profileId1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail deleting the profile using invalid profileId", async () => {
        await XAPIWrapper.deleteActivityProfile(activityId1, null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
    });
  });

  describe("Agents", () => {
    it("should return person object asynchronously", async () => {
      let res = await XAPIWrapper.getAgents({'mbox':'mailto:a@example.com'});
      res.resp.status.should.eql(OK);
      res.data.should.not.eql(null);
    });
    it("should return person object with callback", (done) => {
      XAPIWrapper.getAgents({'mbox':'mailto:a@example.com'}, (error, resp, data) => {
        if (error) {
          console.log(error);
        } else {
          (resp.status).should.eql(OK);
        }

        done();
      });
    });
    it("should fail using invalid agent asynchronously", async () => {
      try {
        let res = await XAPIWrapper.getAgents({'mbox':'mailto:wrong@example.com'});
      } catch (e) {
        e.should.not.eql(null);
      }
    });
    it("should fail using null agent parameter asynchronously", async () => {
      try {
        let res = await XAPIWrapper.getAgents(null);
      } catch (e) {
        e.should.not.eql(null);
      }
    });
  });

  describe("Agent Profile", () => {
    let agent1, profileId1, profile1;
    let agent2, profileId2, profile2;
    let etag;

    before(() => {
      agent1 = {"mbox":"mailto:user@example.com"};
      profileId1 = Util.ruuid();
      profile1 = {"agent":agent1, "profileId":profileId1};

      agent2 = {
        "account": {
          "homePage": "http://www.example.com/agentId2",
          "name": "Agent2"
        }
      };
      profileId2 = Util.ruuid();
      profile2 = {"agent":agent2, "profileId":profileId2};
    });

    describe("PUT", () => {
      describe("If-None-Match", () => {
        it("should pass storing new profile if none exist", async () => {
          await XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "*")
            .then((res) => {
              res.resp.status.should.eql(NO_CONTENT);

              return XAPIWrapper.getAgentProfile(agent1, profileId1)
                .then((res) => {
                  res.data.should.eql(profile1);
                  res.resp.headers._headers['etag'].should.not.eql(null);
                });
            });
        });
        it("should pass storing new profile with etag if none exist", async () => {
          etag = XAPIWrapper.hash(JSON.stringify(profile2));
          await XAPIWrapper.putAgentProfile(agent2, profileId2, profile2, IF_NONE_MATCH, etag)
            .then((res) => {
              res.resp.status.should.eql(NO_CONTENT);

              return XAPIWrapper.getAgentProfile(agent2, profileId2)
                .then((res) => {
                  res.data.should.eql(profile2);
                  res.resp.headers._headers['etag'][0].should.eql(`"${etag}"`);
                });
            });
        });
        it("should fail storing existing profile", async () => {
          await XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "*")
            .catch((error) => {
              error.should.eql(PRE_COND_FAILED);
            });
        });
      });
      describe("If-Match", () => {
        it("should pass updating existing profile", async () => {
          let profile = profile1;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putAgentProfile(agent1, profileId1, profile, IF_MATCH, "*")
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
        it("should pass updating existing profile with ETag", async () => {
          let profile = profile2;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putAgentProfile(agent2, profileId2, profile, IF_MATCH, etag)
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
        it("should fail updating existing profile with invalid etag", async () => {
          let profile = profile1;
          profile.profileId = Util.ruuid();
          await XAPIWrapper.putAgentProfile(agent1, profileId1, profile, IF_MATCH, "1234567891234567891212345678912345678912")
            .catch((error) => {
              error.should.eql(PRE_COND_FAILED);
            });
        });
      });
      it("should fail sending profile using invalid agent", async () => {
        XAPIWrapper.putAgentProfile(null, profileId1, profile1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using invalid profileId", async () => {
        XAPIWrapper.putAgentProfile(agent1, null, profile1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending invalid profile object", async () => {
        XAPIWrapper.putAgentProfile(agent1, profileId1, null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using both ETag headers", async () => {
        XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, `${IF_NONE_MATCH}${IF_MATCH}`, "*")
          .catch((error) => {
            error.should.eql(INVALID_ETAG_HEADER);
          });
      });
      it("should fail sending profile using invalid ETag hash", async () => {
        XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, IF_NONE_MATCH, "")
          .catch((error) => {
            error.should.eql(INVALID_ETAG_HASH);
          });
      });
      it("should fail sending profile using invalid ETag header", async () => {
        XAPIWrapper.putAgentProfile(agent1, profileId1, profile1, "", "*")
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
      it("should pass storing profile if none exist", async () => {
        await XAPIWrapper.postAgentProfile(agent1, profileId1, profile1)
          .then((res) => {
            res.resp.status.should.eql(NO_CONTENT);

            return XAPIWrapper.getAgentProfile(agent1, profileId1)
              .then((res) => {
                res.data.should.eql(profile1);
                res.resp.headers._headers['etag'].should.not.eql(null);
              });
          });
      });
      it("should pass merging profiles", async () => {
        let profile = {newProp: "New property"};
        await XAPIWrapper.postAgentProfile(agent1, profileId1, profile)
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
      it("should fail sending profile using invalid agent", async () => {
        XAPIWrapper.postAgentProfile(null, profileId1, profile1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending profile using invalid profileId", async () => {
        XAPIWrapper.postAgentProfile(agent1, null, profile1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail sending invalid profile object", async () => {
        XAPIWrapper.postAgentProfile(agent1, profileId1, null)
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
          {"agent":{"mbox_sha1sum":agentId}, "profileId":Util.ruuid()},
          {"agent":{"mbox_sha1sum":agentId}, "profileId":Util.ruuid()},
          {"agent":{"mbox_sha1sum":agentId}, "profileId":Util.ruuid()}
        ];
        date = new Date().toISOString();
        XAPIWrapper.postAgentProfile(prof[0].agent, prof[0].profileId, prof[0]);
        XAPIWrapper.postAgentProfile(prof[1].agent, prof[1].profileId, prof[1]);
        XAPIWrapper.postAgentProfile(prof[2].agent, prof[2].profileId, prof[2]);
      });

      it("should return single activity profile using valid agent & profileId", async () => {
        await XAPIWrapper.getAgentProfile(prof[0].agent, prof[0].profileId)
          .then((res) => {
            res.data.should.eql(prof[0]);
          });
      });
      it("should return list of profile IDs using valid agent & no profileId", async () => {
        await XAPIWrapper.getAgentProfile(prof[0].agent)
          .then((res) => {
            (Array.isArray(res.data)).should.eql(true);
            (res.data.length).should.not.eql(0);
          });
      });
      it("should return single activity profile using valid agent, profileId & timestamp", async () => {
        await XAPIWrapper.getAgentProfile(prof[0].agent, prof[0].profileId, date)
          .then((res) => {
            res.data.should.eql(prof[0]);
          });
      });
      it("should return list of profile IDs using valid agent & timestamp", async () => {
        await XAPIWrapper.getAgentProfile(prof[0].agent, null, date)
          .then((res) => {
            (Array.isArray(res.data)).should.eql(true);
            (res.data.length).should.not.eql(0);
          });
      });
      it("should fail using invalid agent", async () => {
        await XAPIWrapper.getAgentProfile(null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail using invalid 'since' timestamp", async () => {
        await XAPIWrapper.getAgentProfile(agent1, profileId1, {})
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
      it("should pass deleting the profile using valid agent & profileId", async () => {
        await XAPIWrapper.deleteAgentProfile(agent1, profileId1)
          .then((res) => {
            res.resp.status.should.eql(NO_CONTENT);

            return XAPIWrapper.getAgentProfile(agent1, profileId1)
              .catch((error) => {
                error.name.should.eql('FetchError');
              });
          });
      });
      it("should fail deleting the profile using invalid agent", async () => {
        await XAPIWrapper.deleteAgentProfile(null, profileId1)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
      it("should fail deleting the profile using invalid profileId", async () => {
        await XAPIWrapper.deleteAgentProfile(agent1, null)
          .catch((error) => {
            error.should.eql(INVALID_PARAMETERS);
          });
      });
    });
  });

  describe("No Strict Callbacks", () => {
      let stmt;
      before(() => {
          XAPIWrapper.changeConfig({
              "endpoint": "https://lrs.adlnet.gov/xapi/",
              "user": "aaron",
              "password": "1234",
              "strictCallbacks": false
          });
          stmt = new Statement({
              'actor': { 'mbox': 'mailto:user@example.com' },
              'verb': { 'id': 'http://adlnet.gov/expapi/verbs/attempted' },
              'object': { 'id': 'http://activity.com/id' }
          });
      });

      it("should return 2 parameters(resp, data) with valid request", (done) => {
          XAPIWrapper.postStatement(stmt, (resp, data) => {
              resp.should.be.type('object');
              resp.status.should.eql(OK);
              data.should.not.eql(null);

              done();
          });
      });
      it("should return 2 parameters(resp, data) with valid request & callback args", (done) => {
          let id = Util.ruuid();
          XAPIWrapper.putStatement(new Statement(stmt), id, (resp, data) => {
              resp.should.be.type('object');
              resp.status.should.eql(NO_CONTENT);
              data.id.should.eql(id)

              done();
          });
      });
      it("should return single error parameter with invalid request", (done) => {
          stmt.id = "2";
          XAPIWrapper.postStatement(stmt, (resp, data) => {
              (resp.type==='invalid-json').should.eql(true);
              ("undefined").should.eql(`${data}`);

              done();
          });
      });
  });

});
