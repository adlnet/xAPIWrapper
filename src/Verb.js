{

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
         for(let i in id){
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
     toString(){
       if(this.display && (this.display['en-US'] || this.display['en']))
         return this.display['en-US'] || this.display['en'];
       else
         return this.id;
     };
     isValid(){
       return this.id;
     };
   }


   if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
     module.exports = Verb;
   } else {
     window.Verb = Verb;
   }

}
