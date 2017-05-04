(function(ADL){

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
    toString(){
      if(this.definition && this.definition.name && (this.definition.name['en-US'] || this.definition.name['en']))
        return this.definition.name['en-US'] || this.definition.name['en'];
      else
        return this.id;
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
        for(var i in id){
          this[i] = id[i];
        }
      }
      else {
        this.objectType = 'StatementRef';
        this.id = id;
      }
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
  }

})(typeof module !== 'undefined' ? this : window.ADL = window.ADL || {});
