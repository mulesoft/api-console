(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTokenCredentialParameters;

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  function rfc3986Encode(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, window.escape).replace(/\*/g, '%2A');
  }

  function setRequestHeader(params, request) {
    params.oauth_signature_method = 'PLAINTEXT';

    var header = Object.keys(params).map(function(key) {
      return key + '="' + rfc3986Encode(params[key]) + '"';
    }).join(', ');

    request.header('Authorization', 'OAuth ' + header);
  }

  var Plaintext = {};

  Plaintext.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Plaintext.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';

    setRequestHeader(params, request);
  };

  Plaintext.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Plaintext.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);

    setRequestHeader(params, request);
  };

  RAML.Client.AuthStrategies.Oauth1.Token.Plaintext = Plaintext;
})();
