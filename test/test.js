(function() {

  // Testing wrapper functionality
  var ADL = require('./../src/xAPIWrapper');

  ADL.XAPIWrapper.changeConfig({
    "endpoint": "https://lrs.adlnet.gov/xapi/",
    "user": "tom",
    "password": "1234"
  });


  var stmt = new ADL.Statement(
    new ADL.Agent(ADL.XAPIWrapper.hash("mailto:user@example.com"), 'aaron'),
    new ADL.Verb('http://adlnet.gov/expapi/verbs/npm_testing', 'npm_testing'),
    new ADL.Activity("act:statement_posts/node_test"));

  stmt.timestamp = (new Date()).toISOString();

  console.log(stmt);

  ADL.XAPIWrapper.postStatement(stmt, function(r){console.log("Success");});

})();
