if (typeof module !== 'undefined') {
  // Create ADL namespace
  var ADL = module.exports;

  // Require all modules (resource pool for all dependencies)
  (function(){

    this.Agent = require('./Agent.js').Agent;
    this.Group = require('./Agent.js').Group;
    this.Verb = require('./Verb.js');
    this.verbs = require('./verbs.js');
    this.Statement = require('./Statement.js');
    this.Activity = require('./Object.js').Activity;
    this.StatementRef = require('./Object.js').StatementRef;
    this.SubStatement = require('./Object.js').SubStatement;
    this.Util = require('./Utils.js');
    // this.LRS = require('./LRS.js');

  }).apply(ADL);
}
