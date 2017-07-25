/*
 * Really only provides a convenient language map
 * @param {string} id   The IRI of the action taken
 * @param {string} [description]    An English-language description, or a Language Map
 */
class Verb {
  constructor(id, description)
  {
    // if passed a verb object then copy and return
    if( id && id.id ){
      Object.assign(this, id);
      return;
    }

    // save id and build language map
    if (id)
     this.id = id;

    if(description)
     this.display = (typeof(description) === 'string' || description instanceof String) ? {'en-US': description} : description;
  };
  toString(){
    return JSON.stringify(this, null, '  ');
  };
  isValid(){
    return this.id;
  };

  show(){
    console.log(this.toString());
  };

  getId(){ return (this.display) ? Util.getLangVal(this.display) : this.id };
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Verb;
} else {
  window.ADL.Verb = Verb;
}
