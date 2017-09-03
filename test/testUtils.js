describe('Utils Test:', () => {

    let should, Util;

    let defObject, defDisplay, enOnly, invDisplay;

    let stmt, subStmt;

    before(() => {
        onBrowser = false;
        if (typeof window !== 'undefined') {
            onBrowser = true;
            Util = ADL.Util;
        }
        else {
            should = require('should');
            Util = require('./../src/Utils');
        }

        defObject = {
            "id": "http://from.user/act1",
            "objectType": "StatementRef",
            "definition": {
                "name": {
                    "en-US": "soccer",
                    "fr": "football",
                    "de": "foossball"
                }
            }
        }
        defDisplay = {
            "id": "http://verb.com/do2",
            "display": {
                "fr": "recommander",
                "de": "empfehlen",
                "es": "recomendar",
                "en": "recommend"
            }
        };
        enOnly = {
            "id": "http://verb.com/do3",
            "display": {
                "en-US": "initialized"
            }
        };
        invDisplay = {
            "id": "http://verb.com/do4",
            "display": {
                "fr": "établi",
                "de": "etabliert"
            }
        };
        stmt = {
            "actor": {
                "member": ["joe"],
                "objectType": "Group"
            },
            "verb": {
                "id": "http://verb.com/do5"
            },
            "object": {
                "id": "http://from.user/act5"
            }
        };
        subStmt = {
            "verb": {
                "id": "http://example.com/confirmed",
                "display": {
                    "en": "confirmed"
                }
            },
            "actor": {
                "mbox": "mailto:agent@example.com",
                "objectType": "Agent"
            },
            "object": {
                "id": "9e13cefd-53d3-4eac-b5ed-2cf6693903bb",
                "objectType": "StatementRef"
            },
            "objectType": "SubStatement"
        };
    });

    describe('GetLang', () => {
        it('should get the language from the browser or node', () => {
            (Util.getLang()).should.eql("en-US");
        });
    });

    describe('GetLangVal', () => {
        it('should get an object definition name', () => {
            (Util.getLangVal(defObject.definition.name)).should.eql("soccer");
        });
        it('should get the en if the en-US is not available', () => {
            (Util.getLangVal(defDisplay.display)).should.eql("recommend");
        });
        it('should get a verb display', () => {
            (Util.getLangVal(enOnly.display)).should.eql("initialized");
        });
        it('should return the first display option if language code does not match any of the keys', () => {
            ("undefined").should.eql(typeof Util.getLangVal(invDisplay.display));
        });
        it('should throw out junk', () => {
            ("undefined").should.eql(typeof Util.getLangVal(stmt.actor));
            ("undefined").should.eql(typeof Util.getLangVal(stmt.verb));
            ("undefined").should.eql(typeof Util.getLangVal(stmt.object));
            ("undefined").should.eql(typeof Util.getLangVal(stmt));
        });
        it('should get the proper display if given a proper dictionary even a couple levels deep', () => {
            (Util.getLangVal(subStmt.verb.display)).should.eql(subStmt.verb.display.en);
        });
        it('should quit if we pass in nothing to it', () => {
            ("undefined").should.eql(typeof Util.getLangVal());
        });
    });

});
