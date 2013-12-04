(function() {
  'use strict';

  var Oauth1 = function(scheme, credentials) {
    this.scheme = scheme;
    this.credentials = credentials;

    this.tokenFactory = RAML.Client.AuthStrategies.Oauth1.Token.createFactory(scheme.settings, credentials);
    this.authRequest = new RAML.Client.AuthStrategies.Oauth1.AuthorizationRequest(scheme.settings, this.tokenFactory);
  };

  Oauth1.prototype.authenticate = function() {
    return this.authRequest.request();
  };

  RAML.Client.AuthStrategies.Oauth1 = Oauth1;
})();
