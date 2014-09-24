(function() {
  'use strict';

  var GRANTS = [ 'code', 'token' ], IMPLICIT_GRANT = 'token';
  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;

  function grantTypeFrom(settings) {
    var authorizationGrants = settings.authorizationGrants || [];
    var filtered = authorizationGrants.filter(function(grant) { return grant === IMPLICIT_GRANT; });
    var specifiedGrant = filtered[0] || authorizationGrants[0];

    if (!GRANTS.some(function(grant) { return grant === specifiedGrant; })) {
      throw new Error('Unknown grant type: ' + specifiedGrant);
    }

    return specifiedGrant;
  }

  var Grant = {
    create: function(settings, credentials) {
      var type = grantTypeFrom(settings);
      var credentialsManager = Oauth2.credentialsManager(credentials, type);

      var className = type.charAt(0).toUpperCase() + type.slice(1);
      return new this[className](settings, credentialsManager);
    }
  };

  Grant.Code = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Code.prototype.request = function() {
    var requestAuthorization = Oauth2.requestAuthorization(this.settings, this.credentialsManager);
    var requestAccessToken = Oauth2.requestAccessToken(this.settings, this.credentialsManager);

    return requestAuthorization.then(requestAccessToken);
  };

  Grant.Token = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Token.prototype.request = function() {
    return Oauth2.requestAuthorization(this.settings, this.credentialsManager);
  };

  Oauth2.Grant = Grant;
})();
