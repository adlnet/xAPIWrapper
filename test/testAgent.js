describe('Agent Test:', () => {
  // Agent objects to test
  let def, account, accountName, accountHomepage, mboxsha1sum, openId;

  // Testing module functionality
  let should, XAPIWrapper, Agent, Statement, verbs;

  // Test statements
  let s1, s2, s3, s4, s5, s6;

  let objId = 'http://activity.com/id';

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  before(() => {
    def = {
      "name": "Default display",
      "mbox":'mailto:aaron@example.com'
    }
    account = {
      "name": "Account display",
      "account": {
        "homePage": "http://www.example.com",
        "name": "xAPI account name"
      }
    }
    accountName = {
      "name": "No homepage account display",
      "account": {"name": "xAPI account name"}
    }
    accountHomepage = {
      "name": "No name account display",
      "account": {"homePage": "http://www.example.com"}
    }
    mboxsha1sum = {
      "name": "Mboxsha1sum display",
      "mbox_sha1sum": "169fd15497b877fae1a3e1a67cb0b6064ebc2da5"
    }
    openId = {
      "name": "OpenId display",
      "openid": "http://openid.example.org/1234"
    }

    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Agent = require('./../src/Agent').Agent;
    Statement = require('./../src/Statement').Statement;
    verbs = require('./../src/verbs');

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });

    // Test statements
    s1 = new Statement(def, verbs.attempted, objId);
    s2 = new Statement(account, verbs.attempted, objId);
    s3 = new Statement(accountName, verbs.attempted, objId);
    s4 = new Statement(accountHomepage, verbs.attempted, objId);
    s5 = new Statement(mboxsha1sum, verbs.attempted, objId);
    s6 = new Statement(openId, verbs.attempted, objId);
  });

  describe("Agent constructor test:", () => {
    it("should pass with valid id & name", () => {
      ((new Agent(def, "aaron")).isValid()).should.eql(true);
    });
    it("should fail with invalid id & valid name", () => {
      (!(new Agent(null, "aaron")).isValid()).should.eql(true);
    });
    it("should fail with empty parameters", () => {
      (!(new Agent()).isValid()).should.eql(true);
    });
    it("should pass when retrieving display objects", () => {
      (s1.actor.getDisplay()).should.eql(def.name);
      (s2.actor.getDisplay()).should.eql(account.name);
      (!s3.actor.getDisplay()).should.eql(true);
      (!s4.actor.getDisplay()).should.eql(true);
      (s5.actor.getDisplay()).should.eql(mboxsha1sum.name);
      (s6.actor.getDisplay()).should.eql(openId.name);
    });
  });

  describe("JSON Object as statement actor:", () => {
    it("should pass calling isValid() on agent objects", () => {
      (s1.actor.isValid()).should.eql(true);
      (s2.actor.isValid()).should.eql(true);
      (!s3.actor.isValid()).should.eql(true);
      (!s4.actor.isValid()).should.eql(true);
      (s5.actor.isValid()).should.eql(true);
      (s6.actor.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it('should pass with valid mbox object', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Account", () => {
      it('should pass with valid account object', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should fail with no valid homepage', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it('should fail with no valid name', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Mbox Sha1sum", () => {
      it('should pass with valid mbox_sha1sum object', (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("OpenId", () => {
      it('should pass with valid openid object', (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
  });

  describe("Agent Object as statement actor:", () => {
    before(() => {
      s1 = new Statement(new Agent(def), verbs.attempted, objId);
      s2 = new Statement(new Agent(account), verbs.attempted, objId);
      s3 = new Statement(new Agent(accountName), verbs.attempted, objId);
      s4 = new Statement(new Agent(accountHomepage), verbs.attempted, objId);
      s5 = new Statement(new Agent(mboxsha1sum), verbs.attempted, objId);
      s6 = new Statement(new Agent(openId), verbs.attempted, objId);
    });

    it("should pass calling isValid() on agent objects", () => {
      (s1.actor.isValid()).should.eql(true);
      (s2.actor.isValid()).should.eql(true);
      (!s3.actor.isValid()).should.eql(true);
      (!s4.actor.isValid()).should.eql(true);
      (s5.actor.isValid()).should.eql(true);
      (s6.actor.isValid()).should.eql(true);
    });
    describe("Default", () => {
      it('should pass with valid mbox object', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Account", () => {
      it('should pass with valid account object', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it('should fail with no valid homepage', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      it('should fail with no valid name', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
    describe("Mbox Sha1sum", () => {
      it('should pass with valid mbox_sha1sum object', (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("OpenId", () => {
      it('should pass with valid openid object', (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
  });
});
