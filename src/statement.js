// Require modules when using node
if (typeof module !== 'undefined') {
  Agent = require('./Agent').Agent;
  Group = require('./Agent').Group;
  Verb = require('./Verb');
  Activity = require('./Object').Activity;
  StatementRef = require('./Object').StatementRef;
  Util = require('./Utils.js');
} else {
  Agent = window.ADL.Agent;
  Group = window.ADL.Group;
  Verb = window.ADL.Verb;
  Activity = window.ADL.Activity;
  StatementRef = window.ADL.StatementRef;
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
  constructor(actor=null, verb=null, object=null){
    // if first arg is an xapi statement, parse
    if( actor && actor.actor && actor.verb && actor.object ){
      Object.assign(this, actor);
      verb = actor.verb;
      object = actor.object;
      actor = actor.actor;
    }

    this.actor = actor;
    if(actor){
      if((actor.objectType === 'Agent' || !actor.objectType) && !(actor instanceof Agent))
        this.actor = new Agent(actor);
      else if(actor.objectType === 'Group' && !(actor instanceof Group))
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

    this.id = Util.ruuid();
  };

  toString(){
    return `\n${JSON.stringify(this, null, '  ')}\n`;
  };

  isValid(){
    return (this.actor != undefined && this.actor.isValid()
      && this.verb != undefined && this.verb.isValid()
      && this.object != undefined && this.object.isValid());
  };

  show(){
    console.log(this.toString());
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
 * @param {string} actor   The Agent or Group committing the action described by the statement
 * @param {string} verb   The Verb for the action described by the statement
 * @param {string} object   The receiver of the action. An Agent, Group, Activity, or StatementRef
 */
class SubStatement {
  constructor(actor=null, verb=null, object=null){
    this.objectType = 'SubStatement';

    if (actor) {
      // First arg is substatement
      if (actor.actor && actor.verb && actor.object) {
        Object.assign(this, actor);
        verb = actor.verb;
        object = actor.object;
        actor = actor.actor;
      }

      if(actor.objectType === 'Agent' || !actor.objectType) {
        this.actor = (actor instanceof Agent) ? agent : new Agent(actor);
      }
      else if(actor.objectType === 'Group') {
        this.actor = (actor instanceof Group) ? actor : new Group(actor);
      }
    }

    if (verb) {
      this.verb = (verb instanceof Verb) ? verb : new Verb(verb);
    }

    if (object) {
      if(object.objectType === 'Activity' || !object.objectType){
        this.object = (object instanceof Activity) ? object : new Activity(object);
      }
      else if(object.objectType === 'Agent'){
        this.object = (object instanceof Agent) ? object : new Agent(object);
      }
      else if(object.objectType === 'Group'){
        this.object = (object instanceof Group) ? object : new Group(object);
      }
      else if(object.objectType === 'StatementRef'){
        this.object = (object instanceof StatementRef) ? object : new StatementRef(object);
      }
    }
  };
  toString(){
    return JSON.stringify(this, null, '  ');
  };

  isValid(){
    return (this.actor != undefined && this.actor.isValid()
            && this.verb != undefined && this.verb.isValid()
            && this.object != undefined && this.object.objectType!=this.objectType && this.object.isValid())
            && this.objectType==="SubStatement" && !this.hasOwnProperty("id")
            && !this.hasOwnProperty("stored") && !this.hasOwnProperty("version")
            && !this.hasOwnProperty("authority");
  };

  show(){
    console.log(this.toString());
  };

  getType(){ return "SubStatement" };

  getDisplay(){
    if (!this.isValid())
      return null;

    return `${this.actor.getId()}:${this.verb.getDisplay()}:${this.object.getId()}`;
  }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { Statement, SubStatement };
} else {
  window.ADL.Statement = Statement;
  window.ADL.SubStatement = SubStatement;
}
