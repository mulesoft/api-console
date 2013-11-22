describe("RAML.Client.AuthStrategies.Oauth2.requestAuthroization", function() {
  var credentialsManager, settings;

  beforeEach(function() {
    settings = {
      authorizationUri: 'https://example.com/oauth/authorize',
      accessTokenUri: 'https://example.com/oauth/access_token'
    }

    credentialsManager = jasmine.createSpyObj('credentialsManager', ['authorizationUrl']);
    credentialsManager.authorizationUrl.andReturn('http://example.com');
  });

  describe("initiating an authorization request", function() {
    var request;

    beforeEach(function() {
      spyOn(window, 'open');
      request = RAML.Client.AuthStrategies.Oauth2.requestAuthorization(settings, credentialsManager);
    });

    it("generates the authorization uri from the settings", function() {
      expect(credentialsManager.authorizationUrl).toHaveBeenCalledWith(settings.authorizationUri);
    });

    it("opens authorization resource in a new window", function() {
      expect(window.open).toHaveBeenCalledWith('http://example.com', 'raml-console-oauth2');
    });

    describe("completing the request by calling the authorization success callback", function() {
      var success;

      beforeEach(function() {
        success = jasmine.createSpy();
        request.then(success);
        window.RAML.authorizationSuccess('code');
      });

      it("yields the auth code", function() {
        expect(success).toHaveBeenCalledWith('code');
      })
    });
  });
});
