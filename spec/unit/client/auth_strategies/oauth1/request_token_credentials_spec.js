describe("RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials", function() {
  var requestTokenCredentials, settings, token, signerFactory, xhrStub, promiseStub;

  beforeEach(function() {
    token = jasmine.createSpyObj('token', ['sign']);
    signerFactory = jasmine.createSpy('signerFactory').andReturn(token);
    promiseStub = jasmine.createSpyObj('promise', ['then']);
    xhrStub = spyOn($, 'ajax').andReturn(promiseStub);

    settings = {
      tokenCredentialsUri: 'https://example.com/oauth/access_token'
    }

    requestTokenCredentials = RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials(settings, signerFactory);
  });

  describe('by default', function() {
    beforeEach(function() {
      requestTokenCredentials({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
    });

    it("requests an access token", function() {
      var calledWith = xhrStub.mostRecentCall.args[0];
      expect(calledWith.url).toEqual(settings.tokenCredentialsUri);
      expect(calledWith.type).toEqual('post');
    });

    it("passes the temporary credentials to the token factory", function() {
      expect(signerFactory).toHaveBeenCalledWith({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
    });

    it("signs the request with a token from the factory", function() {
      expect(signerFactory).toHaveBeenCalled();
      expect(token.sign).toHaveBeenCalled();
    });

    it("returns a token", function() {
      var responseData = 'oauth_token=finalToken&oauth_token_secret=finalTokenSecret';

      var result = promiseStub.then.mostRecentCall.args[0](responseData);

      expect(result.sign).toBeDefined();
    });
  });

  describe('with a proxy URL', function() {
    beforeEach(function() {
      RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'
      requestTokenCredentials({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
    });

    afterEach(function() {
      delete RAML.Settings.proxy;
    });

    it("proxies the request for the access token", function() {
      expect(xhrStub.mostRecentCall.args[0].url).toEqual(RAML.Settings.proxy + settings.tokenCredentialsUri);
    });
  });
});
