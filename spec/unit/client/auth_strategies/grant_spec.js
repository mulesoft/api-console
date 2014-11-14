describe("RAML.Client.AuthStrategies.Oauth2.Grant", function() {
  var credentials, settings;

  beforeEach(function() {
    credentials = { clientId: 'id', clientSecret: 'secret' };
  });

  describe("creating a grant", function() {
    var credentialsManagerSpy;
    beforeEach(function() {
      credentialsManagerSpy = spyOn(RAML.Client.AuthStrategies.Oauth2, 'credentialsManager');
      credentialsManagerSpy.andReturn("credentials manager");
    });

    describe("when the authorizationGrant includes token", function() {
      var tokenSpy;

      beforeEach(function() {
        tokenSpy = spyOn(RAML.Client.AuthStrategies.Oauth2.Grant, 'Token');
        settings = { authorizationGrants: ['token'] };
        credentials.grantType = { type: 'token' };
        RAML.Client.AuthStrategies.Oauth2.Grant.create(settings, credentials);
      });

      it("creates a credentials manager", function() {
        expect(credentialsManagerSpy).toHaveBeenCalledWith(credentials, 'token');
      });

      it("creates a token grant", function() {
        expect(tokenSpy).toHaveBeenCalledWith(settings, "credentials manager");
      });
    });

    describe("when the authorizationGrant includes code", function() {
      var codeSpy;

      beforeEach(function() {
        codeSpy = spyOn(RAML.Client.AuthStrategies.Oauth2.Grant, 'Code');
        settings = { authorizationGrants: ['code'] };
        credentials.grantType = { type: 'code' };
        RAML.Client.AuthStrategies.Oauth2.Grant.create(settings, credentials);
      });

      it("creates a credentials manager", function() {
        expect(credentialsManagerSpy).toHaveBeenCalledWith(credentials, 'code');
      });

      it("creates a code grant", function() {
        expect(codeSpy).toHaveBeenCalledWith(settings, "credentials manager");
      });
    });

    describe("with an unknown authorizationGrant", function() {
      beforeEach(function() {
        settings = { authorizationGrants: ['unknown'] };
        credentials.grantType = { type: 'unknown' };
      });

      it("throws", function() {
        expect(function() {
          RAML.Client.AuthStrategies.Oauth2.Grant.create(settings, credentials);
        }).toThrow("Unknown grant type: unknown");
      });
    });

    describe("when no authorizationGrant is present", function() {
      beforeEach(function() {
        settings = {};
        credentials.grantType = {};
      });

      it("throws", function() {
        expect(function() {
          RAML.Client.AuthStrategies.Oauth2.Grant.create(settings, credentials);
        }).toThrow("Unknown grant type: undefined");
      });
    });
  });
});

describe("RAML.Client.AuthStrategies.Oauth2.Grant.Code", function() {
  var credentialsManager, grant, settings;

  beforeEach(function() {
    credentialsManager = {}, settings = {};
  });

  describe("requesting the grant", function() {
    var requestAuthorizationStub, requestAccessTokenStub, promiseStub;

    beforeEach(function() {
      promiseStub = jasmine.createSpyObj('promise', ['then']);
      requestAuthorizationStub = spyOn(RAML.Client.AuthStrategies.Oauth2, 'requestAuthorization');
      requestAuthorizationStub.andReturn(promiseStub);

      requestAccessTokenStub = spyOn(RAML.Client.AuthStrategies.Oauth2, 'requestAccessToken');
      requestAccessTokenStub.andReturn("request access token");

      grant = new RAML.Client.AuthStrategies.Oauth2.Grant.Code(settings, credentialsManager);
      grant.request();
    });

    it("requests authorization", function() {
      expect(requestAuthorizationStub).toHaveBeenCalledWith(settings, credentialsManager);
    });

    it("requests an access token on authorization success", function() {
      expect(requestAccessTokenStub).toHaveBeenCalledWith(settings, credentialsManager);
      expect(promiseStub.then).toHaveBeenCalledWith("request access token");
    });
  });
});

describe("RAML.Client.AuthStrategies.Oauth2.Grant.Token", function() {
  var credentialsManager, grant, settings;

  beforeEach(function() {
    credentialsManager = {}, settings = {};
  });

  describe("requesting the grant", function() {
    beforeEach(function() {
      requestAuthorizationStub = spyOn(RAML.Client.AuthStrategies.Oauth2, 'requestAuthorization');

      grant = new RAML.Client.AuthStrategies.Oauth2.Grant.Token(settings, credentialsManager);
      grant.request();
    });

    it("requests authorization", function() {
      expect(requestAuthorizationStub).toHaveBeenCalledWith(settings, credentialsManager);
    });
  });
});
