after(function () {
    //i've got nothing to go in here
});

describe('testing xAPI utilities', function () {

    var util, s1, s2, s3, s4, s5, s6;

    //is it worth having a before to set up statements to be used throughout
    before(function () {

        if (typeof ADL !== 'undefined')
            util = ADL.xapiutil;
        else {
            util = require('../../src/xapi-util').xapiutil;
            should = require('should');
        }
// console.log(util);
        s1 = {actor:{mbox:"mailto:tom@tom.com", openid:"openid", mbox_sha1sum:"mbox_sha1sum", account:"wrapperTesting"}, verb:{id:"http://verb.com/do1"}, object:{id:"http://from.tom/act1", objectType:"StatementRef", definition:{name:{"en-US":"soccer", "fr": "football", "de":"foossball"}}}};

        s2 = {actor:{openid:"openid", mbox_sha1sum:"mbox_sha1sum", account:"wrapperTesting", name:"joe"}, verb:{id:"http://verb.com/do2"}, object:{objectType:"Agent", mbox:"mailto:joe@mail.com"}};

        s3 = {actor:{mbox_sha1sum:"randomstringthatmakesnosensembox_sha1sum", account:"wrapperTesting"}, verb:{id:"http://verb.com/do3"}, object:{objectType:"Group", notid:"http://from.tom/act3", member:["joe"], name:"obiwan", mbox_sha1sum:"randomstringthatmakesnosensembox_sha1sum"}};

        s4 = {actor:{ account:{homePage:'http://adlnet.gov/test', name:"wrapperTesting"}}, verb:{ id:"http://verb.com/do4", "display":{ "en-US":"initialized" }}, object:{ notid:"http://from.tom/act4", objectType:"SubStatement", actor:{ mbox_sha1sum:"randomstringthatmakesnosensembox_sha1sum", account:"wrapperTesting"}, verb:{ id:"http://verb.com/do3"}, object:{ objectType:"Group", notid:"http://from.tom/act3", member:["joe"], mbox_sha1sum:"randomstringthatmakesnosensembox_sha1sum"}}};

        s5 = {actor:{member:["joe"]}, verb:{id:"http://verb.com/do5"}, object:{id:"http://from.tom/act5"}};

        s6 = {actor:{some:"thing else"}, verb:{id:"http://verb.com/do6"}, object:{some:'thing else'}};
    });

    describe('test getLang', function () {
        it('should get the language from the browser or node', function () {
            (util.getLang()).should.eql("en-US");
        });
    });

    describe('test getMoreStatements', function () {
        it('should get someone to come back and do this right', function () {
            (util.getLang()).should.eql("en-US");
        });
    });

    describe('test getActorId', function () {
        it('should get the mailbox of the actor', function () {
            (util.getActorId(s1.actor)).should.eql(s1.actor.mbox);
        });
        it('should get the openid of the actor', function () {
            (util.getActorId(s2.actor)).should.eql(s2.actor.openid);
        });
        it('should get the mailbox sha1sum of the actor', function () {
            (util.getActorId(s3.actor)).should.eql(s3.actor.mbox_sha1sum);
        });
        it('should get the account of the actor', function () {
            (util.getActorId(s4.actor)).should.eql(s4.actor.account);
        });
    });

    describe('test getActorIdString', function () {
        it('should return the mailbox of the actor', function () {
            (util.getActorIdString(s1.actor)).should.be.String();
            (util.getActorIdString(s1.actor)).should.eql(s1.actor.mbox);
        });
        it('should return the openid', function () {
            (util.getActorIdString(s2.actor)).should.eql(s2.actor.openid);
        });
        it('should return the sha1sum of the mailbox', function () {
            (util.getActorIdString(s3.actor)).should.eql(s3.actor.mbox_sha1sum);
        });
        it('should return a String of the account', function () {
            (util.getActorIdString(s4.actor)).should.be.String();
            (util.getActorIdString(s4.actor)).should.eql(s4.actor.account.homePage + ":" + s4.actor.account.name);
        });
        it('should return a String of the member', function () {
            (util.getActorIdString(s5.actor)).should.be.String();
            (util.getActorIdString(s5.actor)).should.eql("Anon Group " + s5.actor.member);
        });
        it ('should return unknown if nothing is present', function () {
            (util.getActorIdString(s6.actor)).should.eql("unknown");
        });
    });

    describe('test getActorDisplay', function () {
        it('should get the actor name', function () {
            (util.getActorDisplay(s2.actor)).should.eql(s2.actor.name);
        });
        it('should get the actor id string', function () {
            (util.getActorDisplay(s1.actor).should.eql(s1.actor.mbox))
        });
    });

    describe('test getVerbDisplay', function () {
        it.skip('should return null with no verb', function () {
            (util.getVerbDisplay(null)).should.eql("undefined");
        });
        it('should get the verb in the proper language', function () {
            (util.getVerbDisplay(s4.verb)).should.eql(s4.verb.display['en-US']);
        });
        it('should get the verb id', function () {
            (util.getVerbDisplay(s1.verb).should.eql(s1.verb.id))
        })
    });

    describe('test getObjectType', function () {
        it('should get the objectType when available', function () {
            (util.getObjectType(s1.object)).should.eql(s1.object.objectType);
        });
        it('should assume "Activity" if object id available', function () {
            (util.getObjectType(s5.object).should.eql('Activity'));
        });
        it('should assume "Agent" if neither id nor objectType available', function () {
            (util.getObjectType(s6.object).should.eql('Agent'));
        });
    });

    describe('test getObjectId', function () {
        it('should get the id', function () {
            (util.getObjectId(s1.object)).should.eql(s1.object.id);
        });
        it('should get the actor id, if no id and objectType is Agent', function () {
            (util.getObjectId(s2.object)).should.eql(util.getActorId(s2.object));
        });
        it('should get the actor id, if no id and objectType is Group', function () {
            (util.getObjectId(s3.object)).should.eql(util.getActorId(s3.object));
        });
        it.skip('should return undefined, if malformed', function () {
            (util.getObjectId(s6.object)).should.eql('undefined');
        });
    });

    describe('test getObjectIdString', function () {
        it('should get the id', function () {
            (util.getActorIdString(s1.object)).should.be.String();
            (util.getObjectIdString(s1.object)).should.eql(s1.object.id);
        });
        it('should get the Actor Id String, if no id and type is Agent or Group', function () {
            (util.getObjectIdString(s2.object)).should.be.String();
            (util.getObjectIdString(s2.object)).should.eql(util.getActorIdString(s2.object));
        });
        it('should get the Actor-Verb-Object String, if no id and type is SubStatement', function () {
            (util.getObjectIdString(s4.object)).should.be.String();
            (util.getObjectIdString(s4.object)).should.eql(s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
        it.skip('should return undefined, if those do not work', function () {
            (util.getObjectIdString(s6.object).should.eql(undefined));
        });
    });

    describe('test getObjectDisplay', function () {
        it('should get the object definition name', function () {
            (util.getObjectDisplay(s1.object)).should.eql(s1.object.definition.name[util.getLang()]);
        });
        it('or should get the object name', function () {
            (util.getObjectDisplay(s3.object)).should.eql(s3.object.name);
        });
        it('or should get the object id', function () {
            (util.getObjectDisplay(s5.object)).should.eql(s5.object.id);
        });
        it('or should get the object actor id', function () {
            (util.getObjectDisplay(s2.object)).should.eql(s2.object.mbox);
        });
        it('or should get the Actor-Verb-Object String', function () {
            (util.getObjectDisplay(s4.object)).should.eql(s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
    });


})
