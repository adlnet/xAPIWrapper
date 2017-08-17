describe("SubStatement Test:", () => {
  // Substatement objects to test
  let def, noActor, noVerb, noObject, invActor, invAct, invVerb,
      invAgent, invGroup, invStmtRef, objSubStmt, agent, group,
      act, stmtRef, context, result;

  let actor = {'mbox':'mailto:user@example.com'};

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Util, Statement, SubStatement, StatementRef, verbs;

  // Test statements
  let s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11,
      s12, s13, s14, s15, s16, s17;

  // Path
  const DIR = "./templates/substatements/";

  before(() => {
    def = require(`${DIR}default.json`);
    noActor = require(`${DIR}no_actor.json`);
    noVerb = require(`${DIR}no_verb.json`);
    noObject = require(`${DIR}no_object.json`);
    invActor = require(`${DIR}invalid_actor.json`);
    invAct = require(`${DIR}invalid_activity.json`);
    invVerb = require(`${DIR}invalid_verb.json`);
    invAgent = require(`${DIR}invalid_agent.json`);
    invGroup = require(`${DIR}invalid_group.json`);
    invStmtRef = require(`${DIR}invalid_statementref.json`);
    objSubStmt = require(`${DIR}object_substatement.json`);
    agent = require(`${DIR}agent.json`);
    group = require(`${DIR}group.json`);
    act = require(`${DIR}activity.json`);
    stmtRef = require(`${DIR}statementref.json`);
    context = require(`${DIR}context.json`);
    result = require(`${DIR}result.json`);

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

    // Initialize statements
    s1 = new Statement(actor, verbs.initialized, def);
    s2 = new Statement(actor, verbs.initialized, noActor);
    s3 = new Statement(actor, verbs.initialized, noVerb);
    s4 = new Statement(actor, verbs.initialized, noObject);
    s5 = new Statement(actor, verbs.initialized, invActor);
    s6 = new Statement(actor, verbs.initialized, invAct);
    s7 = new Statement(actor, verbs.initialized, invVerb);
    s8 = new Statement(actor, verbs.initialized, invAgent);
    s9 = new Statement(actor, verbs.initialized, invGroup);
    s10 = new Statement(actor, verbs.initialized, invStmtRef);
    s11 = new Statement(actor, verbs.initialized, objSubStmt);
    s12 = new Statement(actor, verbs.initialized, agent);
    s13 = new Statement(actor, verbs.initialized, group);
    s14 = new Statement(actor, verbs.initialized, act);
    s15 = new Statement(actor, verbs.initialized, stmtRef);
    s16 = new Statement(actor, verbs.initialized, context);
    s17 = new Statement(actor, verbs.initialized, result);
  });

  describe("SubStatement constructor test:", () => {
    it("should pass with valid actor, verb & object", () => {
      ((new SubStatement(def.actor, def.verb, def.object)).isValid()).should.eql(true)
    });
    it("should fail with invalid actor & valid verb, object", () => {
      ((new SubStatement(null, def.verb, def.object)).isValid()).should.eql(false);
    });
    it("should fail with invalid verb & valid actor, object", () => {
      ((new SubStatement(def.actor, null, def.object)).isValid()).should.eql(false);
    });
    it("should fail with invalid object & valid actor, verb", () => {
      ((new SubStatement(def.actor, def.verb, null)).isValid()).should.eql(false);
    });
    it("should fail using substatement as object", () => {
      ((new SubStatement(def.actor, def.verb, objSubStmt.object)).isValid()).should.eql(false);
    });
    it("should fail with empty parameters", () => {
      ((new SubStatement()).isValid()).should.eql(false);
    });
    it("should pass when retrieving display objects", () => {
      (s1.object.getDisplay()).should.not.eql(null);
      (!s2.object.getDisplay()).should.eql(true);
      (!s3.object.getDisplay()).should.eql(true);
      (!s4.object.getDisplay()).should.eql(true);
      (!s5.object.getDisplay()).should.eql(true);
      (!s6.object.getDisplay()).should.eql(true);
      (!s7.object.getDisplay()).should.eql(true);
      (!s8.object.getDisplay()).should.eql(true);
      (!s9.object.getDisplay()).should.eql(true);
      (!s10.object.getDisplay()).should.eql(true);
      (!s11.object.getDisplay()).should.eql(true);
      (s12.object.getDisplay()).should.not.eql(null);
      (s13.object.getDisplay()).should.not.eql(null);
      (s14.object.getDisplay()).should.not.eql(null);
      (s15.object.getDisplay()).should.not.eql(null);
      (s16.object.getDisplay()).should.not.eql(null);
      (s17.object.getDisplay()).should.not.eql(null);
    });
  });

  describe("JSON Object as statement object:", () => {
    it("should pass calling isValid() on substatement objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(false);
      (s4.object.isValid()).should.eql(false);
      (s5.object.isValid()).should.eql(false);
      (s6.object.isValid()).should.eql(false);
      (s7.object.isValid()).should.eql(false);
      (s8.object.isValid()).should.eql(false);
      (s9.object.isValid()).should.eql(false);
      (s10.object.isValid()).should.eql(false);
      (s11.object.isValid()).should.eql(false);
      (s12.object.isValid()).should.eql(true);
      (s13.object.isValid()).should.eql(true);
      (s14.object.isValid()).should.eql(true);
      (s15.object.isValid()).should.eql(true);
      (s16.object.isValid()).should.eql(true);
      (s17.object.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it("should pass with valid default actor/verb/object", (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Actor", () => {
      it("should fail with no actor", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid actor", (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Verb", () => {
      it("should fail with no verb", (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid verb", (done) => {
        XAPIWrapper.postStatement(s7, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Object", () => {
      it("should fail with no object", (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid activity", (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid agent object", (done) => {
        XAPIWrapper.postStatement(s8, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid group object", (done) => {
        XAPIWrapper.postStatement(s9, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid statementref object", (done) => {
        XAPIWrapper.postStatement(s10, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with nested substatement object", (done) => {
        XAPIWrapper.postStatement(s11, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should pass with valid agent object", (done) => {
        XAPIWrapper.postStatement(s12, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid group object", (done) => {
        XAPIWrapper.postStatement(s13, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid activity object", (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid statementref object", (done) => {
        XAPIWrapper.postStatement(s15, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    it("should pass with valid context", (done) => {
      XAPIWrapper.postStatement(s16, (error, resp, data) => {
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
    it("should pass with valid results", (done) => {
      XAPIWrapper.postStatement(s17, (error, resp, data) => {
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
  });

  describe("SubStatement Object as statement object:", () => {
    before(() => {
      s1 = new Statement(actor, verbs.initialized, new SubStatement(def));
      s2 = new Statement(actor, verbs.initialized, new SubStatement(noActor));
      s3 = new Statement(actor, verbs.initialized, new SubStatement(noVerb));
      s4 = new Statement(actor, verbs.initialized, new SubStatement(noObject));
      s5 = new Statement(actor, verbs.initialized, new SubStatement(invActor));
      s6 = new Statement(actor, verbs.initialized, new SubStatement(invAct));
      s7 = new Statement(actor, verbs.initialized, new SubStatement(invVerb));
      s8 = new Statement(actor, verbs.initialized, new SubStatement(invAgent));
      s9 = new Statement(actor, verbs.initialized, new SubStatement(invGroup));
      s10 = new Statement(actor, verbs.initialized, new SubStatement(invStmtRef));
      s11 = new Statement(actor, verbs.initialized, new SubStatement(objSubStmt));
      s12 = new Statement(actor, verbs.initialized, new SubStatement(agent));
      s13 = new Statement(actor, verbs.initialized, new SubStatement(group));
      s14 = new Statement(actor, verbs.initialized, new SubStatement(act));
      s15 = new Statement(actor, verbs.initialized, new SubStatement(stmtRef));
      s16 = new Statement(actor, verbs.initialized, new SubStatement(context));
      s17 = new Statement(actor, verbs.initialized, new SubStatement(result));
    });

    it("should pass calling isValid() on substatement objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(false);
      (s4.object.isValid()).should.eql(false);
      (s5.object.isValid()).should.eql(false);
      (s6.object.isValid()).should.eql(false);
      (s7.object.isValid()).should.eql(false);
      (s8.object.isValid()).should.eql(false);
      (s9.object.isValid()).should.eql(false);
      (s10.object.isValid()).should.eql(false);
      (s11.object.isValid()).should.eql(false);
      (s12.object.isValid()).should.eql(true);
      (s13.object.isValid()).should.eql(true);
      (s14.object.isValid()).should.eql(true);
      (s15.object.isValid()).should.eql(true);
      (s16.object.isValid()).should.eql(true);
      (s17.object.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it("should pass with valid default actor/verb/object", (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Actor", () => {
      it("should fail with no actor", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid actor", (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Verb", () => {
      it("should fail with no verb", (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid verb", (done) => {
        XAPIWrapper.postStatement(s7, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Object", () => {
      it("should fail with no object", (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid activity", (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid agent object", (done) => {
        XAPIWrapper.postStatement(s8, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid group object", (done) => {
        XAPIWrapper.postStatement(s9, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with invalid statementref object", (done) => {
        XAPIWrapper.postStatement(s10, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should fail with nested substatement object", (done) => {
        XAPIWrapper.postStatement(s11, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it("should pass with valid agent object", (done) => {
        XAPIWrapper.postStatement(s12, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid group object", (done) => {
        XAPIWrapper.postStatement(s13, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid activity object", (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should pass with valid statementref object", (done) => {
        XAPIWrapper.postStatement(s15, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    it("should pass with valid context", (done) => {
      XAPIWrapper.postStatement(s16, (error, resp, data) => {
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
    it("should pass with valid results", (done) => {
      XAPIWrapper.postStatement(s17, (error, resp, data) => {
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
  });

});
