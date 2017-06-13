{

  describe("SubStatement Test:", () => {

  });

  // Testing module functionality
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });

  let Statement = require('./../src/Statement').Statement;
  let SubStatement = require('./../src/Statement').SubStatement;

  let stmt = new Statement('mailto:user@adlnet.gov',
                           'http://adlnet.gov/expapi/verbs/npm_testing_activity',
                           '');

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("SubStatement Pass") );

}
