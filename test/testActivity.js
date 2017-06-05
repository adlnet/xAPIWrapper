{

  // Testing module functionality
  let Util = require('./../src/Utils');
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });

  let Activity = require('./../src/Object').Activity;
  let Statement = require('./../src/Statement').Statement;


  // Test all params of Activity
  let stmt = new Statement('mailto:user@adlnet.gov',
                           'http://adlnet.gov/expapi/verbs/npm_testing_activity',
                           new Activity("act:statement_posts/node_test_activity", 'tester', 'Testing activity class functionality'));

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt.actor);
  console.log(stmt.verb);
  console.log(stmt.object);


  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Activity Pass") );


  // Test Activity as parameter
  // let act = new Activity(stmt.object);
  // console.log(act);

}
