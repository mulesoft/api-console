(function() {
  'use strict';

  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;

  var grants = {
    code: true,
    token: true,
    owner: true,
    credentials: true
  };

  var Grant = {
    create: function(settings, credentials) {
      var type = credentials.grantType.type;
      var credentialsManager = Oauth2.credentialsManager(credentials, type);

      if (!grants[type]) {
        throw new Error('Unknown grant type: ' + type);
      }

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

  Grant.Owner = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Owner.prototype.request = function() {
    var requestToken = Oauth2.requestOwnerToken(this.settings, this.credentialsManager);

    return requestToken();
  };

  Grant.Credentials = function(settings, credentialsManager) {
    this.settings = settings;
    this.credentialsManager = credentialsManager;
  };

  Grant.Credentials.prototype.request = function() {
    var requestToken = Oauth2.requestCredentialsToken(this.settings, this.credentialsManager);

    return requestToken();
  };

  Oauth2.Grant = Grant;
})();
