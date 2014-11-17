describe("RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials", function() {
  var settings, token, signerFactory, requestTemporaryCredentials;

  beforeEach(function() {
    token = jasmine.createSpyObj('token', ['sign']);
    signerFactory = jasmine.createSpy('signerFactory').andReturn(token);

    settings = {
      requestTokenUri: 'https://example.com/oauth/request_token'
    }

    requestTemporaryCredentials = RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials(settings, signerFactory);

  });

  describe("requesting a temporary token", function() {
    var xhrStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      xhrStub = spyOn($, 'ajax').andReturn(promiseStub);
    });

    describe('by default', function() {
      beforeEach(function() {
        requestTemporaryCredentials();
      });

      it("requests an access token", function() {
        var calledWith = xhrStub.mostRecentCall.args[0];
        expect(calledWith.url).toEqual(settings.requestTokenUri);
        expect(calledWith.type).toEqual('post');
      });

      it("signs the request with a token from the factory", function() {
        expect(signerFactory).toHaveBeenCalled();
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
        requestTemporaryCredentials();
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
