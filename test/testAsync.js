describe("Asynchronous Testing:", () => {
  const fs = require('fs');

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

    describe("PUT", () => {
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
      describe.skip("With Attachments", () => {
        let stmt;
        let att;

        beforeEach(() => {
          // Get attachment data
          content = fs.readFileSync('test/test.txt').toString();

          att = {
            value: content,
            type: {
              "usageType":"http://adlnet.gov/expapi/attachments/test",
              "display":{"en-US": "Test Attachment"},
              "description":{"en-US":"a test attachment for statement requests"},
              "contentType":"application/octet-stream"
            }
          };

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          let res = await XAPIWrapper.putStatement(stmt, stmt.id, null, [att]);
          (res.resp.statusCode).should.eql(NO_CONTENT);
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.putStatement(stmt, stmt.id, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.statusCode).should.eql(NO_CONTENT);
            }

            done();
          }, [att]);
        });
      });
    });
    describe("POST", () => {
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
      describe.skip("With Attachments", () => {
        let stmt;
        let att;

        beforeEach(() => {
          // Get attachment data
          content = fs.readFileSync('test/test.txt').toString();

          att = {
            value: content,
            type: {
              "usageType":"http://adlnet.gov/expapi/attachments/test",
              "display":{"en-US": "Test Attachment"},
              "description":{"en-US":"a test attachment for statement requests"},
              "contentType":"application/octet-stream"
            }
          };

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          let res = await XAPIWrapper.postStatement(stmt, null, [att]);
          (res.resp.statusCode).should.eql(OK);
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.postStatement(stmt, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.statusCode).should.eql(OK);
            }

            done();
          }, [att]);
        });
      });
    });
    describe("GET", () => {
      it("should return list of statements asynchronously", async () => {
        let res = await XAPIWrapper.getStatements();
        (res.resp.statusCode==OK && res.data!=null).should.eql(true);
      });
      it("should return list of statements with callback", (done) => {
        XAPIWrapper.getStatements(null, null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.statusCode==OK && data!=null).should.eql(true);
          }

          done();
        });
      });
      it("should return single statement asynchronously", async () => {
        let res = await XAPIWrapper.getStatements({"limit":1});
        (res.resp.statusCode==OK && res.data!=null).should.eql(true);
      });
      it("should return single statement using id asynchronously", async () => {
        let id = '39d1c0bd-21b8-4523-b628-1c503cfb1732';
        let res = await XAPIWrapper.getStatements({"statementId":id});
        (JSON.parse(res.data).id).should.eql(id);
      });
      describe("More Statements", () => {

      });
    });
  });

  describe("State", () => {


    describe("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {
        XAPIWrapper.postState();
      });
    });
  });

  describe("Activity Profile", () => {
    describe("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });

  describe("Agent Profile", () => {
    describe("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });

});
