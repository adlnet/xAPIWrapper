describe("Asynchronous Testing:", () => {

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

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
      "password": "1234"
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

    describe.skip("PUT", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.putStatement(s1, s1['id']);
        (res.resp.statusCode).should.eql(NO_CONTENT);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.putStatement(s2, s2['id'], (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusCode).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        try {
          let err = await XAPIWrapper.putStatement(null, Util.ruuid());
        } catch (e) {
          (e!==null).should.eql(true);
        }
      });
      it("should fail sending array with callback", (done) => {
        let stmt = [new Statement(s1)];
        XAPIWrapper.putStatement(stmt, stmt['id'], (error, resp, data) => {
          (error!==null).should.eql(true);
          done();
        });
      });
      it("should fail not using same id as statement", (done) => {
        XAPIWrapper.putStatement([new Statement(s1)], Util.ruuid(), (error, resp, data) => {
          (error!==null).should.eql(true);
          done();
        });
      });
    });
    describe.skip("POST", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.postStatement(s1);
        (res.resp.statusCode).should.eql(OK);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusCode).should.eql(OK);
          }

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        try {
          let err = await XAPIWrapper.postStatement(null);
        } catch (e) {
          (e!==null).should.eql(true);
        }
      });
      it("should fail sending array with callback", (done) => {
        XAPIWrapper.postStatement([new Statement(s1)], (error, resp, data) => {
          (error!==null).should.eql(true);
          done();
        });
      });
      describe("Multiple Statements", () => {
        it("should pass sending statements asynchronously", async () => {
          let stmts=[new Statement(s1), new Statement(s2)];
          let res = await XAPIWrapper.postStatements(stmts);
          (res.resp.statusCode).should.eql(OK);
        });
        it("should pass sending statements with callback", (done) => {
          let stmts = [new Statement(s1)];
          XAPIWrapper.postStatements(stmts, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.statusCode).should.eql(OK);
            }

            done();
          });
        });
        it("should fail sending single object with callback", (done) => {
          XAPIWrapper.postStatements(new Statement(s1), (error, resp, data) => {
            (error!==null).should.eql(true);
            done();
          });
        });
        it("should fail sending empty array with callback", (done) => {
          XAPIWrapper.postStatements([], (error, resp, data) => {
            (error!==null).should.eql(true);
            done();
          });
        });
      });
    });
    describe.skip("GET", () => {
      it.skip("should return list of all statements asynchronously", async () => {
        let res = await XAPIWrapper.getStatements();
      });
      it("should return list of all statements with callback", (done) => {
        XAPIWrapper.getStatements(null, null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            console.log(data);
          }

          done();
        });
      });
    });
  });

  describe.skip("State", () => {


    describe.skip("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe.skip("POST", () => {
      it.skip("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {
        XAPIWrapper.postState();
      });
    });
  });

  describe.skip("Activity Profile", () => {
    describe.skip("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe.skip("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });

  describe.skip("Agent Profile", () => {
    describe.skip("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe.skip("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });

});
