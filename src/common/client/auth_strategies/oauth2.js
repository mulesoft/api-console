(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.scheme = scheme;
    this.credentials = credentials;
  };

  function getScopes(credentials) {
    var scopes = [];

    if (credentials.scopes) {
      scopes = Object.keys(credentials.scopes).filter(function (scope) {
        return credentials.scopes[scope] === true;
      });
    }

    return scopes;
  }

  function popup(location) {
    var w    = 640;
    var h    = 480;
    var left = (screen.width / 2) - (w / 2);
    var top  = (screen.height / 2) - (h / 2);
    return window.open(location, 'Authentication', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  Oauth2.prototype.popsicleParametrize = function(options) {
    return {
      url: options.url,
      method: options.method,
      body: options.body || options.data,
      headers: options.headers
    };
  };

  Oauth2.prototype.authenticate = function(options) {
    var reqOptions = this.popsicleParametrize(options);
    var auth = new ClientOAuth2({
      clientId:         this.credentials.clientId,
      clientSecret:     this.credentials.clientSecret,
      accessTokenUri:   this.scheme.settings.accessTokenUri,
      authorizationUri: this.scheme.settings.authorizationUri,
      redirectUri:      RAML.Settings.oauth2RedirectUri,
      scopes:           getScopes(this.credentials)
    });
    var grantType = this.credentials.grant;

    return new Promise(function(resolve, reject) {

      if (grantType === 'token' || grantType === 'code') {
        window.oauth2Callback = function (uri) {
          auth[grantType].getToken(uri).then(function(user) {
            if (user && user.accessToken) {
              user.request(reqOptions).then(resolve).catch(reject);
            }
          });
        };
        //// TODO: Find a way to handle 404
        popup(auth[grantType].getUri());
      }

      if (grantType === 'owner') {
        auth.owner.getToken(this.credentials.username, this.credentials.password).then(function (user) {
          if (user && user.accessToken) {
            user.request(reqOptions).then(resolve).catch(reject);
          }
        });
      }

      if (grantType === 'credentials') {
        auth.credentials.getToken().then(function (user) {
          if (user && user.accessToken) {
            user.request(reqOptions).then(resolve).catch(reject);
          }
        });
      }
    });
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
})();
