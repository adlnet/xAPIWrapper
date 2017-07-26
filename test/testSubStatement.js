describe("SubStatement Test:", () => {
  // Substatement objects to test
  let activityObj, agentObj, groupObj, refObj;

  // Default statement objects for easy testing
  let defActor, defVerb, defAgent, defGroup, defActivity, defRef;

  // Invalid objects for fail testing
  let typeOnly, noActor, noVerb, noObject, subObject, invalidProps;

  let actor = {'mbox':'mailto:a@example.com'};

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Util, Statement, SubStatement, StatementRef, verbs;

  // Test statements
  let s1, s2, s3, s4;

  before(() => {
    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Util = require('./../src/Utils.js');
    Statement = require('./../src/statement').Statement;
    SubStatement = require('./../src/statement').SubStatement;
    StatementRef = require('./../src/object').StatementRef;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });


    // Initialize statement objects
    defActor = {
      "objectType": "Agent",
      "name": "xAPI mbox",
      "mbox":'mailto:xapi@example.com'
    }
    defVerb = verbs.attempted
    defAgent = {
      "objectType": "Agent",
      "name": "xAPI mbox_sha1sum",
      "mbox_sha1sum": "169fd15497b877fae1a3e1a67cb0b6064ebc2da5"
    }
    defGroup = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox": "mailto:xapigroup@example.com"
    }
    defActivity = {
      "objectType": "Activity",
      "id": "http://example.adlnet.gov/xapi/example/activity"
    }
    defRef = {
      "objectType": "StatementRef",
      "id": "12345678-1234-5678-1234-567812345678"
    }

    // Initialize substatement objects
    activityObj = {
      "objectType": "SubStatement",
      "actor": defActor,
      "verb": defVerb,
      "object": defActivity
    }
    agentObj = {
      "objectType": "SubStatement",
      "actor": defActor,
      "verb": defVerb,
      "object": defAgent
    }
    groupObj = {
      "objectType": "SubStatement",
      "actor": defActor,
      "verb": defVerb,
      "object": defGroup
    }
    refObj = {
      "objectType": "SubStatement",
      "actor": defActor,
      "verb": defVerb,
      "object": defRef
    }

    // Initialize statements
    s1 = new Statement(actor, verbs.initialized, activityObj);
    s2 = new Statement(actor, verbs.initialized, agentObj);
    s3 = new Statement(actor, verbs.initialized, groupObj);
    s4 = new Statement(actor, verbs.initialized, refObj);
  });

  describe("SubStatement constructor test:", () => {
    it("should pass with valid actor, verb & object", () => {
      ((new SubStatement(defActor, defVerb, defActivity)).isValid()).should.eql(true)
    });
    it("should fail with invalid actor & valid verb, object", () => {
      (!(new SubStatement(null, defVerb, defActivity)).isValid()).should.eql(true);
    });
    it("should fail with invalid verb & valid actor, object", () => {
      (!(new SubStatement(defActor, null, defActivity)).isValid()).should.eql(true);
    });
    it("should fail with invalid object & valid actor, verb", () => {
      (!(new SubStatement(defActor, defVerb, null)).isValid()).should.eql(true);
    });
    it("should fail using substatement as object", () => {
      (!(new SubStatement(defActor, defVerb, activityObj)).isValid()).should.eql(true);
    });
    it("should fail with empty parameters", () => {
      (!(new SubStatement()).isValid()).should.eql(true);
    });
    it("should pass when retrieving display objects", () => {
      (s1.object.getDisplay()).should.not.eql(null);
      (s2.object.getDisplay()).should.not.eql(null);
      (s3.object.getDisplay()).should.not.eql(null);
      (s4.object.getDisplay()).should.not.eql(null);
    });
  });

  describe("JSON Object as statement object:", () => {
    it("should pass calling isValid() on substatement objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(true);
      (s3.object.isValid()).should.eql(true);
      (s4.object.isValid()).should.eql(true);
    });
    describe("Activity object", () => {
      it('should pass using valid activity substatement object', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Agent object", () => {
      it('should pass using valid agent as substatement object', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Group object", () => {
      it('should pass using valid group as substatement object', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("StatementRef object", () => {
      it('should pass using valid statementref as substatement object', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("SubStatement object", () => {

    });
  });

  describe("SubStatement Object as statement object:", () => {
    before(() => {

    });

  });

});
