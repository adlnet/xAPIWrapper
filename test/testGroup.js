describe.skip("Group Test:", () => {
  // Group objects to test
  let def, iAccount, iAccountName, iAccountHomepage, iAccountNoMembers,
      iMboxsha1sum, iMboxsha1sumNoMembers, iOpenId, iOpenIdNoMembers,
      defNoMembers, aGroup, aGroupNoMembers, aGroupMembers, auth, groupMember;

  // Testing module functionality
  let should, XAPIWrapper, Agent, Group, Statement, verbs;

  let objId = 'http://activity.com/id';

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Test statements
  let s1, s2, s3, s4, s5, s6, s7, s8,
      s9, s10, s11, s12, s13, s14, s15;


  before(() => {
    def = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox": "mailto:aaron@example.com"
    };
    iAccount = {
      "objectType": "Group",
      "name": "Identified Group",
      "account": {
        "homePage": "http://www.example.com",
        "name": "xAPI account name"
      },
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    iAccountName = {
      "objectType": "Group",
      "name": "Identified Group",
      "account": {
        "name": "xAPI account name"
      },
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    iAccountHomepage = {
      "objectType": "Group",
      "name": "Identified Group",
      "account": {
        "homePage": "http://www.example.com",
      },
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    iAccountNoMembers = {
      "objectType": "Group",
      "name": "Identified Group",
      "account": {
        "homePage": "http://www.example.com",
        "name": "xAPI account name"
      }
    };
    iMboxsha1sum = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox_sha1sum": "169fd15497b877fae1a3e1a67cb0b6064ebc2da5",
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    iMboxsha1sumNoMembers = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox_sha1sum": "169fd15497b877fae1a3e1a67cb0b6064ebc2da5"
    };
    iOpenId = {
      "objectType": "Group",
      "name": "Identified Group",
      "openid": "http://openid.example.org/12345",
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    iOpenIdNoMembers = {
      "objectType": "Group",
      "name": "Identified Group",
      "openid": "http://openid.example.org/12345"
    };
    defNoMembers = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox": "mailto:aaron@example.com",
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    aGroup = {
      "objectType": "Group",
      "member": [
        {
          "name": "xAPI mbox",
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    aGroupNoMembers = {
      "objectType": "Group"
    };
    aGroupMembers = {
      "objectType": "Group",
      "member": [
        {
          "account": {
            "homePage": "http://www.example.com",
            "name": "xAPI account name"
          }
        },
        {
          "mbox": "mailto:aaron@example.com"
        }
      ]
    };
    auth = {
      "objectType": "Group",
      "member": [
        {
          "account": {
            "homePage": "http://www.example.com/xAPI/OAuth/Token",
            "name": "oauth_consumer_x75db"
          }
        },
        {
          "mbox": "mailto:aaron_authority@example.com"
        }
      ]
    };
    groupMember = {
      "objectType": "Group",
      "name": "Identified Group",
      "mbox": "mailto:aaron@example.com",
      "member": [
        {
          "name": "Group member",
          "mbox": "mailto:group@example.com",
          "member": [
            {
              "name": "Agent member",
              "mbox": "mailto:groupmem@example.com"
            }
          ]
        }
      ]
    }

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
    s10 = new Statement(defNoMembers, verbs.attempted, objId);
    s11 = new Statement(aGroup, verbs.attempted, objId);
    s12 = new Statement(aGroupNoMembers, verbs.attempted, objId);
    s13 = new Statement(aGroupMembers, verbs.attempted, objId);
    s14 = new Statement(auth, verbs.attempted, objId);
    s15 = new Statement(groupMember, verbs.attempted, objId);
  });

  describe("Group constructor test:", () => {
    it("should fail with empty parameters", () => {

    });
    it("should pass when retrieving display objects", () => {

    });
  });

  describe("JSON Object as statement actor:", () => {
    it("should pass calling isValid() on group objects", () => {

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
    describe.skip("Authority", () => {
      it('should pass with valid auth members', (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Group Member", () => {
      it('should fail with Group member object', (done) => {
        XAPIWrapper.postStatement(s15, (error, resp, data) => {
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
      s10 = new Statement(new Group(defNoMembers), verbs.attempted, objId);
      s11 = new Statement(new Group(aGroup), verbs.attempted, objId);
      s12 = new Statement(new Group(aGroupNoMembers), verbs.attempted, objId);
      s13 = new Statement(new Group(aGroupMembers), verbs.attempted, objId);
      s14 = new Statement(new Group(auth), verbs.attempted, objId);
      s15 = new Statement(new Group(groupMember), verbs.attempted, objId);
    });

    it("should pass calling isValid() on group objects", () => {

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
    describe.skip("Authority", () => {
      it('should pass with valid auth members', (done) => {
        XAPIWrapper.postStatement(s14, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
    });
    describe("Group Member", () => {
      it('should fail with Group member object', (done) => {
        XAPIWrapper.postStatement(s15, (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
    });
  });
});
