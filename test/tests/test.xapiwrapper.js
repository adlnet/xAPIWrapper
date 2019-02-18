after(function () {
  //nothing in here
});

describe('testing xapiwrapper.min.js', function () {

  var ADL, onBrowser, should

  before(function () {

      onBrowser = false;
      if (typeof window !== 'undefined') {
          ADL = window.ADL;
          onBrowser = true;
      }
      else {
          ADL = require('../../dist/xapiwrapper.min');
          should = require('should');
      }
  });

  describe('test ADL API', function () {
      it('should be defined as an object', function () {
          (typeof ADL).should.eql("object");
      });
      it('should able to run the example.html code (an async version)', function (done) {

          var stmt = new ADL.XAPIStatement(
              new ADL.XAPIStatement.Agent(ADL.XAPIWrapper.hash('mailto:steve.vergenz.ctr@adlnet.gov'), 'Steven Vergenz'),
              ADL.verbs.launched,
              new ADL.XAPIStatement.Activity('act:wrapper_test', 'xAPIWrapper test page',
                  'A website that exercises the functions of the xAPIWrapper')
          );
          stmt.generateId();
          stmt.addOtherContextActivity( new ADL.XAPIStatement.Activity('compId:internet_proficiency') );
          stmt.generateRegistration();

          ADL.XAPIWrapper.changeConfig({
              'endpoint': 'https://lrs.adlnet.gov/xapi/'
          });

          ADL.XAPIWrapper.sendStatement(stmt, function(xhr) {
              done();
          });

      });

  });

});
