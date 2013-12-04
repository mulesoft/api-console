describe("RAML.Client.AuthStrategies.Oauth2.Token", function() {
  var securityScheme, tokenFactory;

  function createSecurityScheme(signedVia) {
    var describedBy = {
      headers: {},
      queryParameters: {}
    };

    switch(signedVia) {
      case 'headers':
        describedBy.headers.Authorization = { type: 'string' };
        break;
      case 'queryParameters':
        describedBy.queryParameters.access_token = { type: 'string' };
        break;
    }

    return { describedBy: describedBy };
  }

  beforeEach(function() {
    function createRequestStub() {
      return jasmine.createSpyObj('Request', Array.prototype.slice.call(arguments));
    }

    this.addMatchers({
      toSignRequestWithHeader: function(header, value) {
        var requestStub = createRequestStub('header');
        this.actual.sign(requestStub);

        var args = requestStub.header.mostRecentCall.args;
        return args[0] === header && args[1] === value;
      },

      toSignRequestWithQueryParameter: function(parameter, value) {
        var requestStub = createRequestStub('queryParam');
        this.actual.sign(requestStub);

        var args = requestStub.queryParam.mostRecentCall.args;
        return args[0] === parameter && args[1] === value;
      }
    });
  });

  describe("creating a token factory", function() {
    describe("by default", function() {
      beforeEach(function() {
        securityScheme = {};
        tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(securityScheme)
      });

      it("returns a factory that produces header tokens", function() {
        expect(tokenFactory('token')).toSignRequestWithHeader('Authorization', 'Bearer token');
      });
    });

    describe("when configured to sign requests via its headers", function() {
      beforeEach(function() {
        securityScheme = createSecurityScheme('headers');
        tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(securityScheme)
      });

      it("returns a factory that produces header tokens", function() {
        expect(tokenFactory('token')).toSignRequestWithHeader('Authorization', 'Bearer token');
      });
    });

    describe("when configured to sign requests via its query parameters", function() {
      beforeEach(function() {
        securityScheme = createSecurityScheme('queryParameters');
        tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(securityScheme)
      });

      it("returns a factory that produces query parameter tokens", function() {
        expect(tokenFactory('token')).toSignRequestWithQueryParameter('access_token', 'token');
      });
    });
  });
});
