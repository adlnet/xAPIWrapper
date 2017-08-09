describe("Activity Test:", () => {
  // Activities to test
  let def, noId, noName, noDesc, noDef;

  let trueFalse, choice, fillIn, longFillIn, match,
      peform, seq, like, num, other;

  let actor = {'mbox':'mailto:a@example.com'};

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Activity, Statement, verbs;

  // Test statements
  let s1, s2, s3, s4, s5, s6;

  // Path
  const DIR = "./templates/activities/";


  before(() => {
    def = require(`${DIR}default.json`);
    noId = require(`${DIR}no_id.json`);
    noName = require(`${DIR}no_name.json`);
    noDesc = require(`${DIR}no_description.json`);
    noDef = require(`${DIR}no_definition.json`);

    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Activity = require('./../src/Object').Activity;
    Statement = require('./../src/Statement').Statement;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });

    s1 = new Statement(actor, verbs.attempted, def);
    s2 = new Statement(actor, verbs.attempted, noId);
    s3 = new Statement(actor, verbs.attempted, noName);
    s4 = new Statement(actor, verbs.attempted, noDesc);
    s5 = new Statement(actor, verbs.attempted, noDef);
  });

  describe("Activity constructor test:", () => {
    it("should pass with valid id string only", () => {
      ((new Activity(def.id)).isValid()).should.eql(true);
    });
    it("should fail with invalid id & valid definition", () => {
      (!(new Activity("", def.definition.name, def.definition.description)).isValid()).should.eql(true);
    });
    it("should fail with empty parameters", () => {
      (!(new Activity()).isValid()).should.eql(true);
    });
    it("should pass when retrieving display objects", () => {
      (s1.object.getDisplay()).should.not.eql(null);
      (!s2.object.getDisplay()).should.eql(true);
      (s3.object.getDisplay()).should.eql(noName.id);
      (s4.object.getDisplay()).should.not.eql(null);
      (s5.object.getDisplay()).should.eql(noDef.id);
    });
  });

  describe("JSON Object as statement object:", () => {
    it("should pass calling isValid() on activity objects", () => {
      (s1.object.isValid()).should.eql(true);
      (!s2.object.isValid()).should.eql(true);
      (s3.object.isValid()).should.eql(true);
      (s4.object.isValid()).should.eql(true);
      (s5.object.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it('should pass with valid id & definition', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should fail with no id', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Name/Description", () => {
      it('should pass with no definition name', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with no definition description', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with no definition', (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });

    describe.skip("Definition", () => {
      it("", (done) => {

      });
    });
    describe.skip("Interaction Types", () => {
      it('should pass with valid true/false type', (done) => {

      });
      it('should pass with valid choice type', (done) => {

      });
      it('should pass with valid fill-in type', (done) => {

      });
      it('should pass with valid long fill-in type', (done) => {

      });
      it('should pass with valid match type', (done) => {

      });
      it('should pass with valid performance type', (done) => {

      });
      it('should pass with valid sequence type', (done) => {

      });
      it('should pass with valid likert type', (done) => {

      });
      it('should pass with valid numeric type', (done) => {

      });
      it('should pass with valid other type', (done) => {

      });
    });
  });

  describe("Activity Object as statement object:", () => {
    before(() => {
      s1 = new Statement(actor, verbs.attempted, new Activity(def));
      s2 = new Statement(actor, verbs.attempted, new Activity(noId));
      s3 = new Statement(actor, verbs.attempted, new Activity(noName));
      s4 = new Statement(actor, verbs.attempted, new Activity(noDesc));
      s5 = new Statement(actor, verbs.attempted, new Activity(noDef));
    });

    it("should pass calling isValid() on activity objects", () => {
      (s1.object.isValid()).should.eql(true);
      (!s2.object.isValid()).should.eql(true);
      (s3.object.isValid()).should.eql(true);
      (s4.object.isValid()).should.eql(true);
      (s5.object.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it('should pass with valid id & definition', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should fail with no id', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Name/Description", () => {
      it('should pass with no definition name', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with no definition description', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with no definition', (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
  });
});
