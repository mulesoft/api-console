(function() {
  /* jshint camelcase: false */
  'use strict';

  var generateTemporaryCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTemporaryCredentialParameters,
      generateTokenCredentialParameters = RAML.Client.AuthStrategies.Oauth1.Token.generateTokenCredentialParameters,
      rfc3986Encode = RAML.Client.AuthStrategies.Oauth1.Token.rfc3986Encode,
      setRequestHeader = RAML.Client.AuthStrategies.Oauth1.Token.setRequestHeader;

  var Plaintext = {};

  Plaintext.Temporary = function(consumerCredentials) {
    this.consumerCredentials = consumerCredentials;
  };

  Plaintext.Temporary.prototype.sign = function(request) {
    var params = generateTemporaryCredentialParameters(this.consumerCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&';
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  Plaintext.Token = function(consumerCredentials, tokenCredentials) {
    this.consumerCredentials = consumerCredentials;
    this.tokenCredentials = tokenCredentials;
  };

  Plaintext.Token.prototype.sign = function(request) {
    var params = generateTokenCredentialParameters(this.consumerCredentials, this.tokenCredentials);
    params.oauth_signature = rfc3986Encode(this.consumerCredentials.consumerSecret) + '&' + rfc3986Encode(this.tokenCredentials.tokenSecret);
    params.oauth_signature_method = 'PLAINTEXT';

    setRequestHeader(params, request);
  };

  RAML.Client.AuthStrategies.Oauth1.Token.Plaintext = Plaintext;
})();
