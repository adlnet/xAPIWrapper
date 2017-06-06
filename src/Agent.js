{

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
        return this.mbox || this.mbox_sha1sum || this.openid
          || (this.account.homePage && this.account.name);
      };

      show(){
        console.log(this.toString());
      };

      getType(){ return "Agent" };

      getId(){ return this.mbox || this.openid || this.mbox_sha1sum || this.account };
      getIdString(){
          let id = this.mbox || this.openid || this.mbox_sha1sum;
          if (!id && this.account)
                return `${this.account.homePage}:${this.account.name}`;

          return id || 'unknown';
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

        if (identifier) {
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

        if (members)
          this.member = members;

        if (name)
          this.name = name;

      }
      toString(){
        return JSON.stringify(this, null, '  ');
      };
      isValid()
      {
        return this.mbox || this.mbox_sha1sum || this.openid
          || (this.account.homePage && this.account.name)
          || (this.objectType === 'Group' && this.member);
      };

      show(){
        console.log(this.toString());
      };

      getType(){ return "Group" };

      getId(){ return this.mbox || this.openid || this.mbox_sha1sum || this.account };
      getIdString(){
          let id = this.mbox || this.openid || this.mbox_sha1sum;
          if (!id && this.account)
                return `${this.account.homePage}:${this.account.name}`;

          return id;
      };
    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      module.exports = { Agent, Group };
    } else {
      window.ADL.Agent = Agent;
      window.ADL.Group = Group;
    }

}
