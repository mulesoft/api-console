(function() {
  /* jshint camelcase: false */
  'use strict';

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
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.data(credentialsManager.accessTokenParameters(code));

      return jQuery.ajax(request.toOptions()).then(function(data) {
        var extract = accessTokenFromString;

        if (typeof data === 'object') {
          extract = accessTokenFromObject;
        }

        return extract(data);
      });
    };
  };
})();
