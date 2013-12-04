(function() {
  /* jshint camelcase: false */
  'use strict';

  var Token = RAML.Client.AuthStrategies.Oauth1.Token = {};

  Token.createFactory = function(settings, consumerCredentials) {
    settings = settings || {};

    return function createToken(tokenCredentials) {
      switch (settings.signatureMethod) {
      case 'PLAINTEXT':
        return new Token.Plaintext(consumerCredentials, tokenCredentials);
      default:
        return new Token.Hmac(consumerCredentials, tokenCredentials);
      }
    };
  };

})();
