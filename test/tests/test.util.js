after(function () {
    //i've got notyhing to go in here
});

describe('testing xAPI utilities', function () {

    //is it worth having a before to set up statements to be used throughout
    before(function () {
        s1 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do1"}, object:{id:"http://from.tom/act1"}};

        s2 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do2"}, object:{id:"http://from.tom/act2"}};

        s3 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do3"}, object:{id:"http://from.tom/act3"}};

        s4 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do4"}, object:{id:"http://from.tom/act4"}};
    });

    describe('test getLang', function () {
        it('should get the language from the browser or node', function () {
            (null).should.eql("en-US");
        });
    });
})
