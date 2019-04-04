describe('testing xAPI utilities', function () {

    var s1, s2, s3, s4, s5, s6;

    before(function () {

        var onBrowser = false;
        if (typeof window !== 'undefined') {
            util = ADL.xapiutil;
            onBrowser = true;
            stmts = ADL.stmts;
        }
        else {
            util = require('../../src/xapi-util').xapiutil;
            should = require('should');
            stmts = require('../../examples/stmtBank.js').stmts;
        }

        s1 =  {"actor":{"mbox":"mailto:tom@tom.com", "openid":"openid", "mbox_sha1sum":"mbox_sha1sum", "account":"wrapperTesting"}, "verb":{"id":"http://verb.com/do1"}, "object":{"id":"http://from.tom/act1", "objectType":"StatementRef", "definition":{"name":{"en-US": "soccer", "fr": "football", "de": "foossball"}}}};

        s2 = {"actor":{"openid":"openid", "mbox_sha1sum":"mbox_sha1sum", "account":"wrapperTesting", "name":"joe"}, "verb":{"id":"http://verb.com/do2", "display": {"fr": "recommander", "de": "empfehlen", "es": "recomendar", "en": "recommend"}}, "object":{"objectType":"Agent", "mbox":"mailto:joe@mail.com"}};

        s3 = {"actor":{"mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum", "account":"wrapperTesting"}, "verb":{"id":"http://verb.com/do3"}, "object":{"objectType":"Group", 'notid':"http://from.tom/act3", "member":["joe"], "name":"obiwan", "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum"}};

        s4 = {"actor":{ "account":{"homePage":'http://adlnet.gov/test', "name":"wrapperTesting"}}, "verb":{ "id":"http://verb.com/do4", "display":{ "en-US":"initialized" }}, "object":{ "notid":"http://from.tom/act4", "objectType":"SubStatement", "actor":{ "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum", "account":"wrapperTesting"}, "verb":{ "id":"http://verb.com/do3"}, "object":{ "objectType":"Group", "notid":"http://from.tom/act3", "member":["joe"], "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum"}}};

        s5 = {"actor":{"member":["joe"], "objectType": "Group"}, "verb":{"id":"http://verb.com/do5"}, "object":{"id":"http://from.tom/act5"}};

        s6 = {"actor":{"some":"thing else"}, "verb":{"id":"http://verb.com/do6", "display":{"fr": "établi", "de": "etabliert"}}, "object":{"some":'thing else'}};
    });


    describe('test getLang', function () {
        //tests relies on environment settings being 'en-US'
        //failing this test does not necessarily mean that the code is bad, change "en-US" to match your proper environment setting
        it('should get the language from the browser or node', function () {
            assert.equal((util.getLang()), "en-US");
        });
    });

    describe('test getLangVal', function () {
        it('should get an object definition name', function () {
            assert.equal((util.getLangVal(s1.object.definition.name)), "soccer");
        });
        it('should get a verb display', function () {
            assert.equal((util.getLangVal(s4.verb.display)), "initialized");
        });
        it('should get the en if the en-US is not available', function () {
            assert.equal((util.getLangVal(s2.verb.display)), "recommend");
        });
        it('should return the first display option if language code does not match any of the keys', function () {
            assert.equal(("undefined"), typeof util.getLangVal(s6.verb.display));
        });
        it('should throw out junk', function () {
            assert.equal(("undefined"), typeof util.getLangVal(s5.actor));
            assert.equal(("undefined"), typeof util.getLangVal(s5.verb));
            assert.equal(("undefined"), typeof util.getLangVal(s5.object));
            assert.equal(("undefined"), typeof util.getLangVal(s5));
        });
        it('should quit if we pass in nothing to it', function () {
            assert.equal(("undefined"), typeof util.getLangVal());
        });
        it('should get the proper display if given a proper dictionary even a couple levels deep', function () {
            assert.equal((util.getLangVal(ADL.stmts['Object-Sub-Statement-with-StatementRef'].object.verb.display)), ADL.stmts['Object-Sub-Statement-with-StatementRef'].object.verb.display.en);
        });
    });

    describe('test getMoreStatements', function () {
        if (typeof window !== 'undefined')
        {
            it('should test getMoreStatements in the browser', function () {
                util.getMoreStatements(3, function (stmts) {
                    assert.equal(stmts.length, 16);
                    assert.isArray(stmts);
                    assert.isObject(stmts);
                    assert.equal(util.getLang(), "en-US");
                    assert.equal(util.getActorId(stmts[0].actor), ADL.stmts["Base-Statement"].actor.mbox);
                    assert.equal(util.getVerbDisplay(stmts[7].verb), ADL.stmts["Verb-User-Defined"].verb.display['en-US']);
                    assert.equal(util.getObjectType(stmts[10].object), ADL.stmts["Object-Agent"].object.objectType);
                });
            });
            it('should handle only a single request with no additional calls', function () {
                (util.getMoreStatements(0, function (stmts) {
                    assert.equal(stmts.length, 4);
                    assert.isArray(stmts);
                    assert.equal(util.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(util.getVerbDisplay(stmts[3].verb), ADL.stmts["Actor-Anon-Group"].verb.display['en-US']);
                    assert.equal(util.getObjectIdString(stmts[2].object), ADL.stmts["Actor-Id-Group"].object.id);
                }));
            });
            it('should handle only a single additional call', function () {
                (util.getMoreStatements(1, function (stmts) {
                    assert.equal(stmts.length, 8);
                    assert.isArray(stmts);
                    assert.equal(util.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(util.getVerbDisplay(stmts[7].verb), ADL.stmts["Verb-User-Defined"].verb.display['en-US']);
                    assert.equal(util.getObjectIdString(stmts[4].object), ADL.stmts["Actor-Mbox"].object.id);
                }));
            });
            it('should handle a request which overreaches the available statements', function () {
                (util.getMoreStatements(100, function (stmts) {
                    assert.equal(stmts.length, Object.keys(ADL.stmts).length);
                    assert.isArray(stmts);
                    assert.equal(util.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(util.getVerbDisplay(stmts[15].verb), ADL.stmts["Result"].verb.display['en-US']);
                    assert.equal(util.getObjectType(stmts[12].object), ADL.stmts["Object-StatementRef"].object.objectType);
                }));
            });
        }
    });

    describe('test getActorId', function () {
        it('should get the mailbox of the actor', function () {
            assert.equal((util.getActorId(s1.actor)), s1.actor.mbox);
        });
        it('should get the openid of the actor', function () {
            assert.equal((util.getActorId(s2.actor)), s2.actor.openid);
        });
        it('should get the mailbox sha1sum of the actor', function () {
            assert.equal((util.getActorId(s3.actor)), s3.actor.mbox_sha1sum);
        });
        it('should get the account of the actor', function () {
            assert.equal((util.getActorId(s4.actor)), s4.actor.account);
        });
        it('should get the account of an identified group', function () {
            assert.equal((util.getActorId(ADL.stmts["Actor-Id-Group"].actor)), ADL.stmts["Actor-Id-Group"].actor.account);
        });
        it('should be undefined for an anonymous group', function () {
            assert.equal(("undefined"), typeof util.getActorId(ADL.stmts["Actor-Anon-Group"].actor));
            assert.equal(("undefined"), typeof util.getActorId(s5.actor));
        });
    });

    describe('test getActorIdString', function () {
        it('should return the mailbox of the actor', function () {
            assert.isString((util.getActorIdString(s1.actor)));
            assert.equal((util.getActorIdString(s1.actor)), s1.actor.mbox);
        });
        it('should return the openid', function () {
            assert.equal((util.getActorIdString(s2.actor)), s2.actor.openid);
        });
        it('should return the sha1sum of the mailbox', function () {
            assert.equal((util.getActorIdString(s3.actor)), s3.actor.mbox_sha1sum);
        });
        it('should return a String of the account', function () {
            assert.isString((util.getActorIdString(s4.actor)));
            assert.equal((util.getActorIdString(s4.actor)), s4.actor.account.homePage + ":" + s4.actor.account.name);
        });
        it('should return a String of the member', function () {
            assert.isString((util.getActorIdString(s5.actor)));
            assert.equal((util.getActorIdString(s5.actor)), "Anon Group " + s5.actor.member);
        });
        it ('should return unknown if nothing is present', function () {
            assert.equal((util.getActorIdString(s6.actor)), "unknown");
        });
    });

    describe('test getActorDisplay', function () {
        it('should get the actor name', function () {
            assert.equal((util.getActorDisplay(s2.actor)), s2.actor.name);
        });
        it('should get the actor id string', function () {
            assert.equal((util.getActorDisplay(s1.actor)), s1.actor.mbox);
        });
    });

    describe('test getVerbDisplay', function () {
        it('should return undefined with no verb', function () {
            assert.equal(("undefined"), typeof util.getVerbDisplay());
        });
        it('should get the verb in the proper language', function () {
            assert.equal((util.getVerbDisplay(s4.verb)), s4.verb.display['en-US']);
        });
        it('should get the verb id', function () {
            assert.equal((util.getVerbDisplay(s1.verb)), s1.verb.id)
        })
    });

    describe('test getObjectType', function () {
        it('should get the objectType when available', function () {
            assert.equal((util.getObjectType(s1.object)), s1.object.objectType);
        });
        it('should assume "Activity" if object id available', function () {
            assert.equal((util.getObjectType(s5.object)), 'Activity');
        });
        it('should assume "Agent" if neither id nor objectType available', function () {
            assert.equal((util.getObjectType(s6.object)), 'Agent');
        });
    });

    describe('test getObjectId', function () {
        it('should get the id', function () {
            assert.equal((util.getObjectId(s1.object)), s1.object.id);
        });
        it('should get the actor id, if no id and objectType is Agent', function () {
            assert.equal((util.getObjectId(s2.object)), s2.object.mbox);
        });
        it('should get the actor id, if no id and objectType is Group', function () {
            assert.equal((util.getObjectId(s3.object)), util.getActorId(s3.object));
        });
        it('should get the actor id, if Statement Ref', function () {
            assert.equal((util.getObjectId(ADL.stmts["Object-StatementRef"].object)), ADL.stmts["Object-StatementRef"].object.id);
        });
        it('should get the actor id, if Sub-Statement', function () {
            assert.equal(("undefined"), typeof util.getObjectId(ADL.stmts["Object-Sub-Statement"].object));
        });
        it('should return undefined, if malformed', function () {
            assert.equal(('undefined'), typeof util.getObjectId(s6.object));
        });
    });

    describe('test getObjectIdString', function () {
        it('should get the id', function () {
            assert.isString((util.getActorIdString(s1.object)));
            assert.equal((util.getObjectIdString(s1.object)), s1.object.id);
        });
        it('should get the Actor Id String, if no id and type is Agent or Group', function () {
            assert.isString((util.getObjectIdString(s2.object)));
            assert.equal((util.getObjectIdString(s2.object)), s2.object.mbox);
        });
        it('should get the Actor-Verb-Object String, if no id and type is SubStatement', function () {
            assert.isString((util.getObjectIdString(s4.object)));
            assert.equal((util.getObjectIdString(s4.object)), s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
        it('should return unknown, if those do not work', function () {
            assert.equal(('unknown'), util.getObjectIdString(s6.object));
        });
        it('should return unknown, if you pass it junk', function () {
            assert.equal(("unknown"), util.getObjectIdString(ADL.stmts));
            assert.equal(("unknown"), util.getObjectIdString('stmts'));
            assert.equal(("unknown"), util.getObjectIdString());
        });
    });

    describe('test getObjectDisplay', function () {
        it('should get the object definition name', function () {
            assert.equal((util.getObjectDisplay(s1.object)), s1.object.definition.name[util.getLang()]);
        });
        it('or should get the object name', function () {
            assert.equal((util.getObjectDisplay(s3.object)), s3.object.name);
        });
        it('or should get the object id', function () {
            assert.equal((util.getObjectDisplay(s5.object)), s5.object.id);
        });
        it('or should get the object actor id', function () {
            assert.equal((util.getObjectDisplay(s2.object)), s2.object.mbox);
        });
        it('or should get the Actor-Verb-Object String', function () {
            assert.equal((util.getObjectDisplay(s4.object)), s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
        it('should handle junk', function () {
            assert.equal(('unknown'), util.getObjectDisplay(s3));
            assert.equal(('unknown'), util.getObjectDisplay());
            assert.equal(('unknown'), util.getObjectDisplay('s3'));
        });
    });

})
