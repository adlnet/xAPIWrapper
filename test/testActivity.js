describe("Activity Test:", () => {
  // Activities to test
  let def, noId, noName, noDesc, noDef;

  let trueFalse, choice, fillIn, longFillIn, match,
      peform, seq, like, num, other, invIntType, invIntTypeObj, invExt;

  let actor = {'mbox':'mailto:user@example.com'};

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Activity, Statement, verbs;

  // Test statements
  let s1, s2, s3, s4, s5;

  let s6, s7, s8, s9, s10, s11, s12, s13, s14, s15,
      s16, s17, s18;

  // Path
  const DIR = "./templates/activities/";


  before(() => {
    def = require(`${DIR}default.json`);
    noId = require(`${DIR}no_id.json`);
    noName = require(`${DIR}no_name.json`);
    noDesc = require(`${DIR}no_description.json`);
    noDef = require(`${DIR}no_definition.json`);

    trueFalse = require(`${DIR}true_false.json`);
    choice = require(`${DIR}choice.json`);
    fillIn = require(`${DIR}fill_in.json`);
    longFillIn = require(`${DIR}long_fill_in.json`);
    match = require(`${DIR}matching.json`);
    peform = require(`${DIR}performance.json`);
    seq = require(`${DIR}sequencing.json`);
    like = require(`${DIR}likert.json`);
    num = require(`${DIR}numeric.json`);
    other = require(`${DIR}other.json`);
    invIntType = require(`${DIR}invalid_interaction_type.json`);
    invIntTypeObj = require(`${DIR}invalid_interaction_type_object.json`);
    invExt = require(`${DIR}invalid_extension.json`);

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

    s6 = new Statement(actor, verbs.attempted, trueFalse);
    s7 = new Statement(actor, verbs.attempted, choice);
    s8 = new Statement(actor, verbs.attempted, fillIn);
    s9 = new Statement(actor, verbs.attempted, longFillIn);
    s10 = new Statement(actor, verbs.attempted, match);
    s11 = new Statement(actor, verbs.attempted, peform);
    s12 = new Statement(actor, verbs.attempted, seq);
    s13 = new Statement(actor, verbs.attempted, like);
    s14 = new Statement(actor, verbs.attempted, num);
    s15 = new Statement(actor, verbs.attempted, other);
    s16 = new Statement(actor, verbs.attempted, invIntType);
    s17 = new Statement(actor, verbs.attempted, invIntTypeObj);
    s18 = new Statement(actor, verbs.attempted, invExt);
  });

  describe("Activity constructor test:", () => {
    it("should pass with valid id string only", () => {
      ((new Activity(def.id)).isValid()).should.eql(true);
    });
    it("should fail with invalid id & valid definition", () => {
      ((new Activity("", def.definition.name, def.definition.description)).isValid()).should.eql(false);
    });
    it("should fail with empty parameters", () => {
      ((new Activity()).isValid()).should.eql(false);
    });
    it("should pass when retrieving display objects", () => {
      (s1.object.getDisplay()).should.not.eql(null);
      (!s2.object.getDisplay()).should.eql(true);
      (s3.object.getDisplay()).should.eql(noName.id);
      (s4.object.getDisplay()).should.not.eql(null);
      (s5.object.getDisplay()).should.eql(noDef.id);
      (s6.object.getDisplay()).should.not.eql(null);
      (s7.object.getDisplay()).should.not.eql(null);
      (s8.object.getDisplay()).should.not.eql(null);
      (s9.object.getDisplay()).should.not.eql(null);
      (s10.object.getDisplay()).should.not.eql(null);
      (s11.object.getDisplay()).should.not.eql(null);
      (s12.object.getDisplay()).should.not.eql(null);
      (s13.object.getDisplay()).should.not.eql(null);
      (s14.object.getDisplay()).should.not.eql(null);
      (s15.object.getDisplay()).should.not.eql(null);
      (!s16.object.getDisplay()).should.eql(true);
      (!s17.object.getDisplay()).should.eql(true);
      (!s18.object.getDisplay()).should.eql(true);
    });
  });

  describe("JSON Object as statement object:", () => {
    it("should pass calling isValid() on activity objects", () => {
      (s1.object.isValid()).should.eql(true);
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(true);
      (s4.object.isValid()).should.eql(true);
      (s5.object.isValid()).should.eql(true);
    });
    it("should pass calling isValid() on activities with interactions", () => {
      (s6.object.isValid()).should.eql(true);
      (s7.object.isValid()).should.eql(true);
      (s8.object.isValid()).should.eql(true);
      (s9.object.isValid()).should.eql(true);
      (s10.object.isValid()).should.eql(true);
      (s11.object.isValid()).should.eql(true);
      (s12.object.isValid()).should.eql(true);
      (s13.object.isValid()).should.eql(true);
      (s14.object.isValid()).should.eql(true);
      (s15.object.isValid()).should.eql(true);
      (s16.object.isValid()).should.eql(false);
      (s17.object.isValid()).should.eql(false);
      (s18.object.isValid()).should.eql(false);
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
    describe("Interaction Types", () => {
      it('should pass with valid true/false type', (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid choice type', (done) => {
        XAPIWrapper.postStatement(s7, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid fill-in type', (done) => {
        XAPIWrapper.postStatement(s8, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid long-fill-in type', (done) => {
        XAPIWrapper.postStatement(s9, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid matching type', (done) => {
        XAPIWrapper.postStatement(s10, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid performance type', (done) => {
        XAPIWrapper.postStatement(s11, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid sequencing type', (done) => {
        XAPIWrapper.postStatement(s12, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid likert type', (done) => {
        XAPIWrapper.postStatement(s13, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid numeric type', (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should pass with valid other type', (done) => {
        XAPIWrapper.postStatement(s15, (error, resp, data) => {
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
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
      (s2.object.isValid()).should.eql(false);
      (s3.object.isValid()).should.eql(true);
      (s4.object.isValid()).should.eql(true);
      (s5.object.isValid()).should.eql(true);
    });
    it("should pass calling isValid() on activities with interactions", () => {
      (s6.object.isValid()).should.eql(true);
      (s7.object.isValid()).should.eql(true);
      (s8.object.isValid()).should.eql(true);
      (s9.object.isValid()).should.eql(true);
      (s10.object.isValid()).should.eql(true);
      (s11.object.isValid()).should.eql(true);
      (s12.object.isValid()).should.eql(true);
      (s13.object.isValid()).should.eql(true);
      (s14.object.isValid()).should.eql(true);
      (s15.object.isValid()).should.eql(true);
      (s16.object.isValid()).should.eql(false);
      (s17.object.isValid()).should.eql(false);
      (s18.object.isValid()).should.eql(false);
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
