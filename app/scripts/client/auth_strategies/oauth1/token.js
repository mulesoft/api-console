(function() {
  /* jshint camelcase: false */
  'use strict';

  var Token = RAML.Client.AuthStrategies.Oauth1.Token = {};

  Token.createFactory = function(settings, consumerCredentials) {
    settings = settings || {};

    return function createToken(tokenCredentials) {
      var type = settings.signatureMethod === 'PLAINTEXT' ? 'Plaintext' : 'Hmac';
      var mode = tokenCredentials === undefined ? 'Temporary' : 'Token';

      return new Token[type][mode](consumerCredentials, tokenCredentials);
    };
  };

  function baseParameters(consumerCredentials) {
    return {
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };
  }

  Token.generateTemporaryCredentialParameters = function(consumerCredentials) {
    var result = baseParameters(consumerCredentials);
    result.oauth_callback = RAML.Settings.oauth1RedirectUri;

    return result;
  };

  Token.generateTokenCredentialParameters = function(consumerCredentials, tokenCredentials) {
    var result = baseParameters(consumerCredentials);

    result.oauth_token = tokenCredentials.token;
    if (tokenCredentials.verifier) {
      result.oauth_verifier = tokenCredentials.verifier;
    }

    return result;
  };

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  Token.rfc3986Encode = function(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  };

  Token.setRequestHeader = function(params, request) {
    var header = Object.keys(params).map(function(key) {
      return key + '="' + Token.rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  };
})();
