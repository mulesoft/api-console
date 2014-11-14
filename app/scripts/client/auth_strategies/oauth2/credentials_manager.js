(function() {
  /* jshint camelcase: false */
  'use strict';

  RAML.Client.AuthStrategies.Oauth2.credentialsManager = function(credentials, responseType) {
    return {
      authorizationUrl : function(baseUrl) {
        return baseUrl +
          '?client_id=' + credentials.clientId +
          '&response_type=' + responseType +
          '&redirect_uri=' + RAML.Settings.oauth2RedirectUri;
      },

      accessTokenParameters: function(code) {
        return {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: RAML.Settings.oauth2RedirectUri
        };
      },

      clientCredentialsParameters: function () {
        return {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          grant_type: 'client_credentials'
        };
      },

      resourceOwnerParameters: function () {
        var params = {
          username: credentials.username,
          password: credentials.password,
          grant_type: 'password'
        };

        if (!credentials.clientSecret) {
          params.client_id = credentials.clientId;
        }

        return params;
      },

      resourceOwnerHeaders: function () {
        if (!credentials.clientSecret) {
          return {};
        }

        var authorization = btoa(credentials.clientId + ':' + credentials.clientSecret);

        return {
          'Authorization': 'Bearer ' + authorization
        };
      }
    };
  };
})();
