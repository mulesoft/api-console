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

describe('Traits', function () {
  it('should detect unused trait parameters and throw an exception', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Example',
      'traits:',
      '   - trait1:',
      '       queryParameters:',
      '           param1:',
      '               description: <<param1>>',
      '/:',
      '   get:',
      '       is:',
      '           - trait1:',
      '               param1: value1',
      '               param2: value2'
    ].join('\n')).should.be.rejectedWith('unused parameter: param2').and.notify(done);
  });

  it('should detect unused resource type parameters and throw an exception', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Example',
      'resourceTypes:',
      '   - resourceType1:',
      '       get:',
      '           queryParameters:',
      '               param1:',
      '                   description: <<param1>>',
      '/:',
      '   type:',
      '       resourceType1:',
      '           param1: value1',
      '           param2: value2'
    ].join('\n')).should.be.rejectedWith('unused parameter: param2').and.notify(done);
  });

  it('should be applied via resource type and parameter key', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Test',
      'baseUri: http://www.api.com',
      'resourceTypes:',
      '  - base:',
      '      is: [<<trait>>]',
      '      get:',
      'traits:',
      '  - trait1:',
      '      description: This is the description of HOL trait.',
      '/tags:',
      '  type:',
      '    base:',
      '      trait: trait1',
      '  get:'
    ].join('\n')).should.become({
      title: 'Test',
      baseUri: 'http://www.api.com',
      protocols: [
        'HTTP'
      ],
      resourceTypes: [
        {
          base: {
            is: [
              '<<trait>>'
            ],
            get: null
          }
        }
      ],
      traits: [
        {
          trait1: {
            description: 'This is the description of HOL trait.'
          }
        }
      ],
      resources: [
        {
          type: {
            base: {
              trait: 'trait1'
            }
          },
          relativeUriPathSegments: ['tags'],
          relativeUri: '/tags',
          methods: [
            {
              description: 'This is the description of HOL trait.',
              method: 'get',
              protocols: [
                'HTTP'
              ]
            }
          ]
        }
      ]
    }).and.notify(done);
  });

  it('should not allow reserved parameters: methodName', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'traits:',
      '   - trait1:',
      '       description: <<methodName>>',
      '/:',
      '   get:',
      '       is:',
      '         - trait1:',
      '             methodName: does-not-matter'
    ].join('\n')).should.be.rejectedWith('invalid parameter name: methodName is reserved').and.notify(done);
  });

  it('should not allow reserved parameters: resourcePath', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'traits:',
      '   - trait1:',
      '       description: <<resourcePath>>',
      '/:',
      '   get:',
      '       is:',
      '         - trait1:',
      '             resourcePath: does-not-matter'
    ].join('\n')).should.be.rejectedWith('invalid parameter name: resourcePath is reserved').and.notify(done);
  });

  it('should not crash if applied trait has value of null (RT-364)', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'traits:',
      '   - trait1:',
      '       description: <<resourcePath>>',
      '/:',
      '   get:',
      '       is:',
      '         - trait1:'
    ].join('\n')).should.be.fulfilled.and.notify(done);
  });

  it('should provide reserved <<resourcePathName>> parameter', function (done) {
    raml.load([
        '#%RAML 0.8',
        '---',
        'title: Title',
        'traits:',
        '   - trait1:',
        '       description: <<resourcePathName>>',
        '/a/b/c:',
        '   get:',
        '       is:',
        '         - trait1:'
    ].join('\n')).should.eventually.to.have.deep.property('resources[0].methods[0].description', 'c').and.notify(done);
  });

  it('should provide reserved <<resourcePathName>> parameter', function (done) {
    raml.load([
        '#%RAML 0.8',
        '---',
        'title: Title',
        'traits:',
        '   - trait1:',
        '       description: <<resourcePathName>>',
        '/a/b/{c}:',
        '   get:',
        '       is:',
        '         - trait1:'
    ].join('\n')).should.eventually.to.have.deep.property('resources[0].methods[0].description', 'b').and.notify(done);
  });

  it('should provide reserved <<resourcePathName>> parameter', function (done) {
    raml.load([
        '#%RAML 0.8',
        '---',
        'title: Title',
        'traits:',
        '   - trait1:',
        '       description: <<resourcePathName>>',
        '/{a}/{b}/{c}:',
        '   get:',
        '       is:',
        '         - trait1:'
    ].join('\n')).should.eventually.to.have.deep.property('resources[0].methods[0].description', '').and.notify(done);
  });

  it('should check for empty trait name provided as a parameter to resource type', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'resourceTypes:',
      '  - resourceType1:',
      '      get:',
      '        is:',
      '          - <<traitName>>',
      'title: Title',
      '/:',
      '  type:',
      '    resourceType1:',
      '      traitName:'
    ].join('\n')).should.be.rejectedWith('trait name must be provided').and.notify(done);
  });
});
