(function() {
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.createToken = function(tokenFactory) {
    return function(token) {
      return tokenFactory(token);
    };
  };
})();
