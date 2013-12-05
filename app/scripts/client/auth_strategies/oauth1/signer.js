(function() {
  /* jshint camelcase: false */
  'use strict';

  var Signer = RAML.Client.AuthStrategies.Oauth1.Signer = {};

  Signer.createFactory = function(settings, consumerCredentials) {
    settings = settings || {};

    return function createSigner(tokenCredentials) {
      var type = settings.signatureMethod === 'PLAINTEXT' ? 'Plaintext' : 'Hmac';
      var mode = tokenCredentials === undefined ? 'Temporary' : 'Token';

      return new Signer[type][mode](consumerCredentials, tokenCredentials);
    };
  };

  function baseParameters(consumerCredentials) {
    return {
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };
  }

  Signer.generateTemporaryCredentialParameters = function(consumerCredentials) {
    var result = baseParameters(consumerCredentials);
    result.oauth_callback = RAML.Settings.oauth1RedirectUri;

    return result;
  };

  Signer.generateTokenCredentialParameters = function(consumerCredentials, tokenCredentials) {
    var result = baseParameters(consumerCredentials);

    result.oauth_token = tokenCredentials.token;
    if (tokenCredentials.verifier) {
      result.oauth_verifier = tokenCredentials.verifier;
    }

    return result;
  };

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  Signer.rfc3986Encode = function(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  };

  Signer.setRequestHeader = function(params, request) {
    var header = Object.keys(params).map(function(key) {
      return key + '="' + Signer.rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  };
})();
