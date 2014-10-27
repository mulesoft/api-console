/* global RAML, describe, it */

'use strict';

if (typeof window === 'undefined') {
    var raml           = require('../../lib/raml.js');
    var chai           = require('chai');
    var expect         = chai.expect;
    var should         = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
} else {
    var raml           = RAML.Parser;
    chai.should();
}

describe('Parser', function() {
  it('should be tolerant to whitespaces around version', function (done) {
    raml.load([
      ' #%RAML 0.8 ',
      '---',
      'title: MyApi'
    ].join('\n')).should.be.fulfilled.and.notify(done);
  });

  describe('Basic Information', function() {
    it('should fail unsupported yaml version', function(done) {
      var definition = [
        '#%RAML 0.8',
        '%YAML 1.1',
        '---',
        'title: MyApi'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/found incompatible YAML document \(version 1.2 is required\)/).and.notify(done);
    });

    it('should succeed', function(done) {
      var definition = [
        '#%RAML 0.8',
        '%YAML 1.2',
        '---',
        'title: MyApi',
        'baseUri: http://myapi.com',
        '/:',
        '  displayName: Root'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'MyApi',
          baseUri: 'http://myapi.com',
          resources: [
              {
                  relativeUriPathSegments: [],
                  relativeUri: '/',
                  displayName: 'Root'
              }
          ],
          protocols: ['HTTP']
      }).and.notify(done);
    });

    it('should fail if no title', function(done) {
    var definition = [
      '#%RAML 0.8',
      '---',
      'baseUri: http://myapi.com'
    ].join('\n');

    raml.load(definition).should.be.rejectedWith(/missing title/).and.notify(done);
    });
    it('should fail if title is array', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: ["title", "title line 2", "title line 3"]',
            'baseUri: http://myapi.com'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/title must be a string/).and.notify(done);
    });
    describe('feature flags', function (){
        it('should not validate title if flag is set not to validate', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: ["title", "title line 2", "title line 3"]',
                'baseUri: http://myapi.com'
            ].join('\n');
            raml.load(definition, 'filename.yml', {validate: false, transform: false, compose: true}).should.be.fulfilled.and.notify(done);
        });
        it('should not validate title if flag is set not to validate', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: ["title", "title line 2", "title line 3"]',
                'baseUri: http://myapi.com'
            ].join('\n');
            raml.load(definition, 'filename.yml', {validate: false, transform: true, compose: true}).should.be.fulfilled.and.notify(done);
        });
        it('should not apply transformations if flag is set to ignore', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: some title',
                'baseUri: http://myapi.com/'
            ].join('\n');

            var expected = {
                title: "some title",
                baseUri: "http://myapi.com/"
            };

            raml.load(definition, 'filename.yml',  {validate: false, transform: false, compose: true}).should.become(expected).and.notify(done);
        });
        it('should not apply transformations if flag is set to ignore', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: some title',
                'baseUri: http://myapi.com/'
            ].join('\n');

            var expected = {
                title: "some title",
                baseUri: "http://myapi.com/"
            };

            raml.load(definition, 'filename.yml',  {validate: true, transform: false, compose: true}).should.become(expected).and.notify(done);
        });
        it('should apply transformations if flag is set to ignore', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: some title',
                'baseUri: http://myapi.com/'
            ].join('\n');

            var expected = {
                title: "some title",
                baseUri: "http://myapi.com/",
                protocols: ['HTTP']
            };

            raml.load(definition, 'filename.yml',  {validate: true, transform: true, compose: true}).should.become(expected).and.notify(done);
        });
        it('should apply transformations if flag is set to ignore', function(done) {
            var definition = [
                '#%RAML 0.8',
                '---',
                'title: some title',
                'baseUri: http://myapi.com/'
            ].join('\n');

            var expected = {
                title: "some title",
                baseUri: "http://myapi.com/",
                protocols: ['HTTP']
            };

            raml.load(definition, 'filename.yml',  {validate: true, transform: true}).should.become(expected).and.notify(done);
        });


    });
    it('should fail if title is map', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: { line 1: line 1, line 2: line 2 }',
            'baseUri: http://myapi.com'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/title must be a string/).and.notify(done);
    });
    it('should succeed if title is longer than 48 chars', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'title: this is a very long title, it should fail the length validation for titles with an exception clearly marking it so',
            'baseUri: http://myapi.com'
        ].join('\n');

        raml.load(definition).should.become({
            title:"this is a very long title, it should fail the length validation for titles with an exception clearly marking it so",
            baseUri: "http://myapi.com",
            protocols: [
                'HTTP'
            ]
        }).and.notify(done);
    });

    it('should allow number title', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: 54',
          'baseUri: http://myapi.com'
      ].join('\n');

      raml.load(definition).should.become({ title: 54, baseUri: 'http://myapi.com', protocols: ['HTTP'] }).and.notify(done);
    });

    it('should fail if there is a root property with wrong displayName', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'version: v1',
        'wrongPropertyName: http://myapi.com/{version}'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unknown property/).and.notify(done);
    });

    it('should coherce version to be a string even when it is a float', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'version: 1.0'
      ].join('\n');

      var expected = {
        title: "MyApi",
        version: "1.0"
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should coherce version to be a string even when it is an int', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'version: 1'
      ].join('\n');

      var expected = {
        title: "MyApi",
        version: "1"
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if there is a root property with array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'version: v1',
        '[1,2]: v1'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });
  });

  describe('Include', function() {
    it('should fail if include not found', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: !include relative.md'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/cannot (read|fetch) relative\.md/).and.notify(done);
    });

    it('should succeed on including another YAML file with .yml extension', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        '!include http://localhost:9001/test/raml-files/external.yml'
      ].join('\n');

      raml.load(definition).should.eventually.deep.equal({ title: 'MyApi', documentation: [ { title: 'Getting Started', content: '# Getting Started\n\nThis is a getting started guide.' } ] }).and.notify(done);
    });

    it('should succeed on including another YAML file with .yaml extension', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        '!include http://localhost:9001/test/raml-files/external.yaml'
      ].join('\n');

      raml.load(definition).should.eventually.deep.equal({ title: 'MyApi', documentation: [ { title: 'Getting Started', content: '# Getting Started\n\nThis is a getting started guide.' } ] }).and.notify(done);
    });

    it('should succeed on including another YAML file mid-document', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '   - customTrait1: !include http://localhost:9001/test/raml-files/customtrait.yml',
        '   - customTrait2: !include http://localhost:9001/test/raml-files/customtrait.yml'
      ].join('\n');

        raml.load(definition).should.eventually.deep.equal({
          title: 'Test',
          traits:
            [
            {
              customTrait1: {
                displayName: 'Custom Trait',
                description: 'This is a custom trait',
                responses: {
                  429: {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            },
            {
              customTrait2: {
                displayName: 'Custom Trait',
                description: 'This is a custom trait',
                responses: {
                  429: {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            }]
      }).and.notify(done);
    });
  });

  describe('URI Parameters', function() {
    it('should succeed when dealing with URI parameters', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        ''
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        baseUri: 'http://{a}.myapi.org',
        baseUriParameters: {
          'a': {
            displayName: 'A',
            description: 'This is A',
            required: true,
            type: "string"
          }
        },
        protocols: [
          'HTTP'
        ]
      }).and.notify(done);
    });

    it('should fail when a parameter uses array syntax with only one type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    - displayName: A',
        '      description: This is A',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
    });

    it('should succeed when dealing with URI parameters with two types', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    - displayName: A',
        '      description: This is A',
        '      type: string',
        '    - displayName: A',
        '      description: This is A',
        '      type: file',
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        baseUri: 'http://{a}.myapi.org',
        baseUriParameters: {
          'a': [
            {
              displayName: 'A',
              description: 'This is A',
              type: "string",
              required: true
            },
            {
              displayName: 'A',
              description: 'This is A',
              type: "file",
              required: true
            },
          ]
        },
        protocols: [
          'HTTP'
        ]
      }).and.notify(done);
    });

    it('should fail when declaring a URI parameter not on the baseUri', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  b:',
        '    displayName: A',
        '    description: This is A',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/uri parameter unused/).and.notify(done);
    });

    it('should fail when declaring a URI parameter not on the resource URI', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '/{hello}:',
        '  uriParameters:',
        '    a:',
        '      displayName: A',
        '      description: This is A'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/uri parameter unused/).and.notify(done);
    });

    it('should fail when declaring a property inside a URI parameter that is not valid', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    wrongPropertyName: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unknown property wrongPropertyName/).and.notify(done);
    });

    it('should succeed when declaring a minLength validation as a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: 123'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when declaring an enum with duplicated values', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: 123',
        '    enum: [ "value", "value2", "value2" ]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/enum contains duplicated values/).and.notify(done);
    });

    it('should fail when declaring an enum with no values', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: 123',
        '    enum: []'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/enum is empty/).and.notify(done);
    });

    it('should succeed when declaring an enum with null value', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: 123',
        '    enum:'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/enum is empty/).and.notify(done);
    });

    it('should fail when declaring an enum with map value', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: 123',
        '    enum: {}'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/the value of enum must be an array/).and.notify(done);
    });

    it('should succeed when declaring a maxLength validation as a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    maxLength: 123'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a minimum validation as a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    type: number',
        '    displayName: A',
        '    description: This is A',
        '    minimum: 123'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a maximum validation as a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    type: number',
        '    displayName: A',
        '    description: This is A',
        '    maximum: 123'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when declaring a minLength validation as anything other than a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minLength: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/the value of minLength must be a number/).and.notify(done);
    });

    it('should fail when declaring a maxLength validation as anything other than a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    maxLength: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/the value of maxLength must be a number/).and.notify(done);
    });

    it('should fail when declaring a minimum validation as anything other than a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    minimum: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/the value of minimum must be a number/).and.notify(done);
    });

    it('should fail when declaring a maximum validation as anything other than a number', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    maximum: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/the value of maximum must be a number/).and.notify(done);
    });

    it('should fail when declaring a URI parameter with an invalid type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: X'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/type can be either of: string, number, integer, file, date or boolean/).and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a string type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: string'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a number type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: number'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a integer type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: integer'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a date type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a file type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: file'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with a boolean type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: boolean'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should succeed when declaring a URI parameter with an example', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    example: This is the example'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail if baseUri value its not really a URI', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://{myapi.com'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unclosed brace/).and.notify(done);
    });

    it('should fail if baseUri uses version but there is no version defined', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'baseUri: http://myapi.com/{version}'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/missing version/).and.notify(done);
    });

    it('should succeed if baseUri uses version and there is a version defined', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'version: v1',
        'baseUri: http://myapi.com/{version}'
      ].join('\n');

      var promise = raml.load(definition);
      var expected = {
        title: 'MyApi',
        version: 'v1',
        baseUri: 'http://myapi.com/{version}',
        baseUriParameters: {
          version: {
            type: "string",
            required: true,
            displayName: "version",
            enum: [ "v1" ]
          }
        },
        protocols: [
          'HTTP'
        ]
      };
      promise.should.eventually.deep.equal(expected).and.notify(done);
    });

    it('should fail when a URI parameter has required "y"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: y'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "yes"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: yes'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "YES"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: YES'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "t"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: t'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should succeed when a URI parameter has required "true"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: true'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when a URI parameter has required "TRUE"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: TRUE'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "n"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: n'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "no"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: no'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "NO"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: NO'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should fail when a URI parameter has required "f"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: f'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should succeed when a URI parameter has required "false"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: false'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when a URI parameter has required "FALSE"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    required: FALSE'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should succeed when a URI parameter has repeat "false"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    repeat: false'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when a URI parameter has repeat "FALSE"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    repeat: FALSE'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });

    it('should succeed when a URI parameter has repeat "true"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    repeat: true'
      ].join('\n');

      raml.load(definition).should.be.fulfilled.and.notify(done);
    });

    it('should fail when a URI parameter has repeat "TRUE"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '    type: date',
        '    repeat: TRUE'
      ].join('\n');

      raml.load(definition).should.be.rejected.and.notify(done);
    });
  });

  describe('MultiType Named Parameters', function() {
    describe('Named parameters in baseUriParameters at root level', function(){
      it('should succeed with null baseUriParameters', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          'baseUriParameters:',
        ].join('\n');
        var expected= {
          title: "Test",
          baseUri: "http://myapi.org",
          baseUriParameters: null,
          protocols: [
            'HTTP'
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with no types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          'baseUriParameters:',
          '  a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          'baseUriParameters:',
          '  a:',
          '    - displayName: A',
          '      description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          'baseUriParameters:',
          '  a:',
          '    - displayName: A',
          '      description: This is A',
          '      type: string',
          '    - displayName: A',
          '      description: This is A',
          '      type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://{a}.myapi.org',
          baseUriParameters: {
            'a': [
              {
                displayName: 'A',
                description: 'This is A',
                type: "string",
                required: true
              },
              {
                displayName: 'A',
                description: 'This is A',
                type: "file",
                required: true
              },
            ]
          },
          protocols: [
            'HTTP'
          ]
        }).and.notify(done);
      });
    });

    describe('Named parameters in baseUriParameters at a resource level', function(){
      it('should succeed with null baseUriParameters', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          '/resource:',
          '  baseUriParameters:',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://{a}.myapi.org',
          baseUriParameters: {
            'a': {
              displayName: 'a',
              type: "string",
              required: true
            }
          },
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              baseUriParameters: null
            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with no types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          '/resource:',
          '  baseUriParameters:',
          '    a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          '/resource:',
          '  baseUriParameters:',
          '    a:',
          '      - displayName: A',
          '        description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://{a}.myapi.org',
          '/resource:',
          '  baseUriParameters:',
          '    a:',
          '      - displayName: A',
          '        description: This is A',
          '        type: string',
          '      - displayName: A',
          '        description: This is A',
          '        type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://{a}.myapi.org',
          resources: [
            {
              baseUriParameters: {
                'a': [
                  {
                    displayName: 'A',
                    description: 'This is A',
                    type: "string",
                    required: true
                  },
                  {
                    displayName: 'A',
                    description: 'This is A',
                    type: "file",
                    required: true
                  },
                ]
              },
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
            }
          ],
          baseUriParameters: {
            'a': {
              type: "string",
              required: true,
              displayName: 'a'
            }
          },
          protocols: [
            'HTTP'
          ]
        }).and.notify(done);
      });
    });

    describe('Named parameters in uriParameters', function(){
      it('should succeed with null uriParameters', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/{a}resource:',
          '  uriParameters:'
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/{a}resource",
              relativeUriPathSegments: [ "{a}resource" ],
              uriParameters: {
                'a':
                  {
                    displayName: 'a',
                    required: true,
                    type: "string"
                  }
              }

            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with no types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/{a}resource:',
          '  uriParameters:',
          '    a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/{a}resource:',
          '  uriParameters:',
          '    a:',
          '      - displayName: A',
          '        description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/{a}resource:',
          '  uriParameters:',
          '    a:',
          '      - displayName: A',
          '        description: This is A',
          '        type: string',
          '      - displayName: A',
          '        description: This is A',
          '        type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/{a}resource",
              relativeUriPathSegments: [ "{a}resource" ],
              uriParameters: {
                'a': [
                  {
                    displayName: 'A',
                    description: 'This is A',
                    type: "string",
                    required: true
                  },
                  {
                    displayName: 'A',
                    description: 'This is A',
                    type: "file",
                    required: true
                  },
                ]
              }

            }
          ]
        }).and.notify(done);
      });
    });

    describe('Named parameters in request headers', function(){
      it('should succeed with null headers', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    headers:'
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                headers: null
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    headers:',
          '      a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    headers:',
          '      a:',
          '        - displayName: A',
          '          description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    headers:',
          '      a:',
          '        - displayName: A',
          '          description: This is A',
          '          type: string',
          '        - displayName: A',
          '          description: This is A',
          '          type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                headers: {
                  'a': [
                    {
                      displayName: 'A',
                      description: 'This is A',
                      type: "string"
                    },
                    {
                      displayName: 'A',
                      description: 'This is A',
                      type: "file"
                    },
                  ]
                }
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should be required when explicitly marked', function (done) {
        raml.load([
          '#%RAML 0.8',
          '---',
          'title: My API',
          '/:',
          '  get:',
          '    headers:',
          '      header1:',
          '        required: true'
        ].join('\n'))
          .should.eventually.have.deep.property('resources[0].methods[0].headers.header1.required', true)
          .and.notify(done)
        ;
      });
    });

    describe('Named parameters in query string parameter', function(){
      it('should succeed with null URI parameters', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    queryParameters:'
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                queryParameters: null
              }]
            }
          ]
        }).and.notify(done);
      });

      it('defaults query parameters requiredness to falsy', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    queryParameters:',
          '      notRequired:',
          '        type: integer'
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                queryParameters: {
                  notRequired: {
                    displayName: 'notRequired',
                    type: 'integer'
                  }
                }
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    queryParameters:',
          '      a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    queryParameters:',
          '      a:',
          '        - displayName: A',
          '          description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    queryParameters:',
          '      a:',
          '        - displayName: A',
          '          description: This is A',
          '          type: string',
          '        - displayName: A',
          '          description: This is A',
          '          type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                queryParameters: {
                  'a': [
                    {
                      displayName: 'A',
                      description: 'This is A',
                      type: "string"
                    },
                    {
                      displayName: 'A',
                      description: 'This is A',
                      type: "file"
                    },
                  ]
                }
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should be required when explicitly marked', function (done) {
        raml.load([
          '#%RAML 0.8',
          '---',
          'title: My API',
          '/:',
          '  get:',
          '    queryParameters:',
          '      queryParameter1:',
          '        required: true'
        ].join('\n'))
          .should.eventually.have.deep.property('resources[0].methods[0].queryParameters.queryParameter1.required', true)
          .and.notify(done)
        ;
      });
    });

    describe('Named parameters in form parameters', function(){
      it('should fail if formParameters is used in a response', function(done){
        raml.load([
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  post:',
          '    responses: ',
          '      200:',
          '        body:',
          '          application/json:',
          '            formParameters:',
        ].join('\n')).then(function () {}, function (error) {
          setTimeout(function () {
            error.message.should.contain('formParameters cannot be used to describe response bodies');
            error.problem_mark.line.should.be.equal(10);
            error.problem_mark.column.should.be.equal(12);
            done();
          }, 0);
        });
      });

      it('should fail if formParameters is used together with schema', function(done){
        raml.load([
            '#%RAML 0.8',
            '---',
            'title: Test',
            'baseUri: http://myapi.org',
            '/resource:',
            '  post:',
            '    body:',
            '      application/json:',
            '        formParameters:',
            '        schema:',
        ].join('\n')).then(function () {}, function (error) {
          setTimeout(function () {
            error.message.should.contain('formParameters cannot be used together with the example or schema properties');
            error.problem_mark.line.should.be.equal(8);
            error.problem_mark.column.should.be.equal(8);
            done();
          }, 0);
        });
      });

      it('should fail if formParameters is used together with example', function(done){
        raml.load([
            '#%RAML 0.8',
            '---',
            'title: Test',
            'baseUri: http://myapi.org',
            '/resource:',
            '  post:',
            '    body:',
            '      application/json:',
            '        formParameters:',
            '        example:',
        ].join('\n')).then(function () {}, function (error) {
          setTimeout(function () {
            error.message.should.contain('formParameters cannot be used together with the example or schema properties');
            error.problem_mark.line.should.be.equal(8);
            error.problem_mark.column.should.be.equal(8);
            done();
          }, 0);
        });
      });

      it('should succeed null form parameters', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'mediaType: multipart/form-data',
          'baseUri: http://myapi.org',
          '/resource:',
          '  post:',
          '    body:',
          '      formParameters:'
        ].join('\n');
        raml.load(definition).should.become({
          title: 'Test',
          mediaType: 'multipart/form-data',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUri: "/resource",
              methods: [{
                body: {
                  "multipart/form-data": {
                    formParameters: null
                  }
                },
                protocols: [
                  'HTTP'
                ],
                method: "post"
              }],
              relativeUriPathSegments: [ "resource" ]
            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  post:',
          '    body: ',
          '      formParameters:',
          '        a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  post:',
          '    body: ',
          '      formParameters:',
          '        a:',
          '          - displayName: A',
          '            description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when dealing with URI parameters with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'mediaType: multipart/form-data',
          'baseUri: http://myapi.org',
          '/resource:',
          '  post:',
          '    body:',
          '      formParameters:',
          '        a:',
          '          - displayName: A',
          '            description: This is A',
          '            type: string',
          '          - displayName: A',
          '            description: This is A',
          '            type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          mediaType: 'multipart/form-data',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              methods: [{
                body: {
                  "multipart/form-data": {
                    formParameters: {
                      'a': [
                        {
                          displayName: 'A',
                          description: 'This is A',
                          type: "string"
                        },
                        {
                          displayName: 'A',
                          description: 'This is A',
                          type: "file"
                        },
                      ]
                    }
                  }
                },
                method: "post",
                protocols: [
                  'HTTP'
                ]
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should be required when explicitly marked', function (done) {
        raml.load([
          '#%RAML 0.8',
          '---',
          'title: My API',
          '/:',
          '  post:',
          '    body:',
          '      application/x-www-form-urlencoded:',
          '        formParameters:',
          '          formParameter1:',
          '            required: true'
        ].join('\n'))
          .should.eventually.have.deep.property('resources[0].methods[0].body.application/x-www-form-urlencoded.formParameters.formParameter1.required', true)
          .and.notify(done)
        ;
      });
    });

    describe('Named parameters in response headers', function(){
      it('should succeed with null header', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    responses:',
          '      200:',
          '        headers:'
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                responses: {
                  200: {
                    headers: null
                  }
                }
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    responses:',
          '      200:',
          '        headers:',
          '          a: []'
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
      });

      it('should fail when a parameter uses array syntax with only one type', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    responses:',
          '      200:',
          '        headers:',
          '          a:',
          '            - displayName: A',
          '              description: This is A',
          ''
        ].join('\n');

        raml.load(definition).should.be.rejectedWith(/single type for variably typed parameter/).and.notify(done);
      });

      it('should succeed when a parameter uses array syntax with two types', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'baseUri: http://myapi.org',
          '/resource:',
          '  get:',
          '    responses:',
          '      200:',
          '        headers:',
          '           a:',
          '            - displayName: A',
          '              description: This is A',
          '              type: string',
          '            - displayName: A',
          '              description: This is A',
          '              type: file',
        ].join('\n');

        raml.load(definition).should.become({
          title: 'Test',
          baseUri: 'http://myapi.org',
          protocols: [
            'HTTP'
          ],
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              relativeUri: "/resource",
              methods: [{
                method: "get",
                protocols: [
                  'HTTP'
                ],
                responses: {
                  200: {
                    headers: {
                      'a': [
                        {
                          displayName: 'A',
                          description: 'This is A',
                          type: "string"
                        },
                        {
                          displayName: 'A',
                          description: 'This is A',
                          type: "file"
                        },
                      ]
                    }
                  }
                }
              }]
            }
          ]
        }).and.notify(done);
      });

      it('should be required when explicitly marked', function (done) {
        raml.load([
          '#%RAML 0.8',
          '---',
          'title: My API',
          '/:',
          '  get:',
          '    responses:',
          '      200:',
          '        headers:',
          '          header1:',
          '            required: true'
        ].join('\n'))
          .should.eventually.have.deep.property('resources[0].methods[0].responses.200.headers.header1.required', true)
          .and.notify(done)
        ;
      });
    });
  });

  describe('Resources', function() {
    it('should fail on duplicate absolute URIs', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  /b:',
        '    displayName: B',
        '/a/b:',
        '  displayName: AB'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/two resources share same URI \/a\/b/).and.notify(done);
    });

    it('should succeed', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  /b:',
        '    displayName: B',
        '/a/c:',
        '  displayName: AC'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        resources: [
          {
            relativeUriPathSegments: [ "a" ],
            relativeUri: '/a',
            displayName: 'A',
            resources: [
              {
                relativeUriPathSegments: [ "b" ],
                relativeUri: '/b',
                displayName: 'B'
              }
            ]
          },
          {
            relativeUriPathSegments: [ "a", "c" ],
            relativeUri: '/a/c',
            displayName: 'AC'
          }
        ]
      }).and.notify(done);
    });

    it('should succeed when a method is null', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          '/a:',
          '  displayName: A',
          '  get: ~'
      ].join('\n');

      raml.load(definition).should.become({
          title: 'Test',
          resources: [
              {
                  relativeUriPathSegments: [ "a" ],
                  relativeUri: '/a',
                  displayName: 'A',
                  methods: [
                      {
                          method: "get"
                      }
                  ]

              }
          ]
      }).and.notify(done);
    });

    it('should allow resources named like HTTP verbs', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/getSomething:',
        '  displayName: GetSomething',
        '/postSomething:',
        '  displayName: PostSomething',
        '/putSomething:',
        '  displayName: PutSomething',
        '/deleteSomething:',
        '  displayName: DeleteSomething',
        '/headSomething:',
        '  displayName: HeadSomething',
        '/patchSomething:',
        '  displayName: PatchSomething',
        '/optionsSomething:',
        '  displayName: OptionsSomething',
        '/get:',
        '  displayName: Get',
        '/post:',
        '  displayName: Post',
        '/put:',
        '  displayName: Put',
        '/delete:',
        '  displayName: Delete',
        '/head:',
        '  displayName: Head',
        '/patch:',
        '  displayName: Patch',
        '/options:',
        '  displayName: Options'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        resources: [
          {
            relativeUriPathSegments: [ "getSomething" ],
            relativeUri: '/getSomething',
            displayName: 'GetSomething'
          },
          {
            relativeUriPathSegments: [ "postSomething" ],
            relativeUri: '/postSomething',
            displayName: 'PostSomething'
          },
          {
            relativeUriPathSegments: [ "putSomething" ],
            relativeUri: '/putSomething',
            displayName: 'PutSomething'
          },
          {
            relativeUriPathSegments: [ "deleteSomething" ],
            relativeUri: '/deleteSomething',
            displayName: 'DeleteSomething'
          },
          {
            relativeUriPathSegments: [ "headSomething" ],
            relativeUri: '/headSomething',
            displayName: 'HeadSomething'
          },
          {
            relativeUriPathSegments: [ "patchSomething" ],
            relativeUri: '/patchSomething',
            displayName: 'PatchSomething'
          },
          {
            relativeUriPathSegments: [ "optionsSomething" ],
            relativeUri: '/optionsSomething',
            displayName: 'OptionsSomething'
          },
          {
            relativeUriPathSegments: [ "get" ],
            relativeUri: '/get',
            displayName: 'Get'
          },
          {
            relativeUriPathSegments: [ "post" ],
            relativeUri: '/post',
            displayName: 'Post'
          },
          {
            relativeUriPathSegments: [ "put" ],
            relativeUri: '/put',
            displayName: 'Put'
          },
          {
            relativeUriPathSegments: [ "delete" ],
            relativeUri: '/delete',
            displayName: 'Delete'
          },
          {
            relativeUriPathSegments: [ "head" ],
            relativeUri: '/head',
            displayName: 'Head'
          },
          {
            relativeUriPathSegments: [ "patch" ],
            relativeUri: '/patch',
            displayName: 'Patch'
          },
          {
            relativeUriPathSegments: [ "options" ],
            relativeUri: '/options',
            displayName: 'Options'
          }
        ]
      }).and.notify(done);
    });

    it('should not fail when resource is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/:'
      ].join('\n');

      var expected = {
        title: "Test",
        resources : [
          {
            relativeUriPathSegments: [ ],
            relativeUri: "/"
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('is should fail when resource is a scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/: foo'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/resource is not a map/).and.notify(done);
    });

    it('is should fail when resource is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/: foo'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/resource is not a map/).and.notify(done);
    });
  });

  describe('Resource Responses', function() {
    it('should succeed with arrays as keys', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      [200, 210]:',
        '        description: Blah Blah',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });

    it('should succeed with null response', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      200:'
      ].join('\n');

      var expected = {
        title: 'Test',
        resources: [{
          displayName: 'A',
          relativeUri: '/foo',
          relativeUriPathSegments: [ "foo" ],
          methods:[{
            description: 'Blah',
            responses: {
              200: null
            },
            method: 'get'
          }]
        }]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if status code is string', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      fail-here:'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/each response key must be an integer/).and.notify(done);
    });

    it('should overwrite existing node with arrays as keys', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      200:',
        '        description: Foo Foo',
        '      [200, 210]:',
        '        description: Blah Blah',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });

    it('should overwrite arrays as keys with new single node', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      [200, 210]:',
        '        description: Blah Blah',
        '      200:',
        '        description: Foo Foo',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });

    it('should fail to load a yaml with hash as key', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  displayName: A',
        '  get:' ,
        '    description: Blah',
        '    responses:',
        '      {200: Blah}:',
        '        description: Blah Blah',
        ''
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });
  });

  describe('Traits at resource level', function() {
    it('should succeed when applying traits across !include boundaries', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'traits:',
          '  - customTrait: !include http://localhost:9001/test/raml-files/customtrait.yml',
          '/: !include http://localhost:9001/test/raml-files/root.yml'
      ].join('\n');

      raml.load(definition).should.eventually.deep.equal({
          title: 'Test',
          traits: [{
              customTrait: {
                  displayName: 'Custom Trait',
                  description: 'This is a custom trait',
                  responses: {
                      429: {
                          description: 'API Limit Exceeded'
                      }
                  }
              }
          }],
          resources: [
              {
                  is: [ "customTrait" ],
                  displayName: "Root",
                  relativeUri: "/",
                  methods: [
                      {
                        description: "Root resource",
                        responses: {
                            429: {
                                description: 'API Limit Exceeded'
                            }
                        },
                        method: "get"
                      }
                  ],
                  resources: [
                      {
                          is: [ "customTrait" ],
                          displayName: "Another Resource",
                          relativeUri: "/anotherResource",
                          methods: [
                              {
                                description: "Another resource",
                                responses: {
                                    429: {
                                        description: 'API Limit Exceeded'
                                    }
                                },
                                method: "get"
                              }
                          ],
                          relativeUriPathSegments: [ "anotherResource" ]
                      }
                  ],
                  relativeUriPathSegments: [  ]
              }
          ]
      }).and.notify(done);
    });

    it('should succeed when applying multiple traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        429:',
        '          description: API Limit Exceeded',
        '  - queryable:',
        '      displayName: Queryable',
        '      queryParameters:',
        '        q:',
        '          type: string',
        '/leagues:',
        '  is: [ rateLimited, queryable ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            responses: {
              '429': {
                description: 'API Limit Exceeded'
              }
            }
          }
          },
          {
            queryable: {
            displayName: 'Queryable',
            queryParameters: {
              q: {
                type: 'string',
                displayName: "q"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            is: [ 'rateLimited', 'queryable' ],
            methods: [
              {
                method: 'get',
                queryParameters: {
                  q: {
                    type: 'string',
                    displayName: "q"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  },
                  '429': {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should succeed when applying a trait to a null method', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        429:',
        '          description: API Limit Exceeded',
        '/leagues:',
        '  is: [ rateLimited ]',
        '  get:'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            responses: {
              '429': {
                description: 'API Limit Exceeded'
              }
            }
          }
        }
        ],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            is: [ 'rateLimited' ],
            methods: [
              {
                method: 'get',
                responses: {
                  '429': {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when applying multiple traits in a single array entry', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        429:',
        '          description: API Limit Exceeded',
        '    queryable:',
        '      displayName: Queryable',
        '      queryParameters:',
        '        q:',
        '          type: string',
        '/leagues:',
        '  is: [ rateLimited, queryable ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            responses: {
              '429': {
                description: 'API Limit Exceeded'
              }
            }
          },
          queryable: {
            displayName: 'Queryable',
            queryParameters: {
              q: {
                type: 'string',
                displayName: "q"
              }
            }
          }
          }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            is: [ 'rateLimited', 'queryable' ],
            methods: [
              {
                method: 'get',
                queryParameters: {
                  q: {
                    type: 'string',
                    displayName: "q"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  },
                  '429': {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should remove nodes with question mark that are not used', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        x-header-extra:',
        '          displayName: API Limit Exceeded',
        '/leagues:',
        '  is: [ rateLimited ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            "headers?": {
              "x-header-extra": {
                displayName: "API Limit Exceeded",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            is: [ 'rateLimited' ],
            methods: [
              {
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should succeed if trait is missing displayName property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      responses:',
        '        503:',
        '          description: Server Unavailable. Check Your Rate Limits.',
        '/:',
        '  is: [ rateLimited: { parameter: value } ]'
      ].join('\n');

      var expected =   {
        "title": "Test",
        "traits": [
          {
            "rateLimited": {
              "responses": {
                "503": {
                  "description": "Server Unavailable. Check Your Rate Limits."
                }
              }
            }
          }
        ],
        "resources": [
          {
            relativeUriPathSegments: [ ],
            "is": [
              {
                "rateLimited": {
                  "parameter": "value"
                }
              }
            ],
            "relativeUri": "/"
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if traits value is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits: foo',
        '/:',
        '  is: [ rateLimited: { parameter: value } ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid traits definition, it must be an array/).and.notify(done);
    });

    it('should fail if traits value is dictionary', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  trait1:',
        '    displayName: foo',
        '/:',
        '  is: [ rateLimited: { parameter: value } ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid traits definition, it must be an array/).and.notify(done);
    });

    it('should fail if use property is not an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/:',
        '  is: throttled ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'is' must be an array/).and.notify(done);
    });

    it('should fail on invalid trait name', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        503:',
        '          description: Server Unavailable. Check Your Rate Limits.',
        '/:',
        '  is: [ throttled, rateLimited: { parameter: value } ]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith('there is no trait named throttled').and.notify(done);
    });

    it('should allow using "use" as a resource name', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://www.api.com/{version}/{company}',
        'version: v1.1',
        '/users:',
        ' displayName: Tags',
        ' get:',
        ' post:',
        ' /{userid}:',
        '  displayName: Search'
      ].join('\n');

      var expected = {
        title: 'Test',
        baseUri: 'http://www.api.com/{version}/{company}',
        version: 'v1.1',
        protocols: [
          'HTTP'
        ],
        resources: [
          {
            displayName: 'Tags',
            relativeUri: '/users',
            methods: [
              {
                protocols: [
                  'HTTP'
                ],
                method: 'get'
              },
              {
                protocols: [
                  'HTTP'
                ],
                method: 'post'
              }
            ],
            resources: [{
              displayName: 'Search',
              relativeUri: '/{userid}',
              relativeUriPathSegments: [ "{userid}" ],
              uriParameters: {
                userid: {
                  type: "string",
                  required: true,
                  displayName: "userid"
                }
              }
            }],
            relativeUriPathSegments: [ "users" ]
          }
        ],
        baseUriParameters: {
             version: {
                type: "string",
                required: true,
                displayName: "version",
                enum: [ "v1.1" ]
            },
            company: {
                type: "string",
                required: true,
                displayName: "company"
            }
        },
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should not add intermediate structures in optional keys for missing properties', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  is: [ rateLimited ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            }
          }
        }],
        resources: [
          {
            is: [ 'rateLimited' ],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                headers: { },
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should allow dictionary keys as names of traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  is: [ rateLimited: {} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers?': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            }
          }
        }],
        resources: [
          {
            is: [ { rateLimited: {} }],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should allow parameters in a trait usage', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '      queryParameters:',
        '        param1: {description: <<param1>>}',
        '/leagues:',
        '  is: [ rateLimited: { param1: value1 } ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers?': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            },
            queryParameters: {
                param1: {
                    displayName: 'param1',
                    description: '<<param1>>',
                    type: 'string'
                },
            }
          }
        }],
        resources: [
          {
            is: [
              {
                rateLimited: {
                  param1: 'value1'
                }
              }
            ],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                method: 'get',
                queryParameters: {
                    param1: {
                        displayName: 'param1',
                        description: 'value1',
                        type: 'string'
                    }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should reject parameters whose value is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited (<<param1>>-<<param2>>)',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  is: [ rateLimited: { param1: ["value1"], param2: value2} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/parameter value must be a scalar/).and.notify(done);
    });

    it('should reject parameters whose value is a map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '/leagues:',
        '  is: [ rateLimited: { param1: {key: "value"}, param2: value} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited'
          }
        }],
        resources: [
          {
            is: [
              {
                rateLimited: {
                  param1: 'value',
                  param2: 'value'
                }
              }
            ],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };
      raml.load(definition).should.be.rejectedWith(/parameter value must be a scalar/).and.notify(done);
    });

    it('should reject trait with missing provided parameters', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        Authorization:',
        '          description: <<lalalalala>> <<pepepepepepep>>',
        '/leagues:',
        '  is: [ rateLimited: { param1: value1, param2: value2} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/value was not provided for parameter: lalalalala/).and.notify(done);
    });

    it('should apply parameters in traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        Authorization:',
        '          description: <<param1>> <<param2>>',
        '/leagues:',
        '  is: [ rateLimited: { param1: "value1", param2: "value2"} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              'Authorization': {
                description: '<<param1>> <<param2>>',
                displayName: "Authorization",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            is: [ { rateLimited: { param1: 'value1', param2: 'value2'} }],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply parameters in traits in each occurrence', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        Authorization:',
        '          description: <<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>>',
        '        X-Random-Header:',
        '          description: <<param2>><<param2>><<param2>>',
        '        <<param2>><<param2>>:',
        '          description: <<param1>>',
        '/leagues:',
        '  is: [ rateLimited: { param1: "value1", param2: "value2"} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              'Authorization': {
                description: '<<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>><<param1>> <<param2>>',
                displayName: "Authorization",
                type: "string"
              },
              'X-Random-Header': {
                description: '<<param2>><<param2>><<param2>>',
                displayName: "X-Random-Header",
                type: "string"
              },
              '<<param2>><<param2>>': {
                description: '<<param1>>',
                displayName: "<<param2>><<param2>>",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            is: [ { rateLimited: { param1: 'value1', param2: 'value2'} }],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                'headers': {
                  'Authorization': {
                    description: 'value1 value2value1 value2value1 value2value1 value2value1 value2value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  },
                  'X-Random-Header': {
                    description: 'value2value2value2',
                    displayName: "X-Random-Header",
                    type: "string"
                  },
                  'value2value2': {
                    description: 'value1',
                    displayName: "value2value2",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply parameters in keys in traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        <<header>>:',
        '          description: <<param1>> <<param2>>',
        '/leagues:',
        '  is: [ rateLimited: { header: "Authorization", param1: "value1", param2: "value2"} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              '<<header>>': {
                description: '<<param1>> <<param2>>',
                displayName: "<<header>>",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            is: [ { rateLimited: { header: "Authorization", param1: 'value1', param2: 'value2'} }],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply traits in all methods', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        <<header>>:',
        '          description: <<param1>> <<param2>>',
        '/leagues:',
        '  is: [ rateLimited: { header: "Authorization", param1: "value1", param2: "value2"} ]',
        '  get:',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues',
        '  post:',
        '    responses:',
        '      200:',
        '        description: creates a new league'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              '<<header>>': {
                description: '<<param1>> <<param2>>',
                displayName: "<<header>>",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            is: [ { rateLimited: { header: "Authorization", param1: 'value1', param2: 'value2'} }],
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              },
              {
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'creates a new league'
                  }
                },
                method: 'post'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Traits at method level', function() {
    it('should succeed when applying traits across !include boundaries', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - customTrait: !include http://localhost:9001/test/raml-files/customtrait.yml',
        '/: !include http://localhost:9001/test/raml-files/traitsAtResourceLevel.yml'
      ].join('\n');

      raml.load(definition).should.eventually.deep.equal({
        title: 'Test',
        traits: [{
          customTrait: {
            displayName: 'Custom Trait',
            description: 'This is a custom trait',
            responses: {
              429: {
                description: 'API Limit Exceeded'
              }
            }
          }
        }],
        resources: [
          {
            displayName: "Root",
            relativeUriPathSegments: [ ],
            relativeUri: "/",
            methods: [
              {
                is: [ "customTrait" ],
                responses: {
                  429: {
                    description: 'API Limit Exceeded'
                  }
                },
                description: "Root resource",
                method: "get"
              }
            ],
            resources: [
              {
                relativeUriPathSegments: [ "anotherResource" ],
                relativeUri: "/anotherResource",
                displayName: "Another Resource",
                methods: [
                  {
                    is: [ "customTrait" ],
                    description: "Another resource",
                    method: "get",
                    responses: {
                      429: {
                        description: 'API Limit Exceeded'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should succeed when applying multiple traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        429:',
        '          description: API Limit Exceeded',
        '  - queryable:',
        '      displayName: Queryable',
        '      queryParameters:',
        '        q:',
        '           type: string',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited, queryable ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            responses: {
              '429': {
                description: 'API Limit Exceeded'
              }
            }
          }},
          {queryable: {
            displayName: 'Queryable',
            queryParameters: {
              q: {
                type: 'string',
                displayName: "q"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ 'rateLimited', 'queryable' ],
                method: 'get',
                queryParameters: {
                  q: {
                    type: 'string',
                    displayName: "q"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  },
                  '429': {
                    description: 'API Limit Exceeded'
                  }
                }
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should remove nodes with question mark that are not used', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        x-header-extra:',
        '          displayName: API Limit Exceeded',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.become({
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            "headers?": {
              "x-header-extra": {
                displayName: "API Limit Exceeded",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ 'rateLimited' ],
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      }).and.notify(done);
    });

    it('should succeed if trait is missing displayName property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      responses:',
        '        503:',
        '          description: Server Unavailable. Check Your Rate Limits.'
      ].join('\n');

      var expected = {
        title: "Test",
        traits: [
          {
            rateLimited: {
              responses: {
                503: {
                  description: "Server Unavailable. Check Your Rate Limits."
                }
              }
            }
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if use property is not an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/:',
        '  get:',
        '    is: throttled ]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property 'is' must be an array/).and.notify(done);
    });

    it('should fail on invalid trait name', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      responses:',
        '        503:',
        '          description: Server Unavailable. Check Your Rate Limits.',
        '/:',
        '  get:',
        '    is: [ throttled, rateLimited: { parameter: value } ]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith('there is no trait named throttled').and.notify(done);
    });

    it('should not add intermediate structures in optional keys for missing properties', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ 'rateLimited' ],
                headers: { },
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should allow dictionary keys as names of traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: {} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers?': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ { rateLimited: {} }],
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should allow parameters in a trait usage', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '      queryParameters:',
        '        param1:',
        '          description: <<param1>>',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { param1: value1 } ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers?': {
              'If-None-Match?': {
                description: 'If-None-Match headers ensure that you don’t retrieve unnecessary data\nif you already have the most current version on-hand.\n',
                type: 'string',
                displayName: "If-None-Match"
              },
              'On-Behalf-Of?' : {
                description: 'Used for enterprise administrators to make API calls on behalf of their\nmanaged users. To enable this functionality, please contact us with your\nAPI key.\n',
                type: 'string',
                displayName: "On-Behalf-Of"
              }
            },
            queryParameters: {
                param1: {
                    displayName: 'param1',
                    description: '<<param1>>',
                    type: 'string'
                }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [
                  {
                    rateLimited: {
                      param1: 'value1'
                    }
                  }
                ],
                method: 'get',
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                queryParameters: {
                    param1: {
                        displayName: 'param1',
                        description: 'value1',
                        type: 'string'
                    }
                }
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should reject parameters whose value is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers?:',
        '        If-None-Match?:',
        '          description: |',
        '            If-None-Match headers ensure that you don’t retrieve unnecessary data',
        '            if you already have the most current version on-hand.',
        '          type: string',
        '        On-Behalf-Of?:',
        '          description: |',
        '            Used for enterprise administrators to make API calls on behalf of their',
        '            managed users. To enable this functionality, please contact us with your',
        '            API key.',
        '          type: string',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { param1: ["string"], param2: value} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/parameter value must be a scalar/).and.notify(done);
    });
    it('should reject parameters whose value is a map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { param1: {key: "value"}, param2: value} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/parameter value must be a scalar/).and.notify(done);
    });

    it('should reject trait with missing provided parameters', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        Authorization:',
        '          description: <<lalalalala>> <<pepepepepepep>>',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { param1: value1, param2: value2} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/value was not provided for parameter: lalalalala/).and.notify(done);
    });

    it('should apply parameters in traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        Authorization:',
        '          description: <<param1>> <<param2>>',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { param1: "value1", param2: "value2"} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              'Authorization': {
                description: '<<param1>> <<param2>>',
                displayName: "Authorization",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ { rateLimited: { param1: 'value1', param2: 'value2'} }],
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply parameters in keys in traits', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - rateLimited:',
        '      displayName: Rate Limited',
        '      headers:',
        '        <<header>>:',
        '          description: <<param1>> <<param2>>',
        '/leagues:',
        '  get:',
        '    is: [ rateLimited: { header: "Authorization", param1: "value1", param2: "value2"} ]',
        '    responses:',
        '      200:',
        '        description: Retrieve a list of leagues'
      ].join('\n');

      var expected = {
        title: 'Test',
        traits: [{
          rateLimited: {
            displayName: 'Rate Limited',
            'headers': {
              '<<header>>': {
                description: '<<param1>> <<param2>>',
                displayName: "<<header>>",
                type: "string"
              }
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ "leagues" ],
            relativeUri: '/leagues',
            methods: [
              {
                is: [ { rateLimited: { header: "Authorization", param1: 'value1', param2: 'value2'} }],
                'headers': {
                  'Authorization': {
                    description: 'value1 value2',
                    displayName: "Authorization",
                    type: "string"
                  }
                },
                responses: {
                  '200': {
                    description: 'Retrieve a list of leagues'
                  }
                },
                method: 'get'
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Resource Types', function () {
    it('should allow resourceTypes key at root level', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: The collection of <<resourcePathName>>',
        '      get:',
        '        description: Get all <<resourcePathName>>, optionally filtered',
        '      post:',
        '        description: Create a new <<resourcePathName | !singularize>>',
        '/:',
        '  displayName: Root'
      ].join('\n');

      var expected = {
        title: 'Test',
        resourceTypes: [{
          collection: {
            displayName: 'Collection',
            description: 'The collection of <<resourcePathName>>',
            get: {
              description: 'Get all <<resourcePathName>>, optionally filtered'
            },
            post: {
              description: 'Create a new <<resourcePathName | !singularize>>'
            }
          }
        }],
        resources: [
          {
            relativeUriPathSegments: [ ],
            displayName: "Root",
            relativeUri: "/"
          }
        ]
      };

      raml.load(definition).should.eventually.deep.equal(expected).and.notify(done);
    });

    it('should allow resourceTypes array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: The collection of <<resourcePathName>>',
        '      get:',
        '        description: Get all <<resourcePathName>>, optionally filtered',
        '      post:',
        '        description: Create a new <<resourcePathName | !singularize>>',
        '  - item:',
        '      displayName: Item',
        '      description: A single <<resourcePathName>>',
        '      get:',
        '        description: Get a <<resourcePathName | !singularize>>',
        '      post:',
        '        description: Create a new <<resourcePathName | !singularize>>',
        '      patch:',
        '        description: Update a <<resourcePathName | !singularize>>',
        '      delete:',
        '        description: Update a <<resourcePathName | !singularize>>',
        '/:',
        '  displayName: Root'
      ].join('\n');

      var expected = {
        title: 'Test',
        resourceTypes: [
          {
            collection: {
              displayName: 'Collection',
              description: 'The collection of <<resourcePathName>>',
              get: {
                description: 'Get all <<resourcePathName>>, optionally filtered'
              },
              post: {
                description: 'Create a new <<resourcePathName | !singularize>>'
              }
            }
          },
          {
            item: {
              displayName: 'Item',
              description: 'A single <<resourcePathName>>',
              get: {
                description: 'Get a <<resourcePathName | !singularize>>'
              },
              post: {
                description: 'Create a new <<resourcePathName | !singularize>>'
              },
              patch: {
                description: 'Update a <<resourcePathName | !singularize>>'
              },
              delete: {
                description: 'Update a <<resourcePathName | !singularize>>'
              }
            }
          }

        ],
        resources: [
          {
            relativeUriPathSegments: [ ],
            displayName: "Root",
            relativeUri: "/"
          }
        ]
      };

      raml.load(definition).should.eventually.deep.equal(expected).and.notify(done);
    });

    it('should fail if resourceTypes value is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes: foo',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid resourceTypes definition, it must be an array/).and.notify(done);
    });

    it('should fail if resourceTypes value is dictionary', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  type1:',
        '    displayName: foo',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid resourceTypes definition, it must be an array/).and.notify(done);
    });

    it('should fail if type is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: The collection of <<resourcePathName>>',
        '      get:',
        '        description: Get all <<resourcePathName>>, optionally filtered',
        '      post:',
        '        description: Create a new <<resourcePathName | !singularize>>',
        '/:',
        '  type: [ foo ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'type' must be a string or a map/).and.notify(done);
    });

    it('should fail if resource is of a missing type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: The collection of <<resourcePathName>>',
        '      get:',
        '        description: Get all <<resourcePathName>>, optionally filtered',
        '      post:',
        '        description: Create a new <<resourcePathName | !singularize>>',
        '/:',
        '  type: invalidType'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/there is no resource type named invalidType/).and.notify(done);
    });

    it('should succeed if resource type is missing displayName', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      description: The collection of Blah',
        '/:',
        '  type: collection'
      ].join('\n');

      var expected =  {
        "title": "Test",
        "resourceTypes": [
          {
            "collection": {
              "description": "The collection of Blah"
            }
          }
        ],
        "resources": [
          {
            "description": "The collection of Blah",
            "type": "collection",
            "relativeUri": "/",
            relativeUriPathSegments: [ ],
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if resource type is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection: null',
        '  -',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid resourceType definition, it must be a map/).and.notify(done);
    });

    it('should fail if resource type is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  -',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid resourceType definition, it must be a map/).and.notify(done);
    });

    it('should fail if resource type is not map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - string',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid resourceType definition, it must be a map/).and.notify(done);
    });

    it('should fail if resource type declares a sub resource', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: The collection of <<resourcePathName>>',
        '      /bar:',
        '/:',
        '  type: collection'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/resource type cannot define child resources/).and.notify(done);
    });

    it('should fail if type dictionary has no keys', function(done) {
      var definition = [
      '#%RAML 0.8',
      'title: titulo',
      'baseUri: http://api.com',
      '/resource:',
      '  type: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith('resource type name must be provided').and.notify(done);
    });

    it('should fail if a resource type inherits from a missing type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      type: missing',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '/:',
        '  type: collection'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/there is no resource type named missing/).and.notify(done);
    });

    it('should fail if a resource type applies a missing trait', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - foo:',
        '     displayName: Foo',
        'resourceTypes:',
        '  - collection:',
        '     is: [foo, bar]',
        '     displayName: Collection',
        '     description: This resourceType should be used for any collection of items',
        '/:',
        '  type: collection'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith('there is no trait named bar').and.notify(done);
    });

    it('should fail if a resource type\'s method applies a missing trait', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - foo:',
        '     displayName: Foo',
        'resourceTypes:',
        '  - collection:',
        '     displayName: Collection',
        '     description: This resourceType should be used for any collection of items',
        '     get:',
        '       is: [foo, bar]',
        '/:',
        '  type: collection'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith('there is no trait named bar').and.notify(done);
    });

    it('should apply a resource type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '/:',
        '  type: collection'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection",
              description: "This resourceType should be used for any collection of items",
              post:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            relativeUriPathSegments: [ ],
            description: "This resourceType should be used for any collection of items",
            type: "collection",
            relativeUri: "/",
            methods: [
              {
                method: "post",
                body: null
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it.skip('should fail if names collide', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '  - collection:',
        '      displayName: Collection2',
        '      description: This resourceType should be used for any collection of items2',
        '      post:',
        '       body:',
        '        application/json:',
        '/:',
        '  type: collection'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/Resource type with the same name already exists/).and.notify(done);
    });

    it('should apply a resource type if type key is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '/:',
        '  type: { collection }'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection",
              description: "This resourceType should be used for any collection of items",
              post:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            relativeUriPathSegments: [ ],
            description: "This resourceType should be used for any collection of items",
            type: {
              collection: null
            },
            relativeUri: "/",
            methods: [
              {
                method: "post",
                body: null
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply a resource type if type key is map and type name is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection (<<foo>>)',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '/:',
        '  type: { collection: { foo: bar } }'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection (<<foo>>)",
              description: "This resourceType should be used for any collection of items",
              post:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            description: "This resourceType should be used for any collection of items",
            type: {
              collection: {
                foo: "bar"
              }
            },
            relativeUri: "/",
            relativeUriPathSegments: [ ],
            methods: [
              {
                method: "post",
                body: null
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if type property has more than one key', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '/:',
        '  type: { collection: { foo: bar }, collection }'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/a resource or resourceType can inherit from a single resourceType/).and.notify(done);
    });

    it('should apply a resource type to a type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - post:',
        '      type: get',
        '      displayName: Collection post',
        '      description: This resourceType should be used for any collection of items post',
        '      post:',
        '       body:',
        '  - get:',
        '      displayName: Collection get',
        '      description: This resourceType should be used for any collection of items get',
        '      get:',
        '       body:',
        '/:',
        '  type: post'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            post:
            {
              type: "get",
              displayName: "Collection post",
              description: "This resourceType should be used for any collection of items post",
              post:
              {
                body: null
              }
            }
          },
          {
            get:
            {
              displayName: "Collection get",
              description: "This resourceType should be used for any collection of items get",
              get:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            description: "This resourceType should be used for any collection of items post",
            type: "post",
            relativeUri: "/",
            relativeUriPathSegments: [ ],
            methods: [
              {
                body: null,
                method: "get"
              },
              {
                body: null,
                method: "post"
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should resolve a 3 level deep inheritance chain', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - post:',
        '      type: get',
        '      displayName: Collection post',
        '      description: This resourceType should be used for any collection of items post',
        '      post:',
        '       body:',
        '  - get:',
        '      type: delete',
        '      displayName: Collection get',
        '      description: This resourceType should be used for any collection of items get',
        '      get:',
        '       body:',
        '  - delete:',
        '      displayName: Collection delete',
        '      description: This resourceType should be used for any collection of items delete',
        '      delete:',
        '       body:',
        '/:',
        '  type: post'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            post:
            {
              type: "get",
              displayName: "Collection post",
              description: "This resourceType should be used for any collection of items post",
              post:
              {
                body: null
              }
            }
          },
          {
            get:
            {
              type: "delete",
              displayName: "Collection get",
              description: "This resourceType should be used for any collection of items get",
              get:
              {
                body: null
              }
            }
          }
          ,
          {
            delete:
            {
              displayName: "Collection delete",
              description: "This resourceType should be used for any collection of items delete",
              delete:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            type: "post",
            relativeUri: "/",
            relativeUriPathSegments: [ ],
            description: "This resourceType should be used for any collection of items post",
            methods: [
              {
                body: null,
                method: "delete"
              },
              {
                body: null,
                method: "get"
              },
              {
                body: null,
                method: "post"
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply parameters to a resource type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: <<foo>> resourceType should be used for any collection of items',
        '      post:',
        '       description: <<foo>><<foo>><<foo>> fixed text <<bar>><<bar>><<bar>>',
        '/:',
        '  type: { collection: { foo: bar, bar: foo} }'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection",
              description: "<<foo>> resourceType should be used for any collection of items",
              post:
              {
                description: "<<foo>><<foo>><<foo>> fixed text <<bar>><<bar>><<bar>>"
              }
            }
          }
        ],
        resources: [
          {
            description: "bar resourceType should be used for any collection of items",
            type: {
              collection:{
                foo: "bar",
                bar: "foo"
              }
            },
            relativeUri: "/",
            relativeUriPathSegments: [ ],
            methods: [
              {
                method: "post",
                description: "barbarbar fixed text foofoofoo"
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if parameters are missing', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: <<foo>> resourceType should be used for any collection of items',
        '      post:',
        '       description: <<foo>><<foo>><<foo>> fixed text <<bar>><<bar>><<bar>>',
        '       <<foo>>: <<bar>>',
        '/:',
        '  type: { collection: { foo: bar } }'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/value was not provided for parameter: bar/).and.notify(done);
    });

    it('should fail if resourceType uses a missing trait', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - secured:',
        '      displayName: OAuth 2.0 security',
        '      queryParameters:',
        '       access_token:',
        '         description: OAuth Access token',
        'resourceTypes:',
        '  - collection:',
        '      is: [ blah ]',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       foo:',
        '/:',
        '  type: collection'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith('there is no trait named blah').and.notify(done);
    });

    it('should apply a trait to a resource type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - secured:',
        '      displayName: OAuth 2.0 security',
        '      queryParameters:',
        '       access_token:',
        '         description: OAuth Access token',
        'resourceTypes:',
        '  - collection:',
        '      is: [ secured ]',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '/:',
        '  type: collection'
      ].join('\n');

      var expected = {
        title: "Test",
        traits: [
          {
            secured: {
              displayName: "OAuth 2.0 security",
              queryParameters: {
                access_token: {
                  description: "OAuth Access token",
                  displayName: "access_token",
                  type: "string"
                }
              }
            }
          }
        ],
        resourceTypes: [
          {
            collection:
            {
              is: [ "secured" ],
              displayName: "Collection",
              description: "This resourceType should be used for any collection of items",
              post:
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            description: "This resourceType should be used for any collection of items",
            type: "collection",
            relativeUri: "/",
            relativeUriPathSegments: [ ],
            methods: [
              {
                queryParameters: {
                  access_token: {
                    description: "OAuth Access token",
                    displayName: "access_token",
                    type: "string"
                  }
                },
                body: null,
                method: "post"
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply a resource type skipping missing optional parameter', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post:',
        '       body:',
        '      "get?":',
        '       body:',
        '/:',
        '  type: collection'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection",
              description: "This resourceType should be used for any collection of items",
              post:
              {
                body: null
              },
              "get?":
              {
                body: null
              }
            }
          }
        ],
        resources: [
          {
            description: "This resourceType should be used for any collection of items",
            type: "collection",
            relativeUriPathSegments: [ ],
            relativeUri: "/",
            methods: [
              {
                method: "post",
                body: null
              }
            ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply a resource type adding optional parameter', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'resourceTypes:',
        '  - collection:',
        '      displayName: Collection',
        '      description: This resourceType should be used for any collection of items',
        '      post?:',
        '       description: Some description',
        '/:',
        '  type: collection',
        '  post: {}'
      ].join('\n');

      var expected = {
        title: "Test",
        resourceTypes: [
          {
            collection:
            {
              displayName: "Collection",
              description: "This resourceType should be used for any collection of items",
              "post?":
              {
                description: "Some description"
              }
            }
          }
        ],
        resources: [
          {
            description: "This resourceType should be used for any collection of items",
            type: "collection",
            relativeUriPathSegments: [ ],
            relativeUri: "/",
            methods: [
              {
                method: "post",
                description: "Some description"
              }
            ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Parameter methods', function(){
    describe('- Unknown methods', function(){
      describe('- In resources', function(){
        it('should fail if calling an unknown method in a property', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'resourceTypes:',
            '  - collection:',
            '      displayName: Collection',
            '      <<parameterName|sarasa>>: resourceType should be used for any collection of items',
            '/:'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to property name/).and.notify(done);
        });

        it('should fail if calling an unknown method in a value in an applied type', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'resourceTypes:',
            '  - collection:',
            '      displayName: Collection',
            '      description: <<parameterName|unknownword>> resourceType should be used for any collection of items',
            '/:',
            '  type: { collection: {parameterName: someValue} }'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to parameter/).and.notify(done);
        });

        it.skip('should fail if calling an unknown method in a value in an unapplied type', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'resourceTypes:',
            '  - collection:',
            '      displayName: Collection',
            '      description: <<parameterName|unknownword>> resourceType should be used for any collection of items',
            '/:'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to parameter/).and.notify(done);
        });
      });

      describe('- In traits', function(){
        it('should fail if calling an unknown method in a property', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      <<parameterName|sarasa>>: resourceType should be used for any collection of items',
            '/:'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to property name/).and.notify(done);
        });

        it('should fail if calling an unknown method in a value in an applied trait', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      description: <<parameterName|unknownword>> resourceType should be used for any collection of items',
            '/:',
            '  is: [ traitName: {parameterName: someValue} ]',
            '  get:'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to parameter/).and.notify(done);
        });

        it.skip('should fail if calling an unknown method in a value in an unapplied trait', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      description: <<parameterName|unknownword>> resourceType should be used for any collection of items',
            '/:'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to parameter/).and.notify(done);
        });

        it.skip('should fail if calling an unknown method in a value in a trait without methods', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      description: <<parameterName|unknownword>> resourceType should be used for any collection of items',
            '/:',
            '  is: [ traitName ]'
          ].join('\n');
          raml.load(definition).should.be.rejectedWith(/unknown function applied to parameter/).and.notify(done);
        });
      });
    });

    describe('- Singuralize', function(){
      describe('- In resources', function(){
        it('should fail if calling an unknown method in a value in an applied type', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'resourceTypes:',
            '  - collection:',
            '      displayName: Collection',
            '      description: <<parameterName|!singularize>> resourceType should be used for any collection of items',
            '/:',
            '  type: { collection: {parameterName: commuters} }'
          ].join('\n');
          var expected = {
            "title": "Test",
            "resourceTypes": [
              {
                "collection": {
                  "displayName": "Collection",
                  "description": "<<parameterName|!singularize>> resourceType should be used for any collection of items"
                }
              }
            ],
            "resources": [
              {
                "description": "commuter resourceType should be used for any collection of items",
                "type": {
                  "collection": {
                    "parameterName": "commuters"
                  }
                },
                "relativeUri": "/",
                relativeUriPathSegments: [ ],
              }
            ]
          };
          raml.load(definition).should.become(expected).and.notify(done);
        });
      });

      describe('- In traits', function(){
        it('should fail if calling an unknown method in a value in an applied trait', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      description: <<parameterName|!singularize>> resourceType should be used for any collection of items',
            '/:',
            '  is: [ traitName: {parameterName: commuters} ]',
            '  get:'
          ].join('\n');
          var expected =  {
            "title": "Test",
            "traits": [
              {
                "traitName": {
                  "displayName": "Collection",
                  "description": "<<parameterName|!singularize>> resourceType should be used for any collection of items"
                }
              }
            ],
            "resources": [
              {
                "is": [
                  {
                    "traitName": {
                      "parameterName": "commuters"
                    }
                  }
                ],
                "relativeUri": "/",
                relativeUriPathSegments: [ ],
                "methods": [
                  {
                    "description": "commuter resourceType should be used for any collection of items",
                    "method": "get"
                  }
                ]
              }
            ]
          };
          raml.load(definition).should.become(expected).and.notify(done);
        });
      });
    });

    describe('Pluralize', function(){
      describe('- In resources', function(){
        it('should fail if calling an unknown method in a value in an applied type', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'resourceTypes:',
            '  - collection:',
            '      displayName: Collection',
            '      description: <<parameterName|!pluralize>> resourceType should be used for any collection of items',
            '/:',
            '  type: { collection: {parameterName: commuter} }'
          ].join('\n');
          var expected = {
            "title": "Test",
            "resourceTypes": [
              {
                "collection": {
                  "displayName": "Collection",
                  "description": "<<parameterName|!pluralize>> resourceType should be used for any collection of items"
                }
              }
            ],
            "resources": [
              {
                "description": "commuters resourceType should be used for any collection of items",
                "type": {
                  "collection": {
                    "parameterName": "commuter"
                  }
                },
                "relativeUri": "/",
                relativeUriPathSegments: [ ]
              }
            ]
          };
          raml.load(definition).should.become(expected).and.notify(done);
        });
      });

      describe('- In traits', function(){
        it('should fail if calling an unknown method in a value in an applied trait', function(done){
          var definition = [
            '#%RAML 0.8',
            '---',
            'title: Test',
            'traits:',
            '  - traitName:',
            '      displayName: Collection',
            '      description: <<parameterName|!pluralize>> resourceType should be used for any collection of items',
            '/:',
            '  is: [ traitName: {parameterName: commuter} ]',
            '  get:'
          ].join('\n');
          var expected =  {
            "title": "Test",
            "traits": [
              {
                "traitName": {
                  "displayName": "Collection",
                  "description": "<<parameterName|!pluralize>> resourceType should be used for any collection of items"
                }
              }
            ],
            "resources": [
              {
                "is": [
                  {
                    "traitName": {
                      "parameterName": "commuter"
                    }
                  }
                ],
                "relativeUri": "/",
                "methods": [
                  {
                    "description": "commuters resourceType should be used for any collection of items",
                    "method": "get"
                  }
                ],
                relativeUriPathSegments: [ ],
              }
            ]
          };
          raml.load(definition).should.become(expected).and.notify(done);
        });
      });
    });
  });

  describe('Schema support', function(){
    it('should not fail when specifying schemas at the root level', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '/resource:'
      ].join('\n');

      var expected = {
        title: "Test",
        schemas: [
            {
            foo: "Blah blah\n"
            }
          ],
        resources : [
          {
            relativeUri: "/resource",
            relativeUriPathSegments: [ "resource" ],
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail when specifying schemas is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas: foo',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemas property must be an array/).and.notify(done);
    });

    it('should fail when specifying schemas is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas: {}',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemas property must be an array/).and.notify(done);
    });

    it('should fail when schema is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo:',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schema foo must be a string/).and.notify(done);
    });

    it('should fail when schema is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: []',
        '/:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schema foo must be a string/).and.notify(done);
    });

    it('should fail if a schema is a map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '/foo:',
        '  displayName: A',
        '  post:' ,
        '    description: Blah',
        '    body:',
        '      application/json:',
        '        schema: foo3',
        '    responses:',
        '      200:',
        '       body:',
        '        application/json:',
        '          schema: foo',
        '      201:',
        '       body:',
        '        application/json:',
        '          schema: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schema must be a string/).notify(done);
    });

    it('should fail if a schema is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '/foo:',
        '  displayName: A',
        '  post:' ,
        '    description: Blah',
        '    body:',
        '      application/json:',
        '        schema: foo3',
        '    responses:',
        '      200:',
        '       body:',
        '        application/json:',
        '          schema: foo',
        '      201:',
        '       body:',
        '        application/json:',
        '          schema: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schema must be a string/).notify(done);
    });

    it('should apply trait', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '    faa: |',
        '       Blah blah',
        '/foo:',
        '  displayName: A',
        '  post:' ,
        '    description: Blah',
        '    body:',
        '      application/json:',
        '        schema: foo3',
        '    responses:',
        '      200:',
        '        body:',
        '          application/json:',
        '            schema: foo',
        '      201:',
        '        body:',
        '          application/json:',
        '            schema: foo2'
      ].join('\n');

      var expected = {
        title: 'Test',
        schemas: [{
          foo: "Blah blah\n",
          faa: "Blah blah\n"
        }],
        resources: [{
          displayName: 'A',
          relativeUri: '/foo',
          relativeUriPathSegments: [ "foo" ],
          methods:[{
            description: 'Blah',
            body: {
              "application/json": {
                "schema": "foo3"
              }
            },
            responses: {
              200: {
                body: {
                  "application/json": {
                    schema: "Blah blah\n"
                  }
                }
              },
              201: {
                body: {
                  "application/json": {
                    schema: "foo2"
                  }
                }
              }
            },
            method: 'post'
          }]
        }]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply trait multiple times', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '/foo:',
        '  displayName: A',
        '  post:' ,
        '    description: Blah',
        '    body:',
        '      application/json:',
        '        schema: foo',
        '    responses:',
        '      200:',
        '        body:',
        '         application/json:',
        '           schema: foo',
        '      201:',
        '        body:',
        '         application/json:',
        '           schema: foo2'
      ].join('\n');

      var expected = {
        title: 'Test',
        schemas: [{
          foo: "Blah blah\n"
        }],
        resources: [{
          displayName: 'A',
          relativeUri: '/foo',
          relativeUriPathSegments: [ "foo" ],
          methods:[{
            description: 'Blah',
            body: {
              "application/json": {
                schema: "Blah blah\n"
              }
            },
            responses: {
              200: {
                body: {
                  "application/json": {
                    schema: "Blah blah\n"
                  }
                }
              },
              201: {
                body: {
                  "application/json": {
                    schema: "foo2"
                  }
                }
              }
            },
            method: 'post'
          }]
        }]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should apply multiple schemas', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'schemas:',
        '  - foo: |',
        '       Blah blah',
        '  - foo2: |',
        '       halb halB',
        '/foo:',
        '  displayName: A',
        '  post:' ,
        '    description: Blah',
        '    body:',
        '      application/json:',
        '        schema: foo',
        '    responses:',
        '      200:',
        '        body:',
        '         application/json:',
        '          schema: foo',
        '      201:',
        '        body:',
        '         application/json:',
        '          schema: foo2',
        ''
      ].join('\n');

      var expected = {
        title: 'Test',
        schemas: [
          {
            foo: "Blah blah\n"
          },
          {
            foo2: "halb halB\n"
          }
        ],
        resources: [{
          displayName: 'A',
          relativeUriPathSegments: [ "foo" ],
          relativeUri: '/foo',
          methods:[{
            description: 'Blah',
            body: {
              "application/json": {
                schema: "Blah blah\n"
              }
            },
            responses: {
              200: {
                body: {
                  "application/json": {
                    schema: "Blah blah\n"
                  }
                }
              },
              201: {
                body:{
                  "application/json": {
                    schema: "halb halB\n"
                  }
                }
              }
            },
            method: 'post'
          }]
        }]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Security schemes', function(){
    it('should fail when schemes is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        '  foo: |',
        '       Blah blah',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security schemes property, it must be an array/).and.notify(done);
    });

    it('should fail when schemes is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes: foo',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security schemes property, it must be an array/).and.notify(done);
    });

    it('should fail when schemes is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security schemes property, it must be an array/).and.notify(done);
    });

    it('should succeed when schemes is empty', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes: []',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [],
        "resources": [
          {
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail when schemes has a null scheme', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - ',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security scheme property, it must be a map/).and.notify(done);
    });

    it('should fail when scheme is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme: scalar',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security scheme property, it must be a map/).and.notify(done);
    });

    it('should fail when scheme is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme: []',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/invalid security scheme property, it must be a map/).and.notify(done);
    });

    it('should fail when scheme contains a wrong property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     property: null',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property: 'property' is invalid in a security scheme/).and.notify(done);
    });

    it('should fail when scheme does not have type', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-{.+}"/).and.notify(done);
    });

    it('should succeed when type is "OAuth 2.0"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: OAuth 2.0',
        '     settings:',
        '       authorizationUri: https://www.dropbox.com/1/oauth2/authorize',
        '       accessTokenUri: https://api.dropbox.com/1/oauth2/token',
        '       authorizationGrants: [ code, token ]',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "OAuth 2.0",
              settings: {
                authorizationUri: "https://www.dropbox.com/1/oauth2/authorize",
                accessTokenUri: "https://api.dropbox.com/1/oauth2/token",
                authorizationGrants: ["code", "token"]
              }
            }
          }
        ],
        "resources": [
          {
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ]          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when type is "OAuth 1.0"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: OAuth 1.0',
        '     settings:',
        '       requestTokenUri: https://api.dropbox.com/1/oauth/request_token',
        '       authorizationUri: https://www.dropbox.com/1/oauth/authorize',
        '       tokenCredentialsUri: https://api.dropbox.com/1/oauth/access_token',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "OAuth 1.0",
              settings:{
                requestTokenUri: "https://api.dropbox.com/1/oauth/request_token",
                authorizationUri: "https://www.dropbox.com/1/oauth/authorize",
                tokenCredentialsUri: "https://api.dropbox.com/1/oauth/access_token"
              }
            }
          }
        ],
        "resources": [
          {
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when type is "Basic Authentication"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: Basic Authentication',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "Basic Authentication"
            }
          }
        ],
        "resources": [
          {
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when type is "Digest Authentication"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: Digest Authentication',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "Digest Authentication"
            }
          }
        ],
        "resources": [
          {
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource"
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when type is "x-other-something"', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "x-other-something"
            }
          }
        ],
        "resources": [
          {
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource"
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when using null securityScheme', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        'securedBy: [ null ]',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "x-other-something"
            }
          }
        ],
        securedBy: [null],
        "resources": [
          {
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource"
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when using a securityScheme', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        'securedBy: [ scheme ]',
        '/resource:'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "x-other-something"
            }
          }
        ],
        securedBy: [ "scheme" ],
        "resources": [
          {
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource"
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when using a securityScheme', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        '/resource:',
        '  securedBy: [ scheme ]'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "x-other-something"
            }
          }
        ],
        "resources": [
          {
            securedBy: [ "scheme" ],
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource"
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when using a securityScheme', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        '/resource:',
        '  get:',
        '    securedBy: [ scheme ]'
      ].join('\n');
      var expected = {
        "title": "Test",
        "securitySchemes": [
          {
            "scheme": {
              "description": "This is some text",
              "type": "x-other-something"
            }
          }
        ],
        "resources": [
          {
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ],
            methods:[
              {
                method: "get",
                securedBy: [ "scheme" ]
              }
            ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail when using a securityScheme twice in the same property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: x-other-something',
        '/resource:',
        '  get:',
        '    securedBy: [ scheme, scheme ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/securitySchemes can only be referenced once in a securedBy property/).and.notify(done);
    });

    it('should fail when type is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type:',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-{.+}"/).and.notify(done);
    });

    it('should fail when type is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: []',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-{.+}"/).and.notify(done);
    });

    it('should fail when type is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'securitySchemes:',
        ' - scheme:',
        '     description: This is some text',
        '     type: {}',
        '/resource:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/schemes type must be any of: "OAuth 1.0", "OAuth 2.0", "Basic Authentication", "Digest Authentication", "x-{.+}"/).and.notify(done);
    });

    it('resource should inherit securedBy from root', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'securitySchemes:',
          '  - scheme1:',
          '      type: x-other',
          '      description: some thing goes here',
          'securedBy: [scheme1]',
          '/someResource:',
          '  get:',
          '  description: aslkjdhakjfh'
      ].join('\n');
      var expected = {
          "title": "Test",
          "securitySchemes": [
              {
                  "scheme1": {
                      "type": "x-other",
                      "description": "some thing goes here"
                  }
              }
          ],
          "securedBy": [
              "scheme1"
          ],
          "resources": [
              {
                  "description": "aslkjdhakjfh",
                  "relativeUri": "/someResource",
                  "methods": [
                      {
                          "securedBy": [
                              "scheme1"
                          ],
                          "method": "get"
                      }
                  ],
                  "relativeUriPathSegments": [
                      "someResource"
                  ]
              }
          ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('method should inherit securedBy from resource', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'securitySchemes:',
          '  - scheme1:',
          '      type: x-other',
          '      description: some thing goes here',
          '/someResource:',
          '  securedBy: [scheme1]',
          '  get:',
          '  description: aslkjdhakjfh'
        ].join('\n');
        var expected = {
            "title": "Test",
            "securitySchemes": [
                {
                    "scheme1": {
                        "type": "x-other",
                        "description": "some thing goes here"
                    }
                }
            ],
            "resources": [
                {
                    "securedBy": [
                        "scheme1"
                    ],
                    "description": "aslkjdhakjfh",
                    "relativeUri": "/someResource",
                    "methods": [
                        {
                            "securedBy": [
                                "scheme1"
                            ],
                            "method": "get"
                        }
                    ],
                    "relativeUriPathSegments": [
                        "someResource"
                    ]
                }
            ]
        };

        raml.load(definition).should.become(expected).and.notify(done);
    });

    it('method should not inherit securedBy from resource if it has property', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'securitySchemes:',
          '  - scheme1:',
          '      type: x-other',
          '      description: some thing goes here',
          '  - scheme2:',
          '      type: x-other',
          '      description: some thing goes here',
          '/someResource:',
          '  securedBy: [scheme2]',
          '  get:',
          '    securedBy: [scheme1]',
          '  description: aslkjdhakjfh'
      ].join('\n');
      var expected = {
          "title": "Test",
          "securitySchemes": [
              {
                  "scheme1": {
                      "type": "x-other",
                      "description": "some thing goes here"
                  }
              },
              {
                  "scheme2": {
                      "type": "x-other",
                      "description": "some thing goes here"
                  }
              }
          ],
          "resources": [
              {
                  "securedBy": [
                      "scheme2"
                  ],
                  "description": "aslkjdhakjfh",
                  "relativeUri": "/someResource",
                  "methods": [
                      {
                          "securedBy": [
                              "scheme1"
                          ],
                          "method": "get"
                      }
                  ],
                  "relativeUriPathSegments": [
                      "someResource"
                  ]
              }
          ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('method should not inherit securedBy from root if it has property', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'title: Test',
          'securitySchemes:',
          '  - scheme1:',
          '      type: x-other',
          '      description: some thing goes here',
          '  - scheme2:',
          '      type: x-other',
          '      description: some thing goes here',
          'securedBy: [scheme2]',
          '/someResource:',
          '  get:',
          '    securedBy: [scheme1]',
          '  description: aslkjdhakjfh'
      ].join('\n');
      var expected = {
          "title": "Test",
          "securitySchemes": [
              {
                  "scheme1": {
                      "type": "x-other",
                      "description": "some thing goes here"
                  }
              },
              {
                  "scheme2": {
                      "type": "x-other",
                      "description": "some thing goes here"
                  }
              }
          ],
          "securedBy": [
              "scheme2"
          ],
          "resources": [
              {
                  "description": "aslkjdhakjfh",
                  "relativeUri": "/someResource",
                  "methods": [
                      {
                          "securedBy": [
                              "scheme1"
                          ],
                          "method": "get"
                      }
                  ],
                  "relativeUriPathSegments": [
                      "someResource"
                  ]
              }
          ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Resource Validations', function() {
    it('should fail if using parametric property name in a resource', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '  /b:',
        '    displayName: AB',
        '    <<property>>:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property '<<property>>' is invalid in a resource/).and.notify(done);
    });

    it('should fail if displayName is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '  /b:',
        '    displayName: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'displayName' must be a string/).and.notify(done);
    });

    it('should fail if displayName is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '  /b:',
        '    displayName: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'displayName' must be a string/).and.notify(done);
    });

    it('should fail if description is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '  /b:',
        '    description: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'description' must be a string/).and.notify(done);
    });

    it('should fail if description is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '  /b:',
        '    description: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'description' must be a string/).and.notify(done);
    });

    it('should fail if method is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/method must be a map/).and.notify(done);
    });

    it('should fail if method is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get: false'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/method must be a map/).and.notify(done);
    });

    it('should fail if displayName is defined within methods', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '    displayName: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith('property: \'displayName\' is invalid in a method').and.notify(done);
    });

    it('should fail if methods description is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '    description: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'description' must be a string/).and.notify(done);
    });

    it('should fail if methods description is an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/a:',
        '  displayName: A',
        '  get:',
        '    description: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property 'description' must be a string/).and.notify(done);
    });

    it('should fail when declaring a URI parameter in a resource with a wrong property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '/{hello}:',
        '  uriParameters:',
        '    hello:',
        '      displayName: A',
        '      blah: This is A'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unknown property blah/).and.notify(done);
    });

    it('should fail when declaring a URI parameter in a nested resource with a wrong property', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '/{hello}:',
        '  uriParameters:',
        '    hello:',
        '      displayName: A',
        '  /{hello}:',
        '    uriParameters:',
        '      hello:',
        '        displayName: A',
        '        blah: This is A'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unknown property blah/).and.notify(done);
    });

    it('should fail when not using a declared URI parameter in a nested resource', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '/{hello}:',
        '  uriParameters:',
        '    hello:',
        '      displayName: A',
        '  /{hello}:',
        '    uriParameters:',
        '      not-used:',
        '        displayName: A'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/not-used uri parameter unused/).and.notify(done);
    });

    it('should fail if headers is string', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        'baseUriParameters:',
        '  a:',
        '    displayName: A',
        '    description: This is A',
        '/{hello}:',
        '  get:',
        '    headers: foo'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'headers' must be a map/).and.notify(done);
    });

    it('should fail if headers is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  get:',
        '    headers: []'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'headers' must be a map/).and.notify(done);
    });

    it('should succeed if headers is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    headers:'
      ].join('\n');

      var expected ={
        "title": "Test",
        "resources": [
          {
            relativeUriPathSegments: [ "foo" ],
            "relativeUri": "/foo",
            "methods": [
              {
                "headers": null,
                "method": "get"
              }
            ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if header is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    headers:',
        '      foo: bar'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/each header must be a map/).and.notify(done);
    });

    it('should fail if header is empty an array', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    headers:',
        '      foo: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/named parameter needs at least one type/).and.notify(done);
    });

    it('should fail if header uses unknown property', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    headers:',
        '      TemplateHeader:',
        '       foo:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/unknown property foo/).and.notify(done);
    });

    it('should fail if queryParams is string', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        '/{hello}:',
        '  get:',
        '    queryParameters: foo'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'queryParameters' must be a map/).and.notify(done);
    });

    it('should fail if queryParameters is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/foo:',
        '  get:',
        '    queryParameters: []'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'queryParameters' must be a map/).and.notify(done);
    });

    it('should succeed if queryParameters is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    queryParameters:'
      ].join('\n');

      var expected ={
        "title": "Test",
        "resources": [
          {
            "relativeUri": "/foo",
            relativeUriPathSegments: [ "foo" ],
            "methods": [
              {
                "queryParameters": null,
                "method": "get"
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if queryParameters use wrong property name', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    queryParameters:',
        '     FooParam:',
        '       bar: bar'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/unknown property bar/).and.notify(done);
    });

    it('should fail if body is a scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body: foo'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property: body specification must be a map/).and.notify(done);
    });

    it('should succeed if body is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:'
      ].join('\n');
      var expected = {
        title: "Test",
        resources: [
          {
            relativeUriPathSegments: [ "foo" ],
            relativeUri: "/foo",
            methods: [
              {
                body: null,
                method: "get"
              }
            ]
          }
        ]
      }
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if body is using implicit after explicit body', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:',
        '      application/json:',
        '      schema: foo'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/not compatible with explicit Media Type/).and.notify(done);
    });

    it('should fail if body is using explicit after implicit body', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:',
        '      schema: foo',
        '      application/json:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/not compatible with implicit default Media Type/).and.notify(done);
    });

    it('should fail if formParameters kicks implicit mode on', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:',
        '      formParameters:',
        '      application/json:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/not compatible with implicit default Media Type/).and.notify(done);
    });

    it('should fail if schema kicks implicit mode on', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:',
        '      schema: foo',
        '      application/json:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/not compatible with implicit default Media Type/).and.notify(done);
    });

    it('should fail if example kicks implicit mode on', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/foo:',
        '  get:',
        '    body:',
        '      example: foo',
        '      application/json:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/not compatible with implicit default Media Type/).and.notify(done);
    });

    it('should fail if formParameters is string', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        '/{hello}:',
        '  post:',
        '    body:',
        '      formParameters: foo'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'formParameters' must be a map/).and.notify(done);
    });

    it('should fail if queryParameters is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        '/{hello}:',
        '  post:',
        '    body:',
        '      formParameters: []'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/property: 'formParameters' must be a map/).and.notify(done);
    });

    it('should succeed if queryParameters is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'mediaType: application/json',
        'baseUri: http://{a}.myapi.org',
        '/{hello}:',
        '  post:',
        '    body:',
        '      formParameters:'
      ].join('\n');

      var expected ={
        title: "Test",
        mediaType: "application/json",
        baseUri: "http://{a}.myapi.org",
        protocols: [
          'HTTP'
        ],
        resources: [
          {
            relativeUriPathSegments: [ "{hello}" ],
            relativeUri: "/{hello}",
            methods: [
              {
                body:{
                  "application/json": {
                    formParameters: null
                  }
                },
                method: "post",
                protocols: [
                  'HTTP'
                ],
              }
            ],
            uriParameters: {
              hello: {
                type: "string",
                required: true,
                displayName: "hello"
              }
            }
          }
        ],
        baseUriParameters: {
          a: {
            type: "string",
            required: true,
            displayName: "a"
          }
        }
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if queryParameters use wrong property name', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        'baseUri: http://{a}.myapi.org',
        '/{hello}:',
        '  post:',
        '    body:',
        '      formParameters:',
        '        Formparam:',
        '           foo: blah'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/unknown property foo/).and.notify(done);
    });

    it('should fail if responses is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses: scalar'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property: 'responses' must be a map/).and.notify(done);
    });

    it('should fail if responses is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses: [ value ]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/property: 'responses' must be a map/).and.notify(done);
    });

    it('should succeed if responses is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses:'
      ].join('\n');

      var expected = {
        "title": "Test",
        "resources": [
          {
            relativeUriPathSegments: [ "root" ],
            "relativeUri": "/root",
            "methods": [
              {
                "responses": null,
                "method": "post"
              }
            ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if response code is string', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses:',
        '     responses:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/each response key must be an integer/).and.notify(done);
    });

    it('should fail if response code is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses:',
        '     ~:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/each response key must be an integer/).and.notify(done);
    });

    it('should fail if response code in list is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        'title: Test',
        '/root:',
        '  post:',
        '    responses:',
        '     [string]:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/only scalar map keys are allowed in RAML/).and.notify(done);
    });
  });

  describe('Base Uri Parameters', function(){
    it('should fail when a resource specified baseUriParams and baseuri is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        '/resource:',
        '  baseUriParameters:',
        '   domainName:',
        '     example: your-bucket'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/base uri parameters defined when there is no baseUri/).and.notify(done);
    });

    it('should fail when a resource specified baseUriParams unused in the URI', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'baseUri: https://myapi.com',
        'title: Test',
        '/resource:',
        '  baseUriParameters:',
        '   domainName:',
        '     example: your-bucket'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/domainName uri parameter unused/).and.notify(done);
    });

    it('should succeed when a overriding baseUriParams in a resource', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'baseUri: https://{domainName}.myapi.com',
        'title: Test',
        '/resource:',
        '  baseUriParameters:',
        '   domainName:',
        '     example: your-bucket'
      ].join('\n');
      var expected = {
        baseUri: "https://{domainName}.myapi.com",
        protocols: [
          'HTTPS'
        ],
        title: "Test",
        baseUriParameters: {
          domainName: {
            type: "string",
            required: true,
            displayName: "domainName"
          }
        },
        resources: [
          {
            "baseUriParameters": {
              "domainName": {
                "example": "your-bucket",
                type: "string",
                required: true,
                displayName: "domainName"
              }
            },
            "relativeUri": "/resource",
            relativeUriPathSegments: [ "resource" ]
          }
        ]
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when a overriding baseUriParams in a method', function(done) {
      var definition = [
          '#%RAML 0.8',
          '---',
          'baseUri: https://{domainName}.myapi.com',
          'title: Test',
          '/resource:',
          '  get:',
          '     baseUriParameters:',
          '       domainName:',
          '         example: your-bucket'
      ].join('\n');
      var expected = {
          baseUri: "https://{domainName}.myapi.com",
          protocols: [
            'HTTPS'
          ],
          title: "Test",
          resources: [
            {
              relativeUriPathSegments: [ "resource" ],
              "relativeUri": "/resource",
              methods: [
                {
                    baseUriParameters: {
                        "domainName": {
                           example: "your-bucket",
                           type: "string",
                            required: true,
                            displayName: "domainName"
                        }
                    },
                    method: "get",
                    protocols: [
                      'HTTPS'
                    ],
                }
              ],
            }
          ],
          baseUriParameters: {
              domainName: {
                  type: "string",
                  required: true,
                  displayName: "domainName"
              }
          }
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should succeed when a overriding baseUriParams in a resource 3 levels deep', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'baseUri: https://{domainName}.myapi.com',
        'title: Test',
        '/resource:',
        ' /resource:',
        '   /resource:',
        '     baseUriParameters:',
        '       domainName:',
        '         example: your-bucket'
      ].join('\n');
      var expected = {
        baseUri: "https://{domainName}.myapi.com",
        protocols: [
          'HTTPS'
        ],
        title: "Test",
        baseUriParameters: {
          domainName: {
            type: "string",
            required: true,
            displayName: "domainName"
          }
        },
        resources: [
          {
            relativeUriPathSegments: [ "resource" ],
            "relativeUri": "/resource",
            "resources": [
              {
                relativeUriPathSegments: [ "resource" ],
                "relativeUri": "/resource",
                "resources": [
                  {
                    "baseUriParameters": {
                      "domainName": {
                        "example": "your-bucket",
                        type: "string",
                        required: true,
                        displayName: "domainName"
                      }
                    },
                    "relativeUri": "/resource",
                    relativeUriPathSegments: [ "resource" ],
                  }
                ]
              }
            ]
          }
        ]
      };

      raml.load(definition).should.become(expected).and.notify(done);
    });
  });

  describe('Documentation section', function() {
    it('should fail if docsection is empty array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation: []'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/there must be at least one document in the documentation section/).and.notify(done);
    });

    it('should fail if docsection is missing title', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation:',
        '  - content: Content'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/a documentation entry must have title property/).and.notify(done);
    });

    it('should fail if docsection is missing content', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation:',
        '  - title: Getting Started'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/a documentation entry must have content property/).and.notify(done);
    });

    it('should fail if docsection is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation: {}'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/documentation must be an array/).and.notify(done);
    });

    it('should fail if docsection is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation: scalar'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/documentation must be an array/).and.notify(done);
    });

    it('should fail if docentry is scalar', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation: [scalar]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/each documentation section must be a map/).and.notify(done);
    });

    it('should fail if docentry is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation: [[scalar]]'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/each documentation section must be a map/).and.notify(done);
    });

    it('should fail if docentry uses wrong property name', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation:',
        '  - title: Getting Started',
        '    content: Getting Started',
        '    wrongPropertyName: Getting Started'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/unknown property wrongPropertyName/).and.notify(done);
    });

    it('should fail if has null title', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation:',
        '  - title:',
        '    content: Getting Started'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/title must be a string/).and.notify(done);
    });

    it('should fail if has null content', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'documentation:',
        '  - title: some title',
        '    content:'
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(/content must be a string/).and.notify(done);
    });
  });

  describe('Default Media Type', function() {
    it('should fail if mediaType property is null', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'mediaType:'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/mediaType must be a scalar/).and.notify(done);
    });

    it('should fail if mediaType property is array', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'mediaType: []'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/mediaType must be a scalar/).and.notify(done);
    });

    it('should fail if mediaType property is map', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'mediaType: {}'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/mediaType must be a scalar/).and.notify(done);
    });

    it('should not fail if mediaType property is used in root', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'mediaType: application/json'
      ].join('\n');
      var expected = {
        title: "MyApi",
        mediaType: "application/json"
      };
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should fail if mediaType property is not present and implicit mode is detected in a resource', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        '/resource:',
        '  post:',
        '    body:',
        '     example: example of a post',
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/body tries to use default Media Type, but mediaType is null/).and.notify(done);
    });

    it('should fail if mediaType property is not present and implicit mode is detected in a trait', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'traits:',
        '  - traitName:',
        '      body:',
        '        example: example of a post',
        '/resource:',
        '  is: [traitName]'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/body tries to use default Media Type, but mediaType is null/).and.notify(done);
    });

    it('should fail if mediaType property is not present and implicit mode is detected in a resourceType', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: MyApi',
        'resourceTypes:',
        '  - typeName:',
        '      post:',
        '        body:',
        '          example: example of a post',
        '/resource:',
        '  type: typeName'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/body tries to use default Media Type, but mediaType is null/).and.notify(done);
    });

    describe('Default Media Type in request body', function(){
      it('should apply mediaType property in a resource', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          '/resource:',
          '  post:',
          '    body:',
          '     example: example of a post',
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resources:[
            {
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  body: {
                    "application/json": {
                      example: "example of a post"
                    }
                  },
                  method: "post"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a resourceType', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        body:',
          '          example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  body:{
                    example: "example of a response"
                  }
                }
              }
            }
          ],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  body: {
                    "application/json": {
                      example: "example of a response"
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed with a resourceType', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        is: [bodiable]',
          'traits:',
          '  - bodiable:',
          '      body:',
          '        example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  is: ["bodiable"]
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              body:{
                example: "example of a response"
              }
            }
          }],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  body: {
                    "application/json": {
                      example: "example of a response"
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed resource', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        is: [bodiable]',
          'traits:',
          '  - bodiable:',
          '          body:',
          '            example: example of a response',
          '/resource:',
          '  is: [bodiable]',
          '  get:'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  is: ["bodiable"]
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              body:{
                example: "example of a response"
              }
            }
          }],
          resources:[
            {
              is: ["bodiable"],
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  body: {
                    "application/json": {
                      example: "example of a response"
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed with a resourceType which inherits from another RT and applies a trait', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      type: secondLevel',
          '  - secondLevel:',
          '      is: [bodiable]',
          '      get:',
          '            body:',
          '              schema: composable schema',
          'traits:',
          '  - bodiable:',
          '          body:',
          '            example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                type: "secondLevel"
              }
            },
            {
              secondLevel: {
                is: [ "bodiable" ],
                get: {
                  body: {
                    schema: "composable schema"
                  }
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              body:{
                example: "example of a response"
              }
            }
          }],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  body: {
                    "application/json": {
                      schema: "composable schema",
                      example: "example of a response"
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should be applied to nested resources', function (done) {
        raml.load(
          [
            '#%RAML 0.8',
            '---',
            'title: MyApi',
            'mediaType: application/json',
            '/1:',
            '  /2:',
            '    get:',
            '        body:',
            '          example:'
          ].join('\n')
        ).should.eventually.have.deep.property('resources[0].resources[0].methods[0].body.application/json').and.notify(done);
      });
    });

    describe('Default Media Type in response body', function(){
      it('should apply mediaType property in a resource', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          '/resource:',
          '  post:',
          '    responses:',
          '      200:',
          '        body:',
          '          example: example of a post'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resources:[
            {
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  responses: {
                    200:{
                      body: {
                        "application/json": {
                          example: "example of a post"
                        }
                      }
                    }
                  },
                  method: "post"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a resourceType', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        responses:',
          '          200:',
          '            body:',
          '              example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  responses: {
                    200: {
                      body:{
                        example: "example of a response"
                      }
                    }
                  }
                }
              }
            }
          ],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  responses: {
                    200: {
                      body: {
                        "application/json": {
                          example: "example of a response"
                        }
                      },
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed with a resourceType', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        is: [bodiable]',
          'traits:',
          '  - bodiable:',
          '      responses:',
          '        200:',
          '          body:',
          '            example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  is: ["bodiable"]
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              responses: {
                200: {
                  body:{
                    example: "example of a response"
                  }
                }
              }
            }
          }],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  responses: {
                    200: {
                      body: {
                        "application/json": {
                          example: "example of a response"
                        }
                      },
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed resource', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      get:',
          '        is: [bodiable]',
          'traits:',
          '  - bodiable:',
          '      responses:',
          '        200:',
          '          body:',
          '            example: example of a response',
          '/resource:',
          '  is: [bodiable]',
          '  get:'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                get: {
                  is: ["bodiable"]
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              responses: {
                200: {
                  body:{
                    example: "example of a response"
                  }
                }
              }
            }
          }],
          resources:[
            {
              is: ["bodiable"],
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  responses: {
                    200: {
                      body: {
                        "application/json": {
                          example: "example of a response"
                        }
                      }
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should apply mediaType property in a trait composed with a resourceType which inherits from another RT and applies a trait', function(done) {
        var definition = [
          '#%RAML 0.8',
          '---',
          'title: MyApi',
          'mediaType: application/json',
          'resourceTypes:',
          '  - gettable:',
          '      type: secondLevel',
          '  - secondLevel:',
          '      is: [bodiable]',
          '      get:',
          '        responses:',
          '          200:',
          '            body:',
          '              schema: composable schema',
          'traits:',
          '  - bodiable:',
          '      responses:',
          '        200:',
          '          body:',
          '            example: example of a response',
          '/resource:',
          '  type: gettable'
        ].join('\n');
        var expected = {
          title: "MyApi",
          mediaType: "application/json",
          resourceTypes: [
            {
              gettable: {
                type: "secondLevel"
              }
            },
            {
              secondLevel: {
                is: [ "bodiable" ],
                get: {
                  responses: {
                    200: {
                      body: {
                        schema: "composable schema"
                      }
                    }
                  }
                }
              }
            }
          ],
          traits: [{
            bodiable: {
              responses: {
                200: {
                  body:{
                    example: "example of a response"
                  }
                }
              }
            }
          }],
          resources:[
            {
              type: "gettable",
              relativeUri: "/resource",
              relativeUriPathSegments: [ "resource" ],
              methods: [
                {
                  responses: {
                    200: {
                      body: {
                        "application/json": {
                          schema: "composable schema",
                          example: "example of a response"
                        }
                      },
                    }
                  },
                  method: "get"
                }
              ]
            }
          ]
        };
        raml.load(definition).should.become(expected).and.notify(done);
      });

      it('should be applied to nested resources', function (done) {
        raml.load(
          [
            '#%RAML 0.8',
            '---',
            'title: MyApi',
            'mediaType: application/json',
            '/1:',
            '  /2:',
            '    get:',
            '      responses:',
            '        200:',
            '          body:',
            '            example:'
          ].join('\n')
        ).should.eventually.have.deep.property('resources[0].resources[0].methods[0].responses.200.body.application/json').and.notify(done);
      });
    });
  });

  describe('Error reporting', function () {
    it('should report correct line/column for invalid trait error', function(done) {
      var noop = function () {};
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Test',
        'traits:',
        '  - wrongKey:',
        '      displayName: Rate Limited',
        '      responses:',
        '        503:',
        '          description: Server Unavailable. Check Your Rate Limits.',
        '/:',
        '  is: [ throttled, rateLimited: { parameter: value } ]'
      ].join('\n');

      raml.load(definition).then(noop, function (error) {
        setTimeout(function () {
          expect(error.problem_mark).to.exist;
          error.problem_mark.column.should.be.equal(8);
          error.problem_mark.line.should.be.equal(10);
          done();
        }, 0);
      });
    });

    it('should report correct line/column for missing title', function(done) {
      var noop = function () {};
      var definition = [
        '#%RAML 0.8',
        '---',
        '/:',
        '  get:'
      ].join('\n');
      raml.load(definition).then(noop, function (error) {
        setTimeout(function () {
          expect(error.problem_mark).to.exist;
          error.problem_mark.column.should.be.equal(0);
          error.problem_mark.line.should.be.equal(2);
          done();
        }, 0);
      });
    });

    it('should report correct line/column for missing title', function(done) {
      var noop = function () {};
      var definition = [
        '#%RAML 0.8',
        '---'
      ].join('\n');
      raml.load(definition).should.be.rejectedWith(/document must be a map/).and.notify(done);
    });

    it('should not mark query parameters as required by default', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Title',
        'baseUri: http://server/api',
        '/:',
        '  get:',
        '    queryParameters:',
        '      notRequired:',
        '        type: integer'
      ].join('\n');
      var expected = {
        title: 'Title',
        baseUri: 'http://server/api',
        protocols: [
          'HTTP'
        ],
        resources: [
          {
            relativeUriPathSegments: [ ],
            relativeUri: '/',
            methods: [
              {
                method: 'get',
                protocols: [
                  'HTTP'
                ],
                queryParameters: {
                  notRequired: {
                    type: 'integer',
                    displayName: 'notRequired'
                  }
                }
              }
            ]
          }
        ]
      }
      raml.load(definition).should.become(expected).and.notify(done);
    })

    it('should mark query parameters as required when explicitly requested', function(done) {
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: Title',
        'baseUri: http://server/api',
        '/:',
        '  get:',
        '    queryParameters:',
        '      mustBeRequired:',
        '        type: integer',
        '        required: true'
      ].join('\n');
      var expected = {
        title: 'Title',
        baseUri: 'http://server/api',
        protocols: [
          'HTTP'
        ],
        resources: [
          {
            relativeUriPathSegments: [ ],
            relativeUri: '/',
            methods: [
              {
                method: 'get',
                protocols: [
                  'HTTP'
                ],
                queryParameters: {
                  mustBeRequired: {
                    type: 'integer',
                    displayName: 'mustBeRequired',
                    required: true
                  }
                }
              }
            ]
          }
        ]
      }
      raml.load(definition).should.become(expected).and.notify(done);
    });

    it('should report error that contains URI inside', function(done) {
      var uri        = 'http://localhost:9001/invalid/url';
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: !include ' + uri
      ].join('\n');

      raml.load(definition).should.be.rejectedWith(uri).and.notify(done);
    });

    it('should report correct line/column for unavailable file in !include', function(done) {
      var noop       = function () {};
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: !include unavailable.raml'
      ].join('\n');

      raml.load(definition).then(noop, function (error) {
        setTimeout(function () {
          expect(error.problem_mark).to.exist;
          error.problem_mark.line.should.be.equal(2);
          error.problem_mark.column.should.be.equal(7);
          done();
        }, 0);
      });
    });

    it('should report correct line/column for unavailable URI in !include', function(done) {
      var noop       = function () {};
      var definition = [
        '#%RAML 0.8',
        '---',
        'title: !include http://localhost:9001/invalid/url'
      ].join('\n');

      raml.load(definition).then(noop, function (error) {
        setTimeout(function () {
          expect(error.problem_mark).to.exist;
          error.problem_mark.line.should.be.equal(2);
          error.problem_mark.column.should.be.equal(7);
          done();
        }, 0);
      });
    });

    it('should detect circular !include of the same resource', function (done) {
      var file = 'http://localhost:9001/test/raml-files/RT-261.raml';
      raml.loadFile(file).should.be.rejectedWith('detected circular !include of').and.notify(done);
    });
  });
});
