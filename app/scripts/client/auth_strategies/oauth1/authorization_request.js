(function() {
  /* jshint camelcase: false */
  'use strict';

  var WINDOW_NAME = 'raml-console-oauth1';

  function proxyRequest(url) {
    if (RAML.Settings.proxy) {
      url = RAML.Settings.proxy + url;
    }

    return url;
  }

  function parseUrlEncodedData(data) {
    var result = {};

    data.split('&').forEach(function(param) {
      var keyAndValue = param.split('=');
      result[keyAndValue[0]] = keyAndValue[1];
    });

    return result;
  }

  var AuthorizationRequest = function(settings, tokenFactory) {
    this.settings = settings;
    this.tokenFactory = tokenFactory;
  };

  AuthorizationRequest.prototype.requestToken = function() {
    var url = proxyRequest(this.settings.requestTokenUri);
    var request = RAML.Client.Request.create(url, 'post');

    this.tokenFactory().sign(request);

    return $.ajax(request.toOptions()).then(function(rawFormData) {
      var data = parseUrlEncodedData(rawFormData);

      return {
        token: data.oauth_token,
        tokenSecret: data.oauth_token_secret
      };
    });
  };

  AuthorizationRequest.prototype.requestAuthorization = function(temporaryCredentials) {
    var authorizationUrl = this.settings.authorizationUri + '?oauth_token=' + temporaryCredentials.token,
        deferred = $.Deferred();

    window.RAML.authorizationSuccess = function(authResult) {
      temporaryCredentials.verifier = authResult.verifier;
      deferred.resolve(temporaryCredentials);
    };
    window.open(authorizationUrl, WINDOW_NAME);
    return deferred.promise();
  };

  AuthorizationRequest.prototype.requestTokenCredentials = function(temporaryCredentials) {
    var url = proxyRequest(this.settings.tokenCredentialsUri);
    var request = RAML.Client.Request.create(url, 'post');

    this.tokenFactory(temporaryCredentials).sign(request);

    var self = this;

    return $.ajax(request.toOptions()).then(function(rawFormData) {
      var credentials = parseUrlEncodedData(rawFormData);

      return self.tokenFactory({
        token: credentials.oauth_token,
        tokenSecret: credentials.oauth_token_secret
      });
    });

  };

  AuthorizationRequest.prototype.request = function() {
    return this.requestToken().
      then(this.requestAuthorization.bind(this)).
      then(this.requestTokenCredentials.bind(this));
  };

  RAML.Client.AuthStrategies.Oauth1.AuthorizationRequest = AuthorizationRequest;

})();
