/*
 * Provides an easy constructor for xAPI agent objects
 * @param {string} identifier   One of the Inverse Functional Identifiers specified in the spec.
 *     That is, an email, a hashed email, an OpenID, or an account object.
 *     See (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#inversefunctional)
 * @param {string} [name]   The natural-language name of the agent
 */
class Agent {
  constructor(identifier, name)
  {
    this.objectType = 'Agent';

    if (name)
      this.name = name;

    // figure out what type of identifier was given
    if(identifier) {
      if( identifier.mbox || identifier.mbox_sha1sum || identifier.openid || identifier.account ) {
        Object.assign(this, identifier);
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
      else if( identifier.homePage && identifier.name ){
        this.account = identifier;
      }
    }
  };
  toString(){
    return JSON.stringify(this, null, '  ');
  };
  isValid()
  {
    return (this.mbox != undefined || this.mbox_sha1sum != undefined || this.openid != undefined
            || (this.account != undefined && this.account.homePage != undefined && this.account.name != undefined))
            && (!this.objectType || this.objectType==="Agent");
  };

  show(){
    console.log(this.toString());
  };

  getType(){ return "Agent" };

  getId(){ return this.mbox || this.openid || this.mbox_sha1sum || (this.account && this.account.homePage && this.account.name) };
  getIdString(){
      let id = this.mbox || this.openid || this.mbox_sha1sum;
      if (!id && this.account)
            return `${this.account.homePage}:${this.account.name}`;

      return id || 'unknown';
  };

  getDisplay(){
    if (!this.isValid())
      return null;

    return this.name || this.getIdString();
  };
}

/*
 * A type of agent, can contain multiple agents
 * @param {string} [identifier]   (optional if `members` specified) See Agent.
 * @param {string} [members]    An array of Agents describing the membership of the group
 * @param {string} [name]   The natural-language name of the agent
 */
class Group {
  constructor(identifier, members, name)
  {
    this.objectType = 'Group';

    if (name)
      this.name = name;

    if (members && this.isValidMembers(members))
      this.member = members;

    if (identifier) {
      // first argument is a Group object - validate it
      if (identifier.objectType === "Group") {
        // validate members if specified
        let validMembers = false;
        if (identifier.member) {
          if (!this.isValidMembers(identifier.member)) {
            return;
          }
          validMembers = true;
        }

        // validate IRI if specified
        let validId = false;
        if (identifier.mbox || identifier.mbox_sha1sum || identifier.openid) {
          validId = true;
        } else if (identifier.account) {
          if (!(identifier.account.homePage && identifier.account.name)) {
            return;
          }
          validId = true;
        }

        // copy over properties
        if (validMembers || validId) {
          Object.assign(this, identifier);
        }
      }
      // determine IRI type
      else {
        if( /^mailto:/.test(identifier) ){
          this.mbox = identifier;
        }
        else if( /^[0-9a-f]{40}$/i.test(identifier) ){
          this.mbox_sha1sum = identifier;
        }
        else if( /^http[s]?:/.test(identifier) ){
          this.openid = identifier;
        }
        else if( identifier.homePage && identifier.name ){
          this.account = identifier;
        }
      }
    }
  }
  toString(){
    return JSON.stringify(this, null, '  ');
  };
  isValid(){
    return ((this.mbox != undefined || this.mbox_sha1sum != undefined || this.openid != undefined
            || (this.account != undefined && this.account.homePage && this.account.name))
            || (this.member != undefined && this.isValidMembers(this.member))) && (this.objectType != undefined && this.objectType === "Group");
  };
  isValidMembers(members){
    if (!members) return false;

    if (Array.isArray(members) && members.length > 0) {
      for (let i = 0; i < members.length; i++) {
        if (members[i].objectType == "Group" || members[i].hasOwnProperty('member'))
          return false;
      }
    } else {
      console.log(`Invalid parameter: members=${members}`);
      return false;
    }

    return true;
  }

  show(){
    console.log(this.toString());
  };

  getType(){ return "Group" };

  getId(){ return this.mbox || this.openid || this.mbox_sha1sum || (this.account && this.account.homePage && this.account.name) };
  getIdString(){
      let id = this.mbox || this.openid || this.mbox_sha1sum;
      if (!id) {
        id = 'unknown';
        if (this.account) {
          id = `${this.account.homePage}:${this.account.name}`;
        } else if (this.member && this.isValidMembers(this.member)) {
          id = `Anonymous Group`
        }
      }

      return id;
  };

  getDisplay(){
    if (!this.isValid())
      return null;

    return this.name || this.getIdString();
  };
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { Agent, Group };
} else {
  window.ADL.Agent = Agent;
  window.ADL.Group = Group;
}
