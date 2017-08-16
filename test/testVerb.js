describe("Verb Test:", () => {
  // Verb objects to test
  let def, noDisplay, noId;

  // Testing module functionality
  let should, XAPIWrapper, Util, Verb, Statement, verbs;

  let objId = 'http://activity.com/id';

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Test statements
  let s1, s2, s3;


  before(() => {
    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Util = require('./../src/Utils.js');
    Verb = require('./../src/Verb');
    Statement = require('./../src/Statement').Statement;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });

    def = verbs.attempted;
    noDisplay = { "id": verbs.registered.id };
    noId = { "display": verbs.suspended.display };

    // Test statements
    s1 = new Statement('mailto:aaron@example.com', def, objId);
    s2 = new Statement('mailto:aaron@example.com', noDisplay, objId);
    s3 = new Statement('mailto:aaron@example.com', noId, objId);
  });

  describe("Verb constructor test:", () => {
    it("should pass with valid id & description", () => {
      ((new Verb(def.id, def.display)).isValid()).should.eql(true);
    });
    it("should fail with invalid id & valid description", () => {
      ((new Verb(null, def.display)).isValid()).should.eql(false);
    });
    it("should fail with empty parameters", () => {
      ((new Verb()).isValid()).should.eql(false);
    });
    it("should pass when retrieving display objects", () => {
      (s1.verb.getDisplay()).should.eql(Util.getLangVal(def.display));
      (s2.verb.getDisplay()).should.eql(noDisplay.id);
      (!s3.verb.getDisplay()).should.eql(true);
    });
  });

  describe("JSON Object as statement verb:", () => {
    it("should pass calling isValid() on verb objects", () => {
      (s1.verb.isValid()).should.eql(true);
      (s2.verb.isValid()).should.eql(true);
      (s3.verb.isValid()).should.eql(false);
    });
    describe("Default", (done) => {
      it('should pass with valid id & display', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("No Display", (done) => {
      it('should pass with no display & valid id', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("No ID", (done) => {
      it('should fail with no id & valid display', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
  });

  describe("Verb Object as statement verb:", () => {
    before(() => {
      s1 = new Statement('mailto:aaron@example.com', new Verb(def), objId);
      s2 = new Statement('mailto:aaron@example.com', new Verb(noDisplay), objId);
      s3 = new Statement('mailto:aaron@example.com', new Verb(noId), objId);
    });

    it("should pass calling isValid() on verb objects", () => {
      (s1.verb.isValid()).should.eql(true);
      (s2.verb.isValid()).should.eql(true);
      (s3.verb.isValid()).should.eql(false);
    });
    describe("Default", (done) => {
      it('should pass with valid id & display', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("No Display", (done) => {
      it('should pass with no display & valid id', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("No ID", (done) => {
      it('should fail with no id & valid display', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
  });
});
