(function() {
  /* jshint camelcase: false */
  'use strict';

  function proxyRequest(url) {
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }

    return url;
  }

  function accessTokenFromObject(data) {
    return data.access_token;
  }

  function accessTokenFromString(data) {
    var vars = data.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === 'access_token') {
        return decodeURIComponent(pair[1]);
      }
    }

    return undefined;
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
        var extract = accessTokenFromString;
        if (typeof data === 'object') {
          extract = accessTokenFromObject;
        }

        return extract(data);
      });
    };
  };
})();
