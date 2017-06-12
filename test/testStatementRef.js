{

  // Testing module functionality
  let XAPIWrapper = require('./../src/xAPIWrapper');


  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });

  let StatementRef = require('./../src/Object').StatementRef;
  let Statement = require('./../src/Statement').Statement;
  let stmtRef = new StatementRef({"id":"8f87ccde-bb56-4c2e-ab83-44982ef22df1"});

  let stmt = new Statement('mailto:user@adlnet.gov',
                           'http://adlnet.gov/expapi/verbs/npm_testing_activity',
                           new StatementRef("8f87ccde-bb56-4c2e-ab83-44982ef22df0"));

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("StatementRef Pass") );

}
