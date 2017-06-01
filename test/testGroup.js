{

  // Testing module functionality
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });

  let Agent = require('./../src/Agent').Agent;
  let Group = require('./../src/Agent').Group;
  let Statement = require('./../src/Statement').Statement;

  let members = [new Agent(XAPIWrapper.hash("mailto:user1@example.com"), 'user1'),
                 new Agent(XAPIWrapper.hash("mailto:user2@example.com"), 'user2'),
                 new Agent(XAPIWrapper.hash("mailto:user3@example.com"), 'user3')];

  let stmt = new Statement(new Group(XAPIWrapper.hash("mailto:user@example.com"), members, 'aaron'),
                            'http://adlnet.gov/expapi/verbs/npm_testing_group',
                            'act:statement_posts/node_test_group');

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Group Pass") );

}
