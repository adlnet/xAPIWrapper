describe.skip("Activity Test:", () => {
  // Activities to test
  let def, trueFalse, choice, fillIn, longFillIn, match,
      peform, seq, like, num, other;

  // Testing module functionality
  let should, XAPIWrapper, Activity, Statement, verbs;

  // Test statements
  let s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

  let objId = 'http://activity.com/id';


  before(() => {
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

    // Test statements

  });


  describe("JSON Object as statement object:", () => {
    describe("Default", () => {
      it('should pass with valid id', (done) => {

      });
    });
    describe("Interaction Types", () => {
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

    after(()=>console.log('\n'));
  });

  describe("Activity Object as statement object:", () => {

  });
});
