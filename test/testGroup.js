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

  let stmt = new Statement({"mbox":"mailto:user@example.com", "member":members, "name":"aaron"},
                            require('./../src/verbs').attempted,
                            'act:statement_posts/node_test_group');

  stmt.timestamp = (new Date()).toISOString();

  stmt.show();

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Group Pass") );


  // Test anonymous groups
  let anonStmt = new Statement(new Group(null, members, null),
                            require('./../src/verbs').attempted,
                            'act:statement_posts/node_test_group');

  anonStmt.timestamp = (new Date()).toISOString();

  XAPIWrapper.postStatement(anonStmt, (resp, data) => console.log("Group Pass") );

  anonStmt.show();

}