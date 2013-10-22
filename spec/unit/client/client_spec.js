describe('RAML.Client.create', function() {
  var client, raml = createRAML(
    'title: Example API',
    'baseUri: http://www.example.com',
    'securitySchemes:',
    '  - basic:',
    '      type: Basic Authentication',
    '  - oauth2:',
    '      type: OAuth 2.0',
    '      settings:',
    '        authorizationUri: https://example.com/oauth/authorize',
    '        accessTokenUri: https://example.com/oauth/access_token'
    );

  parseRAML(raml);

  beforeEach(function() {
    client = RAML.Client.create(this.api);
  });

  describe("securityScheme", function() {
    var scheme;

    describe("when requesting a defined scheme", function() {
      beforeEach(function() {
        scheme = client.securityScheme('oauth2');
      });

      it("returns the requested scheme", function() {
        expect(scheme.type).toEqual('OAuth 2.0');
      });
    });

    describe("when requesting an undefined scheme", function() {
      var getUndefinedScheme = function() { return client.securityScheme('nothing'); }

      it("throws an error", function() {
        expect(getUndefinedScheme).toThrow();
      });
    });
  });

  describe("creating a new request", function() {
    var request, options;

    beforeEach(function() {
      request = client.createRequest('http://api.example.com', 'POST');
    });

    describe("by default", function() {
      beforeEach(function() {
        options = request.toOptions();
      });

      it("assigns the URL", function() {
        expect(options.url).toEqual('http://api.example.com')
      });

      it("assigns the method", function() {
        expect(options.type).toEqual('POST')
      });
    });

    describe("setting headers", function() {
      var headers = {
        "Content-Type": 'text/plain',
        "Content-Length": 52
      }

      describe("with no existing headers", function() {
        beforeEach(function() {
          request.headers(headers);
          options = request.toOptions();
        });

        it('assigns the headers', function() {
          expect(options.headers).toEqual(headers)
        });
      });

      describe("with existing headers", function() {
        var replacementHeaders = { 'X-Custom': 'whatever' };

        beforeEach(function() {
          request.headers(headers);
          request.headers(replacementHeaders);

          options = request.toOptions();
        });

        it("removes the old headers", function() {
          expect(options.headers).toEqual(replacementHeaders)
        });

        it("removes the old contentType", function() {
          expect(options.contentType).toBeUndefined()
        });
      });

      describe("setting the Content-Type header", function() {
        beforeEach(function() {
          request.headers(headers);
          options = request.toOptions();
        });

        it("exposes the contentType", function() {
          expect(options.contentType).toEqual('text/plain');
        });
      });

      describe("setting data", function() {
        var data = { "foo": 'bar' };

        beforeEach(function() {
          request.data(data);
          options = request.toOptions();
        });

        it('assigns the data', function() {
          expect(options.data).toEqual(data)
        });
      });
    });
  });

});
