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

  function extract(data) {
    var method = accessTokenFromString;

    if (typeof data === 'object') {
      method = accessTokenFromObject;
    }

    return method(data);
  }

  RAML.Client.AuthStrategies.Oauth2.requestAccessToken = function(settings, credentialsManager) {
    return function(code) {
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.data(credentialsManager.accessTokenParameters(code));

      return $.ajax(request.toOptions()).then(extract);
    };
  };

  RAML.Client.AuthStrategies.Oauth2.requestCredentialsToken = function(settings, credentialsManager) {
    return function() {
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.data(credentialsManager.clientCredentialsParameters());

      return $.ajax(request.toOptions()).then(extract);
    };
  };

  RAML.Client.AuthStrategies.Oauth2.requestOwnerToken = function(settings, credentialsManager) {
    return function() {
      var request = RAML.Client.Request.create(settings.accessTokenUri, 'post');

      request.headers(credentialsManager.resourceOwnerHeaders());
      request.data(credentialsManager.resourceOwnerParameters());

      return $.ajax(request.toOptions()).then(extract);
    };
  };
})();
