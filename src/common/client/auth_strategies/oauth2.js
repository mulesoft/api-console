(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.scheme = scheme;
    this.credentials = credentials;
  };

  Oauth2.prototype.authenticate = function(options, done) {
    var auth = new ClientOAuth2({
      clientId:         this.credentials.clientId,
      clientSecret:     this.credentials.clientSecret,
      accessTokenUri:   this.scheme.settings.accessTokenUri,
      authorizationUri: this.scheme.settings.authorizationUri,
      redirectUri:      RAML.Settings.oauth2RedirectUri,
      scopes:           this.credentials.scopes ? Object.keys(this.credentials.scopes) : []
    });
    var grantType = this.credentials.grant;

    if (grantType === 'token' || grantType === 'code') {
      window.oauth2Callback = function (uri) {
        auth[grantType].getToken(uri, function (err, user, raw) {
          if (err) {
            done(raw);
          }

          if (user && user.accessToken) {
            user.request(options, function (err, res) {
              done(res.raw);
            });
          }
        });
      };
      //// TODO: Find a way to handle 404
      window.open(auth[grantType].getUri());
    }

    if (grantType === 'owner') {
      auth.owner.getToken(this.credentials.username, this.credentials.password, function (err, user, raw) {
        if (err) {
          done(raw);
        }

        if (user && user.accessToken) {
          user.request(options, function (err, res) {
            done(res.raw);
          });
        }
      });
    }

    if (grantType === 'credentials') {
      auth.credentials.getToken(function (err, user, raw) {
        if (err) {
          done(raw);
        }

        if (user && user.accessToken) {
          user.request(options, function (err, res) {
            done(res.raw);
          });
        }
      });
    }
  };

  RAML.Client.AuthStrategies.Oauth2 = Oauth2;
})();
