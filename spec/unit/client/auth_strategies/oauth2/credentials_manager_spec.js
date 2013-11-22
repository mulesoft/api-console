describe("RAML.Client.AuthStrategies.Oauth2.credentialsManager", function() {
  var credentials, credentialsManager;

  beforeEach(function() {
    credentials = { clientId: "id", clientSecret: "secret" }
    credentialsManager = RAML.Client.AuthStrategies.Oauth2.credentialsManager(credentials, 'code');
  });

  describe("generating the authorization url", function() {
    var authroizationUrl, queryString;

    beforeEach(function() {
      authorizationUrl = credentialsManager.authorizationUrl('http://example.com');
      queryString = authorizationUrl.split("?")[1];
    });

    it("uses the provided url", function() {
      expect(authorizationUrl.indexOf('http://example.com')).toEqual(0);
    });

    it("includes the client id in the query string", function() {
      expect(queryString).toContain('client_id=id');
    });

    it("includes the response type in the query string", function() {
      expect(queryString).toContain('response_type=code');
    });

    it("includes the redirectUrl in the query string", function() {
      expect(queryString).toContain('redirect_uri=');
    });
  });

  describe("generating the access token params", function() {
    var accessTokenParameters;

    beforeEach(function() {
      accessTokenParameters = credentialsManager.accessTokenParameters('code');
    });

    it("specifies the client id", function() {
      expect(accessTokenParameters.client_id).toEqual('id');
    });

    it("specifies the client secret", function() {
      expect(accessTokenParameters.client_secret).toEqual('secret');
    });

    it("specifies the supplied code", function() {
      expect(accessTokenParameters.code).toEqual('code');
    });

    it("specifies the grant type", function() {
      expect(accessTokenParameters.grant_type).toEqual('authorization_code');
    });

    it("specifies the redirect url", function() {
      expect(accessTokenParameters.redirect_uri).toBeDefined();
    });
  });
});
