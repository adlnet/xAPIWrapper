describe("Group Test:", () => {
  // Group objects to test
  let def, iAccount, iAccountName, iAccountHomepage, iAccountNoMembers,
      iMboxsha1sum, iMboxsha1sumNoMembers, iOpenId, iOpenIdNoMembers,
      iMbox, aGroup, aGroupNoMembers, aGroupMembers, groupMember;

  // Testing module functionality
  let should, XAPIWrapper, Agent, Group, Statement, verbs;

  let objId = 'http://activity.com/id';

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Test statements
  let s1, s2, s3, s4, s5, s6, s7, s8,
      s9, s10, s11, s12, s13, s14;

  // Path
  const DIR = "./templates/groups/";


  before(() => {
    def = require(`${DIR}default.json`);
    iAccount = require(`${DIR}identified_account.json`);
    iAccountName = require(`${DIR}identified_account_no_homepage.json`);
    iAccountHomepage = require(`${DIR}identified_account_no_name.json`);
    iAccountNoMembers = require(`${DIR}identified_account_no_member.json`);
    iMboxsha1sum = require(`${DIR}identified_mboxsha1sum.json`);
    iMboxsha1sumNoMembers = require(`${DIR}identified_mboxsha1sum_no_member.json`);
    iOpenId = require(`${DIR}identified_openid.json`);
    iOpenIdNoMembers = require(`${DIR}identified_openid_no_member.json`);
    iMbox = require(`${DIR}identified_mbox.json`);
    aGroup = require(`${DIR}anonymous.json`);
    aGroupNoMembers = require(`${DIR}anonymous_no_member.json`);
    aGroupMembers = require(`${DIR}anonymous_two_member.json`);
    groupMember = require(`${DIR}anonymous_group_member.json`);

    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Agent = require('./../src/Agent').Agent;
    Group = require('./../src/Agent').Group;
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
    s2 = new Statement(iAccount, verbs.attempted, objId);
    s3 = new Statement(iAccountName, verbs.attempted, objId);
    s4 = new Statement(iAccountHomepage, verbs.attempted, objId);
    s5 = new Statement(iAccountNoMembers, verbs.attempted, objId);
    s6 = new Statement(iMboxsha1sum, verbs.attempted, objId);
    s7 = new Statement(iMboxsha1sumNoMembers, verbs.attempted, objId);
    s8 = new Statement(iOpenId, verbs.attempted, objId);
    s9 = new Statement(iOpenIdNoMembers, verbs.attempted, objId);
    s10 = new Statement(iMbox, verbs.attempted, objId);
    s11 = new Statement(aGroup, verbs.attempted, objId);
    s12 = new Statement(aGroupNoMembers, verbs.attempted, objId);
    s13 = new Statement(aGroupMembers, verbs.attempted, objId);
    s14 = new Statement(groupMember, verbs.attempted, objId);
  });

  describe("Group constructor test:", () => {
    it("should pass with valid id & no members/name", () => {
      ((new Group(def)).isValid()).should.eql(true);
    });
    it("should pass with valid id/members & no name", () => {
      ((new Group(s10.actor.getId(), iMbox.member)).isValid()).should.eql(true);
    });
    it("should pass with valid members & no id/name", () => {
        ((new Group(null, iMbox.member)).isValid()).should.eql(true);
    });
    it("should fail with empty parameters", () => {
        ((new Group()).isValid()).should.eql(false);
    });
    it("should fail with valid name only", () => {
        ((new Group(null, null, aGroup.name)).isValid()).should.eql(false);
    });
    it("should fail with invalid id/members", () => {
        ((new Group(iAccountName.account, groupMember.member)).isValid()).should.eql(false);
    });
    it("should pass when retrieving display objects", () => {
        (s1.actor.getDisplay()).should.eql(def.name);
        (s10.actor.getDisplay()).should.eql(iMbox.mbox);
        (s7.actor.getDisplay()).should.eql(iMboxsha1sumNoMembers.mbox_sha1sum);
        (s9.actor.getDisplay()).should.eql(iOpenIdNoMembers.openid);
        (s2.actor.getDisplay()).should.eql(`${iAccount.account.homePage}:${iAccount.account.name}`);
        (s11.actor.getDisplay()).should.eql('Anonymous Group');
        (!s14.actor.getDisplay()).should.eql(true);
    });
  });

  describe("JSON Object as statement actor:", () => {
    it("should pass calling isValid() on group objects", () => {
      (s1.actor.isValid()).should.eql(true);
      (s2.actor.isValid()).should.eql(true);
      (s3.actor.isValid()).should.eql(false);
      (s4.actor.isValid()).should.eql(false);
      (s5.actor.isValid()).should.eql(true);
      (s6.actor.isValid()).should.eql(true);
      (s7.actor.isValid()).should.eql(true);
      (s8.actor.isValid()).should.eql(true);
      (s9.actor.isValid()).should.eql(true);
      (s10.actor.isValid()).should.eql(true);
      (s11.actor.isValid()).should.eql(true);
      (s12.actor.isValid()).should.eql(false);
      (s13.actor.isValid()).should.eql(true);
      (s14.actor.isValid()).should.eql(false);
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
    describe("Identified", () => {
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
        it('should pass with no members & valid id', (done) => {
          XAPIWrapper.postStatement(s5, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("Mbox Sha1sum", () => {
        it('should pass with valid mbox_sha1sum object', (done) => {
          XAPIWrapper.postStatement(s6, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
        it('should pass with no members & valid account', (done) => {
          XAPIWrapper.postStatement(s7, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("OpenId", () => {
        it('should pass with valid openid object', (done) => {
          XAPIWrapper.postStatement(s8, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
        it('should pass with no members & valid openId', (done) => {
          XAPIWrapper.postStatement(s9, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("Mbox", () => {
        it('should pass with members & valid mbox', (done) => {
          XAPIWrapper.postStatement(s10, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
    });
    describe("Anonymous", () => {
      describe("One Member", () => {
        it('should pass with single valid member', (done) => {
          XAPIWrapper.postStatement(s11, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("No Members", () => {
        it('should fail with no members', (done) => {
          XAPIWrapper.postStatement(s12, (error, resp, data) => {
            error.should.not.eql(null);

            done();
          });
        });
      });
      describe("Two Members", () => {
        it('should pass with two valid members', (done) => {
          XAPIWrapper.postStatement(s13, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
    });
    describe("Group Member", () => {
      it('should fail with Group member object', (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
  });

  describe("Group Object as statement actor:", () => {
    before(() => {
      s1 = new Statement(new Group(def), verbs.attempted, objId);
      s2 = new Statement(new Group(iAccount), verbs.attempted, objId);
      s3 = new Statement(new Group(iAccountName), verbs.attempted, objId);
      s4 = new Statement(new Group(iAccountHomepage), verbs.attempted, objId);
      s5 = new Statement(new Group(iAccountNoMembers), verbs.attempted, objId);
      s6 = new Statement(new Group(iMboxsha1sum), verbs.attempted, objId);
      s7 = new Statement(new Group(iMboxsha1sumNoMembers), verbs.attempted, objId);
      s8 = new Statement(new Group(iOpenId), verbs.attempted, objId);
      s9 = new Statement(new Group(iOpenIdNoMembers), verbs.attempted, objId);
      s10 = new Statement(new Group(iMbox), verbs.attempted, objId);
      s11 = new Statement(new Group(aGroup), verbs.attempted, objId);
      s12 = new Statement(new Group(aGroupNoMembers), verbs.attempted, objId);
      s13 = new Statement(new Group(aGroupMembers), verbs.attempted, objId);
      s14 = new Statement(new Group(groupMember), verbs.attempted, objId);
    });

    it("should pass calling isValid() on group objects", () => {
      (s1.actor.isValid()).should.eql(true);
      (s2.actor.isValid()).should.eql(true);
      (s3.actor.isValid()).should.eql(false);
      (s4.actor.isValid()).should.eql(false);
      (s5.actor.isValid()).should.eql(true);
      (s6.actor.isValid()).should.eql(true);
      (s7.actor.isValid()).should.eql(true);
      (s8.actor.isValid()).should.eql(true);
      (s9.actor.isValid()).should.eql(true);
      (s10.actor.isValid()).should.eql(true);
      (s11.actor.isValid()).should.eql(true);
      (s12.actor.isValid()).should.eql(false);
      (s13.actor.isValid()).should.eql(true);
      (s14.actor.isValid()).should.eql(false);
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
    describe("Identified", () => {
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
        it('should pass with no members & valid id', (done) => {
          XAPIWrapper.postStatement(s5, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("Mbox Sha1sum", () => {
        it('should pass with valid mbox_sha1sum object', (done) => {
          XAPIWrapper.postStatement(s6, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
        it('should pass with no members & valid account', (done) => {
          XAPIWrapper.postStatement(s7, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("OpenId", () => {
        it('should pass with valid openid object', (done) => {
          XAPIWrapper.postStatement(s8, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
        it('should pass with no members & valid openId', (done) => {
          XAPIWrapper.postStatement(s9, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("Mbox", () => {
        it('should pass with members & valid mbox', (done) => {
          XAPIWrapper.postStatement(s10, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
    });
    describe("Anonymous", () => {
      describe("One Member", () => {
        it('should pass with single valid member', (done) => {
          XAPIWrapper.postStatement(s11, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
      describe("No Members", () => {
        it('should fail with no members', (done) => {
          XAPIWrapper.postStatement(s12, (error, resp, data) => {
            error.should.not.eql(null);

            done();
          });
        });
      });
      describe("Two Members", () => {
        it('should pass with two valid members', (done) => {
          XAPIWrapper.postStatement(s13, (error, resp, data) => {
            (!error).should.eql(true);
            resp.status.should.eql(OK);
            resp.ok.should.eql(true);

            done();
          });
        });
      });
    });
    describe("Group Member", () => {
      it('should fail with Group member object', (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
  });
});
