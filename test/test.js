{

  // Testing module functionality
  let Util = require('./../src/Utils');
  let verbs = require('./../src/verbs');
  let XAPIWrapper = require('./../src/xAPIWrapper');
  // import XAPIWrapper from "../src/xapiwrapper";

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

  // let stmt = new Statement('mailto:example@adlnet.gov', 'http://adlnet.gov/expapi/verbs/launched', 'http://vwf.adlnet.gov/xapi/node_test');

  let stmt = new Statement(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
                            new Verb('http://adlnet.gov/expapi/verbs/npm_testing', 'npm_testing'),
                            new Activity("act:statement_posts/node_test"));

  stmt.timestamp = (new Date()).toISOString();

  // console.log(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'));
  // let agents = [new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
  //               new Agent(XAPIWrapper.hash("mailto:usertwo@example.com"), 'jimmy')];
  // console.log(new Group(XAPIWrapper.hash("mailto:user@example.com"), agents, 'GroupOne'));
  console.log(stmt);
  //
  // console.log(new Verb('http://adlnet.gov/expapi/verbs/npm_testing', 'npm_testing'));
  // console.log(new Activity("act:statement_posts/node_test"));
  // console.log(new StatementRef);
  // console.log(new SubStatement(stmt.actor, stmt.verb, stmt.object));
  // console.log(Util);
  // console.log(XAPIWrapper);
  // console.log(verbs);



  XAPIWrapper.postStatement(stmt, (r) => {});

}
