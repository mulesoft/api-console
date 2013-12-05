(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTemporaryCredentials = function(settings, signerFactory) {
    return function requestTemporaryCredentials() {
      var url = RAML.Client.AuthStrategies.Oauth1.proxyRequest(settings.requestTokenUri);
      var request = RAML.Client.Request.create(url, 'post');

      signerFactory().sign(request);

      return $.ajax(request.toOptions()).then(function(rawFormData) {
        var data = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return {
          token: data.oauth_token,
          tokenSecret: data.oauth_token_secret
        };
      });
    };
  };

})();
