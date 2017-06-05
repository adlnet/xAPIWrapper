{

  // Require modules when using node
  if (typeof module !== 'undefined') {
    var Agent = require('./Agent').Agent;
    var Group = require('./Agent').Group;
    var Verb = require('./Verb');
    var Activity = require('./Object').Activity;
    var StatementRef = require('./Object').StatementRef;
  } else {
    var Agent = window.ADL.Agent;
    var Group = window.ADL.Group;
    var Verb = window.ADL.Verb;
    var Activity = window.ADL.Activity;
    var StatementRef = window.ADL.StatementRef;
  }

  function _getobj(obj, path){
    let parts = path.split('.');

    let part = parts[0];
    path = parts.slice(1).join('.');

    if( !obj[part] ){
      if( /\[\]$/.test(part) ){
        part = part.slice(0,-2);
        obj[part] = [];
      }
      else
        obj[part] = {};
    }

    if( !path )
      return obj[part];
    else
      return _getobj(obj[part], path);
  }
  /*******************************************************************************
   * Statement - a convenience class to wrap statement objects
   *
   * This sub-API is supposed to make it easier to author valid statements
   * by adding constructors and encouraging best practices. All objects in this
   * API are fully JSON-compatible, so anything expecting an statement can
   * take an improved statement and vice versa.
   *
   * A working knowledge of what exactly the LRS expects is still expected,
   * but it's easier to map an 'I did this' statement to xAPI now.
   *
   * Tech note: All constructors also double as shallow clone functions. E.g.
   *
   *   var activity1 = new Activity('A walk in the park');
   *   var activity2 = new Activity(activity1);
   *   var activity3 = new Activity(stmt_from_lrs.object);
   *
   *******************************************************************************/

  /*
   * A convenient JSON-compatible statement wrapper
   * All args are optional, but the statement may not be complete or valid
   * Can also pass an Agent IFI, Verb ID, and an Activity ID in lieu of these args
   * @param {string} [actor]   The Agent or Group committing the action described by the statement
   * @param {string} [verb]   The Verb for the action described by the statement
   * @param {string} [object]   The receiver of the action. An Agent, Group, Activity, SubStatement, or StatementRef
   * @example
   * var stmt = new Statement(
   *     'mailto:steve.vergenz.ctr@adlnet.gov',
   *    'http://adlnet.gov/expapi/verbs/launched',
   *    'http://vwf.adlnet.gov/xapi/virtual_world_sandbox'
   * );
   * >> {
   * "actor": {
   *     "objectType": "Agent",
   *     "mbox": "mailto:steve.vergenz.ctr@adlnet.gov" },
   * "verb": {
   *     "id": "http://adlnet.gov/expapi/verbs/launched" },
   * "object": {
   *     "objectType": "Activity",
   *     "id": "http://vwf.adlnet.gov/xapi/virtual_world_sandbox" }}
   */
  class Statement {
    constructor(actor=null,verb=null,object=null)
    {
      // if first arg is an xapi statement, parse
      if( actor && actor.actor && actor.verb && actor.object ){
        let stmt = actor;
        for(let i in stmt){
          if(i != 'actor' && i != 'verb' && i != 'object')
            this[i] = stmt[i];
        }
        actor = stmt.actor;
        verb = stmt.verb;
        object = stmt.object;
      }

      this.actor = actor;
      if(actor){
        if(actor.objectType === 'Agent' || !actor.objectType)
          this.actor = new Agent(actor);
        else if(actor.objectType === 'Group')
          this.actor = new Group(actor);
      }

      this.verb = verb;
      if(verb && !(verb instanceof Verb)){
        this.verb = new Verb(verb);
      }

      // decide what kind of object was passed
      this.object = object;
      if(object)
      {
        if( (object.objectType === 'Activity' || !object.objectType) && !(object instanceof Activity) ){
          this.object = new Activity(object);
        }
        else if( object.objectType === 'Agent' && !(object instanceof Agent) ){
          this.object = new Agent(object);
        }
        else if( object.objectType === 'Group' && !(object instanceof Group) ){
          this.object = new Group(object);
        }
        else if( object.objectType === 'StatementRef' && !(object instanceof StatementRef) ){
          this.object = new StatementRef(object);
        }
        else if( object.objectType === 'SubStatement' && !(object instanceof SubStatement) ){
          this.object = new SubStatement(object);
        }
      }

      this.generateId = () => {
        this.id = Util.ruuid();
      };
    };

    toString(){
      return `${this.actor.toString()} ${this.verb.toString()} ${this.object.toString()}`;
    };

    isValid(){
      return this.actor && this.actor.isValid()
        && this.verb && this.verb.isValid()
        && this.object && this.object.isValid();
    };

    generateRegistration(){
      _getobj(this,'context').registration = Util.ruuid();
    };

    addParentActivity(activity){
      _getobj(this,'context.contextActivities.parent[]').push(new Activity(activity));
    };

    addGroupingActivity(activity){
      _getobj(this,'context.contextActivities.grouping[]').push(new Activity(activity));
    };

    addOtherContextActivity(activity){
      _getobj(this,'context.contextActivities.other[]').push(new Activity(activity));
    };
  }


  /*
   * A self-contained statement as the object of another statement
   * See Statement for constructor details
   * @param {string} actor   The Agent or Group committing the action described by the statement
   * @param {string} verb   The Verb for the action described by the statement
   * @param {string} object   The receiver of the action. An Agent, Group, Activity, or StatementRef
   */
  class SubStatement extends Statement {
    constructor(actor, verb, object){
      super(actor,verb,object);
      this.objectType = 'SubStatement';

      delete this.id;
      delete this.stored;
      delete this.version;
      delete this.authority;
    };
    toString(){
      return `"${super.toString()}"`;
    };
  }


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { Statement, SubStatement };
  } else {
    window.ADL.Statement = Statement;
    window.ADL.SubStatement = SubStatement;
  }

}
