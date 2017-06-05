{

  /*
   * Describes an object that an agent interacts with
   * @param {string} id   The unique activity IRI
   * @param {string} name   An English-language identifier for the activity, or a Language Map
   * @param {string} description   An English-language description of the activity, or a Language Map
   */
  class Activity {
    constructor(id, name, description)
    {
      // if first arg is activity, copy everything over
      if(id && id.id){
        let act = id;
        for(let i in act){
          this[i] = act[i];
        }
        return;
      }

      this.objectType = 'Activity';
      this.id = id;

      if (name) {
        this.definition = {};
        this.definition.name = (typeof(name)==='string'|| name instanceof String) ? {'en-US': name} : name;
      }

      if (description) {
        this.definition = this.definition || {};
        this.definition.description = (typeof(description)==='string'|| description instanceof String) ? {'en-US': description} : description;
      }
    };
    toString(){
      return JSON.stringify(this);
    };
    isValid(){
      return this.id && (!this.objectType || this.objectType === 'Activity');
    };
  }


  /*
   * An object that refers to a separate statement
   * @param {string} id   The UUID of another statement
   */
  class StatementRef {
    constructor(id)
    {
      if(id && id.id){
        for(let i in id){
          this[i] = id[i];
        }
        return;
      }

      this.objectType = 'StatementRef';
      this.id = id;
    };
    toString(){
      return `statement(${this.id})`;
    };
    isValid(){
      return this.id && this.objectType && this.objectType === 'StatementRef';
    };
  }


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { Activity, StatementRef };
  } else {
    window.ADL.Activity = Activity;
    window.ADL.StatementRef = StatementRef;
  }

}
