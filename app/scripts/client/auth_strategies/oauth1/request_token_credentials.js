(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth1.requestTokenCredentials = function(settings, signerFactory) {
    return function requestTokenCredentials(temporaryCredentials) {
      var url = RAML.Client.AuthStrategies.Oauth1.proxyRequest(settings.tokenCredentialsUri);
      var request = RAML.Client.Request.create(url, 'post');

      signerFactory(temporaryCredentials).sign(request);

      return $.ajax(request.toOptions()).then(function(rawFormData) {
        var credentials = RAML.Client.AuthStrategies.Oauth1.parseUrlEncodedData(rawFormData);

        return signerFactory({
          token: credentials.oauth_token,
          tokenSecret: credentials.oauth_token_secret
        });
      });
    };
  };
})();
