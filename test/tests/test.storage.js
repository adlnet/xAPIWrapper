after(function () {
    localStorage.clear();
});

describe('testing storage', function () {

    describe('test constructor', function () {

        it('should create a new Storage object', function () {

            (new ADL.Storage()).should.be.an.Object;

        });

    });


    describe('test basic save / get statements', function () {

        var sto, stmt, s2, s3, s4;

        before(function () {

            sto = new ADL.Storage();

            stmt = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do"}, object:{id:"http://from.tom/act"}};

            s2 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do2"}, object:{id:"http://from.tom/act2"}};

            s3 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do3"}, object:{id:"http://from.tom/act3"}};

            s4 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/do4"}, object:{id:"http://from.tom/act4"}};

        });

        it("should perform basic save/retrieve process", function () {

            sto.clear();

            (sto.hasStatements()).should.be.false();

            (sto.saveStatements(stmt)).should.be.String();

            (sto.hasStatements()).should.be.true();

            var ret = sto.getStatements();

            (ret).should.be.Object();

            (ret).should.eql(stmt);

            (sto.hasStatements()).should.be.false();

        });

        it("should also handle strings", function () {

            sto.clear();

            (sto.hasStatements()).should.be.false();

            (sto.saveStatements(JSON.stringify(stmt))).should.be.String();

            (sto.hasStatements()).should.be.true();

            var ret = sto.getStatements();

            (ret).should.be.String();

            (ret).should.equal(JSON.stringify(stmt));

            (sto.hasStatements()).should.be.false();

        });

        it("should queue multiple sets of saved statements", function () {

            sto.clear();

            (sto.hasStatements()).should.be.false();

            (sto.saveStatements(stmt)).should.be.String();

            (sto.saveStatements(s2)).should.be.String();

            (sto.hasStatements()).should.be.true();

            var ret = sto.getStatements();

            (ret).should.be.Object();

            (ret).should.eql(stmt);

            (sto.hasStatements()).should.be.true();

            ret = sto.getStatements();

            (ret).should.be.Object();

            (ret).should.eql(s2);

            (sto.hasStatements()).should.be.false();

        });

        it("should return a requested key and continue to queue the rest", function () {

            sto.clear();

            (sto.hasStatements()).should.be.false();

            (sto.saveStatements(stmt)).should.be.String();

            (sto.saveStatements(s2)).should.be.String();

            var s3key = sto.saveStatements(s3);

            (s3key).should.be.String();

            (sto.saveStatements(s4)).should.be.String();

            (sto.hasStatements()).should.be.true();

            (sto.getStatements(s3key)).should.eql(s3);

            (sto.hasStatements()).should.be.true();

            (sto.getStatements()).should.eql(stmt);

            (sto.hasStatements()).should.be.true();

            (sto.getStatements()).should.eql(s2);

            (sto.hasStatements()).should.be.true();

            (sto.getStatements()).should.eql(s4);

            (sto.hasStatements()).should.be.false();

        });

        it("should add timestamp, if missing", function () {

            sto.clear();
            var stmtloc1 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp"}, object:{id:"http://from.tom/act/test-timestamp"}};

            (stmtloc1.timestamp === undefined).should.be.true();

            sto.saveStatements(stmtloc1);

            var ret = sto.getStatements();

            (ret.actor).should.eql(stmtloc1.actor);

            (ret.verb).should.eql(stmtloc1.verb);

            (ret.object).should.eql(stmtloc1.object);

            (ret.timestamp).should.not.be.null();

        });

        it("should add timestamps, if missing", function () {

            sto.clear();
            var stmtloc1 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp"}, object:{id:"http://from.tom/act/test-timestamp"}};

            var stmtloc2 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp2"}, object:{id:"http://from.tom/act/test-timestamp2"}};

            var stmtloc3 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp3"}, object:{id:"http://from.tom/act/test-timestamp3"}};

            (stmtloc1.timestamp === undefined).should.be.true();

            (stmtloc2.timestamp === undefined).should.be.true();

            (stmtloc3.timestamp === undefined).should.be.true();

            var ins = [stmtloc1, stmtloc2, stmtloc3];

            sto.saveStatements(ins);

            var ret = sto.getStatements();

            for (var idx in ret) {
                (ret[idx].actor).should.eql(ins[idx].actor);

                (ret[idx].verb).should.eql(ins[idx].verb);

                (ret[idx].object).should.eql(ins[idx].object);

                (ret[idx].timestamp).should.not.be.null();
            }

        });

        it("should leave existing timestamps alone", function () {

            sto.clear();
            var stmtloc1 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp"}, object:{id:"http://from.tom/act/test-timestamp"}, timestamp: (new Date()).toISOString()};

            var stmtloc2 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp2"}, object:{id:"http://from.tom/act/test-timestamp2"}};

            var stmtloc3 = {actor:{mbox:"mailto:tom@tom.com"}, verb:{id:"http://verb.com/test-timestamp3"}, object:{id:"http://from.tom/act/test-timestamp3"}};

            (stmtloc1.timestamp === undefined).should.be.false();

            (stmtloc2.timestamp === undefined).should.be.true();

            (stmtloc3.timestamp === undefined).should.be.true();

            var ins = [stmtloc1, stmtloc2, stmtloc3];

            sto.saveStatements(ins);

            var ret = sto.getStatements();

            (ret[0].timestamp).should.equal(stmtloc1.timestamp);

            for (var idx in ret) {
                (ret[idx].actor).should.eql(ins[idx].actor);

                (ret[idx].verb).should.eql(ins[idx].verb);

                (ret[idx].object).should.eql(ins[idx].object);

                (ret[idx].timestamp).should.not.be.null();
            }

        });

    });



    describe('test isStorageAvailable', function () {});


    describe('test getStorageSize', function () {});

});
