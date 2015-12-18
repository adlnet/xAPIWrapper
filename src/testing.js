/*This is testing out some scenarios and work arounds
once you are done - delete this */

var utils = require('./mymodule').xapiutil;

console.log('hello whirled');

var stmt = {
    "id": "431f6a8d-8b0b-4e3b-a9ee-aafd71099b02",
    "actor": {
        "mbox": "mailto:andrew.creighton.ctr@adlnet.gov",
        "objectType": "Agent"
    },
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/listened"
    },
    "object": {
        "id": "http://classical.music.adlnet.gov",
        "objectType": "Activity"
    },
    "timestamp": "2015-12-17T20:45:00.649228+00:00",
    "stored": "2015-12-17T20:45:00.649228+00:00",
    "authority": {
        "mbox": "mailto:iitsecDemo2015@adlnet.gov",
        "name": "iitsecDemo",
        "objectType": "Agent"
    },
    "version": "1.0.1"
}

console.log(utils);

console.log(utils.getLang());

console.log(utils.getActorId(stmt.actor));
console.log(utils.getActorIdString(stmt.actor));
console.log(utils.getActorDisplay(stmt.actor));
console.log(utils.getVerbDisplay(stmt.verb));
console.log(utils.getObjectType(stmt));
console.log(utils.getObjectId(stmt));
console.log(utils.getObjectIdString(stmt));
console.log(utils.getObjectDisplay(stmt));

utils.getMoreStatements(2, function(r) {
    console.log(r, "cha-ching\n\n");
});
