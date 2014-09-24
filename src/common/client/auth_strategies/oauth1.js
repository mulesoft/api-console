(function() {
  'use strict';

  var Oauth1 = function(scheme, credentials) {
    var signerFactory = RAML.Client.AuthStrategies.Oauth1.Signer.createFactory(scheme.settings, credentials);
    this.requestTemporaryCredentials = RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials(scheme.settings, signerFactory);
    this.requestAuthorization = RAML.Client.AuthStrategies.Oauth1.requestAuthorization(scheme.settings);
    this.requestTokenCredentials = RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials(scheme.settings, signerFactory);
  };

  Oauth1.parseUrlEncodedData = function(data) {
    var result = {};

    data.split('&').forEach(function(param) {
      var keyAndValue = param.split('=');
      result[keyAndValue[0]] = keyAndValue[1];
    });

    return result;
  };

  Oauth1.prototype.authenticate = function() {
    return this.requestTemporaryCredentials().then(this.requestAuthorization).then(this.requestTokenCredentials);
  };

  RAML.Client.AuthStrategies.Oauth1 = Oauth1;
})();
