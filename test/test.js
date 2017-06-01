{

  // Testing module functionality
  let Util = require('./../src/Utils');
  let verbs = require('./../src/verbs');
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });


  let Agent = require('./../src/Agent').Agent;
  let Group = require('./../src/Agent').Group;
  let Verb = require('./../src/Verb');
  let Statement = require('./../src/Statement').Statement;
  let SubStatement = require('./../src/Statement').SubStatement;
  let Activity = require('./../src/Object').Activity;
  let StatementRef = require('./../src/Object').StatementRef;

  let stmt = new Statement(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
                            new Verb('http://adlnet.gov/expapi/verbs/npm_testing', 'npm_testing'),
                            new Activity("act:statement_posts/node_test"));

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Statement Pass") );

}
