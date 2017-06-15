describe("Asynchronous Testing:", () => {
  // Test statement
  let s1, s2;

  // Testing module functionality
  let should, XAPIWrapper, Statement;


  before(() => {
    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Statement = require('./../src/statement').Statement;

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "tom",
      "password": "1234"
    });

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


  describe("POST Requests", () => {
    describe("Statement", () => {
      it("should pass using valid async/await", async () => {
        let res = await XAPIWrapper.postStatement(s1);
        (res.resp.statusMessage==="OK").should.eql(true);
      });
      it("should pass using valid callback", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusMessage==="OK").should.eql(true);
          }

          done();
        });
      });
    });
    describe("Statements", () => {
      let stmts1, stmts2;

      before(() => {
        stmts1=[new Statement(s1), new Statement(s2)];
        stmts2 = [new Statement(s1)];
      });

      it("should pass using valid async/await", async () => {
        let res = await XAPIWrapper.postStatements(stmts1);
        (res.resp.statusMessage==="OK").should.eql(true);
      });
      it("should pass using valid callback", (done) => {
        XAPIWrapper.postStatements(stmts2, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusMessage==="OK").should.eql(true);
          }

          done();
        });
      });
    });
    describe.skip("State", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe.skip("Activity Profile", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe.skip("Agent Profile", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });
  describe.skip("PUT Requests", () => {

  });
  describe.skip("GET Requests", () => {

  });
  describe.skip("DELETE Requests", () => {

  });
});
