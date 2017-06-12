{
  // Agent objects to test
  let def = {
    "name": "Aaron",
    "mbox":'mailto:aaron@example.com'
  }

  let account = {
    "name": "Aaron",
    "account": {
      "homepage": "http://www.example.com",
      "name": "NameHomepage"
    }
  }
  let accountName = {
    "name": "Aaron",
    "account": {"name": "NameOnly"}
  }
  let accountHomepage = {
    "name": "Aaron",
    "account": {"homepage": "http://www.example.com"}
  }

  let mboxsha1sum = {
    "name": "Aaron",
    "mbox_sha1sum": "169fd15497b877fae1a3e1a67cb0b6064ebc2da5"
  }

  let openId = {
    "name": "Aaron",
    "openid": "http://openid.example.org/1234"
  }


  // Testing module functionality
  var should = require('should');
  let XAPIWrapper = require('./../src/xAPIWrapper');
  let Agent = require('./../src/Agent').Agent;
  let Statement = require('./../src/Statement').Statement;
  let verbs = require('./../src/verbs');
  let objId = 'http://activity.com/id';


  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });


  // Test statements
  let s1 = new Statement(def, verbs.attempted, objId);
  let s2 = new Statement(account, verbs.attempted, objId);
  let s3 = new Statement(accountName, verbs.attempted, objId);
  let s4 = new Statement(accountHomepage, verbs.attempted, objId);
  let s5 = new Statement(mboxsha1sum, verbs.attempted, objId);
  let s6 = new Statement(openId, verbs.attempted, objId);
  s1.timestamp = (new Date()).toISOString();
  s2.timestamp = (new Date()).toISOString();
  s3.timestamp = (new Date()).toISOString();
  s4.timestamp = (new Date()).toISOString();
  s5.timestamp = (new Date()).toISOString();
  s6.timestamp = (new Date()).toISOString();


  describe('Agent Test', () => {

    describe("Default", () => {
      it('should pass with valid mbox object', (done) => {
        XAPIWrapper.postStatement(s1, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
    });

    describe("Account", () => {
      it('should pass with valid account name and homepage', (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
      it('should pass with valid account name', (done) => {
        XAPIWrapper.postStatement(s3, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
      it('should pass with valid account homepage', (done) => {
        XAPIWrapper.postStatement(s4, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
    });

    describe("Mbox Sha1sum", () => {
      it('should pass with valid mbox_sha1sum object', (done) => {
        XAPIWrapper.postStatement(s5, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
    });

    describe("OpenId", () => {
      it('should pass with valid openid object', (done) => {
        XAPIWrapper.postStatement(s6, (error, resp, data) => {
          resp.statusMessage.should.eql("OK");
          done();
        });
      });
    });

  });
}
