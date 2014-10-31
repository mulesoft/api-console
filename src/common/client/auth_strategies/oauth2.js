(function() {
  'use strict';

  var Oauth2 = function(scheme, credentials) {
    this.scheme = scheme;
    this.credentials = credentials;
  };

  Oauth2.prototype.authenticate = function(options, done) {
    var githubAuth = new ClientOAuth2({
      clientId:         this.credentials.clientId,
      clientSecret:     this.credentials.clientSecret,
      accessTokenUri:   this.scheme.settings.accessTokenUri,
      authorizationUri: this.scheme.settings.authorizationUri,
      redirectUri:      RAML.Settings.oauth2RedirectUri,
      scopes:           this.scheme.settings.scopes
    });
    var grantType = this.credentials.grant.value;

    if (grantType === 'token' || grantType === 'code') {
      window.oauth2Callback = function (uri) {
        githubAuth[grantType].getToken(uri, function (err, user, raw) {
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
      window.open(githubAuth[grantType].getUri());
    }

    if (grantType === 'owner') {
      githubAuth.owner.getToken(this.credentials.username, this.credentials.password, function (err, user, raw) {
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
      githubAuth.credentials.getToken(function (err, user, raw) {
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
