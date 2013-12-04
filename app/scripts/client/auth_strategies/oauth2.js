(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.grant = RAML.Client.AuthStrategies.Oauth2.Grant.create(scheme.settings, credentials);
    this.tokenFactory = RAML.Client.AuthStrategies.Oauth2.Token.createFactory(scheme);
  };

  Oauth2.prototype.authenticate = function() {
    return this.grant.request().then(Oauth2.createToken(this.tokenFactory));
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
})();
