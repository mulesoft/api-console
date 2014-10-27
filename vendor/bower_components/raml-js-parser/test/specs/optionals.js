/* Reject optional scalar parameters */

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

describe('Optional scalar parameters', function () {
  (function(){
    [
      ['displayName?',': displayName'],
      ['description?',': description'],
      ['is?',': sometrait'],
      ['usage?',': usage'],
      ['type?',': type'],
      ['securedBy?',': securedBy']
    ].forEach(function(property){
      it('should reject scalar optional parameters in an RT', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Title',
          'resourceTypes:',
          '  - failType:',
          '      ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith('property: \'' + property[0] + '\' is invalid in a resource type').and.notify(done);
      });
      });
  })();

  (function(){
    [
      ['displayName?',': displayName'],
      ['pattern?',': pattern'],
      ['default?',': default'],
      ['description?',': description'],
      ['example?',': example'],
      ['minLength?',': 12'],
      ['maxLength?',': 21'],
      ['minimum?',': 1'],
      ['maximum?',': 2'],
      ['type?',': string'],
      ['required?',': false'],
      ['repeat?',': true']
    ].forEach(function(property){
      it('should reject scalar optional parameters in a named paraemter', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Title',
          'resourceTypes:',
          '  - failType:',
          '      uriParameters:',
          '        failParam:',
          '          ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith('unknown property ' + property[0]).and.notify(done);
      });
    });
  })();

  it('should reject scalar optional description in a response', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            description?: description'
    ].join('\n')).should.be.rejectedWith('property: \'description?\' is invalid in a response').and.notify(done);
  });

  it('should reject scalar optional example in a body', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            example?: example'
    ].join('\n')).should.be.rejectedWith('property: \'example?\' is invalid in a response').and.notify(done);
  });

  it('should reject scalar optional schema in a body', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            schema?: schema'
    ].join('\n')).should.be.rejectedWith('property: \'schema?\' is invalid in a response').and.notify(done);
  });

  (function(){
    [
      ['displayName?',': displayName'],
      ['description?',': description'],
      ['usage?',': usage'],
      ['securedBy?',': securedBy']
    ].forEach(function(property){
      it('should reject scalar optional parameters in a trait', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Title',
          'traits:',
          '  - failTrait:',
          '      ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith('property: \'' + property[0] + '\' is invalid in a trait').and.notify(done);
      });
    });
  })();
});
