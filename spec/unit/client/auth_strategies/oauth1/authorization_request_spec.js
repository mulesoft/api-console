describe("RAML.Client.AuthStrategies.Oauth1.AuthorizationRequest", function() {
  var authRequest, settings, token, tokenFactory;

  beforeEach(function() {
    token = jasmine.createSpyObj('token', ['sign']);
    tokenFactory = jasmine.createSpy('tokenFactory').andReturn(token);

    settings = {
      requestTokenUri: 'https://example.com/oauth/request_token',
      authorizationUri: 'https://example.com/oauth/authorize'
    }

    authRequest = new RAML.Client.AuthStrategies.Oauth1.AuthorizationRequest(settings, tokenFactory);
  });

  describe("requesting a temporary token", function() {
    var xhrStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      xhrStub = spyOn($, 'ajax').andReturn(promiseStub);
    });

    describe('by default', function() {
      beforeEach(function() {
        authRequest.requestToken(settings, tokenFactory);
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
        authRequest.requestToken(settings, tokenFactory);
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

  describe("requesting authorization", function() {
    var request;

    beforeEach(function() {
      spyOn(window, 'open');
      request = authRequest.requestAuthorization({ token: 'tempToken', tokenSecret: 'tempTokenSecret' });
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

  describe("requesting token credentials", function() {
    var xhrStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      xhrStub = spyOn($, 'ajax').andReturn(promiseStub);
    });

    describe('by default', function() {
      beforeEach(function() {
        authRequest.requestTokenCredentials({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
      });

      it("requests an access token", function() {
        expect(xhrStub).toHaveBeenCalledWith({
          url: settings.tokenCredentialsUri,
          type: 'post',
          contentType: false
        });
      });

      it("passes the temporary credentials to the token factory", function() {
        expect(tokenFactory).toHaveBeenCalledWith({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
      });


      it("signs the request with a token from the factory", function() {
        expect(tokenFactory).toHaveBeenCalled();
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
        authRequest.requestTokenCredentials({ token: 'tempToken', tokenSecret: 'tempTokenSecret', verifier: 'verifier' });
      });

      afterEach(function() {
        delete RAML.Settings.proxy;
      });

      it("proxies the request for the access token", function() {
        expect(xhrStub.mostRecentCall.args[0].url).toEqual(
          RAML.Settings.proxy + settings.tokenCredentialsUri
        );
      });
    });
  });
});
