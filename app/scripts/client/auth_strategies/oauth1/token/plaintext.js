(function() {
  /* jshint camelcase: false */
  'use strict';

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  function rfc3986Encode(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  }

  function generateParametersForOauth(consumerCredentials, tokenCredentials) {
    var result = {
      oauth_consumer_key: consumerCredentials.consumerKey,
      oauth_version: '1.0'
    };

    if (tokenCredentials) {
      result.oauth_token = tokenCredentials.token;
      if (tokenCredentials.verifier) {
        result.oauth_verifier = tokenCredentials.verifier;
      }
    } else {
      if (RAML.Settings.oauth1RedirectUri) {
        result.oauth_callback = RAML.Settings.oauth1RedirectUri;
      }
    }

    // TODO: filter out empty keys
    return result;
  }

  var Plaintext = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Plaintext.prototype.sign = function(request) {
    var params = generateParametersForOauth(this.consumerCredentials, this.tokenCredentials);

    params.oauth_signature_method = 'PLAINTEXT';
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';
    if (this.tokenCredentials) {
      params.oauth_signature += rfc3986Encode(this.tokenCredentials.tokenSecret);
    }

    var header = Object.keys(params).map(function(key) {
      return key + '="' + rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  };

  RAML.Client.AuthStrategies.Oauth1.Token.Plaintext = Plaintext;
})();
