describe("RAML.Client.AuthStrategies.Oauth1.requestToken", function() {
  var settings, token, tokenFactory, requestToken;

  beforeEach(function() {
    token = jasmine.createSpyObj('token', ['sign']);
    tokenFactory = jasmine.createSpy('tokenFactory').andReturn(token);

    settings = {
      requestTokenUri: 'https://example.com/oauth/request_token'
    }

    requestToken = RAML.Client.AuthStrategies.Oauth1.requestToken(settings, tokenFactory);

  });

  describe("requesting a temporary token", function() {
    var xhrStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      xhrStub = spyOn($, 'ajax').andReturn(promiseStub);
    });

    describe('by default', function() {
      beforeEach(function() {
        requestToken();
      });

      it("requests an access token", function() {
        expect(xhrStub).toHaveBeenCalledWith({
          url: settings.requestTokenUri,
          type: 'post',
          contentType: false
        });
      });

      it("signs the request with a token from the factory", function() {
        expect(tokenFactory).toHaveBeenCalled();
        expect(token.sign).toHaveBeenCalled();
      });

      it("returns the response's token and secret", function() {
        var responseData = 'oauth_token=tempToken&oauth_token_secret=tempTokenSecret';

        var parsedResponseData = {
          token: 'tempToken',
          tokenSecret: 'tempTokenSecret'
        };

        var result = promiseStub.then.mostRecentCall.args[0](responseData);

        expect(result).toEqual(parsedResponseData);
      });
    });

    describe('with a proxy URL', function() {
      beforeEach(function() {
        RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'
        requestToken();
      });

      afterEach(function() {
        delete RAML.Settings.proxy;
      });

      it("proxies the request for the access token", function() {
        expect(xhrStub.mostRecentCall.args[0].url).toEqual(
          RAML.Settings.proxy + settings.requestTokenUri
        );
      });
    });
  });
});
