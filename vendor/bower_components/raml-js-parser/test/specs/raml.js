'use strict';

if (typeof window === 'undefined') {
  var raml           = require('../../lib/raml.js');
  var chai           = require('chai');
  var should         = chai.should();
  var chaiAsPromised = require('chai-as-promised');
  chai.use(chaiAsPromised);
} else {
  var raml           = RAML.Parser;
  chai.should();
}

describe('RAML', function () {
  it('should report error via promises when remote resource is unavalable', function (done) {
    raml.loadFile('/404.ERROR').should.be.rejected.and.notify(done);
  });

  it('should throw its own exception if !include resource is unavalable (RT-260)', function (done) {
    var include = 'http://john-galt.com/who-is-he.raml';
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: !include ' + include,
    ].join('\n')).then(function () {}, function (error) {
      setTimeout(function () {
        error.message.should.include('cannot fetch ' + include);
        error.problem_mark.line.should.be.equal(2);
        error.problem_mark.column.should.be.equal(7);
        done();
      }, 0);
    });
  });
});
