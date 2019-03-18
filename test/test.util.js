describe('testing xAPI utilities', function () {

    /*
     * Object.keys polyfill for IE8
     * From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
     * @private
     */
    var ObjectKeys = Object.keys || (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
            throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
            }

            if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
                }
            }
            }
            return result;
        };
    }());

    var  assert, ADL, s1, s2, s3, s4, s5, s6;

    before(function () {

        if (typeof window !== 'undefined') {
            assert = window.assert;
            ADL = window.ADL;
        } else {
            assert = require('./libs/assert');
            require('../examples/stmtBank.js');
            require('../src/xapi-util');
            ADL = global.ADL;
        }

        // Force the environment language setting to be `en-US`
        ADL.language = 'en-US';

        s1 =  {"actor":{"mbox":"mailto:tom@tom.com", "openid":"openid", "mbox_sha1sum":"mbox_sha1sum", "account":"wrapperTesting"}, "verb":{"id":"http://verb.com/do1"}, "object":{"id":"http://from.tom/act1", "objectType":"StatementRef", "definition":{"name":{"en-US": "soccer", "fr": "football", "de": "foossball"}}}};

        s2 = {"actor":{"openid":"openid", "mbox_sha1sum":"mbox_sha1sum", "account":"wrapperTesting", "name":"joe"}, "verb":{"id":"http://verb.com/do2", "display": {"fr": "recommander", "de": "empfehlen", "es": "recomendar", "en": "recommend"}}, "object":{"objectType":"Agent", "mbox":"mailto:joe@mail.com"}};

        s3 = {"actor":{"mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum", "account":"wrapperTesting"}, "verb":{"id":"http://verb.com/do3"}, "object":{"objectType":"Group", 'notid':"http://from.tom/act3", "member":["joe"], "name":"obiwan", "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum"}};

        s4 = {"actor":{ "account":{"homePage":'http://adlnet.gov/test', "name":"wrapperTesting"}}, "verb":{ "id":"http://verb.com/do4", "display":{ "en-US":"initialized" }}, "object":{ "notid":"http://from.tom/act4", "objectType":"SubStatement", "actor":{ "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum", "account":"wrapperTesting"}, "verb":{ "id":"http://verb.com/do3"}, "object":{ "objectType":"Group", "notid":"http://from.tom/act3", "member":["joe"], "mbox_sha1sum":"randomstringthatmakesnosensembox_sha1sum"}}};

        s5 = {"actor":{"member":["joe"], "objectType": "Group"}, "verb":{"id":"http://verb.com/do5"}, "object":{"id":"http://from.tom/act5"}};

        s6 = {"actor":{"some":"thing else"}, "verb":{"id":"http://verb.com/do6", "display":{"fr": "établi", "de": "etabliert"}}, "object":{"some":'thing else'}};

    });


    describe('test getLang', function () {
        it('should get the language from the browser or node', function () {
            assert.equal((ADL.xapiutil.getLang()), "en-US");
        });
    });

    describe('test getLangVal', function () {
        it('should get an object definition name', function () {
            assert.equal((ADL.xapiutil.getLangVal(s1.object.definition.name)), "soccer");
        });
        it('should get a verb display', function () {
            assert.equal((ADL.xapiutil.getLangVal(s4.verb.display)), "initialized");
        });
        it('should get the en if the en-US is not available', function () {
            assert.equal((ADL.xapiutil.getLangVal(s2.verb.display)), "recommend");
        });
        it('should return the first display option if language code does not match any of the keys', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal(s6.verb.display));
        });
        it('should throw out junk', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal(s5.actor));
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal(s5.verb));
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal(s5.object));
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal(s5));
        });
        it('should quit if we pass in nothing to it', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getLangVal());
        });
        it('should get the proper display if given a proper dictionary even a couple levels deep', function () {
            assert.equal((ADL.xapiutil.getLangVal(ADL.stmts['Object-Sub-Statement-with-StatementRef'].object.verb.display)), ADL.stmts['Object-Sub-Statement-with-StatementRef'].object.verb.display.en);
        });
    });

    describe('test getMoreStatements', function () {
        if (typeof window !== 'undefined')
        {
            it('should test getMoreStatements in the browser', function () {
                ADL.xapiutil.getMoreStatements(3, function (stmts) {
                    assert.equal(stmts.length, 16);
                    assert.isArray(stmts);
                    assert.isObject(stmts);
                    assert.equal(ADL.xapiutil.getLang(), "en-US");
                    assert.equal(ADL.xapiutil.getActorId(stmts[0].actor), ADL.stmts["Base-Statement"].actor.mbox);
                    assert.equal(ADL.xapiutil.getVerbDisplay(stmts[7].verb), ADL.stmts["Verb-User-Defined"].verb.display['en-US']);
                    assert.equal(ADL.xapiutil.getObjectType(stmts[10].object), ADL.stmts["Object-Agent"].object.objectType);
                });
            });
            it('should handle only a single request with no additional calls', function () {
                (ADL.xapiutil.getMoreStatements(0, function (stmts) {
                    assert.equal(stmts.length, 4);
                    assert.isArray(stmts);
                    assert.equal(ADL.xapiutil.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(ADL.xapiutil.getVerbDisplay(stmts[3].verb), ADL.stmts["Actor-Anon-Group"].verb.display['en-US']);
                    assert.equal(ADL.xapiutil.getObjectIdString(stmts[2].object), ADL.stmts["Actor-Id-Group"].object.id);
                }));
            });
            it('should handle only a single additional call', function () {
                (ADL.xapiutil.getMoreStatements(1, function (stmts) {
                    assert.equal(stmts.length, 8);
                    assert.isArray(stmts);
                    assert.equal(ADL.xapiutil.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(ADL.xapiutil.getVerbDisplay(stmts[7].verb), ADL.stmts["Verb-User-Defined"].verb.display['en-US']);
                    assert.equal(ADL.xapiutil.getObjectIdString(stmts[4].object), ADL.stmts["Actor-Mbox"].object.id);
                }));
            });
            it('should handle a request which overreaches the available statements', function () {
                (ADL.xapiutil.getMoreStatements(100, function (stmts) {
                    assert.equal(stmts.length, ObjectKeys(ADL.stmts).length);
                    assert.isArray(stmts);
                    assert.equal(ADL.xapiutil.getActorIdString(stmts[0].actor), ADL.stmts['Base-Statement'].actor.mbox);
                    assert.equal(ADL.xapiutil.getVerbDisplay(stmts[15].verb), ADL.stmts["Result"].verb.display['en-US']);
                    assert.equal(ADL.xapiutil.getObjectType(stmts[12].object), ADL.stmts["Object-StatementRef"].object.objectType);
                }));
            });
        }
    });

    describe('test getActorId', function () {
        it('should get the mailbox of the actor', function () {
            assert.equal((ADL.xapiutil.getActorId(s1.actor)), s1.actor.mbox);
        });
        it('should get the openid of the actor', function () {
            assert.equal((ADL.xapiutil.getActorId(s2.actor)), s2.actor.openid);
        });
        it('should get the mailbox sha1sum of the actor', function () {
            assert.equal((ADL.xapiutil.getActorId(s3.actor)), s3.actor.mbox_sha1sum);
        });
        it('should get the account of the actor', function () {
            assert.equal((ADL.xapiutil.getActorId(s4.actor)), s4.actor.account);
        });
        it('should get the account of an identified group', function () {
            assert.equal((ADL.xapiutil.getActorId(ADL.stmts["Actor-Id-Group"].actor)), ADL.stmts["Actor-Id-Group"].actor.account);
        });
        it('should be undefined for an anonymous group', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getActorId(ADL.stmts["Actor-Anon-Group"].actor));
            assert.equal(("undefined"), typeof ADL.xapiutil.getActorId(s5.actor));
        });
    });

    describe('test getActorIdString', function () {
        it('should return the mailbox of the actor', function () {
            assert.isString((ADL.xapiutil.getActorIdString(s1.actor)));
            assert.equal((ADL.xapiutil.getActorIdString(s1.actor)), s1.actor.mbox);
        });
        it('should return the openid', function () {
            assert.equal((ADL.xapiutil.getActorIdString(s2.actor)), s2.actor.openid);
        });
        it('should return the sha1sum of the mailbox', function () {
            assert.equal((ADL.xapiutil.getActorIdString(s3.actor)), s3.actor.mbox_sha1sum);
        });
        it('should return a String of the account', function () {
            assert.isString((ADL.xapiutil.getActorIdString(s4.actor)));
            assert.equal((ADL.xapiutil.getActorIdString(s4.actor)), s4.actor.account.homePage + ":" + s4.actor.account.name);
        });
        it('should return a String of the member', function () {
            assert.isString((ADL.xapiutil.getActorIdString(s5.actor)));
            assert.equal((ADL.xapiutil.getActorIdString(s5.actor)), "Anon Group " + s5.actor.member);
        });
        it ('should return unknown if nothing is present', function () {
            assert.equal((ADL.xapiutil.getActorIdString(s6.actor)), "unknown");
        });
    });

    describe('test getActorDisplay', function () {
        it('should get the actor name', function () {
            assert.equal((ADL.xapiutil.getActorDisplay(s2.actor)), s2.actor.name);
        });
        it('should get the actor id string', function () {
            assert.equal((ADL.xapiutil.getActorDisplay(s1.actor)), s1.actor.mbox);
        });
    });

    describe('test getVerbDisplay', function () {
        it('should return undefined with no verb', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getVerbDisplay());
        });
        it('should get the verb in the proper language', function () {
            assert.equal((ADL.xapiutil.getVerbDisplay(s4.verb)), s4.verb.display['en-US']);
        });
        it('should get the verb id', function () {
            assert.equal((ADL.xapiutil.getVerbDisplay(s1.verb)), s1.verb.id)
        })
    });

    describe('test getObjectType', function () {
        it('should get the objectType when available', function () {
            assert.equal((ADL.xapiutil.getObjectType(s1.object)), s1.object.objectType);
        });
        it('should assume "Activity" if object id available', function () {
            assert.equal((ADL.xapiutil.getObjectType(s5.object)), 'Activity');
        });
        it('should assume "Agent" if neither id nor objectType available', function () {
            assert.equal((ADL.xapiutil.getObjectType(s6.object)), 'Agent');
        });
    });

    describe('test getObjectId', function () {
        it('should get the id', function () {
            assert.equal((ADL.xapiutil.getObjectId(s1.object)), s1.object.id);
        });
        it('should get the actor id, if no id and objectType is Agent', function () {
            assert.equal((ADL.xapiutil.getObjectId(s2.object)), s2.object.mbox);
        });
        it('should get the actor id, if no id and objectType is Group', function () {
            assert.equal((ADL.xapiutil.getObjectId(s3.object)), ADL.xapiutil.getActorId(s3.object));
        });
        it('should get the actor id, if Statement Ref', function () {
            assert.equal((ADL.xapiutil.getObjectId(ADL.stmts["Object-StatementRef"].object)), ADL.stmts["Object-StatementRef"].object.id);
        });
        it('should get the actor id, if Sub-Statement', function () {
            assert.equal(("undefined"), typeof ADL.xapiutil.getObjectId(ADL.stmts["Object-Sub-Statement"].object));
        });
        it('should return undefined, if malformed', function () {
            assert.equal(('undefined'), typeof ADL.xapiutil.getObjectId(s6.object));
        });
    });

    describe('test getObjectIdString', function () {
        it('should get the id', function () {
            assert.isString((ADL.xapiutil.getActorIdString(s1.object)));
            assert.equal((ADL.xapiutil.getObjectIdString(s1.object)), s1.object.id);
        });
        it('should get the Actor Id String, if no id and type is Agent or Group', function () {
            assert.isString((ADL.xapiutil.getObjectIdString(s2.object)));
            assert.equal((ADL.xapiutil.getObjectIdString(s2.object)), s2.object.mbox);
        });
        it('should get the Actor-Verb-Object String, if no id and type is SubStatement', function () {
            assert.isString((ADL.xapiutil.getObjectIdString(s4.object)));
            assert.equal((ADL.xapiutil.getObjectIdString(s4.object)), s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
        it('should return unknown, if those do not work', function () {
            assert.equal(('unknown'), ADL.xapiutil.getObjectIdString(s6.object));
        });
        it('should return unknown, if you pass it junk', function () {
            assert.equal(("unknown"), ADL.xapiutil.getObjectIdString(ADL.stmts));
            assert.equal(("unknown"), ADL.xapiutil.getObjectIdString('stmts'));
            assert.equal(("unknown"), ADL.xapiutil.getObjectIdString());
        });
    });

    describe('test getObjectDisplay', function () {
        it('should get the object definition name', function () {
            assert.equal((ADL.xapiutil.getObjectDisplay(s1.object)), s1.object.definition.name[ADL.xapiutil.getLang()]);
        });
        it('or should get the object name', function () {
            assert.equal((ADL.xapiutil.getObjectDisplay(s3.object)), s3.object.name);
        });
        it('or should get the object id', function () {
            assert.equal((ADL.xapiutil.getObjectDisplay(s5.object)), s5.object.id);
        });
        it('or should get the object actor id', function () {
            assert.equal((ADL.xapiutil.getObjectDisplay(s2.object)), s2.object.mbox);
        });
        it('or should get the Actor-Verb-Object String', function () {
            assert.equal((ADL.xapiutil.getObjectDisplay(s4.object)), s3.actor.mbox_sha1sum + ":" + s3.verb.id + ":" + s3.object.mbox_sha1sum);
        });
        it('should handle junk', function () {
            assert.equal(('unknown'), ADL.xapiutil.getObjectDisplay(s3));
            assert.equal(('unknown'), ADL.xapiutil.getObjectDisplay());
            assert.equal(('unknown'), ADL.xapiutil.getObjectDisplay('s3'));
        });
    });

});
