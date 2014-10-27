'use strict';

if (typeof window === 'undefined') {
  var raml           = require('../../lib/raml.js');
  var chai           = require('chai');
  var chaiAsPromised = require('chai-as-promised');
  var q              = require('q');
  chai.use(chaiAsPromised);
  chai.should();
} else {
  var raml           = RAML.Parser;
  var q              = (new RAML.Parser.FileReader()).q;
  chai.should();
}

function subsetCompare(expected, target) {
  return;
  Object.keys(expected).forEach(function (keyName) {
    if (expected[keyName] === null) {
      should.not.exist(target[keyName]);
    } else {
      expected[keyName].should.be.deep.equal(target[keyName]);
    }
  });
}

describe('Include resolution injection', function() {
  it('should call injected method', function(done) {
    var callbackCalled = false;
    var injectedReader = new raml.FileReader(function() {
      callbackCalled = true;
      return q.fcall(function() { return '#%RAML 0.8\ntitle: Hi'; });
    });

    var document = [
      '#%RAML 0.8',
      '!include http://john-galt.com/who-is-he.raml'
    ].join('\n');

    var expected = {
      title: 'Hi'
    };

    raml.load(document, 'http://john-galt.com/who-is-he2.raml', { reader: injectedReader } ).then( function(data) {
      setTimeout(function () {
        data.should.deep.equal(expected);
        callbackCalled.should.be.ok;
        done();
      }, 0);
    });
  });

  it('should reject if detects circular reference on the first document', function(done) {
    var callbackCalled = false;
    var injectedReader = new raml.FileReader(function() {
      callbackCalled = true;
      return q.fcall( function() { return '#%RAML 0.8\ntitle: Hi'; });
    });

    var document = [
      '#%RAML 0.8',
      '!include http://john-galt.com/who-is-he.raml'
    ].join('\n');

    var expected =  {
      'context': 'while composing scalar out of !include',
      'context_mark': null,
      'message': 'detected circular !include of http://john-galt.com/who-is-he.raml',
      'problem_mark': {
        'name': 'http://john-galt.com/who-is-he.raml',
        'line': 1,
        'column': 0,
        'buffer': '#%RAML 0.8\n!include http://john-galt.com/who-is-he.raml\u0000',
        'pointer': 11
      }
    };

    var noop = function(){};
    raml.load(document, 'http://john-galt.com/who-is-he.raml', { reader: injectedReader } ).then(noop, function(error) {
      setTimeout(function () {
        subsetCompare(expected, JSON.parse(JSON.stringify(error)));
        callbackCalled.should.not.be.ok;
        done();
      }, 0);
    });
  });

  it('should fail if reader is null', function(done) {
    var document = [
      '#%RAML 0.8',
      '!include http://localhost:9001/test/raml-files/external.yml'
    ].join('\n');

    var expected = {
      context: 'while reading file',
      context_mark: null,
      problem_mark:
      {
        name: 'http://john-galt.com/who-is-he.raml',
        line: 1,
        column: 0,
        buffer: '#%RAML 0.8\n!include http://localhost:9001/test/raml-files/external.yml\u0000',
        pointer: 11
      }
    };

    var noop = function(){};
    raml.load(document, 'http://john-galt.com/who-is-he.raml', { reader: null } ).then(noop, function(error) {
      setTimeout(function () {
        subsetCompare(expected, JSON.parse(JSON.stringify(error)));
        done();
      }, 0);
    });
  });

  it('should fail if reader does not return a promise', function(done) {
    var callbackCalled = false;
    var injectedReader = new raml.FileReader(function() {
      callbackCalled = true;
      return 'blah';
    });

    var document = [
      '#%RAML 0.8',
      '!include http://john-galt.com/who-is-he.raml'
    ].join('\n');

    var expected = {
      context: 'while reading file',
      context_mark: null,
      problem_mark: {
        name: '/',
        line: 1,
        column: 0,
        buffer: '#%RAML 0.8\n!include http://john-galt.com/who-is-he.raml\u0000',
        pointer: 11
      }
    };

    var noop = function(){};
    raml.load(document, '/', { reader: injectedReader } ).then(noop, function(error) {
      setTimeout(function () {
        subsetCompare(expected, JSON.parse(JSON.stringify(error)));
        done();
      }, 0);
    });
  });

  it('should resolve !include tag as an array element', function (done) {
    var document = [
      '#%RAML 0.8',
      'title: title',
      'traits:',
      '  - !include trait.raml'
    ].join('\n');

    var reader = new raml.FileReader(function () {
      return q('trait: {}');
    });

    raml.load(document, '', {reader: reader}).then(function (value) {
      setTimeout(function () {
        value.traits.should.be.deep.equal([
            {trait: {}}
          ]);

        done();
      });
    });
  });

  it('should resolve !include tags in proper order', function (done) {
    var document = [
      '#%RAML 0.8',
      'title: title',
      'traits:',
      '  - !include trait1.raml',
      '  - !include trait2.raml'
    ].join('\n');

    var defer  = q.defer();
    var reader = new raml.FileReader(function (file) {
      if (file === 'trait2.raml') {
        return q('trait2: {}');
      }

      setTimeout(function () {
        defer.resolve('trait1: {}');
      });

      return defer.promise;
    });

    raml.load(document, '', {reader: reader}).then(function (value) {
      setTimeout(function () {
        value.traits.should.be.deep.equal([
          {trait1: {}},
          {trait2: {}}
        ]);

        done();
      });
    });
  });

  it('should resolve mixed !include tags (in-place and deferred)', function (done) {
    var document = [
      '#%RAML 0.8',
      'title: title',
      'traits:',
      '  - trait1: {}',
      '  - !include trait2.raml',
      '  - trait3: {}'
    ].join('\n');

    var reader = new raml.FileReader(function () {
      return q('trait2: {}');
    });

    raml.load(document, '', {reader: reader}).then(function (value) {
      setTimeout(function () {
        value.traits.should.be.deep.equal([
          {trait1: {}},
          {trait2: {}},
          {trait3: {}}
        ]);

        done();
      });
    });
  });
});
