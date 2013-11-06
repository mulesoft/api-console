describe("RAML.Client.AuthStrategies.Oauth2", function() {
  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;
  var credentialsManager, scheme;

  beforeEach(function() {
    scheme = {
      settings: {
        authorizationUri: 'https://example.com/oauth/authorize',
        accessTokenUri: 'https://example.com/oauth/access_token'
      }
    };

    credentialsManager = Oauth2.credentialsManager({ clientId: 'ID', clientSecret: 'secret' });
  });

  describe("making an authorization request", function() {
    var request;

    beforeEach(function() {
      spyOn(window, 'open');
      request = Oauth2.authorizationRequest(scheme, credentialsManager);
    });

    it("opens authorization resource in a new window", function() {
      var expectedUrl = scheme.settings.authorizationUri + '?client_id=ID&response_type=code&redirect_uri=' + RAML.Settings.oauth2RedirectUri;
      expect(window.open).toHaveBeenCalledWith(expectedUrl, 'raml-console-oauth2');
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

  describe("making an access token request", function() {
    var xhrSpy, accessTokenResponse;

    beforeEach(function() {
      accessTokenResponse = jasmine.createSpyObj('promise', ['then']);
      xhrSpy = spyOn($, 'ajax').andReturn(accessTokenResponse);
    });

    describe('by default', function() {
      beforeEach(function() {
        Oauth2.accessTokenRequest(scheme, credentialsManager)('code');
      });

      it("requests an access token", function() {
        expect(xhrSpy).toHaveBeenCalledWith({
          url: scheme.settings.accessTokenUri,
          type: 'post',
          data: {
            client_id: 'ID',
            client_secret: 'secret',
            code: 'code',
            grant_type: 'authorization_code',
            redirect_uri: RAML.Settings.oauth2RedirectUri
          }
        });
      });
    });

    describe('when configured to use the authorization header', function() {
      var token, requestSpy;

      beforeEach(function() {
        scheme.describedBy = {
          headers: {
            Authorization: {}
          }
        }
        Oauth2.accessTokenRequest(scheme, credentialsManager)('code');
      });

      beforeEach(function() {
        token = accessTokenResponse.then.mostRecentCall.args[0]({ access_token: 'fake' });
        requestSpy = jasmine.createSpyObj('request', ['queryParam', 'header']);

        token.sign(requestSpy);
      });

      it("supplies the header", function() {
        expect(requestSpy.header).toHaveBeenCalledWith('Authorization', 'Bearer fake');
      });
    });

    describe('when configured to use the access_token query parameter', function() {
      var token, requestSpy;

      beforeEach(function() {
        scheme.describedBy = {
          queryParameters: {
            access_token: {}
          }
        }
        Oauth2.accessTokenRequest(scheme, credentialsManager)('code');
      });

      beforeEach(function() {
        token = accessTokenResponse.then.mostRecentCall.args[0]({ access_token: 'fake' });
        requestSpy = jasmine.createSpyObj('request', ['queryParam', 'header']);

        token.sign(requestSpy);
      });

      it("supplies the query param", function() {
        expect(requestSpy.queryParam).toHaveBeenCalledWith('access_token', 'fake');
      });
    });

    describe('with a proxy URL', function() {
      beforeEach(function() {
        RAML.Settings.proxy = 'http://www.someproxy.com/somepath/'
        Oauth2.accessTokenRequest(scheme, credentialsManager)('code');
      });

      afterEach(function() {
        delete RAML.Settings.proxy;
      });

      it("proxies the request for the access token", function() {
        expect(xhrSpy.mostRecentCall.args[0].url).toEqual(
          RAML.Settings.proxy + scheme.settings.accessTokenUri
        );
      });
    });
  });
});
