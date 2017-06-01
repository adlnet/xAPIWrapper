{

  // Testing module functionality
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });

  let Verb = require('./../src/Verb');
  let Statement = require('./../src/Statement').Statement;

  let stmt = new Statement('mailto:user@adlnet.gov',
                            new Verb('http://adlnet.gov/expapi/verbs/npm_testing_verb', 'npm_testing_verb'),
                            'act:statement_posts/node_test_verb');

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Verb Pass") );

}
