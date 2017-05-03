(function(ADL){

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


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      module.exports = {
        Agent: Agent,
        Group: Group
      };
    }

})(typeof module === 'undefined' ? window.ADL = window.ADL || {} : this);
