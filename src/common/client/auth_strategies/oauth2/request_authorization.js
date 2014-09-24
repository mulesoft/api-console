(function() {
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth2';

  RAML.Client.AuthStrategies.Oauth2.requestAuthorization = function(settings, credentialsManager) {
    var authorizationUrl = credentialsManager.authorizationUrl(settings.authorizationUri),
        deferred = $.Deferred();

    window.RAML.authorizationSuccess = function(code) { deferred.resolve(code); };
    window.open(authorizationUrl, WINDOW_NAME);
    return deferred.promise();
  };
})();
