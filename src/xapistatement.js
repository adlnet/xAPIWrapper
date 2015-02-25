(function(ADL){

  function _getobj(obj, path){
    var parts = path.split('.');

    var part = parts[0];
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
   * XAPIStatement - a convenience class to wrap statement objects
   *
   * This sub-API is supposed to make it easier to author valid xAPI statements
   * by adding constructors and encouraging best practices. All objects in this
   * API are fully JSON-compatible, so anything expecting an xAPI statement can
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
   * A convenient JSON-compatible xAPI statement wrapper
   * All args are optional, but the statement may not be complete or valid
   * Can also pass an Agent IFI, Verb ID, and an Activity ID in lieu of these args
   * @param {string} [actor]   The Agent or Group committing the action described by the statement
   * @param {string} [verb]   The Verb for the action described by the statement
   * @param {string} [object]   The receiver of the action. An Agent, Group, Activity, SubStatement, or StatementRef
   * @example
   * var stmt = new ADL.XAPIStatement(
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
  var XAPIStatement = function(actor,verb,object)
  {

    // initialize

    // if first arg is an xapi statement, parse
    if( actor && actor.actor && actor.verb && actor.object ){
      var stmt = actor;
      for(var i in stmt){
        if(i != 'actor' && i != 'verb' && i != 'object')
          this[i] = stmt[i];
      }
      actor = stmt.actor;
      verb = stmt.verb;
      object = stmt.object;
    }
    
    if(actor){
      if( actor instanceof Agent )
        this.actor = actor;
      else if(actor.objectType === 'Agent' || !actor.objectType)
        this.actor = new Agent(actor);
      else if(actor.objectType === 'Group')
        this.actor = new Group(actor);
    }
    else this.actor = null;
    
    if(verb){
      if( verb instanceof Verb )
        this.verb = verb;
      else
        this.verb = new Verb(verb);
    }
    else this.verb = null;

    // decide what kind of object was passed
    if(object)
    {
      if( object.objectType === 'Activity' || !object.objectType ){
        if( object instanceof Activity )
          this.object = object;
        else
          this.object = new Activity(object);
      }
      else if( object.objectType === 'Agent' ){
        if( object instanceof Agent )
          this.object = object;
        else
          this.object = new Agent(object);
      }
      else if( object.objectType === 'Group' ){
        if( object instanceof Group )
          this.object = object;
        else
          this.object = new Group(object);
      }
      else if( object.objectType === 'StatementRef' ){
        if( object instanceof StatementRef )
          this.object = object;
        else
          this.object = new StatementRef(object);
      }
      else if( object.objectType === 'SubStatement' ){
        if( object instanceof SubStatement )
          this.object = object;
        else
          this.object = new SubStatement(object);
      }
      else this.object = null;
    }
    else this.object = null;


    this.generateId = function(){
      this.id = ADL.ruuid();
    };
  };

  XAPIStatement.prototype.toString = function(){
    return this.actor.toString() + " " + this.verb.toString() + " " + this.object.toString();
  };

  XAPIStatement.prototype.isValid = function(){
    return this.actor && this.actor.isValid() 
      && this.verb && this.verb.isValid() 
      && this.object && this.object.isValid();
  };

  XAPIStatement.prototype.generateRegistration = function(){
    _getobj(this,'context').registration = ADL.ruuid();
  };

  XAPIStatement.prototype.addParentActivity = function(activity){
    _getobj(this,'context.contextActivities.parent[]').push(new Activity(activity));
  };

  XAPIStatement.prototype.addGroupingActivity = function(activity){
    _getobj(this,'context.contextActivities.grouping[]').push(new Activity(activity));
  };

  XAPIStatement.prototype.addOtherContextActivity = function(activity){
    _getobj(this,'context.contextActivities.other[]').push(new Activity(activity));
  };

  
  /*
   * Provides an easy constructor for xAPI agent objects
   * @param {string} identifier   One of the Inverse Functional Identifiers specified in the spec.
   *     That is, an email, a hashed email, an OpenID, or an account object.
   *     See (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#inversefunctional)
   * @param {string} [name]   The natural-language name of the agent
   */
  var Agent = function(identifier, name)
  {
    this.objectType = 'Agent';
    this.name = name;

    // figure out what type of identifier was given
    if( identifier && (identifier.mbox || identifier.mbox_sha1sum || identifier.openid || identifier.account) ){
      for(var i in identifier){
        this[i] = identifier[i];
      }
    }
    else if( /^mailto:/.test(identifier) ){
      this.mbox = identifier;
    }
    else if( /^[0-9a-f]{40}$/i.test(identifier) ){
      this.mbox_sha1sum = identifier;
    }
    else if( /^http[s]?:/.test(identifier) ){
      this.openid = identifier;
    }
    else if( identifier && identifier.homePage && identifier.name ){
      this.account = identifier;
    }
  };
  Agent.prototype.toString = function(){
    return this.name || this.mbox || this.openid || this.mbox_sha1sum || this.account.name;
  };
  Agent.prototype.isValid = function()
  {
    return this.mbox || this.mbox_sha1sum || this.openid
      || (this.account.homePage && this.account.name)
      || (this.objectType === 'Group' && this.member);
  };

  
  /*
   * A type of agent, can contain multiple agents
   * @param {string} [identifier]   (optional if `members` specified) See Agent.
   * @param {string} [members]    An array of Agents describing the membership of the group
   * @param {string} [name]   The natural-language name of the agent
   */
  var Group = function(identifier, members, name)
  {
    Agent.call(this, identifier, name);
    this.member = members;
    this.objectType = 'Group';
  };
  Group.prototype = new Agent;

  
  /*
   * Really only provides a convenient language map
   * @param {string} id   The IRI of the action taken
   * @param {string} [description]    An English-language description, or a Language Map
   */
  var Verb = function(id, description)
  {
    // if passed a verb object then copy and return
    if( id && id.id ){
      for(var i in id){
        this[i] = id[i];
      }
      return;
    }

    // save id and build language map
    this.id = id;
    if(description)
    {
      if( typeof(description) === 'string' || description instanceof String ){
        this.display = {'en-US': description};
      }
      else {
        this.display = description;
      }
    }
  };
  Verb.prototype.toString = function(){
    if(this.display && (this.display['en-US'] || this.display['en']))
      return this.display['en-US'] || this.display['en'];
    else
      return this.id;
  };
  Verb.prototype.isValid = function(){
    return this.id;
  };

  
  /*
   * Describes an object that an agent interacts with
   * @param {string} id   The unique activity IRI
   * @param {string} name   An English-language identifier for the activity, or a Language Map
   * @param {string} description   An English-language description of the activity, or a Language Map
   */
  var Activity = function(id, name, description)
  {
    // if first arg is activity, copy everything over
    if(id && id.id){
      var act = id;
      for(var i in act){
        this[i] = act[i];
      }
      return;
    }
    
    this.objectType = 'Activity';
    this.id = id;
    if( name || description )
    {
      this.definition = {};
      
      if( typeof(name) === 'string' || name instanceof String )
        this.definition.name = {'en-US': name};
      else if(name)
        this.definition.name = name;
      
      if( typeof(description) === 'string' || description instanceof String )
        this.definition.description = {'en-US': description};
      else if(description)
        this.definition.description = description;
    }
  };
  Activity.prototype.toString = function(){
    if(this.definition && this.definition.name && (this.definition.name['en-US'] || this.definition.name['en']))
      return this.definition.name['en-US'] || this.definition.name['en'];
    else
      return this.id;
  };
  Activity.prototype.isValid = function(){
    return this.id && (!this.objectType || this.objectType === 'Activity');
  };
  
  /*
   * An object that refers to a separate statement
   * @param {string} id   The UUID of another xAPI statement
   */
  var StatementRef = function(id){
    if(id && id.id){
      for(var i in id){
        this[i] = id[i];
      }
    }
    else {
      this.objectType = 'StatementRef';
      this.id = id;
    }
  };
  StatementRef.prototype.toString = function(){
    return 'statement('+this.id+')';
  };
  StatementRef.prototype.isValid = function(){
    return this.id && this.objectType && this.objectType === 'StatementRef';
  };
  
  /*
   * A self-contained statement as the object of another statement
   * See XAPIStatement for constructor details
   * @param {string} actor   The Agent or Group committing the action described by the statement
   * @param {string} verb   The Verb for the action described by the statement
   * @param {string} object   The receiver of the action. An Agent, Group, Activity, or StatementRef
   */
  var SubStatement = function(actor, verb, object){
    XAPIStatement.call(this,actor,verb,object);
    this.objectType = 'SubStatement';

    delete this.id;
    delete this.stored;
    delete this.version;
    delete this.authority;
  };
  SubStatement.prototype = new XAPIStatement;
  SubStatement.prototype.toString = function(){
    return '"' + SubStatement.prototype.prototype.toString.call(this) + '"';
  };
  
  XAPIStatement.Agent = Agent;
  XAPIStatement.Group = Group;
  XAPIStatement.Verb = Verb;
  XAPIStatement.Activity = Activity;
  XAPIStatement.StatementRef = StatementRef;
  XAPIStatement.SubStatement = SubStatement;
  ADL.XAPIStatement = XAPIStatement;

}(window.ADL = window.ADL || {}));
