{

  // Testing module functionality
  let XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });


  let Agent = require('./../src/Agent').Agent;
  let Statement = require('./../src/Statement').Statement;

  // let stmt = new Statement(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
  //                           require('./../src/verbs').attempted,
  //                           'act:statement_posts/node_test_agent');

  let stmt = new Statement({"mbox":'mailto:user@example.com', "name":'aaron'},
                            require('./../src/verbs').attempted,
                            'act:statement_posts/node_test_agent');

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  XAPIWrapper.postStatement(stmt, (resp, data) => console.log("Agent Pass") );

}
