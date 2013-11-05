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
});
