describe("StatementRef Test:", () => {
  // StatementRef objects to test
  let def, invalidId, noId, invalidProp;

  let actor = {'mbox':'mailto:userone@example.com'};

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Util, Statement, StatementRef, verbs;

  // Test statements
  let s1, s2, s3, s4;

  // Path
  const DIR = "./templates/statementrefs/";

  before(() => {
    def = require(`${DIR}default.json`);
    noId = require(`${DIR}no_id.json`);
    invalidId = require(`${DIR}invalid_id.json`);
    invalidProp = require(`${DIR}invalid_property.json`);

    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Util = require('./../src/Utils.js');
    Statement = require('./../src/statement').Statement;
    StatementRef = require('./../src/object').StatementRef;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });

    s1 = new Statement(actor, verbs.attempted, def);
    s2 = new Statement(actor, verbs.attempted, noId);
    s3 = new Statement(actor, verbs.attempted, invalidId);
    s4 = new Statement(actor, verbs.attempted, invalidProp);
  });

  describe("StatementRef constructor test:", () => {
    it("should pass with valid id", () => {
      ((new StatementRef(def.id)).isValid()).should.eql(true);
    });
    it("should fail with empty parameters", () => {
      ((new StatementRef()).isValid()).should.eql(false);
    });
    it("should fail with no id", () => {
      ((new StatementRef(noId)).isValid()).should.eql(false);
    });
    it("should fail with invalid id", () => {
      ((new StatementRef(invalidId)).isValid()).should.eql(false);
    });
    it("should fail with invalid property", () => {
      ((new StatementRef(invalidProp)).isValid()).should.eql(false);
    });
  });

  describe("JSON Object as statement object:", () => {
    it("should pass calling isValid() on statementref objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(false);
      (s4.object.isValid()).should.eql(false);
    });
    it("should pass with valid id", (done) => {
      XAPIWrapper.postStatement(s1, (error, resp, data) => {
        (!error).should.eql(true);
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
    it("should fail with no id", (done) => {
      XAPIWrapper.postStatement(s2, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
    it("should fail with invalid id", (done) => {
      XAPIWrapper.postStatement(s3, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
    it("should fail with invalid property", (done) => {
      XAPIWrapper.postStatement(s4, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
  });

  describe("StatementRef Object as statement object:", () => {
    before(() => {
      s1 = new Statement(actor, verbs.suspended, new StatementRef(def));
      s2 = new Statement(actor, verbs.suspended, new StatementRef(noId));
      s3 = new Statement(actor, verbs.suspended, new StatementRef(invalidId));
      s4 = new Statement(actor, verbs.suspended, new StatementRef(invalidProp));
    });

    it("should pass calling isValid() on statementref objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(false);
      (s4.object.isValid()).should.eql(false);
    });
    it("should pass with valid id & objectType", (done) => {
      XAPIWrapper.postStatement(s1, (error, resp, data) => {
        (!error).should.eql(true);
        resp.status.should.eql(OK);
        resp.ok.should.eql(true);

        done();
      });
    });
    it("should fail with undefined id", (done) => {
      XAPIWrapper.postStatement(s2, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
    it("should fail with invalid id", (done) => {
      XAPIWrapper.postStatement(s3, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
    it("should fail with invalid property", (done) => {
      XAPIWrapper.postStatement(s4, (error, resp, data) => {
        error.should.not.eql(null);

        done();
      });
    });
  });

});
