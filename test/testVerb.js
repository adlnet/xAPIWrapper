describe("Verb Test:", () => {
  // Verb objects to test
  let def, noDisplay, noId, voided;

  // Testing module functionality
  let should, XAPIWrapper, Verb, Statement, verbs;

  let objId = 'http://activity.com/id';

  // Test statements
  let s1, s2, s3, s4;


  before(() => {
    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Verb = require('./../src/Verb');
    Statement = require('./../src/Statement').Statement;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "tom",
      "password": "1234"
    });

    def = verbs.attempted;
    noDisplay = { "id": verbs.registered.id };
    noId = { "display": verbs.suspended.display };
    voided = verbs.voided;

    // Test statements
    s1 = new Statement('mailto:aaron@example.com', def, objId);
    s2 = new Statement('mailto:aaron@example.com', noDisplay, objId);
    s3 = new Statement('mailto:aaron@example.com', noId, objId);
    s4 = new Statement('mailto:aaron@example.com', voided, objId);
  });


  describe("JSON Object as statement verb:", () => {
    describe("Default", (done) => {
      it('should pass with valid id & display', (done) => {
        s1.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            resp.statusMessage.should.eql("OK");
          }

          done();
        });
      });
    });
    describe("No Display", (done) => {
      it('should pass with no display & valid id', (done) => {
        s2.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            resp.statusMessage.should.eql("OK");
          }

          done();
        });
      });
    });
    describe("No ID", (done) => {
      it('should fail with no id & valid display', (done) => {
        s3.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusMessage==="OK").should.eql(false);
          }

          done();
        });
      });
    });

    after(()=>console.log('\n'));
  });

  describe("Verb Object as statement verb:", () => {
    describe("Default", (done) => {
      it('should pass with valid id & display', (done) => {
        s1 = new Statement('mailto:aaron@example.com', new Verb(def), objId);
        s1.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            resp.statusMessage.should.eql("OK");
          }

          done();
        });
      });
    });
    describe("No Display", (done) => {
      it('should pass with no display & valid id', (done) => {
        s2 = new Statement('mailto:aaron@example.com', new Verb(noDisplay), objId);
        s2.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            resp.statusMessage.should.eql("OK");
          }

          done();
        });
      });
    });
    describe("No ID", (done) => {
      it('should fail with no id & valid display', (done) => {
        s3 = new Statement('mailto:aaron@example.com', new Verb(noId), objId);
        s3.timestamp = (new Date()).toISOString();
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusMessage==="OK").should.eql(false);
          }

          done();
        });
      });
    });
  });
});
