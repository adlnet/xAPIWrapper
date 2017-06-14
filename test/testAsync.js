{

  describe("Asynchronous Testing:", () => {
    // Test statement
    let s1;

    // Testing module functionality
    let should, XAPIWrapper;


    before(() => {
      // Require necessary modules
      should = require('should');
      XAPIWrapper = require('./../src/xAPIWrapper');

      XAPIWrapper.changeConfig({
        "endpoint": "https://lrs.adlnet.gov/xapi/",
        "user": "tom",
        "password": "1234"
      });

      s1 = {
        'actor': {'mbox':'mailto:aaron@example.com'},
        'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
        'object': {'id': 'http://activity.com/id'},'timestamp':(new Date()).toISOString()
      };
    });


    describe("POST Requests", () => {
      it("should pass using valid async/await", async () => {
        let res = await XAPIWrapper.postStatement(s1);
        (res.resp.statusMessage==="OK").should.eql(true);
      });
    });
  });

}
