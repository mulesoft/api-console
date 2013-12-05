describe("RAML.Client.AuthStrategies.Oauth1.requestAuthorization", function() {
  var request, settings;

  beforeEach(function() {
    spyOn(window, 'open');

    settings = {
      authorizationUri: 'https://example.com/oauth/authorize'
    }

    requestAuthorization = RAML.Client.AuthStrategies.Oauth1.requestAuthorization(settings);
    request = requestAuthorization({ token: 'tempToken', tokenSecret: 'tempTokenSecret' });
  });

  it("opens authorization resource in a new window", function() {
    var url = settings.authorizationUri + '?oauth_token=tempToken';
    expect(window.open).toHaveBeenCalledWith(url, 'raml-console-oauth1');
  });

  describe("completing the request by calling the authorization success callback", function() {
    var success;

    beforeEach(function() {
      success = jasmine.createSpy();
      request.then(success);
      window.RAML.authorizationSuccess({ verifier: 'verifier' });
    });

    it("yields the resulting authorization data along with original token and tokenSecret", function() {
      expect(success).toHaveBeenCalledWith({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
    })
  });
});
