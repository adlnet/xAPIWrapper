(function() {

  // Testing module functionality
  var Util = require('./../src/Utils');
  var verbs = require('./../src/verbs');
  var XAPIWrapper = require('./../src/xAPIWrapper');

  XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });


  var Agent = require('./../src/Agent').Agent;
  var Group = require('./../src/Agent').Group;
  var Verb = require('./../src/Verb');
  var Statement = require('./../src/Statement').Statement;
  var Activity = require('./../src/Object').Activity;
  var StatementRef = require('./../src/Object').StatementRef;
  var SubStatement = require('./../src/Statement').SubStatement;

  // var stmt = new Statement('mailto:example@adlnet.gov', 'http://adlnet.gov/expapi/verbs/launched', 'http://vwf.adlnet.gov/xapi/node_test');

  var stmt = new Statement(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
                            new Verb('http://adlnet.gov/expapi/verbs/npm_testing', 'npm_testing'),
                            new Activity("act:statement_posts/node_test"));

  // console.log(new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'));
  // var agents = [new Agent(XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
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

  stmt.timestamp = (new Date()).toISOString();


  XAPIWrapper.postStatement(stmt);


})();
