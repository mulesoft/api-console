describe("RAML.Client.AuthStrategies.Oauth2.requestAccessToken", function() {
  var credentialsManager, requestAccessToken, scheme;

  beforeEach(function() {
    settings = {
      authorizationUri: 'https://example.com/oauth/authorize',
      accessTokenUri: 'https://example.com/oauth/access_token'
    }

    credentialsManager = jasmine.createSpyObj('credentialsManager', ['accessTokenParameters']);
    credentialsManager.accessTokenParameters.andReturn("data");
    requestAccessToken = RAML.Client.AuthStrategies.Oauth2.requestAccessToken(settings, credentialsManager);
  });

  describe("initiating an access token request", function() {
    var xhrStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      xhrStub = spyOn($, 'ajax').andReturn(promiseStub);
      requestAccessToken('code');
    });

    describe('by default', function() {
      beforeEach(function() {
        requestAccessToken('code');
      });

      it("requests an access token", function() {
        expect(xhrStub).toHaveBeenCalledWith({
          url: settings.accessTokenUri,
          type: 'post',
          data: 'data',
          traditional: true,
          processData: true
        });
      });

      describe("when the response is an object", function() {
        it("extracts and returns the access token from the response", function() {
          var extracted = promiseStub.then.mostRecentCall.args[0]({ "access_token": "token" })
          expect(extracted).toEqual('token');
        });
      });

      describe("when the response is a string", function() {
        it("extracts and returns the access token from the response", function() {
          var extracted = promiseStub.then.mostRecentCall.args[0]("access_token=a%20token&apiKey=BITLY_API_KEY");
          expect(extracted).toEqual('a token');
        });
      });
    });

    describe('with a proxy URL', function() {
      beforeEach(function() {
        RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'
        requestAccessToken('code');
      });

      afterEach(function() {
        delete RAML.Settings.proxy;
      });

      it("proxies the request for the access token", function() {
        expect(xhrStub.mostRecentCall.args[0].url).toEqual(
          RAML.Settings.proxy + settings.accessTokenUri
        );
      });
    });
  });
});
