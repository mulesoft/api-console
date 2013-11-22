(function() {
  /* jshint camelcase: false */
  'use strict';

  function proxyRequest(url) {
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }

    return url;
  }

  RAML.Client.AuthStrategies.Oauth2.requestAccessToken = function(settings, credentialsManager) {
    return function(code) {
      var url = proxyRequest(settings.accessTokenUri);

      var requestOptions = {
        url: url,
        type: 'post',
        data: credentialsManager.accessTokenParameters(code)
      };

      return $.ajax(requestOptions).then(function(data) {
        return data.access_token;
      });
    };
  };
})();
