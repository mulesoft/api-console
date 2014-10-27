/* global RAML, describe, it */

'use strict';

if (typeof window === 'undefined') {
  var raml           = require('../../lib/raml.js');
  var chai           = require('chai');
  var chaiAsPromised = require('chai-as-promised');

  chai.should();
  chai.use(chaiAsPromised);
} else {
  var raml           = RAML.Parser;

  chai.should();
}

describe('Errors', function () {
  it('should be at right line/column when new document content started without special marker right after end marker', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: API 1',
      '...',
      'title: API 2'
    ].join('\n')).then(function () {}, function (error) {
      setTimeout(function () {
        error.problem_mark.should.exist;
        error.problem_mark.line.should.be.equal(4);
        error.problem_mark.column.should.be.equal(0);
        done();
      }, 0);
    });
  });
  it('should be at right line/column when new document content started without special marker right after end marker', function (done) {
    raml.load([
            '#%RAML 0.8',
            '*Note:* You may provide an optional *scope* parameter to request additional permissions outside of the â€œbasicâ€ permissions scope. [Learn more about scope](http://instagram.com/developer/authentication/#scop'
    ].join('\n')).then(function () {}, function (error) {
      setTimeout(function () {
        error.problem_mark.should.exist;
        error.problem_mark.line.should.be.equal(1);
        error.problem_mark.column.should.be.equal(113);
        done();
      }, 0);
    });
});
});
